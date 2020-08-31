/*==============================================================*/
/* DBMS name:      PostgreSQL 9.x                               */
/* Created on:     7/4/2020 9:25:34 PM                          */
/*==============================================================*/


drop table ACTIVE_FREE_TEXTS;

drop index ACTIVE_PACKAGE_INDEX;

drop table ACTIVE_PACKAGES;

drop index SECTION_ANSWER_INDEX;

drop index TEACHER_ANSWER_INDEX;

drop index ANSWER_INDEX;

drop table ANSWERS;

drop table BRANCHES;

drop index COURSE_INDEX;

drop table COURSES;

drop table DEANS;

drop table DEAN_FACULTY;

drop table DEPARTMENTS;

drop table DEPARTMENT_BRANCH;

drop table DEPARTMENT_MANAGERS;

drop table FACULITIES;

drop table FACULTY_BRANCH;

drop table FACULTY_MANAGERS;

drop index COURSE_FT_ARCHIVE_INDEX;

drop index TEACHER_FT_ARCHIVE_INDEX;

drop index STUDENT_FT_ARCHIVE_INDEX;

drop table FREE_TEXTS_ARCHIVE;

drop table IT_MANAGERS;

drop index LIST_INDEX;

drop table LISTS;

drop index LIST2_INDEX;

drop index QUESTION3_INDEX;

drop table LIST_QUESTIONS;

drop index COURSE_LOGS_INDEX;

drop index TEACHER_LOGS_INDEX;

drop index STUDENT_LOGS_INDEX;

drop index LOG_INDEX;

drop table LOGS;

drop index OPTION_INDEX;

drop table OPTIONS;

drop index PACKAGE_INDEX;

drop table PACKAGES;

drop index LIST3_INDEX;

drop index PACKAGE2_INDEX;

drop table PACKAGE_LISTS;

drop index POSITION_INDEX;

drop table POSITIONS;

drop table PRIVILEGES;

drop index QUESTION_INDEX;

drop table QUESTIONS;

drop index QUESTION2_INDEX;

drop index OPTION2_INDEX;

drop table QUESTION_OPTIONS;

drop index TEACHER_RATE_ARCHIVE_INDEX;

drop index ARCHIVE_RATE_INDEX;

drop table RATES_ARCHIVE;

drop index REGISTERED_IN_STUDENT_INDEX;

drop table REGISTERED_IN;

drop index REQUEST_INDEX;

drop table RESET_REQUESTS;

drop index DEPARTMENT_INDEX;

drop index BRANCH_INDEX;

drop index SECTION_INDEX;

drop table SECTIONS;

drop index STUDENT_INDEX;

drop table STUDENTS;

drop index TEACHER_INDEX;

drop table TEACHERS;

drop index TEACHER_DEPARTMENT_INDEX;

drop table TEACHER_DEPARTMENT;

drop index TEACHES_SECTOIN_INDEX;

drop index TEACHES_TEACHER_INDEX;

drop table TEACHES;

drop sequence SEQUENCE_1;

drop sequence SEQUENCE_2;

drop user USER_1;

/*==============================================================*/
/* User: USER_1                                                 */
/*==============================================================*/
create user USER_1;

create sequence SEQUENCE_1;

create sequence SEQUENCE_2;

/*==============================================================*/
/* Table: ACTIVE_FREE_TEXTS                                     */
/*==============================================================*/
create table ACTIVE_FREE_TEXTS
(
   ACTIVE_FT_ID SERIAL not null,
   TEACHER_ID NUMERIC(8) not null,
   STUDENT_ID NUMERIC(8) not null,
   SECTION_ID INT4 null,
   FREE_TEXT VARCHAR(500) not null,
   constraint PK_ACTIVE_FREE_TEXTS primary key (ACTIVE_FT_ID)
);

/*==============================================================*/
/* Table: ACTIVE_PACKAGES                                       */
/*==============================================================*/
create table ACTIVE_PACKAGES
(
   DEPARTMENT_ID NUMERIC(5) not null,
   "POSITION" VARCHAR(20) not null,
   PACKAGE_ID INT4 not null,
   constraint PK_ACTIVE_PACKAGES primary key (DEPARTMENT_ID, "POSITION")
);

/*==============================================================*/
/* Index: ACTIVE_PACKAGE_INDEX                                  */
/*==============================================================*/
create unique index ACTIVE_PACKAGE_INDEX on ACTIVE_PACKAGES using HASH
(
DEPARTMENT_ID,
"POSITION"
);

/*==============================================================*/
/* Table: ANSWERS                                               */
/*==============================================================*/
create table ANSWERS
(
   ANSWER_ID SERIAL not null,
   TEACHER_ID NUMERIC(8) not null,
   QUESTION_ID INT4 not null,
   STUDENT_ID NUMERIC(8) not null,
   SECTION_ID INT4 null,
   RATE SI(1) not null,
   constraint PK_ANSWERS primary key (ANSWER_ID)
);

