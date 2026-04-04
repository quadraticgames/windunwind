import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Trophy, Play, RotateCcw, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { playCorrectNote, playWrongNote, initializeAudio } from '../utils/sound';
import { saveScore } from '../utils/supabase';
import Leaderboard from './Leaderboard';

type Direction = 'up' | 'down';

export default function Game() {
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Direction[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const generateSequence = useCallback((currentStreak: number) => {
    const len = Math.min(currentStreak + 3, 12);
    const newSequence = Array(len)
      .fill(null)
      .map(() => (Math.random() > 0.5 ? 'up' : 'down'));
    setSequence(newSequence);
    return newSequence;
  }, []);

  const showSequence = useCallback(async (seq: Direction[]) => {
    setIsShowingSequence(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      playCorrectNote(seq[i]);
      setFeedback(seq[i] === 'up' ? 'correct' : 'correct'); 
      setTimeout(() => setFeedback(null), 300);
    }
    setIsShowingSequence(false);
    setPlayerSequence([]);
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying || isShowingSequence || gameOver) return;

    let direction: Direction | null = null;
    if (e.key === 'ArrowUp') direction = 'up';
    if (e.key === 'ArrowDown') direction = 'down';

    if (!direction) return;

    const nextIndex = playerSequence.length;
    const isCorrect = sequence[nextIndex] === direction;

    if (!isCorrect) {
      playWrongNote();
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 400);
      setStrikes(s => {
        const newStrikes = s + 1;
        if (newStrikes >= 3) {
          setGameOver(true);
          saveScore(username, streak).catch(() => {
            const mockScores = JSON.parse(localStorage.getItem('mockScores') || '[]');
            mockScores.push({ username, streak, created_at: new Date().toISOString() });
            localStorage.setItem('mockScores', JSON.stringify(mockScores));
          });
          setRefreshKey(prev => prev + 1);
        }
        return newStrikes;
      });
      setPlayerSequence([]); 
    } else {
      playCorrectNote(direction);
      setFeedback('correct');
      setTimeout(() => setFeedback(null), 300);
      
      const newPlayerSequence = [...playerSequence, direction];
      setPlayerSequence(newPlayerSequence);

      if (newPlayerSequence.length === sequence.length) {
        setStreak(s => s + 1);
        setTimeout(() => {
          const nextSequence = generateSequence(streak + 1);
          showSequence(nextSequence);
        }, 800);
      }
    }
  }, [isPlaying, isShowingSequence, gameOver, sequence, streak, username, generateSequence, showSequence, playerSequence]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = async () => {
    if (!username.trim()) return;
    await initializeAudio();
    setIsPlaying(true);
    setGameOver(false);
    setStrikes(0);
    setStreak(0);
    const initialSequence = generateSequence(0);
    showSequence(initialSequence);
  };

  return (
    <div className="min-h-screen bg-aurora flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />

            {!isPlaying ? (
              <div className="flex flex-col items-center space-y-8 text-center">
                <div className="p-4 bg-indigo-500/20 rounded-2xl">
                  <Wind size={64} className="text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-2 tracking-tight neon-text">
                    Wind & Unwind
                  </h1>
                  <p className="text-indigo-200/70 text-lg max-w-sm">
                    An audiovisual memory challenge. Repeat the sequence to discover the rhythm.
                  </p>
                </div>

                <div className="w-full max-w-xs space-y-4">
                  <input
                    type="text"
                    placeholder="Wanderer name..."
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-indigo-300/30 transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startGame}
                    disabled={!username.trim()}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                  >
                    <Play size={20} className="group-hover:translate-x-0.5 transition-transform" />
                    <span>Begin Journey</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-between h-full w-full space-y-12">
                
                <div className="flex justify-between w-full px-4 items-center">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-indigo-300/50 font-bold">Current Streak</span>
                    <span className="text-4xl font-black text-white">{streak}</span>
                  </div>
                  
                  <div className="flex space-x-3">
                    {Array(3).fill(null).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: i < strikes ? [1, 1.2, 1] : 1,
                          backgroundColor: i < strikes ? '#ef4444' : 'rgba(255,255,255,0.1)'
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                      >
                        {i < strikes && <AlertTriangle size={14} className="text-white" />}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center justify-center w-64 h-64">
                  <AnimatePresence>
                    {feedback === 'correct' && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-indigo-500 rounded-full"
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={{
                      rotate: feedback === 'correct' ? [0, 45, 0] : 0,
                      x: feedback === 'wrong' ? [-10, 10, -10, 10, 0] : 0,
                    }}
                    className={`relative z-10 p-12 glass rounded-full border border-white/10 transition-colors duration-300 ${
                      feedback === 'wrong' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 
                      feedback === 'correct' ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''
                    }`}
                  >
                    <Wind 
                      size={120}
                      className={`${
                        isShowingSequence ? 'text-indigo-400' :
                        gameOver ? 'text-red-400' : 'text-emerald-400'
                      } drop-shadow-[0_0_15px_rgba(129,140,248,0.5)] transition-colors`}
                    />
                  </motion.div>

                  <AnimatePresence>
                    {isShowingSequence && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-16 font-bold text-indigo-300 tracking-widest uppercase text-[10px] bg-indigo-500/10 px-4 py-1 rounded-full border border-indigo-500/20"
                      >
                        Memorizing Sequence...
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex space-x-6">
                  <div className={`p-4 glass rounded-[2rem] flex flex-col items-center w-28 transition-all ${isShowingSequence ? 'opacity-20' : 'opacity-100 hover:bg-white/10 border-indigo-500/20'}`}>
                    <span className="text-indigo-300/40 text-[9px] uppercase font-black mb-2 tracking-tighter">Command</span>
                    <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/20 rounded-xl text-indigo-400">
                      <ArrowUp size={24} />
                    </div>
                  </div>
                  <div className={`p-4 glass rounded-[2rem] flex flex-col items-center w-28 transition-all ${isShowingSequence ? 'opacity-20' : 'opacity-100 hover:bg-white/10 border-indigo-500/20'}`}>
                    <span className="text-indigo-300/40 text-[9px] uppercase font-black mb-2 tracking-tighter">Command</span>
                    <div className="w-10 h-10 flex items-center justify-center bg-indigo-500/20 rounded-xl text-indigo-400">
                      <ArrowDown size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {gameOver && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="bg-red-500/20 p-6 rounded-3xl mb-6 inline-block">
                      <RotateCcw size={48} className="text-red-400" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2 neon-text">Memory Faded</h2>
                    <p className="text-slate-400 mb-8 max-w-xs">The rhythm was lost. You achieved a peak streak of <span className="text-white font-black text-2xl">{streak}</span></p>
                    <button
                      onClick={startGame}
                      className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                      Begin Again
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <div className="glass rounded-3xl p-8 h-full flex flex-col border border-white/5">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Trophy size={20} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Leaderboard</h3>
              </div>
              <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Global</div>
            </div>
            
            <Leaderboard refreshKey={refreshKey} />
          </div>
        </div>

      </div>
    </div>
  );
}