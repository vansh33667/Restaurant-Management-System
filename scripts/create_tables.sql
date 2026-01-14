-- PostgreSQL CREATE TABLE queries for Hotel Management Software

-- 1. Orders Table
CREATE TABLE orders (
    order_id VARCHAR(8) PRIMARY KEY,
    order_date DATE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(15),    node scripts/postgres_connection.js    node scripts/postgres_connection.js
    table_number INTEGER,
    num_of_persons INTEGER NOT NULL,
    total_items INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daily Thali Menu Table
CREATE TABLE thali_menu (
    id SERIAL PRIMARY KEY,
    menu_date DATE NOT NULL,
    thali_items TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Banquet Bookings Table
CREATE TABLE banquet_bookings (
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

-- 4. Workers Table
CREATE TABLE workers (
    id SERIAL PRIMARY KEY,
    worker_name VARCHAR(100) NOT NULL,
    mobile_no VARCHAR(15),
    role VARCHAR(50) NOT NULL,
    joining_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Worker Attendance Table
CREATE TABLE worker_attendance (
    id SERIAL PRIMARY KEY,
    attendance_date DATE NOT NULL,
    worker_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Present', 'Absent', 'Half Day', 'Leave')),
    notes VARCHAR(50000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Daily Expenses Table
CREATE TABLE daily_expenses (
    id SERIAL PRIMARY KEY,
    expense_date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    amount INTEGER NOT NULL,
    payment_mode VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Worker Salary Table
CREATE TABLE worker_salary (
    id SERIAL PRIMARY KEY,
    salary_date DATE NOT NULL,
    worker_name VARCHAR(100) NOT NULL,
    monthly_salary INTEGER NOT NULL,
    advance_amount INTEGER NOT NULL DEFAULT 0,
    bonus_amount INTEGER NOT NULL DEFAULT 0,
    final_salary INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);