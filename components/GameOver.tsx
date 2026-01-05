import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Flag } from 'lucide-react';

interface GameOverProps {
  score: number;
  onSaveScore: (name: string) => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onSaveScore }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSaveScore(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-indigo-500/10 blur-[60px] -z-10 pointer-events-none" />

        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
            <Flag className="w-8 h-8 text-indigo-500" />
        </div>

        <h2 className="text-4xl font-extrabold text-white mb-2">Game Finished</h2>
        <p className="text-slate-400 mb-8">Thanks for playing!</p>

        <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700/50">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Final Score</p>
            <p className="text-5xl font-mono font-bold text-white">{score}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2 text-left">
              Enter your name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Captain Cook"
              maxLength={15}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3.5 rounded-xl transition-all"
          >
            <Save className="w-5 h-5" />
            Save Score
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default GameOver;