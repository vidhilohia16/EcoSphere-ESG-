import React, { useState, useEffect } from 'react';

export default function Gamification({ data, refreshData, currentUser }) {
  const [challenges, setChallenges] = useState([]);
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [unlocks, setUnlocks] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchEntities();
  }, [data]);

  const fetchEntities = async () => {
    try {
      const resChal = await fetch('/api/entity/challenges');
      const dataChal = await resChal.json();
      setChallenges(dataChal);

      const resBad = await fetch('/api/entity/badges');
      const dataBad = await resBad.json();
      setBadges(dataBad);

      const resRew = await fetch('/api/entity/rewards');
      const dataRew = await resRew.json();
      setRewards(dataRew);

      const resEmp = await fetch('/api/entity/employees');
      const dataEmp = await resEmp.json();
      setEmployees(dataEmp);

      const resUnl = await fetch('/api/entity/badgeUnlocks');
      const dataUnl = await resUnl.json();
      setUnlocks(dataUnl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRedeem = async (rewardId) => {
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          rewardId
        })
      });

      const result = await res.json();
      if (result.success) {
        const reward = rewards.find(r => r.id === rewardId);
        setSuccessMsg(`Redeemed successfully! Item: ${reward?.name || 'Reward'}. Deducted ${reward?.cost} XP from your balance.`);
        refreshData();
        fetchEntities();
      } else {
        setErrorMsg(result.error || 'Failed to redeem reward.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during redemption check.');
    }
  };

  // Sort employees by XP for leaderboard
  const leaderBoard = [...employees].sort((a, b) => b.xp - a.xp);

  // Check if current user has unlocked each badge
  const currentUserUnlocks = unlocks.filter(u => u.employeeId === currentUser?.id).map(u => u.badgeId);

  return (
    <div className="page-content">
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>🏆 Gamification Workplace Hub</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Engage employees in carbon reduction challenges, unlock badges, and redeem eco-rewards using XP
        </p>
      </div>

      {successMsg && <div className="custom-alert custom-alert-success">{successMsg}</div>}
      {errorMsg && <div className="custom-alert custom-alert-warning">{errorMsg}</div>}

      <div className="dashboard-main-grid">
        {/* Left column: Leaderboards and Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Unlocked Badges Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">⭐ Achievement Badges</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Auto-unlocked by rules</span>
            </div>

            <div className="badge-grid">
              {badges.map(badge => {
                const isUnlocked = currentUserUnlocks.includes(badge.id);
                return (
                  <div key={badge.id} className={`badge-item-card ${isUnlocked ? '' : 'locked'}`}>
                    <div className="badge-avatar">
                      {isUnlocked ? badge.icon : '🔒'}
                    </div>
                    <div className="badge-name">{badge.name}</div>
                    <div className="badge-desc">{badge.description}</div>
                    <div className="badge-tag">+{badge.xpAward} XP</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reward Shop */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">🛒 Sustainability Reward Store</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Redeem with XP</span>
            </div>

            <div className="reward-grid">
              {rewards.map(reward => {
                const hasInventory = reward.inventoryCount > 0;
                const canAfford = currentUser && currentUser.xp >= reward.cost;
                const isRedeemable = hasInventory && canAfford;

                return (
                  <div key={reward.id} className="reward-card">
                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4.5px' }}>{reward.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{reward.description}</p>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                        <span className="reward-cost">💰 {reward.cost} XP</span>
                        <span style={{ color: hasInventory ? 'var(--text-secondary)' : 'var(--danger)', fontSize: '0.75rem' }}>
                          Stock: {reward.inventoryCount}
                        </span>
                      </div>
                      <button 
                        className={`btn ${isRedeemable ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem' }}
                        disabled={!isRedeemable || !currentUser}
                        onClick={() => handleRedeem(reward.id)}
                      >
                        {hasInventory ? (canAfford ? 'Redeem Item' : 'Insufficient XP') : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right column: Challenges & Leaderboards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Challenges */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">✨ Active Missions & Quests</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {challenges.map(chal => (
                <div key={chal.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(24, 34, 58, 0.4)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 650, fontSize: '0.85rem' }}>{chal.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target: {chal.target}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 700 }}>+{chal.rewardXp} XP</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{chal.participantCount} joined</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard panel */}
          <div className="dashboard-panel" style={{ flex: 1 }}>
            <div className="panel-header">
              <h3 className="panel-title">🔥 Sustainability Superstars</h3>
            </div>

            <div className="ranking-list">
              {leaderBoard.slice(0, 5).map((emp, index) => {
                const rank = index + 1;
                const isSelf = emp.id === currentUser?.id;
                let badgeClass = "ranking-badge";
                if (rank === 1) badgeClass += " ranking-badge-1";
                if (rank === 2) badgeClass += " ranking-badge-2";

                return (
                  <div key={emp.id} className="ranking-item" style={{ 
                    border: isSelf ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-color)',
                    backgroundColor: isSelf ? 'rgba(250, 204, 21, 0.05)' : 'rgba(16, 25, 48, 0.4)'
                  }}>
                    <div className={badgeClass}>{rank}</div>
                    <div className="ranking-details">
                      <div className="ranking-name" style={{ fontWeight: isSelf ? 700 : 500 }}>
                        {emp.name} {isSelf && <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>(You)</span>}
                      </div>
                      <div className="ranking-subtext">Department sponsor: {emp.departmentId.split('-')[1].toUpperCase()}</div>
                    </div>
                    <div className="ranking-score-pill" style={{ backgroundColor: 'rgba(250,204,21,0.1)', color: 'var(--accent-gold)', borderColor: 'rgba(250,204,21,0.2)' }}>
                      {emp.xp} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
