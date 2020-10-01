----------------------------------------------------------
-- this procedure insert a student in students table
----------------------------------------------------------
create procedure insert_student(in student_id int,
								in student_fname varchar(100),
								in student_lname varchar(100),
								in student_email varchar(100),
								in branch_id int,
								in department_id int)								
as $$
begin
insert into Students(Student_id, Student_fname, Student_lname, Student_email, Branch_id, Department_id)
					values(student_id, student_fname, student_lname, student_email, branch_id, department_id);

update Branches
		set Branch_total_students = Branch_total_students + 1
		where Branch_id = branch_id;
		
		update Department_Branch
		set Dep_total_students = Dep_total_students + 1
		where Branch_id = branch and Department_id = department;

		update Faculities
		set Faculty_total_students = Faculty_total_students + 1
		where Faculty_id = (select D.Faculty_id
							from Departments as D
							where D.Department_id = department_id 
							); 
commit;
$$

-- calling procedure
call insert_student(89599, 'ahmad', 'rami', 'ahmad.rami@gmail.com', 2, 4);