/*==============================================================*/
/* Index: ANSWER_INDEX                                          */
/*==============================================================*/
create unique index ANSWER_INDEX on ANSWERS using HASH
(
ANSWER_ID
);

/*==============================================================*/
/* Index: TEACHER_ANSWER_INDEX                                  */
/*==============================================================*/
create  index TEACHER_ANSWER_INDEX on ANSWERS using HASH
(
TEACHER_ID
);

/*==============================================================*/
/* Index: SECTION_ANSWER_INDEX                                  */
/*==============================================================*/
create  index SECTION_ANSWER_INDEX on ANSWERS using HASH
(
SECTION_ID
);

/*==============================================================*/
/* Table: BRANCHES                                              */
/*==============================================================*/
create table BRANCHES
(
   BRANCH_ID NUMERIC(3) not null,
   BRANCH_CITY VARCHAR(30) not null,
   BRANCH_TOTAL_STUDENTS NUMERIC(10) not null,
   BRANCH_MAX_VOTES NUMERIC(10) not null,
   BRANCH_REAL_VOTES NUMERIC(10) not null,
   BRANCH_SUM_OF_RATES DECIMAL(10,2) not null,
   constraint PK_BRANCHES primary key (BRANCH_ID)
);

/*==============================================================*/
/* Table: COURSES                                               */
/*==============================================================*/
create table COURSES
(
   COURSE_ID SERIAL not null,
   COURSE_CODE VARCHAR(20) not null,
   COURSE_NAME VARCHAR(30) not null,
   DEPARTMENT_ID NUMERIC(5) not null,
   constraint PK_COURSES primary key (COURSE_ID)
);

/*==============================================================*/
/* Index: COURSE_INDEX                                          */
/*==============================================================*/
create unique index COURSE_INDEX on COURSES using HASH
(
COURSE_ID
);

/*==============================================================*/
/* Table: DEANS                                                 */
/*==============================================================*/
create table DEANS
(
   DEAN_ID NUMERIC(8) not null,
   PRIVILEGE_VALUE NUMERIC(1) not null,
   DEAN_FNAME VARCHAR(20) not null,
   DEAN_LNAME VARCHAR(20) not null,
   DEAN_PASSWARD VARCHAR(20) not null,
   DEAN_EMAIL VARCHAR(50) not null,
   constraint PK_DEANS primary key (DEAN_ID)
);

/*==============================================================*/
/* Table: DEAN_FACULTY                                          */
/*==============================================================*/
create table DEAN_FACULTY
(
   FACULTY_ID NUMERIC(3) not null,
   DEAN_ID NUMERIC(8) not null,
   constraint PK_DEAN_FACULTY primary key (FACULTY_ID, DEAN_ID)
);

/*==============================================================*/
/* Table: DEPARTMENTS                                           */
/*==============================================================*/
create table DEPARTMENTS
(
   DEPARTMENT_ID NUMERIC(5) not null,
   DEPARTMENT_NAME VARCHAR(40) not null,
   FACULTY_ID NUMERIC(3) not null,
   constraint PK_DEPARTMENTS primary key (DEPARTMENT_ID)
);

/*==============================================================*/
/* Table: DEPARTMENT_BRANCH                                     */
/*==============================================================*/
create table DEPARTMENT_BRANCH
(
   BRANCH_ID NUMERIC(3) not null,
   DEPARTMENT_ID NUMERIC(5) not null,
   DEP_MANAGER_ID NUMERIC(8) null,
   DEP_TOTAL_STUDENTS NUMERIC(10) not null,
   DEP_MAX_VOTES NUMERIC(10) not null,
   DEP_REAL_VOTES NUMERIC(10) not null,
   DEP_SUM_OF_RATES DECIMAL(10,2) not null,
   START_DATE DATE not null,
   END_DATE DATE not null,
   constraint PK_DEPARTMENT_BRANCH primary key (BRANCH_ID, DEPARTMENT_ID)
);

/*==============================================================*/
/* Table: DEPARTMENT_MANAGERS                                   */
/*==============================================================*/
create table DEPARTMENT_MANAGERS
(
   DEP_MANAGER_ID NUMERIC(8) not null,
   PRIVILEGE_VALUE NUMERIC(1) not null,
   DEP_MANAGER_FNAME VARCHAR(20) not null,
   DEP_MANAGER_LNAME VARCHAR(20) not null,
   DEP_MANAGER_PASSWARD VARCHAR(20) not null,
   DEP_MANAGER_EMAIL VARCHAR(50) not null,
   constraint PK_DEPARTMENT_MANAGERS primary key (DEP_MANAGER_ID)
);

/*==============================================================*/
/* Table: FACULITIES                                            */
/*==============================================================*/
create table FACULITIES
(
   FACULTY_ID NUMERIC(3) not null,
   FACULTY_NAME VARCHAR(40) not null,
   FACULTY_TOTAL_STUDENTS NUMERIC(10) not null,
   FACULTY_MAX_VOTES NUMERIC(10) not null,
   FACULTY_REAL_VOTES NUMERIC(10) not null,
   FACULTY_SUM_OF_RATES DECIMAL(10,2) not null,
   constraint PK_FACULITIES primary key (FACULTY_ID)
);

