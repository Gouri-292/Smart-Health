require('dotenv').config();
const { Client } = require('pg');

async function addRoles() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Ensure users table exists with role
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin'
      )
    `);

    // Check if column exists, if not add it (Postgres style)
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='role'
    `);

    if (result.rowCount === 0) {
      await client.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'admin'");
      console.log("Added 'role' column to users table.");
    }

    // Clear existing users to cleanly set up the three roles
    await client.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    const users = [
      { name: 'Dr. Sarah Chen', email: 'admin@health.gov.in', password: 'admin', role: 'admin' },
      { name: 'Dr. John Doe', email: 'doctor@health.gov.in', password: 'admin', role: 'doctor' },
      { name: 'Inv. Manager', email: 'inventory@health.gov.in', password: 'admin', role: 'inventory' }
    ];

    for (let u of users) {
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        [u.name, u.email, u.password, u.role]
      );
    }
    console.log("Seeded role-based users successfully.");
  } catch (err) {
    console.error("Error setting up roles:", err);
  } finally {
    await client.end();
  }
}

addRoles();
