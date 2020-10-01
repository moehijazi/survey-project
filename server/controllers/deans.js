const { end } = require("../db/index");
const pool = require("../db/index");
const { createCron } = require("../services/CronJobs");

const createQuestion = async (req, res) => {
  const client = await pool.connect();
  const { question_description, options } = req.body;
  try {
    await client.query("BEGIN");
    const insertQuestion = await client.query(
      "insert into Questions (Question_description, No_of_options) values (($1), ($2)) returning *",
      [question_description, options.length]
    );
    const q_id = insertQuestion.rows[0].question_id;
    for (const option of options) {
      const insertOption = await client.query(
        "INSERT INTO Options (Option_description) VALUES (($1)) RETURNING *",
        [option]
      );
      let opt_id = insertOption.rows[0].option_id;
      const link = await client.query(
        "INSERT INTO Question_Options (Question_id, Option_id) VALUES ( ($1), ($2))",
        [q_id, opt_id]
      );
    }
    await client.query("COMMIT");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const getQuestions = async (req, res) => {
  try {
    const getQuestions = await pool.query(
      "SELECT Question_id, Question_description FROM Questions"
    );
    const questions = getQuestions.rows;
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const removeQuestion = async (req, res) => {
  const client = await pool.connect();
  const question_id = req.params.question_id;
  try {
    const check = await client.query(
      "select * from list_questions where question_id = ($1)",
      [question_id]
    );
    if (check.rowCount > 0) {
      return res
        .status(503)
        .json(
          "Cannot remove question since it's a part of a list. Remove the list first"
        );
    }
    await client.query("BEGIN");

    const unlinkQuestions = await client.query(
      "delete from question_options where question_id = ($1) returning option_id",
      [question_id]
    );
    const removeQuestion = await client.query(
      "delete from Questions where question_id= ($1)",
      [question_id]
    );
    for (const option of unlinkQuestions.rows) {
      await client.query("delete from options where option_id = ($1)", [
        option.option_id,
      ]);
    }
    client.query("COMMIT");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const createList = async (req, res) => {
  const client = await pool.connect();
  const { list_name, list_description, questions } = req.body;
  try {
    await client.query("BEGIN");
    const insertList = await client.query(
      "INSERT INTO Lists (List_name, List_description) VALUES ( ($1), ($2)) RETURNING *",
      [list_name, list_description]
    );
    const list_id = insertList.rows[0].list_id;
    for (const question of questions) {
      const link = await client.query(
        "INSERT INTO List_Questions (List_id, Question_id, Question_weight) VALUES ( ($1), ($2), ($3))",
        [list_id, question.id, question.weight]
      );
    }
    await client.query("COMMIT");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("rollback");
    return res.status(500).json(error.message);
  } finally {
    client.release();
  }
};

const removeList = async (req, res) => {
  const client = await pool.connect();
  const list_id = req.params.list_id;
  try {
    const check = await client.query(
      "select * from package_lists where list_id = ($1)",
      [list_id]
    );
    if (check.rowCount > 0) {
      return res
        .status(503)
        .json(
          "Cannot remove list since it's a part of a package. Remove the package first"
        );
    }
    await client.query("BEGIN");

    const unlinkQuestions = await client.query(
      "delete from list_questions where list_id = ($1)",
      [list_id]
    );
    const removList = await client.query(
      "delete from lists where list_id= ($1)",
      [list_id]
    );
    client.query("COMMIT");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const getLists = async (req, res) => {
  try {
    const getLists = await pool.query("SELECT * FROM Lists");
    const lists = getLists.rows;
    return res.status(200).json(lists);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const createPackage = async (req, res) => {
  const client = await pool.connect();
  const { package_name, package_description, lists } = req.body;
  const user_id = req.user.user_id;
  try {
    await client.query("BEGIN");
    const insertPackage = await client.query(
      "INSERT INTO Packages (Package_name, Package_description, Dean_id) VALUES ( ($1), ($2), ($3)) RETURNING *",
      [package_name, package_description, user_id]
    );
    const package_id = insertPackage.rows[0].package_id;
    for (const list of lists) {
      const link = await client.query(
        "INSERT INTO Package_Lists (Package_id, List_id) VALUES ( ($1), ($2) )",
        [package_id, list]
      );
    }
    await client.query("Commit");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const removePackage = async (req, res) => {
  const client = await pool.connect();
  const package_id = req.params.package_id;
  try {
    await client.query("BEGIN");

    const unlinkLists = await client.query(
      "delete from package_lists where package_id = ($1)",
      [package_id]
    );
    const deactivatePackages = await client.query(
      "delete from active_packages where package_id = ($1) returning *",
      [package_id]
    );

    for (const department of deactivatePackages.rows) {
      await client.query(
        "update department_branch set start_date = NULL where department_id = ($1)",
        [department.department_id]
      );
    }
    const removpackage = await client.query(
      "delete from packages where package_id= ($1)",
      [package_id]
    );
    client.query("COMMIT");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const getPackages = async (req, res) => {
  try {
    const getPackages = await pool.query("SELECT * FROM packages");
    const packages = getPackages.rows;
    return res.status(200).json(packages);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const setDepartmentDates = async (req, res) => {
  const client = await pool.connect();
  const { inputs } = req.body;
  const { user_id } = req.user.user_id;
  try {
    await client.query("BEGIN");
    for (const [key, input] of Object.entries(inputs)) {
      let { department_id, branch_id, start_date, end_date } = input;
      const insertData = await client.query(
        "UPDATE department_branch set start_date = ($1), end_date = ($2) where branch_id= ($3) and department_id = ($4)",
        [start_date, end_date, branch_id, department_id]
      );
      await createCron(branch_id, department_id, start_date);
    }
    await client.query("Commit");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const getFacultiesActive = async (req, res) => {
  const client = await pool.connect();
  try {
    const getFacs = await client.query(
      "SELECT faculty_id, faculty_name FROM faculties"
    );
    let facs = [];
    for (const fac of getFacs.rows) {
      let lab = 0;
      let course = 0;
      let total = 0;
      const getDeps = await client.query(
        "SELECT department_id from departments where faculty_id = ($1)",
        [fac.faculty_id]
      );
      for (const dep of getDeps.rows) {
        total++;
        let check = await client.query(
          "SELECT * FROM active_packages where department_id = ($1) and position = 'class' ",
          [dep.department_id]
        );
        if (check.rowCount > 0) {
          course++;
        }
        check = await client.query(
          "SELECT * FROM active_packages where department_id = ($1) and position = 'lab' ",
          [dep.department_id]
        );
        if (check.rowCount > 0) {
          lab++;
        }
      }
      let output = {
        faculty_id: fac.faculty_id,
        faculty_name: fac.faculty_name,
        active_class: course,
        active_lab: lab,
        total: total,
      };
      facs.push(output);
    }
    return res.status(200).json(facs);
  } catch (error) {
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const getDepartmentsActive = async (req, res) => {
  const client = await pool.connect();
  try {
    let faculty_id = req.params.faculty_id;
    const getDepartments = await client.query(
      "SELECT department_id, department_name FROM departments where faculty_id = ($1)",
      [faculty_id]
    );
    let active_deps = [];
    let inactive_deps = [];
    let output;
    for (const dep of getDepartments.rows) {
      let getState = await client.query(
        "select package_id from active_packages where department_id = ($1) and position = 'class'",
        [dep.department_id]
      );
      if (getState.rowCount > 0) {
        let getPackage = await client.query(
          "select package_name from packages where package_id = ($1)",
          [getState.rows[0].package_id]
        );
        output = {
          department_id: dep.department_id,
          department_name: dep.department_name,
          current_package: getPackage.rows[0].package_name,
          section: "Class",
        };
        active_deps.push(output);
      } else {
        output = {
          department_id: dep.department_id,
          department_name: dep.department_name,
          section: "Class",
        };
        inactive_deps.push(output);
      }
      getState = await client.query(
        "select package_id from active_packages where department_id = ($1) and position = 'lab'",
        [dep.department_id]
      );
      if (getState.rowCount > 0) {
        let getPackage = await client.query(
          "select package_name from packages where package_id = ($1)",
          [getState.rows[0].package_id]
        );
        output = {
          department_id: dep.department_id,
          department_name: dep.department_name,
          current_package: getPackage.rows[0].package_name,
          section: "Lab",
        };
        active_deps.push(output);
      } else {
        output = {
          department_id: dep.department_id,
          department_name: dep.department_name,
          section: "Lab",
        };
        inactive_deps.push(output);
      }
    }
    return res
      .status(200)
      .json({ active_deps: active_deps, inactive_deps: inactive_deps });
  } catch (error) {
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const activatePackages = async (req, res) => {
  const client = await pool.connect();
  const { inputs } = req.body;
  try {
    await client.query("BEGIN");
    for (const input of inputs) {
      let { department_id, position, package_id } = input;
      let removeP = await client.query(
        "DELETE FROM active_packages where department_id = ($1) and position = ($2)",
        [department_id, position]
      );
      let addP = await client.query(
        "insert into active_packages (department_id, position, package_id) values (($1), ($2), ($3))",
        [department_id, position, package_id]
      );
    }
    await client.query("Commit");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

//Data needed for setting date for president
const getDatePresident = async (req, res) => {
  const client = await pool.connect();
  try {
    let faculties = [];
    const getFacs = await client.query(
      "SELECT faculty_id, faculty_name from faculties"
    );
    for (const fac of getFacs.rows) {
      let branches = [];
      let rem1 = 0,
        tot1 = 0;

      let getBranches = await client.query(
        "select b.branch_id , f.branch_city from faculty_branch as b  inner join branches as f using (branch_id) where faculty_id = ($1)",
        [fac.faculty_id]
      );
      for (const branch of getBranches.rows) {
        let set_deps = [],
          unset_deps = [];
        let rem2 = 0,
          tot2 = 0;
        let getDepartments = await client.query(
          "select d.department_id, d.department_name, b.start_date, b.end_date from departments as d inner join department_branch as b using (department_id) where b.branch_id = ($1)",
          [branch.branch_id]
        );
        getDepartments.rows.forEach((dep) => {
          if (dep.start_date == null) {
            let output = {
              department_id: dep.department_id,
              department_name: dep.department_name,
            };
            unset_deps.push(output);
          } else {
            let output = {
              department_id: dep.department_id,
              department_name: dep.department_name,
              start_date: dep.start_date,
              end_date: dep.end_date,
            };
            set_deps.push(output);
            rem1++;
            rem2++;
          }
          tot1++;
          tot2++;
        });
        branches.push({
          branch_name: branch.branch_city,
          set_deps: set_deps,
          unset_deps: unset_deps,
          set_count: rem2,
          total_count: tot2,
        });
      }
      faculties.push({
        faculty_name: fac.faculty_name,
        branches: branches,
        set_count: rem1,
        total_count: tot1,
      });
    }
    return res.status(200).json(faculties);
  } catch (error) {
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

//Data needed for setting date for dean
const getDateDean = async (req, res) => {
  const client = await pool.connect();
  const { faculty_id } = req.user;
  try {
    let branches = [];
    let getBranches = await client.query(
      "select b.branch_id , f.branch_city from faculty_branch as b  inner join branches as f using (branch_id) where faculty_id = ($1)",
      [faculty_id]
    );
    for (const branch of getBranches.rows) {
      let set_deps = [],
        unset_deps = [];
      let rem2 = 0,
        tot2 = 0;
      let getDepartments = await client.query(
        "select d.department_id, d.department_name, b.start_date, b.end_date from departments as d inner join department_branch as b using (department_id) where b.branch_id = ($1)",
        [branch.branch_id]
      );
      getDepartments.rows.forEach((dep) => {
        if (dep.start_date == null) {
          let output = {
            department_id: dep.department_id,
            department_name: dep.department_name,
          };
          unset_deps.push(output);
        } else {
          let output = {
            department_id: dep.department_id,
            department_name: dep.department_name,
            start_date: dep.start_date,
            end_date: dep.end_date,
          };
          set_deps.push(output);
          rem2++;
        }
        tot2++;
      });
      branches.push({
        branch_name: branch.branch_city,
        branch_id: branch.branch_id,
        set_deps: set_deps,
        unset_deps: unset_deps,
        set_count: rem2,
        total_count: tot2,
      });
    }
    return res.status(200).json(branches);
  } catch (error) {
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const getFreeTextInfo = async (req, res) => {
  const client = await pool.connect();
  const { ft, reason } = req.body;
  try {
    const getSection = await client.query(
      "select * from active_free_texts where active_ft_id = ($1)",
      [ft]
    );
    let { teacher_id, student_id, section_id, free_text } = getSection.rows[0];
    const getInfo = await client.query(
      "select course_id, department_id, year, semester from sections where section_id = ($1)",
      [section_id]
    );
    let { course_id, department_id, year, semester } = getInfo.rows[0];
    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    await client.query(
      "insert into logs(student_id, course_id, department_id, teacher_id, log_date, log_time, reason, year, semester, free_text) values (($1),($2),($3),($4),($5),($6),($7),($8),($9),($10))",
      [
        student_id,
        course_id,
        department_id,
        teacher_id,
        date,
        time,
        reason,
        year,
        semester,
        free_text,
      ]
    );
    const getStudent = await client.query(
      "select student_fname, student_lname from students where student_id = ($1)",
      [student_id]
    );
    resp = {
      fname: getStudent.rows[0].student_fname,
      lname: getStudent.rows[0].student_lname,
      id: student_id,
    };

    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json(error.message);
  } finally {
    client.release();
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  createList,
  getLists,
  createPackage,
  setDepartmentDates,
  getFacultiesActive,
  getDepartmentsActive,
  activatePackages,
  getDatePresident,
  getDateDean,
  removeQuestion,
  removeList,
  removePackage,
  getPackages,
  getFreeTextInfo,
};
