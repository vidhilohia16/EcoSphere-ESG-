const express = require('express');
const router = express.Router();
const db = require('./db');

// Dashboard summary data
router.get('/dashboard', (req, res) => {
  try {
    res.json(db.getDashboardData());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Config Settings
router.get('/config', (req, res) => {
  res.json(db.data.config);
});

router.post('/config', (req, res) => {
  try {
    const updated = db.updateConfig(req.body);
    res.json({ success: true, config: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Database reset
router.post('/admin/reset', (req, res) => {
  try {
    const freshData = db.reset();
    res.json({ success: true, data: freshData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generic Read for Arrays
router.get('/entity/:name', (req, res) => {
  const name = req.params.name;
  try {
    res.json(db.getList(name));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Submit ERP transaction (calculates carbon)
router.post('/erp/transaction', (req, res) => {
  const { departmentId, emissionFactorId, qty, notes, date } = req.body;
  try {
    if (!departmentId || !emissionFactorId || qty === undefined) {
      return res.status(400).json({ error: "Missing required parameters (departmentId, emissionFactorId, qty)" });
    }
    const newTx = db.addERPTransaction(departmentId, emissionFactorId, qty, notes, date);
    res.json({ success: true, transaction: newTx });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Submit CSR Activity
router.post('/csr/activity', (req, res) => {
  const { title, departmentId, employeeId, date, hours, evidence } = req.body;
  try {
    if (!title || !departmentId || !employeeId || !hours) {
      return res.status(400).json({ error: "Missing required parameters (title, departmentId, employeeId, hours)" });
    }
    const newAct = db.submitCSRActivity(title, departmentId, employeeId, date, hours, evidence);
    res.json({ success: true, activity: newAct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Approve CSR Activity (evidence validation in db.js)
router.post('/csr/approve', (req, res) => {
  const { id, evidence } = req.body;
  try {
    if (!id) return res.status(400).json({ error: "Missing activity ID" });
    const approvedAct = db.approveCSRActivity(id, evidence);
    res.json({ success: true, activity: approvedAct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Acknowledge Compliance Policy
router.post('/policy/acknowledge', (req, res) => {
  const { employeeId, policyId } = req.body;
  try {
    if (!employeeId || !policyId) {
      return res.status(400).json({ error: "Missing employeeId or policyId" });
    }
    const ack = db.acknowledgePolicy(employeeId, policyId);
    res.json({ success: true, acknowledgement: ack });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Redeem XP reward
router.post('/rewards/redeem', (req, res) => {
  const { employeeId, rewardId } = req.body;
  try {
    if (!employeeId || !rewardId) {
      return res.status(400).json({ error: "Missing employeeId or rewardId" });
    }
    const redemption = db.redeemReward(employeeId, rewardId);
    res.json({ success: true, redemption });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Custom Report Builder filtering API
router.get('/reports/custom', (req, res) => {
  try {
    const { departmentId, startDate, endDate, module, employeeId, challengeId, categoryId } = req.query;
    
    // We filter several sources and pack them into a structured report
    db.syncDynamicScores();
    
    let carbonLogs = db.getList('erpLog');
    let csrLogs = db.getList('csrActivities');
    let policies = db.getList('policies');
    let compliance = db.getList('complianceIssues');
    let redemptions = db.getList('redemptions');

    // 1. Filter by Department
    if (departmentId && departmentId !== 'all') {
      carbonLogs = carbonLogs.filter(x => x.departmentId === departmentId);
      csrLogs = csrLogs.filter(x => x.departmentId === departmentId);
      compliance = compliance.filter(x => x.departmentId === departmentId);
    }

    // 2. Filter by Date range
    if (startDate) {
      const start = new Date(startDate);
      carbonLogs = carbonLogs.filter(x => new Date(x.date) >= start);
      csrLogs = csrLogs.filter(x => new Date(x.date) >= start);
      compliance = compliance.filter(x => new Date(x.dateLogged) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      carbonLogs = carbonLogs.filter(x => new Date(x.date) <= end);
      csrLogs = csrLogs.filter(x => new Date(x.date) <= end);
      compliance = compliance.filter(x => new Date(x.dateLogged) <= end);
    }

    // 3. Filter by Employee
    if (employeeId && employeeId !== 'all') {
      csrLogs = csrLogs.filter(x => x.employeeId === employeeId);
      redemptions = redemptions.filter(x => x.employeeId === employeeId);
    }

    // 4. Filter by Category
    if (categoryId && categoryId !== 'all') {
      carbonLogs = carbonLogs.filter(x => x.categoryId === categoryId);
      csrLogs = csrLogs.filter(x => x.categoryId === categoryId);
    }

    res.json({
      carbonLogs,
      csrLogs,
      compliance,
      redemptions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Admin Panels CRUD Routing ---
router.post('/admin/:entity', (req, res) => {
  const entity = req.params.entity;
  try {
    const created = db.addEntity(entity, req.body);
    if (!created) return res.status(404).json({ error: `Entity array '${entity}' does not exist` });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/admin/:entity/:id', (req, res) => {
  const { entity, id } = req.params;
  try {
    const updated = db.updateEntity(entity, id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/admin/:entity/:id', (req, res) => {
  const { entity, id } = req.params;
  try {
    const success = db.deleteEntity(entity, id);
    res.json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
