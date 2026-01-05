import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Loader2 } from 'lucide-react';
import { getCountryHint } from '../services/geminiService';
import { HintResponse } from '../types';

interface HintBoxProps {
  countryName: string;
  enabled: boolean;
}

const HintBox: React.FC<HintBoxProps> = ({ countryName, enabled }) => {
  const [hint, setHint] = useState<HintResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
        setHint(null);
        return;
    }

    let isMounted = true;
    
    const fetchHint = async () => {
      setLoading(true);
      setHint(null);
      setVisible(false);
      
      try {
        const data = await getCountryHint(countryName);
        if (isMounted) {
          setHint(data);
          setVisible(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHint();

    return () => {
      isMounted = false;
    };
  }, [countryName, enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs md:max-w-sm w-full">
      <AnimatePresence mode='wait'>
        {loading ? (
           <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-indigo-300"
           >
             <Loader2 className="w-5 h-5 animate-spin" />
             <span className="text-sm font-medium">Gemini is thinking...</span>
           </motion.div>
        ) : hint && visible ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-slate-900/90 backdrop-blur-md border border-indigo-500/50 p-4 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.2)]"
          >
            <div className="flex items-start gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Gemini Hint</h4>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {hint.text}
                </p>
                {hint.mapLink && (
                  <a 
                    href={hint.mapLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-1"
                  >
                    <MapPin className="w-3 h-3" />
                    Verified: {hint.placeName || "View on Maps"}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default HintBox;