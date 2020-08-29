const pool = require("../db/index");

const createQuestion = async (req, res) => {
  const client = await pool.connect();
  try {
    const { question_description, options } = req.body;
    const insertQuestion = await client.query("insert into Questions (Question_description, No_of_options) values (($1), ($2)) returning *",[question_description, options.length]);
    const q_id = insertQuestion.rows[0].Question_id;
    options.forEach(option => {
        const insertOption = await client.query("INSERT INTO Options (Option_description) VALUES (($1)) RETURNING *",[option]);
        let opt_id = insertOption.rows[0].Option_id;
        const link = await client.query("INSERT INTO Question_Options (Question_id, Option_id) VALUES ( ($1), ($2))",[q_id,opt_id]);
    });
    return res.status(200).json("Success");
  } catch (error) {
      return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const getQuestions = async (req, res) => {
    try {
        const getQuestions = await pool.query("SELECT Question_id, Question_description FROM Questions");
        const questions = getQuestions.rows;
        return res.status(200).json(questions);
    } catch (error) {
        return res.status(500).json(error);
    }
}

const createList = async (req, res) => {
    const client = await pool.connect();
    try {
        const {list_name, list_description, questions} = req.body;
        const insertList = await client.query("INSERT INTO Lists (List_name, List_description) VALUES ( ($1), ($2)) RETURNING *",[list_name, list_description]);
        const list_id = insertList.rows[0].List_id;
        questions.forEach(question => {
            const link = await client.query("INSERT INTO List_Questions (List_id, Question_is, Question_weight) VALUES ( ($1), ($2), ($3))", [list_id, question.id, question.weight]);
        });
        return res.status(200).json("Success");
    } catch (error) {
        return res.status(500).json(error);
    }finally {
        client.release();
    }
}

const getLists = async (req, res) => {
    try {
        const getLists = await pool.query("SELECT * FROM Lists");
        const lists = getLists.rows;
        return res.status(200).json(lists);
    } catch (error) {
        return res.status(500).json(error);
    }
}

const createPackage = async (req,res) => {
    const client = await pool.connect();
    try {
        const {package_name, package_description, lists} = req.body;
        const {user_id} = req.user.user_id;
        const insertPackage = await client.query("INSERT INTO Packages (Package_name, Package_description, Dean_id) VALUES ( ($1), ($2), ($3)) RETURNING *", [package_name, package_description, user_id]);
        const package_id = insertPackage.rows[0].Package_id;
        lists.forEach(list => {
            const link = await client.query("INSERT INTO Package_Lists (Package_id, List_id) VALUES ( ($1), ($2) )", [package_id, list]);
        });
        return res.status(200).json("Success");
    } catch (error) {
        return res.status(500).json(error);
    } finally {
        client.release();
    }
}
