const pool = require("../db/index");

// This funct returns courses seperated by whether or not they're complete
const getCourses = async (req, res) => {
  const { user_id, branch_id, department_id } = req.user;
  const client = await pool.connect();
  try {
    const checkDate = await client.query(
      "select Start_Date from Department_Branch where Branch_id = ($1) and Department_id = ($2)",
      [branch_id, department_id]
    );

    let cur_date = new Date();

    if (checkDate.rows[0].start_date > cur_date) {
      return res.status(401).json({ message: "No surveys available" });
    }

    console.log(user_id);
    const AvailableSurveys = await client.query(
      " select X.section_id, C.Course_code, C.Course_name, X.Department_id from Courses as C inner join (  select S.Course_id, S.Section_id, S.Department_id from Sections as S where S.Section_id in ( select R.Section_id from registered_in as R where R.Student_id = ($1) and not R.is_voted )) as X using(Course_id)",
      [user_id]
    );
    console.log("here");
    const DoneSurveys = await client.query(
      " select X.section_id, C.Course_code, C.Course_name, X.Department_id from Courses as C inner join (  select S.Course_id, S.Section_id, S.Department_id from Sections as S where S.Section_id in ( select R.Section_id from registered_in as R where R.Student_id = ($1) and R.is_voted )) as X using(Course_id)",
      [user_id]
    );

    if (!AvailableSurveys.rowCount && !DoneSurveys.rowCount) {
      return res.status(401).json({ message: "No surveys available" });
    }
    const resp = {
      survey_count: AvailableSurveys.rowCount,
      total_courses: AvailableSurveys.rowCount + DoneSurveys.rowCount,
      voted_count: DoneSurveys.rowCount,
      surveys: AvailableSurveys.rows,
      voted_surveys: DoneSurveys.rows,
    };

    return res.status(200).json(resp);
  } catch (error) {
  } finally {
    client.release();
  }
};

const getSurvey = async (req, res) => {
  const { sectionId, departmentId } = req.params;
  const client = await pool.connect();

  try {
    const getTeacherInfo = await client.query(
      "select T2.Teacher_fname, T2.Teacher_lname, T2.teacher_id, X.Position  from Teachers as T2 inner join ( select T1.Teacher_id, T1.Position from teaches as T1 where T1.Section_id = ($1)) as X using(teacher_id)",
      [sectionId]
    );
    const {
      teacher_fname,
      teacher_lname,
      position,
      teacher_id,
    } = getTeacherInfo.rows[0];
    const getLists = await client.query(
      "select L.List_id, L.List_name from Lists as L where L.List_id in ( select P.List_id from Package_Lists as P where P.Package_id = (  select A.Package_id from Active_Packages as A where A.Department_id = ($1) and Position = ($2)))",
      [departmentId, position]
    );
    const lists = getLists.rows;

    let list_return = [];

    for (const list of lists) {
      let getListQuestions = await client.query(
        "select L1.Question_id, L1.Question_weight from List_Questions as L1 where L1.List_id = ($1)",
        [list.list_id]
      );

      let list_questions = getListQuestions.rows;
      let questions = [];
      for (const question of list_questions) {
        let questionInfo = {
          question_id: "",
          question_description: "",
          number_options: 0,
          weight: question.question_weight,
          options: [],
        };
        let getQuestionInfo = await client.query(
          "select Q.Question_id, Q.Question_description, Q.No_of_options from Questions as Q where Q.Question_id = ($1)",
          [question.question_id]
        );
        let {
          question_id,
          question_description,
          no_of_options,
        } = getQuestionInfo.rows[0];
        questionInfo.question_id = question_id;
        questionInfo.question_description = question_description;
        questionInfo.number_options = no_of_options;

        let getOptionId = await client.query(
          "select Q1.Option_id from Question_Options as Q1 where Q1.Question_id = ($1)",
          [question_id]
        );
        let optionIds = getOptionId.rows;
        for (const optionId of optionIds) {
          let getOptionInfo = await client.query(
            "select O1.Option_id, Option_description from Options as O1 where O1.Option_id = ($1)",
            [optionId.option_id]
          );
          let { option_id, option_description } = getOptionInfo.rows[0];
          let opt = {
            option_id: option_id,
            option_description: option_description,
          };
          questionInfo.options.push(opt);
        }

        questions.push(questionInfo);
      }
      list_return.push({ list_name: list.list_name, questions: questions });
    }

    resp = {
      teacher: {
        teacher_id: teacher_id,
        first_name: teacher_fname,
        last_name: teacher_lname,
      },
      lists: list_return,
    };

    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  } finally {
    client.release();
  }
};

