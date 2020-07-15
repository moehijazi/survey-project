---------------------------------------------------
------------------Students------------------------
---------------------------------------------------
-- check student if exist
-- if it return a row --> then a student exist else doesn't exist
select *
from Students as S
where S.Student_id = '' and S.Student_passward = '' ;


-- to check if he can vote means to see if survey is open
-- after knowing branch and department id 
-- pass them to query below
-- after that compare them with current time 
select S.Branch_id, S.Department_id
from Students as S
where S.Student_id = '' -- pass student id here 

select D1.Start_Date, D1.End_Date
from Department_Branch as D1
where D1.Bracnh_id = '' and D1.Department_id = '' -- pass branch and deparment id


-- if a student forgets passward 
-- forgot passward check id and email
select *
from Students as S
where S.Student_id = '' and S.Student_email = '' ;

-- change email
UPDATE Students
SET Student_email = ''
WHERE Student_id = '';

-- change passward
UPDATE Students
SET Student_passward = ''
WHERE Student_id = '';


--------------query 1---------------
-- fetch student registered courses as code and name
-- this will return a table containing section id, course code and course name
-- you can use each row as a link for each course  
-- and after clicking on it, teacher names will be shown that are teaching this course
-- note: when clicking on a course it will execute query 2 below

select X.section_id, C.Course_code, C.Course_name, X.Department_id
from Courses as C inner join (  select S.Course_id, S.Section_id, S.Department_id
								from Sections as S
								where S.Section_id in ( select R.Section_id
														from registered_in as R
														where R.Student_id = '' and not R.is_voted ) -- pass here student id 
							) as X

-----------query 2--------------------
-- after executing  query 1 teacher names with their position will be displayed 
-- after clicking a teacher, the corresponding survey will be displayed
-- you should pass his position with the department of the course fetched above
-- pass them to the query 3

select T2.Teacher_fname, T2.Teacher_lname, X.Position
from Teachers as T2 inner join ( select T1.Teacher_id, T1.Position
								 from teaches as T1
								 where T1.Section_id = '') as X -- pass section id after clicking on a course code


-----------query 3-------------------
--this query will return all lists of questions for this teacher in this course
--after that the result is List_id's with their names
-- now you should make a loop that will execute query 4 as many as the number of Lists
-- each iteration will display the corresponding question with their weights in this list

select L.List_id, L.List_name
from Lists as L
where L.List_id in ( select P.List_id
					from Package_Lists as P
					where P.Package_id = (  select A.Package_id
											from Active_Packages as A
											where A.Department_id = '' and Position = '' -- pass department_id and position
											)
					)

-----------query 4 ----------------------
--this query should be executed as many as the number of lists
--just pass the list id
--it will return question id's and corresponding name in each list
-- now for each question id you should display its options using a loop

select L1.Question_id, L1.Question_weight
from List_Questions as L1
where L1.List_id = '' -- pass here List id

-- this query will return id description and no of options for a given quesiton id
-- for each list having 'n' questions this query will be executed n times
select Q.Question_id, Q.Question_description, Q.No_of_options
from Questions as Q1
where Q1.Question_id = ''

-- now we should find options for a given question id
-- this query will return that
select Q1.Option_id
from Question_Options as Q1
where Q.Question_id = '' -- pass question id here

-- now return option description for each option id
-- execute this query for that
select O1.Option_id, Option_description
from Options as O1
where O1.Option_id = '' -- pass here option id 




-- save answers for all questions
-- pass these parameters
--this should be executed for each question
insert into Answers(Teacher_id, Question_id, Student_id, Rate) values ( , , , ) -- pass here values 

-- save free text if supplied
insert into Active_Free_Texts(Teacher_id, Student_id, Section_id, Free_text) values ( , , , " ") -- pass here values 



---------------------------------------------------
------------------Teacher------------------------
---------------------------------------------------

-- check teacher if exist
select *
from Teacher as T
where T.Teacher_id = '' and T.Teacher_passward = '' ;


-- forgot passward check id and email
select *
from Teacher as T
where T.Teacher_id = '' and T.Teacher_email = '' ;

-- change email
UPDATE Teacher
SET Teacher_email = ''
WHERE Teacher_id = '';

-- change passward
UPDATE Teacher
SET Teacher_passward = ''
WHERE Teacher_id = '';


--fetch Teacher sections(name and code for each course)
-- after a teacher log in he will see list of sections he teaches 
-- this query will return for each section: course code, name and in which branch in case he teaches the same course in two or more branches
-- the result will be returned as a table 
-- each course should be a link to see statistics about it
-- just pass teacher id below
select X.Section_id, C.Course_code, C.Course_name, X.Branch_city, C.Department_id
from Courses as C inner join (  select B.Branch_city, Y.Section_id, Y.Course_id
								from Branches as B inner join ( select S.Section_id, S.Course_id, S.Branch_id
																from Sections as S
																where S.Section_id in ( select T1.Section_id
																						from teaches as T1
																						where T1.Teacher_id = '') -- pass teacher id here
																) as Y
								) as X

