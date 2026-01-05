import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Game from './components/Game';
import GameOver from './components/GameOver';
import Leaderboard from './components/Leaderboard';
import { GameState, ScoreEntry } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('landing');
  const [score, setScore] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [useLives, setUseLives] = useState(true);
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  // Load scores on mount
  useEffect(() => {
    const savedScores = localStorage.getItem('geoGuessScores');
    if (savedScores) {
      try {
        setScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }
  }, []);

  const saveScore = (name: string) => {
    const newEntry: ScoreEntry = {
      name,
      score,
      date: new Date().toISOString()
    };
    const updatedScores = [...scores, newEntry];
    setScores(updatedScores);
    localStorage.setItem('geoGuessScores', JSON.stringify(updatedScores));
    setGameState('leaderboard');
  };

  const handleStartGame = (enableAi: boolean, enableLives: boolean) => {
    setAiEnabled(enableAi);
    setUseLives(enableLives);
    setScore(0);
    setGameState('playing');
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    setGameState('gameover');
  };
  
  const handleWin = (finalScore: number) => {
      setScore(finalScore);
      setGameState('gameover'); 
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {gameState === 'landing' && (
        <LandingPage 
          onStart={handleStartGame} 
          onViewLeaderboard={() => setGameState('leaderboard')} 
        />
      )}
      
      {gameState === 'playing' && (
        <Game 
          aiEnabled={aiEnabled} 
          useLives={useLives}
          onGameOver={handleGameOver}
          onWin={handleWin}
        />
      )}
      
      {gameState === 'gameover' && (
        <GameOver 
          score={score} 
          onSaveScore={saveScore} 
        />
      )}
      
      {gameState === 'leaderboard' && (
        <Leaderboard 
          scores={scores} 
          onRestart={() => setGameState('landing')}
          onHome={() => setGameState('landing')}
        />
      )}
    </div>
  );
};

export default App;