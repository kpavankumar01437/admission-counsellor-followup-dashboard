-- Full MySQL Schema for Admission Counsellor Follow-up Dashboard
-- Run this on Railway MySQL or local MySQL.

CREATE DATABASE IF NOT EXISTS admission_dashboard;
USE admission_dashboard;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS admissions;
DROP TABLE IF EXISTS tour_bookings;
DROP TABLE IF EXISTS tour_slots;
DROP TABLE IF EXISTS follow_ups;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS counsellors;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE counsellors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('counsellor', 'admin', 'centre_head') DEFAULT 'counsellor',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_name VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(15) NOT NULL,
  parent_email VARCHAR(100),
  child_name VARCHAR(100),
  child_age INT,
  child_dob DATE,
  program_interest VARCHAR(100),
  source ENUM('walk-in', 'website', 'referral', 'whatsapp', 'phone', 'social-media') DEFAULT 'phone',
  status ENUM('new', 'contacted', 'demo-scheduled', 'demo-visited', 'follow-up', 'admitted', 'not-interested', 'lost') DEFAULT 'new',
  priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
  counsellor_id INT,
  notes TEXT,
  next_follow_up_date DATE,
  referral_by VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_leads_status (status),
  INDEX idx_leads_priority (priority),
  INDEX idx_leads_followup (next_follow_up_date),
  INDEX idx_leads_phone (parent_phone),
  FOREIGN KEY (counsellor_id) REFERENCES counsellors(id) ON DELETE SET NULL
);

CREATE TABLE follow_ups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lead_id INT NOT NULL,
  counsellor_id INT NOT NULL,
  call_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  duration_mins INT,
  outcome ENUM('answered', 'no-answer', 'callback-requested', 'interested', 'not-interested', 'admitted', 'rescheduled') NOT NULL,
  status_changed_to ENUM('new', 'contacted', 'demo-scheduled', 'demo-visited', 'follow-up', 'admitted', 'not-interested', 'lost'),
  notes TEXT,
  next_action VARCHAR(255),
  next_follow_up_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_followups_lead (lead_id),
  INDEX idx_followups_counsellor (counsellor_id),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (counsellor_id) REFERENCES counsellors(id) ON DELETE CASCADE
);

CREATE TABLE tour_slots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  capacity INT DEFAULT 5,
  booked_count INT DEFAULT 0,
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tour_slots_date (slot_date, slot_time)
);

CREATE TABLE tour_bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lead_id INT NOT NULL,
  slot_id INT NOT NULL,
  status ENUM('confirmed', 'cancelled', 'visited', 'no-show') DEFAULT 'confirmed',
  booked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_active_lead_slot (lead_id, slot_id),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (slot_id) REFERENCES tour_slots(id) ON DELETE CASCADE,
  FOREIGN KEY (booked_by) REFERENCES counsellors(id) ON DELETE SET NULL
);

