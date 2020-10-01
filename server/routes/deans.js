const Router = require("express").Router();

const {
  createQuestion,
  getQuestions,
  createList,
  getLists,
  createPackage,
  setDepartmentDates,
  getFacultiesActive,
  getDepartmentsActive,
  activatePackages,
  getDatePresident,
  getDateDean,
  removeQuestion,
  removeList,
  removePackage,
  getPackages,
  getFreeTextInfo,
} = require("../controllers/deans");

Router.post("/addquestion", createQuestion);

Router.get("/getquestions", getQuestions);

Router.post("/addlist", createList);

Router.get("/getlists", getLists);

Router.post("/addpackage", createPackage);

Router.post("/setdates", setDepartmentDates);

Router.get("/getfacactive", getFacultiesActive);

Router.get("/getdepactive/:faculty_id?", getDepartmentsActive);

Router.post("/setactive", activatePackages);

Router.get("/getdatepres", getDatePresident);

Router.get("/getdatedean", getDateDean);

Router.get("/removequestion/:question_id?", removeQuestion);

Router.get("/removelist/:list_id?", removeList);

Router.get("/removepackage/:package_id?", removePackage);

Router.get("/getpackages", getPackages);

Router.post("/freetext", getFreeTextInfo);

module.exports = Router;
