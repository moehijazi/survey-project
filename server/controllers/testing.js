const pool = require("../db/index");
const bcrypt = require("bcrypt");

const addPresident = async (req, res) => {
  const { id, password, email, fname, lname } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const inp = await pool.query(
      "INSERT INTO deans(dean_id, dean_fname, dean_lname, dean_password, dean_email, privilege_value) VALUES (($1), ($2), ($3), ($4), ($5), 1)",
      [id, fname, lname, hashedPass, email]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const addDean = async (req, res) => {
  const { id, password, email, fname, lname } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const inp = await pool.query(
      "INSERT INTO deans(dean_id, dean_fname, dean_lname, dean_password, dean_email, privilege_value) VALUES (($1), ($2), ($3), ($4), ($5), 0)",
      [id, fname, lname, hashedPass, email]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const addFaculty = async (req, res) => {
  const { id, name } = req.body;
  try {
    const inp = await pool.query(
      "INSERT INTO faculties(faculty_id, faculty_name, faculty_total_students, faculty_max_votes, faculty_real_votes, faculty_sum_of_rates) VALUES (($1), ($2), 0, 0,0,0)",
      [id, name]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const linkDeanFac = async (req, res) => {
  const { faculty_id, dean_id } = req.body;
  try {
    const inp = await pool.query(
      "insert into dean_faculty (faculty_id, dean_id) values (($1),($2))",
      [faculty_id, dean_id]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error);
  }
};

const addBranch = async (req, res) => {
  const { id, city } = req.body;
  try {
    const inp = await pool.query(
      "INSERT INTO branches(branch_id, branch_city, branch_total_students, branch_max_votes, branch_real_votes, branch_sum_of_rates) VALUES (($1), ($2), 0, 0,0,0)",
      [id, city]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const addFacMan = async (req, res) => {
  const { id, password, email, fname, lname } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const inp = await pool.query(
      "INSERT INTO faculty_managers(faculty_manager_id, faculty_manager_fname, faculty_manager_lname, faculty_manager_password, faculty_manager_email, privilege_value) VALUES (($1), ($2), ($3), ($4), ($5), 0)",
      [id, fname, lname, hashedPass, email]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const linkFacBranch = async (req, res) => {
  const { branch_id, faculty_id, fac_man_id } = req.body;
  try {
    const inp = await pool.query(
      "insert into faculty_branch (branch_id, faculty_id, faculty_manager_id) values (($1),($2),($3))",
      [branch_id, faculty_id, fac_man_id]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error);
  }
};

const addDepartment = async (req, res) => {
  const { dep_id, name, fac_id } = req.body;
  try {
    const inp = await pool.query(
      "INSERT INTO departments(faculty_id, department_name, department_id) VALUES (($1), ($2),($3)))",
      [fac_id, name, dep_id]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const addDepMan = async (req, res) => {
  const { id, password, email, fname, lname } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const inp = await pool.query(
      "INSERT INTO department_managers(dep_manager_id, dep_manager_fname, dep_manager_lname, dep_manager_password, dep_manager_email, privilege_value) VALUES (($1), ($2), ($3), ($4), ($5), 0)",
      [id, fname, lname, hashedPass, email]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const linkDepBranch = async (req, res) => {
  const { branch_id, department_id, dep_man_id } = req.body;
  try {
    const inp = await pool.query(
      "insert into department_branch (branch_id, department_id, dep_manager_id, dep_total_students, dep_max_votes, dep_real_votes, dep_sum_of_rates, start_date, end_date) values (($1),($2),($3), 0,0,0,0, '2020-01-01', '2021-01-01')",
      [branch_id, department_id, dep_man_id]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error);
  }
};

const addSurvey = async (req, res) => {
  const { package_name, package_desc, dean_id, lists } = req.body;
  const client = await pool.connect();
  let makeList,
    list_id,
    linkPL,
    makeQuestion,
    question_id,
    linkQL,
    makeOption,
    option_id,
    linkOQ;
  try {
    let query = await client.query("BEGIN");
    query = await client.query(
      "insert into packages(package_name, package_description, dean_id) VALUES (($1),($2),($3)) returning package_id",
      [package_name, package_desc, dean_id]
    );
    const package_id = query.rows[0].package_id;
    for (const list of lists) {
      makeList = await client.query(
        "insert into lists (list_name, list_description) Values (($1), ($2)) returning list_id",
        [list.list_name, list.list_description]
      );
      list_id = makeList.rows[0].list_id;
      linkPL = await client.query(
        "insert into package_lists (package_id, list_id) values (($1), ($2))",
        [package_id, list_id]
      );
      for (const question of list.questions) {
        makeQuestion = await client.query(
          "insert into questions (question_description, no_of_options) values (($1), ($2)) returning question_id",
          [question.question_desc, question.no_of_options]
        );
        question_id = makeQuestion.rows[0].question_id;
        linkQL = await client.query(
          "insert into list_questions (list_id, question_id, question_weight) values (($1), ($2), ($3))",
          [list_id, question_id, question.weight]
        );
        for (const option of question.options) {
          makeOption = await client.query(
            "insert into options (option_description) values (($1)) returning option_id",
            [option.opt_description]
          );
          option_id = makeOption.rows[0].option_id;
          linkOQ = await client.query(
            "insert question_options (question_id, option_id) values (($1), ($2))",
            [question_id, option_id]
          );
        }
      }
    }
    query = await client.query("commit");
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const activateSurvey = async (req, res) => {
  const { dep_id, position, package_id } = req.body;
  try {
    const activate = pool.query(
      "insert into active_packages (department_id, position, package_id) values (($1), ($2), ($3))",
      [dep_id, position, package_id]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const addCourse = async (req, res) => {
  const { course_code, course_name, dep_id } = req.body;
  try {
    const insert = await pool.query(
      "insert into courses (course_code, course_name, department_id) values (($1), ($2), ($3))",
      [course_code, course_name, dep_id]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const addSection = async (req, res) => {
  const { section_details, course_id, branch_id, department_id } = req.body;
  try {
    const insert = await pool.query(
      " insert into sections (section_details, no_of_teachers, course_id, branch_id, department_id, year, semester, section_total_students, section_no_of_votes) values (($1), 1, ($2), ($3),($4),1,1,0,0)",
      [section_details, course_id, branch_id, department_id]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const addTeacher = async (req, res) => {
  const { id, fname, lname, password, email } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const inp = await pool.query(
      "INSERT INTO teachers(teacher_id, teacher_fname, teacher_lname, teacher_password, teacher_email) VALUES (($1), ($2), ($3), ($4), ($5))",
      [id, fname, lname, hashedPass, email]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const linkTDEP = async (req, res) => {
  const { t_id, d_id, b_id } = req.body;
  try {
    const insert = pool.query(
      "insert into teacher_department (teacher_id, department_id, branch_id) values (($1), ($2), ($3))",
      [t_id, d_id, b_id]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.staus(500).json(error.message);
  }
};

const linkTCourse = async (req, res) => {
  const { s_id, t_id } = req.body;
  try {
    const input = await pool.query(
      "insert into teaches (section_id, teacher_id,section_teacher_sum_of_rates) values (($1), ($2), 0)"
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const addStudnet = async (req, res) => {
  const { stds } = req.body;
  const client = await pool.connect();
  try {
    for (const std of stds) {
      let { id, fname, lname, password, email, b_id, d_id, fac_id } = std;
      const hashedPass = await bcrypt.hash(password, 10);
      await client.query("BEGIN");
      await client.query(
        "insert into students (student_id, student_fname, student_lname, student_password, student_email, branch_id, department_id) values (($1), ($2), ($3), ($4), ($5), ($6), ($7))",
        [id, fname, lname, hashedPass, email, b_id, d_id]
      );
      await client.query(
        "update faculties set faculty_total_students = faculty_total_students +1 where faculty_id = ($1)",
        [fac_id]
      );
      await client.query(
        "update branches set branch_total_students = branch_total_students +1 where branch_id = ($1)",
        [b_id]
      );
      await client.query(
        "update department_branch set dep_total_students = dep_total_students +1 where department_id = ($1) and branch_id = ($2)",
        [d_id, b_id]
      );
      await client.query("commit");
    }

    return res.status(200).json("Success");
  } catch (error) {
    await client.query("rollback");
    return res.status(500).json(error.message);
  } finally {
    client.release();
  }
};

const registerStudent = async (req, res) => {
  const { stds } = req.body;
  const client = await pool.connect();
  try {
    for (const std of stds) {
      let { student_id, section_id, course_id, b_id, f_id, d_id } = std;
      await client.query("begin");
      await client.query(
        "insert into registered_in (student_id, section_id, course_id) values (($1), ($2), ($3))",
        [student_id, section_id, course_id]
      );
      await client.query(
        "update faculties set faculty_max_votes = faculty_max_votes +1 where faculty_id = ($1)",
        [f_id]
      );
      await client.query(
        "update branches set branch_max_votes = branch_max_votes +1 where branch_id = ($1)",
        [b_id]
      );
      await client.query(
        "update department_branch set dep_max_votes = dep_max_votes +1 where department_id = ($1) and branch_id = ($2)",
        [d_id, b_id]
      );
      await client.query(
        "update sections set section_total_students = section_total_students + 1 where section_id = ($1)",
        [section_id]
      );
      await client.query("commit");
    }
    return res.status(200).json("Success");
  } catch (error) {
    await client.query("rollback");
    return res.status(500).json(error.message);
  } finally {
    client.release();
  }
};

module.exports = {
  addPresident,
  addDean,
  addFaculty,
  linkDeanFac,
  addBranch,
  addFacMan,
  linkFacBranch,
  addDepartment,
  addDepMan,
  linkDepBranch,
  addSurvey,
  activateSurvey,
  addCourse,
  addSection,
  addTeacher,
  linkTDEP,
  linkTCourse,
  addStudnet,
  registerStudent,
};
