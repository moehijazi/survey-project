const jwt = require("jsonwebtoken");
const poolX = require("../db/index");

const checkAuth = async (req, res, next) => {
  const pool = await poolX.connect();
  const token = req.headers["x-auth-token"];
  if (!token)
    return res.status(401).json({ message: "Failed to authenticate" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) return res.status(500).json({ message: "Failed to authenticate" });
    const {id, role} = data;
    switch(role) {
      case "student":
        const getUser = await pool.query(
          "select * from Students as S where S.Student_id = ($1);",
          [id]
        );
        req.user = { user_id: getUser.rows[0].Student_id, branch_id: getUser.rows[0].Branch.id, department_id: getUser.rows[0].Department_id, role: role};
        break;
      case "teacher":
        const getUser = await pool.query(
          "select * from Teachers as S where S.Teacher_id = ($1);",
          [id]
        );
        req.user = { user_id: getUser.rows[0].Teacher_id, role: role};
        break;
      case "faculty manager":
        const getUser = await pool.query(
          "select * from Faculty_Managers as S where S.Faculty_manager_id = ($1);",
          [id]
        );
        req.user = { user_id: getUser.rows[0].Teacher_id, role: role};
        break;
    }

    
    next();
  });
};

module.exports = checkAuth;
