const pool = require("../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createResetRequest, getResetRequest } = require("../services/Reset");

// Login user function
const loginUser = async (req, res) => {
  const { id, password, role } = req.body;
  const Role = "";
  try {
    const resp = {
      x_auth_token: "",
      user: {
        first_name: "",
        last_name: "",
        email: "",
      },
      role: Role,
    };
    let checkPass;
    if (role === "student") {
      Role = "student";
      const checkId = await pool.query(
        "select * from Students as S where S.Student_id = ($1);",
        [id]
      );
      if (!checkId.rowCount) {
        return res
          .status(404)
          .json({ message: "User not found. Please try again." });
      }
      checkPass = await bcrypt.compare(
        password,
        checkId.rows[0].Student_password
      );
      resp.user.first_name = checkId.rows[0].Student_fname;
      resp.user.last_name = checkId.rows[0].Student_lname;
      resp.user.email = checkId.rows[0].Student_email;
    }
    if (role === "staff") {
      const checkId = await pool.query(
        "select * from Teacher as S where S.Teacher_id = ($1);",
        [id]
      );
      if (checkId.rowCount) {
        Role = "teacher";
        resp.user.first_name = checkId.rows[0].Teacher_fname;
        resp.user.last_name = checkId.rows[0].Teacher_lname;
        resp.user.email = checkId.rows[0].Teacher_email;
        checkPass = await bcrypt.compare(
          password,
          checkId.rows[0].Teacher_password
        );
      } else {
        checkId = await pool.query(
          "select * from Department_Managers as S where S.Dep_Manager_id = ($1);",
          [id]
        );
        if (checkId.rowCount) {
          Role = "department manager";
          resp.user.first_name = checkId.rows[0].Dep_Manager_fname;
          resp.user.last_name = checkId.rows[0].Dep_Manager_lname;
          resp.user.email = checkId.rows[0].Dep_Manager_email;
          checkPass = await bcrypt.compare(
            password,
            checkId.rows[0].Dep_Manager_password
          );
        } else {
          checkId = await pool.query(
            "select * from Faculty_Managers as S where S.Faculty_Manager_id = ($1);",
            [id]
          );
          if (checkId.rowCount) {
            Role = "faculty manager";
            resp.user.first_name = checkId.rows[0].Faculty_Manager_fname;
            resp.user.last_name = checkId.rows[0].Faculty_Manager_lname;
            resp.user.email = checkId.rows[0].Faculty_Manager_email;
            checkPass = await bcrypt.compare(
              password,
              checkId.rows[0].Faculty_Manager_password
            );
          } else {
            const checkId = await pool.query(
              "select * from Deans as S where S.Dean_id = ($1);",
              [id]
            );
            if (checkId.rowCount) {
              if (checkId.rows[0].Privilege_value == 1) {
                Role = "president";
              } else {
                Role = "dean";
              }
              resp.user.first_name = checkId.rows[0].Dean_fname;
              resp.user.last_name = checkId.rows[0].Dean_lname;
              resp.user.email = checkId.rows[0].Dean_email;
              checkPass = await bcrypt.compare(
                password,
                checkId.rows[0].Dean_password
              );
            } else {
              return res
                .status(404)
                .json({ message: "User not found. Please try again." });
            }
          }
        }
      }
    }

    if (!checkPass) {
      return res.status(401).json({
        message: "Email / password does not match. Please try again later",
      });
    }

    resp.x_auth_token = jwt.sign(
      { user: id, role: Role },
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
    if (role == "student") {
      const checkId = await pool.query(
        " select * from Students as S where S.Student_id = ($1) and S.Student_email = ($2) ;",
        [id, email]
      );

      if (!checkId.rowCount) {
        return res
          .status(404)
          .json({ message: "User not found. Please try again." });
      }
    } else {
      const checkId = await pool.query(
        "select * from Teacher as S where S.Teacher_id = ($1) and S.Teacher_email = ($2);",
        [id, email]
      );

      if (!checkId.rowCount) {
        checkId = await pool.query(
          "select * from Department_Managers as S where S.Dep_Manager_id = ($1) and S.Dep_Manager_email = ($2);",
          [id, email]
        );
        if (!checkId.rowCount) {
          checkId = await pool.query(
            "select * from Faculty_Managers as S where S.Faculty_Manager_id = ($1) and S.Faculty_Manager_email = ($2);",
            [id, email]
          );
          if (!checkId.rowCount) {
            const checkId = await pool.query(
              "select * from Deans as S where S.Dean_id = ($1) and S.Dean_email = ($2);",
              [id, email]
            );
            if (!checkId.rowCount) {
              return res
                .status(404)
                .json({ message: "User not found. Please try again." });
            }
          }
        }
      }
    }

    const result = await createResetRequest(email, role, id);

    return res.status(200).json({ message: "Email sent!" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//Reset a password from a reset request
const resetPassword = async (req, res) => {
  const { req_id, password, role } = req.body;
  try {
    const thisRequest = await pool.query(
      "SELECT * FROM Reset_Requests WHERE Request_id= ($1)",
      [req_id]
    );
    const { user_id } = thisRequest.rows[0].User_id;
    if (!thisRequest.rowCount) {
      return res.status(404).json("Request not found");
    }
    const hashedPass = await bcrypt.hash(password, 10);
    if (role == "student") {
      const updateUser = await pool.query(
        "UPDATE Students SET Student_password = ($1) WHERE Student_id = ($2);",
        [hashedPass, user_id]
      );
    } else {
      const checkId = await pool.query(
        "select * from Teacher as S where S.Teacher_id = ($1);",
        [user_id]
      );
      if (checkId.rowCount) {
        const updateUser = await pool.query(
          "UPDATE Teachers SET Teacher_password = ($1) WHERE Teacher_id = ($2);",
          [hashedPass, user_id]
        );
      } else {
        checkId = await pool.query(
          "select * from Department_Managers as S where S.Dep_Manager_id = ($1);",
          [user_id]
        );
        if (checkId.rowCount) {
          const updateUser = await pool.query(
            "UPDATE Department_Managers SET Dep_Manager_password = ($1) WHERE Dep_Manager_id = ($2);",
            [hashedPass, user_id]
          );
        } else {
          checkId = await pool.query(
            "select * from Faculty_Managers as S where S.Faculty_Manager_id = ($1);",
            [user_id]
          );
          if (checkId.rowCount) {
            const updateUser = await pool.query(
              "UPDATE Faculty_Managers SET Faculty_Manager_password = ($1) WHERE Faculty_Manager_id = ($2);",
              [hashedPass, user_id]
            );
          } else {
            const checkId = await pool.query(
              "select * from Deans as S where S.Dean_id = ($1);",
              [user_id]
            );
            if (checkId.rowCount) {
              const updateUser = await pool.query(
                "UPDATE Deans SET Dean_password = ($1) WHERE Dean_id = ($2);",
                [hashedPass, user_id]
              );
            }
          }
        }
      }
    }
    return res.status(200).json({ message: "Password reset!" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

//Change a user's password
const changePassword = async (req, res) => {
  const { id, role } = req.user;
  const { oldPassword, newPassword } = req.body;
  const client = await pool.connect();
  try {
    let currentPass;
    switch (role) {
      case "student":
        const getUser = await client.query(
          "select S.Student_password from Students as S where S.Student_id = ($1);",
          [id]
        );
        currentPass = getUser.rows[0].Student_password;
        const checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = await client.query(
          "UPDATE Students SET Student_password = ($1) WHERE Student_id = ($2);",
          [hashedPassword, id]
        );
        break;
      case "teacher":
        getUser = await client.query(
          "select S.Teacher_password from Teachers as S where S.Teacher_id = ($1);",
          [id]
        );
        currentPass = getUser.rows[0].Teacher_password;
        const checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = await client.query(
          "UPDATE Teachers SET Teacher_password = ($1) WHERE Teacher_id = ($2);",
          [hashedPassword, id]
        );
        break;
      case "department manager":
        getUser = await client.query(
          "select S.Dep_Manager_password from Department_Managers as S where S.Dep_Manager_id = ($1);",
          [id]
        );
        currentPass = getUser.rows[0].Dep_Manager_password;
        const checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = await client.query(
          "UPDATE Department_Managers SET Dep_Manager_password = ($1) WHERE Dep_Manager_id = ($2);",
          [hashedPassword, id]
        );
        break;
      case "faculty manager":
        getUser = await client.query(
          "select F.Faculty_manager_password from Faculty_Managers as F where F.Faculty_manager_id = ($1);",
          [id]
        );
        currentPass = getUser.rows[0].Faculty_manager_password;
        const checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = await client.query(
          "UPDATE Faculty_Managers SET Faculty_manager_password = ($1) WHERE Faculty_manager_id = ($2);",
          [hashedPassword, id]
        );
        break;
      case "dean":
        getUser = await client.query(
          "select D.Dean_password from Deans as D where D.Dean_id = ($1);",
          [id]
        );
        currentPass = getUser.rows[0].Dean_password;
        const checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUser = await client.query(
          "UPDATE Deanss SET Dean_password = ($1) WHERE Dean_id = ($2);",
          [hashedPassword, id]
        );
        break;
    }
    return res.status(200).json("Password changed");
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error while changing Password. Please try again later",
    });
  } finally {
    client.release();
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
  changePassword,
  addUser,
};
