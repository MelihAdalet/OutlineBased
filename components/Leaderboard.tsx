import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Home, RotateCcw } from 'lucide-react';
import { ScoreEntry } from '../types';

interface LeaderboardProps {
  scores: ScoreEntry[];
  onRestart: () => void;
  onHome: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores, onRestart, onHome }) => {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-2xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
            Hall of Fame
          </h2>
        </div>

        <div className="space-y-3 mb-8">
          {sortedScores.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No scores recorded yet. Be the first!</p>
          ) : (
            sortedScores.map((entry, index) => (
              <motion.div
                key={`${entry.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50"
              >
                <div className="flex items-center gap-4">
                  <span className={`
                    w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                      index === 1 ? 'bg-slate-400/20 text-slate-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-700/30 text-slate-500'}
                  `}>
                    {index + 1}
                  </span>
                  <span className="font-semibold text-white">{entry.name}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="font-mono text-xl text-emerald-400 font-bold">{entry.score}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="flex gap-4 justify-center">
            <button
                onClick={onHome}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all font-semibold"
            >
                <Home className="w-4 h-4" />
                Home
            </button>
            <button
                onClick={onRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all font-semibold"
            >
                <RotateCcw className="w-4 h-4" />
                Play Again
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;