CREATE TABLE admissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lead_id INT NOT NULL UNIQUE,
  counsellor_id INT NOT NULL,
  program VARCHAR(100) NOT NULL,
  start_date DATE,
  fee_amount DECIMAL(10,2),
  fee_paid DECIMAL(10,2) DEFAULT 0,
  admission_date DATE DEFAULT (CURDATE()),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (counsellor_id) REFERENCES counsellors(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  counsellor_id INT,
  lead_id INT,
  type ENUM('follow-up-due', 'demo-reminder', 'overdue-lead', 'admission-confirmed', 'general') NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority ENUM('urgent', 'normal', 'low') DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user_read (counsellor_id, is_read),
  FOREIGN KEY (counsellor_id) REFERENCES counsellors(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Seed: password for admin is Admin@123, password for counsellors is Counsellor@123
INSERT INTO counsellors (name, email, phone, password_hash, role) VALUES
  ('Centre Admin', 'admin@firstcryintellitots.com', '9000000000', '$2b$10$nmNrua7RcS0scrbZiZABte2lfVuHQPHSNzwg25KjlEB01rOwlui0.', 'admin'),
  ('Priya Sharma', 'priya@firstcry.com', '9111111111', '$2b$10$.FA120qgKCUpXJLgfbKmXOrabqXZY5kLvAhw/kSSbR5sjOilp7qeu', 'counsellor'),
  ('Arjun Mehta', 'arjun@firstcry.com', '9222222222', '$2b$10$.FA120qgKCUpXJLgfbKmXOrabqXZY5kLvAhw/kSSbR5sjOilp7qeu', 'counsellor');

INSERT INTO leads
  (parent_name, parent_phone, parent_email, child_name, child_age, program_interest, source, status, priority, counsellor_id, notes, next_follow_up_date, referral_by, address, created_at)
VALUES
  ('Ananya Rao', '9876500001', 'ananya.rao@example.com', 'Ishaan', 3, 'Nursery', 'website', 'new', 'high', 2, 'Requested fee details through website form.', CURDATE(), NULL, 'Madhapur, Hyderabad', DATE_SUB(NOW(), INTERVAL 8 DAY)),
  ('Rahul Nair', '9876500002', 'rahul.nair@example.com', 'Mira', 4, 'LKG', 'phone', 'contacted', 'medium', 2, 'Interested but asked for transport details.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), NULL, 'Kondapur, Hyderabad', DATE_SUB(NOW(), INTERVAL 5 DAY)),
  ('Sneha Kapoor', '9876500003', 'sneha.kapoor@example.com', 'Kabir', 2, 'Playgroup', 'whatsapp', 'demo-scheduled', 'medium', 3, 'Demo booked for this week.', DATE_ADD(CURDATE(), INTERVAL 2 DAY), NULL, 'Gachibowli, Hyderabad', DATE_SUB(NOW(), INTERVAL 3 DAY)),
  ('Vikram Reddy', '9876500004', 'vikram.reddy@example.com', 'Aarohi', 5, 'UKG', 'referral', 'demo-visited', 'high', 3, 'Visited centre, comparing with another preschool.', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Existing parent', 'Nanakramguda, Hyderabad', DATE_SUB(NOW(), INTERVAL 10 DAY)),
  ('Pooja Menon', '9876500005', 'pooja.menon@example.com', 'Vihaan', 3, 'Nursery', 'social-media', 'admitted', 'low', 2, 'Converted after demo visit.', NULL, NULL, 'HITEC City, Hyderabad', DATE_SUB(NOW(), INTERVAL 14 DAY));

INSERT INTO follow_ups
  (lead_id, counsellor_id, call_date, duration_mins, outcome, status_changed_to, notes, next_action, next_follow_up_date)
VALUES
  (1, 2, DATE_SUB(NOW(), INTERVAL 7 DAY), 4, 'no-answer', 'new', 'Initial call not answered.', 'Call again today', CURDATE()),
  (2, 2, DATE_SUB(NOW(), INTERVAL 4 DAY), 9, 'answered', 'contacted', 'Discussed program and transport route.', 'Share transport estimate', DATE_ADD(CURDATE(), INTERVAL 1 DAY)),
  (3, 3, DATE_SUB(NOW(), INTERVAL 2 DAY), 8, 'interested', 'demo-scheduled', 'Parent agreed to centre tour.', 'Confirm demo timing', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
  (4, 3, DATE_SUB(NOW(), INTERVAL 4 DAY), 12, 'answered', 'demo-visited', 'Parent liked curriculum, fee concern pending.', 'Close admission', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (5, 2, DATE_SUB(NOW(), INTERVAL 8 DAY), 10, 'admitted', 'admitted', 'Admission confirmed.', 'Collect remaining documents', NULL);

INSERT INTO tour_slots (slot_date, slot_time, capacity, booked_count, notes) VALUES
  (CURDATE(), '10:00:00', 5, 0, 'Morning school tour'),
  (DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:30:00', 5, 0, 'Classroom walkthrough'),
  (DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00', 4, 1, 'Afternoon parent visit'),
  (DATE_ADD(CURDATE(), INTERVAL 4 DAY), '10:30:00', 6, 0, 'Centre head available');

INSERT INTO tour_bookings (lead_id, slot_id, status, booked_by) VALUES
  (3, 3, 'confirmed', 3);

INSERT INTO admissions
  (lead_id, counsellor_id, program, start_date, fee_amount, fee_paid, admission_date, remarks)
VALUES
  (5, 2, 'Nursery', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 55000.00, 15000.00, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Admission confirmed after demo visit.');

INSERT INTO notifications (counsellor_id, lead_id, type, message, priority) VALUES
  (2, 1, 'follow-up-due', 'Follow-up due today for Ananya Rao.', 'urgent'),
  (3, 4, 'overdue-lead', 'Follow-up is overdue for Vikram Reddy.', 'urgent');
