# PostgreSQL Installation & Connection Guide (Windows)

## Step 1: Download & Install PostgreSQL

### Option A: Using Installer (Recommended)
1. Go to: https://www.postgresql.org/download/windows/
2. Download the latest version (15.x or 16.x)
3. Run the installer as Administrator
4. During installation:
   - Choose components: PostgreSQL Server, pgAdmin, Command Line Tools
   - Set password for postgres user (remember this!)
   - Keep default port: 5432
   - Keep default locale

### Option B: Using Chocolatey (if you have it)
```powershell
choco install postgresql
```

## Step 2: Verify Installation

### Open Command Prompt as Administrator and run:
```cmd
psql --version
```

Should show: `psql (PostgreSQL) 15.x.x` or similar

## Step 3: Start PostgreSQL Service

### Method 1: Services Panel
1. Press Win + R, type `services.msc`
2. Find "postgresql-x64-15" (or your version)
3. Right-click → Start

### Method 2: Command Line
```cmd
net start postgresql-x64-15
```

## Step 4: Connect to PostgreSQL

### Method 1: Using psql (Command Line)
```cmd
psql -U postgres -h localhost
```
Enter the password you set during installation

### Method 2: Using pgAdmin (GUI)
1. Search for "pgAdmin" in Start menu
2. Open pgAdmin
3. It should auto-connect to your local PostgreSQL
4. If not, right-click "Servers" → Create → Server
   - Name: Local PostgreSQL
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: your_password

## Step 5: Create Database

### Using psql:
```sql
CREATE DATABASE hotel_db;
\l  -- List all databases to verify
\q  -- Quit
```

### Using pgAdmin:
1. Right-click "Databases" → Create → Database
2. Name: hotel_db
3. Owner: postgres
4. Click Save

## Step 6: Create Tables

### Using psql:
```cmd
psql -U postgres -d hotel_db -f scripts/create_tables.sql
```

### Using pgAdmin:
1. Open Query Tool (Tools → Query Tool)
2. Copy the contents of `scripts/create_tables.sql`
3. Click the Execute button (play icon)

## Step 7: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Edit `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=postgres
DB_PASSWORD=your_actual_password_here
```

## Step 8: Install Node.js Dependencies

```cmd
cd C:\Users\Vansh\Downloads\hotelmanagementsoftware1
npm install pg dotenv
```

## Step 9: Test Connection

```cmd
node scripts/postgres_connection.js
```

If successful, you should see:
- Connection established
- No errors in console

## Troubleshooting

### Error: "psql: FATAL: password authentication failed"
- Make sure you're using the correct password
- Try: `psql -U postgres -h localhost -W`

### Error: "could not connect to server"
- Check if PostgreSQL service is running
- Verify port 5432 is not blocked by firewall

### Error: "role 'postgres' does not exist"
- Use the username you created during installation

### Error: "database 'hotel_db' does not exist"
- Create the database first: `createdb -U postgres hotel_db`

## Useful Commands

```sql
-- Connect to database
psql -U postgres -d hotel_db

-- List databases
\l

-- List tables
\dt

-- Describe table
\d table_name

-- Exit psql
\q
```

## Alternative: Using Docker (if you prefer)

```cmd
docker run --name postgres-hotel -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=hotel_db -p 5432:5432 -d postgres:15
```

Then update `.env`:
```
DB_USER=postgres
DB_PASSWORD=mypassword
```