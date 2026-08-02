const express = require('express');
const router = express.Router();
const dbAdapter = require('../db/adapter');
const authMiddleware = require('../middleware/auth');

// @route   POST api/leads
// @desc    Submit a new lead inquiry from public website
// @access  Public
router.post('/', async (req, res) => {
  const { name, phone, email, serviceRequested, source } = req.body;

  // Basic validation
  if (!name || !phone || !email || !serviceRequested) {
    return res.status(400).json({ message: 'Please provide name, phone, email, and preferred service' });
  }

  // Validate service type
  const validServices = ['General Consultation', 'Dental Care', 'Pediatrics', 'Diagnostics & Imaging', 'Cardiology'];
  if (!validServices.includes(serviceRequested)) {
    return res.status(400).json({ message: 'Invalid service selected' });
  }

  try {
    const savedLead = await dbAdapter.createLead({
      name,
      phone,
      email,
      serviceRequested,
      source: source || 'website'
    });
    res.status(201).json(savedLead);
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ message: 'Server error while submitting inquiry' });
  }
});

// @route   GET api/leads
// @desc    Get all leads with search, filter, and sorting
// @access  Private (Admin/Staff only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, status, service, sortBy } = req.query;
    
    const leads = await dbAdapter.findLeads({
      search,
      status,
      service,
      sortBy
    });
    
    res.json(leads);
  } catch (err) {
    console.error('Fetch leads error:', err);
    res.status(500).json({ message: 'Server error while fetching leads' });
  }
});

// @route   GET api/leads/:id
// @desc    Get a single lead by ID
// @access  Private (Admin/Staff only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await dbAdapter.findLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    console.error('Fetch single lead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH api/leads/:id/status
// @desc    Update a lead's status
// @access  Private (Admin/Staff only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  
  const validStatuses = ['New', 'Contacted', 'Scheduled', 'Converted', 'Not Interested'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const userName = req.user.name || req.user.email;
    const updatedLead = await dbAdapter.updateLeadStatus(req.params.id, status, userName);
    if (!updatedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(updatedLead);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/leads/:id/notes
// @desc    Add a follow-up note to a lead
// @access  Private (Admin/Staff only)
router.post('/:id/notes', authMiddleware, async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Note text is required' });
  }

  try {
    const userName = req.user.name || req.user.email;
    const updatedLead = await dbAdapter.addLeadNote(req.params.id, text, userName);
    if (!updatedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(updatedLead);
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
