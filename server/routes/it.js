const Router = require("express").Router();

const { getFreeText, removeLog } = require("../controllers/it");

Router.get("/gettext", getFreeText);

Router.post("/remove", removeLog);

module.exports = Router;
