const pool = require("../db/index");

const CoursesByDepartment = async (Department_id, Branch_id) => {
  const client = await pool.connect();
  try {
    let courses = [];
    const getCourses = await client.query(
      "select C.Course_code, C.Course_name, X.Section_id from Courses as C inner join (  select S.Section_id, S.Course_id from Sections as S where S.Department_id = ($1) and S.Branch_id = ($2) ) as X using(course_id)",
      [Department_id, Branch_id]
    );
    let score, participation;
    for (const course of getCourses.rows) {
      const getDetails1 = await client.query(
        "select S.Section_total_students, S.Section_no_of_votes from Sections as S where S.Section_id = ($1)",
        [course.section_id]
      );
      const getDetails2 = await client.query(
        "select T.Section_Teacher_sum_of_rates from teaches as T where T.Section_id = ($1)",
        [course.section_id]
      );
      score = (
        getDetails2.rows[0].section_teacher_sum_of_rates /
        getDetails1.rows[0].section_no_of_votes
      ).toFixed(2);
      participation = (
        (getDetails1.rows[0].section_no_of_votes /
          getDetails1.rows[0].section_total_students) *
        100
      ).toFixed(2);
      courses.push({
        course_id: course.section_id,
        course_code: course.course_code,
        course_name: course.course_name,
        course_score: score,
        course_participation: participation,
      });
    }
    return courses;
  } catch (error) {
    return error;
  } finally {
    client.release();
  }
};

const DepartmentsByFacBranch = async (Faculty_id, Branch_id) => {
  const client = await pool.connect();
  try {
    let departments = [];
    const getDepartments = await client.query(
      "select * from Department_Branch as D where D.Branch_id = ($1)",
      [Branch_id]
    );
    for (const dep of getDepartments.rows) {
      const getDetails = await client.query(
        "select D.Department_name from Departments as D where D.Department_id = ($1) and D.Faculty_id = ($2)",
        [dep.department_id, Faculty_id]
      );
      if (getDetails.rowCount) {
        let score = (dep.dep_sum_of_rates / dep.dep_real_votes).toFixed(2);
        let participation = (
          (dep.dep_real_votes / dep.dep_max_votes) *
          100
        ).toFixed(2);
        departments.push({
          department_id: dep.department_id,
          department_name: getDetails.rows[0].department_name,
          department_score: score,
          department_participation: participation,
        });
      }
    }
    return departments;
  } catch (error) {
  } finally {
    client.release();
  }
};

const BranchesByFaculty = async (Faculty_id) => {
  const client = await pool.connect();
  try {
    let branches = [];
    const getBranches = await client.query(
      "select F.Branch_id from Faculty_Branch as F where F.Faculty_id = ($1)",
      [Faculty_id]
    );
    let getDetails, score, participation;
    for (const branch of getBranches.rows) {
      getDetails = await client.query(
        "select * from Branches as B where B.Branch_id = ($1)",
        [branch.branch_id]
      );
      score = (
        getDetails.rows[0].branch_sum_of_rates /
        getDetails.rows[0].branch_real_votes
      ).toFixed(2);
      participation = (
        (getDetails.rows[0].branch_real_votes /
          getDetails.rows[0].branch_max_votes) *
        100
      ).toFixed(2);

      branches.push({
        branch_id: branch.branch_id,
        branch_name: getDetails.rows[0].branch_name,
        branch_score: score,
        branch_participation: participation,
      });
    }
    return branches;
  } catch (error) {
  } finally {
    client.release();
  }
};

const Faculties = async () => {
  try {
    let faculties = [];
    let score = 0;
    participation = 0;
    const getInfo = await pool.query(
      "select F.Faculty_id, F.Faculty_name, F.Faculty_max_votes, F.Faculty_real_votes, F.Faculty_sum_of_rates from Faculties as F"
    );
    getInfo.rows.forEach((row) => {
      score = (row.faculty_sum_of_rates / row.faculty_real_votes).toFixed(2);
      participation = (
        (row.faculty_real_votes / row.faculty_max_votes) *
        100
      ).toFixed(2);
      faculties.push({
        faculty_id: row.faculty_id,
        faculty_name: row.faculty_name,
        faculty_score: score,
        faculty_participation: participation,
      });
    });
    return faculties;
  } catch (error) {}
};

module.exports = {
  CoursesByDepartment,
  DepartmentsByFacBranch,
  BranchesByFaculty,
  Faculties,
};
