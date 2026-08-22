import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import StartScreen from './src/screens/StartScreen';
import GameScreen from './src/screens/GameScreen';

export default function App() {
  const [screen, setScreen] = useState<'start' | 'game'>('start');
  return (
    <>
      <StatusBar style="light" />
      {screen === 'start' ? (
        <StartScreen onStart={() => setScreen('game')} />
      ) : (
        <GameScreen onExit={() => setScreen('start')} />
      )}
    </>
  );
}
