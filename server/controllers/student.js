const pool = require("../db/index");

const getCourses = async (req, res) => {
  const { id } = req.params.userId;

  try {
    const getAvailableSurveys = await pool.query(
      " QUERY TO GET COURSES WITH AVAILABLE SURVEYS"
    );

    return res.status(200).json(getAvailableSurveys);
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error while fetching courses. Please try again later",
    });
  }
};

const getSurvey = async (req, res) => {
  const { courseId } = req.params.courseId;

  try {
    const getAvailableSurveys = await pool.query(
      " QUERY TO GET course survey questions and options etc"
    );
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error while fetching survey. Please try again later",
    });
  }
};

const postSurvey = async (req, res) => {
  const { info } = req.body;
  try {
    sendInfo = await pool.query("SEND DATA / EXTRACT FIX IF NEEDED");
    res.status(200).json("Answers saved succesfully");
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error while fetching survey. Please try again later",
    });
  }
};

module.exports = { getCourses, getSurvey, postSurvey };
