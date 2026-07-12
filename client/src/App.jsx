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
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">🌐</div>
          <div>
            <h1 className="brand-title">EcoSphere</h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>ERP ESG Engine</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="nav-icon">📊</span> Dashboard Meter
          </button>
          <button className={`nav-link ${activeTab === 'environmental' ? 'active' : ''}`} onClick={() => setActiveTab('environmental')}>
            <span className="nav-icon">🌱</span> Environmental
          </button>
          <button className={`nav-link ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>
            <span className="nav-icon">🤝</span> Social Impact
          </button>
          <button className={`nav-link ${activeTab === 'governance' ? 'active' : ''}`} onClick={() => setActiveTab('governance')}>
            <span className="nav-icon">🛡️</span> Governance
          </button>
          <button className={`nav-link ${activeTab === 'gamification' ? 'active' : ''}`} onClick={() => setActiveTab('gamification')}>
            <span className="nav-icon">🏆</span> Gamification
          </button>
          <button className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <span className="nav-icon">📖</span> Reports Builder
          </button>
          <button className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
            <span className="nav-icon">⚙️</span> Administration
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <div>Client Engine Active</div>
          <div style={{ color: 'var(--primary)' }}>Node Express Proxy</div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="main-content">
        {/* Header toolbar */}
        <header className="main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-badge status-online">Proxy Live</span>
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
              <select 
                style={{
                  backgroundColor: 'var(--panel-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                value={selectedEmpId}
                onChange={(e) => handleUserChange(e.target.value)}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
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
