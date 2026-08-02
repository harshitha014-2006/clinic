import React, { useState, useEffect } from 'react';
import { api } from './api';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LeadsList from './pages/LeadsList';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import PublicCapture from './pages/PublicCapture';
import { RefreshCw, Activity } from 'lucide-react';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('public'); // 'public', 'login', 'dashboard', 'leads', 'analytics'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState(null);

  // Authenticate user check on load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = api.getCurrentUser();
      const authenticated = api.isAuthenticated();
      
      if (authenticated && storedUser) {
        setUser(storedUser);
        // Default admin landing is dashboard
        setCurrentPage('dashboard');
      } else {
        // Default public landing page
        setCurrentPage('public');
      }
      setLoading(false);
    };

    // Parse URL hash routes for clean direct link reloading
    const handleHashChange = () => {
      const hash = window.location.hash;
      const authenticated = api.isAuthenticated();

      if (hash === '#/login' && !authenticated) {
        setCurrentPage('login');
      } else if (hash === '#/' || !hash) {
        setCurrentPage(authenticated ? 'dashboard' : 'public');
      }
    };

    checkAuth();
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle successful login
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
    window.location.hash = '#/';
  };

  // Handle logout
  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentPage('public');
    window.location.hash = '#/';
  };

  // Handle navigate triggers
  const navigateToLogin = () => {
    setCurrentPage('login');
    window.location.hash = '#/login';
  };

  const navigateToPublic = () => {
    setCurrentPage(user ? 'dashboard' : 'public');
    window.location.hash = '#/';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="app-loader-container flex-align-center" style={{
        height: '100vh',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--bg-main)'
      }}>
        <Activity size={40} style={{ color: 'var(--primary-teal)', strokeWidth: 2.5 }} className="animate-pulse" />
        <p style={{ fontWeight: 500, color: 'var(--text-main)' }}>Initializing CarePulse Clinic CRM...</p>
      </div>
    );
  }

  // Admin layouts wrapper
  const renderAdminLayout = (childComponent, pageTitle) => {
    return (
      <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Navigation Sidebar */}
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={(page) => {
            setCurrentPage(page);
            setSelectedLeadId(null); // Clear selections
          }} 
          onLogout={handleLogout} 
        />
        
        {/* Main Panels */}
        <div className="main-content">
          <Navbar title={pageTitle} toggleSidebar={toggleSidebar} />
          <main className="content-body">
            {childComponent}
          </main>
        </div>
      </div>
    );
  };

  // Switch rendering based on active page state
  switch (currentPage) {
    case 'public':
      return <PublicCapture onNavigateToLogin={navigateToLogin} />;
    
    case 'login':
      return <Login onLoginSuccess={handleLoginSuccess} onBackToPublic={navigateToPublic} />;
    
    case 'dashboard':
      return renderAdminLayout(
        <Dashboard 
          setCurrentPage={setCurrentPage} 
          setSelectedLeadId={setSelectedLeadId} 
        />, 
        'Clinic Dashboard'
      );
    
    case 'leads':
      return renderAdminLayout(
        <LeadsList 
          selectedLeadId={selectedLeadId} 
          setSelectedLeadId={setSelectedLeadId} 
        />, 
        'Patient Leads Database'
      );
    
    case 'analytics':
      return renderAdminLayout(
        <Analytics />, 
        'Inquiry Analytics Overview'
      );
    
    default:
      return <PublicCapture onNavigateToLogin={navigateToLogin} />;
  }
};

export default App;
