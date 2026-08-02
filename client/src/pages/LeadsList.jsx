import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, Filter, RefreshCw, X, MessageSquare, Phone, Mail, Calendar, User, Clock, CheckCircle2, MoreVertical } from 'lucide-react';

const LeadsList = ({ selectedLeadId, setSelectedLeadId }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Detail drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLeads({
        search,
        status: statusFilter,
        service: serviceFilter,
        sortBy
      });
      setLeads(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve inquiries from the database.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single lead detail for drawer
  const fetchLeadDetails = async (id) => {
    try {
      const data = await api.getLeadById(id);
      setActiveLead(data);
      setDrawerOpen(true);
    } catch (err) {
      console.error(err);
      alert('Error fetching patient details.');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter, serviceFilter, sortBy]);

  // Handle opening drawer when selectedLeadId changes from parent (e.g. clicked in Dashboard)
  useEffect(() => {
    if (selectedLeadId) {
      fetchLeadDetails(selectedLeadId);
    }
  }, [selectedLeadId]);

  // Close drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setActiveLead(null);
    setSelectedLeadId(null); // Clear parent selection state
    fetchLeads(); // Refresh list to reflect changes
  };

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    if (!activeLead) return;
    setStatusSubmitting(true);
    try {
      const updatedLead = await api.updateLeadStatus(activeLead._id, newStatus);
      setActiveLead(updatedLead);
      
      // Update locally in list too
      setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
    } catch (err) {
      console.error(err);
      alert('Failed to update lead status: ' + err.message);
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Handle adding a note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeLead) return;

    setNoteSubmitting(true);
    try {
      const updatedLead = await api.addLeadNote(activeLead._id, newNoteText);
      setActiveLead(updatedLead);
      setNewNoteText('');
      
      // Update locally in list
      setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
    } catch (err) {
      console.error(err);
      alert('Failed to add note: ' + err.message);
    } finally {
      setNoteSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New': return 'badge badge-new';
      case 'Contacted': return 'badge badge-contacted';
      case 'Scheduled': return 'badge badge-scheduled';
      case 'Converted': return 'badge badge-converted';
      case 'Not Interested': return 'badge badge-not-interested';
      default: return 'badge';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const services = ['General Consultation', 'Dental Care', 'Pediatrics', 'Diagnostics & Imaging', 'Cardiology'];
  const statuses = ['New', 'Contacted', 'Scheduled', 'Converted', 'Not Interested'];

  return (
    <div className="leads-view animate-fade-in">
      
      {/* Search & Filter Header */}
      <div className="card filters-card">
        <div className="filters-grid">
          
          {/* Search */}
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by patient name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control search-input"
            />
          </div>

          {/* Status Filter */}
          <div className="filter-select-group">
            <Filter size={16} className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control filter-select"
            >
              <option value="">All Statuses</option>
              {statuses.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div className="filter-select-group">
            <Filter size={16} className="filter-icon" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="form-control filter-select"
            >
              <option value="">All Specialties</option>
              {services.map(sv => (
                <option key={sv} value={sv}>{sv}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-select-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-control filter-select"
            >
              <option value="newest">Received: Newest First</option>
              <option value="oldest">Received: Oldest First</option>
              <option value="name">Patient Name (A-Z)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Table Card */}
      <div className="card table-card">
        {loading ? (
          <div className="loading-state text-center" style={{ padding: '4rem 0' }}>
            <RefreshCw className="spinner animate-spin" size={32} />
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Refreshing patient records...</p>
          </div>
        ) : error ? (
          <div className="text-center text-danger" style={{ padding: '3rem 0' }}>
            <p>{error}</p>
          </div>
        ) : leads.length > 0 ? (
          <div className="table-responsive">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Service Requested</th>
                  <th>Source Channel</th>
                  <th>Date Received</th>
                  <th>Status</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="table-row hover-shadow cursor-pointer" onClick={() => fetchLeadDetails(lead._id)}>
                    <td className="font-semibold">{lead.name}</td>
                    <td>{lead.serviceRequested}</td>
                    <td>
                      <span className="source-label text-capitalize">{lead.source}</span>
                    </td>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td>
                      <span className={getStatusBadgeClass(lead.status)}>{lead.status}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-table-action" onClick={(e) => { e.stopPropagation(); fetchLeadDetails(lead._id); }}>
                        Open Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-muted" style={{ padding: '4rem 0' }}>
            No patient inquiries match your search filters.
          </div>
        )}
      </div>

      {/* Slide-over Detail Drawer */}
      {drawerOpen && activeLead && (
        <div className="drawer-overlay animate-fade-in" onClick={handleCloseDrawer}>
          <div className="drawer-content animate-slide-right" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div className="drawer-header flex-between">
              <div className="flex-align-center">
                <User size={20} className="text-muted" />
                <h3>Patient Profile Details</h3>
              </div>
              <button className="btn-close" onClick={handleCloseDrawer}>
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="drawer-body">
              
              {/* Contact Information Card */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Patient Contact Details</h4>
                <div className="patient-contact-card">
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <span className="detail-value font-semibold">{activeLead.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value flex-align-center">
                      <Phone size={14} className="text-muted" />
                      <a href={`tel:${activeLead.phone}`} className="link-hover">{activeLead.phone}</a>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value flex-align-center">
                      <Mail size={14} className="text-muted" />
                      <a href={`mailto:${activeLead.email}`} className="link-hover">{activeLead.email}</a>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Specialty</span>
                    <span className="detail-value font-semibold">{activeLead.serviceRequested}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Source</span>
                    <span className="detail-value text-capitalize">{activeLead.source}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Received</span>
                    <span className="detail-value">{formatDate(activeLead.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update section */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Workflow Status</h4>
                <div className="status-update-container">
                  <select
                    value={activeLead.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusSubmitting}
                    className="form-control status-select"
                    style={{
                      borderColor: statusSubmitting ? 'var(--border-color)' : 'var(--primary-teal)',
                      fontWeight: 600
                    }}
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  {statusSubmitting && <RefreshCw className="spinner animate-spin" size={16} />}
                </div>
              </div>

              {/* Notes Logging Section */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Add Follow-up Note</h4>
                <form onSubmit={handleAddNote} className="note-form">
                  <textarea
                    rows="3"
                    className="form-control note-textarea"
                    placeholder="Enter interaction notes e.g., 'Called to check scheduling. Booked for Friday.'"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    required
                  ></textarea>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={noteSubmitting || !newNoteText.trim()}
                    style={{ marginTop: '0.5rem', alignSelf: 'flex-end' }}
                  >
                    {noteSubmitting ? 'Logging...' : 'Save Note'}
                  </button>
                </form>
              </div>

              {/* Interaction Notes Timeline */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Interaction Timeline</h4>
                {activeLead.notes && activeLead.notes.length > 0 ? (
                  <div className="timeline">
                    {activeLead.notes.map((note, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <p className="note-text">{note.text}</p>
                          <div className="note-meta text-muted">
                            <span className="note-author">{note.addedBy}</span>
                            <span className="note-time-separator">•</span>
                            <span className="note-date">{formatDate(note.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted" style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                    No follow-up notes recorded yet.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LeadsList;
