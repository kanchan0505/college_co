-- Create database schema for College Marking Portal

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'hod', 'faculty')),
    name VARCHAR(255) NOT NULL,
    department_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    hod_id INTEGER,
    nba_threshold DECIMAL(5,2) DEFAULT 52.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    department_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    department_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    batch_year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Faculty subject assignments
CREATE TABLE faculty_subjects (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    batch_year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE(faculty_id, subject_id, semester, batch_year)
);

-- Units table (each subject has 5 units)
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    unit_number INTEGER NOT NULL CHECK (unit_number BETWEEN 1 AND 5),
    unit_name VARCHAR(255) NOT NULL,
    max_mst_marks INTEGER DEFAULT 20,
    max_assignment_marks INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE(subject_id, unit_number)
);

-- Student marks table
CREATE TABLE student_marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    mst_marks DECIMAL(5,2) DEFAULT 0,
    assignment_marks DECIMAL(5,2) DEFAULT 0,
    faculty_id INTEGER NOT NULL,
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (unit_id) REFERENCES units(id),
    FOREIGN KEY (faculty_id) REFERENCES users(id),
    UNIQUE(student_id, unit_id)
);

-- Add foreign key constraints
ALTER TABLE departments ADD FOREIGN KEY (hod_id) REFERENCES users(id);
ALTER TABLE users ADD FOREIGN KEY (department_id) REFERENCES departments(id);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_marks_student_unit ON student_marks(student_id, unit_id);
CREATE INDEX idx_faculty_subjects_faculty ON faculty_subjects(faculty_id);
