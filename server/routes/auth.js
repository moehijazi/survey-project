const Router = require("express").Router();
const authUser = require("../services/Auth");

// Login User
Router.post("/login", loginUser);

//Forgotten password
Router.post("/forgot", forgotPassword);

//Reset password
Router.patch("/reset", resetPassword);

module.exports = Router;
