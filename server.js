require('dotenv').config();
console.log("Loaded API Key:", process.env.GEMINI_API_KEY ? "YES (starts with " + process.env.GEMINI_API_KEY.substring(0, 4) + ")" : "NO KEY FOUND");
const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Type, Schema } = require('@google/genai');
const db = require('./db_pg');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


app.use(cors());
app.use(express.json());

// Log API requests
app.use((req, res, next) => {
  console.log(`[API Request] ${req.method} ${req.url}`);
  next();
});

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

    if (rows.length > 0) {
      const user = rows[0];
      res.json({
        success: true,
        message: 'Login successful',
        user: { email: user.email, name: user.name, role: user.role }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dashboard_stats WHERE id = 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/dashboard/activities', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM activities ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Predictions Routes
app.get('/api/predictions', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM predictions WHERE id = 1');
    res.json(rows[0] || {});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/predictions/actions', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM prescriptive_actions');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/predictions/actions/:id/approve', async (req, res) => {
  try {
    const actionId = parseInt(req.params.id);
    const [actions] = await db.query('SELECT * FROM prescriptive_actions WHERE id = ?', [actionId]);

    if (actions.length > 0) {
      await db.query('UPDATE prescriptive_actions SET approved = true, reviewed = true WHERE id = ?', [actionId]);

      const newActivity = {
        id: Date.now(),
        title: `AI Action Approved`,
        description: `Approved: ${actions[0].title}`,
        time_ago: "Just now",
        type: "success"
      };

      await db.query('INSERT INTO activities (id, title, description, time_ago, type) VALUES (?, ?, ?, ?, ?)',
        [newActivity.id, newActivity.title, newActivity.description, newActivity.time_ago, newActivity.type]);

      await db.query('UPDATE dashboard_stats SET critical_alerts = GREATEST(0, critical_alerts - 1) WHERE id = 1');

      const [stats] = await db.query('SELECT * FROM dashboard_stats WHERE id = 1');
      const [updatedAction] = await db.query('SELECT * FROM prescriptive_actions WHERE id = ?', [actionId]);

      res.json({ success: true, action: updatedAction[0], stats: stats[0] });
    } else {
      res.status(404).json({ success: false, message: 'Action not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Health Centre Routes (Staff & Queue)
app.get('/api/phc/:phc_id/staff', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM phc_staff');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Map Route
app.get('/api/hospitals/map', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hospitals');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Doctors Route
app.get('/api/doctors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM doctors');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const { name, specialization } = req.body;
    const image_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}&style=circle&backgroundColor=e2e8f0`;
    await db.query(
      'INSERT INTO doctors (name, specialization, availability, attendance, rating, feedback_summary, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, specialization, 'Available', '100%', 5.0, 'New doctor joined the team.', image_url]
    );
    const [doctors] = await db.query('SELECT * FROM doctors');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add doctor' });
  }
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json([
    { id: 1, title: 'Inventory Alert', message: 'Paracetamol batch out for delivery.', type: 'info', time: '5m ago' },
    { id: 2, title: 'Patient Queue', message: 'High surge in Emergency department.', type: 'warning', time: '12m ago' },
    { id: 3, title: 'System', message: 'Scheduled maintenance tonight at 2AM.', type: 'alert', time: '1h ago' }
  ]);
});

// Hospitals Search
app.get('/api/hospitals/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const [rows] = await db.query('SELECT * FROM hospitals WHERE name ILIKE ? OR type ILIKE ? LIMIT 5', [`%${query}%`, `%${query}%`]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Hospitals Export
app.get('/api/hospitals/export', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM hospitals');
    let csv = 'ID,Name,Type,Status,Current Patients\n';
    rows.forEach(r => {
      csv += `${r.id},"${r.name}","${r.type}","${r.status}",${r.current_patients}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="hospitals_report.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// Ambulances Routes
app.get('/api/ambulances', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ambulances');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/ambulances/trips', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, a.vehicle_number 
      FROM ambulance_trips t 
      JOIN ambulances a ON t.ambulance_id = a.id 
      ORDER BY t.timestamp DESC LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/phc/:phc_id/queue', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM phc_queue');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/phc/:phc_id/queue', async (req, res) => {
  try {
    const { patient_name, department } = req.body;
    const [rows] = await db.query('SELECT id FROM phc_queue ORDER BY created_at DESC LIMIT 1');

    let nextTokenNum = 88;
    if (rows.length > 0) {
      const match = rows[0].id.match(/T-(\d+)/);
      if (match) {
        nextTokenNum = parseInt(match[1]) + 1;
      }
    }

    const newId = `T-0${nextTokenNum}`;

    await db.query('INSERT INTO phc_queue (id, patient_name, department, status, waiting_time) VALUES (?, ?, ?, ?, ?)',
      [newId, patient_name, department, 'Waiting', '1m']);

    await db.query('UPDATE dashboard_stats SET today_patients = today_patients + 1 WHERE id = 1');

    const [queue] = await db.query('SELECT * FROM phc_queue');
    res.status(201).json({
      success: true,
      patient: { id: newId, patient_name, department, status: 'Waiting', waiting_time: '1m' },
      queue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/phc/:phc_id/queue/:id/status', async (req, res) => {
  try {
    const patientId = req.params.id;
    const { status } = req.body;

    const [patientRows] = await db.query('SELECT * FROM phc_queue WHERE id = ?', [patientId]);

    if (patientRows.length > 0) {
      if (status === 'Completed') {
        const removedPatient = patientRows[0];
        await db.query('DELETE FROM phc_queue WHERE id = ?', [patientId]);

        await db.query('INSERT INTO activities (id, title, description, time_ago, type) VALUES (?, ?, ?, ?, ?)',
          [Date.now(), 'Patient Consultation Done', `${removedPatient.patient_name} consultation completed in ${removedPatient.department}.`, 'Just now', 'success']);

        const [queue] = await db.query('SELECT * FROM phc_queue');
        res.json({ success: true, removed: true, queue });
      } else {
        const waitingTime = status === 'In Consultation' ? '0m' : patientRows[0].waiting_time;
        await db.query('UPDATE phc_queue SET status = ?, waiting_time = ? WHERE id = ?', [status, waitingTime, patientId]);

        const [queue] = await db.query('SELECT * FROM phc_queue');
        const [updatedPatient] = await db.query('SELECT * FROM phc_queue WHERE id = ?', [patientId]);
        res.json({ success: true, patient: updatedPatient[0], queue });
      }
    } else {
      res.status(404).json({ success: false, message: 'Patient not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Inventory Routes
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

async function updateInventoryStats() {
  const [critical] = await db.query("SELECT COUNT(*) as c FROM inventory WHERE status = 'Critical'");
  const [low] = await db.query("SELECT COUNT(*) as c FROM inventory WHERE status = 'Low'");
  const count = critical[0].c + low[0].c;
  await db.query('UPDATE dashboard_stats SET critical_alerts = ? WHERE id = 1', [count]);
}

app.post('/api/inventory/add-stock', async (req, res) => {
  try {
    const { id, amount } = req.body;
    const [items] = await db.query('SELECT * FROM inventory WHERE id = ?', [parseInt(id)]);

    if (items.length > 0) {
      const item = items[0];
      const newStock = item.stock_level + parseInt(amount);

      let newStatus = 'Critical';
      if (newStock >= item.required_stock) newStatus = 'Safe';
      else if (newStock > (item.required_stock * 0.4)) newStatus = 'Low';

      await db.query('UPDATE inventory SET stock_level = ?, status = ? WHERE id = ?', [newStock, newStatus, parseInt(id)]);
      await updateInventoryStats();

      const [inventory] = await db.query('SELECT * FROM inventory');
      const [updated] = await db.query('SELECT * FROM inventory WHERE id = ?', [parseInt(id)]);

      res.json({ success: true, item: updated[0], inventory });
    } else {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/inventory/transfer', async (req, res) => {
  try {
    const { id, from, to, amount } = req.body;
    const [items] = await db.query('SELECT * FROM inventory WHERE id = ?', [parseInt(id)]);

    if (items.length > 0) {
      const item = items[0];
      const newStock = item.stock_level + parseInt(amount);

      let newStatus = 'Critical';
      if (newStock >= item.required_stock) newStatus = 'Safe';
      else if (newStock > (item.required_stock * 0.4)) newStatus = 'Low';

      await db.query('UPDATE inventory SET stock_level = ?, status = ? WHERE id = ?', [newStock, newStatus, parseInt(id)]);

      await db.query('INSERT INTO activities (id, title, description, time_ago, type) VALUES (?, ?, ?, ?, ?)',
        [Date.now(), 'Stock Transfer Authorized', `Transferred ${amount} units of ${item.name} from ${from} to ${to}.`, 'Just now', 'success']);

      await updateInventoryStats();

      const [inventory] = await db.query('SELECT * FROM inventory');
      const [updated] = await db.query('SELECT * FROM inventory WHERE id = ?', [parseInt(id)]);
      const [stats] = await db.query('SELECT * FROM dashboard_stats WHERE id = 1');

      res.json({ success: true, item: updated[0], inventory, stats: stats[0] });
    } else {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// AI Insights Route
app.post('/api/ai/generate', async (req, res) => {
  try {
    const [inventory] = await db.query('SELECT * FROM inventory');
    const [staff] = await db.query('SELECT * FROM phc_staff');
    const [queue] = await db.query('SELECT * FROM phc_queue');
    const [stats] = await db.query('SELECT * FROM dashboard_stats WHERE id = 1');

    const context = `
      Current Health Infrastructure State:
      - Inventory: ${JSON.stringify(inventory)}
      - Staff: ${JSON.stringify(staff)}
      - Queue: ${JSON.stringify(queue)}
      - Stats: ${JSON.stringify(stats[0])}
    `;

    const prompt = `
      Analyze the provided health infrastructure data.
      Generate exactly 1 predictions object and a list of up to 3 prescriptive actions.
      The predictions should relate to the current queues and stocks.
      The prescriptive actions should be realistic and suggest specific interventions like moving specific medicine with critical stock from one place to another, or reassigning specific doctors if queues are long.
      Return the response in structured JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt + "\\n" + context,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
              type: Type.OBJECT,
              properties: {
                expected_patient_load: { type: Type.STRING },
                patient_load_trend: { type: Type.STRING },
                patient_confidence: { type: Type.STRING },
                disease_outbreak_risk: { type: Type.STRING },
                disease_risk_trend: { type: Type.STRING },
                disease_confidence: { type: Type.STRING },
                medicine_shortage_count: { type: Type.INTEGER },
                medicine_shortage_trend: { type: Type.STRING },
                medicine_confidence: { type: Type.STRING }
              },
              required: ["expected_patient_load", "patient_load_trend", "patient_confidence", "disease_outbreak_risk", "disease_risk_trend", "disease_confidence", "medicine_shortage_count", "medicine_shortage_trend", "medicine_confidence"]
            },
            prescriptive_actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, description: "Use material symbols, e.g., 'local_pharmacy' or 'airport_shuttle' or 'person'" }
                },
                required: ["title", "description", "type"]
              }
            }
          },
          required: ["predictions", "prescriptive_actions"]
        }
      }
    });

    // Clean up potential markdown code blocks before parsing
    const cleanText = response.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const output = JSON.parse(cleanText);    // Save predictions
    const p = output.predictions;
    await db.query(`UPDATE predictions SET 
      expected_patient_load = ?, patient_load_trend = ?, patient_confidence = ?, 
      disease_outbreak_risk = ?, disease_risk_trend = ?, disease_confidence = ?, 
      medicine_shortage_count = ?, medicine_shortage_trend = ?, medicine_confidence = ? 
      WHERE id = 1`,
      [p.expected_patient_load, p.patient_load_trend, p.patient_confidence,
      p.disease_outbreak_risk, p.disease_risk_trend, p.disease_confidence,
      p.medicine_shortage_count, p.medicine_shortage_trend, p.medicine_confidence]);

    // Save prescriptive actions
    await db.query('TRUNCATE TABLE prescriptive_actions');
    let actionId = 1;
    for (let action of output.prescriptive_actions) {
      await db.query('INSERT INTO prescriptive_actions (id, title, description, type, approved, reviewed) VALUES (?, ?, ?, ?, false, false)',
        [actionId++, action.title, action.description, action.type]);
    }

    // Increment critical alerts since new actions were added
    await db.query('UPDATE dashboard_stats SET critical_alerts = critical_alerts + ? WHERE id = 1', [output.prescriptive_actions.length]);

    res.json({ success: true, data: output });
  } catch (error) {
    console.error("AI Gen Error:", error);
    res.status(500).json({ success: false, message: 'AI generation failed', error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  // Mock GPS Tracker Loop for Ambulances
  setInterval(async () => {
    try {
      // Only update 'Busy' (en route) ambulances
      const [busyAmbulances] = await db.query("SELECT * FROM ambulances WHERE status = 'Busy'");

      const updates = [];
      for (let amb of busyAmbulances) {
        // Simulate slight GPS movement (approx 10-50 meters)
        const latChange = (Math.random() - 0.5) * 0.001;
        const lngChange = (Math.random() - 0.5) * 0.001;

        const newLat = parseFloat(amb.latitude) + latChange;
        const newLng = parseFloat(amb.longitude) + lngChange;

        await db.query('UPDATE ambulances SET latitude = ?, longitude = ? WHERE id = ?', [newLat, newLng, amb.id]);

        updates.push({
          id: amb.id,
          vehicle_number: amb.vehicle_number,
          latitude: newLat,
          longitude: newLng,
          status: amb.status
        });
      }

      if (updates.length > 0) {
        io.emit('ambulance_location_update', updates);
      }
    } catch (error) {
      console.error("GPS Simulation Error:", error);
    }
  }, 3000); // Update every 3 seconds for live feel

  server.listen(PORT, () => {
    console.log(`[Server] PostgreSQL Express API server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
