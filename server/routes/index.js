const Router = require("express").Router();
const AuthRouter = require("./auth");
const ProfileRouter = require("./profile");
const StudentRouter = require("../routes/student");
const TeacherRouter = require("../routes/teacher");
const userAuth = require("../services/Auth");

Router.use("/auth", AuthRouter);

Router.use("/profile", userAuth, ProfileRouter);

Router.use("/student", userAuth, StudentRouter);

Router.use("/teacher", userAuth, TeacherRouter);

module.exports = Router;
