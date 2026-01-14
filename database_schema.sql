-- PostgreSQL Database Schema for Hotel Management System
-- Run this in psql or pgAdmin

-- Create database
CREATE DATABASE hotel_management;

-- Connect to database
\c hotel_management;

-- Create sequence for order_id
CREATE SEQUENCE order_id_seq START 1;

-- Create function to generate 8-digit order_id
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS VARCHAR(8) AS $$
BEGIN
    RETURN LPAD(nextval('order_id_seq')::text, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- ADMIN TABLES

-- 1) Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(8) UNIQUE DEFAULT generate_order_id(),
    order_date DATE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15),
    table_number INTEGER,
    num_of_persons INTEGER NOT NULL,
    total_items INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Thali Menu Table
CREATE TABLE thali_menu (
    id SERIAL PRIMARY KEY,
    menu_date DATE NOT NULL,
    thali_items TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3) Banquet Management Table
CREATE TABLE banquet_management (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    alternate_number VARCHAR(15),
    address TEXT,
    event_type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    expected_guests INTEGER NOT NULL,
    amenities_required TEXT,
    menu_package VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4) Workers Management Table
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    worker_name VARCHAR(100) NOT NULL,
    mobile_no VARCHAR(15),
    role VARCHAR(50) NOT NULL,
    joining_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5) Worker Attendance Table
CREATE TABLE worker_attendance (
    id SERIAL PRIMARY KEY,
    attendance_date DATE NOT NULL,
    worker_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Half Day', 'Leave')),
    notes VARCHAR(50000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CASHIER TABLES

-- 6) Daily Expenses Table
CREATE TABLE daily_expenses (
    id SERIAL PRIMARY KEY,
    expense_date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7) Worker Salary Management Table
CREATE TABLE worker_salary (
    id SERIAL PRIMARY KEY,
    salary_date DATE NOT NULL,
    worker_name VARCHAR(100) NOT NULL,
    monthly_salary DECIMAL(10,2) NOT NULL,
    advance DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    final_salary DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table for Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Cashier')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO users (username, password, name, role) VALUES
('admin', 'admin123', 'Administrator', 'Admin'),
('cashier', 'cashier123', 'Cashier', 'Cashier');