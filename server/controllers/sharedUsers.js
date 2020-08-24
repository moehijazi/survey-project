const pool = require("../db/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createResetRequest, getResetRequest } = require("../services/Reset");

// Login user function
const loginUser = async (req, res) => {
  const { id, password, role } = req.body;
  const Role;
  try {
    const resp = {
      accessToken: "",
      user: {
        first_name: '',
        last_name: '',
        email: ''
      },
      role: Role
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
      checkPass = await bcrypt.compare(password, checkId.rows[0].Student_password);
      resp.user.first_name = checkId.rows[0].Student_fname;
      resp.user.last_name = checkId.rows[0].Student_lname;
      resp.user.email = checkId.rows[0].Student_email;

    }
    if (role === "staff") {
      const checkId = await pool.query(
        "select * from Teacher as S where S.Teacher_id = ($1);",
        [id]
      );
      if(checkId.rowCount){
        Role = "teacher";
        resp.user.first_name = checkId.rows[0].Teacher_fname;
        resp.user.last_name = checkId.rows[0].Teacher_lname;
        resp.user.email = checkId.rows[0].Teacher_email;
        checkPass = await bcrypt.compare(password, checkId.rows[0].Teacher_password);
      }
      else{
        checkId = await pool.query(
          "select * from Department_Managers as S where S.Dep_Manager_id = ($1);",
          [id]
        );
        if(checkId.rowCount){
          Role = "department manager";
          resp.user.first_name = checkId.rows[0].Dep_Manager_fname;
          resp.user.last_name = checkId.rows[0].Dep_Manager_lname;
          resp.user.email = checkId.rows[0].Dep_Manager_email;
          checkPass = await bcrypt.compare(password, checkId.rows[0].Dep_Manager_password);
        }
        else{
          checkId = await pool.query(
            "select * from Faculty_Managers as S where S.Faculty_Manager_id = ($1);",
            [id]
          );
          if(checkId.rowCount){
            Role = "faculty manager";
            resp.user.first_name = checkId.rows[0].Faculty_Manager_fname;
            resp.user.last_name = checkId.rows[0].Faculty_Manager_lname;
            resp.user.email = checkId.rows[0].Faculty_Manager_email;
            checkPass = await bcrypt.compare(password, checkId.rows[0].Faculty_Manager_password);
          }
          else{
            const checkId = await pool.query(
              "select * from Deans as S where S.Dean_id = ($1);",
              [id]
            );
            if(checkId.rowCount){
              if(checkId.rows[0].Privilege_value == 1){
                Role = "president";
              }
              else{
                Role = "dean";
              }
              resp.user.first_name = checkId.rows[0].Dean_fname;
              resp.user.last_name = checkId.rows[0].Dean_lname;
              resp.user.email = checkId.rows[0].Dean_email;
              checkPass = await bcrypt.compare(password, checkId.rows[0].Dean_password);
            }
            else{
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
    
    resp.accessToken = jwt.sign(
      { user: id,
       role: Role },
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
    if(role == "student"){
    const checkId = await pool.query(
      " select * from Students as S where S.Student_id = ($1) and S.Student_email = ($2) ;",
      [id, email]
    );

    if (!checkId.rowCount) {
      return res
        .status(404)
        .json({ message: "User not found. Please try again." });
    }}
    else{
      const checkId = await pool.query(
        "select * from Teacher as S where S.Teacher_id = ($1) and S.Teacher_email = ($2);",
        [id, email]
      );
      
      if(!checkId.rowCount){
        checkId = await pool.query(
          "select * from Department_Managers as S where S.Dep_Manager_id = ($1) and S.Dep_Manager_email = ($2);",
          [id, email]
        );
        if(!checkId.rowCount){
          checkId = await pool.query(
            "select * from Faculty_Managers as S where S.Faculty_Manager_id = ($1) and S.Faculty_Manager_email = ($2);",
            [id, email]
          );
          if(!checkId.rowCount){
            const checkId = await pool.query(
              "select * from Deans as S where S.Dean_id = ($1) and S.Dean_email = ($2);",
              [id, email]
            );
            if(!checkId.rowCount){
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

const resetPassword = async (req, res) => {
  const { req_id, password, role } = req.body;
  try {
    const thisRequest = await pool.query(
      'SELECT * FROM Reset_Requests WHERE Request_id= ($1)',
      [req_id]
    );
    const {user_id} = thisRequest.rows[0].User_id;
    if (!thisRequest.rowCount) {
      return res.status(404).json("Request not found");
    }
    const hashedPass = await bcrypt.hash(password, 10);
    if(role=="student"){
      const updateUser = await pool.query("UPDATE Students SET Student_password = ($1) WHERE Student_id = ($2);", [hashedPass, user_id]);
    }
    else{
      const checkId = await pool.query(
        "select * from Teacher as S where S.Teacher_id = ($1);",
        [user_id]
      );
      if(checkId.rowCount){
        const updateUser = await pool.query("UPDATE Teachers SET Teacher_password = ($1) WHERE Teacher_id = ($2);", [hashedPass, user_id]);
      }
      else{
        checkId = await pool.query(
          "select * from Department_Managers as S where S.Dep_Manager_id = ($1);",
          [user_id]
        );
        if(checkId.rowCount){
          const updateUser = await pool.query("UPDATE Department_Managers SET Dep_Manager_password = ($1) WHERE Dep_Manager_id = ($2);", [hashedPass, user_id]);
        }
        else{
          checkId = await pool.query(
            "select * from Faculty_Managers as S where S.Faculty_Manager_id = ($1);",
            [user_id]
          );
          if(checkId.rowCount){
            const updateUser = await pool.query("UPDATE Faculty_Managers SET Faculty_Manager_password = ($1) WHERE Faculty_Manager_id = ($2);", [hashedPass, user_id]);
          }
          else{
            const checkId = await pool.query(
              "select * from Deans as S where S.Dean_id = ($1);",
              [user_id]
            );
            if(checkId.rowCount){
              const updateUser = await pool.query("UPDATE Deans SET Dean_password = ($1) WHERE Dean_id = ($2);", [hashedPass, user_id]);
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

const changeEmail = async (req, res) => {
  try {
    const { user_id, role } = req.user;
    const { new_email } = req.body;
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
  const { user_id, role } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
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
    return res.status(200).json("Email changed");
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
