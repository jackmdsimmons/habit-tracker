import { useState } from 'react';
import { todayStr, computeDayPoints, computeStreak } from '../storage';

function BooleanHabit({ habit, value, onChange }) {
  const done = !!value;
  return (
    <button
      className={`habit-row boolean ${done ? 'done' : ''}`}
      onClick={() => onChange(!done)}
      style={{ '--accent': habit.color }}
    >
      <span className="habit-icon">{habit.icon}</span>
      <span className="habit-name">{habit.name}</span>
      <span className="habit-pts">+{habit.points}pt</span>
      <span className={`toggle ${done ? 'on' : 'off'}`}>{done ? '✓' : '○'}</span>
    </button>
  );
}

function NumericHabit({ habit, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const pct = value ?? 0;
  const earned = Math.round((pct / 100) * habit.points);

  const commit = () => {
    const n = Math.min(100, Math.max(0, parseInt(draft, 10) || 0));
    onChange(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="habit-row numeric editing" style={{ '--accent': habit.color }}>
        <span className="habit-icon">{habit.icon}</span>
        <span className="habit-name">{habit.name}</span>
        <input
          type="number"
          min="0"
          max="100"
          value={draft}
          autoFocus
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          onBlur={commit}
          className="num-input"
        />
      </div>
    );
  }

  return (
    <button
      className={`habit-row numeric ${pct > 0 ? 'done' : ''}`}
      onClick={() => { setDraft(String(pct)); setEditing(true); }}
      style={{ '--accent': habit.color }}
    >
      <span className="habit-icon">{habit.icon}</span>
      <div className="habit-main">
        <span className="habit-name">{habit.name}</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%`, background: habit.color }} />
        </div>
      </div>
      <div className="habit-right">
        <span className="habit-pts">+{earned}pt</span>
        <span className="pct-label">{pct}%</span>
      </div>
    </button>
  );
}

export default function DayView({ habits, logs, setLog, totalPoints, onNav }) {
  const [date, setDate] = useState(todayStr());
  const dayLog = logs[date] || {};
  const dayPts = computeDayPoints(habits, dayLog);
  const maxPts = habits.reduce((s, h) => s + h.points, 0);
  const streak = computeStreak(habits, logs);
  const isToday = date === todayStr();

  const prevDay = () => {
    const d = new Date(date); d.setDate(d.getDate() - 1);
    setDate(d.toISOString().slice(0, 10));
  };
  const nextDay = () => {
    const d = new Date(date); d.setDate(d.getDate() + 1);
    const next = d.toISOString().slice(0, 10);
    if (next <= todayStr()) setDate(next);
  };

  const fmt = (ds) => {
    const d = new Date(ds + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="screen">
      {/* Header */}
      <header className="app-header">
        <div className="header-top">
          <div className="streak">🔥 {streak}d streak</div>
          <div className="total-pts" onClick={() => onNav('rewards')}>
            <span className="pts-num">{totalPoints}</span>
            <span className="pts-label"> pts</span>
          </div>
        </div>
        <div className="date-nav">
          <button className="nav-btn" onClick={prevDay}>‹</button>
          <span className="date-str">{isToday ? 'Today' : fmt(date)}</span>
          <button className="nav-btn" onClick={nextDay} disabled={isToday}>›</button>
        </div>
        <div className="day-progress">
          <div className="day-fill" style={{ width: `${(dayPts / maxPts) * 100}%` }} />
          <span className="day-score">{dayPts} / {maxPts} pts</span>
        </div>
      </header>

      {/* Habits */}
      <div className="habit-list">
        {habits.map(h => (
          h.type === 'boolean'
            ? <BooleanHabit key={h.id} habit={h} value={dayLog[h.id]} onChange={v => setLog(date, h.id, v)} />
            : <NumericHabit key={h.id} habit={h} value={dayLog[h.id]} onChange={v => setLog(date, h.id, v)} />
        ))}
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <button className="nav-tab active">📅 Today</button>
        <button className="nav-tab" onClick={() => onNav('manage')}>⚙️ Habits</button>
        <button className="nav-tab" onClick={() => onNav('rewards')}>🎁 Rewards</button>
      </nav>
    </div>
  );
}
