const Router = require("express").Router();
const { getCourses, getSurvey, postSurvey } = require("../controllers/student");

// Get list of courses
Router.get("/courses/", getCourses);

// Get survey questions
Router.get("/course/:courseId", getSurvey);

// Post survey answers
Router.post("/course/:courseId", postSurvey);

module.exports = Router;
