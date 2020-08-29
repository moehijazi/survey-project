const Router = require("express").Router();
const { changePassword } = require("../controllers/sharedUsers");

Router.post("/password", changePassword);

module.exports = Router;
