import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Country } from '../types';

interface CountryMapProps {
  country: Country;
  status: 'playing' | 'checking' | 'success' | 'error';
}

const CountryMap: React.FC<CountryMapProps> = ({ country, status }) => {
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset loading state when country changes
  React.useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    
    // Preload image to check for errors and to allow smooth fade-in
    const img = new Image();
    img.src = `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${country.code.toLowerCase()}/vector.svg`;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
  }, [country]);

  const mapUrl = `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${country.code.toLowerCase()}/vector.svg`;

  return (
    <div className="w-full h-64 md:h-96 flex items-center justify-center p-4 relative">
      
      {/* Loading State */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
           <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {/* Error Fallback */}
      {imageError && (
         <div className="flex flex-col items-center justify-center text-red-400 p-4 text-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-sm">Could not load map image.</p>
         </div>
      )}

      {/* Map Container */}
      <AnimatePresence mode='wait'>
        {imageLoaded && (
            <motion.div
                key={country.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: isSuccess ? 1.05 : 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="relative w-full h-full max-w-[500px] flex items-center justify-center"
            >
                {/* 
                    We use mask-image to render the shape.
                    This allows us to control the fill color/gradient/pattern via CSS background 
                    while keeping the perfect detail of the external SVG.
                */}
                <motion.div
                    className="w-full h-full"
                    style={{
                        maskImage: `url(${mapUrl})`,
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        maskSize: 'contain',
                        WebkitMaskImage: `url(${mapUrl})`,
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        WebkitMaskSize: 'contain',
                    }}
                    animate={{
                        backgroundColor: isSuccess ? '#10b981' : isError ? '#ef4444' : '#6366f1',
                    }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Inner texture/pattern for Success state */}
                    {isSuccess && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-30 mix-blend-overlay"
                        />
                    )}
                </motion.div>

                {/* Glow Effect Layer (Duplicate behind) */}
                <motion.div
                     className="absolute inset-0 -z-10 blur-md opacity-50"
                     style={{
                        maskImage: `url(${mapUrl})`,
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        maskSize: 'contain',
                        WebkitMaskImage: `url(${mapUrl})`,
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        backgroundColor: isSuccess ? '#34d399' : isError ? '#f87171' : '#818cf8',
                    }}
                    animate={{
                        scale: isSuccess ? [1, 1.02, 1] : 1,
                        opacity: isSuccess ? 0.8 : 0.5
                    }}
                    transition={{
                        scale: { repeat: Infinity, duration: 2 },
                        backgroundColor: { duration: 0.5 }
                    }}
                />

            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountryMap;