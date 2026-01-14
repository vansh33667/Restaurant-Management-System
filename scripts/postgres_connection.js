// PostgreSQL Connection Test for Hotel Management Software
// Run with: node scripts/postgres_connection.js

require('dotenv').config();
const { Pool } = require('pg');

// PostgreSQL connection configuration using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'hotel_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
});

// Test basic connection
async function testConnection() {
  console.log('🔄 Testing PostgreSQL connection...');

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    // Test database exists
    const dbResult = await client.query('SELECT current_database() as db_name');
    console.log(`📊 Connected to database: ${dbResult.rows[0].db_name}`);

    // Test tables exist
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('📋 Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Run the create_tables.sql script first.');
    }

    client.release();
    console.log('✅ Connection test completed successfully!');

  } catch (err) {
    console.error('❌ Connection failed!');
    console.error('Error details:', err.message);

    if (err.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Make sure PostgreSQL is running');
      console.log('   2. Check if port 5432 is not blocked by firewall');
      console.log('   3. Verify PostgreSQL service is started');
    } else if (err.code === '28P01') {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check your username and password in .env file');
      console.log('   2. Make sure the user exists in PostgreSQL');
    } else if (err.code === '3D000') {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Create the database: CREATE DATABASE hotel_db;');
      console.log('   2. Check database name in .env file');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Example query function
async function getWorkers() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM workers ORDER BY created_at DESC');
    client.release();
    return result.rows;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
}

// Example insert function
async function addWorker(workerData) {
  try {
    const client = await pool.connect();
    const query = `
      INSERT INTO workers (worker_name, mobile_no, role, joining_date)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [workerData.name, workerData.mobile, workerData.role, workerData.joiningDate];
    const result = await client.query(query, values);
    client.release();
    return result.rows[0].id;
  } catch (err) {
    console.error('Error inserting worker', err);
    throw err;
  }
}

// Run connection test if this file is executed directly
if (require.main === module) {
  testConnection();
}

// Export functions for use in other modules
module.exports = {
  pool,
  getWorkers,
  addWorker,
  testConnection
};