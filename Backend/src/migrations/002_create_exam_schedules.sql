-- Migration: Create exam_schedules table
-- Description: Creates the exam_schedules table with all required columns

CREATE TABLE IF NOT EXISTS exam_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key, auto-increment',
  exam_title VARCHAR(255) NOT NULL COMMENT 'Title of the exam',
  start_datetime DATETIME NOT NULL COMMENT 'Start date and time of the exam',
  end_datetime DATETIME NOT NULL COMMENT 'End date and time of the exam',
  exam_status ENUM('Active', 'Inactive') DEFAULT 'Active' COMMENT 'Status of the exam',
  exam_category ENUM('Abacus', 'Vedic') NOT NULL COMMENT 'Category of the exam',
  exam_type ENUM('Mock', 'Main Exam') NOT NULL COMMENT 'Type of the exam',
  exam_level JSON COMMENT 'JSON array of exam level IDs',
  exam_set JSON COMMENT 'JSON array of exam set IDs',
  exam_state JSON COMMENT 'JSON array of state IDs',
  exam_district JSON COMMENT 'JSON array of district IDs',
  exam_institute JSON COMMENT 'JSON array of institute IDs',
  created_by INT NOT NULL COMMENT 'User ID who created this record',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  
  -- Indexes for better query performance
  INDEX idx_created_by (created_by) COMMENT 'Index for faster queries by user',
  INDEX idx_exam_status (exam_status) COMMENT 'Index for filtering by status',
  INDEX idx_exam_category (exam_category) COMMENT 'Index for filtering by category',
  INDEX idx_exam_type (exam_type) COMMENT 'Index for filtering by type',
  INDEX idx_created_at (created_at) COMMENT 'Index for sorting by creation date',
  FULLTEXT INDEX ft_exam_title (exam_title) COMMENT 'Full-text index for search'
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Exam Schedule records';
