const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  serviceRequested: {
    type: String,
    required: true,
    enum: ['General Consultation', 'Dental Care', 'Pediatrics', 'Diagnostics & Imaging', 'Cardiology'],
    trim: true
  },
  source: {
    type: String,
    enum: ['website', 'WhatsApp', 'phone'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Scheduled', 'Converted', 'Not Interested'],
    default: 'New'
  },
  notes: [
    {
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      addedBy: {
        type: String,
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', LeadSchema);