-- get percentage of voting for a given section by dividing total students by no of votes
-- divide these two numbers
select S.Section_total_students, S.Section_no_of_votes, S.Position
from Sections as S
where S.Section_id = '' -- pass section id here 



--this query will return all lists of questions for this teacher in this course
--after that the result is List_id's with their names
-- now you should make a loop that will execute query 4 as many as the number of Lists
-- each iteration will display the corresponding question with their weights in this list

select L.List_id, L.List_name
from Lists as L
where L.List_id in ( select P.List_id
					from Package_Lists as P
					where P.Package_id = (  select A.Package_id
											from Active_Packages as A
											where A.Department_id = '' and Position = '' -- pass department_id and position
											)
					)

-----------query 4 ----------------------
--this query should be executed as many as the number of lists
--just pass the list id
--it will return question id's and corresponding name in each list
-- now for each question id you should display its options using a loop

select L1.Question_id, L1.Question_weight
from List_Questions as L1
where L1.List_id = '' -- pass here List id

-- this query will return id description and no of options for a given quesiton id
-- for each list having 'n' questions this query will be executed n times
select Q.Question_id, Q.Question_description, Q.No_of_options
from Questions as Q1
where Q1.Question_id = ''

-- now we should find options for a given question id
-- this query will return that
select Q1.Option_id
from Question_Options as Q1
where Q.Question_id = '' -- pass question id here

-- now return option description for each option id
-- execute this query for that
select O1.Option_id, Option_description
from Options as O1
where O1.Option_id = '' -- pass here option id 


-- to get rate for a specific answer 
select A.Rate
from Answers as A
where A.Teacher_id = '' and A.Section_id = '' and A.Question_id = ''

-- to get free texts for a section 
select A.Free_text
from Active_Free_Texts as A
where A.Teacher_id = '' and A.Section_id = ''

-- get total sum of rate for a teacher in a section
select T.Section_Teacher_sum_of_rates
from teaches as T
where T.Teacher_id = ''

-- get no of votes in a section
select S.Section_no_of_votes
from Sections as S
where S.Section_id  = ''  -- pass here section id 												
												
-- divide theses two numbers to get average rate

---------------------------------------------------
------------------Dean------------------------
---------------------------------------------------

-- check dean if exist
select *
from Deans as D
where D.Dean_id = '' and D.Dean_passward = '' ;


-- forgot passward check id and email
select *
from Dean as D
where D.Dean_id = '' and D.Dean_email = '' ;

-- change email
UPDATE Dean
SET Dean_email = ''
WHERE Dean_id = '';

-- change passward
UPDATE Dean
SET Dean_passward = ''
WHERE Dean_id = '';


--fetch list of faculties for a dean 
-- you should display this list of faculties as links 
-- after clicking on each you should save that faculty id and pass it to queries below
select F.Faculty_id, F.Faculty_name
from Dean_Faculty as F
where F.Dean_id = '' -- pass dean id here


-- to see statistics about a faculty
--execute this query
-- you can get percentage of voting by dividing real votes by sum of votes
-- you can get rate for a faculty by dividing sum of rates by real votes
select F.Faculty_total_students, F.Faculty_max_votes, F.Faculty_real_votes, F.Faculty_sum_of_rates
from Faculties as F
where F.Faculty_id = '' -- pass here faculty id


--fetch list of departments for a given faculty(id with name)
-- when he click a faculty before you will display list of departments 
select D.Department_id, D.Department_name
from Departments as D
where D.Faculty_id = '' -- pass chosen faculty id saved before


--fetch list of branches containing these departments
select B.Branch_id, B.Branch_city
from Branches as B
where B.Branch_id in (  select D1.Branch_id
						from Department_Branch as D1
						where D1.Department_id = '' -- pass department id here
						)


-- to see statistics about a department in branch
--execute this query
-- you can get percentage of voting by dividing real votes by sum of votes
-- you can get rate for a department in a branch by dividing sum of rates by real votes
select D1.Dep_total_students, D1.Dep_max_votes, D1.Dep_real_votes, D1.Dep_sum_of_rates
from Department_Branch as D1
where D1.Department_id = '' and D1.Branch_id = '' -- pass department and branch id here 



--fetch courses for given department and branch
-- this will display list of courses 
-- when he click on a course he will see result of it 
-- you should pass Section id to the next query
select C.Course_code, C.Course_name, X.Section_id
from Courses as C inner join (  select S.Section_id, S.Course_id
								from Sections as S
								where S.Department_id = '' and S.Branch_id = '' -- pass here department and branch id
								) as X


