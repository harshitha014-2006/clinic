const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbAdapter = require('../db/adapter');

const seed = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinic_crm';
  
  try {
    console.log('Connecting to MongoDB (optional check)...');
    // Try to connect to MongoDB, but don't crash if it fails
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log('Connected to MongoDB.');
    } catch (e) {
      console.log('MongoDB service not active. Seeding local file-based database...');
    }

    console.log('Clearing database tables...');
    await dbAdapter.clearDatabase();
    console.log('Database cleared.');

    // Prepare Admin & Staff users
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const staffPasswordHash = await bcrypt.hash('staff123', 10);

    const seedUsers = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'admin@carepulse.com',
        passwordHash: adminPasswordHash,
        role: 'admin'
      },
      {
        name: 'Alex Carter',
        email: 'staff@carepulse.com',
        passwordHash: staffPasswordHash,
        role: 'staff'
      }
    ];

    console.log('Seeding user credentials...');
    await dbAdapter.insertSeedUsers(seedUsers);
    console.log('Users seeded.');
    console.log('  Admin: admin@carepulse.com / admin123');
    console.log('  Staff: staff@carepulse.com / staff123');

    // Prepare Mock Leads
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);

    const mockLeads = [
      {
        name: 'Jane Doe',
        phone: '+1 (555) 019-2834',
        email: 'jane.doe@gmail.com',
        serviceRequested: 'Dental Care',
        source: 'WhatsApp',
        status: 'New',
        notes: [],
        createdAt: now
      },
      {
        name: 'John Smith',
        phone: '+1 (555) 014-9988',
        email: 'john.smith@yahoo.com',
        serviceRequested: 'Pediatrics',
        source: 'website',
        status: 'Scheduled',
        createdAt: threeDaysAgo,
        notes: [
          {
            text: 'Called parent to verify preferred timing and discuss medical history.',
            addedBy: 'Alex Carter',
            createdAt: twoDaysAgo
          },
          {
            text: 'Appointment scheduled for Friday at 10:00 AM with Dr. Ramirez.',
            addedBy: 'Alex Carter',
            createdAt: oneDayAgo
          }
        ]
      },
      {
        name: 'Robert Johnson',
        phone: '+1 (555) 012-3456',
        email: 'robert.j@outlook.com',
        serviceRequested: 'Cardiology',
        source: 'phone',
        status: 'Converted',
        createdAt: threeDaysAgo,
        notes: [
          {
            text: 'Referral inquiry from Dr. Vance for cardiac screening.',
            addedBy: 'Dr. Sarah Jenkins',
            createdAt: threeDaysAgo
          },
          {
            text: 'Booked screening for Thursday at 2:00 PM.',
            addedBy: 'Dr. Sarah Jenkins',
            createdAt: twoDaysAgo
          },
          {
            text: 'Patient attended. Diagnosis completed, billing settled. Inquiry converted successfully.',
            addedBy: 'Dr. Sarah Jenkins',
            createdAt: oneDayAgo
          }
        ]
      },
      {
        name: 'Emily Davis',
        phone: '+1 (555) 017-8822',
        email: 'emily.davis@live.com',
        serviceRequested: 'Diagnostics & Imaging',
        source: 'website',
        status: 'Contacted',
        createdAt: twoDaysAgo,
        notes: [
          {
            text: 'Emailed scan pricing details and requested doctor\'s prescription copy.',
            addedBy: 'Alex Carter',
            createdAt: oneDayAgo
          }
        ]
      },
      {
        name: 'Michael Brown',
        phone: '+1 (555) 011-2233',
        email: 'michael.brown@gmail.com',
        serviceRequested: 'General Consultation',
        source: 'website',
        status: 'Not Interested',
        createdAt: threeDaysAgo,
        notes: [
          {
            text: 'Called, left voicemail regarding consultation availability.',
            addedBy: 'Alex Carter',
            createdAt: twoDaysAgo
          },
          {
            text: 'Patient called back. Advised that they went with a different hospital closer to their residence.',
            addedBy: 'Alex Carter',
            createdAt: oneDayAgo
          }
        ]
      },
      {
        name: 'Sophia Wilson',
        phone: '+1 (555) 013-4455',
        email: 'sophia.wilson@me.com',
        serviceRequested: 'Dental Care',
        source: 'WhatsApp',
        status: 'New',
        notes: [],
        createdAt: fiveHoursAgo
      },
      {
        name: 'William Taylor',
        phone: '+1 (555) 018-7766',
        email: 'william.t@gmail.com',
        serviceRequested: 'Diagnostics & Imaging',
        source: 'phone',
        status: 'Scheduled',
        createdAt: twoDaysAgo,
        notes: [
          {
            text: 'Inquired about ultrasound slots. Checked system slots.',
            addedBy: 'Alex Carter',
            createdAt: oneDayAgo
          },
          {
            text: 'Ultrasound booked for Saturday at 9:00 AM.',
            addedBy: 'Alex Carter',
            createdAt: now
          }
        ]
      }
    ];

    console.log('Seeding clinical mock inquiries...');
    await dbAdapter.insertSeedLeads(mockLeads);
    console.log(`Seeded ${mockLeads.length} sample inquiries.`);
    
    console.log('Database seeding operation completed successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('MongoDB connection disconnected.');
    }
  }
};

seed();
