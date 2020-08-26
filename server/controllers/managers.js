const pool = require("../db/index");
const {
  CoursesByDepartment,
  DepartmentsByFacBranch,
  BranchesByFaculty,
} = require("../services/Managers");

const getBranches = async (req, res) => {
  const { user_id } = req.user.user_id;
  try {
    const getFaculty = await pool.query(
      "select Faculty_id from Dean_Faculty where Dean_id = ($1)",
      [user_id]
    );
    const branches = BranchesByFaculty(getFaculty.rows[0].Faculty_id);
    return res.status(200).json(branches);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFacultyScore = async (req, res) => {
  const { user_id } = req.user.user_id;
  const client = await pool.connect();
  try {
    const getFaculty = await client.query(
      "select Faculty_id from Dean_Faculty where Dean_id = ($1)",
      [user_id]
    );
    const getScores = await client.query(
      "select Faculty_max_votes, Faculty_real_votes, Faculty_sum_of_votes from Faculties where Faculty_id = ($1)",
      [getFaculty.rows[0].Faculty_id]
    );
    let score = (
      getScores.rows[0].Faculty_sum_of_votes /
      getScores.rows[0].Faculty_real_votes
    ).toFixed(2);
    let participation = (
      (getScores.rows[0].Faculty_real_votes /
        getScores.rows[0].Faculty_max_votes) *
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
  const { user_id } = req.user.user_id;
  try {
    const getFaculty = await pool.query(
      "select Faculty_id, Branch_id from Faculty_Branch where Faculty_manager_id = ($1)",
      [user_id]
    );
    const departments = DepartmentsByFacBranch(
      getFaculty.rows[0].Faculty_id,
      getFaculty.rows[0].Branch_id
    );
    return res.status(200).json(departments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFacultyBranchScore = async (req, res) => {
  const { user_id } = req.user.user_id;
  const client = await pool.connect();
  try {
    const getFaculty = await client.query(
      "select Faculty_id from Dean_Faculty where Dean_id = ($1)",
      [user_id]
    );
    const getScores = await client.query(
      "select Faculty_max_votes, Faculty_real_votes, Faculty_sum_of_votes from Faculties where Faculty_id = ($1)",
      [getFaculty.rows[0].Faculty_id]
    );
    let score = (
      getScores.rows[0].Faculty_sum_of_votes /
      getScores.rows[0].Faculty_real_votes
    ).toFixed(2);
    let participation = (
      (getScores.rows[0].Faculty_real_votes /
        getScores.rows[0].Faculty_max_votes) *
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
