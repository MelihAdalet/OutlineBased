import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Sparkles, Map, Trophy, Heart, Infinity } from 'lucide-react';

interface LandingPageProps {
  onStart: (aiEnabled: boolean, useLives: boolean) => void;
  onViewLeaderboard: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onViewLeaderboard }) => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [useLives, setUseLives] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl w-full"
      >
        <div className="inline-flex items-center justify-center p-4 bg-slate-900/50 rounded-3xl mb-8 border border-slate-800 backdrop-blur-sm shadow-2xl">
          <Globe2 className="w-16 h-16 text-indigo-400" />
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
          Outline<span className="text-indigo-500">Based</span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
          Test your geography knowledge. Identify countries by their shape.
        </p>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 max-w-xl mx-auto w-full">
            {/* Game Mode Selection */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Game Mode</label>
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setUseLives(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                            useLives ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Heart className="w-4 h-4 fill-current" />
                        Survival
                    </button>
                    <button
                        onClick={() => setUseLives(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                            !useLives ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Infinity className="w-4 h-4" />
                        Freeplay
                    </button>
                </div>
                <p className="text-xs text-slate-500 min-h-[20px]">
                    {useLives ? "3 Lives. Game Over on mistakes." : "Infinite lives. Relaxed practice."}
                </p>
            </div>

            {/* AI Toggle */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assistance</label>
                <button
                    onClick={() => setAiEnabled(!aiEnabled)}
                    className={`
                        flex items-center justify-between px-4 py-3 rounded-xl border transition-all h-[50px]
                        ${aiEnabled 
                            ? 'bg-indigo-900/20 border-indigo-500/50 text-white' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}
                    `}
                >
                    <div className="flex items-center gap-2 font-bold text-sm">
                        <Sparkles className={`w-4 h-4 ${aiEnabled ? 'text-indigo-400' : 'text-slate-600'}`} />
                        AI Hints
                    </div>
                    <div className={`
                        w-10 h-6 rounded-full p-1 transition-colors flex items-center
                        ${aiEnabled ? 'bg-indigo-500 justify-end' : 'bg-slate-700 justify-start'}
                    `}>
                        <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                </button>
                 <p className="text-xs text-slate-500 flex items-center justify-center gap-1 min-h-[20px]">
                    <Map className="w-3 h-3" />
                    Powered by Google Maps
                </p>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
          <button
            onClick={() => onStart(aiEnabled, useLives)}
            className="flex-1 bg-white hover:bg-indigo-50 text-slate-950 font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
          >
            Start Game
          </button>
          
          <button
            onClick={onViewLeaderboard}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;