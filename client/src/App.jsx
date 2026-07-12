import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Environmental from './components/Environmental';
import Social from './components/Social';
import Governance from './components/Governance';
import Gamification from './components/Gamification';
import Reports from './components/Reports';
import Admin from './components/Admin';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [notifStack, setNotifStack] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchEmployees();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard pull failed", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/entity/employees');
      const data = await res.json();
      setEmployees(data);
      if (data.length > 0) {
        // Find default or keep current selection
        setSelectedEmpId((prev) => {
          const next = prev || data[0].id;
          const found = data.find(x => x.id === next);
          setCurrentUser(found || data[0]);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync user profile stats on reload
  const handleUserChange = (empId) => {
    setSelectedEmpId(empId);
    const found = employees.find(x => x.id === empId);
    setCurrentUser(found);
  };

  const refreshAppState = () => {
    fetchDashboard();
    fetchEmployees();
  };

  // Listen for badge notification prompts from API updates
  useEffect(() => {
    if (!currentUser || !dashboardData) return;
    // Check user locks in notifications
    const pendedNotifs = dashboardData.badgeNotifications || [];
    const userUnread = pendedNotifs.filter(n => n.employeeId === currentUser.id && !n.read);

    if (userUnread.length > 0) {
      setNotifStack(userUnread);
      // Dismiss on backend after brief load
      userUnread.forEach(async (notif) => {
        try {
          await fetch(`/api/notifications/read/${notif.id}`, { method: 'POST' });
        } catch (e) { console.error(e); }
      });
    }
  }, [dashboardData, currentUser]);

  const dismissNotification = (id) => {
    setNotifStack(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${isSidebarOpen ? 'mobile-visible' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌐</div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span className="sidebar-logo-text">EcoSphere</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', lineHeight: 1 }}>ERP ESG Engine</span>
          </div>
          <button 
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              display: 'none',
              padding: '6px',
              lineHeight: 1
            }}
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}>
              <span className="nav-icon">📊</span> Dashboard Meter
            </button>
          </li>
          <li className="sidebar-item">
            <button className={`sidebar-link ${activeTab === 'environmental' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }} onClick={() => { setActiveTab('environmental'); setIsSidebarOpen(false); }}>
              <span className="nav-icon">🌱</span> Environmental
            </button>
          </li>
          <li className="sidebar-item">
            <button className={`sidebar-link ${activeTab === 'social' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }} onClick={() => { setActiveTab('social'); setIsSidebarOpen(false); }}>
              <span className="nav-icon">🤝</span> Social Impact
            </button>
          </li>
          <li className="sidebar-item">
            <button className={`sidebar-link ${activeTab === 'governance' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }} onClick={() => { setActiveTab('governance'); setIsSidebarOpen(false); }}>
              <span className="nav-icon">🛡️</span> Governance
            </button>
          </li>
          <li className="sidebar-item">
            <button className={`sidebar-link ${activeTab === 'gamification' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }} onClick={() => { setActiveTab('gamification'); setIsSidebarOpen(false); }}>
              <span className="nav-icon">🏆</span> Gamification
            </button>
          </li>
          <li className="sidebar-item">
            <button className={`sidebar-link ${activeTab === 'reports' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }} onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }}>
              <span className="nav-icon">📖</span> Reports Builder
            </button>
          </li>
          <li className="sidebar-item">
            <button className={`sidebar-link ${activeTab === 'admin' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit' }} onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }}>
              <span className="nav-icon">⚙️</span> Administration
            </button>
          </li>
        </ul>


      </aside>

      {/* Main Panel Content Area */}
      <main className="app-main">
        {/* Header toolbar */}
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="mobile-nav-toggle"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'none',
                padding: '4px',
                lineHeight: 1
              }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>

          </div>

          {/* Active Employee Role Selector */}
          <div className="header-actions">
            {currentUser && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.75rem' }}>
                <span className="profile-role" style={{ color: 'var(--accent-gold)' }}>⚖️ {currentUser.xp} XP</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Role Simulation Session</label>
              <div className="profile-selector-container">
                <select 
                  className="profile-select"
                  value={selectedEmpId}
                  onChange={(e) => handleUserChange(e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Badge unlock popups */}
        <div style={{ position: 'fixed', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 1000 }}>
          {notifStack.map(notif => (
            <div key={notif.id} className="custom-alert custom-alert-success" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px', 
              borderLeft: '5px solid var(--accent-gold)', 
              boxShadow: 'var(--shadow-lg)' 
            }}>
              <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--accent-gold)' }}>🏆 ACHIEVEMENT UNLOCKED!</strong>
                <button 
                  onClick={() => dismissNotification(notif.id)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                >
                  &times;
                </button>
              </div>
              <p style={{ fontSize: '0.8rem' }}>{notif.message}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Route Pages */}
        {activeTab === 'dashboard' && dashboardData && (
          <Dashboard data={dashboardData} refreshData={refreshAppState} />
        )}
        {activeTab === 'environmental' && dashboardData && (
          <Environmental data={dashboardData} refreshData={refreshAppState} />
        )}
        {activeTab === 'social' && dashboardData && (
          <Social data={dashboardData} refreshData={refreshAppState} currentUser={currentUser} />
        )}
        {activeTab === 'governance' && dashboardData && (
          <Governance data={dashboardData} refreshData={refreshAppState} currentUser={currentUser} />
        )}
        {activeTab === 'gamification' && dashboardData && (
          <Gamification data={dashboardData} refreshData={refreshAppState} currentUser={currentUser} />
        )}
        {activeTab === 'reports' && dashboardData && (
          <Reports data={dashboardData} currentUser={currentUser} />
        )}
        {activeTab === 'admin' && dashboardData && (
          <Admin data={dashboardData} refreshData={refreshAppState} currentUser={currentUser} />
        )}

        {/* Loading fallback */}
        {!dashboardData && (
          <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            ⚡ Connecting to EcoSphere API gateway proxy...
          </div>
        )}
      </main>
    </div>
  );
}
