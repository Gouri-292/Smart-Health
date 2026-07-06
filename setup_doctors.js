require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDoctors() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vitalis_db'
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialization VARCHAR(255),
        availability VARCHAR(100),
        attendance VARCHAR(50),
        rating DECIMAL(3,1),
        feedback_summary TEXT,
        image_url VARCHAR(255)
      )
    `);

    await connection.query("TRUNCATE TABLE doctors");

    const doctors = [
      { name: 'Dr. Aarav Patel', specialization: 'Chief Cardiologist', availability: 'Available', attendance: '98%', rating: 4.9, feedback_summary: 'Highly recommended by 120+ patients for attentive care.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&style=circle&backgroundColor=e2e8f0' },
      { name: 'Dr. Priya Sharma', specialization: 'Pediatrician', availability: 'In Surgery', attendance: '95%', rating: 4.8, feedback_summary: 'Excellent with children, very patient and knowledgeable.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&style=circle&backgroundColor=e2e8f0' },
      { name: 'Dr. Vikram Singh', specialization: 'Neurologist', availability: 'On Leave', attendance: '88%', rating: 4.6, feedback_summary: 'Thorough diagnosis, takes time to explain complex issues.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram&style=circle&backgroundColor=e2e8f0' },
      { name: 'Dr. Anjali Desai', specialization: 'Orthopedic Surgeon', availability: 'Consulting', attendance: '99%', rating: 4.7, feedback_summary: 'Successful surgeries, great post-op care routines.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali&style=circle&backgroundColor=e2e8f0' },
      { name: 'Dr. Rohan Gupta', specialization: 'General Physician', availability: 'Available', attendance: '92%', rating: 4.5, feedback_summary: 'Very accessible and gives practical, effective advice.', image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan&style=circle&backgroundColor=e2e8f0' }
    ];

    for (let doc of doctors) {
      await connection.query(
        'INSERT INTO doctors (name, specialization, availability, attendance, rating, feedback_summary, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [doc.name, doc.specialization, doc.availability, doc.attendance, doc.rating, doc.feedback_summary, doc.image_url]
      );
    }
    console.log("Seeded doctors successfully.");
  } catch (err) {
    console.error("Error setting up doctors:", err);
  } finally {
    await connection.end();
  }
}

setupDoctors();