-- to get percentage of voting divide these below
-- also you can get no of teachers
select S.Section_total_students, S.Section_no_of_votes, S.Section_No_of_teachers
from Sections as S
where S.Section_id = '' -- pass here section id
						
-- if he wants to see statistics about each teacher		
-- divide sum of rate for each teacher with no of votes to get average rate						
select T2.Teacher_fname, T2.Teacher_lname, X.Teacher_id, X.Position, X.Section_Teacher_sum_of_rates
from Teachers as T2 inner join (select T1.Teacher_id, T1.Position, T1.Section_Teacher_sum_of_rates
								from teaches as T1
								where S.Section_id = '' -- pass here section id
								) as X
						


-- to add new question
insert into Questions(Question_description, Question_No_of_options) values ( , ) -- pass here 

-- to add option for a question 
insert into Question_Options(Option_id) values ( ) --  pass here

-- to add new option
insert into Options(Option_description) values ( ) -- pass here 

-- to create a list of questions
-- give it a name and a description
insert into Lists(List_name, List_description) values ( , ) -- pass here 

-- to add questions to Lists 
-- pass list id with question id 
insert into List_Questions(List_id, Question_id, Question_weight) values ( , , ) --  pass here 

						
-- to add new package
insert into Packages(Package_name, Package_description, Dean_id) values ( , , ) -- pass here 

-- to add lists to a package
insert into Package_Lists(Package_id, List_id) values ( , ) --  pass here 

-- to activate a package
-- only head of deans can do it (ra2es lgam3a)
-- for each department with all positions available in this department should take a package
-- otherwise there will be problem in fetching surveys if not exist
insert into Active_Packages(Department_id, Position, Package_id) values( , , ) -- pass here 


---------------------------------------------------
------------------Department Manager-----------------
---------------------------------------------------

-- check dep manager if exist
select *
from Department_Managers as M
where M.Dep_Manager_id = '' and M.Dep_Manager_passward = '' ;


-- forgot passward check id and email
select *
from Department_Managers as M
where M.Dep_Manager_id = '' and M.Dep_Manager_email = '' ;

-- change email
UPDATE It_Managers
SET Dep_Manager_email = ''
WHERE Dep_Manager_id = '';

-- change passward
UPDATE It_Managers
SET Dep_Manager_passward = ''
WHERE Dep_Manager_id= '';

-- to know his deparment and branch
select D1.Department_id, D1.Bracnh_id
from Department_Branch as D1
where D1.Dep_Manager_id = ''



-- to see statistics about his department
-- execute this query
-- you can get percentage of voting by dividing real votes by sum of votes
-- you can get rate for a department in a branch by dividing sum of rates by real votes
select D1.Dep_total_students, D1.Dep_max_votes, D1.Dep_real_votes, D1.Dep_sum_of_rates
from Department_Branch as D1
where D1.Department_id = '' and D1.Branch_id = '' -- pass department and branch id here 


---------------------------------------------------
------------------Faculty Manager-----------------
---------------------------------------------------

-- check dep manager if exist
select *
from Faculty_Managers as M
where M.Faculty_manager_id = '' and  M.Faculty_manager_passward = '' ;


-- forgot passward check id and email
select *
from Faculty_Managers as M
where  M.Faculty_manager_id = '' and  M.Faculty_manager_email = '' ;

-- change email
UPDATE Faculty_Managers
SET Faculty_manager_email = ''
WHERE Faculty_manager_id = '';

-- change passward
UPDATE Faculty_Managers
SET Faculty_manager_passward = ''
WHERE Faculty_manager_id= '';

-- to know his branch id
select M.Bracnh_id
from Faculty_Branch as M
where  M.Faculty_manager_id = ''



-- to see statistics about his branch
-- execute this query
-- you can get percentage of voting by dividing real votes by sum of votes
-- you can get rate for a branch by dividing sum of rates by real votes
select B.Branch_total_students, B.Branch_max_votes, B.Branch_real_votes, B.Branch_sum_of_rates
from Branches as B
where B.Branch_id = '' -- pass branch id here 


---------------------------------------------------
------------------IT Manager------------------------
---------------------------------------------------

-- check it manager if exist
select *
from It_Managers as M
where M.It_manager_id = '' and M.It_manager_passward = '' ;


-- forgot passward check id and email
select *
from It_Managers as M
where M.It_manager_id = '' and M.It_manager_email = '' ;

-- change email
UPDATE It_Managers
SET It_manager_email = ''
WHERE It_manager_id = '';

-- change passward
UPDATE It_Managers
SET It_manager_passward = ''
WHERE It_manager_id= '';



-- to see a log if a student wants to see if someone views his free_Text
-- based on his id we can see if it exists in Logs
select L.Log_id, L.Free_Text
from Logs as L
where L.Student_id = '' -- pass here student id