/*==============================================================*/
/* Table: FACULTY_BRANCH                                        */
/*==============================================================*/
create table FACULTY_BRANCH
(
   BRANCH_ID NUMERIC(3) not null,
   FACULTY_ID NUMERIC(3) not null,
   FACULTY_MANAGER_ID NUMERIC(8) not null,
   constraint PK_FACULTY_BRANCH primary key (FACULTY_ID, BRANCH_ID)
);

/*==============================================================*/
/* Table: FACULTY_MANAGERS                                      */
/*==============================================================*/
create table FACULTY_MANAGERS
(
   FACULTY_MANAGER_ID NUMERIC(8) not null,
   FACULTY_MANAGER_FNAME VARCHAR(20) not null,
   FACULTY_MANAGER_LNAME VARCHAR(20) not null,
   FACULTY_MANAGER_PASSWARD VARCHAR(20) not null,
   FACULTY_MANAGER_EMAIL VARCHAR(50) not null,
   PRIVILEGE_VALUE NUMERIC(1) not null,
   constraint PK_FACULTY_MANAGERS primary key (FACULTY_MANAGER_ID)
);

/*==============================================================*/
/* Table: FREE_TEXTS_ARCHIVE                                    */
/*==============================================================*/
create table FREE_TEXTS_ARCHIVE
(
   ARCHIVE_FT_ID SERIAL not null,
   TEACHER_ID NUMERIC(8) not null,
   "POSITION" VARCHAR(20) not null,
   STUDENT_ID NUMERIC(8) not null,
   COURSE_ID INT4 not null,
   BRANCH_ID NUMERIC(3) not null,
   DEPARTMENT_ID NUMERIC(5) null,
   FREE_TEXT VARCHAR(500) not null,
   constraint PK_FREE_TEXTS_ARCHIVE primary key (ARCHIVE_FT_ID)
);

/*==============================================================*/
/* Index: STUDENT_FT_ARCHIVE_INDEX                              */
/*==============================================================*/
create  index STUDENT_FT_ARCHIVE_INDEX on FREE_TEXTS_ARCHIVE using HASH
(
STUDENT_ID
);

/*==============================================================*/
/* Index: TEACHER_FT_ARCHIVE_INDEX                              */
/*==============================================================*/
create  index TEACHER_FT_ARCHIVE_INDEX on FREE_TEXTS_ARCHIVE using HASH
(
TEACHER_ID
);

/*==============================================================*/
/* Index: COURSE_FT_ARCHIVE_INDEX                               */
/*==============================================================*/
create  index COURSE_FT_ARCHIVE_INDEX on FREE_TEXTS_ARCHIVE using HASH
(
COURSE_ID
);

/*==============================================================*/
/* Table: IT_MANAGERS                                           */
/*==============================================================*/
create table IT_MANAGERS
(
   IT_MANAGER_ID NUMERIC(8) not null,
   IT_MANAGER_FNAME VARCHAR(20) not null,
   IT_MANAGER_LNAME VARCHAR(20) not null,
   IT_MANAGER_PASSWARD VARCHAR(20) not null,
   IT_MANAGER_EMAIL VARCHAR(50) not null,
   constraint PK_IT_MANAGERS primary key (IT_MANAGER_ID)
);

/*==============================================================*/
/* Table: LISTS                                                 */
/*==============================================================*/
create table LISTS
(
   LIST_ID SERIAL not null,
   LIST_NAME VARCHAR(30) not null,
   LIST_DESCRIPTION VARCHAR(50) not null,
   constraint PK_LISTS primary key (LIST_ID)
);

/*==============================================================*/
/* Index: LIST_INDEX                                            */
/*==============================================================*/
create unique index LIST_INDEX on LISTS using HASH
(
LIST_ID
);

/*==============================================================*/
/* Table: LIST_QUESTIONS                                        */
/*==============================================================*/
create table LIST_QUESTIONS
(
   LIST_ID INT4 not null,
   QUESTION_ID INT4 not null,
   QUESTION_WEIGHT DECIMAL(2,1) not null,
   constraint PK_LIST_QUESTIONS primary key (LIST_ID, QUESTION_ID)
);

/*==============================================================*/
/* Index: QUESTION3_INDEX                                       */
/*==============================================================*/
create  index QUESTION3_INDEX on LIST_QUESTIONS (
QUESTION_ID
);

/*==============================================================*/
/* Index: LIST2_INDEX                                           */
/*==============================================================*/
create  index LIST2_INDEX on LIST_QUESTIONS using HASH
(
LIST_ID
);

