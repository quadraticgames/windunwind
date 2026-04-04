import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Clock } from 'lucide-react';
import { getTopScores, supabase } from '../utils/supabase';

type Score = {
  username: string;
  streak: number;
  created_at: string;
};

export default function Leaderboard({ refreshKey }: { refreshKey: number }) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    try {
      const topScores = await getTopScores();
      if (topScores && topScores.length > 0) {
        setScores(topScores);
      } else {
        // Fallback to local storage for "mock" data if Supabase isn't configured
        const mockScores = JSON.parse(localStorage.getItem('mockScores') || '[]');
        const sortedMock = mockScores.sort((a: any, b: any) => b.streak - a.streak).slice(0, 10);
        setScores(sortedMock);
      }
    } catch (e) {
      const mockScores = JSON.parse(localStorage.getItem('mockScores') || '[]');
      const sortedMock = mockScores.sort((a: any, b: any) => b.streak - a.streak).slice(0, 10);
      setScores(sortedMock);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();

    // Subscribe to realtime updates if supabase is available
    let subscription: any;
    if (supabase) {
      try {
        subscription = supabase
          .channel('leaderboard_changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'leaderboard' 
          }, () => {
            fetchScores();
          })
          .subscribe();
      } catch (e) {
        console.warn('Postgres realization failed (likely due to invalid credentials)');
      }
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [refreshKey]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4 py-20"
          >
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest font-black text-indigo-300 opacity-50">Synchronizing...</span>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {scores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Star size={32} className="text-white/5 mb-4" />
                <p className="text-indigo-200/20 text-sm font-bold uppercase tracking-widest">No Legends Yet</p>
              </div>
            ) : (
              scores.map((score, index) => (
                <motion.div 
                  key={`${score.username}-${score.created_at}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    index === 0 ? 'bg-amber-500/10 border-amber-500/20' : 
                    index === 1 ? 'bg-slate-400/10 border-slate-400/20' :
                    index === 2 ? 'bg-orange-600/10 border-orange-600/20' : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs ${
                      index === 0 ? 'bg-amber-400 text-amber-950' : 
                      index === 1 ? 'bg-slate-300 text-slate-800' :
                      index === 2 ? 'bg-orange-500 text-orange-950' : 'text-indigo-300/40 border border-white/10'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white group-hover:text-amber-100 transition-colors">{score.username}</span>
                      <div className="flex items-center text-[10px] text-indigo-300/30 uppercase font-bold tracking-tighter">
                        <Clock size={10} className="mr-1" />
                        {new Date(score.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xl font-black ${
                       index === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-indigo-100'
                    }`}>{score.streak}</span>
                    <span className="text-[10px] text-indigo-300/30 font-bold uppercase">Streak</span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-auto pt-8 flex items-center justify-center">
        <p className="text-[9px] font-black text-indigo-300/20 uppercase tracking-[0.3em]">Temporal Memories</p>
      </div>
    </div>
  );
}