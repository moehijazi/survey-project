const Router = require("express").Router();
const userAuth = require("../services/Auth");
const {
  loginUser,
  forgotPassword,
  resetPassword,
  addUser,
  checkUser,
} = require("../controllers/sharedUsers");

// Login User
Router.post("/login", loginUser);

//Forgotten password
Router.post("/forgot", forgotPassword);

//Reset password
Router.patch("/reset", resetPassword);

Router.post("/new", addUser);

Router.get("/check", userAuth, checkUser);

module.exports = Router;
