import React, { useState, useEffect } from 'react';

export default function Governance({ data, refreshData, currentUser }) {
  const [policies, setPolicies] = useState([]);
  const [acks, setAcks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchEntities();
  }, [data]);

  const fetchEntities = async () => {
    try {
      const resPol = await fetch('/api/entity/policies');
      const dataPol = await resPol.json();
      setPolicies(dataPol);

      const resAck = await fetch('/api/entity/policyAcknowledgements');
      const dataAck = await resAck.json();
      setAcks(dataAck);

      const resIss = await fetch('/api/entity/complianceIssues');
      const dataIss = await resIss.json();
      setIssues(dataIss);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledge = async (policyId) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/policy/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          policyId
        })
      });

      const result = await res.json();
      if (result.success) {
        setSuccessMsg('Policy successfully signed and logged. +20 XP awarded!');
        refreshData();
        fetchEntities();
      } else {
        setErrorMsg(result.error || 'Failed to acknowledge policy.');
      }
    } catch (err) {
      setErrorMsg('Failed to process policy acknowledgement.');
    }
  };

  // Identify overdue issues (Open and severity High/Medium)
  const openIssues = issues.filter(x => x.status === 'Open');
  const finishedIssues = issues.filter(x => x.status === 'Resolved');
  const overdueIssues = openIssues.filter(x => x.severity === 'High' || x.severity === 'Medium');

  return (
    <div className="page-content">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>🛡️ Corporate Governance & Policy Compliance</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Evaluate regulatory policies, employee attestations, and compliance audit listings
        </p>
      </div>

      {/* Flashing Overdue alerts if any */}
      {overdueIssues.length > 0 && (
        <div className="custom-alert custom-alert-warning" style={{ borderLeft: '5px solid var(--danger)', animation: 'pulse-ring 3s infinite' }}>
          <div>
            <strong>⚠️ CRITICAL COMPLIANCE NOTICE:</strong> There are <strong>{overdueIssues.length}</strong> unresolved high/medium severity compliance issues awaiting urgent department audit resolution.
          </div>
        </div>
      )}

      <div className="dashboard-main-grid">
        {/* Left Side: Policies acknowledge check */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">📚 Corporate Policy Handbooks</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Read & Sign Clearance</span>
            </div>

            {successMsg && <div className="custom-alert custom-alert-success">{successMsg}</div>}
            {errorMsg && <div className="custom-alert custom-alert-warning">{errorMsg}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {policies.map(policy => {
                // Check if signed by active user
                const isSigned = acks.some(
                  a => a.employeeId === currentUser?.id && a.policyId === policy.id && a.acknowledged
                );
                
                const signingRecord = acks.find(
                  a => a.employeeId === currentUser?.id && a.policyId === policy.id && a.acknowledged
                );

                return (
                  <div key={policy.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(24, 34, 58, 0.4)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{policy.title}</h4>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>Version: {policy.version}</span>
                        <span>Published: {policy.lastUpdated}</span>
                      </div>
                      {isSigned && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px' }}>
                          ✔️ Signed and attestation saved on {signingRecord?.date}
                        </div>
                      )}
                    </div>

                    <div>
                      {isSigned ? (
                        <span className="notif-item-type notif-type-approval" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                          CLEAR
                        </span>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => handleAcknowledge(policy.id)}
                          disabled={!currentUser}
                        >
                          ✍️ Sign Attestation
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Logs list */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">📋 Institutional Audit Log</h3>
            </div>

            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Audit Title</th>
                    <th>Auditor Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2026-07-06</td>
                    <td>Q2 Fleet Sourcing Review</td>
                    <td>External Lead Auditor</td>
                    <td><span className="notif-item-type notif-type-approval">Passed</span></td>
                  </tr>
                  <tr>
                    <td>2026-06-25</td>
                    <td>Corporate Employee Code Acknowledgement</td>
                    <td>Internal Auditor</td>
                    <td><span className="notif-item-type notif-type-approval">Passed</span></td>
                  </tr>
                  <tr>
                    <td>2026-06-15</td>
                    <td>Operational Raw Sourcing Materials Certification</td>
                    <td>Safety Compliance Team</td>
                    <td><span className="notif-item-type notif-type-compliance">Resolved</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Compliance issues alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="dashboard-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <h3 className="panel-title">🚨 Active Compliance Tickets & Audits</h3>
              <span className="notif-item-type notif-type-compliance" style={{ fontSize: '0.75rem', backgroundColor: openIssues.length > 0 ? '#f43f5e' : 'rgba(16, 185, 129, 0.15)', color: openIssues.length > 0 ? 'white' : 'var(--primary)' }}>
                {openIssues.length} Tickets
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {openIssues.map(issue => {
                const dept = data?.departments?.find(d => d.id === issue.departmentId);
                const isOverdue = issue.severity === 'High' || issue.severity === 'Medium';
                
                return (
                  <div key={issue.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'rgba(24, 34, 58, 0.4)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: isOverdue ? '4px solid var(--danger)' : '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 650, fontSize: '0.9rem' }}>{issue.title}</span>
                      <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: issue.severity === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(250, 204, 21, 0.15)', color: issue.severity === 'High' ? 'var(--danger)' : 'var(--accent-gold)' }}>
                        {issue.severity}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {issue.description}
                    </p>

                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                      <span>Department: {dept ? dept.name : 'All'}</span>
                      <span>Logged: {issue.dateLogged}</span>
                    </div>
                  </div>
                );
              })}

              {openIssues.length === 0 && (
                <div className="notif-empty">All compliance issues resolved. Organization fully regulation-compliant.</div>
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">✔️ Resolved Regulatory Cases</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {finishedIssues.map(issue => (
                <div key={issue.id} style={{ opacity: 0.6, fontSize: '0.8rem', backgroundColor: 'rgba(24, 34, 58, 0.2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                    <span style={{ textDecoration: 'line-through' }}>{issue.title}</span>
                    <span style={{ color: 'var(--primary)' }}>Resolved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
