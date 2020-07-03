const pool = require("../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createResetRequest, getResetRequest } = require("../services/Reset");

// Login user function
const loginUser = async (req, res) => {
  const { id, password, role } = req.body;

  try {
    console.log("RECIEVED REQ");
    const checkId = await pool.query("SELECT * FROM users WHERE id = ($1)", [
      id,
    ]);
    if (role === "student") {
      const checkId = await pool.query("SELECT * FROM users WHERE id = ($1)", [
        id,
      ]);
    }
    if (role === "staff") {
      const checkId = await pool.query(" ENTER QUERY HERE LATER");
    }
    if (!checkId.rowCount) {
      return res
        .status(404)
        .json({ message: "User not found. Please try again." });
    }
    const checkPass = await bcrypt.compare(password, checkId.rows[0].password);
    if (!checkPass) {
      return res.status(401).json({
        message: "Email / password doesnot match. Please try again later",
      });
    }
    const resp = {
      accessToken: "",
      user: {
        name: checkId.rows[0].name,
        email: checkId.rows[0].email,
      },
    };
    resp.accessToken = jwt.sign(
      { user: checkId.rows[0].user_id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "3 days",
      }
    );
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

// Forgotten password function
const forgotPassword = async (req, res) => {
  const { id, email, role } = req.body;

  try {
    const checkId = await pool.query(" SELECT * FROM users WHERE id = ($1)", [
      id,
    ]);

    if (!checkId.rowCount) {
      return res
        .status(404)
        .json({ message: "User not found. Please register and try again." });
    }

    const checkEmail = email == checkId.rows[0].email;
    if (!checkEmail)
      return res.status(401).json({
        message: "Email / ID does not match. Please try again later",
      });

    const result = await createResetRequest(email, role);

    return res.status(200).json({ message: "Email sent!" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const resetPassword = async (req, res) => {
  const { id, password, role } = req.body;
  try {
    const thisRequest = await pool.query(
      'SELECT * FROM "resetRequest" WHERE id= ($1)',
      [id]
    );
    if (!thisRequest.rowCount) {
      return res.status(404).json("ERROR");
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const ans = await pool.query(
      "UPDATE users SET password = ($1) WHERE email = ($2) RETURNING *",
      [hashedPass, thisRequest.rows[0].email]
    );
    return res.status(200).json(ans);
  } catch (error) {
    return res.json(error.message);
  }
};

const changeEmail = async (req, res) => {
  try {
    const { email, id, role } = req.body;
    const addemail = await pool.query("ADD QUERY HERE DEPENDING ON ROLE");
    if (!addemail) return res.status(404).json({ message: "User not found" });
    return res.status(200).json("Email changed");
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error while changing email. Please try again later",
    });
  }
};

const changePassword = async (req, res) => {
  const { id, role, oldPassword, newPassword } = req.body;
  try {
    const getUser = await pool.query("GET USER QUERY BASED ON ROLE");
    if (!getUser) return res.status(404).json({ message: "User not found" });
    const checkPass = await bcrypt.compare(
      oldPassword,
      getUser.rows[0].password
    );
    if (!checkPass) {
      return res.status(401).json({
        message: "Incorrect password. Please try again later",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateUser = await pool.query("update pass");
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error while changing Password. Please try again later",
    });
  }
};

const addUser = async (req, res) => {
  const { id, password, email, name } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const inp = await pool.query(
      "INSERT INTO users(id, name, password, email) VALUES (($1), ($2), ($3), ($4))",
      [id, name, hashedPass, email]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = {
  loginUser,
  forgotPassword,
  resetPassword,
  changeEmail,
  changePassword,
  addUser,
};
