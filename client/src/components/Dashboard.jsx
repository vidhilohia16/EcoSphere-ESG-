import React, { useState, useEffect } from 'react';
import { AnimatedNumber, ScrollReveal } from './AnimationHelpers';

export default function Dashboard({ data, refreshData, setActiveTab }) {
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

  const trendData = [
    { month: 'Jan', emissions: 3200 },
    { month: 'Feb', emissions: 3800 },
    { month: 'Mar', emissions: 3500 },
    { month: 'Apr', emissions: 4100 },
    { month: 'May', emissions: 3900 },
    { month: 'Jun', emissions: 3400 },
    { month: 'Jul', emissions: 3000 },
    { month: 'Aug', emissions: 3200 },
    { month: 'Sep', emissions: 3600 },
    { month: 'Oct', emissions: 4000 },
    { month: 'Nov', emissions: 3900 },
    { month: 'Dec', emissions: Math.round(totalEmissions) }
  ];

  const maxVal = Math.max(...trendData.map(d => d.emissions));
  const minVal = Math.min(...trendData.map(d => d.emissions));
  const range = maxVal - minVal || 1;
  const points = trendData.map((d, index) => {
    const x = 30 + (index * (440 / 11));
    const y = 140 - ((d.emissions - minVal) / range) * 100;
    return { x, y, month: d.month, val: d.emissions };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`;

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
        <ScrollReveal delay={100} duration={600}>
          <div className="kpi-card kpi-card-env">
            <div className="kpi-card-header">
              <span>Carbon Footprint</span>
              <div className="kpi-card-icon">⚡</div>
            </div>
            <div className="kpi-card-value">
              <AnimatedNumber value={(totalEmissions / 1000)} suffix=" tons" />
            </div>
            <div className="kpi-card-sub">
              Total emissions: <AnimatedNumber value={totalEmissions} /> kg CO2e
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200} duration={600}>
          <div className="kpi-card kpi-card-soc">
            <div className="kpi-card-header">
              <span>Workforce Engagement</span>
              <div className="kpi-card-icon">👥</div>
            </div>
            <div className="kpi-card-value">
              <AnimatedNumber value={totalEmployees} />
            </div>
            <div className="kpi-card-sub">Active ERP, CSR & policy users</div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300} duration={600}>
          <div className="kpi-card kpi-card-gov">
            <div className="kpi-card-header">
              <span>Sustain Goals Met</span>
              <div className="kpi-card-icon">🎯</div>
            </div>
            <div className="kpi-card-value">
              <AnimatedNumber value={goalCompletionRate} suffix="%" />
            </div>
            <div className="kpi-card-sub">Core organizational objectives achieved</div>
          </div>
        </ScrollReveal>
      </div>

      {/* Gauges & Rankings section */}
      <div className="dashboard-main-grid">
        
        {/* Left Side: Score Breakdown Gauges & Core Chart */}
        <ScrollReveal delay={150} duration={800}>
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
                    stroke="#e2efe7"
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
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="gauge-svg-center-text">
                  <span className="gauge-value"><AnimatedNumber value={orgEsgScore} /></span>
                  <span className="gauge-label">Global Rating</span>
                </div>
              </div>

              {/* Score Breakdowns */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 650 }}>🌱 Environmental Rating</span>
                    <span style={{ fontWeight: 700 }}><AnimatedNumber value={orgEnvironScore} /> / 100</span>
                  </div>
                  <div className="bar-chart-track" style={{ height: '8px' }}>
                    <div className="bar-chart-fill" style={{ width: `${orgEnvironScore}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)', fontWeight: 650 }}>🤝 Social Rating</span>
                    <span style={{ fontWeight: 700 }}><AnimatedNumber value={orgSocialScore} /> / 100</span>
                  </div>
                  <div className="bar-chart-track" style={{ height: '8px' }}>
                    <div className="bar-chart-fill" style={{ width: `${orgSocialScore}%`, backgroundColor: 'var(--secondary)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: 650 }}>🛡️ Governance Rating</span>
                    <span style={{ fontWeight: 700 }}><AnimatedNumber value={orgGoverScore} /> / 100</span>
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
                        <span style={{ fontWeight: 600 }}><AnimatedNumber value={totalDeptEmissions} /> kg ({pct}%)</span>
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
        </ScrollReveal>

        {/* Right Side: Department Rankings */}
        <ScrollReveal delay={300} duration={800}>
          <div className="dashboard-panel" style={{ height: '100%' }}>
            <div className="panel-header">
              <h3 className="panel-title">🏆 Department Leaderboard</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top ESG Performers</span>
            </div>

            <div className="ranking-list" style={{ marginTop: '14px' }}>
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
                      <AnimatedNumber value={score} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 'auto', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Dashboard Insights:</strong> Operations has the highest operational footprint, but HR leading in policy clearances. Adjust weights on the Admin panel to re-balance global ESG rating.
            </div>
          </div>
        </ScrollReveal>

      </div>

      {/* 2nd Chart Row: Emissions Trend & Department ESG Vertical Ranking */}
      <div className="dashboard-secondary-grid">
        <ScrollReveal delay={150} duration={800}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">📈 Emissions Trend (12 mo)</h3>
            </div>
            
            <div style={{ position: 'relative', height: '180px', marginTop: '10px' }}>
              <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="30" y1="20" x2="470" y2="20" stroke="var(--border-color)" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="30" y1="80" x2="470" y2="80" stroke="var(--border-color)" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="30" y1="140" x2="470" y2="140" stroke="var(--border-color)" strokeDasharray="4 4" strokeWidth="1" />

                {/* Area under curve */}
                <path d={areaPath} fill="url(#waveGrad)" />

                {/* Line path */}
                <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />

                {/* Nodes with points */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="var(--primary)" strokeWidth="3" className="chart-node" />
                    <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="0.65rem" fill="var(--text-primary)" style={{ fontWeight: 600 }}>
                      {p.val}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: '5px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {points.map((p, i) => (
                <span key={i} style={{ width: '30px', textAlign: 'center' }}>{p.month}</span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300} duration={800}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">📊 Department ESG Ranking</h3>
            </div>
            
            <div className="vertical-bar-chart">
              {rankedDepts.slice(0, 5).map(d => {
                const score = Math.round(((d.scoreEnvironmental || 0) + (d.scoreSocial || 0) + (d.scoreGovernance || 0)) / 3);
                return (
                  <div key={d.id} className="vertical-bar-col">
                    <div className="vertical-bar-value">{score}</div>
                    <div className="vertical-bar-track">
                      <div className="vertical-bar-fill" style={{ height: `${score}%`, backgroundColor: '#3b82f6' }} />
                    </div>
                    <div className="vertical-bar-label">{d.name.substring(0, 4)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* 3rd Row: Recent Activity & Quick Actions */}
      <div className="dashboard-tertiary-grid">
        <ScrollReveal delay={150} duration={800}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">⏱️ Recent Activity</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>✔</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>Priya</strong> completed 'Zero Waste Week'
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: '#dc3545' }}>⚠️</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>New compliance issue</strong> in Logistics
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>📊</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>42 new Carbon Transactions</strong> logged
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>📄</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>R&D</strong> acknowledged Anti-Corruption Policy
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={300} duration={800}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">⚡ Quick Actions</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                onClick={() => setActiveTab && setActiveTab('environmental')}
              >
                🌱 Log Carbon Data
              </button>
              <button 
                className="btn" 
                style={{ width: '100%', padding: '12px', justifyContent: 'center', backgroundColor: '#f97316', borderColor: '#f97316', color: '#ffffff' }}
                onClick={() => setActiveTab && setActiveTab('gamification')}
              >
                🏆 Start Challenge
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
                onClick={() => setActiveTab && setActiveTab('reports')}
              >
                📖 View Reports
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>

    </div>
  );
}
