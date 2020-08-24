const pool = require("../db/index");

const CoursesByDepartment = async (Department_id, Branch_id) => {
    try {
        const getCourses = await pool.query("select C.Course_code, C.Course_name, X.Section_id from Courses as C inner join (  select S.Section_id, S.Course_id from Sections as S where S.Department_id = ($1) and S.Branch_id = ($2) ) as X", [Department_id, Branch_id]);
        result = {
            course_count: getCourses.rowCount,
            courses: getCourses.rows
        }

        return result;
    } catch (error) {
        return 
    }
}