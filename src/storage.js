const KEYS = {
  habits: 'ht_habits',
  logs: 'ht_logs',
  points: 'ht_points',
  rewards: 'ht_rewards',
};

const DEFAULT_HABITS = [
  { id: 'morning',   name: 'Morning',      icon: '☀️', color: '#f59e0b', type: 'boolean', points: 20 },
  { id: 'aplicar',   name: 'Aplicar',      icon: '💉', color: '#8b5cf6', type: 'numeric', points: 15 },
  { id: 'contactar', name: 'Contactar',    icon: '📞', color: '#06b6d4', type: 'numeric', points: 15 },
  { id: 'no_shower', name: 'No Hot Shower',icon: '🚿', color: '#3b82f6', type: 'boolean', points: 15 },
  { id: 'transducir',name: 'Transducir',   icon: '🔄', color: '#10b981', type: 'numeric', points: 15 },
  { id: 'leer',      name: 'Leer (esp)',   icon: '📖', color: '#f97316', type: 'numeric', points: 10 },
  { id: 'escribir',  name: 'Escribir',     icon: '✍️', color: '#ec4899', type: 'numeric', points: 20 },
];

export function getHabits() {
  try {
    const raw = localStorage.getItem(KEYS.habits);
    return raw ? JSON.parse(raw) : DEFAULT_HABITS;
  } catch { return DEFAULT_HABITS; }
}

export function saveHabits(habits) {
  localStorage.setItem(KEYS.habits, JSON.stringify(habits));
}

// logs: { [dateStr]: { [habitId]: value } }
// value: true/false for boolean, 0–100 for numeric
export function getLogs() {
  try {
    const raw = localStorage.getItem(KEYS.logs);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveLogs(logs) {
  localStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export function getPoints() {
  try {
    const raw = localStorage.getItem(KEYS.points);
    return raw ? parseInt(raw, 10) : 0;
  } catch { return 0; }
}

export function savePoints(pts) {
  localStorage.setItem(KEYS.points, String(pts));
}

export function getRewards() {
  try {
    const raw = localStorage.getItem(KEYS.rewards);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveRewards(rewards) {
  localStorage.setItem(KEYS.rewards, JSON.stringify(rewards));
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function computeDayPoints(habits, dayLog) {
  if (!dayLog) return 0;
  return habits.reduce((sum, h) => {
    const val = dayLog[h.id];
    if (val === undefined || val === null) return sum;
    if (h.type === 'boolean') return sum + (val ? h.points : 0);
    return sum + Math.round((val / 100) * h.points);
  }, 0);
}

export function exportBackup() {
  const data = {
    version: 1,
    exported: new Date().toISOString(),
    habits:  localStorage.getItem(KEYS.habits),
    logs:    localStorage.getItem(KEYS.logs),
    points:  localStorage.getItem(KEYS.points),
    rewards: localStorage.getItem(KEYS.rewards),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habits-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.habits)  localStorage.setItem(KEYS.habits,  data.habits);
        if (data.logs)    localStorage.setItem(KEYS.logs,    data.logs);
        if (data.points)  localStorage.setItem(KEYS.points,  data.points);
        if (data.rewards) localStorage.setItem(KEYS.rewards, data.rewards);
        resolve();
      } catch {
        reject(new Error('Invalid backup file'));
      }
    };
    reader.readAsText(file);
  });
}

export function computeStreak(habits, logs) {
  const today = todayStr();
  let streak = 0;
  let d = new Date(today);
  while (true) {
    const key = d.toISOString().slice(0, 10);
    const log = logs[key];
    if (!log) break;
    // count as "done" if at least one habit logged
    const hasEntry = Object.values(log).some(v => v !== null && v !== undefined && v !== false && v !== 0);
    if (!hasEntry) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
