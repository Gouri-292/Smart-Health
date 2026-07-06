require('dotenv').config();
const mysql = require('mysql2/promise');

async function addRoles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vitalis_db'
  });

  try {
    // Check if column exists, if not add it
    const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");
    if (columns.length === 0) {
      await connection.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'admin'");
      console.log("Added 'role' column to users table.");
    }

    // Clear existing users to cleanly set up the three roles
    await connection.query("TRUNCATE TABLE users");

    const users = [
      { name: 'Dr. Sarah Chen', email: 'admin@health.gov.in', password: 'admin', role: 'admin' },
      { name: 'Dr. John Doe', email: 'doctor@health.gov.in', password: 'admin', role: 'doctor' },
      { name: 'Inv. Manager', email: 'inventory@health.gov.in', password: 'admin', role: 'inventory' }
    ];

    for (let u of users) {
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [u.name, u.email, u.password, u.role]
      );
    }
    console.log("Seeded role-based users successfully.");
  } catch (err) {
    console.error("Error setting up roles:", err);
  } finally {
    await connection.end();
  }
}

addRoles();
