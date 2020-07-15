-------------------transaction 1 ---------------------
------------------------------------------------------
-- this transaction for inserting new students into database
-- if a student exist only update personal info
-- otherwise add student to database and increment total students in his
-- own department, branch and faculty

-- we can make interface for adding students but this would be difficult to add
-- large number of students so we have another idea that is each faculty manager 
-- prepare an excel file for his students and upload this file to website
-- then you can write code that can read from this file row by row and execute the below transaction 
--------------------------------------------------------
begin;
	--check if student exists in database
	-- if exist update his info
	-- else insert into database and increment total students in branch, department and faculty for him
	IF EXISTS (select * from Students where Student_id = '') -- pass student id here 
		update Students
		set Student_fname = '', Student_lname = '', Student_email = '', Branch_id = '', Department_id = ''
		where Student_id = ''; -- pass student id here 
		
	ELSE (
		insert into Students(Student_id, Student_fname, Student_lname, Student_email, Branch_id, Department_id)
					values('' ,'' ,'' ,'' ,'' ,'' ); -- pass here values
					
		update Branches
		set Branch_total_students = Branch_total_students + 1
		where Branch_id = ''; -- pass here branch id
		
		update Department_Branch
		set Dep_total_students = Dep_total_students + 1
		where Branch_id = '' and Department_id = ''; -- pass here branch and department id
				
		update Faculities
		set Faculty_total_students = Faculty_total_students + 1
		where Faculty_id = (select D.Faculty_id
							from Departments as D
							where D.Department_id = ''; -- pass here branch id
							);		
		)		
commit;


------------------transaction 2------------------
-- this transaction after registering a student in a section
-----------------------------------------------------
begin;
	insert into registered_in(Student_id, Section_id, Course_id, is_voted, Vote_date, Vote_time)
					   values( 	   , 		, 		, false ,	null ,	 null) -- pass student id section id and course id
	
	update Sections
	set Section_total_students = Section_total_students + 1
	where Section_id = ''; -- pass here section id
	
	declare @no_of_teachers smallint;
	
	select S.No_of_teachers
	into @no_of_teachers
	from Sections as S
	where S.Section_id = '';  -- pass here student id
	
	-- add to max votes in branch, department and faculty the number of teaches 
	-- because each student is considered voting for each teacher and giving him rate 
	-- so for each teacher increment 1 max votes
	
	update Branches
	set Branch_max_votes = Branch_max_votes + @no_of_teachers
	where Branch_id = ''; -- pass here branch id
		
	update Department_Branch
	set Dep_max_votes = Dep_max_votes + @no_of_teachers
	where Branch_id = '' and Department_id = ''; -- pass here branch and department id
				
	update Faculities
	set Faculty_max_votes = Faculty_max_votes + @no_of_teachers
	where Faculty_id = (select D.Faculty_id
						from Departments as D
						where D.Department_id = ''; -- pass here department id
						);		
		)	
commit;


------------------transaction 3 -----------------------
-------------------------------------------------------
-- this transaction for a student voting on a course for all teachers
----------------------------------------------------------------	
begin;
	update registered_in
	set is_voted = true, Vote_data = '' , Vote_time = '' -- pass here vote_data and vote_time	
	where Student_id = ''; -- pass here student id
	
	declare @no_of_teachers smallint;
	
	select S.No_of_teachers
	into @no_of_teachers
	from Sections as S
	where S.Section_id = '';  -- pass here student id
	
	-- for loop to increment rate for each student 
	for i in 1..@no_of_teachers loop
		update teaches
		set Section_Teacher_sum_rates = Section_Teacher_sum_rates + '' -- pass here his rate for this teacher
		where Student_id = '' and Teacher_id = ''; -- pass here student and teacher id's
	end loop;
	
	update Sections
	set Section_no_of_votes = Section_no_of_votes + 1
	where Section_id = ''; -- pass here section id
	
	update Branches
	set Branch_real_votes = Branch_real_votes + @no_of_teachers,
		Branch_sum_of_rates = Branch_sum_of_rates + '' -- pass here the sum of rate for this student on all teachers of one course
	where Branch_id = ''; -- pass here branch id
		
	update Department_Branch
	set Dep_real_votes = Dep_real_votes + @no_of_teachers,
		Dep_sum_of_rates = Dep_sum_of_rates + '' -- pass here the sum of rate for this student on all teachers of one course
	where Branch_id = '' and Department_id = ''; -- pass here branch and department id
				
	update Faculities
	set Faculty_real_votes = Faculty_real_votes + @no_of_teachers,
		Faculty_sum_of_rates = Faculty_sum_of_rates + '' -- pass here the sum of rate for this student on all teachers of one course
	where Faculty_id = (select D.Faculty_id
						from Departments as D
						where D.Department_id = ''; -- pass here department id
						);		
		)	

commit;


