# PostgreSQL Database Setup for Hotel Management Software

## Prerequisites
- PostgreSQL installed and running
- Node.js installed
- npm or yarn package manager

## Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE hotel_db;
```

### 2. Run Table Creation Script
Execute the SQL script in `scripts/create_tables.sql` in your PostgreSQL database.

### 3. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the database credentials in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=hotel_db
   DB_USER=your_postgres_username
   DB_PASSWORD=your_postgres_password
   ```

### 4. Install Dependencies
```bash
npm install pg dotenv
```

### 5. Test Connection
Run the connection example:
```bash
node scripts/postgres_connection.js
```

## Table Structure

### 1. orders
- Stores order information with 8-digit unique order IDs

### 2. thali_menu
- Daily thali menu items stored as comma-separated text

### 3. banquet_bookings
- Banquet hall booking information

### 4. workers
- Worker information and roles

### 5. worker_attendance
- Daily attendance records for workers

### 6. daily_expenses
- Daily expense tracking

### 7. worker_salary
- Worker salary management records

## Notes
- All tables use SERIAL PRIMARY KEY for auto-incrementing IDs
- Timestamps are automatically set to CURRENT_TIMESTAMP
- The worker_attendance table includes a CHECK constraint for status values
- VARCHAR lengths are set appropriately for expected data