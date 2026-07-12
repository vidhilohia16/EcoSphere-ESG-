import React, { useState, useEffect } from 'react';

export default function Social({ data, refreshData, currentUser }) {
  const [csrLogs, setCsrLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('');
  const [hours, setHours] = useState('');
  const [evidence, setEvidence] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [approvEvidence, setApprovEvidence] = useState({});

  // New subtab states
  const [activeSubTab, setActiveSubTab] = useState('activities');
  const [selectedQueueId, setSelectedQueueId] = useState(null);
  const [joinedCounts, setJoinedCounts] = useState({
    tree: { count: 24, joined: false, reqEvidence: true },
    blood: { count: 18, joined: false, reqEvidence: true },
    beach: { count: 31, joined: false, reqEvidence: false },
    workshop: { count: 52, joined: false, reqEvidence: false }
  });

  useEffect(() => {
    fetchEntities();
  }, [data]);

  const fetchEntities = async () => {
    try {
      const resCsr = await fetch('/api/entity/csrActivities');
      const dataCsr = await resCsr.json();
      setCsrLogs(dataCsr);

      const resEmp = await fetch('/api/entity/employees');
      const dataEmp = await resEmp.json();
      setEmployees(dataEmp);

      if (data && data.departments && data.departments.length > 0) {
        setSelectedDept(data.departments[0].id);
      }
      if (dataEmp && dataEmp.length > 0) {
        setSelectedEmp(dataEmp[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCSRSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!title) {
      setErrorMsg('Please specify a volunteer activity title.');
      return;
    }
    if (!hours || isNaN(hours) || Number(hours) <= 0) {
      setErrorMsg('Please enter a valid positive duration in hours.');
      return;
    }

    try {
      const res = await fetch('/api/csr/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          departmentId: selectedDept,
          employeeId: selectedEmp,
          hours: Number(hours),
          evidence: evidence || null,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const result = await res.json();
      if (result.success) {
        const statusText = result.activity.status;
        if (statusText === 'Approved') {
          setSuccessMsg(`CSR Logged! Hour credits (+${hours * 10} XP) auto-approved and credited to employee.`);
        } else {
          setSuccessMsg(`CSR Submitted! Evidence is required for this program. Approval status: ${statusText}.`);
        }
        setTitle('');
        setHours('');
        setEvidence('');
        refreshData();
        fetchEntities();
      } else {
        setErrorMsg(result.error || 'Failed to file CSR activity.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to file CSR volunteer hours.');
    }
  };

  const handleApproveReject = async (id, statusSelect) => {
    try {
      const endpoint = statusSelect === 'Approved' ? '/api/csr/approve' : '/api/csr/reject';
      const evidenceAttached = approvEvidence[id] || '';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          evidence: evidenceAttached || null
        })
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMsg(`CSR Activity ${statusSelect.toLowerCase()} completed successfully!`);
        setSelectedQueueId(null);
        refreshData();
        fetchEntities();
      } else {
        setErrorMsg(result.error || `Failed to ${statusSelect.toLowerCase()} activity.`);
      }
    } catch (err) {
      setErrorMsg('Error processing compliance audit action.');
    }
  };

  const handleJoinActivity = (key, titleName) => {
    if (joinedCounts[key].joined) return;
    
    setJoinedCounts(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        count: prev[key].count + 1,
        joined: true
      }
    }));
    
    setSuccessMsg(`Joined ${titleName} successfully! Standard credentials locked. Log hours in compliance tab.`);
  };

  const pendingApprovals = csrLogs.filter(x => x.status === 'Pending Approval' || x.status === 'Pending');
  const finishedCSRs = csrLogs.filter(x => x.status === 'Approved');

  // Static/calculated Diversity metrics for analytics
  const genderDistribution = { male: 53, female: 42, other: 5 };
  const trainingCompletionRate = 85; 

  const isLeaderOrOfficer = currentUser && (currentUser.role === 'Compliance Officer' || currentUser.role === 'Manager');

  return (
    <div className="page-content">
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>🤝 Social Performance & Engagement</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Evaluate corporate social responsibility, training compliance, and workforce metrics
        </p>
      </div>

      {/* Sub tabs list: CSR Activities, Employee Participation, Diversity Dashboard */}
      <div className="sub-tab-bar" style={{ display: 'flex', gap: '8px', margin: '20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button 
          className={`btn ${activeSubTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveSubTab('activities'); setSelectedQueueId(null); }}
        >
          CSR Activities
        </button>
        <button 
          className={`btn ${activeSubTab === 'participation' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('participation')}
        >
          Employee Participation
        </button>
        <button 
          className={`btn ${activeSubTab === 'diversity' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('diversity')}
        >
          Diversity Dashboard
        </button>
      </div>

      {successMsg && <div className="custom-alert custom-alert-success">{successMsg}</div>}
      {errorMsg && <div className="custom-alert custom-alert-warning">{errorMsg}</div>}

      {/* RENDER CSR ACTIVITIES TAB */}
      {activeSubTab === 'activities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* CSR Activity Cards */}
          <div className="csr-activities-grid">
            <div className="csr-card">
              <div className="csr-icon">🌳</div>
              <h4 className="csr-title">Tree Plantation</h4>
              <p className="csr-joined">{joinedCounts.tree.count} joined</p>
              <span className="csr-badge badge-warning">Evidence Required</span>
              <button 
                className={`btn ${joinedCounts.tree.joined ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={() => handleJoinActivity('tree', 'Tree Plantation')}
                disabled={joinedCounts.tree.joined}
              >
                {joinedCounts.tree.joined ? 'Joined ✓' : 'Join'}
              </button>
            </div>

            <div className="csr-card">
              <div className="csr-icon">🩸</div>
              <h4 className="csr-title">Blood Donation</h4>
              <p className="csr-joined">{joinedCounts.blood.count} joined</p>
              <span className="csr-badge badge-warning">Evidence Required</span>
              <button 
                className={`btn ${joinedCounts.blood.joined ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={() => handleJoinActivity('blood', 'Blood Donation')}
                disabled={joinedCounts.blood.joined}
              >
                {joinedCounts.blood.joined ? 'Joined ✓' : 'Join'}
              </button>
            </div>

            <div className="csr-card">
              <div className="csr-icon">🏖️</div>
              <h4 className="csr-title">Beach Cleanup</h4>
              <p className="csr-joined">{joinedCounts.beach.count} joined</p>
              <span className="csr-badge badge-success">Open</span>
              <button 
                className={`btn ${joinedCounts.beach.joined ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={() => handleJoinActivity('beach', 'Beach Cleanup')}
                disabled={joinedCounts.beach.joined}
              >
                {joinedCounts.beach.joined ? 'Joined ✓' : 'Join'}
              </button>
            </div>

            <div className="csr-card">
              <div className="csr-icon">📊</div>
              <h4 className="csr-title">ESG Workshop</h4>
              <p className="csr-joined">{joinedCounts.workshop.count} joined</p>
              <span className="csr-badge badge-success">Open</span>
              <button 
                className={`btn ${joinedCounts.workshop.joined ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={() => handleJoinActivity('workshop', 'ESG Workshop')}
                disabled={joinedCounts.workshop.joined}
              >
                {joinedCounts.workshop.joined ? 'Joined ✓' : 'Join'}
              </button>
            </div>
          </div>

          {/* CSR Compliance Employee Participation Approval Queue */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Employee Participation: approval queue</h3>
              <span className="notif-item-type notif-type-compliance" style={{ fontSize: '0.75rem' }}>
                {pendingApprovals.length} Pending Approval
              </span>
            </div>

            {!isLeaderOrOfficer && (
              <div style={{ fontSize: '0.8rem', color: 'var(--danger-hover)', fontStyle: 'italic', marginBottom: '10px' }}>
                ⚠️ Approval actions locked. Change active header role to Compliance Officer or Manager to resolve audit queue.
              </div>
            )}

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Activity/Challenge</th>
                    <th>Proof</th>
                    <th>Points</th>
                    <th>Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {csrLogs.map(act => {
                    const emp = employees.find(e => e.id === act.employeeId) || { name: 'Aditi Rao' };
                    const isSelectable = act.status === 'Pending Approval' || act.status === 'Pending';
                    const isSelected = selectedQueueId === act.id;
                    return (
                      <tr 
                        key={act.id} 
                        onClick={() => isSelectable && setSelectedQueueId(isSelected ? null : act.id)}
                        className={isSelected ? "table-row-selected" : ""}
                        style={{ cursor: isSelectable ? 'pointer' : 'default', transition: 'background-color 0.2s' }}
                      >
                        <td style={{ fontWeight: 600 }}>{emp.name}</td>
                        <td>{act.title}</td>
                        <td>{act.evidence || 'photo.jpg'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{act.hours * 10}</td>
                        <td>
                          <span className={`status-badge ${act.status === 'Approved' ? 'status-online' : act.status === 'Rejected' ? 'status-offline' : 'status-away'}`}>
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {csrLogs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="notif-empty">No logged records found in the audit trail.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedQueueId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.45)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Attach verification evidence:</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, fontSize: '0.8rem', padding: '6px 12px' }}
                    placeholder="e.g. proof_upload.jpg"
                    value={approvEvidence[selectedQueueId] || ''}
                    onChange={(e) => setApprovEvidence({ ...approvEvidence, [selectedQueueId]: e.target.value })}
                    disabled={!isLeaderOrOfficer}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => handleApproveReject(selectedQueueId, 'Approved')}
                    disabled={!isLeaderOrOfficer}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    onClick={() => handleApproveReject(selectedQueueId, 'Rejected')}
                    disabled={!isLeaderOrOfficer}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', marginLeft: 'auto' }}
                    onClick={() => setSelectedQueueId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER EMPLOYEE PARTICIPATION TAB */}
      {activeSubTab === 'participation' && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">✍️ Record CSR Volunteer Action</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>XP Credited on Approval</span>
          </div>

          <form onSubmit={handleCSRSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Service Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Habitat for Humanity Restoration" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Department Sponsor</label>
                <select 
                  className="form-select"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  {data?.departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Participating Employee</label>
                <select 
                  className="form-select"
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Duration (Hours Logged)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 5" 
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>Verification Evidence File URL / Reference</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '4px', fontWeight: 'bold' }}>
                  ⚠️ Verification is necessary for compliance approval.
                </span>
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. cert_volunteer_drive.pdf (necessary for approval)" 
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              🤝 Submit CSR Log & Check Policies
            </button>
          </form>
        </div>
      )}

      {/* RENDER DIVERSITY DASHBOARD TAB */}
      {activeSubTab === 'diversity' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">📈 Workplace Engagement Analytics</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Gender Diversity Index</h4>
                <div style={{ height: '24px', borderRadius: '12px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: `${genderDistribution.male}%`, backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 'bold' }}>
                    M {genderDistribution.male}%
                  </div>
                  <div style={{ width: `${genderDistribution.female}%`, backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 'bold' }}>
                    F {genderDistribution.female}%
                  </div>
                  <div style={{ width: `${genderDistribution.other}%`, backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 'bold' }}>
                    NB {genderDistribution.other}%
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>CSR Hours by Department</h4>
                <div className="bar-chart-container">
                  {data?.departments?.map(dept => {
                    const deptHours = finishedCSRs
                      .filter(c => c.departmentId === dept.id)
                      .reduce((sum, item) => sum + item.hours, 0);
                    
                    return (
                      <div key={dept.id} className="bar-chart-row">
                        <div className="bar-chart-labels">
                          <span>{dept.name}</span>
                          <span style={{ fontWeight: 600 }}>{deptHours} hrs</span>
                        </div>
                        <div className="bar-chart-track" style={{ height: '8px' }}>
                          <div className="bar-chart-fill" style={{ width: `${Math.max(3, Math.min(100, deptHours * 4))}%`, backgroundColor: 'var(--secondary)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Training Readiness Score</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="ranking-score-pill" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--secondary)', borderColor: 'rgba(59,130,246,0.25)', fontSize: '1.2rem', padding: '10px 16px' }}>
                    {trainingCompletionRate}%
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    ESG compliance directives & physical safety training certifications finalized.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <h3 className="panel-title">🏆 Completed Volunteer Missions</h3>
            </div>

            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Mission</th>
                    <th>Staff</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {finishedCSRs.map(act => {
                    const emp = employees.find(e => e.id === act.employeeId);
                    return (
                      <tr key={act.id}>
                        <td style={{ fontWeight: 500 }}>{act.title}</td>
                        <td>{emp ? emp.name : 'Reporter'}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{act.hours} hrs</td>
                      </tr>
                    );
                  })}
                  {finishedCSRs.length === 0 && (
                    <tr>
                      <td colSpan="3" className="notif-empty">No volunteer records completed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
