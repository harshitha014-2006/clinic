const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev/testing ease
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinic_crm';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB successfully connected to:', mongoUri);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Ensure MongoDB is installed and running, or update your .env file.');
  });

// Mount API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve React static build files
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Fallback all non-API GET requests to React's index.html
app.get('*', (req, res) => {
  // If it's an api path that didn't match, return JSON 404
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
