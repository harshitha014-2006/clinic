const express = require('express');
const router = express.Router();
const dbAdapter = require('../db/adapter');
const authMiddleware = require('../middleware/auth');

// @route   GET api/analytics
// @desc    Get aggregated lead analytics
// @access  Private (Admin/Staff only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Fetch all leads using adapter
    const leads = await dbAdapter.findLeads();
    
    const totalLeads = leads.length;
    
    // Status counts
    const statusCounts = {
      New: 0,
      Contacted: 0,
      Scheduled: 0,
      Converted: 0,
      'Not Interested': 0
    };
    
    // Service distribution
    const serviceCounts = {
      'General Consultation': 0,
      'Dental Care': 0,
      'Pediatrics': 0,
      'Diagnostics & Imaging': 0,
      'Cardiology': 0
    };

    // Source distribution
    const sourceCounts = {
      website: 0,
      WhatsApp: 0,
      phone: 0
    };

    // Monthly trend
    const monthlyTrend = {};

    // Get current month details
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    let leadsThisMonth = 0;

    leads.forEach(lead => {
      // 1. Increment status
      if (statusCounts[lead.status] !== undefined) {
        statusCounts[lead.status]++;
      }

      // 2. Increment service
      if (serviceCounts[lead.serviceRequested] !== undefined) {
        serviceCounts[lead.serviceRequested]++;
      }

      // 3. Increment source
      if (sourceCounts[lead.source] !== undefined) {
        sourceCounts[lead.source]++;
      }

      // 4. Monthly trend grouping
      const date = new Date(lead.createdAt);
      const year = date.getFullYear();
      const monthName = date.toLocaleString('default', { month: 'short' });
      const key = `${monthName} ${year}`;
      monthlyTrend[key] = (monthlyTrend[key] || 0) + 1;

      // 5. This month's count
      if (year === currentYear && date.getMonth() === currentMonth) {
        leadsThisMonth++;
      }
    });

    // Format monthly trend to array
    const trendArray = Object.keys(monthlyTrend).map(key => ({
      name: key,
      leads: monthlyTrend[key]
    })).reverse(); // Order from oldest to newest if needed

    // Conversion rate calculations
    const convertedCount = statusCounts['Converted'] || 0;
    const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

    res.json({
      totalLeads,
      leadsThisMonth,
      conversionRate,
      statusCounts: [
        { name: 'New', value: statusCounts['New'], color: '#5DADE2' },
        { name: 'Contacted', value: statusCounts['Contacted'], color: '#F4B740' },
        { name: 'Scheduled', value: statusCounts['Scheduled'], color: '#14A3A6' },
        { name: 'Converted', value: statusCounts['Converted'], color: '#3CB371' },
        { name: 'Not Interested', value: statusCounts['Not Interested'], color: '#C06B6B' }
      ],
      serviceCounts: Object.keys(serviceCounts).map(key => ({
        name: key,
        value: serviceCounts[key]
      })),
      sourceCounts: Object.keys(sourceCounts).map(key => ({
        name: key,
        value: sourceCounts[key]
      })),
      monthlyTrend: trendArray
    });

  } catch (err) {
    console.error('Analytics aggregation error:', err);
    res.status(500).json({ message: 'Server error while loading analytics' });
  }
});

module.exports = router;