/*==============================================================*/
/* Table: LOGS                                                  */
/*==============================================================*/
create table LOGS
(
   LOG_ID INT4 not null,
   STUDENT_ID NUMERIC(8) not null,
   COURSE_ID INT4 not null,
   DEPARTMENT_ID NUMERIC(5) not null,
   TEACHER_ID NUMERIC(8) not null,
   LOG_DATE DATE not null,
   LOG_TIME TIME not null,
   REASON VARCHAR(100) not null,
   YEAR NUMERIC(4) not null,
   SEMESTER VARCHAR(10) not null,
   FREE_TEXT VARCHAR(500) not null,
   constraint PK_LOGS primary key (LOG_ID)
);

/*==============================================================*/
/* Index: LOG_INDEX                                             */
/*==============================================================*/
create unique index LOG_INDEX on LOGS using HASH
(
LOG_ID
);

/*==============================================================*/
/* Index: STUDENT_LOGS_INDEX                                    */
/*==============================================================*/
create  index STUDENT_LOGS_INDEX on LOGS using HASH
(
STUDENT_ID
);

/*==============================================================*/
/* Index: TEACHER_LOGS_INDEX                                    */
/*==============================================================*/
create  index TEACHER_LOGS_INDEX on LOGS using HASH
(
TEACHER_ID
);

/*==============================================================*/
/* Index: COURSE_LOGS_INDEX                                     */
/*==============================================================*/
create  index COURSE_LOGS_INDEX on LOGS using HASH
(
COURSE_ID
);

/*==============================================================*/
/* Table: OPTIONS                                               */
/*==============================================================*/
create table OPTIONS
(
   OPTION_ID SERIAL not null,
   OPTION_DESCRIPTION VARCHAR(50) not null,
   constraint PK_OPTIONS primary key (OPTION_ID)
);

/*==============================================================*/
/* Index: OPTION_INDEX                                          */
/*==============================================================*/
create unique index OPTION_INDEX on OPTIONS using HASH
(
OPTION_ID
);

/*==============================================================*/
/* Table: PACKAGES                                              */
/*==============================================================*/
create table PACKAGES
(
   PACKAGE_ID SERIAL not null,
   PACKAGE_NAME VARCHAR(30) not null,
   PACKAGE_DESCRIPTION VARCHAR(50) not null,
   DEAN_ID NUMERIC(8) not null,
   constraint PK_PACKAGES primary key (PACKAGE_ID)
);

/*==============================================================*/
/* Index: PACKAGE_INDEX                                         */
/*==============================================================*/
create unique index PACKAGE_INDEX on PACKAGES using HASH
(
PACKAGE_ID
);

/*==============================================================*/
/* Table: PACKAGE_LISTS                                         */
/*==============================================================*/
create table PACKAGE_LISTS
(
   PACKAGE_ID INT4 not null,
   LIST_ID INT4 not null,
   constraint PK_PACKAGE_LISTS primary key (LIST_ID, PACKAGE_ID)
);

/*==============================================================*/
/* Index: PACKAGE2_INDEX                                        */
/*==============================================================*/
create  index PACKAGE2_INDEX on PACKAGE_LISTS using HASH
(
PACKAGE_ID
);

/*==============================================================*/
/* Index: LIST3_INDEX                                           */
/*==============================================================*/
create  index LIST3_INDEX on PACKAGE_LISTS using HASH
(
LIST_ID
);

/*==============================================================*/
/* Table: POSITIONS                                             */
/*==============================================================*/
create table POSITIONS
(
   "POSITION" VARCHAR(20) not null,
   constraint PK_POSITIONS primary key ("POSITION")
);

/*==============================================================*/
/* Index: POSITION_INDEX                                        */
/*==============================================================*/
create unique index POSITION_INDEX on POSITIONS using HASH
(
"POSITION"
);

/*==============================================================*/
/* Table: PRIVILEGES                                            */
/*==============================================================*/
create table PRIVILEGES
(
   PRIVILEGE_VALUE NUMERIC(1) not null,
   constraint PK_PRIVILEGES primary key (PRIVILEGE_VALUE)
);

/*==============================================================*/
/* Table: QUESTIONS                                             */
/*==============================================================*/
create table QUESTIONS
(
   QUESTION_ID SERIAL not null,
   QUESTION_DESCRIPTION VARCHAR(500) not null,
   NO_OF_OPTIONS SI(2) not null,
   constraint PK_QUESTIONS primary key (QUESTION_ID)
);

/*==============================================================*/
/* Index: QUESTION_INDEX                                        */
/*==============================================================*/
create unique index QUESTION_INDEX on QUESTIONS using HASH
(
QUESTION_ID
);

/*==============================================================*/
/* Table: QUESTION_OPTIONS                                      */
/*==============================================================*/
create table QUESTION_OPTIONS
(
   QUESTION_ID INT4 not null,
   OPTION_ID INT4 not null,
   constraint PK_QUESTION_OPTIONS primary key (OPTION_ID, QUESTION_ID)
);

