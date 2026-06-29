CREATE DATABASE online_exam

USE online_exam


CREATE TABLE DEPARTMENT(

ID INT PRIMARY KEY,
NAME VARCHAR(200) NOT NULL

)

INSERT INTO DEPARTMENT VALUES 
(1,'Information Technology'),
(2,'Business & Marketing'),
(3,'Creative Arts'),
(4,'Language & Communication'),
(5,'Professional Skills')

CREATE TABLE TESTCENTRE (

ID INT PRIMARY KEY,
NAME VARCHAR(200) NOT NULL,

)

INSERT INTO TESTCENTRE VALUES 
(1,'Coimbatore'),
(2,'Chennai'),
(3,'Madurai'),
(4,'Salem'),
(5,'Tiruppur'),
(6,'Erode'),
(7,'Trichy'),
(8,'Vellore'),
(9,'Tirunelveli'),
(10,'Thanjavur')


CREATE TABLE COURSE (

ID INT PRIMARY KEY,
NAME VARCHAR(200) NOT NULL,
DESCRIPTION VARCHAR(300) NOT NULL,
IMAGE_URL VARCHAR(300) NOT NULL,
FEES MONEY NOT NULL,
DEPTID INT FOREIGN KEY REFERENCES DEPARTMENT(ID)

)

INSERT INTO COURSE VALUES 
(1,'Full Stack Web Development','Evaluate your skills in front-end, back-end,
databases, REST APIs, and full-stack application development.',
'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=250&fit=crop&q=80',45000,1),
(2,'Data Science','Test your knowledge of data analysis, 
statistics, machine learning, and Python programming., 
and full-stack application development.',
'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=250&fit=crop&q=80',50000,1),
(3,'Cloud Computing','Assess your understanding of cloud platforms, 
virtualization, networking, and deployment concepts',
'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=250&fit=crop&q=80',40000,1),
(4,'Digital Marketing','Measure your knowledge of SEO, 
social media, content marketing, and online advertising strategies.',
'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=250&fit=crop&q=80',30000,2),
(5,'Financial Accounting','Demonstrate your skills in bookkeeping, financial statements, taxation, 
and accounting principles.',
'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=250&fit=crop&q=80',35000,2),
(6,'Graphic Design','Showcase your understanding of design principles, typography,
color theory, and creative tools.',
'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=250&fit=crop&q=80',28000,3),
(7,'UI/UX Design','Test your knowledge of user research, 
wireframing, prototyping, and interface design.',
'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&h=250&fit=crop&q=80',32000,3),
(8,'Spoken English','Assess your grammar, vocabulary, pronunciation, 
listening, and spoken communication skills.',
'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=500&h=250&fit=crop&q=80',15000,4),
(9,'Public Speaking','Evaluate your confidence, presentation skills, 
speech delivery, and audience engagement.',
'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=250&fit=crop&q=80',18000,4),
(10,'Cyber Security','Test your expertise in network security, ethical hacking,
cryptography, and cyber threat management.',
'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=250&fit=crop&q=80',55000,5)


CREATE TABLE USERS (

ID INT PRIMARY KEY ,
NAME VARCHAR(200) NOT NULL,
EMAIL VARCHAR(200) NOT NULL,
PASSWORD VARCHAR(200) NOT NULL,
DOB VARCHAR(100) NOT NULL,
GENDER VARCHAR(50) NOT NULL CHECK(GENDER IN ('MALE','FEMALE')),
COLLEGE VARCHAR(200) NOT NULL,
ROLE VARCHAR(100) NOT NULL DEFAULT 'Student',
MOBILE VARCHAR(10) NOT NULL CHECK( LEN(MOBILE) = 10 AND MOBILE NOT LIKE '%[^0-9]%'),
DEPARTMENTID INT FOREIGN KEY REFERENCES DEPARTMENT(ID),

)

INSERT INTO USERS (
  ID, 
  NAME,
  EMAIL,
  PASSWORD,
  DOB,
  GENDER,
  COLLEGE,
  ROLE,
  MOBILE,
  DEPARTMENTID) VALUES
(1,'Vishal M',
'visowmani.123@gmail.com','Vishal@1205',
'2005-11-12','Male','Sri Krishna Arts and Science College',
'Admin',6379543139,1)

