const pool = require("../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createResetRequest, getResetRequest } = require("../services/Reset");
const { json } = require("express");

// Login user function
const loginUser = async (req, res) => {
  const { id, password, role } = req.body;
  let Role = "";
  const client = await pool.connect();
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
      const checkId = await client.query(
        "select * from students as S wHEre S.student_id = ($1)",
        [id]
      );
      if (!checkId.rowCount) {
        return res
          .status(404)
          .json({ message: "User not found. Please try again." });
      }
      checkPass = await bcrypt.compare(
        password,
        checkId.rows[0].student_password
      );
      resp.user.first_name = checkId.rows[0].student_fname;
      resp.user.last_name = checkId.rows[0].student_lname;
      resp.user.email = checkId.rows[0].student_email;
    }
    if (role === "it") {
      Role = "it";
      const checkId = await client.query(
        "select * from it_managers as S wHEre S.it_manager_id = ($1)",
        [id]
      );
      if (!checkId.rowCount) {
        return res
          .status(404)
          .json({ message: "User not found. Please try again." });
      }
      checkPass = await bcrypt.compare(
        password,
        checkId.rows[0].it_manager_password
      );
      resp.user.first_name = checkId.rows[0].it_manager_fname;
      resp.user.last_name = checkId.rows[0].it_manager_lname;
      resp.user.email = checkId.rows[0].it_manager_email;
    }
    if (role === "staff") {
      let checkId = await pool.query(
        "select * from Teachers as S where S.Teacher_id = ($1);",
        [id]
      );
      if (checkId.rowCount) {
        Role = "teacher";
        resp.user.first_name = checkId.rows[0].teacher_fname;
        resp.user.last_name = checkId.rows[0].teacher_lname;
        resp.user.email = checkId.rows[0].teacher_email;
        checkPass = await bcrypt.compare(
          password,
          checkId.rows[0].teacher_password
        );
      } else {
        checkId = await pool.query(
          "select * from Department_Managers as S where S.Dep_Manager_id = ($1);",
          [id]
        );
        if (checkId.rowCount) {
          Role = "department manager";
          resp.user.first_name = checkId.rows[0].dep_manager_fname;
          resp.user.last_name = checkId.rows[0].dep_manager_lname;
          resp.user.email = checkId.rows[0].dep_manager_email;
          checkPass = await bcrypt.compare(
            password,
            checkId.rows[0].dep_manager_password
          );
        } else {
          checkId = await pool.query(
            "select * from Faculty_Managers as S where S.Faculty_Manager_id = ($1);",
            [id]
          );
          if (checkId.rowCount) {
            Role = "faculty manager";
            resp.user.first_name = checkId.rows[0].faculty_manager_fname;
            resp.user.last_name = checkId.rows[0].faculty_manager_lname;
            resp.user.email = checkId.rows[0].faculty_manager_email;
            checkPass = await bcrypt.compare(
              password,
              checkId.rows[0].faculty_manager_password
            );
          } else {
            checkId = await pool.query(
              "select * from Deans as S where S.Dean_id = ($1);",
              [id]
            );
            if (checkId.rowCount) {
              if (checkId.rows[0].privilege_value == 1) {
                Role = "president";
              } else {
                Role = "dean";
              }
              resp.user.first_name = checkId.rows[0].dean_fname;
              resp.user.last_name = checkId.rows[0].dean_lname;
              resp.user.email = checkId.rows[0].dean_email;
              checkPass = await bcrypt.compare(
                password,
                checkId.rows[0].dean_password
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
      { id: id, role: Role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "3 days",
      }
    );

    resp.role = Role;
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json(error.message);
  } finally {
    client.release();
  }
};

// Forgotten password function
const forgotPassword = async (req, res) => {
  const { id, email, role } = req.body;

  try {
    let Role;
    if (role == "student") {
      Role = "student";
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
      Role = "teacher";

      if (!checkId.rowCount) {
        checkId = await pool.query(
          "select * from Department_Managers as S where S.Dep_Manager_id = ($1) and S.Dep_Manager_email = ($2);",
          [id, email]
        );
        Role = "department manager";
        if (!checkId.rowCount) {
          checkId = await pool.query(
            "select * from Faculty_Managers as S where S.Faculty_Manager_id = ($1) and S.Faculty_Manager_email = ($2);",
            [id, email]
          );
          Role = "faculty manager";
          if (!checkId.rowCount) {
            const checkId = await pool.query(
              "select * from Deans as S where S.Dean_id = ($1) and S.Dean_email = ($2);",
              [id, email]
            );
            Role = "dean";
            if (!checkId.rowCount) {
              return res
                .status(404)
                .json({ message: "User not found. Please try again." });
            }
          }
        }
      }
    }

    let result = await createResetRequest(email, Role, id);
    if (result != 1) {
      return res.status(500).json("Failed");
    }
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
  const { user_id, role } = req.user;
  const { oldPassword, newPassword } = req.body;
  const client = await pool.connect();
  try {
    let currentPass, getUser, checkPass, hashedPassword, updateUser;
    switch (role) {
      case "student":
        getUser = await client.query(
          "select S.Student_password from Students as S where S.Student_id = ($1);",
          [user_id]
        );
        currentPass = getUser.rows[0].student_password;
        checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
        updateUser = await client.query(
          "UPDATE Students SET Student_password = ($1) WHERE Student_id = ($2);",
          [hashedPassword, user_id]
        );
        break;
      case "teacher":
        getUser = await client.query(
          "select S.Teacher_password from Teachers as S where S.Teacher_id = ($1);",
          [user_id]
        );

        currentPass = getUser.rows[0].teacher_password;
        checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
        updateUser = await client.query(
          "UPDATE Teachers SET Teacher_password = ($1) WHERE Teacher_id = ($2);",
          [hashedPassword, user_id]
        );
        break;
      case "department manager":
        getUser = await client.query(
          "select S.Dep_Manager_password from Department_Managers as S where S.Dep_Manager_id = ($1);",
          [user_id]
        );
        currentPass = getUser.rows[0].dep_manager_password;
        checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
        updateUser = await client.query(
          "UPDATE Department_Managers SET Dep_Manager_password = ($1) WHERE Dep_Manager_id = ($2);",
          [hashedPassword, user_id]
        );
        break;
      case "faculty manager":
        getUser = await client.query(
          "select F.Faculty_manager_password from Faculty_Managers as F where F.Faculty_manager_id = ($1);",
          [user_id]
        );
        currentPass = getUser.rows[0].faculty_manager_password;
        checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
        updateUser = await client.query(
          "UPDATE Faculty_Managers SET Faculty_manager_password = ($1) WHERE Faculty_manager_id = ($2);",
          [hashedPassword, user_id]
        );
        break;
      default:
        getUser = await client.query(
          "select D.Dean_password from Deans as D where D.Dean_id = ($1);",
          [user_id]
        );
        currentPass = getUser.rows[0].dean_password;
        checkPass = await bcrypt.compare(oldPassword, currentPass);
        if (!checkPass) {
          return res.status(401).json({
            message: "Incorrect password. Please try again later",
          });
        }
        hashedPassword = await bcrypt.hash(newPassword, 10);
        updateUser = await client.query(
          "UPDATE Deans SET Dean_password = ($1) WHERE Dean_id = ($2);",
          [hashedPassword, user_id]
        );
        break;
    }
    return res.status(200).json("Password changed");
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        "There was an error while changing Password. Please try again later",
    });
  } finally {
    client.release();
  }
};

const addUser = async (req, res) => {
  const { id, password, email, fname, lname, branch, dep } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const inp = await pool.query(
      "INSERT INTO students(student_id, student_fname, student_lname, student_passward, student_email, branch_id, department_id) VALUES (($1), ($2), ($3), ($4), ($5), ($6), ($7))",
      [id, fname, lname, hashedPass, email, branch, dep]
    );
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const checkUser = async (req, res) => {
  const { user_id, role } = req.user;
  const client = await pool.connect();
  let getUser, fname, lname;
  try {
    switch (role) {
      case "student":
        getUser = await client.query(
          "select S.student_fname, S.student_lname from Students as S where S.Student_id = ($1);",
          [user_id]
        );
        fname = getUser.rows[0].student_fname;
        lname = getUser.rows[0].student_lname;
        break;
      case "teacher":
        getUser = await client.query(
          "select S.teacher_fname, S.teacher_lname from teachers as S where S.teacher_id = ($1);",
          [user_id]
        );
        fname = getUser.rows[0].teacher_fname;
        lname = getUser.rows[0].teacher_lname;
        break;
      case "department manager":
        getUser = await client.query(
          "select S.Dep_Manager_fname, S.Dep_manager_lname from Department_Managers as S where S.Dep_Manager_id = ($1);",
          [user_id]
        );
        fname = getUser.rows[0].dep_manager_fname;
        lname = getUser.rows[0].dep_manager_lname;
        break;
      case "faculty manager":
        getUser = await client.query(
          "select F.Faculty_manager_fname, F.faculty_manager_lname from Faculty_Managers as F where F.Faculty_manager_id = ($1);",
          [user_id]
        );
        fname = getUser.rows[0].faculty_manager_fname;
        lname = getUser.rows[0].faculty_manager_lname;
        break;
      case "it":
        getUser = await client.query(
          "select F.it_manager_fname, F.it_manager_lname from it_managers as F where F.it_manager_id = ($1);",
          [user_id]
        );
        fname = getUser.rows[0].it_manager_fname;
        lname = getUser.rows[0].it_manager_lname;
        break;
      default:
        getUser = await client.query(
          "select D.Dean_fname, D.dean_lname from Deans as D where D.Dean_id = ($1);",
          [user_id]
        );
        fname = getUser.rows[0].dean_fname;
        lname = getUser.rows[0].dean_lname;
        break;
    }
    return res
      .status(200)
      .json({ role: role, first_name: fname, last_name: lname });
  } catch (error) {
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

module.exports = {
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  addUser,
  checkUser,
};
