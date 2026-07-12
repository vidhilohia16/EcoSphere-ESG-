const db = require('./db');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ ASSERTION PASSED: ${message}`);
  }
}

async function runTests() {
  console.log("--------------------------------------------------");
  console.log("ECOSPHERE ESG PLATORM AUTOMATED TEST SUITE");
  console.log("--------------------------------------------------");

  // Test 1: Reset database state
  console.log("\nStarting Test 1: Database Reset & Defaults...");
  db.reset();
  const initDash = db.getDashboardData();
  assert(initDash.totalEmployees === 120, "Initial total employee count should match seed sum of 120");
  assert(initDash.weights.E === 40, "Default configuration weight E should be 40");
  assert(initDash.weights.S === 30, "Default configuration weight S should be 30");
  assert(initDash.weights.G === 30, "Default configuration weight G should be 30");

  // Test 2: Automatic Carbon 계산
  console.log("\nStarting Test 2: ERP Sourcing Carbon Calculation...");
  const initialEmissions = initDash.totalEmissions; // seed emissions sum: 670 + 1275 + 1520 + 47.5 = 3512.5 kg
  
  // Add diesel transaction: 100 liters. diesel factor: 2.68. Calc emissions = 268 kg CO2e
  const dieselTx = db.addERPTransaction('dept-ops', 'ef-diesel', 100, "Test diesel logistics", "2026-07-20");
  assert(dieselTx.emissions === 268, "100 Liters Diesel at 2.68 factor should equal 268 kg CO2e");
  
  const postEmissionsDash = db.getDashboardData();
  assert(postEmissionsDash.totalEmissions === initialEmissions + 268, "Audit ledger total emissions should increase by 268");

  // Test 3: Weightings Adjustment & ESG Scores recalculating
  console.log("\nStarting Test 3: System Weights Configuration Sync...");
  // Let's modify weights to E: 80, S: 10, G: 10
  db.updateConfig({
    weightEnvironmental: 80,
    weightSocial: 10,
    weightGovernance: 10
  });

  const updatedConfig = db.data.config;
  assert(updatedConfig.weightEnvironmental === 80, "Environmental weight should configure to 80");
  assert(updatedConfig.weightSocial === 10, "Social weight should configure to 10");
  
  // Verify scores recalculate immediately using E:80%, S:10%, G:10%
  const updatedDash = db.getDashboardData();
  const calculatedComposite = Math.round(
    (updatedDash.orgEnvironScore * 80 + updatedDash.orgSocialScore * 10 + updatedDash.orgGoverScore * 10) / 100
  );
  assert(updatedDash.orgEsgScore === calculatedComposite, "Global score should recalculate using updated ratios");

  // Reset config back to default 40/30/30
  db.updateConfig({
    weightEnvironmental: 40,
    weightSocial: 30,
    weightGovernance: 30
  });

  // Test 4: Badge unlocking check
  console.log("\nStarting Test 4: Gamification Badge Milestones...");
  const employee = db.data.employees.find(e => e.id === 'emp-101'); // Alex Rivera: initial XP 220
  
  // Add badge check for milestone. Acknowledge a policy: rewards +20 XP. Total becomes 240.
  // Then submit a CSR drive: 8 hours. Approved status rewards 10 XP/hr = +80 XP. Total becomes 320.
  // Alex should unlock badge-xp-milestone (300 XP milestone) and get +200 XP award badge!
  db.acknowledgePolicy('emp-101', 'pol-whistleblower'); // Alex completes policy signoff. +20 XP
  
  // Submit approved CSR
  db.submitCSRActivity("Community Foresting Drive", "dept-ops", "emp-101", "2026-07-21", 8, "photo.jpg");
  
  const empUnlocks = db.data.badgeUnlocks.filter(u => u.employeeId === 'emp-101');
  const hasVeteranBadge = empUnlocks.some(u => u.badgeId === 'badge-xp-milestone');
  assert(hasVeteranBadge === true, "Alex Rivera's XP >= 320 should trigger badge-xp-milestone unlock");
  
  // Test 5: Reward shop checkout validation
  console.log("\nStarting Test 5: Reward Shop Inventory & XP Check...");
  // Let's create an employee with 50 XP
  const lowXpEmp = db.data.employees.find(e => e.id === 'emp-105'); // Liam Hughes: initial XP 90
  
  // Attempt to redeem item cost 100 XP (Eco Ceramic Coffee Mug)
  let failedRedemption = false;
  try {
    db.redeemReward('emp-105', 'rew-cup');
  } catch (err) {
    failedRedemption = true;
    console.log(`Expected rejection caught: ${err.message}`);
  }
  assert(failedRedemption === true, "Low XP employee should be rejected from getting reward");

  // Attempt to redeem when inventory is 0
  const searchReward = db.data.rewards.find(r => r.id === 'rew-gift'); // stock: 5, cost: 300 XP
  // Give Alex Rivera tons of XP
  const richEmp = db.data.employees.find(e => e.id === 'emp-101');
  richEmp.xp = 2000;
  
  // Drain inventory to 0
  searchReward.inventoryCount = 0;
  let outOfStockRejection = false;
  try {
    db.redeemReward('emp-101', 'rew-gift');
  } catch (err) {
    outOfStockRejection = true;
    console.log(`Expected out of stock caught: ${err.message}`);
  }
  assert(outOfStockRejection === true, "Out-of-stock reward redeem request should be rejected");

  console.log("\n--------------------------------------------------");
  console.log("🏆 ALL AUTOMATED TESTS VALIDIATED SUCCESSFULLY!");
  console.log("--------------------------------------------------");
  db.reset(); // Restore original database parameters
}

runTests();
