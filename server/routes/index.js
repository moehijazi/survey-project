const Router = require("express").Router();
const AuthRouter = require("./auth");

Router.use("/auth", AuthRouter);

module.exports = Router;
