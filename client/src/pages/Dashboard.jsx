import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Users, AlertCircle, Calendar, CheckCircle2, TrendingUp, RefreshCw, ChevronRight, Activity, Smartphone, Globe } from 'lucide-react';

const Dashboard = ({ setCurrentPage, setSelectedLeadId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const analyticsData = await api.getAnalytics();
      setAnalytics(analyticsData);
      
      const leads = await api.getLeads({ sortBy: 'newest' });
      setRecentLeads(leads.slice(0, 4)); // Show top 4 recent leads
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-state text-center" style={{ padding: '4rem 0' }}>
        <RefreshCw className="spinner animate-spin" size={32} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading clinical database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center" style={{ padding: '3rem', borderColor: 'var(--accent-coral)' }}>
        <AlertCircle size={48} style={{ color: 'var(--accent-coral)', marginBottom: '1rem' }} />
        <h3>System Error</h3>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          Retry Connection
        </button>
      </div>
    );
  }

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

  // Safe variables
  const total = analytics?.totalLeads || 0;
  const newInquiries = analytics?.statusCounts?.find(s => s.name === 'New')?.value || 0;
  const scheduled = analytics?.statusCounts?.find(s => s.name === 'Scheduled')?.value || 0;
  const conversionRate = analytics?.conversionRate || 0;

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Top Greeting */}
      <div className="dashboard-greeting flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Clinical Operations Overview</h2>
          <p className="text-muted">Real-time status tracker for CarePulse incoming inquiries</p>
        </div>
        <button className="btn btn-secondary flex-align-center" onClick={loadDashboardData}>
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Total Inquiries */}
        <div className="card metric-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: 0 }}>
          <div className="metric-icon-circle bg-blue" style={{ background: 'rgba(93, 173, 226, 0.15)', color: '#2980B9' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="metric-label text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Inquiries</p>
            <h3 className="metric-val" style={{ fontSize: '1.75rem', margin: 0 }}>{total}</h3>
            <p className="metric-subtext text-muted" style={{ fontSize: '0.75rem' }}>All-time total</p>
          </div>
        </div>

        {/* New Inquiries */}
        <div className="card metric-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: 0 }}>
          <div className="metric-icon-circle bg-yellow" style={{ background: 'rgba(244, 183, 64, 0.15)', color: '#D68910' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="metric-label text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>New Inquiries</p>
            <h3 className="metric-val" style={{ fontSize: '1.75rem', margin: 0 }}>{newInquiries}</h3>
            <p className="metric-subtext text-muted" style={{ fontSize: '0.75rem' }}>Awaiting callback</p>
          </div>
        </div>

        {/* Scheduled Appointments */}
        <div className="card metric-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: 0 }}>
          <div className="metric-icon-circle bg-teal" style={{ background: 'rgba(20, 163, 166, 0.15)', color: '#0F8B8D' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p className="metric-label text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Scheduled</p>
            <h3 className="metric-val" style={{ fontSize: '1.75rem', margin: 0 }}>{scheduled}</h3>
            <p className="metric-subtext text-muted" style={{ fontSize: '0.75rem' }}>Appointments booked</p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="card metric-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: 0 }}>
          <div className="metric-icon-circle bg-green" style={{ background: 'rgba(60, 179, 113, 0.15)', color: '#117A65' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="metric-label text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>Conversion Rate</p>
            <h3 className="metric-val" style={{ fontSize: '1.75rem', margin: 0 }}>{conversionRate}%</h3>
            <p className="metric-subtext text-muted" style={{ fontSize: '0.75rem' }}>Inquiries converted</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Activity & Quick Action Details */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Recent Inquiries List */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3>Recent Patient Inquiries</h3>
            <button 
              className="btn btn-outline-teal btn-sm"
              onClick={() => setCurrentPage('leads')}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              View All leads
            </button>
          </div>

          {recentLeads.length > 0 ? (
            <div className="recent-leads-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentLeads.map((lead) => (
                <div 
                  key={lead._id} 
                  className="recent-lead-item cursor-pointer"
                  onClick={() => {
                    setSelectedLeadId(lead._id);
                    setCurrentPage('leads');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div className="flex-align-center">
                      <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{lead.name}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>• {lead.serviceRequested}</span>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>{lead.email} | {lead.phone}</span>
                  </div>

                  <div className="flex-align-center" style={{ gap: '1rem' }}>
                    <span className={getStatusBadgeClass(lead.status)}>{lead.status}</span>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: '3rem 0' }}>
              No recent inquiries logged.
            </div>
          )}
        </div>

        {/* Channels Breakdown & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Channels Card */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Inquiry Channels</h3>
            <div className="channels-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Website */}
              <div className="channel-item flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex-align-center">
                  <Globe size={18} style={{ color: 'var(--primary-teal)' }} />
                  <span>Website Form</span>
                </div>
                <span className="font-semibold">{analytics?.sourceCounts?.find(s => s.name === 'website')?.value || 0}</span>
              </div>

              {/* WhatsApp */}
              <div className="channel-item flex-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex-align-center">
                  <Activity size={18} style={{ color: '#2ECC71' }} />
                  <span>WhatsApp Link</span>
                </div>
                <span className="font-semibold">{analytics?.sourceCounts?.find(s => s.name === 'WhatsApp')?.value || 0}</span>
              </div>

              {/* Phone */}
              <div className="channel-item flex-between">
                <div className="flex-align-center">
                  <Smartphone size={18} style={{ color: 'var(--accent-coral)' }} />
                  <span>Direct Callback</span>
                </div>
                <span className="font-semibold">{analytics?.sourceCounts?.find(s => s.name === 'phone')?.value || 0}</span>
              </div>

            </div>
          </div>

          {/* Quick Support Admin Tip */}
          <div className="card bg-teal" style={{ marginBottom: 0, background: 'linear-gradient(135deg, var(--primary-teal), var(--primary-teal-dark))', color: 'white' }}>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Admin Quick Tip</h4>
            <p style={{ fontSize: '0.825rem', opacity: 0.9, lineHeight: 1.4 }}>
              Front-desk staff should attempt to call back all inquiries marked as <strong>"New"</strong> within 2 hours.
              Updating lead status to <strong>"Contacted"</strong> logs the agent interaction.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
