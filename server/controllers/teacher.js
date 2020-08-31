const pool = require("../db/index");
const { use } = require("../routes");
const { getScoreCourse } = require("../services/Results");

const getCourses = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    let courses = [];
    let ans;
    const getAvailableResults = await pool.query(
      "select X.Section_id, C.Course_code, C.Course_name, X.Branch_city, C.Department_id from Courses as C inner join (  select B.Branch_city, Y.Section_id, Y.Course_id from Branches as B inner join ( select S.Section_id, S.Course_id, S.Branch_id from Sections as S where S.Section_id in ( select T1.Section_id from teaches as T1 where T1.Teacher_id = ($1) )) as Y using(branch_id) ) as X using(course_id)",
      [user_id]
    );
    if (!getAvailableResults.rowCount) {
      return res.status(401).json({ message: "No results available" });
    }

    for (const course of getAvailableResults.rows) {
      ans = await getScoreCourse(course.section_id);
      courses.push({
        section_id: course.section_id,
        Course_code: course.course_code,
        Course_name: course.course_name,
        Department_id: course.department_id,
        Branch_city: course.branch_city,
        score: ans.score,
        participation: ans.rate,
      });
    }

    const resp = {
      courses: courses,
    };

    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getResultsSurvey = async (req, res) => {
  const { sectionId, departmentId } = req.params;
  const { user_id } = req.user;
  const client = await pool.connect();

  try {
    const getParticipation = await client.query(
      "select S.Section_total_students, S.Section_no_of_votes from Sections as S where S.Section_id = ($1)",
      [sectionId]
    );
    const {
      section_total_students,
      section_no_of_votes,
    } = getParticipation.rows[0];
    const participation_rate = (
      (Number(section_no_of_votes) / Number(section_total_students)) *
      100
    ).toFixed(2);

    const getPosition = await client.query(
      "select position from teaches where teacher_id = ($1) and section_id = ($2)",
      [user_id, sectionId]
    );
    let position = getPosition.rows[0].position;

    const questions = [];

    const getLists = await client.query(
      "select L.List_id, L.List_name from Lists as L where L.List_id in ( select P.List_id from Package_Lists as P where P.Package_id = (  select A.Package_id from Active_Packages as A where A.Department_id = ($1) and Position = ($2) ))",
      [departmentId, position]
    );

    for (const row of getLists.rows) {
      let getListQuestions = await client.query(
        "select L1.Question_id, L1.Question_weight from List_Questions as L1 where L1.List_id = ($1)",
        [row.list_id]
      );
      for (const question of getListQuestions.rows) {
        let { question_id, question_weight } = question;
        let getQuestionDetails = await client.query(
          "select Q.Question_id, Q.Question_description, Q.No_of_options from Questions as Q where Q.Question_id = ($1)",
          [question_id]
        );
        let question_details = {
          question_description: getQuestionDetails.rows[0].question_description,
          options: [],
          score: 0,
          weight: question_weight,
        };
        let getOptionIds = await client.query(
          "select Q1.Option_id from Question_Options as Q1 where Q1.Question_id = ($1)",
          [question_id]
        );
        for (const option of getOptionIds.rows) {
          let { option_id } = option;
          let getOptionDetails = await client.query(
            "select O1.Option_id, Option_description from Options as O1 where O1.Option_id = ($1)",
            [option_id]
          );
          let opt = {
            option_id: getOptionDetails.rows[0].option_id,
            option_description: getOptionDetails.rows[0].option_description,
            count: 0,
          };
          question_details.options.push(opt);
        }

        let getQuestionRates = await client.query(
          "select A.Rate from Answers as A where A.Section_id = ($1) and A.Question_id = ($2)",
          [sectionId, question_id]
        );

        getQuestionRates.rows.forEach((rate) => {
          let rateNum = Number(rate.rate);
          question_details.options[rateNum - 1].count++;
          question_details.score +=
            rateNum / getQuestionDetails.rows[0].no_of_options;
        });
        question_details.score = (
          (question_details.score / section_no_of_votes) *
          100
        ).toFixed(2);

        questions.push(question_details);
      }
    }
    let course_score_temp = 0;
    let course_max_score = 0;
    questions.forEach((question) => {
      course_score_temp += question.score * question.weight;
      course_max_score += question.weight * 100;
    });
    const course_score = ((course_score_temp / course_max_score) * 100).toFixed(
      2
    );
    const getFreeText = await client.query(
      "select A.Free_text from Active_Free_Texts as A where A.Section_id = ($1)",
      [sectionId]
    );
    let free_text = [];
    getFreeText.rows.forEach((row) => {
      free_text.push(row.free_text);
    });

    resp = {
      number_of_voters: section_no_of_votes,
      participation_rate: participation_rate,
      questions: questions,
      free_text: free_text,
      course_score: course_score,
    };

    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

const getCourseScore = async (req, res) => {
  const { sectionId } = req.params;
  const client = await pool.connect();
  try {
    let ans = await getScoreCourse(sectionId);
    const resp = { score: ans.score, participation_rate: ans.rate };
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

const getTeacherScore = async (req, res) => {
  const { user_id } = req.user;
  const client = await pool.connect();
  try {
    let courses_score = 0;
    let temp, section_id;
    const getScoreRows = await client.query(
      "select T.Section_id from teaches as T where T.Teacher_id = ($1)",
      [user_id]
    );
    for (const scoreRow of getScoreRows.rows) {
      section_id = scoreRow.section_id;
      temp = await getScoreCourse(section_id);
      courses_score += temp.score;
    }

    courses_score = (courses_score / getScoreRows.rowCount).toFixed(2);
    const resp = { score: courses_score };
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

module.exports = {
  getCourses,
  getResultsSurvey,
  getCourseScore,
  getTeacherScore,
};
