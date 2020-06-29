const pool = require("../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createResetRequest, getResetRequest } = require("../services/Reset");

// Login user function
const loginUser = async (req, res) => {
  const { id, password, role } = req.body;

  try {
    if (role === "student")
      const checkId = await pool.query(" ENTER QUERY HERE LATER");
    if (role === "staff")
      const checkId = await pool.query(" ENTER QUERY HERE LATER");
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
        //ADD WHAT NEEDED TO RETURN HERE
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
    return res.status(500).json({
      message: "There was an error while logging in. Please try again later",
    });
  }
};

// Forgotten password function
const forgotPassword = async (req, res) => {
  const { id, email, role } = req.body;

  try {
    if (role === "student")
      const checkId = await pool.query(" ENTER QUERY HERE LATER");
    if (role === "staff")
      const checkId = await pool.query(" ENTER QUERY HERE LATER");
    if (!checkId.rowCount) {
      return res
        .status(404)
        .json({ message: "User not found. Please register and try again." });
    }

    const checkEmail = email === checkId.rows[0].email;
    if (!checkEmail)
      return res.status(401).json({
        message: "Email / ID does not match. Please try again later",
      });

    const result = await createResetRequest(email, role);
    if (result) return res.status(200).json({ message: "Email sent!" });
    return res
      .status(500)
      .json({ message: "There was an error. Failed to reset." });
  } catch (error) {
    return res.status(500).json({
      message: "There was an error while submitting. Please try again later",
    });
  }
};

const resetPassword = async (req, res) => {
  const { id, password, role } = req.body;

  const thisRequest = getResetRequest(req.body.id);
  if (thisRequest) {
    await bcrypt.hash(password, 10);
    // user update query
    res.status(200).json(ans);
  } else {
    res.status(404).json();
  }
};
