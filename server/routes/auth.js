const Router = require("express").Router();
const {
  loginUser,
  forgotPassword,
  resetPassword,
  addUser,
} = require("../controllers/sharedUsers");

// Login User
Router.post("/login", loginUser);

//Forgotten password
Router.post("/forgot", forgotPassword);

//Reset password
Router.patch("/reset", resetPassword);

Router.post("/new", addUser);

module.exports = Router;
