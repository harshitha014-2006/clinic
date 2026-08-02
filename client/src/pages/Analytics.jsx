import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { RefreshCw, TrendingUp, Users, Calendar, AlertCircle, Award } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getAnalytics();
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve database analytics reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loading-state text-center" style={{ padding: '4rem 0' }}>
        <RefreshCw className="spinner animate-spin" size={32} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Generating statistics models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center" style={{ padding: '3rem', borderColor: 'var(--accent-coral)' }}>
        <AlertCircle size={48} style={{ color: 'var(--accent-coral)', marginBottom: '1rem' }} />
        <h3>Analytics Load Failure</h3>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={loadAnalytics}>
          Retry Connection
        </button>
      </div>
    );
  }

  // Safe checks
  const total = data?.totalLeads || 0;
  const convRate = data?.conversionRate || 0;
  const statusCounts = data?.statusCounts || [];
  const serviceCounts = data?.serviceCounts || [];
  const sourceCounts = data?.sourceCounts || [];
  const monthlyTrend = data?.monthlyTrend || [];

  // Helper for computing percentages
  const getPct = (val) => {
    if (total === 0) return 0;
    return Math.round((val / total) * 100);
  };

  // Build SVG Donut Chart parameters
  // Circle parameters: r=50, circumference = 2 * PI * r = 314.16
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  
  let accumulatedPercentage = 0;
  const donutSlices = statusCounts
    .filter(s => s.value > 0)
    .map(slice => {
      const pct = (slice.value / total);
      const strokeLength = pct * circ;
      const strokeOffset = circ - (accumulatedPercentage * circ);
      accumulatedPercentage += pct;
      
      return {
        ...slice,
        strokeLength,
        strokeOffset
      };
    });

  return (
    <div className="analytics-view animate-fade-in">
      
      {/* Upper Summary Cards */}
      <div className="analytics-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Conversion Performance Card */}
        <div className="card flex-align-center" style={{ gap: '1.5rem', marginBottom: 0 }}>
          <div className="metric-icon-circle" style={{ background: 'rgba(60, 179, 113, 0.15)', color: '#117A65' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-muted font-semibold" style={{ fontSize: '0.85rem' }}>Patient Booking Rate</span>
            <h2 style={{ fontSize: '2rem', margin: '0.25rem 0' }}>{convRate}%</h2>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Percentage of inquiries converted to visits</p>
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="card flex-align-center" style={{ gap: '1.5rem', marginBottom: 0 }}>
          <div className="metric-icon-circle" style={{ background: 'rgba(20, 163, 166, 0.15)', color: '#0F8B8D' }}>
            <Users size={24} />
          </div>
          <div>
            <span className="text-muted font-semibold" style={{ fontSize: '0.85rem' }}>Inquiry Database Volume</span>
            <h2 style={{ fontSize: '2rem', margin: '0.25rem 0' }}>{total}</h2>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>All captured inquiries from active channels</p>
          </div>
        </div>

        {/* Monthly Volume */}
        <div className="card flex-align-center" style={{ gap: '1.5rem', marginBottom: 0 }}>
          <div className="metric-icon-circle" style={{ background: 'rgba(93, 173, 226, 0.15)', color: '#2980B9' }}>
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-muted font-semibold" style={{ fontSize: '0.85rem' }}>Leads Received This Month</span>
            <h2 style={{ fontSize: '2rem', margin: '0.25rem 0' }}>{data?.leadsThisMonth || 0}</h2>
            <p className="text-muted" style={{ fontSize: '0.75rem' }}>Inquiries logged since the 1st day</p>
          </div>
        </div>

      </div>

      {/* Main Analysis Visual Grids */}
      <div className="analytics-visual-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Status Distribution Donut */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Leads Status Breakdown</h3>
          
          {total > 0 ? (
            <div className="donut-chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flex: 1 }}>
              {/* SVG Donut */}
              <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Track */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="12"
                  />
                  {/* Slices */}
                  {donutSlices.map((slice, idx) => (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="12"
                      strokeDasharray={circ}
                      strokeDashoffset={slice.strokeOffset}
                      style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                  ))}
                </svg>
                {/* Center Label */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <span className="font-semibold" style={{ fontSize: '1.5rem', display: 'block', color: 'var(--text-main)' }}>{total}</span>
                  <span className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Leads</span>
                </div>
              </div>

              {/* Legend with counts */}
              <div className="donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {statusCounts.map((status, idx) => (
                  <div key={idx} className="legend-item flex-between" style={{ fontSize: '0.85rem' }}>
                    <div className="flex-align-center">
                      <span className="legend-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: status.color, display: 'inline-block' }}></span>
                      <span>{status.name}</span>
                    </div>
                    <span className="font-semibold text-muted">{status.value} ({getPct(status.value)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: '3rem 0' }}>
              No status records logged yet.
            </div>
          )}
        </div>

        {/* Clinical Specialties requested */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Specialty Inquiry Distribution</h3>
          
          {total > 0 ? (
            <div className="services-analysis-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {serviceCounts.map((service, idx) => {
                const percentage = getPct(service.value);
                return (
                  <div key={idx} className="service-analysis-item">
                    <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span className="font-semibold">{service.name}</span>
                      <span className="text-muted">{service.value} inquiries ({percentage}%)</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{ background: '#F1F5F9', borderRadius: '9999px', height: '10px', width: '100%', overflow: 'hidden' }}>
                      <div style={{
                        background: 'var(--primary-teal)',
                        height: '100%',
                        borderRadius: '9999px',
                        width: `${percentage}%`,
                        transition: 'width 0.6s ease-out'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: '3rem 0' }}>
              No inquiry records logged yet.
            </div>
          )}
        </div>

      </div>

      {/* Monthly Trend Grid */}
      <div className="analytics-lower-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Monthly Trend Bar/Graph */}
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Monthly Inquiry Inflow Volume</h3>
          {monthlyTrend.length > 0 ? (
            <div className="trend-columns-container" style={{ display: 'flex', alignItems: 'flex-end', height: '240px', gap: '2.5rem', padding: '1rem 2rem 0.5rem 2rem', borderBottom: '1px solid var(--border-color)' }}>
              {monthlyTrend.map((month, idx) => {
                // Find max value in monthlyTrend to scale height
                const maxVal = Math.max(...monthlyTrend.map(m => m.leads));
                const barHeight = maxVal > 0 ? Math.round((month.leads / maxVal) * 100) : 0;
                
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    {/* Bar Label (Value) */}
                    <span className="font-semibold" style={{ fontSize: '0.85rem', color: 'var(--primary-teal-dark)' }}>{month.leads}</span>
                    {/* Bar Graphic */}
                    <div style={{
                      background: 'linear-gradient(to top, var(--primary-teal), var(--secondary-blue))',
                      width: '36px',
                      height: `${barHeight * 0.7}%`, // scale it to leave room for label
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'height 0.8s ease-out'
                    }}></div>
                    {/* Month Label */}
                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{month.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted" style={{ padding: '4rem 0' }}>
              No historic monthly data available.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Analytics;
