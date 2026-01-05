import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Loader2, History, Heart, HeartCrack, SkipForward, LogOut, Infinity } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Country, GuessHistoryItem } from '../types';
import { COUNTRIES } from '../constants';
import { checkAnswerWithAI } from '../services/geminiService';
import CountryMap from './CountryMap';
import HintBox from './HintBox';

interface GameProps {
  aiEnabled: boolean;
  useLives: boolean;
  onGameOver: (score: number) => void;
  onWin: (score: number) => void;
}

const MAX_LIVES = 3;

const Game: React.FC<GameProps> = ({ aiEnabled, useLives, onGameOver, onWin }) => {
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [totalRounds, setTotalRounds] = useState(0);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState<'playing' | 'checking' | 'success' | 'error' | 'skipped'>('playing');
  const [history, setHistory] = useState<GuessHistoryItem[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize pool with all countries
  useEffect(() => {
    const pool = [...COUNTRIES];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setAvailableCountries(shuffled);
    setTotalRounds(shuffled.length);
    pickNewCountry(shuffled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global Keydown listener for instant typing
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // If status is not playing, ignore
          if (status !== 'playing') return;

          // If modifier keys are pressed, ignore
          if (e.ctrlKey || e.altKey || e.metaKey) return;
          
          // If active element is already the input, ignore
          if (document.activeElement === inputRef.current) return;

          // If key is a single letter or number, focus and allow event to propagate (so the char is typed)
          if (/^[a-zA-Z0-9]$/.test(e.key)) {
              inputRef.current?.focus();
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // Initial Auto-focus
  useEffect(() => {
    if (status === 'playing') {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    }
  }, [status]);

  const playSound = (type: 'success' | 'error') => {
    const audio = new Audio(
        type === 'success' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' 
        : 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'
    );
    audio.volume = 0.4;
    audio.play().catch(e => console.warn("Audio play failed", e));
  };

  const pickNewCountry = (pool: Country[]) => {
    if (pool.length === 0) {
      onWin(score);
      return;
    }
    const selected = pool[pool.length - 1];
    setCurrentCountry(selected);
  };

  const advanceRound = () => {
      setAvailableCountries(prev => {
          const next = prev.slice(0, -1);
          if (next.length === 0) {
              setTimeout(() => onWin(score + (status === 'success' ? 1 : 0)), 500);
          } else {
              pickNewCountry(next);
          }
          return next;
      });
      setStatus('playing');
      setGuess('');
  };

  const handleSuccess = (userGuess: string) => {
    setStatus('success');
    setScore(s => s + 1);
    playSound('success');
    
    setHistory(prev => [{
        countryName: currentCountry!.name,
        userGuess: userGuess,
        correct: true
    }, ...prev]);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#34d399', '#10b981', '#059669']
    });
    
    // Auto-advance after delay
    setTimeout(() => {
        advanceRound();
    }, 2000);
  };

  const handleFailure = (userGuess: string, isSkip: boolean = false) => {
    setStatus(isSkip ? 'skipped' : 'error');
    if (!isSkip) playSound('error');
    
    setHistory(prev => [{
        countryName: currentCountry!.name,
        userGuess: userGuess,
        correct: false
    }, ...prev]);

    if (useLives) {
        // SURVIVAL MODE LOGIC
        const newLives = lives - 1;
        setLives(newLives);

        if (newLives === 0) {
            setTimeout(() => {
                onGameOver(score);
            }, 2500);
            return;
        }
    } 
    
    // Fallthrough for Freeplay or Survial with lives remaining
    setTimeout(() => {
        advanceRound();
    }, 2500);
  };

  const handleSkip = () => {
      if (status !== 'playing') return;
      handleFailure('Skipped', true);
  };

  const handleEndGame = () => {
      onGameOver(score);
  };

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCountry || !guess.trim() || status !== 'playing') return;

    const userGuess = guess.trim();
    const normalizedGuess = userGuess.toLowerCase();
    const normalizedName = currentCountry.name.toLowerCase();

    if (normalizedGuess === normalizedName) {
      handleSuccess(userGuess);
      return;
    }

    setStatus('checking');
    try {
        const isCorrect = await checkAnswerWithAI(userGuess, currentCountry.name);
        if (isCorrect) {
            handleSuccess(userGuess);
        } else {
            handleFailure(userGuess);
        }
    } catch (error) {
        console.error("Verification failed", error);
        handleFailure(userGuess);
    }
  };

  if (!currentCountry) return null;

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-start min-h-screen p-6 pb-24">
      
      {/* End Game Button (Top Right) */}
      <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={handleEndGame}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-red-900/50 text-slate-300 hover:text-red-200 rounded-full transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-slate-700 hover:border-red-800"
          >
              <LogOut className="w-4 h-4" />
              End Game
          </button>
      </div>

      {/* Header Stats */}
      <div className="flex w-full justify-between items-center text-sm font-medium text-slate-400 mb-8 max-w-lg mt-8 md:mt-0">
        <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-slate-500">Progress</span>
            <span className="text-white font-bold">{totalRounds - availableCountries.length + 1} / {totalRounds}</span>
        </div>

        {/* Lives Indicator */}
        <div className="flex gap-1">
            {useLives ? (
                [...Array(MAX_LIVES)].map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={i < lives ? { scale: 1 } : { scale: 0.8, opacity: 0.3 }}
                    >
                        {i < lives ? (
                            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                        ) : (
                            <HeartCrack className="w-6 h-6 text-slate-700" />
                        )}
                    </motion.div>
                ))
            ) : (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-900/50">
                    <Infinity className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase">Freeplay</span>
                </div>
            )}
        </div>

        <div className="bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-sm flex items-center gap-2">
            Score: 
            <motion.span 
              key={score}
              initial={{ scale: 1.5, color: '#34d399' }} 
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-white font-bold text-lg"
            >
              {score}
            </motion.span>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-8 mb-12">
        <div className="relative w-full max-w-lg">
             {/* Map Container */}
             <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-8 backdrop-blur-sm shadow-xl relative overflow-hidden min-h-[300px] flex items-center justify-center">
                 <CountryMap 
                    country={currentCountry} 
                    status={status === 'skipped' ? 'error' : status}
                 />
             </div>
             
             {/* Status Feedback Overlay */}
             {status !== 'playing' && status !== 'checking' && (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                 >
                     <div className={`
                        flex flex-col items-center p-6 text-center rounded-3xl backdrop-blur-md shadow-2xl pointer-events-auto
                        ${status === 'success' ? 'bg-slate-900/90' : 'bg-slate-950/95'}
                     `}>
                         {status === 'success' ? (
                             <>
                                <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-500" />
                                <span className="text-3xl font-bold mb-2 text-emerald-400">Correct!</span>
                                <span className="text-emerald-200 text-xl">{currentCountry.name}</span>
                             </>
                         ) : status === 'skipped' ? (
                             <>
                                 <SkipForward className="w-16 h-16 mb-4 text-yellow-500" />
                                 <span className="text-3xl font-bold mb-2 text-yellow-400">Skipped</span>
                                 <span className="text-slate-300 text-lg mb-4">It was <span className="text-white font-bold">{currentCountry.name}</span></span>
                                 {useLives && lives === 0 ? (
                                    <span className="text-red-500 font-black uppercase tracking-widest animate-pulse">Game Over</span>
                                 ) : (
                                    <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Next round...</span>
                                 )}
                             </>
                         ) : (
                             <>
                                 <XCircle className="w-16 h-16 mb-4 text-red-500" />
                                 <span className="text-3xl font-bold mb-2 text-red-400">Wrong!</span>
                                 <span className="text-slate-300 text-lg mb-4">It was <span className="text-white font-bold">{currentCountry.name}</span></span>
                                 {useLives && lives === 0 ? (
                                     <span className="text-red-500 font-black uppercase tracking-widest animate-pulse">Game Over</span>
                                 ) : (
                                     <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">Next round...</span>
                                 )}
                             </>
                         )}
                     </div>
                 </motion.div>
             )}
        </div>

        {/* Input Area */}
        <div className="w-full max-w-md flex flex-col gap-3">
            <form onSubmit={handleGuess} className="w-full relative z-20">
            <input
                ref={inputRef}
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                disabled={status !== 'playing'}
                placeholder="Type country name..."
                className={`
                    w-full bg-slate-900 border-2 rounded-2xl px-6 py-4 text-lg text-center font-bold text-white placeholder-slate-600 outline-none transition-all shadow-lg
                    ${status === 'error' ? 'border-red-500 bg-red-500/10' : 
                    status === 'success' ? 'border-emerald-500 bg-emerald-500/10' : 
                    status === 'skipped' ? 'border-yellow-500 bg-yellow-500/10' :
                    status === 'checking' ? 'border-indigo-500 bg-indigo-500/10 animate-pulse' :
                    'border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'}
                `}
            />
            <button 
                type="submit"
                disabled={!guess.trim() || status !== 'playing'}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-800 hover:bg-indigo-600 disabled:opacity-0 disabled:pointer-events-none rounded-xl flex items-center justify-center transition-all text-white"
            >
                {status === 'checking' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                ) : (
                    <ArrowRight className="w-5 h-5" />
                )}
            </button>
            </form>

            <button 
                onClick={handleSkip}
                disabled={status !== 'playing'}
                className="self-center flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-0"
            >
                <SkipForward className="w-4 h-4" />
                {useLives ? 'Skip this country (-1 Life)' : 'Skip this country'}
            </button>
        </div>
      </div>

      {/* History List */}
      {history.length > 0 && (
          <div className="w-full max-w-lg mt-4 border-t border-slate-800 pt-6">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4">
                  <History className="w-4 h-4" />
                  Guess History
              </div>
              <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                      {history.map((item, idx) => (
                          <motion.div
                             key={`${item.countryName}-${idx}`} // Unique key for animation
                             layout
                             initial={{ opacity: 0, x: -20, scale: 0.95 }}
                             animate={{ opacity: 1, x: 0, scale: 1 }}
                             className={`flex items-center justify-between p-3 rounded-xl border ${
                                 item.correct 
                                 ? 'bg-emerald-950/30 border-emerald-900/50' 
                                 : 'bg-slate-900/50 border-slate-800'
                             }`}
                          >
                              <div className="flex items-center gap-3">
                                  {item.correct ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                  ) : (
                                      <XCircle className="w-5 h-5 text-red-500" />
                                  )}
                                  <div className="flex flex-col">
                                      <span className="text-white font-medium">{item.countryName}</span>
                                      {!item.correct && (
                                          <span className="text-xs text-slate-400">
                                            {item.userGuess === 'Skipped' ? 'Skipped' : `You guessed: ${item.userGuess}`}
                                          </span>
                                      )}
                                  </div>
                              </div>
                          </motion.div>
                      ))}
                  </AnimatePresence>
              </div>
          </div>
      )}

      {/* AI Hint Integration */}
      <HintBox 
        countryName={currentCountry.name}
        enabled={aiEnabled && status === 'playing'} 
      />
    </div>
  );
};

export default Game;