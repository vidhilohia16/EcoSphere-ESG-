import React, { useState, useEffect } from 'react';

export default function Reports({ data, currentUser }) {
  const [reportType, setReportType] = useState('summary');
  
  // Custom Filter State
  const [filterDept, setFilterDept] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterEmp, setFilterEmp] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  const [customData, setCustomData] = useState({
    carbonLogs: [],
    csrLogs: [],
    compliance: [],
    redemptions: []
  });

  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchMetadata();
    generateCustomReport();
  }, [reportType, filterDept, filterStartDate, filterEndDate, filterEmp, filterCat, data]);

  const fetchMetadata = async () => {
    try {
      const resCat = await fetch('/api/entity/categories');
      setCategories(await resCat.json());

      const resEmp = await fetch('/api/entity/employees');
      setEmployees(await resEmp.json());
    } catch(e) { console.error(e); }
  };

  const generateCustomReport = async () => {
    try {
      const q = new URLSearchParams();
      if (filterDept !== 'all') q.append('departmentId', filterDept);
      if (filterStartDate) q.append('startDate', filterStartDate);
      if (filterEndDate) q.append('endDate', filterEndDate);
      if (filterEmp !== 'all') q.append('employeeId', filterEmp);
      if (filterCat !== 'all') q.append('categoryId', filterCat);

      const res = await fetch(`/api/reports/custom?${q.toString()}`);
      const resData = await res.json();
      setCustomData(resData);
    } catch (e) {
      console.error("Error generating custom report", e);
    }
  };

  const exportCSV = () => {
    let csvContent = "";
    
    // We compose CSV based on active view, or dump everything for custom
    if (reportType === 'summary') {
      csvContent += "EcoSphere ESG Summary Report\r\n";
      csvContent += `Organization ESG Rating,${data?.orgEsgScore || 0}\r\n`;
      csvContent += `Environmental Score,${data?.orgEnvironScore || 0}\r\n`;
      csvContent += `Social Score,${data?.orgSocialScore || 0}\r\n`;
      csvContent += `Governance Score,${data?.orgGoverScore || 0}\r\n`;
      csvContent += `Total Emissions (kg CO2e),${data?.totalEmissions || 0}\r\n`;
      csvContent += "\r\nDepartment Breakdown\r\n";
      csvContent += "Department,E Score,S Score,G Score\r\n";
      data?.departments?.forEach(dept => {
        csvContent += `"${dept.name}",${dept.scoreEnvironmental},${dept.scoreSocial},${dept.scoreGovernance}\r\n`;
      });
    } else if (reportType === 'custom') {
      csvContent += "EcoSphere Custom ESG Audit Table\r\n";
      csvContent += "\r\n--- Section A: Carbon Logs ---\r\n";
      csvContent += "Date,Department ID,Category ID,Quantity,Calculated Emissions (kg CO2),Notes\r\n";
      customData.carbonLogs.forEach(c => {
        csvContent += `${c.date},${c.departmentId},${c.categoryId},${c.qty},${c.emissions},"${c.notes}"\r\n`;
      });

      csvContent += "\r\n--- Section B: Social CSR Logs ---\r\n";
      csvContent += "Date,Title,Department ID,Employee ID,Hours,Status\r\n";
      customData.csrLogs.forEach(c => {
        csvContent += `${c.date},"${c.title}",${c.departmentId},${c.employeeId},${c.hours},${c.status}\r\n`;
      });

      csvContent += "\r\n--- Section C: Compliance Tickets ---\r\n";
      csvContent += "Date Logged,Title,Department ID,Severity,Status\r\n";
      customData.compliance.forEach(c => {
        csvContent += `${c.dateLogged},"${c.title}",${c.departmentId},${c.severity},${c.status}\r\n`;
      });
    } else {
      csvContent += `EcoSphere ${reportType.toUpperCase()} module report data\r\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ecosphere_esg_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPDFPrint = () => {
    window.print();
  };

  return (
    <div className="page-content">
      {/* Title */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>📊 ESG Audit & Reporting Center</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Generate Environmental, Social, and Governance sheets or export custom data
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={exportCSV}>📥 Export CSV / Excel</button>
          <button className="btn btn-primary" onClick={triggerPDFPrint}>🖨️ PDF printout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', cssText: 'content-visibility: auto' }}>
        <button className={`btn ${reportType === 'summary' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportType('summary')}>Summary Report</button>
        <button className={`btn ${reportType === 'environ' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportType('environ')}>Environmental Sheet</button>
        <button className={`btn ${reportType === 'social' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportType('social')}>Social Sheet</button>
        <button className={`btn ${reportType === 'gov' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportType('gov')}>Governance Sheet</button>
        <button className={`btn ${reportType === 'custom' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setReportType('custom')}>Custom Report Builder</button>
      </div>

      {/* RENDER DYNAMIC SHEET CARD */}
      <div className="dashboard-panel" id="print-area">
        
        {/* SUMMARY REPORT */}
        {reportType === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem' }}>ORGANIZATION ESG SUMMARY STATEMENT</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px' }}>
                EcoSphere Compliance Registry - Generated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'rgba(24,34,58,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Global ESG Score</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{data?.orgEsgScore}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(24,34,58,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Environmental</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', marginTop: '6px' }}>{data?.orgEnvironScore}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(24,34,58,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Social Engagement</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary)', marginTop: '6px' }}>{data?.orgSocialScore}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(24,34,58,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rules Governance</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '6px' }}>{data?.orgGoverScore}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Department Rating Balances</h4>
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Environmental Score</th>
                      <th>Social Score</th>
                      <th>Governance Score</th>
                      <th>Composite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.departments?.map(dept => {
                      const avg = Math.round(((dept.scoreEnvironmental||0) + (dept.scoreSocial||0) + (dept.scoreGovernance||0)) / 3);
                      return (
                        <tr key={dept.id}>
                          <td style={{ fontWeight: 650 }}>{dept.name}</td>
                          <td style={{ color: 'var(--primary)' }}>{dept.scoreEnvironmental}</td>
                          <td style={{ color: 'var(--secondary)' }}>{dept.scoreSocial}</td>
                          <td style={{ color: 'var(--accent-gold)' }}>{dept.scoreGovernance}</td>
                          <td style={{ fontWeight: 700 }}>{avg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ENVIRONMENTAL SHEET */}
        {reportType === 'environ' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>🌱 Environmental Audit Sheet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Detailed carbon accounting & target performance</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Emissions by Scope Category</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Fleet & Logistics</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>
                      {customData.carbonLogs.filter(x => x.categoryId === 'cat-fleet').reduce((sum, i) => sum + i.emissions, 0)} kg CO2
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Manufacturing & Energy</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>
                      {customData.carbonLogs.filter(x => x.categoryId === 'cat-manufacturing').reduce((sum, i) => sum + i.emissions, 0)} kg CO2
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Utilities & ElectricityExpenses</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>
                      {customData.carbonLogs.filter(x => x.categoryId === 'cat-expenses').reduce((sum, i) => sum + i.emissions, 0)} kg CO2
                    </strong>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: 'rgba(24,34,58,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Net Sourced Emissions</span>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--danger)' }}>{data?.totalEmissions} kg</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capped with regulatory standard offsets</span>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL SHEET */}
        {reportType === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>🤝 Corporate Social Responsibility & Community Log</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Volunteering actions metadata registry</p>
            </div>
            
            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Activity Title</th>
                    <th>Staff Sponsor</th>
                    <th>Hours</th>
                    <th>Acountability Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {customData.csrLogs.map(csr => {
                    const emp = employees.find(e => e.id === csr.employeeId);
                    return (
                      <tr key={csr.id}>
                        <td>{csr.date}</td>
                        <td style={{ fontWeight: 650 }}>{csr.title}</td>
                        <td>{emp ? emp.name : 'Reporter'}</td>
                        <td>{csr.hours} hrs</td>
                        <td style={{ color: csr.evidence ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {csr.evidence ? `✔️ ${csr.evidence}` : 'None'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GOVERNANCE SHEET */}
        {reportType === 'gov' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>🛡️ Governance Compliance Checklist</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Outstanding audit findings and employee attestations</p>
            </div>
            
            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Case / Audit Ticket</th>
                    <th>Dept</th>
                    <th>Criticality</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customData.compliance.map(issue => (
                    <tr key={issue.id}>
                      <td style={{ fontWeight: 600 }}>{issue.title}</td>
                      <td>{issue.departmentId.split('-')[1].toUpperCase()}</td>
                      <td style={{ color: issue.severity === 'High' ? 'var(--danger)' : 'var(--accent-gold)' }}>
                        {issue.severity}
                      </td>
                      <td>
                        <span className={`notif-item-type ${issue.status === 'Resolved' ? 'notif-type-approval' : 'notif-type-compliance'}`}>
                          {issue.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOM REPORT BUILDER PANEL */}
        {reportType === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Custom Filter Controls Form */}
            <div style={{ backgroundColor: 'rgba(24,34,58,0.4)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '14px' }}>🔍 Filter Audits Ledger</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div className="form-group">
                  <label>Department</label>
                  <select className="form-select" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                    <option value="all">All Departments</option>
                    {data?.departments?.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Category Group</label>
                  <select className="form-select" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.module})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Employee Participant</label>
                  <select className="form-select" value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
                    <option value="all">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" className="form-input" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" className="form-input" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Custom Report Builder Tables */}
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Custom Selection: Carbon Sourced Logs</h4>
              <div className="table-wrapper">
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Dept</th>
                      <th>Resource Sourced</th>
                      <th>Emissions</th>
                      <th>Ref Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customData.carbonLogs.map(log => {
                      const dept = data?.departments?.find(d => d.id === log.departmentId);
                      const cat = categories.find(c => c.id === log.categoryId);
                      return (
                        <tr key={log.id}>
                          <td>{log.date}</td>
                          <td>{dept ? dept.name.split(' ')[0] : 'Ops'}</td>
                          <td>{cat ? cat.name : 'Materials'}</td>
                          <td style={{ color: 'var(--danger)', fontWeight: 700 }}>{log.emissions} kg</td>
                          <td>{log.notes}</td>
                        </tr>
                      );
                    })}
                    {customData.carbonLogs.length === 0 && (
                      <tr>
                        <td colSpan="5" className="notif-empty">No carbon records match active filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Custom Selection: Volunteer Actions CSR</h4>
              <div className="table-wrapper">
                <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Activity Title</th>
                      <th>Participant Name</th>
                      <th>Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customData.csrLogs.map(act => {
                      const emp = employees.find(e => e.id === act.employeeId);
                      return (
                        <tr key={act.id}>
                          <td>{act.date}</td>
                          <td style={{ fontWeight: 600 }}>{act.title}</td>
                          <td>{emp ? emp.name : 'Staff'}</td>
                          <td>{act.hours} hrs</td>
                          <td>
                            <span className={`notif-item-type ${act.status === 'Approved' ? 'notif-type-approval' : 'notif-type-compliance'}`}>
                              {act.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {customData.csrLogs.length === 0 && (
                      <tr>
                        <td colSpan="5" className="notif-empty">No CSR hours match active filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
