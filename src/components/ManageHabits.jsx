import { useState, useRef } from 'react';
import { exportBackup, importBackup } from '../storage.js';

const BLANK = { name: '', icon: '⭐', color: '#6366f1', type: 'boolean', points: 10 };
const ICONS = ['☀️','💉','📞','🚿','🔄','📖','✍️','🏃','🧘','💊','🥗','💧','🎯','📝','🎵','🌙','💪','🧠','❤️','⭐'];
const COLORS = ['#f59e0b','#8b5cf6','#06b6d4','#3b82f6','#10b981','#f97316','#ec4899','#ef4444','#84cc16','#6366f1'];

function HabitForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || BLANK);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{initial ? 'Edit Habit' : 'New Habit'}</h2>

        <label>Name
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Habit name" />
        </label>

        <label>Type
          <div className="type-toggle">
            <button className={form.type === 'boolean' ? 'active' : ''} onClick={() => set('type', 'boolean')}>Boolean</button>
            <button className={form.type === 'numeric' ? 'active' : ''} onClick={() => set('type', 'numeric')}>Numeric %</button>
          </div>
        </label>

        <label>Points
          <input type="number" min="1" max="999" value={form.points} onChange={e => set('points', parseInt(e.target.value) || 1)} />
        </label>

        <label>Icon
          <div className="icon-grid">
            {ICONS.map(ic => (
              <button key={ic} className={`icon-btn ${form.icon === ic ? 'active' : ''}`} onClick={() => set('icon', ic)}>{ic}</button>
            ))}
          </div>
        </label>

        <label>Color
          <div className="color-grid">
            {COLORS.map(c => (
              <button key={c} className={`color-btn ${form.color === c ? 'active' : ''}`}
                style={{ background: c }} onClick={() => set('color', c)} />
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

export default function ManageHabits({ habits, setHabits, onNav }) {
  const [editing, setEditing] = useState(null); // null | 'new' | habit object
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importBackup(file);
      setImportStatus('Imported! Reload the app to see changes.');
    } catch {
      setImportStatus('Error: invalid backup file.');
    }
    e.target.value = '';
  };

  const addHabit = (form) => {
    const id = form.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    setHabits(h => [...h, { ...form, id }]);
    setEditing(null);
  };

  const updateHabit = (form) => {
    setHabits(h => h.map(x => x.id === editing.id ? { ...editing, ...form } : x));
    setEditing(null);
  };

  const deleteHabit = (id) => {
    if (confirm('Delete this habit?')) setHabits(h => h.filter(x => x.id !== id));
  };

  const moveUp = (i) => {
    if (i === 0) return;
    setHabits(h => { const a = [...h]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; });
  };

  const moveDown = (i) => {
    setHabits(h => { if (i === h.length - 1) return h; const a = [...h]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
  };

  return (
    <div className="screen">
      <header className="app-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => onNav('day')}>‹ Back</button>
          <h1>Habits</h1>
          <button className="add-btn" onClick={() => setEditing('new')}>+</button>
        </div>
      </header>

      <div className="manage-list">
        {habits.map((h, i) => (
          <div key={h.id} className="manage-row" style={{ '--accent': h.color }}>
            <div className="manage-reorder">
              <button onClick={() => moveUp(i)}>↑</button>
              <button onClick={() => moveDown(i)}>↓</button>
            </div>
            <span className="habit-icon">{h.icon}</span>
            <div className="manage-info">
              <span className="manage-name">{h.name}</span>
              <span className="manage-meta">{h.type} · {h.points}pt</span>
            </div>
            <div className="manage-actions">
              <button className="edit-btn" onClick={() => setEditing(h)}>Edit</button>
              <button className="del-btn" onClick={() => deleteHabit(h.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="backup-section">
        <div className="backup-title">Backup & Restore</div>
        <div className="backup-row">
          <button className="backup-btn" onClick={exportBackup}>⬇ Export</button>
          <button className="backup-btn" onClick={() => fileInputRef.current.click()}>⬆ Import</button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </div>
        {importStatus && <div className="backup-status">{importStatus}</div>}
      </div>

      <nav className="bottom-nav">
        <button className="nav-tab" onClick={() => onNav('day')}>📅 Today</button>
        <button className="nav-tab active">⚙️ Habits</button>
        <button className="nav-tab" onClick={() => onNav('rewards')}>🎁 Rewards</button>
      </nav>

      {editing && (
        <HabitForm
          initial={editing === 'new' ? null : editing}
          onSave={editing === 'new' ? addHabit : updateHabit}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
