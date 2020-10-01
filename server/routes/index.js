const Router = require("express").Router();
const AuthRouter = require("./auth");
const ProfileRouter = require("./profile");
const StudentRouter = require("../routes/student");
const TeacherRouter = require("../routes/teacher");
const ManagerRouter = require("../routes/managers");
const DeanRouter = require("../routes/deans");
const userAuth = require("../services/Auth");
const ItRouter = require("../routes/it");

Router.use("/auth", AuthRouter);

Router.use("/profile", userAuth, ProfileRouter);

Router.use("/student", userAuth, StudentRouter);

Router.use("/teacher", userAuth, TeacherRouter);

Router.use("/manager", userAuth, ManagerRouter);

Router.use("/dean", userAuth, DeanRouter);

Router.use("/it", userAuth, ItRouter);

module.exports = Router;
