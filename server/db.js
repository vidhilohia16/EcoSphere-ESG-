const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'esg_data.json');

// Initial Seed Data
const defaultData = {
  config: {
    weightEnvironmental: 40,
    weightSocial: 30,
    weightGovernance: 30,
    carbonAccountingEnabled: true,
    csrRequireEvidence: true
  },
  departments: [
    { id: 'dept-ops', name: 'Operations', employeeCount: 45 },
    { id: 'dept-hr', name: 'Human Resources', employeeCount: 15 },
    { id: 'dept-sales', name: 'Sales & Marketing', employeeCount: 30 },
    { id: 'dept-rd', name: 'R&D', employeeCount: 20 },
    { id: 'dept-fin', name: 'Finance & Admin', employeeCount: 10 }
  ],
  categories: [
    { id: 'cat-fleet', name: 'Fleet Travel', module: 'Environmental' },
    { id: 'cat-manufacturing', name: 'Manufacturing Operations', module: 'Environmental' },
    { id: 'cat-purchases', name: 'Procured Materials', module: 'Environmental' },
    { id: 'cat-expenses', name: 'Facility Expenses & Utilities', module: 'Environmental' },
    { id: 'cat-csr', name: 'CSR Volunteer Activities', module: 'Social' },
    { id: 'cat-training', name: 'Skill & Compliance Training', module: 'Social' },
    { id: 'cat-governance', name: 'Policy & Audit Actions', module: 'Governance' }
  ],
  emissionFactors: [
    { id: 'ef-diesel', categoryId: 'cat-fleet', name: 'Fleet Fuel (Diesel)', factor: 2.68, unit: 'liters', co2Unit: 'kg CO2e' },
    { id: 'ef-petrol', categoryId: 'cat-fleet', name: 'Fleet Fuel (Petrol)', factor: 2.31, unit: 'liters', co2Unit: 'kg CO2e' },
    { id: 'ef-electricity-grid', categoryId: 'cat-expenses', name: 'Grid Electricity', factor: 0.85, unit: 'kWh', co2Unit: 'kg CO2e' },
    { id: 'ef-natural-gas', categoryId: 'cat-expenses', name: 'Natural Gas', factor: 1.88, unit: 'm3', co2Unit: 'kg CO2e' },
    { id: 'ef-steel', categoryId: 'cat-manufacturing', name: 'Raw Material (Steel)', factor: 1.90, unit: 'kg', co2Unit: 'kg CO2e' },
    { id: 'ef-aluminum', categoryId: 'cat-manufacturing', name: 'Raw Material (Aluminum)', factor: 11.50, unit: 'kg', co2Unit: 'kg CO2e' },
    { id: 'ef-paper', categoryId: 'cat-purchases', name: 'Office Supplies (Paper)', factor: 0.95, unit: 'kg', co2Unit: 'kg CO2e' }
  ],
  productProfiles: [
    { id: 'prod-ecoBox', name: 'Eco-Friendly Pack Box', carbonFootprint: 1.25, recyclability: 95, materialSourcing: '100% Recycled content' },
    { id: 'prod-stdBox', name: 'Standard Kraft Box', carbonFootprint: 2.40, recyclability: 70, materialSourcing: 'Mixed forests' },
    { id: 'prod-heavyDuty', name: 'Heavy Duty Case', carbonFootprint: 5.80, recyclability: 50, materialSourcing: 'Virgin pulp' }
  ],
  esgGoals: [
    { id: 'goal-emissions', title: 'Reduce Carbon Footprint by 20%', targetValue: 50000, currentValue: 12000, unit: 'kg CO2e', module: 'Environmental', targetDate: '2026-12-31', status: 'In Progress' },
    { id: 'goal-csr', title: '500 CSR Volunteer Hours', targetValue: 500, currentValue: 180, unit: 'hours', module: 'Social', targetDate: '2026-12-31', status: 'In Progress' },
    { id: 'goal-policy', title: '100% Policy Acknowledgement', targetValue: 100, currentValue: 80, unit: '%', module: 'Governance', targetDate: '2026-09-30', status: 'In Progress' }
  ],
  policies: [
    { id: 'pol-conduct', title: 'Code of Business Conduct and Ethics', version: 'v2.1', lastUpdated: '2026-01-10', requiredRoles: ['All'] },
    { id: 'pol-env', title: 'Environmental Sustainability & Carbon Offset Policy', version: 'v1.4', lastUpdated: '2026-03-15', requiredRoles: ['All'] },
    { id: 'pol-whistleblower', title: 'Whistleblower and Anti-Corruption Policy', version: 'v3.0', lastUpdated: '2025-11-05', requiredRoles: ['All'] }
  ],
  badges: [
    { id: 'badge-carbon-starter', name: 'Eco Starter', description: 'Log your first carbon tracking transaction', icon: '🌱', xpAward: 50, ruleType: 'first_carbon_log' },
    { id: 'badge-csr-champion', name: 'CSR Champion', description: 'Participate in 3 or more CSR volunteer activities', icon: '🤝', xpAward: 100, ruleType: 'csr_count_3' },
    { id: 'badge-policy-guardian', name: 'Policy Guardian', description: 'Acknowledge all compliance policies', icon: '🛡️', xpAward: 100, ruleType: 'all_policies' },
    { id: 'badge-xp-milestone', name: 'Sustainability Veteran', description: 'Earn 300 or more total XP', icon: '🏆', xpAward: 200, ruleType: 'xp_milestone_300' }
  ],
  rewards: [
    { id: 'rew-cup', name: 'Eco Ceramic Coffee Mug', cost: 100, inventoryCount: 20, description: 'Reusable bamboo-blend ceramic mug' },
    { id: 'rew-tree', name: 'Plant a Native Tree', cost: 200, inventoryCount: 999, description: 'We will plant a tree in your name with carbon verification' },
    { id: 'rew-gift', name: '$20 Sustainability Store Voucher', cost: 300, inventoryCount: 5, description: 'Voucher redeemable at verified ethical stores' }
  ],
  challenges: [
    { id: 'chal-carpool', title: 'Carpool Week', rewardXp: 40, participantCount: 12, target: 'Commute with coworker 3 times', status: 'Active', module: 'Environmental' },
    { id: 'chal-cleanup', title: 'Local Park Clean-up', rewardXp: 80, participantCount: 8, target: 'Represent the company at the park clean-up', status: 'Active', module: 'Social' },
    { id: 'chal-audit', title: 'Office Audit Day', rewardXp: 50, participantCount: 3, target: 'Ensure waste segregation in your department', status: 'Active', module: 'Governance' }
  ],
  employees: [
    { id: 'emp-101', name: 'Alex Rivera', role: 'Staff', departmentId: 'dept-ops', xp: 220 },
    { id: 'emp-102', name: 'Sophia Chen', role: 'Staff', departmentId: 'dept-rd', xp: 350 },
    { id: 'emp-103', name: 'Marcus Vance', role: 'Manager', departmentId: 'dept-sales', xp: 180 },
    { id: 'emp-104', name: 'Elena Rostova', role: 'Compliance Officer', departmentId: 'dept-fin', xp: 290 },
    { id: 'emp-105', name: 'Liam Hughes', role: 'Staff', departmentId: 'dept-hr', xp: 90 }
  ],
  erpLog: [
    { id: 'erp-01', departmentId: 'dept-ops', date: '2026-07-01', categoryId: 'cat-fleet', emissionFactorId: 'ef-diesel', qty: 250, emissions: 670, notes: 'Fleet truck delivery fuel' },
    { id: 'erp-02', departmentId: 'dept-rd', date: '2026-07-02', categoryId: 'cat-expenses', emissionFactorId: 'ef-electricity-grid', qty: 1500, emissions: 1275, notes: 'R&D Lab heating & cooling' },
    { id: 'erp-03', departmentId: 'dept-ops', date: '2026-07-04', categoryId: 'cat-manufacturing', emissionFactorId: 'ef-steel', qty: 800, emissions: 1520, notes: 'Batch-12 production steel casing' },
    { id: 'erp-04', departmentId: 'dept-sales', date: '2026-07-05', categoryId: 'cat-purchases', emissionFactorId: 'ef-paper', qty: 50, emissions: 47.5, notes: 'Marketing pamphlets print order' }
  ],
  csrActivities: [
    { id: 'csr-01', title: 'Community Green Planting Day', departmentId: 'dept-ops', employeeId: 'emp-101', date: '2026-07-03', hours: 4, status: 'Approved', evidence: 'community_greenhouse_photo.jpg' },
    { id: 'csr-02', title: 'Homeless Shelter Meal Service', departmentId: 'dept-hr', employeeId: 'emp-105', date: '2026-07-08', hours: 3, status: 'Approved', evidence: 'volunteer_badge.jpg' },
    { id: 'csr-03', title: 'Coastal Cleanup Drive', departmentId: 'dept-rd', employeeId: 'emp-102', date: '2026-07-10', hours: 5, status: 'Pending Approval', evidence: null }
  ],
  policyAcknowledgements: [
    { employeeId: 'emp-101', policyId: 'pol-conduct', acknowledged: true, date: '2026-01-15' },
    { employeeId: 'emp-101', policyId: 'pol-env', acknowledged: true, date: '2026-03-20' },
    { employeeId: 'emp-102', policyId: 'pol-conduct', acknowledged: true, date: '2026-02-10' },
    { employeeId: 'emp-102', policyId: 'pol-env', acknowledged: true, date: '2026-03-18' },
    { employeeId: 'emp-102', policyId: 'pol-whistleblower', acknowledged: true, date: '2026-01-05' }, // Sophia has acknowledged all policies
    { employeeId: 'emp-103', policyId: 'pol-conduct', acknowledged: true, date: '2026-02-01' },
    { employeeId: 'emp-104', policyId: 'pol-conduct', acknowledged: true, date: '2026-01-12' },
    { employeeId: 'emp-104', policyId: 'pol-env', acknowledged: true, date: '2026-03-16' },
    { employeeId: 'emp-104', policyId: 'pol-whistleblower', acknowledged: true, date: '2026-01-12' } // Elena has acknowledged all policies
  ],
  complianceIssues: [
    { id: 'comp-01', title: 'Missing Material Supplier Certifications', departmentId: 'dept-ops', severity: 'High', dateLogged: '2026-06-20', status: 'Open', description: 'Ops lacks green sourcing proof for steel raw material receipts.' },
    { id: 'comp-02', title: 'Overdue Whistleblower Policy Reminders', departmentId: 'dept-sales', severity: 'Medium', dateLogged: '2026-07-02', status: 'Open', description: 'Over 40% of sales staff have overdue handbook policy logs.' },
    { id: 'comp-03', title: 'Incomplete Safety Equipment Induction Log', departmentId: 'dept-rd', severity: 'Low', dateLogged: '2026-05-14', status: 'Resolved', description: 'Induction training sheets not uploaded for temp contractors.' }
  ],
  badgeUnlocks: [
    { employeeId: 'emp-101', badgeId: 'badge-carbon-starter', date: '2026-07-02' },
    { employeeId: 'emp-104', badgeId: 'badge-policy-guardian', date: '2026-03-16' },
    { employeeId: 'emp-102', badgeId: 'badge-policy-guardian', date: '2026-03-18' },
    { employeeId: 'emp-102', badgeId: 'badge-xp-milestone', date: '2026-07-10' }
  ],
  redemptions: [
    { id: 'red-01', employeeId: 'emp-101', rewardId: 'rew-cup', date: '2026-07-06', cost: 100 }
  ],
  notifications: [
    { id: 'notif-01', employeeId: 'emp-104', type: 'compliance', message: 'Urgent compliance audit review scheduled for operations.', date: '2026-07-11', unread: true },
    { id: 'notif-02', employeeId: 'emp-101', type: 'badge', message: 'Congratulations! You unlocked the Eco Starter badge.', date: '2026-07-02', unread: false }
  ]
};