INSERT INTO USERS (
  ID, 
  NAME,
  EMAIL,
  PASSWORD,
  DOB,
  GENDER,
  COLLEGE,
  MOBILE,
  DEPARTMENTID) VALUES 
  (2,'Harish B','harish.123@gmail.com','Harish@123',
  '2005-06-27','Male','Sri Krishna Arts and Science College',
  8989898989,1),
  (3,'Arun B','arun.123@gmail.com','Arun@123',
  '2005-06-27','Male','Sri Krishna Arts and Science College',
  7979797979,2)

  INSERT INTO USERS (
  ID, 
  NAME,
  EMAIL,
  PASSWORD,
  DOB,
  GENDER,
  COLLEGE,
  MOBILE,
  DEPARTMENTID) VALUES 
  (4,'Karthik S','karthik.s@gmail.com','Karthik@123', 
  '2004-09-15','Male','PSG College of Technology', '9876543210',1),
  (5,'Priya R','priya.r@gmail.com','Priya@123', '2003-12-08',
  'Female','Sri Ramakrishna College', '9123456789',3), 
  (6,'Naveen K','naveen.k@gmail.com','Naveen@123', '2005-02-21',
  'Male','Government Arts College', '9345678901',5);

CREATE TABLE ENROLL (

ID INT IDENTITY(1,1) PRIMARY KEY,
USERID INT FOREIGN KEY REFERENCES USERS(ID),
COURSEID INT FOREIGN KEY REFERENCES COURSE(ID),
CENTREID INT FOREIGN KEY REFERENCES TESTCENTRE(ID),
PREFERRED_DATE DATE NOT NULL,
STATUS VARCHAR(100) CHECK(STATUS IN ('Attended','Approved','Rejected','Pending')),
REASON VARCHAR(200) DEFAULT NULL,
IS_DELETED BIT DEFAULT 0,
CREATED_AT DATE DEFAULT GETDATE(),
UPDATED_AT DATE DEFAULT GETDATE()

)



INSERT INTO ENROLL (USERID,COURSEID,CENTREID,PREFERRED_DATE,STATUS) VALUES 
(2,2,1,'2026-06-23','Pending'),
(2,1,1,'2026-06-20','Attended'),
(1,2,1,'2026-06-26','Approved')

INSERT INTO ENROLL (USERID, COURSEID, CENTREID, PREFERRED_DATE, STATUS)
VALUES 
(2,4,2,'2026-07-05','Pending'), 
(2,5,3,'2026-07-08','Approved'), 
(3,6,4,'2026-07-10','Pending'), 
(3,7,5,'2026-07-12','Attended'), 
(4,8,6,'2026-07-14','Approved'), 
(4,9,7,'2026-07-16','Pending'), 
(5,10,8,'2026-07-18','Attended');

INSERT INTO ENROLL (USERID, COURSEID, CENTREID, PREFERRED_DATE, STATUS, REASON) 
VALUES 
(5,3,9,'2026-07-20','Rejected', 'Seats are fully occupied for the selected date.'), 
(6,1,10,'2026-07-22','Rejected', 'Eligibility criteria not satisfied.')


INSERT INTO ENROLL (USERID,COURSEID,CENTREID,
PREFERRED_DATE,STATUS,REASON) VALUES 
(2,3,1,'2026-06-26','Rejected','No seats available on 2026-06-26')

--Soft Delete
UPDATE ENROLL SET IS_DELETED = 1 WHERE ID = 1


CREATE VIEW PENDING_VIEW AS
SELECT
    E.ID,
    U.NAME AS STUDENT_NAME,
    U.EMAIL,
    C.NAME AS COURSE_NAME,
    T.NAME AS TEST_CENTRE,
    E.PREFERRED_DATE,
    E.STATUS,
    E.REASON,
    E.CREATED_AT,
    E.UPDATED_AT
FROM ENROLL E
JOIN USERS U
    ON E.USERID = U.ID
JOIN COURSE C
    ON E.COURSEID = C.ID
JOIN TESTCENTRE T
    ON E.CENTREID = T.ID
WHERE E.STATUS = 'Pending'
  AND E.IS_DELETED = 0;


SELECT * FROM ALL_RECORD_VIEW


CREATE VIEW APPROVED_VIEW AS
SELECT
    E.ID,
    U.NAME AS STUDENT_NAME,
    U.EMAIL,
    C.NAME AS COURSE_NAME,
    T.NAME AS TEST_CENTRE,
    E.PREFERRED_DATE,
    E.STATUS,
    E.REASON,
    E.CREATED_AT,
    E.UPDATED_AT
FROM ENROLL E
JOIN USERS U
ON E.USERID = U.ID
JOIN COURSE C
ON E.COURSEID = C.ID
JOIN TESTCENTRE T
ON E.CENTREID = T.ID
WHERE E.STATUS = 'Approved'
AND E.IS_DELETED = 0;

SELECT * FROM APPROVED_VIEW

CREATE VIEW REJECTED_VIEW AS
SELECT
    E.ID,
    U.NAME AS STUDENT_NAME,
    U.EMAIL,
    C.NAME AS COURSE_NAME,
    T.NAME AS TEST_CENTRE,
    E.PREFERRED_DATE,
    E.STATUS,
    E.REASON,
    E.CREATED_AT,
    E.UPDATED_AT
