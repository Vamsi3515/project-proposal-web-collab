CREATE DATABASE IF NOT EXISTS project_proposal_web;
USE project_proposal_web;

-- Users Table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    full_name VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user'
);

-- Student Teams Table
CREATE TABLE student_teams (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    college VARCHAR(255),
    domain VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Students Table
CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    team_id INT,
    name VARCHAR(100),
    roll_no VARCHAR(50),
    branch VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES student_teams(team_id) ON DELETE CASCADE,
    UNIQUE (team_id, roll_no)
);

-- Domain PDFs Added by Admin
CREATE TABLE domains (
    domain_id INT PRIMARY KEY AUTO_INCREMENT,
    domain_name VARCHAR(100) UNIQUE NOT NULL,
    pdf_url VARCHAR(255) NOT NULL
);

-- Projects Table
CREATE TABLE projects (
    project_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    project_code VARCHAR(20) UNIQUE NOT NULL,
    domain VARCHAR(100) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    reference_pdf_url VARCHAR(255),
    delivery_date DATE,
    terms_agreed BOOLEAN DEFAULT FALSE,
    project_status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    admin_notes TEXT NULL,
    project_file_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    pending_amount DECIMAL(10,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    payment_status ENUM('pending', 'partially_paid', 'paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Invoices Table
CREATE TABLE invoices (
    invoice_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    invoice_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Reports Table
CREATE TABLE reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NULL,
    pdf_url VARCHAR(255) NULL,
    report_status ENUM('open', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- OTP Table
CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    otp VARCHAR(10),
    expires_at DATETIME
);

-- ALTER TABLE students DROP INDEX roll_no;
-- ALTER TABLE students ADD UNIQUE (team_id, roll_no);

-- drop database project_proposal_web;

show tables;

select * from projects;
delete from projects where project_id in (2,3,4,5);

update projects set project_status="approved" where project_id=1;
update projects set project_status="rejected" where project_id=6;