class Database {
  constructor() {
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = JSON.parse(JSON.stringify(defaultData));
        this.save();
      }
    } catch (e) {
      console.error("Error reading database file, using fallback default data", e);
      this.data = JSON.parse(JSON.stringify(defaultData));
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error("Error saving database file", e);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(defaultData));
    this.save();
    return this.getDashboardData();
  }

  // --- Dynamic Dashboard & Scores calculations ---

  getDashboardData() {
    this.syncDynamicScores();
    
    // Summary values
    const departments = this.data.departments;
    const carbonLog = this.data.erpLog;
    
    const totalEmissions = carbonLog.reduce((acc, log) => acc + (log.emissions || 0), 0);
    const totalEmployees = departments.reduce((acc, dept) => acc + dept.employeeCount, 0);
    
    const goalCompletionRate = Math.round(
      (this.data.esgGoals.filter(g => g.status === 'Completed').length / (this.data.esgGoals.length || 1)) * 100
    );

    // Dynamic Organization ESG calculations
    const scoreData = this.calculateOrgEsgScore();

    return {
      totalEmissions,
      totalEmployees,
      goalCompletionRate,
      orgEsgScore: scoreData.totalScore,
      orgEnvironScore: scoreData.environScore,
      orgSocialScore: scoreData.socialScore,
      orgGoverScore: scoreData.goverScore,
      weights: {
        E: this.data.config.weightEnvironmental,
        S: this.data.config.weightSocial,
        G: this.data.config.weightGovernance
      },
      departments: departments.map(d => ({
        ...d,
        emissions: carbonLog.filter(c => c.departmentId === d.id).reduce((acc, log) => acc + (log.emissions || 0), 0)
      })),
      erpLog: carbonLog
    };
  }

  calculateOrgEsgScore() {
    const departments = this.data.departments;
    if (departments.length === 0) return { totalScore: 0, environScore: 0, socialScore: 0, goverScore: 0 };

    let totalE = 0;
    let totalS = 0;
    let totalG = 0;

    departments.forEach(dept => {
      totalE += dept.scoreEnvironmental || 75;
      totalS += dept.scoreSocial || 70;
      totalG += dept.scoreGovernance || 80;
    });

    const avgE = Math.round(totalE / departments.length);
    const avgS = Math.round(totalS / departments.length);
    const avgG = Math.round(totalG / departments.length);

    const wE = this.data.config.weightEnvironmental;
    const wS = this.data.config.weightSocial;
    const wG = this.data.config.weightGovernance;

    const totalWeight = wE + wS + wG;
    const finalScore = totalWeight > 0 ? Math.round((avgE * wE + avgS * wS + avgG * wG) / totalWeight) : 0;

    return {
      environScore: avgE,
      socialScore: avgS,
      goverScore: avgG,
      totalScore: finalScore
    };
  }

  syncDynamicScores() {
    // Dynamically update scores for departments based on tracking logs
    this.data.departments.forEach(dept => {
      // 1. Environmental: base 85. Minus 2 points for every 100 kg CO2 emissions, plus average product rating
      const deptEmissions = this.data.erpLog
        .filter(c => c.departmentId === dept.id)
        .reduce((sum, item) => sum + (item.emissions || 0), 0);
      
      let eScore = 95 - Math.round(deptEmissions / 150);
      eScore = Math.max(30, Math.min(100, eScore));

      // 2. Social: training logs + CSR logs
      // Participation: how many CSR actions have employees in this department logged
      const csrCount = this.data.csrActivities.filter(c => c.departmentId === dept.id && c.status === 'Approved').length;
      let sScore = 65 + (csrCount * 8);
      sScore = Math.max(30, Math.min(100, sScore));

      // 3. Governance: policy acknowledgements (out of employees) + resolved compliance issues
      const totalDeptEmps = this.data.employees.filter(e => e.departmentId === dept.id);
      let ackRate = 1.0;
      if (totalDeptEmps.length > 0) {
        let ackCount = 0;
        totalDeptEmps.forEach(emp => {
          const empAcks = this.data.policyAcknowledgements.filter(a => a.employeeId === emp.id && a.acknowledged).length;
          if (empAcks >= this.data.policies.length) {
            ackCount++;
          }
        });
        ackRate = ackCount / totalDeptEmps.length;
      }
      
      const openIssues = this.data.complianceIssues.filter(i => i.departmentId === dept.id && i.status === 'Open').length;
      let gScore = Math.round((ackRate * 60) + (40 - (openIssues * 15)));
      gScore = Math.max(20, Math.min(100, gScore));

      dept.scoreEnvironmental = eScore;
      dept.scoreSocial = sScore;
      dept.scoreGovernance = gScore;
    });

    // Update goals current value
    // Target Goals:
    // Carbon emissions:
    const emissionsGoal = this.data.esgGoals.find(g => g.id === 'goal-emissions');
    if (emissionsGoal) {
      const totalEms = this.data.erpLog.reduce((acc, log) => acc + (log.emissions || 0), 0);
      emissionsGoal.currentValue = totalEms;
      if (totalEms >= emissionsGoal.targetValue) {
        emissionsGoal.status = 'Completed';
      } else {
        emissionsGoal.status = 'In Progress';
      }
    }

    // CSR Volunteer hours:
    const csrGoal = this.data.esgGoals.find(g => g.id === 'goal-csr');
    if (csrGoal) {
      const totalHrs = this.data.csrActivities
        .filter(c => c.status === 'Approved')
        .reduce((sum, item) => sum + item.hours, 0);
      csrGoal.currentValue = totalHrs;
      if (totalHrs >= csrGoal.targetValue) {
        csrGoal.status = 'Completed';
      } else {
        csrGoal.status = 'In Progress';
      }
    }

    // Policy Acknowledgement Rate Goal:
    const policyGoal = this.data.esgGoals.find(g => g.id === 'goal-policy');
    if (policyGoal) {
      const totalEmployees = this.data.employees.length;
      let fullAckCount = 0;
      this.data.employees.forEach(emp => {
        const empAcks = this.data.policyAcknowledgements.filter(a => a.employeeId === emp.id && a.acknowledged).length;
        if (empAcks >= this.data.policies.length) {
          fullAckCount++;
        }
      });
      const percent = totalEmployees > 0 ? Math.round((fullAckCount / totalEmployees) * 100) : 100;
      policyGoal.currentValue = percent;
      if (percent >= policyGoal.targetValue) {
        policyGoal.status = 'Completed';
      } else {
        policyGoal.status = 'In Progress';
      }
    }
  }

  // --- ERP Actions & Carbon Engine ---

  addERPTransaction(deptId, efId, quantity, notes, dateStr) {
    const factorObj = this.data.emissionFactors.find(f => f.id === efId);
    if (!factorObj) throw new Error("Emission factor not found");

    let calcEmissions = 0;
    if (this.data.config.carbonAccountingEnabled) {
      calcEmissions = Math.round(quantity * factorObj.factor * 100) / 100;
    }

    const newTx = {
      id: 'erp-' + Date.now().toString(36),
      departmentId: deptId,
      date: dateStr || new Date().toISOString().split('T')[0],
      categoryId: factorObj.categoryId,
      emissionFactorId: efId,
      qty: Number(quantity),
      emissions: calcEmissions,
      notes: notes || `Operational log for ${factorObj.name}`
    };

    this.data.erpLog.push(newTx);
    this.syncDynamicScores();

    // Auto-award badges for operations staff
    // Award 15 XP to random reporting employee in department
    const deptEmps = this.data.employees.filter(e => e.departmentId === deptId);
    if (deptEmps.length > 0) {
      const reporter = deptEmps[0];
      reporter.xp += 15;
      this.checkAndAwardBadgesForEmployee(reporter.id);
    }

    this.save();
    return newTx;
  }

  // --- CSR Activity & Approvals ---

  submitCSRActivity(title, deptId, employeeId, dateStr, hours, evidenceBlob) {
    const employee = this.data.employees.find(e => e.id === employeeId);
    if (!employee) throw new Error("Employee not found");

    let finalStatus = 'Approved';
    if (this.data.config.csrRequireEvidence && !evidenceBlob) {
      finalStatus = 'Pending Approval';
    }

    const newActivity = {
      id: 'csr-' + Date.now().toString(36),
      title,
      departmentId: deptId,
      employeeId,
      date: dateStr || new Date().toISOString().split('T')[0],
      hours: Number(hours),
      status: finalStatus,
      evidence: evidenceBlob || null
    };

    if (finalStatus === 'Approved') {
      // Award XP: 10 XP per hour
      employee.xp += Number(hours) * 10;
      this.checkAndAwardBadgesForEmployee(employee.id);
    }

    this.data.csrActivities.push(newActivity);
    this.syncDynamicScores();
    this.save();
    return newActivity;
  }

  approveCSRActivity(id, evidenceAttached) {
    const act = this.data.csrActivities.find(c => c.id === id);
    if (!act) throw new Error("CSR activity not found");

    if (act.status === 'Approved') return act;

    if (this.data.config.csrRequireEvidence && !act.evidence && !evidenceAttached) {
      throw new Error("Verification evidence is required for approval based on ESG policy config.");
    }

    act.status = 'Approved';
    if (evidenceAttached) {
      act.evidence = evidenceAttached;
    }

    // Award XP
    const emp = this.data.employees.find(e => e.id === act.employeeId);
    if (emp) {
      emp.xp += act.hours * 10;
      
      // Auto notification
      this.data.notifications.push({
        id: 'notif-' + Date.now().toString(36),
        employeeId: emp.id,
        type: 'approval',
        message: `Your CSR Volunteer Hours for '${act.title}' have been approved!`,
        date: new Date().toISOString().split('T')[0],
        unread: true
      });
      
      this.checkAndAwardBadgesForEmployee(emp.id);
    }

    this.syncDynamicScores();
    this.save();
    return act;
  }

  rejectCSRActivity(id) {
    const act = this.data.csrActivities.find(c => c.id === id);
    if (!act) throw new Error("CSR activity not found");
    
    if (act.status === 'Approved') {
      const emp = this.data.employees.find(e => e.id === act.employeeId);
      if (emp) {
        emp.xp = Math.max(0, emp.xp - act.hours * 10);
      }
    }
    
    act.status = 'Rejected';
    this.syncDynamicScores();
    this.save();
    return act;
  }

  // --- Policy Acknowledgements ---

  acknowledgePolicy(employeeId, policyId) {
    const employee = this.data.employees.find(e => e.id === employeeId);
    if (!employee) throw new Error("Employee not found");

    const policy = this.data.policies.find(p => p.id === policyId);
    if (!policy) throw new Error("Policy not found");

    const existingIndex = this.data.policyAcknowledgements.findIndex(
      a => a.employeeId === employeeId && a.policyId === policyId
    );

    if (existingIndex > -1) {
      this.data.policyAcknowledgements[existingIndex].acknowledged = true;
      this.data.policyAcknowledgements[existingIndex].date = new Date().toISOString().split('T')[0];
    } else {
      this.data.policyAcknowledgements.push({
        employeeId,
        policyId,
        acknowledged: true,
        date: new Date().toISOString().split('T')[0]
      });
    }

    // Reward XP for policy audit compliance
    employee.xp += 20;

    // Check policy guardian badge!
    this.checkAndAwardBadgesForEmployee(employeeId);
    
    this.syncDynamicScores();
    this.save();
    return { success: true };
  }

  // --- Gamification Engine & Badge Awarding ---

  checkAndAwardBadgesForEmployee(employeeId) {
    const employee = this.data.employees.find(e => e.id === employeeId);
    if (!employee) return;

    const currentUnlocks = this.data.badgeUnlocks.filter(u => u.employeeId === employeeId).map(u => u.badgeId);

    this.data.badges.forEach(badge => {
      // Skip if already unlocked
      if (currentUnlocks.includes(badge.id)) return;

      let meetsRule = false;

      if (badge.ruleType === 'first_carbon_log') {
        const carbonLogCount = this.data.erpLog.filter(
          log => this.data.employees.find(e => e.id === employeeId && e.departmentId === log.departmentId)
        ).length;
        if (carbonLogCount > 0) meetsRule = true;
      }
      
      if (badge.ruleType === 'csr_count_3') {
        const approvedCsrs = this.data.csrActivities.filter(a => a.employeeId === employeeId && a.status === 'Approved').length;
        if (approvedCsrs >= 3) meetsRule = true;
      }

      if (badge.ruleType === 'all_policies') {
        const clientAcks = this.data.policyAcknowledgements.filter(a => a.employeeId === employeeId && a.acknowledged).length;
        if (clientAcks >= this.data.policies.length) meetsRule = true;
      }

      if (badge.ruleType === 'xp_milestone_300') {
        if (employee.xp >= 300) meetsRule = true;
      }

      // Unlock badge!
      if (meetsRule) {
        this.data.badgeUnlocks.push({
          employeeId,
          badgeId: badge.id,
          date: new Date().toISOString().split('T')[0]
        });

        // Award badge XP
        employee.xp += badge.xpAward;

        // Push alert notification
        this.data.notifications.push({
          id: 'notif-' + Date.now().toString(36),
          employeeId,
          type: 'badge',
          message: `Badge Unlocked: ${badge.name}! Earned +${badge.xpAward} XP.`,
          date: new Date().toISOString().split('T')[0],
          unread: true
        });
      }
    });

    this.save();
  }

  // --- Rewards Redemption ---

  redeemReward(employeeId, rewardId) {
    const employee = this.data.employees.find(e => e.id === employeeId);
    if (!employee) throw new Error("Employee not found");

    const reward = this.data.rewards.find(r => r.id === rewardId);
    if (!reward) throw new Error("Reward item not found");

    if (reward.inventoryCount <= 0) {
      throw new Error(`Item '${reward.name}' is temporarily out of stock.`);
    }

    if (employee.xp < reward.cost) {
      throw new Error(`Insufficient XP. Required: ${reward.cost} XP, Current: ${employee.xp} XP.`);
    }

    // Deduct and decrement
    employee.xp -= reward.cost;
    reward.inventoryCount--;

    const redemption = {
      id: 'red-' + Date.now().toString(36),
      employeeId,
      rewardId,
      date: new Date().toISOString().split('T')[0],
      cost: reward.cost
    };

    this.data.redemptions.push(redemption);
    
    this.data.notifications.push({
      id: 'notif-' + Date.now().toString(36),
      employeeId,
      type: 'approval',
      message: `Successfully redeemed reward: ${reward.name} for ${reward.cost} XP! Check your email.`,
      date: new Date().toISOString().split('T')[0],
      unread: true
    });

    this.save();
    return redemption;
  }

  // --- Admin Configuration Updates ---

  updateConfig(configData) {
    this.data.config = {
      ...this.data.config,
      ...configData
    };
    
    // Keep values standard and capped at positive integers
    this.data.config.weightEnvironmental = Math.max(0, parseInt(this.data.config.weightEnvironmental) || 0);
    this.data.config.weightSocial = Math.max(0, parseInt(this.data.config.weightSocial) || 0);
    this.data.config.weightGovernance = Math.max(0, parseInt(this.data.config.weightGovernance) || 0);

    this.syncDynamicScores();
    this.save();
    return this.data.config;
  }

  // Generic CRUD for admin entities

  getList(entityName) {
    if (!this.data[entityName]) return [];
    
    if (entityName === 'departments') {
      this.syncDynamicScores();
    }
    return this.data[entityName];
  }

  addEntity(entityName, entityData) {
    if (!this.data[entityName]) return null;
    
    const newId = (entityName.slice(0, 3) + '-' + Date.now().toString(36)).toLowerCase();
    const newEntity = {
      id: newId,
      ...entityData
    };

    this.data[entityName].push(newEntity);
    this.syncDynamicScores();
    this.save();
    return newEntity;
  }

  updateEntity(entityName, id, entityData) {
    if (!this.data[entityName]) return null;

    const idx = this.data[entityName].findIndex(x => x.id === id);
    if (idx === -1) throw new Error(`Entity ${entityName} with id ${id} not found`);

    this.data[entityName][idx] = {
      ...this.data[entityName][idx],
      ...entityData,
      id // preserve ID
    };

    this.syncDynamicScores();
    this.save();
    return this.data[entityName][idx];
  }

  deleteEntity(entityName, id) {
    if (!this.data[entityName]) return false;

    const idx = this.data[entityName].findIndex(x => x.id === id);
    if (idx === -1) return false;

    this.data[entityName].splice(idx, 1);
    this.syncDynamicScores();
    this.save();
    return true;
  }
}

const db = new Database();
module.exports = db;