const postSurvey = async (req, res) => {
  const { user_id } = req.user;
  const { sectionId } = req.params;
  const { teacher_id, free_text, answers } = req.body;
  const client = await pool.connect();
  const section_id = sectionId;

  try {
    let sumRates = 0;
    let sumWeights = 0;
    for (const answer of answers) {
      let { question_id, weight, number_options, rate } = answer;
      let saveAnswer = await client.query(
        "insert into Answers(Teacher_id, Question_id, Student_id, Rate, section_id) values (($1), ($2),($3) ,($4), ($5))",
        [teacher_id, question_id, user_id, rate, section_id]
      );
      sumRates += (rate / number_options) * weight;
      sumWeights += weight;
    }
    let score = ((sumRates / sumWeights) * 100).toFixed(2);
    let query_run = await client.query("BEGIN");
    let query_text =
      "update registered_in set is_voted = true, Vote_date = ($1) where Student_id = ($2)";
    let today = new Date();
    let date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let query_values = [date, user_id];
    query_run = await client.query(query_text, query_values);
    query_run = await client.query(
      "update teaches set Section_Teacher_sum_OF_rates = Section_Teacher_sum_of_rates + ($1) where Section_id = ($2) and Teacher_id = ($3);",
      [score, section_id, teacher_id]
    );
    query_run = await client.query(
      "update Sections set Section_no_of_votes = Section_no_of_votes + 1 where Section_id = ($1)",
      [section_id]
    );

    const Section_info = await client.query(
      "select * from Sections where Section_id = ($1)",
      [section_id]
    );

    const { branch_id, department_id } = Section_info.rows[0];
    query_run = await client.query(
      "update Branches set Branch_real_votes = Branch_real_votes + 1, Branch_sum_of_rates = Branch_sum_of_rates + ($1) where Branch_id = ($2)",
      [score, branch_id]
    );
    query_run = await client.query(
      "update Department_Branch set Dep_real_votes = Dep_real_votes + 1, Dep_sum_of_rates = Dep_sum_of_rates + ($1) where Branch_id = ($2) and Department_id = ($3)",
      [score, branch_id, department_id]
    );
    query_run = await client.query(
      "update Faculities set Faculty_real_votes = Faculty_real_votes + 1, Faculty_sum_of_rates = Faculty_sum_of_rates + ($1) where Faculty_id = (select D.Faculty_id from Departments as D where D.Department_id = ($2))",
      [score, department_id]
    );

    if (free_text) {
      let saveFreeText = await client.query(
        "insert into Active_Free_Texts(Teacher_id, Student_id, Section_id, Free_text) values ( ($1),($2),($3) ,($4))",
        [teacher_id, user_id, section_id, free_text]
      );
    }

    query_run = await client.query("COMMIT");

    return res.status(200).json({ message: "Saved successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

const saveDeviceToken = async (req, res) => {
  const { user_id } = req.user;
  const { token } = req.body;

  try {
    const saveToken = await pool.query(
      'UPDATE students SET "token" = ($1) where student_id = ($2)',
      [token, user_id]
    );
    return res.status(200).json("Token succesfully saved");
  } catch (error) {
    return res.status(500).json({
      message: "An error occured when saving token",
      error: error.message,
    });
  }
};

const removeDeviceToken = async (req, res) => {
  const { user_id } = req.user;

  try {
    const deleteToken = await pool.query(
      'UPDATE students SET "token" = null where student_id = ($2)',
      [token, user_id]
    );
    return res.status(200).json("Token succesfully ovedrem");
  } catch (error) {
    return res.status(500).json({
      message: "An error occured when deleting token",
      error: error.message,
    });
  }
};

module.exports = {
  getCourses,
  getSurvey,
  postSurvey,
  saveDeviceToken,
  removeDeviceToken,
};
