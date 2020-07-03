const Router = require("express").Router();
const { changeEmail, changePassword } = require("../controllers/sharedUsers");

Router.post("/email", changeEmail);

Router.post("/password", changePassword);

module.exports = Router;
