/* ============================================================
   db.js — Simple JSON File Database (No MongoDB needed!)
   Reads/writes JSON files in /data/ folder
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection(collection) {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeCollection(collection, data) {
  fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2));
}

// Simple DB object mimicking MongoDB-like interface
const db = {
  // Find all documents
  find(collection, query = {}) {
    let data = readCollection(collection);
    if (query.isActive !== undefined) data = data.filter(d => d.isActive === query.isActive);
    if (query.isApproved !== undefined) data = data.filter(d => d.isApproved === query.isApproved);
    if (query.isFeatured !== undefined) data = data.filter(d => d.isFeatured === query.isFeatured);
    if (query.status !== undefined) data = data.filter(d => d.status === query.status);
    return data;
  },

  // Find one by ID
  findById(collection, id) {
    return readCollection(collection).find(d => d._id === id) || null;
  },

  // Find one by field
  findOne(collection, query) {
    const data = readCollection(collection);
    return data.find(item => {
      return Object.entries(query).every(([k, v]) => item[k] === v);
    }) || null;
  },

  // Create new document
  create(collection, document) {
    const data = readCollection(collection);
    const newDoc = {
      _id: uuidv4(),
      ...document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Auto order number for orders
    if (collection === 'orders' && !newDoc.orderNumber) {
      newDoc.orderNumber = `INK-${String(data.length + 1).padStart(5, '0')}`;
    }
    data.push(newDoc);
    writeCollection(collection, data);
    return newDoc;
  },

  // Update by ID
  updateById(collection, id, update) {
    const data = readCollection(collection);
    const idx = data.findIndex(d => d._id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...update, updatedAt: new Date().toISOString() };
    writeCollection(collection, data);
    return data[idx];
  },

  // Delete by ID
  deleteById(collection, id) {
    const data = readCollection(collection);
    const filtered = data.filter(d => d._id !== id);
    writeCollection(collection, filtered);
    return true;
  },

  // Count documents
  count(collection, query = {}) {
    return this.find(collection, query).length;
  },

  // Sort helper
  sort(arr, field = 'order', dir = 1) {
    return [...arr].sort((a, b) => {
      const va = a[field] ?? 0;
      const vb = b[field] ?? 0;
      return dir * (va > vb ? 1 : va < vb ? -1 : 0);
    });
  },

  // Upsert settings key
  upsertSetting(key, value) {
    const data = readCollection('settings');
    const idx = data.findIndex(d => d.key === key);
    if (idx >= 0) {
      data[idx] = { ...data[idx], value, updatedAt: new Date().toISOString() };
    } else {
      data.push({ _id: uuidv4(), key, value, createdAt: new Date().toISOString() });
    }
    writeCollection('settings', data);
  },

  getSettings() {
    const arr = readCollection('settings');
    const result = {};
    arr.forEach(s => result[s.key] = s.value);
    return result;
  }
};

module.exports = db;