FROM ENROLL E
JOIN USERS U
ON E.USERID = U.ID
JOIN COURSE C
ON E.COURSEID = C.ID
JOIN TESTCENTRE T
ON E.CENTREID = T.ID
WHERE E.STATUS = 'Rejected'
AND E.IS_DELETED = 0;

SELECT * FROM REJECTED_VIEW


CREATE VIEW ATTENDED_VIEW AS
SELECT
    E.ID,
    U.NAME AS STUDENT_NAME,
    U.EMAIL,
    C.NAME AS COURSE_NAME,
    T.NAME AS TEST_CENTRE,
    E.PREFERRED_DATE,
    E.STATUS,
    E.REASON,
    E.CREATED_AT,
    E.UPDATED_AT
FROM ENROLL E
JOIN USERS U
ON E.USERID = U.ID
JOIN COURSE C
ON E.COURSEID = C.ID
JOIN TESTCENTRE T
ON E.CENTREID = T.ID
WHERE E.STATUS = 'Attended'
AND E.IS_DELETED = 0;




SELECT * FROM ATTENDED_VIEW WHERE STUDENT_NAME LIKE 'H%'


SELECT *
FROM ENROLL
WHERE PREFERRED_DATE BETWEEN '2026-06-20' AND '2026-06-30';


CREATE INDEX IDX_STATUS ON ENROLL(STATUS)

CREATE INDEX IDX_PREFERRED_DATE ON ENROLL(PREFERRED_DATE)

--1.Display all records

CREATE VIEW ALL_RECORD_VIEW AS
SELECT
    E.ID,
    U.NAME AS STUDENT_NAME,
    U.EMAIL,
    C.NAME AS COURSE_NAME,
    T.NAME AS TEST_CENTRE,
    E.PREFERRED_DATE,
    E.STATUS,
    E.REASON,
    E.CREATED_AT,
    E.UPDATED_AT
FROM ENROLL E
JOIN USERS U
ON E.USERID = U.ID
JOIN COURSE C
ON E.COURSEID = C.ID
JOIN TESTCENTRE T
ON E.CENTREID = T.ID


SELECT * FROM ALL_RECORD_VIEW



--2. Display active records

CREATE VIEW ALL_ACTIVE_RECORD_VIEW AS
SELECT
    E.ID,
    U.NAME AS STUDENT_NAME,
    U.EMAIL,
    C.NAME AS COURSE_NAME,
    T.NAME AS TEST_CENTRE,
    E.PREFERRED_DATE,
    E.STATUS,
    E.REASON,
    E.CREATED_AT,
    E.UPDATED_AT
FROM ENROLL E
JOIN USERS U
ON E.USERID = U.ID
JOIN COURSE C
ON E.COURSEID = C.ID
JOIN TESTCENTRE T
ON E.CENTREID = T.ID
WHERE E.IS_DELETED = 0;

SELECT * FROM ALL_ACTIVE_RECORD_VIEW


--3. Display inactive records

CREATE VIEW ALL_INACTIVE_RECORD_VIEW AS
SELECT
    E.ID,
    U.NAME AS STUDENT_NAME,
    U.EMAIL,
    C.NAME AS COURSE_NAME,
    T.NAME AS TEST_CENTRE,
    E.PREFERRED_DATE,
    E.STATUS,
    E.REASON,
    E.CREATED_AT,
    E.UPDATED_AT
FROM ENROLL E
JOIN USERS U
ON E.USERID = U.ID
JOIN COURSE C
ON E.COURSEID = C.ID
JOIN TESTCENTRE T
ON E.CENTREID = T.ID
WHERE E.IS_DELETED = 1;

SELECT * FROM ALL_INACTIVE_RECORD_VIEW



--4. Search by name

SELECT * FROM ALL_ACTIVE_RECORD_VIEW 
WHERE STUDENT_NAME LIKE 'Har%'


--5.Count total records

SELECT COUNT(*) AS TOTAL_COUNT FROM ALL_ACTIVE_RECORD_VIEW 

--6.Count records by status

SELECT STATUS,COUNT(*) AS TOTAL_COUNT
FROM ALL_ACTIVE_RECORD_VIEW GROUP BY STATUS

--7.Display recently added records

SELECT * FROM ALL_ACTIVE_RECORD_VIEW ORDER BY CREATED_AT

--8. Display records within date range

SELECT * FROM ALL_ACTIVE_RECORD_VIEW 
WHERE PREFERRED_DATE BETWEEN '2026-06-20' AND '2026-06-30';

--9. Display top 5 records

SELECT TOP 5 * FROM ALL_ACTIVE_RECORD_VIEW

--10. Display summary report

SELECT C.NAME AS COURSE_NAME, COUNT(E.ID) AS TOTAL_ENROLLMENTS
FROM ENROLL E
JOIN COURSE C
ON E.COURSEID = C.ID
GROUP BY C.NAME;