/*==============================================================*/
/* Index: OPTION2_INDEX                                         */
/*==============================================================*/
create  index OPTION2_INDEX on QUESTION_OPTIONS using HASH
(
OPTION_ID
);

/*==============================================================*/
/* Index: QUESTION2_INDEX                                       */
/*==============================================================*/
create  index QUESTION2_INDEX on QUESTION_OPTIONS using HASH
(
QUESTION_ID
);

/*==============================================================*/
/* Table: RATES_ARCHIVE                                         */
/*==============================================================*/
create table RATES_ARCHIVE
(
   ARCHIVE_RATE_ID SERIAL not null,
   TEACHER_ID NUMERIC(8) not null,
   COURSE_ID INT4 not null,
   BRANCH_ID NUMERIC(3) not null,
   DEPARTMENT_ID NUMERIC(5) not null,
   "POSITION" VARCHAR(20) not null,
   YEAR I(4) not null,
   SEMESTER SI(1) not null,
   RATE DECIMAL(2,1) not null,
   PERCENTAGE DECIMAL(3,1) not null,
   FREE_TEXTS TEXT not null,
   constraint PK_RATES_ARCHIVE primary key (ARCHIVE_RATE_ID)
);

/*==============================================================*/
/* Index: ARCHIVE_RATE_INDEX                                    */
/*==============================================================*/
create unique index ARCHIVE_RATE_INDEX on RATES_ARCHIVE using HASH
(
ARCHIVE_RATE_ID
);

/*==============================================================*/
/* Index: TEACHER_RATE_ARCHIVE_INDEX                            */
/*==============================================================*/
create  index TEACHER_RATE_ARCHIVE_INDEX on RATES_ARCHIVE (
TEACHER_ID
);

/*==============================================================*/
/* Table: REGISTERED_IN                                         */
/*==============================================================*/
create table REGISTERED_IN
(
   STUDENT_ID NUMERIC(8) not null,
   SECTION_ID INT4 not null,
   COURSE_ID INT4 not null,
   IS_VOTED BOOL not null,
   VOTE_DATE DATE not null,
   VOTE_TIME TIME not null,
   constraint PK_REGISTERED_IN primary key (STUDENT_ID, SECTION_ID)
);

/*==============================================================*/
/* Index: REGISTERED_IN_STUDENT_INDEX                           */
/*==============================================================*/
create  index REGISTERED_IN_STUDENT_INDEX on REGISTERED_IN using HASH
(
STUDENT_ID
);

/*==============================================================*/
/* Table: RESET_REQUESTS                                        */
/*==============================================================*/
create table RESET_REQUESTS
(
   REQUEST_ID SERIAL not null,
   REQUEST_EMAIL VARCHAR(50) not null,
   USER_ID NUMERIC(8) not null,
   constraint PK_RESET_REQUESTS primary key (REQUEST_ID)
);

/*==============================================================*/
/* Index: REQUEST_INDEX                                         */
/*==============================================================*/
create unique index REQUEST_INDEX on RESET_REQUESTS using HASH
(
REQUEST_ID
);

/*==============================================================*/
/* Table: SECTIONS                                              */
/*==============================================================*/
create table SECTIONS
(
   SECTION_ID SERIAL not null,
   SECTION_DETAILS VARCHAR(30) not null,
   NO_OF_TEACHERS SI(1) not null,
   COURSE_ID INT4 not null,
   BRANCH_ID NUMERIC(3) not null,
   DEPARTMENT_ID NUMERIC(5) null,
   YEAR SI(4) not null,
   SEMESTER SI(1) not null,
   SECTION_TOTAL_STUDENTS I(3) not null,
   SECTION_NO_OF_VOTES I(3) not null,
   constraint PK_SECTIONS primary key (SECTION_ID)
);

/*==============================================================*/
/* Index: SECTION_INDEX                                         */
/*==============================================================*/
create unique index SECTION_INDEX on SECTIONS using HASH
(
SECTION_ID
);

/*==============================================================*/
/* Index: BRANCH_INDEX                                          */
/*==============================================================*/
create  index BRANCH_INDEX on SECTIONS using HASH
(
BRANCH_ID
);

/*==============================================================*/
/* Index: DEPARTMENT_INDEX                                      */
/*==============================================================*/
create  index DEPARTMENT_INDEX on SECTIONS using HASH
(
DEPARTMENT_ID
);

/*==============================================================*/
/* Table: STUDENTS                                              */
/*==============================================================*/
create table STUDENTS
(
   STUDENT_ID NUMERIC(8) not null,
   STUDENT_FNAME VARCHAR(20) not null,
   STUDENT_LNAME VARCHAR(20) not null,
   STUDENT_PASSWARD VARCHAR(20) not null,
   STUDENT_EMAIL VARCHAR(50) not null,
   BRANCH_ID NUMERIC(3) not null,
   DEPARTMENT_ID NUMERIC(5) not null,
   constraint PK_STUDENTS primary key (STUDENT_ID)
);

