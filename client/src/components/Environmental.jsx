import React, { useState, useEffect } from 'react';
import { ScrollReveal } from './AnimationHelpers';

export default function Environmental({ data, refreshData }) {
  const [factors, setFactors] = useState([]);
  const [goals, setGoals] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedFactor, setSelectedFactor] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchEntities();
  }, [data]);

  const fetchEntities = async () => {
    try {
      const resEF = await fetch('/api/entity/emissionFactors');
      const dataEF = await resEF.json();
      setFactors(dataEF);

      const resGoals = await fetch('/api/entity/esgGoals');
      const dataGoals = await resGoals.json();
      setGoals(dataGoals.filter(g => g.module === 'Environmental'));

      const resProd = await fetch('/api/entity/productProfiles');
      const dataProd = await resProd.json();
      setProducts(dataProd);

      if (data && data.departments && data.departments.length > 0) {
        setSelectedDept(data.departments[0].id);
      }
      if (dataEF && dataEF.length > 0) {
        setSelectedFactor(dataEF[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculateAndLog = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setErrorMsg('Please enter a valid positive quantity.');
      return;
    }

    try {
      const res = await fetch('/api/erp/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedDept,
          emissionFactorId: selectedFactor,
          qty: Number(quantity),
          notes,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const result = await res.json();
      if (result.success) {
        const factorObj = factors.find(f => f.id === selectedFactor);
        const loggedEms = result.transaction.emissions;
        setSuccessMsg(`Logged successfully! Raw Quantity: ${quantity} ${factorObj?.unit || ''}. Calculated Emissions: ${loggedEms} kg CO2e.`);
        setQuantity('');
        setNotes('');
        refreshData();
        fetchEntities();
      } else {
        setErrorMsg(result.error || 'Failed to log transaction.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to save ERP operation.');
    }
  };

  // Find standard factor details for calculator helper description
  const activeFactor = factors.find(f => f.id === selectedFactor);

  return (
    <div className="page-content">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>🌱 Environmental Operations & Calculations</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Integrate carbon accounting with standard business transactions and monitor eco-goals
        </p>
      </div>

      <div className="dashboard-main-grid">
        {/* Left column: ERP Simulator Calculator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ScrollReveal delay={100} duration={750}>
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">📟 ERP Operational Sourcing Simulator</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Auto-Carbon Calculations</span>
              </div>

              <form onSubmit={handleCalculateAndLog} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Reporting Department</label>
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

                  <div className="form-group">
                    <label>Operational Resource Category</label>
                    <select 
                      className="form-select" 
                      value={selectedFactor}
                      onChange={(e) => setSelectedFactor(e.target.value)}
                    >
                      {factors.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.factor} kg CO2e/{f.unit})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Quantity consumed ({activeFactor ? activeFactor.unit : 'units'})</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 500" 
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      step="any"
                    />
                  </div>

                  <div className="form-group">
                    <label>Transaction Notes / Ref</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Q3 Courier fleet fuel" 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {activeFactor && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px dashed var(--border-color)' }}>
                    <strong>Calculator Logic:</strong> Emissions = Quantity ({activeFactor.unit}) × Factor ({activeFactor.factor} kg CO2e) = <strong>{(Number(quantity || 0) * activeFactor.factor).toFixed(2)} kg CO2e</strong>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  🚚 Log Transaction to ERP & Compute Carbon
                </button>
              </form>

              {successMsg && <div className="custom-alert custom-alert-success">{successMsg}</div>}
              {errorMsg && <div className="custom-alert custom-alert-warning">{errorMsg}</div>}
            </div>
          </ScrollReveal>

          {/* Product ESG Profiles */}
          <ScrollReveal delay={250} duration={750}>
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">📦 Product Eco-Profiles</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Material footprint</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {products.map(prod => (
                  <div key={prod.id} style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{prod.name}</h4>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Carbon intensity:</span>
                      <strong style={{ color: 'var(--danger)' }}>{prod.carbonFootprint} kg CO2e</strong>
                    </div>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Recyclability:</span>
                      <strong style={{ color: 'var(--primary)' }}>{prod.recyclability}%</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                      Sourcing: {prod.materialSourcing}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right column: Goals and Summary list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Goals Panel */}
          <ScrollReveal delay={150} duration={750}>
            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title">🎯 Sustainability Tracker</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Environmental</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {goals.map(goal => {
                  const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                  return (
                    <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{goal.title}</span>
                        <span style={{ color: goal.status === 'Completed' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}>
                          {percent}% ({goal.status})
                        </span>
                      </div>
                      <div className="bar-chart-track" style={{ height: '10px' }}>
                        <div className="bar-chart-fill" style={{ width: `${percent}%`, backgroundColor: 'var(--primary)' }} />
                      </div>
                      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>Current: {goal.currentValue.toLocaleString()} {goal.unit}</span>
                        <span>Target: {goal.targetValue.toLocaleString()} {goal.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Current list of operations */}
          <ScrollReveal delay={300} duration={750}>
            <div className="dashboard-panel" style={{ flex: 1 }}>
              <div className="panel-header">
                <h3 className="panel-title">📋 Carbon Emissions Audit Ledger</h3>
              </div>

              <div className="table-wrapper" style={{ marginTop: '10px' }}>
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Dept</th>
                      <th>Resource</th>
                      <th>Emissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.departments && data?.erpLog?.slice(-5).reverse().map(log => {
                      const dept = data.departments.find(d => d.id === log.departmentId);
                      const factor = factors.find(f => f.id === log.emissionFactorId);
                      return (
                        <tr key={log.id}>
                          <td>{log.date}</td>
                          <td>{dept ? dept.name.split(' ')[0] : 'Ops'}</td>
                          <td>{factor ? factor.name.split(' (')[0] : 'Utilities'}</td>
                          <td style={{ color: 'var(--danger)', fontWeight: 700 }}>{log.emissions} kg</td>
                        </tr>
                      );
                    })}
                    {(!data?.erpLog || data.erpLog.length === 0) && (
                      <tr>
                        <td colSpan="4" className="notif-empty">No logged emissions transactions</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
