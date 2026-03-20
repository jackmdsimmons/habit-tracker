import { useState, useCallback } from 'react';
import {
  getHabits, saveHabits,
  getLogs, saveLogs,
  getPoints, savePoints,
  getRewards, saveRewards,
  computeDayPoints,
} from './storage';

export function useStore() {
  const [habits, setHabitsState] = useState(getHabits);
  const [logs, setLogsState] = useState(getLogs);
  const [totalPoints, setTotalPointsState] = useState(getPoints);
  const [rewards, setRewardsState] = useState(getRewards);

  const setHabits = useCallback((h) => {
    const val = typeof h === 'function' ? h(habits) : h;
    setHabitsState(val);
    saveHabits(val);
  }, [habits]);

  const setLog = useCallback((dateStr, habitId, value) => {
    setLogsState(prev => {
      const oldDayLog = prev[dateStr] || {};
      const oldPts = computeDayPoints(habits, oldDayLog);
      const newDayLog = { ...oldDayLog, [habitId]: value };
      const newPts = computeDayPoints(habits, newDayLog);
      const newLogs = { ...prev, [dateStr]: newDayLog };
      saveLogs(newLogs);

      // adjust running total
      setTotalPointsState(p => {
        const updated = Math.max(0, p - oldPts + newPts);
        savePoints(updated);
        return updated;
      });

      return newLogs;
    });
  }, [habits]);

  const setRewards = useCallback((r) => {
    const val = typeof r === 'function' ? r(rewards) : r;
    setRewardsState(val);
    saveRewards(val);
  }, [rewards]);

  const redeemReward = useCallback((reward) => {
    setTotalPointsState(p => {
      const updated = Math.max(0, p - reward.cost);
      savePoints(updated);
      return updated;
    });
  }, []);

  return { habits, setHabits, logs, setLog, totalPoints, rewards, setRewards, redeemReward };
}
