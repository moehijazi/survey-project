const pool = require("../db/index");
const {
  CoursesByDepartment,
  DepartmentsByFacBranch,
  BranchesByFaculty,
  Faculties,
} = require("../services/Managers");

const getBranches = async (req, res) => {
  const { user_id, role } = req.user;
  let faculty_id = null;
  if (role == "president") {
    faculty_id = req.params.faculty_id;
  }
  try {
    if (role == "dean") {
      const getFaculty = await pool.query(
        "select Faculty_id from Dean_Faculty where Dean_id = ($1)",
        [user_id]
      );
      faculty_id = getFaculty.rows[0].faculty_id;
    }
    const branches = await BranchesByFaculty(faculty_id);
    return res.status(200).json(branches);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFacultyScore = async (req, res) => {
  const { user_id, role } = req.user;
  let faculty_id = null;
  if (role == "president") {
    faculty_id = req.params.faculty_id;
  }
  const client = await pool.connect();
  try {
    if (role == "dean") {
      const getFaculty = await client.query(
        "select Faculty_id from Dean_Faculty where Dean_id = ($1)",
        [user_id]
      );
      faculty_id = getFaculty.rows[0].faculty_id;
    }
    const getScores = await client.query(
      "select Faculty_max_votes, Faculty_real_votes, Faculty_sum_of_rates from Faculties where Faculty_id = ($1)",
      [faculty_id]
    );
    let score = (
      getScores.rows[0].faculty_sum_of_rates /
      getScores.rows[0].faculty_real_votes
    ).toFixed(2);
    let participation = (
      (getScores.rows[0].faculty_real_votes /
        getScores.rows[0].faculty_max_votes) *
      100
    ).toFixed(2);
    resp = { score: score, participation: participation };
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

const getDepartments = async (req, res) => {
  const { user_id, role } = req.user;
  let faculty_id, branch_id;
  if (role == "president") {
    faculty_id = req.params.faculty_id;
    branch_id = req.params.branch_id;
  } else if (role == "dean") {
    faculty_id = req.user.faculty_id;
    branch_id = req.params.branch_id;
  }
  try {
    if (role == "faculty manager") {
      const getFaculty = await pool.query(
        "select Faculty_id, Branch_id from Faculty_Branch where Faculty_manager_id = ($1)",
        [user_id]
      );
      faculty_id = getFaculty.rows[0].faculty_id;
      branch_id = getFaculty.rows[0].branch_id;
    }
    const departments = await DepartmentsByFacBranch(faculty_id, branch_id);
    return res.status(200).json(departments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCourses = async (req, res) => {
  const { role } = req.user;
  let department_id, branch_id;
  if (role != "department manager") {
    department_id = req.params.department_id;
    branch_id = req.params.branch_id;
  }
  try {
    if (role == "department manager") {
      department_id = req.user.department_id;
      branch_id = req.user.branch_id;
    }
    const courses = await CoursesByDepartment(department_id, branch_id);
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFaculties = async (req, res) => {
  const client = await pool.connect();
  try {
    let faculties = [];
    let score;
    const getFacs = await client.query("select * from Faculties as F");
    for (const faculty of getFacs.rows) {
      score = (
        faculty.faculty_sum_of_rates / faculty.faculty_real_votes
      ).toFixed(2);
      let participation = (
        (faculty.faculty_real_votes / faculty.faculty_max_votes) *
        100
      ).toFixed(2);
      console.log(score);
      faculties.push({
        faculty_id: faculty.faculty_id,
        faculty_name: faculty.faculty_name,
        faculty_score: score,
        faculty_participation: participation,
      });
    }
    return res.status(200).json(faculties);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  } finally {
    client.release();
  }
};

const getUniScore = async (req, res) => {
  try {
    let score = 0;
    let participation = 0;
    const faculties = await Faculties();
    faculties.forEach((fac) => {
      score += fac.faculty_score;
      participation += fac.faculty_participation;
    });
    score = (score / faculties.length).toFixed(2);
    participation = (participation / faculties.length).toFixed(2);
    const resp = { score: score, participation: participation };
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getFacultyBranchScore = async (req, res) => {
  const role = req.user.role;
  let faculty_id, branch_id;
  if (role == "faculty manager") {
    faculty_id = req.user.faculty_id;
    branch_id = req.user.branch_id;
  } else {
    faculty_id = req.params.faculty_id;
    branch_id = req.params.branch_id;
  }
  try {
    const deps = await DepartmentsByFacBranch(faculty_id, branch_id);
    let score = 0;
    let participation = 0;
    deps.forEach((dep) => {
      score += dep.department_score;
      participation += dep.department_participation;
    });
    score = (score / deps.length).toFixed(2);
    participation = (participation / deps.length).toFixed(2);
    resp = { score: score, participation: participation };
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getDepartmentBranchScore = async (req, res) => {
  let branch_id, department_id;
  const { role } = req.user;
  if (role != "department manager") {
    branch_id = req.params.branch_id;
    department_id = req.params.department_id;
  } else {
    branch_id = req.user.branch_id;
    department_id = req.user.department_id;
  }
  try {
    const getInfo = await pool.query(
      "select D.Dep_real_votes, D.Dep_max_votes, D.Dep_sum_of_rates from Department_Branch as D where D.Department_id =($1) and D.branch_id = ($2)",
      [department_id, branch_id]
    );
    const score = (
      getInfo.rows[0].dep_sum_of_rates / getInfo.rows[0].dep_real_votes
    ).toFixed(2);
    const participation = (
      (getInfo.rows[0].dep_real_votes / getInfo.rows[0].dep_max_votes) *
      100
    ).toFixed(2);
    resp = { score: score, participation: participation };
    return res.status(200).json(resp);
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  getBranches,
  getFacultyScore,
  getDepartments,
  getCourses,
  getFaculties,
  getUniScore,
  getFacultyBranchScore,
  getDepartmentBranchScore,
};