/*==============================================================*/
/* Index: STUDENT_INDEX                                         */
/*==============================================================*/
create unique index STUDENT_INDEX on STUDENTS using HASH
(
STUDENT_ID
);

/*==============================================================*/
/* Table: TEACHERS                                              */
/*==============================================================*/
create table TEACHERS
(
   TEACHER_ID NUMERIC(8) not null,
   TEACHER_FNAME VARCHAR(20) not null,
   TEACHER_LNAME VARCHAR(20) not null,
   TEACHER_PASSWARD VARCHAR(20) not null,
   TEACHER_EMAIL VARCHAR(50) not null,
   constraint PK_TEACHERS primary key (TEACHER_ID)
);

/*==============================================================*/
/* Index: TEACHER_INDEX                                         */
/*==============================================================*/
create unique index TEACHER_INDEX on TEACHERS using HASH
(
TEACHER_ID
);

/*==============================================================*/
/* Table: TEACHER_DEPARTMENT                                    */
/*==============================================================*/
create table TEACHER_DEPARTMENT
(
   TEACHER_ID NUMERIC(8) not null,
   DEPARTMENT_ID NUMERIC(5) not null,
   BRANCH_ID NUMERIC(3) not null,
   constraint PK_TEACHER_DEPARTMENT primary key (TEACHER_ID, DEPARTMENT_ID, BRANCH_ID)
);

/*==============================================================*/
/* Index: TEACHER_DEPARTMENT_INDEX                              */
/*==============================================================*/
create  index TEACHER_DEPARTMENT_INDEX on TEACHER_DEPARTMENT using HASH
(
TEACHER_ID
);

/*==============================================================*/
/* Table: TEACHES                                               */
/*==============================================================*/
create table TEACHES
(
   SECTION_ID INT4 not null,
   TEACHER_ID NUMERIC(8) not null,
   "POSITION" VARCHAR(20) not null,
   SECTION_TEACHER_SUM_OF_RATES DECIMAL(8,1) not null,
   constraint PK_TEACHES primary key (TEACHER_ID, SECTION_ID)
);

/*==============================================================*/
/* Index: TEACHES_TEACHER_INDEX                                 */
/*==============================================================*/
create  index TEACHES_TEACHER_INDEX on TEACHES using HASH
(
TEACHER_ID
);

/*==============================================================*/
/* Index: TEACHES_SECTOIN_INDEX                                 */
/*==============================================================*/
create  index TEACHES_SECTOIN_INDEX on TEACHES using HASH
(
SECTION_ID
);

alter table ACTIVE_FREE_TEXTS
   add constraint FK_ACTIVE_F_REFERENCE_STUDENTS foreign key (STUDENT_ID)
      references STUDENTS (STUDENT_ID)
on delete restrict on
update restrict;

alter table ACTIVE_FREE_TEXTS
   add constraint FK_ACTIVE_F_REFERENCE_TEACHERS foreign key (TEACHER_ID)
      references TEACHERS (TEACHER_ID)
on delete restrict on
update restrict;

alter table ACTIVE_FREE_TEXTS
   add constraint FK_ACTIVE_F_REFERENCE_SECTIONS foreign key (SECTION_ID)
      references SECTIONS (SECTION_ID)
on delete restrict on
update restrict;

alter table ACTIVE_PACKAGES
   add constraint FK_ACTIVE_P_REFERENCE_DEPARTME foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table ACTIVE_PACKAGES
   add constraint FK_ACTIVE_P_REFERENCE_POSITION foreign key ("POSITION")
      references POSITIONS ("POSITION")
on delete restrict on
update restrict;

alter table ACTIVE_PACKAGES
   add constraint FK_ACTIVE_P_REFERENCE_PACKAGES foreign key (PACKAGE_ID)
      references PACKAGES (PACKAGE_ID)
on delete restrict on
update restrict;

alter table ANSWERS
   add constraint FK_ANSWERS_REFERENCE_QUESTION foreign key (QUESTION_ID)
      references QUESTIONS (QUESTION_ID)
on delete restrict on
update restrict;

alter table ANSWERS
   add constraint FK_ANSWERS_REFERENCE_STUDENTS foreign key (STUDENT_ID)
      references STUDENTS (STUDENT_ID)
on delete restrict on
update restrict;

alter table ANSWERS
   add constraint FK_ANSWERS_REFERENCE_TEACHERS foreign key (TEACHER_ID)
      references TEACHERS (TEACHER_ID)
on delete restrict on
update restrict;

alter table ANSWERS
   add constraint FK_ANSWERS_REFERENCE_SECTIONS foreign key (SECTION_ID)
      references SECTIONS (SECTION_ID)
on delete restrict on
update restrict;

alter table COURSES
   add constraint FK_COURSES_REFERENCE_DEPARTME foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table DEANS
   add constraint FK_DEANS_REFERENCE_PRIVILEG foreign key (PRIVILEGE_VALUE)
      references PRIVILEGES (PRIVILEGE_VALUE)
on delete restrict on
update restrict;

