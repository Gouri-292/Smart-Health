require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDB() {
    console.log("Starting MySQL Database Initialization...");

    try {
        // Connect without database first to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: ''
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS vitalis_db');
        console.log("Database 'vitalis_db' verified/created.");
        await connection.end();

        // Reconnect with database
        const db = await mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'vitalis_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Read seed data
        const seedPath = path.join(__dirname, 'db.json');
        const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

        // 1. Users Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(191) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(100)
            )
        `);
        const [usersCheck] = await db.query('SELECT COUNT(*) as count FROM users');
        if (usersCheck[0].count === 0 && seedData.users) {
            for (let user of seedData.users) {
                await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                    [user.name, user.email, user.password, user.role]);
            }
            console.log("Seeded 'users' table.");
        }

        // 2. Dashboard Stats Table (Singleton)
        await db.query('DROP TABLE IF EXISTS dashboard_stats');
        await db.query(`
            CREATE TABLE IF NOT EXISTS dashboard_stats (
                id INT PRIMARY KEY DEFAULT 1,
                total_phcs INT,
                total_chcs INT,
                today_patients INT,
                doctors_present INT,
                ai_health_score INT,
                critical_alerts INT,
                active_ambulances INT,
                max_ambulances INT,
                vaccine_coverage INT
            )
        `);
        const [statsCheck] = await db.query('SELECT COUNT(*) as count FROM dashboard_stats');
        if (statsCheck[0].count === 0 && seedData.dashboard_stats) {
            const s = seedData.dashboard_stats;
            await db.query(`INSERT INTO dashboard_stats 
                (id, total_phcs, total_chcs, today_patients, doctors_present, ai_health_score, critical_alerts, active_ambulances, max_ambulances, vaccine_coverage) 
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [s.total_phcs, s.total_chcs, s.today_patients, s.doctors_present, s.ai_health_score, s.critical_alerts, s.active_ambulances, s.max_ambulances, s.vaccine_coverage]);
            console.log("Seeded 'dashboard_stats' table.");
        }

        // 3. Activities Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS activities (
                id BIGINT PRIMARY KEY,
                title VARCHAR(255),
                description TEXT,
                time_ago VARCHAR(100),
                type VARCHAR(50)
            )
        `);
        const [actCheck] = await db.query('SELECT COUNT(*) as count FROM activities');
        if (actCheck[0].count === 0 && seedData.activities) {
            for (let act of seedData.activities) {
                await db.query('INSERT INTO activities (id, title, description, time_ago, type) VALUES (?, ?, ?, ?, ?)',
                    [act.id, act.title, act.description, act.time_ago, act.type]);
            }
            console.log("Seeded 'activities' table.");
        }

        // 4. Predictions Table (Singleton)
        await db.query('DROP TABLE IF EXISTS predictions');
        await db.query(`
            CREATE TABLE IF NOT EXISTS predictions (
                id INT PRIMARY KEY DEFAULT 1,
                expected_patient_load VARCHAR(50),
                patient_load_trend VARCHAR(255),
                patient_confidence VARCHAR(50),
                disease_outbreak_risk VARCHAR(50),
                disease_risk_trend VARCHAR(255),
                disease_confidence VARCHAR(50),
                medicine_shortage_count INT,
                medicine_shortage_trend VARCHAR(255),
                medicine_confidence VARCHAR(50)
            )
        `);
        const [predCheck] = await db.query('SELECT COUNT(*) as count FROM predictions');
        if (predCheck[0].count === 0 && seedData.predictions) {
            const p = seedData.predictions;
            await db.query(`INSERT INTO predictions 
                (id, expected_patient_load, patient_load_trend, patient_confidence, disease_outbreak_risk, disease_risk_trend, disease_confidence, medicine_shortage_count, medicine_shortage_trend, medicine_confidence) 
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.expected_patient_load, p.patient_load_trend, p.patient_confidence, p.disease_outbreak_risk, p.disease_risk_trend, p.disease_confidence, p.medicine_shortage_count, p.medicine_shortage_trend, p.medicine_confidence]);
            console.log("Seeded 'predictions' table.");
        }

        // 5. Prescriptive Actions Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS prescriptive_actions (
                id INT PRIMARY KEY,
                title VARCHAR(255),
                description TEXT,
                type VARCHAR(100),
                approved BOOLEAN,
                reviewed BOOLEAN
            )
        `);
        const [actionsCheck] = await db.query('SELECT COUNT(*) as count FROM prescriptive_actions');
        if (actionsCheck[0].count === 0 && seedData.prescriptive_actions) {
            for (let a of seedData.prescriptive_actions) {
                await db.query('INSERT INTO prescriptive_actions (id, title, description, type, approved, reviewed) VALUES (?, ?, ?, ?, ?, ?)',
                    [a.id, a.title, a.description, a.type, a.approved, a.reviewed]);
            }
            console.log("Seeded 'prescriptive_actions' table.");
        }

        // 6. PHC Staff Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS phc_staff (
                id INT PRIMARY KEY,
                name VARCHAR(255),
                role VARCHAR(100),
                department VARCHAR(100),
                status VARCHAR(50),
                patients_seen INT,
                rating DECIMAL(3,1)
            )
        `);
        const [staffCheck] = await db.query('SELECT COUNT(*) as count FROM phc_staff');
        if (staffCheck[0].count === 0 && seedData.phc_staff) {
            for (let s of seedData.phc_staff) {
                await db.query('INSERT INTO phc_staff (id, name, role, department, status, patients_seen, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [s.id, s.name, s.role, s.department, s.status, s.patients_seen, s.rating]);
            }
            console.log("Seeded 'phc_staff' table.");
        }

        // 7. PHC Queue Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS phc_queue (
                id VARCHAR(50) PRIMARY KEY,
                patient_name VARCHAR(255),
                department VARCHAR(100),
                status VARCHAR(50),
                waiting_time VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        const [queueCheck] = await db.query('SELECT COUNT(*) as count FROM phc_queue');
        if (queueCheck[0].count === 0 && seedData.phc_queue) {
            for (let q of seedData.phc_queue) {
                await db.query('INSERT INTO phc_queue (id, patient_name, department, status, waiting_time) VALUES (?, ?, ?, ?, ?)',
                    [q.id, q.patient_name, q.department, q.status, q.waiting_time]);
            }
            console.log("Seeded 'phc_queue' table.");
        }

        // 8. Inventory Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INT PRIMARY KEY,
                name VARCHAR(255),
                stock_level INT,
                required_stock INT,
                expiry_date VARCHAR(50),
                status VARCHAR(50)
            )
        `);
        const [invCheck] = await db.query('SELECT COUNT(*) as count FROM inventory');
        if (invCheck[0].count === 0 && seedData.inventory) {
            for (let i of seedData.inventory) {
                await db.query('INSERT INTO inventory (id, name, stock_level, required_stock, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [i.id, i.name, i.stock_level, i.required_stock, i.expiry_date, i.status]);
            }
            console.log("Seeded 'inventory' table.");
        }

        console.log("Database initialization completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Error initializing database:", error);
        process.exit(1);
    }
}

initDB();
