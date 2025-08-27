
INSERT INTO departments (name, code) VALUES 
('Computer Science Engineering', 'CSE'),
('Electronics and Communication', 'ECE'),
('Mechanical Engineering', 'MECH'),
('Civil Engineering', 'CIVIL');


INSERT INTO users (email, password_hash, role, name) VALUES 
('admin@college.edu', '$2b$10$rQZ9QmjlQKdH8FjKjKjKjOQZ9QmjlQKdH8FjKjKjKj', 'admin', 'System Administrator');


INSERT INTO users (email, password_hash, role, name, department_id) VALUES 
('hod.cse@college.edu', '$2b$10$rQZ9QmjlQKdH8FjKjKjKjOQZ9QmjlQKdH8FjKjKjKj', 'hod', 'Dr. John Smith', 1),
('hod.ece@college.edu', '$2b$10$rQZ9QmjlQKdH8FjKjKjKjOQZ9QmjlQKdH8FjKjKjKj', 'hod', 'Dr. Sarah Johnson', 2);


UPDATE departments SET hod_id = 2 WHERE id = 1;
UPDATE departments SET hod_id = 3 WHERE id = 2;


INSERT INTO users (email, password_hash, role, name, department_id) VALUES 
('faculty1.cse@college.edu', '$2b$10$rQZ9QmjlQKdH8FjKjKjKjOQZ9QmjlQKdH8FjKjKjKj', 'faculty', 'Prof. Alice Brown', 1),
('faculty2.cse@college.edu', '$2b$10$rQZ9QmjlQKdH8FjKjKjKjOQZ9QmjlQKdH8FjKjKjKj', 'faculty', 'Prof. Bob Wilson', 1),
('faculty1.ece@college.edu', '$2b$10$rQZ9QmjlQKdH8FjKjKjKjOQZ9QmjlQKdH8FjKjKjKj', 'faculty', 'Prof. Carol Davis', 2);


INSERT INTO subjects (name, code, department_id, semester, credits) VALUES 
('Data Structures and Algorithms', 'CS301', 1, 3, 4),
('Database Management Systems', 'CS302', 1, 3, 3),
('Computer Networks', 'CS303', 1, 3, 3),
('Digital Signal Processing', 'EC301', 2, 3, 4),
('Microprocessors', 'EC302', 2, 3, 3);

INSERT INTO students (roll_number, name, email, department_id, semester, batch_year) VALUES 
('CSE2021001', 'Student One', 'student1@college.edu', 1, 3, 2021),
('CSE2021002', 'Student Two', 'student2@college.edu', 1, 3, 2021),
('CSE2021003', 'Student Three', 'student3@college.edu', 1, 3, 2021),
('ECE2021001', 'Student Four', 'student4@college.edu', 2, 3, 2021),
('ECE2021002', 'Student Five', 'student5@college.edu', 2, 3, 2021);


INSERT INTO units (subject_id, unit_number, unit_name, max_mst_marks, max_assignment_marks) VALUES 

(1, 1, 'Introduction to Data Structures', 20, 10),
(1, 2, 'Arrays and Linked Lists', 20, 10),
(1, 3, 'Stacks and Queues', 20, 10),
(1, 4, 'Trees and Graphs', 20, 10),
(1, 5, 'Sorting and Searching', 20, 10),

(2, 1, 'Database Fundamentals', 20, 10),
(2, 2, 'ER Modeling', 20, 10),
(2, 3, 'SQL and Queries', 20, 10),
(2, 4, 'Normalization', 20, 10),
(2, 5, 'Transaction Management', 20, 10),

(4, 1, 'Signals and Systems', 20, 10),
(4, 2, 'Fourier Transform', 20, 10),
(4, 3, 'Z-Transform', 20, 10),
(4, 4, 'Digital Filters', 20, 10),
(4, 5, 'DSP Applications', 20, 10);


INSERT INTO faculty_subjects (faculty_id, subject_id, semester, batch_year) VALUES 
(4, 1, 3, 2021), -- Prof. Alice teaches Data Structures
(4, 2, 3, 2021), -- Prof. Alice teaches DBMS
(5, 3, 3, 2021), -- Prof. Bob teaches Computer Networks
(6, 4, 3, 2021), -- Prof. Carol teaches DSP
(6, 5, 3, 2021); -- Prof. Carol teaches Microprocessors
