import React, { useState } from 'react';
import { api } from '../api';
import { Calendar, Phone, Mail, Award, Clock, ShieldCheck, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

const PublicCapture = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceRequested: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const services = [
    { name: 'General Consultation', desc: 'Comprehensive wellness checkups and primary care.', docs: 'Dr. Sarah Jenkins' },
    { name: 'Dental Care', desc: 'Restorative, preventative, and cosmetic dental services.', docs: 'Dr. Arthur Vance' },
    { name: 'Pediatrics', desc: 'Gentle, expert care for children and infants.', docs: 'Dr. Sofia Ramirez' },
    { name: 'Diagnostics & Imaging', desc: 'Ultra-fast MRI, CT scans, ultrasound, and blood panels.', docs: 'Diagnostics Dept' },
    { name: 'Cardiology', desc: 'Advanced heart health checkups and cardiology consults.', docs: 'Dr. Sterling' }
  ];

  // Auto-detect source from URL search params (e.g. ?source=WhatsApp)
  const queryParams = new URLSearchParams(window.location.search);
  const detectedSource = queryParams.get('source') || 'website';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validations
    if (!formData.name || !formData.phone || !formData.email || !formData.serviceRequested) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/;
    if (formData.phone.replace(/[^0-9]/g, '').length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      await api.submitLead({
        ...formData,
        source: detectedSource
      });
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to submit booking inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-page animate-fade-in">
      {/* Top Navbar */}
      <header className="public-header">
        <div className="public-brand">
          <Activity size={24} className="brand-logo" />
          <h1>CarePulse Clinic</h1>
        </div>
        <div className="header-nav">
          <button className="btn btn-secondary" onClick={onNavigateToLogin}>
            Staff Admin Login
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="public-container">
        
        {/* Left Grid: Info & Services */}
        <div className="public-info-section">
          <span className="badge badge-scheduled" style={{ marginBottom: '1rem' }}>Welcome to CarePulse</span>
          <h2 className="hero-title">Expert Care, Closer to You</h2>
          <p className="hero-subtitle">
            Book an appointment or send an inquiry online. Our front-desk coordinator will review your request and get in touch with you within 2 hours.
          </p>

          <div className="features-grid">
            <div className="feature-item">
              <ShieldCheck size={20} className="feature-icon" />
              <div>
                <h4>Certified Clinics</h4>
                <p>HIPAA compliant, medical-grade sanitization, and verified doctors.</p>
              </div>
            </div>
            <div className="feature-item">
              <Clock size={20} className="feature-icon" />
              <div>
                <h4>Fast Response</h4>
                <p>Call back scheduled within 2 business hours for every query.</p>
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>Our Clinical Specialties</h3>
          <div className="services-grid">
            {services.map((service, idx) => (
              <div 
                key={idx} 
                className="service-card cursor-pointer"
                onClick={() => setFormData(prev => ({ ...prev, serviceRequested: service.name }))}
              >
                <div className="service-header">
                  <h4>{service.name}</h4>
                  <ChevronRight size={16} className="service-chevron" />
                </div>
                <p className="service-desc">{service.desc}</p>
                <p className="service-doc">{service.docs}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Grid: Form card */}
        <div className="public-form-section">
          {!success ? (
            <div className="card public-form-card animate-slide-up">
              <div className="form-header">
                <h3>Request an Appointment</h3>
                <p>Fill out the form below and we will contact you shortly.</p>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="serviceRequested">Preferred Service *</label>
                  <select
                    id="serviceRequested"
                    name="serviceRequested"
                    className="form-control"
                    value={formData.serviceRequested}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select a Clinical Specialty --</option>
                    {services.map((service, idx) => (
                      <option key={idx} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="message">Message / Symptoms / Callback Reason</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="3"
                    className="form-control"
                    placeholder="Briefly describe what you'd like to consult on..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
                >
                  {loading ? 'Submitting Request...' : 'Book Appointment Request'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card public-success-card animate-slide-up text-center">
              <CheckCircle2 size={64} className="success-icon" />
              <h2>Inquiry Submitted!</h2>
              <p className="success-message-text">
                Thank you, <strong>{formData.name}</strong>. Your request for <strong>{formData.serviceRequested}</strong> has been logged in our system.
              </p>
              <div className="success-details-box">
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Source Channel:</strong> {detectedSource}</p>
              </div>
              <p className="success-footer">
                Alex Carter or another front-desk coordinator will call you back shortly.
              </p>
              <button 
                className="btn btn-outline-teal"
                style={{ marginTop: '1.5rem' }}
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    serviceRequested: '',
                    message: ''
                  });
                }}
              >
                Submit Another Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="public-footer">
        <p>&copy; 2026 CarePulse Clinic Inc. All patient data is stored securely and is HIPAA compliant.</p>
      </footer>
    </div>
  );
};

export default PublicCapture;
