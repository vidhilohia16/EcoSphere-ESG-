import React, { useState, useEffect } from 'react';

export default function Dashboard({ data, refreshData }) {
  if (!data) return <div className="notif-empty">Loading Dashboard Data...</div>;

  const {
    totalEmissions,
    totalEmployees,
    goalCompletionRate,
    orgEsgScore,
    orgEnvironScore,
    orgSocialScore,
    orgGoverScore,
    departments
  } = data;

  // Let's sort departments for the rankings
  const rankedDepts = [...departments].sort((a, b) => {
    const scoreA = Math.round(((a.scoreEnvironmental || 0) + (a.scoreSocial || 0) + (a.scoreGovernance || 0)) / 3);
    const scoreB = Math.round(((b.scoreEnvironmental || 0) + (b.scoreSocial || 0) + (b.scoreGovernance || 0)) / 3);
    return scoreB - scoreA;
  });

  // SVG circular gauge math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (orgEsgScore / 100) * circumference;

  return (
    <div className="page-content">
      {/* Platform Title Header */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Central ESG Workspace</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Real-time measurement and organization-wide sustainability scoring
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-card-env">
          <div className="kpi-card-header">
            <span>Carbon Footprint</span>
            <div className="kpi-card-icon">⚡</div>
          </div>
          <div className="kpi-card-value">{(totalEmissions / 1000).toFixed(2)} t</div>
          <div className="kpi-card-sub">Total emissions: {totalEmissions.toLocaleString()} kg CO2e</div>
        </div>

        <div className="kpi-card kpi-card-soc">
          <div className="kpi-card-header">
            <span>Workforce Engagement</span>
            <div className="kpi-card-icon">👥</div>
          </div>
          <div className="kpi-card-value">{totalEmployees}</div>
          <div className="kpi-card-sub">Active ERP, CSR & policy users</div>
        </div>

        <div className="kpi-card kpi-card-gov">
          <div className="kpi-card-header">
            <span>Sustain Goals Met</span>
            <div className="kpi-card-icon">🎯</div>
          </div>
          <div className="kpi-card-value">{goalCompletionRate}%</div>
          <div className="kpi-card-sub">Core organizational objectives achieved</div>
        </div>
      </div>

      {/* Gauges & Rankings section */}
      <div className="dashboard-main-grid">
        
        {/* Left Side: Score Breakdown Gauges & Core Chart */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">⭐ Organization ESG Rating</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weighted score</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px', alignItems: 'center' }}>
            <div className="gauge-svg-container">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#17223b"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="url(#esgGrad)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
                <defs>
                  <linearGradient id="esgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="gauge-svg-center-text">
                <span className="gauge-value">{orgEsgScore}</span>
                <span className="gauge-label">Global Rating</span>
              </div>
            </div>

            {/* Score Breakdowns */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 650 }}>🌱 Environmental Rating</span>
                  <span style={{ fontWeight: 700 }}>{orgEnvironScore} / 100</span>
                </div>
                <div className="bar-chart-track" style={{ height: '8px' }}>
                  <div className="bar-chart-fill" style={{ width: `${orgEnvironScore}%`, backgroundColor: 'var(--primary)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)', fontWeight: 650 }}>🤝 Social Rating</span>
                  <span style={{ fontWeight: 700 }}>{orgSocialScore} / 100</span>
                </div>
                <div className="bar-chart-track" style={{ height: '8px' }}>
                  <div className="bar-chart-fill" style={{ width: `${orgSocialScore}%`, backgroundColor: 'var(--secondary)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: 650 }}>🛡️ Governance Rating</span>
                  <span style={{ fontWeight: 700 }}>{orgGoverScore} / 100</span>
                </div>
                <div className="bar-chart-track" style={{ height: '8px' }}>
                  <div className="bar-chart-fill" style={{ width: `${orgGoverScore}%`, backgroundColor: 'var(--accent-gold)' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>🏢 Department Carbon Efficiency Breakdown (kg CO2e)</h4>
            
            <div className="bar-chart-container">
              {departments.map(dept => {
                const totalDeptEmissions = dept.emissions || 0;
                // Calculate percentage out of total emissions
                const pct = totalEmissions > 0 ? Math.round((totalDeptEmissions / totalEmissions) * 100) : 0;
                
                return (
                  <div key={dept.id} className="bar-chart-row">
                    <div className="bar-chart-labels">
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{dept.name}</span>
                      <span style={{ fontWeight: 600 }}>{totalDeptEmissions.toLocaleString()} kg ({pct}%)</span>
                    </div>
                    <div className="bar-chart-track">
                      <div 
                        className="bar-chart-fill" 
                        style={{ 
                          width: `${Math.max(3, pct)}%`, 
                          backgroundColor: dept.id === 'dept-ops' ? '#f43f5e' : 'var(--primary)' 
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Department Rankings */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">🏆 Department Leaderboard</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top ESG Performers</span>
          </div>

          <div className="ranking-list">
            {rankedDepts.map((dept, index) => {
              const score = Math.round(((dept.scoreEnvironmental || 0) + (dept.scoreSocial || 0) + (dept.scoreGovernance || 0)) / 3);
              const rank = index + 1;
              let badgeClass = "ranking-badge";
              if (rank === 1) badgeClass += " ranking-badge-1";
              if (rank === 2) badgeClass += " ranking-badge-2";
              if (rank === 3) badgeClass += " ranking-badge-3";

              return (
                <div key={dept.id} className="ranking-item">
                  <div className={badgeClass}>{rank}</div>
                  <div className="ranking-details">
                    <div className="ranking-name">{dept.name}</div>
                    <div className="ranking-subtext">
                      E: {dept.scoreEnvironmental} | S: {dept.scoreSocial} | G: {dept.scoreGovernance}
                    </div>
                  </div>
                  <div className="ranking-score-pill">
                    {score}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', backgroundColor: 'rgba(24, 34, 58, 0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Dashboard Insights:</strong> Operations has the highest operational footprint, but HR leading in policy clearances. Adjust weights on the Admin panel to re-balance global ESG rating.
          </div>
        </div>

      </div>
    </div>
  );
}
