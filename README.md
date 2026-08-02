# CarePulse Clinic Patient Lead Manager (Mini CRM)

A secure, high-performance, and custom-styled healthcare Admin CRM Dashboard built for **CarePulse Clinic** (a multi-specialty diagnostics and primary care facility in Boston, MA). The system tracks incoming patient inquiries from their initial submission, through coordinator call-backs and bookings, to successful clinical consultations.

## Core Features

- **Public-Facing Appointment Capture**: Validated client-side web form capturing Name, Phone, Email, Requested Specialty, and Message details, creating dynamic patient lead entries.
- **Secure Admin Portal**: Restricted portal with secure token authentication (JWT) protecting all administrative resources and dashboard panels (login credentials hashed using `bcryptjs`).
- **Clinical Operations Dashboard**: Fast, visual layout summarizing database volumes, callbacks outstanding, conversion rates, and recent patient inquiries.
- **Lead Database & Status Management**: Searchable and filterable table lists supporting status updates (`New` → `Contacted` → `Scheduled` → `Converted` / `Not Interested`).
- **Follow-up Interaction Timeline**: Vertical note-logging ledger capturing timestamped staff summaries ("Called patient to check timing", "ECG booked") to build a complete patient history.
- **Visual Analytics**: Custom SVG-based and progress components calculating inquiry counts, conversion trends, channels, and clinic specialty distributions.

---

## Tech Stack

- **Frontend**: React.js (Vite, Functional Components, Hooks, Custom SVGs, CSS layout)
- **Backend**: Node.js + Express.js (REST API server)
- **Database**: MongoDB (Mongoose ODM, structured models)
- **Icons**: Lucide React
- **Auth**: JSON Web Tokens (JWT) + password hashing via `bcryptjs`

---

## Folder Structure

```text
/clinic/
  ├── client/               # Vite React SPA
  │     ├── src/
  │     │    ├── api/       # API integration client
  │     │    ├── components/# Sidebar, Navbar
  │     │    ├── pages/     # Public Form, Login, Dashboard, Leads, Analytics
  │     │    ├── App.jsx    # Application routing and state orchestrator
  │     │    └── index.css  # Global stylesheets and design tokens
  │     └── index.html      # SEO metadata page template
  │
  ├── server/               # Node Express server
  │     ├── middleware/     # JWT authentication gates
  │     ├── models/         # User and Lead schemas
  │     ├── routes/         # Auth, Leads, and Analytics endpoints
  │     ├── scripts/        # Seeding scripts for sandbox data
  │     └── server.js       # Main server initialization
  │
  └── README.md             # Systems documentation
```

---

## Database Schemas

### 1. Lead Schema
```javascript
{
  name: String,               // Required, trimmed
  phone: String,              // Required, trimmed
  email: String,              // Required, lowercase
  serviceRequested: String,   // Required, Enum ['General Consultation', 'Dental Care', 'Pediatrics', 'Diagnostics & Imaging', 'Cardiology']
  source: String,             // Enum ['website', 'WhatsApp', 'phone'], default: 'website'
  status: String,             // Enum ['New', 'Contacted', 'Scheduled', 'Converted', 'Not Interested'], default: 'New'
  notes: [
    {
      text: String,
      createdAt: Date,
      addedBy: String
    }
  ]
}
```

### 2. User Schema
```javascript
{
  name: String,
  email: String,              // Unique, lowercase
  passwordHash: String,       // Hashed via bcryptjs
  role: String                // Enum ['admin', 'staff'], default: 'staff'
}
```

---

## Setup & Startup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Service running locally on `mongodb://127.0.0.1:27017/` (or your cloud Mongo URI specified in `.env`)

### 1. Configure the Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install server-side dependencies:
   ```bash
   npm install
   ```
3. A default `.env` file has been pre-configured:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/clinic_crm
   JWT_SECRET=supersecretjwtkeyforcarepulsecliniccrm
   ```

### 2. Seed the Sandbox Data (Crucial for Review)
Populate your MongoDB database with pre-configured users (admin + staff) and standard patient inquiry records:
```bash
npm run seed
```
**Demo credentials output by the seeder:**
- **Administrator**: `admin@carepulse.com` / `admin123`
- **Clinic Staff**: `staff@carepulse.com` / `staff123`

### 3. Launch the Server
Start the Express server:
```bash
npm run dev
```
The backend logs will show: `MongoDB successfully connected to: mongodb://127.0.0.1:27017/clinic_crm` and `Server is running on port 5000`.

### 4. Configure & Launch the Frontend Client
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install client-side dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173/` to view the public site.
5. Click **Staff Admin Login** (or visit `http://localhost:5173/#/login`) to access the CRM using the demo accounts.

---

## Security Practices Included

- **Bcrypt Hashing**: All passwords are encrypted with salting rounds on creation and validation.
- **REST Route Security**: A JWT authentication filter verifies Authorization headers for all sensitive clinical operations.
- **XSS & CORS Filters**: The backend validates requests and blocks arbitrary client code access.
- **Clean Error Handling**: System stack details are never bubbled to public REST responses.