alter table DEAN_FACULTY
   add constraint FK_DEAN_FAC_REFERENCE_FACULITI foreign key (FACULTY_ID)
      references FACULITIES (FACULTY_ID)
on delete restrict on
update restrict;

alter table DEAN_FACULTY
   add constraint FK_DEAN_FAC_REFERENCE_DEANS foreign key (DEAN_ID)
      references DEANS (DEAN_ID)
on delete restrict on
update restrict;

alter table DEPARTMENTS
   add constraint FK_DEPARTME_REFERENCE_FACULITI foreign key (FACULTY_ID)
      references FACULITIES (FACULTY_ID)
on delete restrict on
update restrict;

alter table DEPARTMENT_BRANCH
   add constraint FK_DEPARTME_REFERENCE_BRANCHES foreign key (BRANCH_ID)
      references BRANCHES (BRANCH_ID)
on delete restrict on
update restrict;

alter table DEPARTMENT_BRANCH
   add constraint FK_DEPAR_REFERENCE_DEPARTMENTS foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table DEPARTMENT_BRANCH
   add constraint FK_DEPARTME_REFERENCE_DEPARTME foreign key (DEP_MANAGER_ID)
      references DEPARTMENT_MANAGERS (DEP_MANAGER_ID)
on delete restrict on
update restrict;

alter table DEPARTMENT_MANAGERS
   add constraint FK_DEPARTME_REFERENCE_PRIVILEG foreign key (PRIVILEGE_VALUE)
      references PRIVILEGES (PRIVILEGE_VALUE)
on delete restrict on
update restrict;

alter table FACULTY_BRANCH
   add constraint FK_FACULTY__REFERENCE_BRANCHES foreign key (BRANCH_ID)
      references BRANCHES (BRANCH_ID)
on delete restrict on
update restrict;

alter table FACULTY_BRANCH
   add constraint FK_FACULTY__REFERENCE_FACULTY_ foreign key (FACULTY_MANAGER_ID)
      references FACULTY_MANAGERS (FACULTY_MANAGER_ID)
on delete restrict on
update restrict;

alter table FACULTY_BRANCH
   add constraint FK_FACULTY__REFERENCE_FACULITI foreign key (FACULTY_ID)
      references FACULITIES (FACULTY_ID)
on delete restrict on
update restrict;

alter table FACULTY_MANAGERS
   add constraint FK_FACULTY__REFERENCE_PRIVILEG foreign key (PRIVILEGE_VALUE)
      references PRIVILEGES (PRIVILEGE_VALUE)
on delete restrict on
update restrict;

alter table FREE_TEXTS_ARCHIVE
   add constraint FK_FREE_TEX_REFERENCE_STUDENTS foreign key (STUDENT_ID)
      references STUDENTS (STUDENT_ID)
on delete restrict on
update restrict;

alter table FREE_TEXTS_ARCHIVE
   add constraint FK_FREE_TEX_REFERENCE_COURSES foreign key (COURSE_ID)
      references COURSES (COURSE_ID)
on delete restrict on
update restrict;

alter table FREE_TEXTS_ARCHIVE
   add constraint FK_FREE_TEX_REFERENCE_TEACHERS foreign key (TEACHER_ID)
      references TEACHERS (TEACHER_ID)
on delete restrict on
update restrict;

alter table FREE_TEXTS_ARCHIVE
   add constraint FK_FREE_TEX_REFERENCE_BRANCHES foreign key (BRANCH_ID)
      references BRANCHES (BRANCH_ID)
on delete restrict on
update restrict;

alter table FREE_TEXTS_ARCHIVE
   add constraint FK_FREE_TEX_REFERENCE_DEPARTME foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table FREE_TEXTS_ARCHIVE
   add constraint FK_FREE_TEX_REFERENCE_POSITION foreign key ("POSITION")
      references POSITIONS ("POSITION")
on delete restrict on
update restrict;

alter table LIST_QUESTIONS
   add constraint FK_LIST_QUE_REFERENCE_LISTS foreign key (LIST_ID)
      references LISTS (LIST_ID)
on delete restrict on
update restrict;

alter table LIST_QUESTIONS
   add constraint FK_LIST_QUE_REFERENCE_QUESTION foreign key (QUESTION_ID)
      references QUESTIONS (QUESTION_ID)
on delete restrict on
update restrict;

alter table LOGS
   add constraint FK_LOGS_REFERENCE_STUDENTS foreign key (STUDENT_ID)
      references STUDENTS (STUDENT_ID)
on delete restrict on
update restrict;

alter table LOGS
   add constraint FK_LOGS_REFERENCE_COURSES foreign key (COURSE_ID)
      references COURSES (COURSE_ID)
on delete restrict on
update restrict;

alter table LOGS
   add constraint FK_LOGS_REFERENCE_TEACHERS foreign key (TEACHER_ID)
      references TEACHERS (TEACHER_ID)
on delete restrict on
update restrict;

