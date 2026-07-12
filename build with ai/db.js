const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'db.json');

function readDb() {
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json, returning empty database', error);
    return {};
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json', error);
  }
}

const db = {
  getCollection(key) {
    const data = readDb();
    return data[key];
  },
  
  saveCollection(key, collectionData) {
    const data = readDb();
    data[key] = collectionData;
    writeDb(data);
    return collectionData;
  },

  updateStats(statsUpdate) {
    const data = readDb();
    data.dashboard_stats = { ...data.dashboard_stats, ...statsUpdate };
    writeDb(data);
    return data.dashboard_stats;
  }
};

module.exports = db;
