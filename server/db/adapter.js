const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Lead = require('../models/Lead');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial empty JSON database structure
const initialDb = {
  users: [],
  leads: []
};

// Helper: read local JSON DB
const readJsonDb = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return initialDb;
  }
};

// Helper: write local JSON DB
const writeJsonDb = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Check if MongoDB is currently connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

const dbAdapter = {
  isMongoConnected,

  // --- USER OPERATIONS ---
  findUserByEmail: async (email) => {
    if (isMongoConnected()) {
      return await User.findOne({ email });
    }
    const db = readJsonDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findUserById: async (id) => {
    if (isMongoConnected()) {
      return await User.findById(id);
    }
    const db = readJsonDb();
    return db.users.find(u => u._id === id) || null;
  },

  createUser: async (userData) => {
    if (isMongoConnected()) {
      const newUser = new User(userData);
      return await newUser.save();
    }
    const db = readJsonDb();
    const newUser = {
      _id: Math.random().toString(36).substring(2, 9),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.users.push(newUser);
    writeJsonDb(db);
    return newUser;
  },

  // --- LEAD OPERATIONS ---
  findLeads: async (params = {}) => {
    if (isMongoConnected()) {
      // Build query object for Mongoose
      let query = {};
      if (params.search) {
        query.$or = [
          { name: { $regex: params.search, $options: 'i' } },
          { phone: { $regex: params.search, $options: 'i' } }
        ];
      }
      if (params.status) {
        query.status = params.status;
      }
      if (params.service) {
        query.serviceRequested = params.service;
      }

      let sortOptions = { createdAt: -1 };
      if (params.sortBy === 'oldest') {
        sortOptions = { createdAt: 1 };
      } else if (params.sortBy === 'name') {
        sortOptions = { name: 1 };
      }

      return await Lead.find(query).sort(sortOptions);
    }

    // JSON Fallback querying
    const db = readJsonDb();
    let filteredLeads = [...db.leads];

    // Filter by Search Query
    if (params.search) {
      const s = params.search.toLowerCase();
      filteredLeads = filteredLeads.filter(
        l => l.name.toLowerCase().includes(s) || l.phone.includes(s)
      );
    }

    // Filter by Status
    if (params.status) {
      filteredLeads = filteredLeads.filter(l => l.status === params.status);
    }

    // Filter by Service
    if (params.service) {
      filteredLeads = filteredLeads.filter(l => l.serviceRequested === params.service);
    }

    // Sort Results
    if (params.sortBy === 'oldest') {
      filteredLeads.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (params.sortBy === 'name') {
      filteredLeads.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: newest first
      filteredLeads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filteredLeads;
  },

  findLeadById: async (id) => {
    if (isMongoConnected()) {
      return await Lead.findById(id);
    }
    const db = readJsonDb();
    return db.leads.find(l => l._id === id) || null;
  },

  createLead: async (leadData) => {
    if (isMongoConnected()) {
      const newLead = new Lead(leadData);
      return await newLead.save();
    }
    const db = readJsonDb();
    const newLead = {
      _id: Math.random().toString(36).substring(2, 9),
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email.toLowerCase(),
      serviceRequested: leadData.serviceRequested,
      source: leadData.source || 'website',
      status: 'New',
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.leads.push(newLead);
    writeJsonDb(db);
    return newLead;
  },

  updateLeadStatus: async (id, status, userName) => {
    if (isMongoConnected()) {
      const lead = await Lead.findById(id);
      if (!lead) return null;
      lead.status = status;
      lead.notes.push({
        text: `Status updated to "${status}"`,
        addedBy: userName
      });
      return await lead.save();
    }

    const db = readJsonDb();
    const leadIdx = db.leads.findIndex(l => l._id === id);
    if (leadIdx === -1) return null;

    db.leads[leadIdx].status = status;
    db.leads[leadIdx].notes.push({
      text: `Status updated to "${status}"`,
      addedBy: userName,
      createdAt: new Date()
    });
    db.leads[leadIdx].updatedAt = new Date();

    writeJsonDb(db);
    return db.leads[leadIdx];
  },

  addLeadNote: async (id, text, userName) => {
    if (isMongoConnected()) {
      const lead = await Lead.findById(id);
      if (!lead) return null;
      lead.notes.push({ text, addedBy: userName });
      return await lead.save();
    }

    const db = readJsonDb();
    const leadIdx = db.leads.findIndex(l => l._id === id);
    if (leadIdx === -1) return null;

    db.leads[leadIdx].notes.push({
      text,
      addedBy: userName,
      createdAt: new Date()
    });
    db.leads[leadIdx].updatedAt = new Date();

    writeJsonDb(db);
    return db.leads[leadIdx];
  },

  // --- SEED SECTIONS ---
  clearDatabase: async () => {
    if (isMongoConnected()) {
      await User.deleteMany({});
      await Lead.deleteMany({});
      return;
    }
    writeJsonDb(initialDb);
  },

  insertSeedUsers: async (users) => {
    if (isMongoConnected()) {
      await User.insertMany(users);
      return;
    }
    const db = readJsonDb();
    db.users = users.map(u => ({
      _id: Math.random().toString(36).substring(2, 9),
      ...u,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    writeJsonDb(db);
  },

  insertSeedLeads: async (leads) => {
    if (isMongoConnected()) {
      await Lead.insertMany(leads);
      return;
    }
    const db = readJsonDb();
    db.leads = leads.map(l => ({
      _id: Math.random().toString(36).substring(2, 9),
      ...l,
      notes: l.notes.map(n => ({
        ...n,
        createdAt: n.createdAt || new Date()
      }))
    }));
    writeJsonDb(db);
  }
};

module.exports = dbAdapter;
