const Router = require("express").Router();
const {
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
} = require("../controllers/testing");

Router.post("/activatesurvey/", activateSurvey);

Router.post("/addcourse/", addCourse);

Router.post("/addSection/", addSection);

Router.post("/addteacher/", addTeacher);

Router.post("/linktdep/", linkTDEP);

Router.post("/linktcourse/", linkTCourse);

Router.post("/addstudent/", addStudnet);

Router.post("/registerstudent/", registerStudent);

// Get list of courses given by teacher
Router.post("/addpres/", addPresident);

Router.post("/adddean/", addDean);

Router.post("/addFac/", addFaculty);

Router.post("/linkdeanfac/", linkDeanFac);

Router.post("/addbranch/", addBranch);

Router.post("/addfacman/", addFacMan);

Router.post("/linkfacbranch/", linkFacBranch);

Router.post("/adddep/", addDepartment);

Router.post("/adddepman/", addDepMan);

Router.post("/linkdepbranch", linkDepBranch);

Router.post("/addpackage/", addSurvey);

module.exports = Router;
