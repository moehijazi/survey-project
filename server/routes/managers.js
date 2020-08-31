const Router = require("express").Router();
const {
  getBranches,
  getFacultyScore,
  getDepartments,
  getCourses,
  getFaculties,
  getUniScore,
  getFacultyBranchScore,
  getDepartmentBranchScore,
} = require("../controllers/managers");

// Get list of faculties for uni president
Router.get("/faculties/", getFaculties);

// Get Score of uni
Router.get("/uniscore/", getUniScore);

//Get list of branches of faculty
Router.get("/branches/:faculty_id?", getBranches);

//Get Score of faculty
Router.get("/facscore/:faculty_id?", getFacultyScore);

//Get list of departments in a faculty branch
Router.get("/departments/:faculty_id?/:branch_id?", getDepartments);

// Get score of branch of a faculty
Router.get("/facbranchscore/:faculty_id?/:branch_id?", getFacultyBranchScore);

//Get list of courses in a department branch
Router.get("/courses/:department_id?/:branch_id?", getCourses);

//Get score of branch of a department
Router.get(
  "/depbranchscore/:department_id?/:branch_id?",
  getDepartmentBranchScore
);

module.exports = Router;
