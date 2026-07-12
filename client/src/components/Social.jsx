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

  const handleApprove = async (id) => {
    try {
      const evidenceAttached = approvEvidence[id] || '';
      
      const res = await fetch('/api/csr/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          evidence: evidenceAttached || null
        })
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMsg(`CSR Activity approved successfully! Employee received XP credits.`);
        refreshData();
        fetchEntities();
      } else {
        setErrorMsg(result.error || 'Failed to approve activity.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during approval validation.');
    }
  };

  const pendingApprovals = csrLogs.filter(x => x.status === 'Pending Approval');
  const finishedCSRs = csrLogs.filter(x => x.status === 'Approved');

  // Static/calculated Diversity metrics for analytics
  const genderDistribution = { male: 53, female: 42, other: 5 };
  const trainingCompletionRate = 85; 

  const isLeaderOrOfficer = currentUser && (currentUser.role === 'Compliance Officer' || currentUser.role === 'Manager');

  return (
    <div className="page-content">
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>🤝 Social Performance & engagement</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Evaluate corporate social responsibility, training compliance, and workforce metrics
        </p>
      </div>

      <div className="dashboard-main-grid">
        {/* Left Side: Submit CSR & Pending Approvals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* CSR Logging Form */}
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
                <label>Verification Evidence File URL / Reference (Required if Policy Configured)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. cert_volunteer_drive.pdf" 
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                🤝 Submit CSR Log & Check Policies
              </button>
            </form>

            {successMsg && <div className="custom-alert custom-alert-success">{successMsg}</div>}
            {errorMsg && <div className="custom-alert custom-alert-warning">{errorMsg}</div>}
          </div>

          {/* CSR Compliance Approvals Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">🔒 Social Compliance Audit Approvals</h3>
              <span className="notif-item-type notif-type-compliance" style={{ fontSize: '0.75rem' }}>
                {pendingApprovals.length} Pending
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="notif-empty">No pending activity evidence reviews at this time.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!isLeaderOrOfficer && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontStyle: 'italic' }}>
                    ⚠️ Approval actions locked. Please change active header role to Compliance Officer or Manager to audit.
                  </div>
                )}
                
                {pendingApprovals.map(act => {
                  const emp = employees.find(e => e.id === act.employeeId);
                  const dept = data?.departments?.find(d => d.id === act.departmentId);
                  return (
                    <div key={act.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'rgba(24, 34, 58, 0.4)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <strong>{act.title}</strong>
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{act.hours} Hours</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Logged by: {emp ? emp.name : 'Unknown User'} ({dept ? dept.name : 'Staff'})
                      </div>

                      <div className="actions-row" style={{ marginTop: '10px' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                          placeholder="Evidence verification code/link..."
                          value={approvEvidence[act.id] || ''}
                          onChange={(e) => setApprovEvidence({ ...approvEvidence, [act.id]: e.target.value })}
                          disabled={!isLeaderOrOfficer}
                        />
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleApprove(act.id)}
                          disabled={!isLeaderOrOfficer}
                        >
                          ✅ Verify & Credit XP
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Training & Diversity Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">📈 Workplace Engagement Analytics</h3>
            </div>

            {/* Diversity Metrics display as a beautiful bar breakdown */}
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

          {/* CSR Ledger list */}
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
      </div>
    </div>
  );
}
