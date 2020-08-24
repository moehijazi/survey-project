const pool = require("../db/index");

const getCourses = async (req, res) => {
  const { user_id } = req.user_id;

  try {
    const getAvailableSurveys = await pool.query(
      " QUERY TO GET COURSES WITH AVAILABLE SURVEYS"
    );

    if (!getAvailableSurveys.rowCount)
      return res.status(401).json({ message: "No surveys available" });

    const resp = {
      survey_count: getAvailableSurveys.rowCount,
      surveys: getAvailableSurveys.rows
    };
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error while fetching courses. Please try again later",
    });
  }
};

const getSurvey = async (req, res) => {
  const { sectionId, departmentId } = req.params;
  const client = await pool.connect();

  try {
    const getTeacherInfo = await client.query("select T2.Teacher_fname, T2.Teacher_lname, X.Position from Teachers as T2 inner join ( select T1.Teacher_id, T1.Position from teaches as T1 where T1.Section_id = ($1)) as X", [sectionId]);
    const {Teacher_fname, Teacher_lname, Position, Teacher_id} = getTeacherInfo.rows[0];
    const getLists = await client.query("select L.List_id, L.List_name from Lists as L where L.List_id in ( select P.List_id from Package_Lists as P where P.Package_id = (  select A.Package_id from Active_Packages as A where A.Department_id = ($1) and Position = ($2)))", 
    [departmentId, Position]);
    const lists = getLists.rows;

    let questions = [];

    lists.forEach(list => {
      let getListQuestions = await client.query("select L1.Question_id, L1.Question_weight from List_Questions as L1 where L1.List_id = ($1)", list.List_id);
      let list_questions = getListQuestions.rows;
      list_questions.forEach(question => {
        let questionInfo ={
          question_id: '',
          question_description: '',
          number_options: 0,
          weight: question.Question_weight,
          options: []
        }
        let getQuestionInfo = await client.query("select Q.Question_id, Q.Question_description, Q.No_of_options from Questions as Q1 where Q1.Question_id = ($1)", question.Question_id);
        let {Question_id, Question_description, No_of_options} = getQuestionInfo.rows[0];
        questionInfo.question_id = Question_id;
        questionInfo.question_description = Question_description;
        questionInfo.number_options = No_of_options;

        let getOptionId = await client.query("select Q1.Option_id from Question_Options as Q1 where Q.Question_id = ($1)", [Question_id]);
        let optionIds = getOptionId.rows;
        optionIds.forEach(optionId => {
          let getOptionInfo = await client.query("select O1.Option_id, Option_description from Options as O1 where O1.Option_id = ($1)", [optionId.Option_id]);
          let {Option_id, Option_description} = getOptionInfo.rows[0];
          let opt = {
            option_id: Option_id,
            option_description: Option_description
          };
          questionInfo.options.push(opt);
        });

        questions.push(questionInfo);

      });
    });

    resp = {
      teacher: {
        teacher_id: Teacher_id,
        first_name: Teacher_fname,
        last_name: Teacher_lname,
      },
      questions: questions
    }

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
  const {user_id} = req.user;
  const {section_id} = req.params;
  const { teacher_id, free_text, answers } = req.body;
  const client = await pool.connect();

  try {
    answers.forEach(answer => {
      let {question_id, weight, number_options, rate} = answer;
      let saveAnswer = await client.query("insert into Answers(Teacher_id, Question_id, Student_id, Rate) values (($1), ($2),($3) ,($4))", [teacher_id, question_id, user_id, rate]);
      await client.query('BEGIN');
      let query_text = "update registered_in set is_voted = true, Vote_date = ($1) , Vote_time = ($2) where Student_id = ($3)";
      let today = new Date();
      let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let query_values = [date, time, user_id]
    });
    if(free_text){
      let saveFreeText = await client.query("insert into Active_Free_Texts(Teacher_id, Student_id, Section_id, Free_text) values ( ($1),($2),($3) ,($4))", [teacher_id,user_id, section_id, free_text]);}
    
    return res.status(200).json({message: "Saved successfully"});
  } catch (error) {
    return res.status(500).json({message: error.message});
  } finally {
    client.release();
  }
};

module.exports = { getCourses, getSurvey, postSurvey };
