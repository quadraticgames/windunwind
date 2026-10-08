import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, RotateCcw, AlertTriangle, ArrowUp, ArrowDown, Sparkles, Check, Info, X, BookOpen } from 'lucide-react';
import { playCorrectNote, playWrongNote, initializeAudio } from '../utils/sound';

type Direction = 'up' | 'down';

type StageInfo = {
  id: number;
  name: string;
  subtitle: string;
  realm: 'MIND' | 'BODY' | 'SPIRIT';
  angle: number; // degrees from 12 o'clock clockwise
  concept: string;
  conflict: string;
  objective: string;
};

const STAGES: StageInfo[] = [
  // MIND: 0° to 120° (Stages 1 - 3)
  {
    id: 1,
    name: "The Brahmin’s Cage",
    subtitle: "The Departure",
    realm: "MIND",
    angle: 25,
    concept: "The protagonist begins in a world of perfection, ritual, and intellectual privilege.",
    conflict: "Despite mastering all the texts, Siddhartha feels a profound inner emptiness. He must stand up to his father's traditional expectations to earn the right to leave.",
    objective: "Break away from comfort and cross the threshold into the unknown.",
  },
  {
    id: 2,
    name: "The Samana Trials",
    subtitle: "Asceticism",
    realm: "MIND",
    angle: 65,
    concept: "A stage of extreme denial, survival, and testing the limits of the physical body.",
    conflict: "Siddhartha fasts, breathes minimally, and endures pain to kill the 'Self.' However, he realizes that self-mortification is just a temporary escape, not true enlightenment.",
    objective: "Survive the elements and strip away the ego through intense discipline.",
  },
  {
    id: 3,
    name: "Confronting the Buddha",
    subtitle: "The Rejection of Doctrine",
    realm: "MIND",
    angle: 105,
    concept: "Meeting the ultimate spiritual authority—Gotama, the Buddha.",
    conflict: "Siddhartha recognizes the Buddha's perfection but realizes that wisdom cannot be taught through words or doctrines; it must be experienced firsthand. He leaves his companion Govinda behind to walk alone.",
    objective: "Walk away from ready-made answers and choose a solitary, unguided path.",
  },

  // BODY: 120° to 240° (Stages 4 - 6)
  {
    id: 4,
    name: "The Garden of Kamala",
    subtitle: "The Awakening of Senses",
    realm: "BODY",
    angle: 145,
    concept: "Stepping into the vibrant, beautiful, and tactile material world.",
    conflict: "Siddhartha enters the city and encounters the beautiful courtesan Kamala. To win her love, he must learn the art of desire, trade, and love-making, transitioning from a spirit-focused monk to a creature of the flesh.",
    objective: "Master the arts of the material world, social status, and physical pleasure.",
  },
  {
    id: 5,
    name: "The Gambler’s Trap",
    subtitle: "The Descent into Samsara",
    realm: "BODY",
    angle: 180,
    concept: "The slow decay of the soul through wealth, greed, and addiction.",
    conflict: "Over the years, Siddhartha becomes a wealthy merchant (working with Kamaswami). He falls victim to high-stakes gambling, drinking, and spiritual sloth, completely losing touch with his inner voice.",
    objective: "Navigate a world of luxury while watching your spiritual health bar hit absolute rock bottom.",
  },
  {
    id: 6,
    name: "The River of Rebirth",
    subtitle: "The Dark Night of the Soul",
    realm: "BODY",
    angle: 215,
    concept: "Facing total despair and the death of the old self.",
    conflict: "Disgusted by his bloated, worldly existence, Siddhartha flees to the river to drown himself. At the edge of death, he hears the sacred sound 'Om' from the water, awakening him from his spiritual slumber into a state of pure joy.",
    objective: "Survive a psychological trial of self-hatred and awaken with a clean slate.",
  },

  // SPIRIT: 240° to 360° (Stages 7 - 9)
  {
    id: 7,
    name: "The Ferryman’s Disciple",
    subtitle: "Listening to the River",
    realm: "SPIRIT",
    angle: 255,
    concept: "Learning a completely new form of wisdom based on quiet observation and nature.",
    conflict: "Siddhartha moves in with Vasudeva, a humble ferryman. Instead of reading books, he learns to listen deeply to the river, realizing that time is an illusion and all things exist in a simultaneous, eternal present.",
    objective: "Master the art of listening, patience, and guiding others across the threshold.",
  },
  {
    id: 8,
    name: "The Wound of Love",
    subtitle: "The Ultimate Human Trial",
    realm: "SPIRIT",
    angle: 295,
    concept: "Facing the agonizing pain of human attachment and grief.",
    conflict: "Kamala dies, leaving Siddhartha with their spoiled, rebellious city-born son. Siddhartha tries to force the boy to love the river life, but the son robs them and runs away. Siddhartha must endure the heartbreak of letting him go, fully experiencing human sorrow.",
    objective: "Overcome personal grief and break the cycle of trying to control others.",
  },
  {
    id: 9,
    name: "The Eternal Flow",
    subtitle: "Total Integration",
    realm: "SPIRIT",
    angle: 335,
    concept: "Achieving full enlightenment, peace, and unity with the universe.",
    conflict: "Vasudeva departs into the woods, leaving Siddhartha as the master ferryman. When his old friend Govinda returns, Siddhartha passes on his final realization: everything is sacred, time is a construct, and love is the most important force.",
    objective: "Attain ultimate oneness, bridge the gap for others, and complete the spiritual cycle.",
  },
];

