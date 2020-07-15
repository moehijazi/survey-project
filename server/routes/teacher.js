const Router = require("express").Router();
const { getCourses, getResultsSurvey, getTeacherScore, getCourseScore } = require("../controllers/teacher");

// Get list of courses given by teacher
Router.get("/courses/", getCourses);

// Get survey results detailed
Router.get("/course/:sectionId/:departmentId", getResultsSurvey);

// Get total teacher score
Router.get("/score", getTeacherScore);

// Get score of course
Router.get("/score/:sectionId", getCourseScore)

module.exports = Router;