import React from 'react';
import { LayoutDashboard, Users, BarChart3, LogOut, Activity } from 'lucide-react';
import { api } from '../api';

const Sidebar = ({ currentPage, setCurrentPage, onLogout }) => {
  const currentUser = api.getCurrentUser() || { name: 'Staff User', role: 'staff' };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Patient Leads', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="sidebar animate-fade-in">
      <div className="sidebar-brand">
        <Activity size={24} className="brand-icon" />
        <div>
          <h3>CarePulse</h3>
          <span>Lead Manager</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="user-details">
            <p className="user-name">{currentUser.name}</p>
            <p className="user-role">{currentUser.role === 'admin' ? 'Administrator' : 'Clinic Staff'}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
