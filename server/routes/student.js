const Router = require("express").Router();
const {
  getCourses,
  getSurvey,
  postSurvey,
  saveDeviceToken,
  removeDeviceToken,
} = require("../controllers/student");

// Get list of courses
Router.get("/courses/", getCourses);

// Get survey questions
Router.get("/course/:sectionId/:departmentId", getSurvey);

// Post survey answers
Router.post("/course/:sectionId", postSurvey);

Router.post("/savetoken", saveDeviceToken);

Router.get("/deletetoken", removeDeviceToken);

module.exports = Router;
