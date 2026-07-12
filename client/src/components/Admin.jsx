import React, { useState, useEffect } from 'react';

export default function Admin({ data, refreshData, currentUser }) {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState({
    weightEnvironmental: 40,
    weightSocial: 30,
    weightGovernance: 30,
    carbonAccountingEnabled: true,
    csrRequireEvidence: true
  });

  // Entities state
  const [departments, setDepartments] = useState([]);
  const [factors, setFactors] = useState([]);
  const [products, setProducts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [categories, setCategories] = useState([]);

  // Forms state
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing forms state
  const [deptForm, setDeptForm] = useState({ id: '', name: '', employeeCount: 10 });
  const [factorForm, setFactorForm] = useState({ id: '', categoryId: '', name: '', factor: 0.1, unit: 'liters', co2Unit: 'kg CO2e' });
  const [productForm, setProductForm] = useState({ id: '', name: '', carbonFootprint: 1.0, recyclability: 80, materialSourcing: '' });
  const [goalForm, setGoalForm] = useState({ id: '', title: '', targetValue: 100, currentValue: 0, unit: '', module: 'Environmental', targetDate: '', status: 'In Progress' });
  const [policyForm, setPolicyForm] = useState({ id: '', title: '', version: 'v1.0', lastUpdated: '', requiredRoles: 'All' });
  const [rewardForm, setRewardForm] = useState({ id: '', name: '', cost: 100, inventoryCount: 10, description: '' });

  useEffect(() => {
    fetchConfig();
    fetchEntities();
  }, [data]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const dataC = await res.json();
      setConfig(dataC);
    } catch (e) { console.error(e); }
  };

  const fetchEntities = async () => {
    try {
      const resDec = await fetch('/api/entity/departments');
      setDepartments(await resDec.json());

      const resEF = await fetch('/api/entity/emissionFactors');
      setFactors(await resEF.json());

      const resProd = await fetch('/api/entity/productProfiles');
      setProducts(await resProd.json());

      const resGoal = await fetch('/api/entity/esgGoals');
      setGoals(await resGoal.json());

      const resPol = await fetch('/api/entity/policies');
      setPolicies(await resPol.json());

      const resRew = await fetch('/api/entity/rewards');
      setRewards(await resRew.json());

      const resCat = await fetch('/api/entity/categories');
      setCategories(await resCat.json());
    } catch (e) {
      console.error(e);
    }
  };

  const notifyUserChange = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const resData = await res.json();
      if (resData.success) {
        notifyUserChange('ESG core platform configuration weights saved successfully.');
        refreshData();
      } else {
        setErrorMsg(resData.error);
      }
    } catch (err) {
      setErrorMsg('Failed to update config.');
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to restore default seeding database values? All logs will be reset.")) return;
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const resData = await res.json();
      if (resData.success) {
        notifyUserChange("ERP seeds and scores reset to clean defaults.");
        refreshData();
        fetchEntities();
        fetchConfig();
      }
    } catch(err) {
      setErrorMsg("Failed to reset database data.");
    }
  };

  // CRUD helpers
  const handleSaveEntity = async (entityName, entityForm, setFormState, defaultForm) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const isEdit = !!entityForm.id;
      const url = isEdit ? `/api/admin/${entityName}/${entityForm.id}` : `/api/admin/${entityName}`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entityForm)
      });

      if (res.ok) {
        notifyUserChange(`Entity in '${entityName}' saved successfully.`);
        setFormState(defaultForm);
        fetchEntities();
        refreshData();
      } else {
        throw new Error('Save operation failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error saving entity data.');
    }
  };

  const handleDeleteEntity = async (entityName, id) => {
    if (!window.confirm("Delete this parameter item permanently?")) return;
    try {
      const res = await fetch(`/api/admin/${entityName}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notifyUserChange(`Item in '${entityName}' deleted.`);
        fetchEntities();
        refreshData();
      } else {
        throw new Error('Failed to delete.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleEditInit = (entityForm, setFormState) => {
    setFormState({ ...entityForm });
  };

  const isComplianceOfficer = currentUser && currentUser.role === 'Compliance Officer';

  return (
    <div className="page-content">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>⚙️ Platform Administration Panel</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Define calculation weights, require evidence triggers, and perform general configurations
        </p>
      </div>

      {!isComplianceOfficer && (
        <div className="custom-alert custom-alert-warning">
          <strong>⚠️ VIEW LOCK:</strong> Only a certified **Compliance Officer** has authorization to save configurations. Please navigate the upper user roles dropdown to unlock.
        </div>
      )}

      {successMsg && <div className="custom-alert custom-alert-success">{successMsg}</div>}
      {errorMsg && <div className="custom-alert custom-alert-warning">{errorMsg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', cssText: 'content-visibility: auto' }}>
        <button className={`btn ${activeTab === 'config' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('config')}>Configure Weights & Rules</button>
        <button className={`btn ${activeTab === 'departments' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('departments')}>Departments</button>
        <button className={`btn ${activeTab === 'emissionFactors' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('emissionFactors')}>Emission Factors</button>
        <button className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('products')}>Products</button>
        <button className={`btn ${activeTab === 'goals' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('goals')}>E/S/G Goals</button>
        <button className={`btn ${activeTab === 'policies' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('policies')}>Policies</button>
        <button className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('rewards')}>Rewards Catalog</button>
      </div>

      {/* RENDER CONFIG WORKSPACE */}
      {activeTab === 'config' && (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">⭐ Global ESG Configuration Ratings Weight</h3>
          </div>

          <form onSubmit={handleConfigSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className="form-group">
                <label>Environmental Weight (%)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={config.weightEnvironmental} 
                  onChange={(e) => setConfig({ ...config, weightEnvironmental: Number(e.target.value) })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <div className="form-group">
                <label>Social Weight (%)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={config.weightSocial} 
                  onChange={(e) => setConfig({ ...config, weightSocial: Number(e.target.value) })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <div className="form-group">
                <label>Governance Weight (%)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={config.weightGovernance} 
                  onChange={(e) => setConfig({ ...config, weightGovernance: Number(e.target.value) })}
                  disabled={!isComplianceOfficer}
                />
              </div>
            </div>

            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(24,34,58,0.4)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Weighting Formula:</strong> Global rating = (E rating × {config.weightEnvironmental} + S rating × {config.weightSocial} + G rating × {config.weightGovernance}) / {config.weightEnvironmental + config.weightSocial + config.weightGovernance}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Automatic Emissions Accounting</label>
                <select 
                  className="form-select"
                  value={String(config.carbonAccountingEnabled)}
                  onChange={(e) => setConfig({ ...config, carbonAccountingEnabled: e.target.value === 'true' })}
                  disabled={!isComplianceOfficer}
                >
                  <option value="true">Enabled (Compute from ERP)</option>
                  <option value="false">Disabled (Zero out calculations)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Require Evidence for Volunteer Action Approval</label>
                <select 
                  className="form-select"
                  value={String(config.csrRequireEvidence)}
                  onChange={(e) => setConfig({ ...config, csrRequireEvidence: e.target.value === 'true' })}
                  disabled={!isComplianceOfficer}
                >
                  <option value="true">Yes (Audit confirmation required)</option>
                  <option value="false">No (Auto-award credits immediately)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary" disabled={!isComplianceOfficer}>
                💾 Save Global Config Settings
              </button>
              
              <button 
                type="button" 
                className="btn btn-danger" 
                style={{ marginLeft: 'auto' }}
                onClick={handleResetData}
                disabled={!isComplianceOfficer}
              >
                ⚠️ Reset DB Seeds
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER TAB CRUD DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{deptForm.id ? '✏️ Edit Department' : '➕ Add Department'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Department Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={deptForm.name} 
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <div className="form-group">
                <label>Workforce headcount</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={deptForm.employeeCount} 
                  onChange={(e) => setDeptForm({ ...deptForm, employeeCount: Number(e.target.value) })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSaveEntity('departments', deptForm, setDeptForm, { id:'', name:'', employeeCount:10 })}
                disabled={!isComplianceOfficer}
              >
                Save Department
              </button>
              {deptForm.id && (
                <button className="btn btn-secondary" onClick={() => setDeptForm({ id:'', name:'', employeeCount:10 })}>Cancel</button>
              )}
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Headcount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(dept => (
                    <tr key={dept.id}>
                      <td style={{ fontWeight: 600 }}>{dept.name}</td>
                      <td>{dept.employeeCount} emps</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', marginRight: '6px' }} onClick={() => handleEditInit(dept, setDeptForm)} disabled={!isComplianceOfficer}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteEntity('departments', dept.id)} disabled={!isComplianceOfficer || dept.id.startsWith('dept-')}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB CRUD EMISSION FACTORS */}
      {activeTab === 'emissionFactors' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{factorForm.id ? '✏️ Edit Factor' : '➕ Add Factor'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Resource / Factor Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={factorForm.name} 
                  onChange={(e) => setFactorForm({ ...factorForm, name: e.target.value })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <div className="form-group">
                <label>Factor category group</label>
                <select 
                  className="form-select"
                  value={factorForm.categoryId}
                  onChange={(e) => setFactorForm({ ...factorForm, categoryId: e.target.value })}
                  disabled={!isComplianceOfficer}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.module})</option>
                  ))}
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Value (kg CO2 / Unit)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    step="any" 
                    value={factorForm.factor} 
                    onChange={(e) => setFactorForm({ ...factorForm, factor: Number(e.target.value) })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
                <div className="form-group">
                  <label>Unit Label</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={factorForm.unit} 
                    onChange={(e) => setFactorForm({ ...factorForm, unit: e.target.value })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSaveEntity('emissionFactors', factorForm, setFactorForm, { id:'', categoryId:'', name:'', factor:0.1, unit:'liters', co2Unit:'kg CO2e' })}
                disabled={!isComplianceOfficer || !factorForm.categoryId}
              >
                Save Factor
              </button>
              {factorForm.id && (
                <button className="btn btn-secondary" onClick={() => setFactorForm({ id:'', categoryId:'', name:'', factor:0.1, unit:'liters', co2Unit:'kg CO2e' })}>Cancel</button>
              )}
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Factor Name</th>
                    <th>Group</th>
                    <th>Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {factors.map(fac => {
                    const cat = categories.find(c => c.id === fac.categoryId);
                    return (
                      <tr key={fac.id}>
                        <td style={{ fontWeight: 600 }}>{fac.name}</td>
                        <td>{cat ? cat.name.split(' ')[0] : 'Environmental'}</td>
                        <td>{fac.factor} kg / {fac.unit}</td>
                        <td>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', marginRight: '4px' }} onClick={() => handleEditInit(fac, setFactorForm)} disabled={!isComplianceOfficer}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteEntity('emissionFactors', fac.id)} disabled={!isComplianceOfficer || fac.id.startsWith('ef-')}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{productForm.id ? '✏️ Edit Product' : '➕ Add Product'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Carbon footprint (kg CO2e)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    step="any" 
                    value={productForm.carbonFootprint} 
                    onChange={(e) => setProductForm({ ...productForm, carbonFootprint: Number(e.target.value) })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
                <div className="form-group">
                  <label>Recyclability (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={productForm.recyclability} 
                    onChange={(e) => setProductForm({ ...productForm, recyclability: Number(e.target.value) })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Procurement Sourcing Info</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={productForm.materialSourcing} 
                  onChange={(e) => setProductForm({ ...productForm, materialSourcing: e.target.value })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSaveEntity('productProfiles', productForm, setProductForm, { id:'', name:'', carbonFootprint:1.0, recyclability:80, materialSourcing:'' })}
                disabled={!isComplianceOfficer}
              >
                Save Product
              </button>
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Carbon</th>
                    <th>Recycle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600 }}>{prod.name}</td>
                      <td>{prod.carbonFootprint} kg</td>
                      <td>{prod.recyclability}%</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', marginRight: '4px' }} onClick={() => handleEditInit(prod, setProductForm)} disabled={!isComplianceOfficer}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteEntity('productProfiles', prod.id)} disabled={!isComplianceOfficer}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER GOALS TAB */}
      {activeTab === 'goals' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{goalForm.id ? '✏️ Edit Goal' : '➕ Add ESG Goal'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Goal Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={goalForm.title} 
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Metric Target Value</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={goalForm.targetValue} 
                    onChange={(e) => setGoalForm({ ...goalForm, targetValue: Number(e.target.value) })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
                <div className="form-group">
                  <label>Units label</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. kg CO2e, hours, %" 
                    value={goalForm.unit} 
                    onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>ESG Module</label>
                  <select 
                    className="form-select"
                    value={goalForm.module}
                    onChange={(e) => setGoalForm({ ...goalForm, module: e.target.value })}
                    disabled={!isComplianceOfficer}
                  >
                    <option value="Environmental">Environmental</option>
                    <option value="Social">Social</option>
                    <option value="Governance">Governance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target End Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={goalForm.targetDate} 
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSaveEntity('esgGoals', goalForm, setGoalForm, { id:'', title:'', targetValue:100, currentValue:0, unit:'', module:'Environmental', targetDate:'', status:'In Progress' })}
                disabled={!isComplianceOfficer}
              >
                Save Goal
              </button>
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Module</th>
                    <th>Target</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map(gl => (
                    <tr key={gl.id}>
                      <td style={{ fontWeight: 600 }}>{gl.title}</td>
                      <td>{gl.module}</td>
                      <td>{gl.targetValue.toLocaleString()} {gl.unit}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', marginRight: '4px' }} onClick={() => handleEditInit(gl, setGoalForm)} disabled={!isComplianceOfficer}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteEntity('esgGoals', gl.id)} disabled={!isComplianceOfficer || gl.id.startsWith('goal-')}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER POLICIES TAB */}
      {activeTab === 'policies' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{policyForm.id ? '✏️ Edit Policy' : '➕ Add Policy'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Policy Handbook Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={policyForm.title} 
                  onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Version tag</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={policyForm.version} 
                    onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
                <div className="form-group">
                  <label>Date published</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={policyForm.lastUpdated} 
                    onChange={(e) => setPolicyForm({ ...policyForm, lastUpdated: e.target.value })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSaveEntity('policies', policyForm, setPolicyForm, { id:'', title:'', version:'v1.0', lastUpdated:'', requiredRoles:'All' })}
                disabled={!isComplianceOfficer}
              >
                Save Policy
              </button>
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Handbook Title</th>
                    <th>Version</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map(pol => (
                    <tr key={pol.id}>
                      <td style={{ fontWeight: 600 }}>{pol.title}</td>
                      <td>{pol.version}</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', marginRight: '4px' }} onClick={() => handleEditInit(pol, setPolicyForm)} disabled={!isComplianceOfficer}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteEntity('policies', pol.id)} disabled={!isComplianceOfficer || pol.id.startsWith('pol-')}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER REWARDS TAB */}
      {activeTab === 'rewards' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">{rewardForm.id ? '✏️ Edit Reward' : '➕ Add Store Reward'}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label>Reward Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={rewardForm.name} 
                  onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Cost (XP points)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={rewardForm.cost} 
                    onChange={(e) => setRewardForm({ ...rewardForm, cost: Number(e.target.value) })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
                <div className="form-group">
                  <label>Inventory Stock</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={rewardForm.inventoryCount} 
                    onChange={(e) => setRewardForm({ ...rewardForm, inventoryCount: Number(e.target.value) })}
                    disabled={!isComplianceOfficer}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Item Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={rewardForm.description} 
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  disabled={!isComplianceOfficer}
                />
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleSaveEntity('rewards', rewardForm, setRewardForm, { id:'', name:'', cost:100, inventoryCount:10, description:'' })}
                disabled={!isComplianceOfficer}
              >
                Save Reward
              </button>
            </div>
          </div>
          <div className="dashboard-panel">
            <div className="table-wrapper">
              <table className="custom-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Cost</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map(rew => (
                    <tr key={rew.id}>
                      <td style={{ fontWeight: 600 }}>{rew.name}</td>
                      <td>{rew.cost} XP</td>
                      <td>{rew.inventoryCount} left</td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', marginRight: '4px' }} onClick={() => handleEditInit(rew, setRewardForm)} disabled={!isComplianceOfficer}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDeleteEntity('rewards', rew.id)} disabled={!isComplianceOfficer || rew.id.startsWith('rew-')}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