alter table LOGS
   add constraint FK_LOGS_REFERENCE_DEPARTME foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table PACKAGES
   add constraint FK_PACKAGES_REFERENCE_DEANS foreign key (DEAN_ID)
      references DEANS (DEAN_ID)
on delete restrict on
update restrict;

alter table PACKAGE_LISTS
   add constraint FK_PACKAGE__REFERENCE_LISTS foreign key (LIST_ID)
      references LISTS (LIST_ID)
on delete restrict on
update restrict;

alter table PACKAGE_LISTS
   add constraint FK_PACKAGE__REFERENCE_PACKAGES foreign key (PACKAGE_ID)
      references PACKAGES (PACKAGE_ID)
on delete restrict on
update restrict;

alter table QUESTION_OPTIONS
   add constraint FK_QUESTION_REFERENCE_QUESTION foreign key (QUESTION_ID)
      references QUESTIONS (QUESTION_ID)
on delete restrict on
update restrict;

alter table QUESTION_OPTIONS
   add constraint FK_QUESTION_REFERENCE_OPTIONS foreign key (OPTION_ID)
      references OPTIONS (OPTION_ID)
on delete restrict on
update restrict;

alter table RATES_ARCHIVE
   add constraint FK_RATES_AR_REFERENCE_COURSES foreign key (COURSE_ID)
      references COURSES (COURSE_ID)
on delete restrict on
update restrict;

alter table RATES_ARCHIVE
   add constraint FK_RATES_AR_REFERENCE_BRANCHES foreign key (BRANCH_ID)
      references BRANCHES (BRANCH_ID)
on delete restrict on
update restrict;

alter table RATES_ARCHIVE
   add constraint FK_RATES_AR_REFERENCE_POSITION foreign key ("POSITION")
      references POSITIONS ("POSITION")
on delete restrict on
update restrict;

alter table RATES_ARCHIVE
   add constraint FK_RATES_AR_REFERENCE_TEACHERS foreign key (TEACHER_ID)
      references TEACHERS (TEACHER_ID)
on delete restrict on
update restrict;

alter table RATES_ARCHIVE
   add constraint FK_RATES_AR_REFERENCE_DEPARTME foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table REGISTERED_IN
   add constraint FK_REGISTER_REFERENCE_STUDENTS foreign key (STUDENT_ID)
      references STUDENTS (STUDENT_ID)
on delete restrict on
update restrict;

alter table REGISTERED_IN
   add constraint FK_REGISTER_REFERENCE_COURSES foreign key (COURSE_ID)
      references COURSES (COURSE_ID)
on delete restrict on
update restrict;

alter table REGISTERED_IN
   add constraint FK_REGISTER_REFERENCE_SECTIONS foreign key (SECTION_ID)
      references SECTIONS (SECTION_ID)
on delete restrict on
update restrict;

alter table SECTIONS
   add constraint FK_SECTIONS_REFERENCE_COURSES foreign key (COURSE_ID)
      references COURSES (COURSE_ID)
on delete restrict on
update restrict;

alter table SECTIONS
   add constraint FK_SECTIONS_REFERENCE_BRANCHES foreign key (BRANCH_ID)
      references BRANCHES (BRANCH_ID)
on delete restrict on
update restrict;

alter table SECTIONS
   add constraint FK_SECTIONS_REFERENCE_DEPARTME foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table STUDENTS
   add constraint FK_STUDENTS_REFERENCE_BRANCHES foreign key (BRANCH_ID)
      references BRANCHES (BRANCH_ID)
on delete restrict on
update restrict;

alter table STUDENTS
   add constraint FK_STUDENTS_REFERENCE_DEPARTME foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table TEACHER_DEPARTMENT
   add constraint FK_TEACHER__REFERENCE_DEPARTME foreign key (DEPARTMENT_ID)
      references DEPARTMENTS (DEPARTMENT_ID)
on delete restrict on
update restrict;

alter table TEACHER_DEPARTMENT
   add constraint FK_TEACHER__REFERENCE_TEACHERS foreign key (TEACHER_ID)
      references TEACHERS (TEACHER_ID)
on delete restrict on
update restrict;

alter table TEACHER_DEPARTMENT
   add constraint FK_TEACHER__REFERENCE_BRANCHES foreign key (BRANCH_ID)
      references BRANCHES (BRANCH_ID)
on delete restrict on
update restrict;

alter table TEACHES
   add constraint FK_TEACHES_REFERENCE_TEACHERS foreign key (TEACHER_ID)
      references TEACHERS (TEACHER_ID)
on delete restrict on
update restrict;

alter table TEACHES
   add constraint FK_TEACHES_REFERENCE_SECTIONS foreign key (SECTION_ID)
      references SECTIONS (SECTION_ID)
on delete restrict on
update restrict;

alter table TEACHES
   add constraint FK_TEACHES_REFERENCE_POSITION foreign key ("POSITION")
      references POSITIONS ("POSITION")
on delete restrict on
update restrict;

