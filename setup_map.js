const mysql = require('mysql2/promise');

async function setupMapData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vitalis_db'
  });

  console.log("Connected to MySQL...");

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        type VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Safe',
        current_patients INT DEFAULT 0
      )
    `);
    console.log("Table 'hospitals' created or already exists.");

    await connection.query('TRUNCATE TABLE hospitals');

    const seedHospitals = [
      { name: "M.Y. Hospital Indore", lat: 22.71353, lng: 75.87956, type: "General Government", status: "Critical", current_patients: 1240 },
      { name: "P.C. Sethi Hospital", lat: 22.70861, lng: 75.87864, type: "District Hospital", status: "Warning", current_patients: 450 },
      { name: "Super Speciality Hospital", lat: 22.7164, lng: 75.8762, type: "Speciality Hospital", status: "Safe", current_patients: 210 },
      { name: "District Hospital, Dhar Rd", lat: 22.7093, lng: 75.8344, type: "District Hospital", status: "Safe", current_patients: 320 }
    ];

    for (const h of seedHospitals) {
      await connection.query(
        'INSERT INTO hospitals (name, lat, lng, type, status, current_patients) VALUES (?, ?, ?, ?, ?, ?)',
        [h.name, h.lat, h.lng, h.type, h.status, h.current_patients]
      );
    }
    console.log("Hospitals seed data inserted successfully.");
  } catch (err) {
    console.error("Error setting up map data:", err);
  } finally {
    await connection.end();
  }
}

setupMapData();
