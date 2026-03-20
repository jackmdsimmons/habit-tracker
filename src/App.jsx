import { useState } from 'react';
import { useStore } from './useStore';
import DayView from './components/DayView';
import ManageHabits from './components/ManageHabits';
import Rewards from './components/Rewards';

export default function App() {
  const [screen, setScreen] = useState('day');
  const store = useStore();

  if (screen === 'manage') return <ManageHabits habits={store.habits} setHabits={store.setHabits} onNav={setScreen} />;
  if (screen === 'rewards') return <Rewards rewards={store.rewards} setRewards={store.setRewards} totalPoints={store.totalPoints} redeemReward={store.redeemReward} onNav={setScreen} />;
  return <DayView habits={store.habits} logs={store.logs} setLog={store.setLog} totalPoints={store.totalPoints} onNav={setScreen} />;
}
