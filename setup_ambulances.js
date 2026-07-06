require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupAmbulances() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vitalis_db'
  });

  try {
    // Ambulances table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ambulances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_number VARCHAR(50) NOT NULL,
        status VARCHAR(50),
        driver_name VARCHAR(100),
        driver_phone VARCHAR(50),
        equipment_level VARCHAR(100),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8)
      )
    `);

    // Ambulance Trips table for the timeline
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ambulance_trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ambulance_id INT,
        patient_name VARCHAR(100),
        pickup_location VARCHAR(255),
        dropoff_location VARCHAR(255),
        status VARCHAR(50),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query("TRUNCATE TABLE ambulances");
    await connection.query("TRUNCATE TABLE ambulance_trips");

    // Seed Ambulances (around Indore: lat 22.7196, lng 75.8577)
    const ambulances = [
      { vehicle_number: 'MP09-AB-1234', status: 'Available', driver_name: 'Rajesh Kumar', driver_phone: '+91 9876543210', equipment_level: 'Advanced Life Support', lat: 22.7196, lng: 75.8577 },
      { vehicle_number: 'MP09-XY-9876', status: 'Busy', driver_name: 'Suresh Singh', driver_phone: '+91 8765432109', equipment_level: 'Basic Life Support', lat: 22.7300, lng: 75.8600 },
      { vehicle_number: 'MP09-CD-5678', status: 'Available', driver_name: 'Anil Verma', driver_phone: '+91 7654321098', equipment_level: 'Advanced Life Support', lat: 22.7100, lng: 75.8450 },
      { vehicle_number: 'MP09-LM-3456', status: 'Busy', driver_name: 'Prakash Rao', driver_phone: '+91 6543210987', equipment_level: 'Basic Life Support', lat: 22.7400, lng: 75.8750 },
      { vehicle_number: 'MP09-PQ-1122', status: 'Maintenance', driver_name: 'Manoj Patel', driver_phone: '+91 5432109876', equipment_level: 'Advanced Life Support', lat: 22.7500, lng: 75.8900 }
    ];

    for (let amb of ambulances) {
      await connection.query(
        'INSERT INTO ambulances (vehicle_number, status, driver_name, driver_phone, equipment_level, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [amb.vehicle_number, amb.status, amb.driver_name, amb.driver_phone, amb.equipment_level, amb.lat, amb.lng]
      );
    }

    // Seed Trips
    const trips = [
      { ambulance_id: 2, patient_name: 'Rahul Sharma', pickup_location: 'Palasia Square', dropoff_location: 'MY Hospital', status: 'En Route' },
      { ambulance_id: 4, patient_name: 'Meena Devi', pickup_location: 'Bhawarkuan', dropoff_location: 'Choithram Hospital', status: 'En Route' },
      { ambulance_id: 1, patient_name: 'Anjali Gupta', pickup_location: 'Vijay Nagar', dropoff_location: 'Bombay Hospital', status: 'Completed' },
      { ambulance_id: 3, patient_name: 'Ramesh Jain', pickup_location: 'Rajwada', dropoff_location: 'District Hospital', status: 'Completed' }
    ];

    for (let trip of trips) {
      // Create timestamps for chronological order
      await connection.query(
        'INSERT INTO ambulance_trips (ambulance_id, patient_name, pickup_location, dropoff_location, status, timestamp) VALUES (?, ?, ?, ?, ?, NOW() - INTERVAL ? MINUTE)',
        [trip.ambulance_id, trip.patient_name, trip.pickup_location, trip.dropoff_location, trip.status, Math.floor(Math.random() * 120)]
      );
    }

    console.log("Seeded ambulances and trips successfully.");
  } catch (err) {
    console.error("Error setting up ambulances:", err);
  } finally {
    await connection.end();
  }
}

setupAmbulances();
