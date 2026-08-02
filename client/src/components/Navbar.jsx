import React from 'react';
import { Calendar, Menu, Bell, Search } from 'lucide-react';

const Navbar = ({ title, toggleSidebar }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="header animate-fade-in">
      <div className="header-left">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        <h2 className="header-title">{title}</h2>
      </div>

      <div className="header-right">
        <div className="header-date flex-align-center text-muted">
          <Calendar size={16} />
          <span>{today}</span>
        </div>
        
        <div className="header-actions">
          <button className="header-icon-btn" title="System Alerts">
            <Bell size={18} />
            <span className="badge-dot"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
