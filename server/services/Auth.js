const jwt = require("jsonwebtoken");
const poolX = require("../db/index");

const checkAuth = async (req, res, next) => {
  const pool = await poolX.connect();
  const token = req.headers["x_auth_token"];
  if (!token)
    return res.status(401).json({ message: "Failed to authenticate" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
    if (err) return res.status(500).json({ message: "Failed to authenticate" });
    const { id, role } = data;
    switch (role) {
      case "student":
        const getUser = await pool.query(
          "select * from Students as S where S.Student_id = ($1);",
          [id]
        );
        req.user = {
          user_id: getUser.rows[0].Student_id,
          branch_id: getUser.rows[0].Branch.id,
          department_id: getUser.rows[0].Department_id,
          role: role,
        };
        break;
      case "teacher":
        getUser = await pool.query(
          "select * from Teachers as S where S.Teacher_id = ($1);",
          [id]
        );
        req.user = { user_id: getUser.rows[0].Teacher_id, role: role };
        break;
      case "department manager":
        getUser = await pool.query(
          "select S.Branch_id, S.Department_id from Department_Branch as S where S.Dep_Manager_id = ($1);",
          [id]
        );
        req.user = {
          user_id: id,
          role: role,
          branch_id: getUser.rows[0].Branch_id,
          department_id: getUser.rows[0].Department_id,
        };
        break;
      case "faculty manager":
        getUser = await pool.query(
          "select F.Branch_id, F.Faculty_id from Faculty_Branch as F where F.Faculty_Manager_id = ($1);",
          [id]
        );
        req.user = {
          user_id: id,
          role: role,
          faculty_id: getUser.rows[0].Faculty_id,
          branch_id: getUser.rows[0].Branch_id,
        };
        break;
      case "dean":
        getUser = await pool.query(
          "select D.Faculty_id from Dean_Faculty as D where D.Dean_id = ($1);",
          [id]
        );
        req.user = {
          user_id: id,
          role: role,
          faculty_id: getUser.rows[0].Faculty_id,
        };
        break;

      case "president":
        req.user = {
          user_id: id,
          role: role,
        };
        break;
    }

    next();
  });
};

module.exports = checkAuth;
