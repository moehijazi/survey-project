const pool = require("../db/index");

const CoursesByDepartment = async (Department_id, Branch_id) => {
    const client = await pool.connect();
    try {
        let courses = [];
        const getCourses = await pool.query("select C.Course_code, C.Course_name, X.Section_id from Courses as C inner join (  select S.Section_id, S.Course_id from Sections as S where S.Department_id = ($1) and S.Branch_id = ($2) ) as X", [Department_id, Branch_id]);
        getCourses.rows.forEach(course => {
            const getDetails1 = await pool.query("select S.Section_total_students, S.Section_no_of_votes from Sections as S where S.Section_id = ($1)",[course.Section_id]);
            const getDetails2 = await pool.query("select T.Section_Teacher_sum_of_rates from teaches as T where T.Section_id = ($1)", [course.Section_id]);
            let score = (getDetails2.rows[0].Section_Teacher_sum_of_rates / getDetails1.Section_no_of_votes).toFixed(2);
            let participation = ((getDetails1.Section_no_of_votes / getDetails1.Section_total_students) * 100).toFixed(2);
            courses.push({course_id: course.Section_id, course_code: course.Course_code, course_name: course.Course_name, course_score: score, couese_participation: participation});
        });
        return courses;
        
    } catch (error) {
        return error;
    }finally {
        client.release();
    }
}

const DepartmentsByFacBranch = async (Faculty_id, Branch_id) => {
    const client = await pool.connect();
    try {
        let departments = [];
        const getDepartments = await client.query("select * from Department_Branch as D where D.Branch_id = ($1)", [Branch_id]);
        getDepartments.rows.forEach(dep => {
            const getDetails = await client.query("select D.Department_name from Departments as D where D.Department_id = ($1) and D.Faculty_id = ($2)", [dep.Department_id,Faculty_id]);
            if(getDetails.rowCount){
                let score = (dep.Dep_sum_of_rates / dep.Dep_real_votes).toFixed(2);
                let participation = ((dep.Dep_real_votes / dep.Dep_max_votes) * 100).toFixed(2);
                departments.push({department_id: dep.Department_id, department_name: getDetails.rows[0].Department_name, department_score: score, department_participation:participation});}
        });

        return departments;

    } catch (error) {
        
    } finally {
        client.release();
    }
}

const BranchesByFaculty = async (Faculty_id) => {
    const client = await pool.connect();
    try {
        let branches =[];
        const getBranches = await client.query("select F.Branch_id from Faculty_Branch as F where F.Faculty_id = ($1)", [Faculty_id]);
        getBranches.rows.forEach(branch => {
            const getDetails = await client.query("select * from Branches as B where B.Branch_id = ($1)", branch.Branch_id);
            let score = (getDetails.rows[0].Branch_sum_of_rates / getDetails.rows[0].Branch_real_votes).toFixed(2) ;
            let participation = ((getDetails.rows[0].Branch_real_votes / getDetails.rows[0].Branch_max_votes) * 100 ).toFixed(2);
            branches.push({branch_id: branch.Branch_id, branch_name: getDetails.rows[0].Branch_name, branch_score: score, branch_participation: participation});
        });
        return branches;
    } catch (error) {
        
    } finally {
        client.release();
    }
}

const Faculties = async () => {
    try {
        let faculties = [];
        let  score = 0; participation = 0;
        const getInfo = await pool.query("select F.Faculty_id, F.Faculty_name, F.Faculty_max_votes, F.Faculty_real_votes, F.Faculty_sum_of_rates from Faculties as F");
    getInfo.rows.forEach(row => {
      score = (row.Faculty_sum_of_rates / row.Faculty_real_votes).toFixed(2);
      participation = ((row.Faculty_real_votes / row.Faculty_max_votes) * 100).toFixed(2);
      faculties.push({faculty_id: row.Faculty_id, faculty_name: row.Faculty_name, faculty_score: score, faculty_participation: participation});
    });
    return faculties;
    } catch (error) {
        
    }
}

module.exports = {CoursesByDepartment, DepartmentsByFacBranch, BranchesByFaculty, Faculties};