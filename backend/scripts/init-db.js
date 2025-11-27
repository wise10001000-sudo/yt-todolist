const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  // First, connect to default 'postgres' database to create our database
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log('🔍 Connecting to PostgreSQL...');

    // Check if database exists
    const dbCheckResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`📦 Creating database '${process.env.DB_NAME}'...`);
      await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log('✅ Database created successfully!');
    } else {
      console.log(`ℹ️  Database '${process.env.DB_NAME}' already exists.`);
    }

    await adminPool.end();

    // Now connect to our new database and apply schema
    const appPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log(`\n📄 Reading schema file...`);
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('🔧 Applying schema...');
    await appPool.query(schema);
    console.log('✅ Schema applied successfully!');

    // Verify tables were created
    const tablesResult = await appPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    await appPool.end();
    console.log('\n🎉 Database initialization complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initDatabase();
