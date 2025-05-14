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
    project_id INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
    user_id INT NOT NULL,
    project_code VARCHAR(20) UNIQUE NOT NULL,
    domain VARCHAR(100) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    description TEXT,
    reference_pdf_url VARCHAR(255),
    delivery_date DATE,
    terms_agreed BOOLEAN DEFAULT FALSE,
    project_status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    admin_notes TEXT NULL,
    payment_status ENUM('pending', 'partially_paid', 'paid', 'refunded') DEFAULT 'pending',
    project_file_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(255),
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    razorpay_payment_id VARCHAR(255),
    paid_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    invoice_url VARCHAR(255),
    refund_id VARCHAR(255),
	refund_amount DECIMAL(10, 2),
    refund_status VARCHAR(20),
	payment_status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
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
    report_note TEXT NULL,
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

-- Refund Table
CREATE TABLE refunds (
    refund_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    refund_amount DECIMAL(10, 2),
    refund_status ENUM('pending', 'done') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE
);

-- Certificate Table
CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  college VARCHAR(150),
  role VARCHAR(100),
  start_date DATE,
  end_date DATE,
  email VARCHAR(150),
  certificate_id VARCHAR(100) UNIQUE,
  issued_date DATE,
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);