const TOTAL_PUZZLES_TO_ENLIGHTENMENT = 27;

export default function Game() {
  const [puzzleCount, setPuzzleCount] = useState(0);
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Direction[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isTranscendence, setIsTranscendence] = useState(false);
  const [selectedLoreStage, setSelectedLoreStage] = useState<StageInfo | null>(null);

  // Each stage has 3 puzzles (total 27 puzzles)
  // Stage 1 has length 1 (single tone repetition)
  // Stage 2 has length 2, up to Stage 9 with length 9
  const currentStageIndex = Math.min(Math.floor(puzzleCount / 3), 8);
  const currentStage = STAGES[currentStageIndex];
  const puzzleInStage = (puzzleCount % 3) + 1;
  const currentPuzzleLength = currentStageIndex + 1;

  const generateSequenceForPuzzle = useCallback((count: number): Direction[] => {
    const stageIdx = Math.min(Math.floor(count / 3), 8);
    const len = stageIdx + 1;
    return Array(len)
      .fill(null)
      .map(() => (Math.random() > 0.5 ? 'up' : 'down'));
  }, []);

  const showSequence = useCallback(async (seq: Direction[]) => {
    setIsShowingSequence(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      playCorrectNote(seq[i]);
      setFeedback('correct'); 
      setTimeout(() => setFeedback(null), 300);
    }
    setIsShowingSequence(false);
    setPlayerSequence([]);
  }, []);

  const handleInput = useCallback((direction: Direction) => {
    if (!isPlaying || isShowingSequence || gameOver || isTranscendence) return;

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
        }
        return newStrikes;
      });
      setPlayerSequence([]); 
      // Replay current sequence after a short delay so the player can retry
      setTimeout(() => {
        if (strikes + 1 < 3) {
          showSequence(sequence);
        }
      }, 700);
    } else {
      playCorrectNote(direction);
      setFeedback('correct');
      setTimeout(() => setFeedback(null), 300);
      
      const newPlayerSequence = [...playerSequence, direction];
      setPlayerSequence(newPlayerSequence);

      if (newPlayerSequence.length === sequence.length) {
        const nextCount = puzzleCount + 1;
        setPuzzleCount(nextCount);
        setStreak(s => s + 1);

        // Check if player solved all 27 puzzles to reach Enlightenment
        if (nextCount >= TOTAL_PUZZLES_TO_ENLIGHTENMENT) {
          setIsTranscendence(true);
          return;
        }

        setTimeout(() => {
          const nextSeq = generateSequenceForPuzzle(nextCount);
          setSequence(nextSeq);
          showSequence(nextSeq);
        }, 800);
      }
    }
  }, [isPlaying, isShowingSequence, gameOver, isTranscendence, playerSequence, sequence, strikes, puzzleCount, generateSequenceForPuzzle, showSequence]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') handleInput('up');
    if (e.key === 'ArrowDown') handleInput('down');
  }, [handleInput]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = async () => {
    await initializeAudio();
    setIsPlaying(true);
    setGameOver(false);
    setIsTranscendence(false);
    setStrikes(0);
    setStreak(0);
    setPuzzleCount(0);
    setSelectedLoreStage(null);
    const initialSeq = generateSequenceForPuzzle(0);
    setSequence(initialSeq);
    showSequence(initialSeq);
  };

  const continueCycle = () => {
    setIsTranscendence(false);
    const nextSeq = generateSequenceForPuzzle(puzzleCount);
    setSequence(nextSeq);
    showSequence(nextSeq);
  };

  // Node position coordinates around a center of (250, 250) with radius 195
  const stagePositions = useMemo(() => {
    const cx = 250;
    const cy = 250;
    const r = 195;
    return STAGES.map((s) => {
      const rad = (s.angle - 90) * (Math.PI / 180);
      return {
        ...s,
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-aurora flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 select-none">
      <div className="w-full max-w-xl flex flex-col items-center">
        
        {/* Main Glass Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[2.5rem] p-6 sm:p-8 w-full flex flex-col items-center justify-center min-h-[580px] relative overflow-hidden border border-white/10 shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 opacity-70" />

          {!isPlaying ? (
            /* Start / Introduction Screen */
            <div className="flex flex-col items-center space-y-6 text-center max-w-md py-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-teal-400/30 flex items-center justify-center bg-teal-500/10 animate-pulse">
                  <Wind size={48} className="text-teal-400" />
                </div>
                <div className="absolute -inset-2 rounded-full border border-teal-400/20 animate-spin" style={{ animationDuration: '24s' }} />
              </div>

              <div>
                <span className="text-[10px] font-black tracking-[0.25em] text-teal-300 uppercase">
                  Hermann Hesse • Siddhartha
                </span>
                <h1 className="text-4xl sm:text-5xl font-black text-white mt-1 mb-2 tracking-tight neon-text">
                  Wind & Unwind
                </h1>
                <p className="text-teal-100/75 text-sm leading-relaxed mb-3">
                  Traverse the 9 stages across <strong className="text-teal-200">Mind</strong>, <strong className="text-teal-200">Body</strong>, and <strong className="text-teal-200">Spirit</strong>. Solve 3 tone puzzles at each stage—27 puzzles in total—to attain Enlightenment.
                </p>
                <div className="text-[11px] text-teal-300/60 font-semibold italic">
                  Stage 1 begins with single-tone repetition; each subsequent stage deepens the melody.
                </div>
              </div>

              <div className="w-full pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startGame}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 via-indigo-600 to-violet-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 cursor-pointer group transition-all"
                >
                  <Play size={20} className="group-hover:translate-x-0.5 transition-transform" />
                  <span className="tracking-wide">Begin The Journey</span>
                </motion.button>
              </div>
            </div>
          ) : (
            /* Active Game Loop with Thematic Circular UI */
            <div className="w-full flex flex-col items-center">
              
              {/* Header HUD: Streak, Total Puzzles, Info Button, and Strikes */}
              <div className="w-full flex justify-between items-center px-2 mb-1">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-teal-300/60 font-black">Current Streak</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-3xl font-black text-white">{streak}</span>
                    <span className="text-xs text-teal-300/50 font-bold">({puzzleCount}/27 Puzzles)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLoreStage(currentStage)}
                    title="View Stage Lore & Conflict"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-teal-300/70 hover:text-teal-200 transition-all border border-white/10 cursor-pointer active:scale-95 flex items-center space-x-1"
                  >
                    <BookOpen size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider pr-1">Lore</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    {Array(3).fill(null).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          scale: i < strikes ? [1, 1.25, 1] : 1,
                          backgroundColor: i < strikes ? '#ef4444' : 'rgba(255,255,255,0.08)'
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/5"
                      >
                        {i < strikes && <AlertTriangle size={13} className="text-white" />}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* The Thematic Hero's Journey Circle */}
              <div className="relative w-full max-w-[400px] sm:max-w-[430px] aspect-square my-2 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 500 500">
                  <defs>
                    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(45, 212, 191, 0.15)" />
                      <stop offset="100%" stopColor="rgba(45, 212, 191, 0)" />
                    </radialGradient>
                  </defs>

                  {/* Soft Background Circle Glow */}
                  <circle cx="250" cy="250" r="195" fill="url(#centerGlow)" />

                  {/* Main Circular Track (The Watercolor Ring) */}
                  <circle
                    cx="250"
                    cy="250"
                    r="195"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="20"
                    strokeOpacity="0.18"
                  />

                  {/* Sector Dividers (Mind at 0°-120°, Body at 120°-240°, Spirit at 240°-360°) */}
                  <line x1="250" y1="160" x2="250" y2="65" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line 
                    x1={250 + 90 * Math.cos(30 * Math.PI / 180)} 
                    y1={250 + 90 * Math.sin(30 * Math.PI / 180)} 
                    x2={250 + 195 * Math.cos(30 * Math.PI / 180)} 
                    y2={250 + 195 * Math.sin(30 * Math.PI / 180)} 
                    stroke="rgba(255,255,255,0.15)" 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3" 
                  />
                  <line 
                    x1={250 - 90 * Math.cos(30 * Math.PI / 180)} 
                    y1={250 + 90 * Math.sin(30 * Math.PI / 180)} 
                    x2={250 - 195 * Math.cos(30 * Math.PI / 180)} 
                    y2={250 + 195 * Math.sin(30 * Math.PI / 180)} 
                    stroke="rgba(255,255,255,0.15)" 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3" 
                  />

                  {/* Sector Realm Watermarks */}
                  <text x="310" y="195" fill="rgba(153, 246, 228, 0.28)" fontSize="11" fontWeight="900" letterSpacing="0.25em" textAnchor="middle">MIND</text>
                  <text x="250" y="315" fill="rgba(153, 246, 228, 0.28)" fontSize="11" fontWeight="900" letterSpacing="0.25em" textAnchor="middle">BODY</text>
                  <text x="190" y="195" fill="rgba(153, 246, 228, 0.28)" fontSize="11" fontWeight="900" letterSpacing="0.25em" textAnchor="middle">SPIRIT</text>

                  {/* 9 Stage Nodes Around the Circle */}
                  {stagePositions.map((node, i) => {
                    const isPassed = i < currentStageIndex;
                    const isActive = i === currentStageIndex;

                    return (
                      <g 
                        key={node.id} 
                        className="transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedLoreStage(node)}
                      >
                        {/* Outer Glow Ring for Active Node */}
                        {isActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="25"
                            fill="none"
                            stroke="#2dd4bf"
                            strokeWidth="2.5"
                            strokeDasharray="4 4"
                            className="animate-spin"
                            style={{ animationDuration: '8s' }}
                          />
                        )}

                        {/* Node Circle */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="17"
                          fill={isPassed ? "#0d9488" : isActive ? "#14b8a6" : "rgba(15, 23, 42, 0.85)"}
                          stroke={isActive ? "#5eead4" : isPassed ? "#2dd4bf" : "rgba(45, 212, 191, 0.25)"}
                          strokeWidth={isActive ? "2.5" : "1.5"}
                        />

                        {/* Node Content: Checkmark or Number */}
                        {isPassed ? (
                          <Check
                            x={node.x - 7}
                            y={node.y - 7}
                            size={14}
                            className="text-white"
                          />
                        ) : (
                          <text
                            x={node.x}
                            y={node.y + 4.5}
                            fill={isActive ? "#ffffff" : "rgba(204, 251, 241, 0.5)"}
                            fontSize="11"
                            fontWeight="900"
                            textAnchor="middle"
                          >
                            {node.id}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Central UI Hub inside the Circle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6">
                  
                  {/* Current Active Stage Text */}
                  <div 
                    className="text-center mb-1 pointer-events-auto cursor-pointer group"
                    onClick={() => setSelectedLoreStage(currentStage)}
                    title="Click to view stage details"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300/80 group-hover:text-teal-200 transition-colors">
                      {currentStage.realm} • Stage {currentStage.id} of 9
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight group-hover:text-teal-100 transition-colors">
                      {currentStage.name}
                    </h3>
                    <span className="text-[11px] text-teal-200/60 font-semibold italic">
                      ({currentStage.subtitle})
                    </span>
                  </div>

                  {/* 3 Puzzle Progress Pips for Current Stage */}
                  <div className="flex space-x-1.5 my-1">
                    {[1, 2, 3].map((p) => {
                      const completed = p < puzzleInStage;
                      const current = p === puzzleInStage;
                      return (
                        <div
                          key={p}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            completed 
                              ? 'bg-teal-400' 
                              : current 
                              ? 'bg-teal-300 ring-2 ring-teal-400/50 scale-125' 
                              : 'bg-white/20'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Central Wind Animation */}
                  <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 my-1">
                    <AnimatePresence>
                      {feedback === 'correct' && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.5, opacity: 0.2 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-teal-400 rounded-full"
                        />
                      )}
                    </AnimatePresence>

                    <motion.div
                      animate={{
                        rotate: feedback === 'correct' ? [0, 45, 0] : 0,
                        x: feedback === 'wrong' ? [-8, 8, -8, 8, 0] : 0,
                      }}
                      className={`p-4 sm:p-5 glass rounded-full border transition-all duration-300 ${
                        feedback === 'wrong' ? 'border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
                        feedback === 'correct' ? 'border-teal-400/60 shadow-[0_0_20px_rgba(45,212,191,0.3)]' : 'border-white/10'
                      }`}
                    >
                      <Wind 
                        size={42}
                        className={`${
                          isShowingSequence ? 'text-teal-400' :
                          gameOver ? 'text-red-400' : 'text-emerald-400'
                        } drop-shadow-[0_0_12px_rgba(45,212,191,0.5)] transition-colors`}
                      />
                    </motion.div>
                  </div>

                  {/* Sequence Phase Status Badge */}
                  <div className="h-6 flex items-center justify-center mt-1">
                    <AnimatePresence mode="wait">
                      {isShowingSequence ? (
                        <motion.div 
                          key="listening"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="font-bold text-teal-300 tracking-wider uppercase text-[10px] bg-teal-500/15 px-3 py-0.5 rounded-full border border-teal-500/30"
                        >
                          Listen closely!
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="puzzle-info"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-[10px] font-bold tracking-wider text-teal-200/60 uppercase"
                        >
                          Puzzle {puzzleInStage} of 3 • {currentPuzzleLength} {currentPuzzleLength === 1 ? 'Tone' : 'Tones'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>

              {/* Tone Input Buttons */}
              <div className="flex space-x-5 mt-2">
                <button
                  type="button"
                  onClick={() => handleInput('up')}
                  disabled={isShowingSequence}
                  className={`p-3.5 glass rounded-2xl flex flex-col items-center w-28 transition-all ${
                    isShowingSequence 
                      ? 'opacity-20 cursor-not-allowed' 
                      : 'opacity-100 hover:bg-white/10 border-teal-500/30 cursor-pointer active:scale-95'
                  }`}
                >
                  <span className="text-teal-300/60 text-[9px] uppercase font-black mb-1 tracking-tight text-center whitespace-nowrap">Higher Tone</span>
                  <div className="w-9 h-9 flex items-center justify-center bg-teal-500/20 rounded-xl text-teal-300">
                    <ArrowUp size={22} />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInput('down')}
                  disabled={isShowingSequence}
                  className={`p-3.5 glass rounded-2xl flex flex-col items-center w-28 transition-all ${
                    isShowingSequence 
                      ? 'opacity-20 cursor-not-allowed' 
                      : 'opacity-100 hover:bg-white/10 border-teal-500/30 cursor-pointer active:scale-95'
                  }`}
                >
                  <span className="text-teal-300/60 text-[9px] uppercase font-black mb-1 tracking-tight text-center whitespace-nowrap">Lower Tone</span>
                  <div className="w-9 h-9 flex items-center justify-center bg-teal-500/20 rounded-xl text-teal-300">
                    <ArrowDown size={22} />
                  </div>
                </button>
              </div>

            </div>
          )}

          {/* Lore Detail Modal */}
          <AnimatePresence>
            {selectedLoreStage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-left"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  className="glass rounded-3xl p-6 sm:p-8 max-w-md w-full border border-teal-500/30 relative"
                >
                  <button
                    onClick={() => setSelectedLoreStage(null)}
                    className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-teal-300/60 hover:text-white transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>

                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-300 mb-1">
                    {selectedLoreStage.realm} • Stage {selectedLoreStage.id} of 9
                  </div>
                  <h3 className="text-2xl font-black text-white mb-0.5">
                    {selectedLoreStage.name}
                  </h3>
                  <div className="text-xs text-teal-200/60 font-semibold italic mb-5">
                    ({selectedLoreStage.subtitle})
                  </div>

                  <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                    <div>
                      <strong className="text-teal-300 uppercase tracking-wider text-[10px] block mb-1">The Concept</strong>
                      <p>{selectedLoreStage.concept}</p>
                    </div>
                    <div>
                      <strong className="text-amber-300 uppercase tracking-wider text-[10px] block mb-1">The Conflict</strong>
                      <p>{selectedLoreStage.conflict}</p>
                    </div>
                    <div>
                      <strong className="text-emerald-300 uppercase tracking-wider text-[10px] block mb-1">Game Objective</strong>
                      <p className="text-emerald-100 font-medium">{selectedLoreStage.objective}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLoreStage(null)}
                    className="mt-6 w-full py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-200 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Continue Journey
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Modal */}
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
                  transition={{ delay: 0.15 }}
                >
                  <div className="bg-red-500/20 p-5 rounded-3xl mb-4 inline-block border border-red-500/30">
                    <RotateCcw size={42} className="text-red-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2 neon-text">Memory Faded</h2>
                  <p className="text-slate-300 mb-1 max-w-xs text-sm">
                    The rhythm was lost at Stage {currentStage.id}: <strong className="text-teal-300">{currentStage.name}</strong>
                  </p>
                  <p className="text-slate-400 mb-3 max-w-xs text-xs italic">
                    "{currentStage.conflict}"
                  </p>
                  <p className="text-slate-500 text-xs mb-6">
                    Puzzles solved: <span className="text-white font-bold">{puzzleCount} / 27</span> • Peak streak: <span className="text-white font-bold">{streak}</span>
                  </p>
                  <button
                    onClick={startGame}
                    className="px-10 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-teal-500/25 active:scale-95 cursor-pointer"
                  >
                    Begin Again
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcendence Achieved Modal (All 27 Puzzles Completed) */}
          <AnimatePresence>
            {isTranscendence && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="bg-teal-500/20 p-5 rounded-3xl mb-4 inline-block border border-teal-500/40">
                    <Sparkles size={44} className="text-teal-300 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black tracking-[0.25em] text-teal-300 uppercase">
                    Stage 9 • The Eternal Flow
                  </span>
                  <h2 className="text-3xl font-black text-white mt-1 mb-2 neon-text">
                    Total Integration Achieved
                  </h2>
                  <p className="text-teal-100/80 mb-2 max-w-xs text-sm leading-relaxed">
                    You solved all 27 puzzles across Mind, Body, and Spirit, attaining ultimate oneness.
                  </p>
                  <p className="text-teal-200/60 mb-6 max-w-xs text-xs italic">
                    "Everything is sacred, time is a construct, and love is the most important force."
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
                    <button
                      onClick={continueCycle}
                      className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:opacity-90 transition-all active:scale-95 cursor-pointer text-sm"
                    >
                      Ascend to Cycle 2
                    </button>
                    <button
                      onClick={startGame}
                      className="px-8 py-3.5 bg-white/10 text-white hover:bg-white/15 rounded-2xl font-bold transition-all border border-white/10 active:scale-95 cursor-pointer text-sm"
                    >
                      Begin Again
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}