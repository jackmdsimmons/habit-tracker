import { useState } from 'react';

const BLANK = { name: '', icon: '🎁', cost: 50 };
const ICONS = ['🎁','🍕','🎮','🎬','☕','🍫','🏖️','👟','🍺','🎯','🛍️','🌮','💆','📱','✈️','🎵','🍣','🎂','🥂','⭐'];

function RewardForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || BLANK);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{initial ? 'Edit Reward' : 'New Reward'}</h2>

        <label>Name
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Reward name" />
        </label>

        <label>Point Cost
          <input type="number" min="1" value={form.cost} onChange={e => set('cost', parseInt(e.target.value) || 1)} />
        </label>

        <label>Icon
          <div className="icon-grid">
            {ICONS.map(ic => (
              <button key={ic} className={`icon-btn ${form.icon === ic ? 'active' : ''}`} onClick={() => set('icon', ic)}>{ic}</button>
            ))}
          </div>
        </label>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-save" onClick={() => form.name.trim() && onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function Rewards({ rewards, setRewards, totalPoints, redeemReward, onNav }) {
  const [editing, setEditing] = useState(null);

  const addReward = (form) => {
    setRewards(r => [...r, { ...form, id: Date.now().toString() }]);
    setEditing(null);
  };

  const updateReward = (form) => {
    setRewards(r => r.map(x => x.id === editing.id ? { ...editing, ...form } : x));
    setEditing(null);
  };

  const deleteReward = (id) => {
    if (confirm('Delete this reward?')) setRewards(r => r.filter(x => x.id !== id));
  };

  const redeem = (reward) => {
    if (totalPoints < reward.cost) return;
    if (confirm(`Redeem "${reward.name}" for ${reward.cost} pts?`)) {
      redeemReward(reward);
    }
  };

  return (
    <div className="screen">
      <header className="app-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => onNav('day')}>‹ Back</button>
          <h1>Rewards</h1>
          <button className="add-btn" onClick={() => setEditing('new')}>+</button>
        </div>
        <div className="points-banner">
          <span className="pts-big">{totalPoints}</span>
          <span className="pts-big-label"> points available</span>
        </div>
      </header>

      <div className="rewards-list">
        {rewards.length === 0 && (
          <div className="empty-state">No rewards yet — tap + to add one</div>
        )}
        {rewards.map(r => {
          const canAfford = totalPoints >= r.cost;
          return (
            <div key={r.id} className={`reward-row ${canAfford ? 'affordable' : 'expensive'}`}>
              <span className="reward-icon">{r.icon}</span>
              <div className="reward-info">
                <span className="reward-name">{r.name}</span>
                <span className="reward-cost">{r.cost} pts</span>
              </div>
              <div className="reward-actions">
                <button className="edit-btn" onClick={() => setEditing(r)}>Edit</button>
                <button className="del-btn" onClick={() => deleteReward(r.id)}>✕</button>
                <button className={`redeem-btn ${canAfford ? '' : 'locked'}`} onClick={() => redeem(r)}>
                  {canAfford ? 'Redeem' : '🔒'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <nav className="bottom-nav">
        <button className="nav-tab" onClick={() => onNav('day')}>📅 Today</button>
        <button className="nav-tab" onClick={() => onNav('manage')}>⚙️ Habits</button>
        <button className="nav-tab active">🎁 Rewards</button>
      </nav>

      {editing && (
        <RewardForm
          initial={editing === 'new' ? null : editing}
          onSave={editing === 'new' ? addReward : updateReward}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
