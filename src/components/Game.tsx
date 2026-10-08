import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Sparkles, Check, X, BookOpen } from 'lucide-react';
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
  // MIND: Stages 1 - 3
  {
    id: 1,
    name: "The Brahmin’s Cage",
    subtitle: "The Departure",
    realm: "MIND",
    angle: 35,
    concept: "The protagonist begins in a world of perfection, ritual, and intellectual privilege.",
    conflict: "Despite mastering all the texts, Siddhartha feels a profound inner emptiness. He must stand up to his father's traditional expectations to earn the right to leave.",
    objective: "Break away from comfort and cross the threshold into the unknown.",
  },
  {
    id: 2,
    name: "The Samana Trials",
    subtitle: "Asceticism",
    realm: "MIND",
    angle: 75,
    concept: "A stage of extreme denial, survival, and testing the limits of the physical body.",
    conflict: "Siddhartha fasts, breathes minimally, and endures pain to kill the 'Self.' However, he realizes that self-mortification is just a temporary escape, not true enlightenment.",
    objective: "Survive the elements and strip away the ego through intense discipline.",
  },
  {
    id: 3,
    name: "Confronting the Buddha",
    subtitle: "The Rejection of Doctrine",
    realm: "MIND",
    angle: 110,
    concept: "Meeting the ultimate spiritual authority—Gotama, the Buddha.",
    conflict: "Siddhartha recognizes the Buddha's perfection but realizes that wisdom cannot be taught through words or doctrines; it must be experienced firsthand. He leaves his companion Govinda behind to walk alone.",
    objective: "Walk away from ready-made answers and choose a solitary, unguided path.",
  },

  // BODY: Stages 4 - 6
  {
    id: 4,
    name: "The Garden of Kamala",
    subtitle: "The Awakening of Senses",
    realm: "BODY",
    angle: 145,
    concept: "Stepping into the vibrant, beautiful, and tactile material world.",
    conflict: "Siddhartha enters the city and encounters the beautiful courtesan Kamala. To win her love, he must learn the art of desire, trade, and love-making, transitioning from a monk to a creature of the flesh.",
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
    conflict: "Disgusted by his bloated, worldly existence, Siddhartha flees to the river to drown himself. At the edge of death, he hears the sacred sound 'Om' from the water, awakening him from spiritual slumber into pure joy.",
    objective: "Survive a psychological trial of self-hatred and awaken with a clean slate.",
  },

  // SPIRIT: Stages 7 - 9
  {
    id: 7,
    name: "The Ferryman’s Disciple",
    subtitle: "Listening to the River",
    realm: "SPIRIT",
    angle: 250,
    concept: "Learning a completely new form of wisdom based on quiet observation and nature.",
    conflict: "Siddhartha moves in with Vasudeva, a humble ferryman. Instead of reading books, he learns to listen deeply to the river, realizing that time is an illusion and all things exist in a simultaneous, eternal present.",
    objective: "Master the art of listening, patience, and guiding others across the threshold.",
  },
  {
    id: 8,
    name: "The Wound of Love",
    subtitle: "The Ultimate Human Trial",
    realm: "SPIRIT",
    angle: 288,
    concept: "Facing the agonizing pain of human attachment and grief.",
    conflict: "Kamala dies, leaving Siddhartha with their spoiled city-born son. The son runs away, and Siddhartha must endure the heartbreak of letting him go, fully experiencing human sorrow.",
    objective: "Overcome personal grief and break the cycle of trying to control others.",
  },
  {
    id: 9,
    name: "The Eternal Flow",
    subtitle: "Total Integration",
    realm: "SPIRIT",
    angle: 325,
    concept: "Achieving full enlightenment, peace, and unity with the universe.",
    conflict: "Vasudeva departs into the woods, leaving Siddhartha as the master ferryman. Siddhartha passes on his realization: everything is sacred, time is a construct, and love is the most important force.",
    objective: "Attain ultimate oneness, bridge the gap for others, and complete the spiritual cycle.",
  },
];

const TOTAL_PUZZLES_TO_ENLIGHTENMENT = 27;

/* Incense Burner Component with smoking wisps */
function IncenseBurner({ active }: { active: boolean }) {
  return (
    <div className="relative w-8 h-9 flex flex-col items-center justify-end select-none">
      {/* Animated Smoke Wisps when active */}
      {active && (
        <div className="absolute -top-3 w-4 h-6 pointer-events-none flex justify-center">
          <svg className="w-4 h-6 overflow-visible" viewBox="0 0 20 30" fill="none">
            {/* Wisp 1 */}
            <path
              d="M10 28 C8 22, 13 18, 9 12 C6 7, 12 4, 10 0"
              stroke="rgba(120, 113, 108, 0.55)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="smoke-curl-1"
            />
            {/* Wisp 2 */}
            <path
              d="M11 27 C13 21, 8 16, 12 10 C14 6, 9 3, 11 0"
              stroke="rgba(140, 130, 122, 0.45)"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="smoke-curl-2"
            />
          </svg>
        </div>
      )}

      {/* Incense Stick & Ember */}
      <div className="relative flex flex-col items-center z-10">
        <div 
          className={`w-[2.5px] h-3.5 rounded-t-sm transition-colors duration-500 ${
            active ? 'bg-stone-600' : 'bg-stone-300'
          }`}
        >
          {/* Glowing Ember tip */}
          {active && (
            <div className="w-1.5 h-1.5 -ml-[2px] -mt-0.5 rounded-full bg-amber-500 shadow-[0_0_4px_#f59e0b] animate-pulse" />
          )}
        </div>
      </div>

      {/* Ornate Bronze Censer Tripod Vessel */}
      <svg className="w-7 h-5 relative z-20" viewBox="0 0 32 22" fill="none">
        {/* Vessel Body */}
        <ellipse cx="16" cy="11" rx="11" ry="6.5" fill={active ? "#7c6a58" : "#a8a29e"} />
        <ellipse cx="16" cy="10" rx="9.5" ry="5" fill={active ? "#5f4f40" : "#8c857e"} />
        {/* Rim Highlight */}
        <ellipse cx="16" cy="9.5" rx="9" ry="2.5" fill={active ? "#8f7c68" : "#b8b2a8"} />
        {/* Side Handles */}
        <path d="M4 10 C2 10, 2 13, 5 14" stroke={active ? "#695847" : "#999"} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M28 10 C30 10, 30 13, 27 14" stroke={active ? "#695847" : "#999"} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Tripod Feet */}
        <path d="M8 15 L7 20" stroke={active ? "#574839" : "#888"} strokeWidth="2" strokeLinecap="round" />
        <path d="M24 15 L25 20" stroke={active ? "#574839" : "#888"} strokeWidth="2" strokeLinecap="round" />
        <path d="M16 16 L16 20.5" stroke={active ? "#4a3c2e" : "#777"} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Game() {
  const [puzzleCount, setPuzzleCount] = useState(0);
  const [sequence, setSequence] = useState<Direction[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Direction[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [streak, setStreak] = useState(4); // Default aesthetic streak or game streak
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isTranscendence, setIsTranscendence] = useState(false);
  const [selectedLoreStage, setSelectedLoreStage] = useState<StageInfo | null>(null);

  // Each stage has 3 puzzles (total 27 puzzles)
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
      setTimeout(() => setFeedback(null), 320);
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

  // Node position coordinates around center (250, 250) with radius 180
  const stagePositions = useMemo(() => {
    const cx = 250;
    const cy = 250;
    const r = 180;
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
    <div className="relative min-h-screen bg-twilight-zen flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 select-none overflow-hidden">
      
      {/* Serene Background Landscape: Misty Mountain Ridges and Bamboo Silhouettes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Twilight Sky Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#261f2d]/60 via-[#161a24]/40 to-transparent" />

        {/* Mountain Layer 1 (Distant soft ridge) */}
        <svg className="absolute bottom-0 w-full h-[55%] min-w-[1200px] opacity-40" preserveAspectRatio="none" viewBox="0 0 1440 380">
          <path
            d="M0 240 Q180 140 380 200 T800 160 T1200 210 T1440 180 L1440 380 L0 380 Z"
            fill="#232836"
          />
        </svg>

        {/* Mountain Layer 2 (Mid-distance misty peaks) */}
        <svg className="absolute bottom-0 w-full h-[45%] min-w-[1200px] opacity-65" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path
            d="M0 210 C220 130 350 240 600 150 C850 70 1020 220 1260 140 C1380 100 1440 180 1440 180 L1440 320 L0 320 Z"
            fill="#181c26"
          />
        </svg>

        {/* Mountain Layer 3 (Foreground dark silhouettes) */}
        <svg className="absolute bottom-0 w-full h-[32%] min-w-[1200px] opacity-85" preserveAspectRatio="none" viewBox="0 0 1440 260">
          <path
            d="M0 160 Q260 110 520 170 T1040 140 T1440 160 L1440 260 L0 260 Z"
            fill="#0f1218"
          />
        </svg>

        {/* Misty Horizontal Fog Ribbons */}
        <div className="absolute bottom-28 w-full h-24 bg-gradient-to-r from-transparent via-[#b5a9bc]/15 to-transparent blur-xl" />
        <div className="absolute bottom-12 w-full h-16 bg-gradient-to-r from-transparent via-[#8fa3a8]/10 to-transparent blur-lg" />

        {/* Left Bamboo Silhouette */}
        <svg className="absolute -left-10 bottom-0 w-64 sm:w-80 h-[80%] opacity-75" viewBox="0 0 300 700" fill="none">
          {/* Bamboo Culms */}
          <path d="M60 700 L60 0 M58 200 L62 200 M58 380 L62 380 M58 540 L62 540" stroke="#0a0d12" strokeWidth="8" />
          <path d="M110 700 L110 50 M108 260 L112 260 M108 430 L112 430 M108 590 L112 590" stroke="#0c0f14" strokeWidth="11" />
          <path d="M160 700 L160 120 M158 310 L162 310 M158 490 L162 490" stroke="#090c10" strokeWidth="6" />
          {/* Bamboo Leaves */}
          <path d="M60 220 C80 200 120 215 140 210 C110 225 80 230 60 220 Z" fill="#090c10" />
          <path d="M60 380 C30 360 0 380 -20 375 C10 385 40 395 60 380 Z" fill="#090c10" />
          <path d="M110 270 C140 240 190 260 220 250 C180 270 140 280 110 270 Z" fill="#0b0e13" />
          <path d="M110 440 C80 420 40 435 10 430 C50 445 80 455 110 440 Z" fill="#0b0e13" />
          <path d="M160 320 C180 305 220 315 240 310 C210 325 180 330 160 320 Z" fill="#080b0f" />
        </svg>

        {/* Right Bamboo Silhouette */}
        <svg className="absolute -right-10 bottom-0 w-64 sm:w-80 h-[80%] opacity-75" viewBox="0 0 300 700" fill="none">
          <path d="M240 700 L240 0 M238 210 L242 210 M238 390 L242 390 M238 560 L242 560" stroke="#0a0d12" strokeWidth="9" />
          <path d="M190 700 L190 70 M188 280 L192 280 M188 450 L192 450 M188 610 L192 610" stroke="#0c0f14" strokeWidth="12" />
          <path d="M130 700 L130 140 M128 330 L132 330 M128 510 L132 510" stroke="#090c10" strokeWidth="6" />
          {/* Bamboo Leaves */}
          <path d="M240 230 C210 210 170 225 140 220 C180 235 210 240 240 230 Z" fill="#090c10" />
          <path d="M190 290 C160 265 110 285 80 275 C120 295 160 305 190 290 Z" fill="#0b0e13" />
          <path d="M190 460 C220 440 260 455 290 450 C250 465 220 475 190 460 Z" fill="#0b0e13" />
          <path d="M130 340 C100 320 60 335 30 330 C70 345 100 355 130 340 Z" fill="#080b0f" />
        </svg>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[480px] sm:max-w-[500px] flex flex-col items-center">
        
        {/* Washi Paper Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="washi-card rounded-[2.5rem] p-6 sm:p-8 w-full flex flex-col items-center justify-between min-h-[580px] relative overflow-hidden"
        >
          
          {!isPlaying ? (
            /* Intro / Start Journey Screen in Zen Aesthetic */
            <div className="flex flex-col items-center justify-center my-auto py-4 text-center max-w-sm space-y-6">
              
              {/* Central Lotus & Enso Crest */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Stylized Enso Brush Circle */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <path
                    d="M 50,10 A 40,40 0 1,1 18,32"
                    fill="none"
                    stroke="#1e1b18"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="200"
                    strokeDashoffset="10"
                    className="opacity-80"
                  />
                  <path
                    d="M 48,11 A 40,40 0 0,1 86,65"
                    fill="none"
                    stroke="#1e1b18"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="opacity-40"
                  />
                </svg>

                {/* Pale Celadon Jade Medallion */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d9eee5] via-[#aed7c4] to-[#7dbb9f] shadow-md flex items-center justify-center border border-white/60">
                  {/* Calligraphic Meditating Figure / Lotus */}
                  <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="18" r="3.5" fill="#1b3226" />
                    <path d="M32 23 C29 28, 26 36, 23 44 C28 47, 36 47, 41 44 C38 36, 35 28, 32 23 Z" fill="#1b3226" />
                    {/* Lotus Petals Base */}
                    <path d="M32 37 C24 38, 14 44, 18 50 C25 50, 29 46, 32 43 C35 46, 39 50, 46 50 C50 44, 40 38, 32 37 Z" fill="#1b3226" />
                  </svg>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-[0.25em] text-stone-500 uppercase font-serif-zen">
                  Hermann Hesse • Siddhartha
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-1 mb-2 tracking-tight font-serif-zen">
                  Wind & Unwind
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed px-2 font-serif-zen">
                  Travel the 9 circles of <strong className="text-stone-900">Mind</strong>, <strong className="text-stone-900">Body</strong>, and <strong className="text-stone-900">Spirit</strong>. Solve 3 tone puzzles at each stage—27 in total—to reach Enlightenment.
                </p>
                <div className="text-[11px] text-stone-500 italic mt-3 font-serif-zen">
                  Stage 1 begins with single-tone repetition; each circle broadens the melody.
                </div>
              </div>

              <div className="w-full pt-2">
                <button
                  type="button"
                  onClick={startGame}
                  className="jade-stone w-full py-3.5 px-6 flex items-center justify-center space-x-2 text-emerald-950 font-bold tracking-wide shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <Play size={18} className="fill-emerald-950/80 text-emerald-950" />
                  <span className="font-serif-zen text-sm font-black tracking-wider uppercase">Begin The Journey</span>
                </button>
              </div>

            </div>
          ) : (
            /* Active Game Loop: The Asian / Zen Interface */
            <div className="w-full flex flex-col items-center justify-between h-full space-y-3">
              
              {/* Header HUD */}
              <div className="w-full flex justify-between items-start pt-1 px-1">
                
                {/* Left: CURRENT STREAK with Calligraphy Script '道' */}
                <div className="flex flex-col text-left">
                  <span className="text-[10px] tracking-widest text-stone-500 uppercase font-bold font-serif-zen">
                    Current Streak
                  </span>
                  <div className="flex items-baseline space-x-1.5 mt-0.5">
                    <span className="font-brush text-3xl sm:text-4xl text-stone-900 font-bold leading-none">
                      {streak}
                    </span>
                    <span className="font-brush text-2xl sm:text-3xl text-stone-800 leading-none">
                      道
                    </span>
                    <span className="text-[11px] text-stone-400 font-serif-zen font-semibold ml-1">
                      ({puzzleCount}/27)
                    </span>
                  </div>
                </div>

                {/* Right: Three Incense Burners (Strikes) & Lore Button */}
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLoreStage(currentStage)}
                    title="View Stage Lore & Conflict"
                    className="p-1.5 rounded-xl bg-stone-200/50 hover:bg-stone-300/50 text-stone-600 hover:text-stone-800 transition-all border border-stone-300/60 cursor-pointer active:scale-95 flex items-center space-x-1 shadow-sm"
                  >
                    <BookOpen size={13} />
                    <span className="text-[9px] font-bold uppercase tracking-wider pr-0.5 font-serif-zen">Lore</span>
                  </button>

                  {/* Three Incense Burners */}
                  <div className="flex items-center space-x-1">
                    {[0, 1, 2].map((i) => (
                      <IncenseBurner key={i} active={i >= strikes} />
                    ))}
                  </div>
                </div>

              </div>

              {/* The Central Circular Wheel: Faded Dharmachakra + Ensō + Jade & Stamp Nodes */}
              <div className="relative w-full max-w-[340px] sm:max-w-[370px] aspect-square flex items-center justify-center my-1 select-none">
                <svg className="w-full h-full enso-container" viewBox="0 0 500 500">
                  <defs>
                    {/* Jade Completed Glow */}
                    <radialGradient id="jadeGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#52b788" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#52b788" stopOpacity="0" />
                    </radialGradient>
                    
                    {/* Celadon Medallion Gradient */}
                    <radialGradient id="celadonGrad" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#eaf7f1" />
                      <stop offset="50%" stopColor="#c5e6d6" />
                      <stop offset="85%" stopColor="#9cc9b3" />
                      <stop offset="100%" stopColor="#76a891" />
                    </radialGradient>

                    {/* Cinnabar Stamp Gradient */}
                    <radialGradient id="cinnabarGrad" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#e67e22" />
                      <stop offset="40%" stopColor="#c0392b" />
                      <stop offset="100%" stopColor="#962d22" />
                    </radialGradient>
                  </defs>

                  {/* 1. Stylized Faded Dharmachakra (Dharma Wheel) in Background */}
                  <g className="opacity-40" stroke="#bfb29e" fill="none">
                    {/* Outer Wheel Rim */}
                    <circle cx="250" cy="250" r="148" strokeWidth="3.5" />
                    <circle cx="250" cy="250" r="160" strokeWidth="1.5" strokeDasharray="5 7" />
                    
                    {/* 8 Radiating Dharmachakra Spokes with Ornamental Knobs */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                      const rad = (angle * Math.PI) / 180;
                      const xInner = 250 + 58 * Math.cos(rad);
                      const yInner = 250 + 58 * Math.sin(rad);
                      const xOuter = 250 + 148 * Math.cos(rad);
                      const yOuter = 250 + 148 * Math.sin(rad);
                      const xMid = 250 + 104 * Math.cos(rad);
                      const yMid = 250 + 104 * Math.sin(rad);
                      return (
                        <g key={idx}>
                          <line x1={xInner} y1={yInner} x2={xOuter} y2={yOuter} strokeWidth="3" strokeLinecap="round" />
                          <circle cx={xMid} cy={yMid} r="4.5" fill="#bfb29e" />
                          <circle cx={xOuter} cy={yOuter} r="5.5" fill="#bfb29e" />
                        </g>
                      );
                    })}
                  </g>

                  {/* 2. Ensō (Ink Brush Circle) with Sumi-E Texture */}
                  <path
                    d="M 270 68 
                       C 375 74, 438 152, 432 254 
                       C 426 356, 344 436, 244 436 
                       C 144 436, 62 356, 68 250 
                       C 74 158, 144 82, 226 72"
                    fill="none"
                    stroke="#1e1b18"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90"
                  />
                  <path
                    d="M 282 74 
                       C 382 80, 442 160, 436 256 
                       C 430 352, 348 430, 248 430 
                       C 150 430, 72 352, 76 250 
                       C 80 168, 142 86, 220 78"
                    fill="none"
                    stroke="#2e2a25"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="opacity-50"
                  />

                  {/* 3. The 9 Stage Nodes along the Circle */}
                  {stagePositions.map((node, i) => {
                    const isPassed = i < currentStageIndex;
                    const isActive = i === currentStageIndex;

                    return (
                      <g 
                        key={node.id} 
                        className="transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedLoreStage(node)}
                      >
                        {/* Soft Jade Halo Glow for Completed Steps */}
                        {isPassed && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="26"
                            fill="url(#jadeGlow)"
                          />
                        )}

                        {/* Auspicious Pulsing Ring for Active Node */}
                        {isActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="22"
                            fill="none"
                            stroke="#c0392b"
                            strokeWidth="2"
                            strokeDasharray="4 3"
                            className="animate-spin"
                            style={{ animationDuration: '9s' }}
                          />
                        )}

                        {/* Node Disc: Completed = Jade finish; Upcoming = Cinnabar red stamp seal */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="15.5"
                          fill={isPassed ? "#389367" : "url(#cinnabarGrad)"}
                          stroke={isPassed ? "#a3e4c4" : "#f5b7b1"}
                          strokeWidth="1.8"
                        />
                        {/* Subtle glossy highlight */}
                        <ellipse
                          cx={node.x - 4}
                          cy={node.y - 5}
                          rx="5"
                          ry="2.5"
                          fill="rgba(255,255,255,0.45)"
                          transform={`rotate(-30 ${node.x - 4} ${node.y - 5})`}
                        />

                        {/* Node Icon: White Checkmark or Calligraphic Number */}
                        {isPassed ? (
                          <Check
                            x={node.x - 7.5}
                            y={node.y - 7.5}
                            size={15}
                            strokeWidth={3}
                            className="text-white drop-shadow-sm"
                          />
                        ) : (
                          <text
                            x={node.x}
                            y={node.y + 4.5}
                            fill="#ffffff"
                            fontSize="12"
                            fontWeight="900"
                            textAnchor="middle"
                            fontFamily="Shippori Mincho, serif"
                            className="drop-shadow-sm select-none"
                          >
                            {node.id}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Central Medallion Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6">
                  
                  {/* Stage Realm & Title (Above Lotus) */}
                  <div 
                    className="text-center mb-1 pointer-events-auto cursor-pointer group"
                    onClick={() => setSelectedLoreStage(currentStage)}
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2d6a50] block font-serif-zen">
                      {currentStage.realm} • STAGE {currentStage.id}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-tight font-serif-zen group-hover:text-emerald-900 transition-colors">
                      {currentStage.name}
                    </h3>
                    <div className="text-[9px] text-stone-500 font-serif-zen tracking-wider flex items-center justify-center space-x-2 mt-0.5">
                      <span className="opacity-60 uppercase">SPIRIT</span>
                      <span className="italic font-bold text-stone-700">({currentStage.subtitle})</span>
                      <span className="opacity-60 uppercase">MIND</span>
                    </div>
                  </div>

                  {/* Pale Jade Celadon Disk with Hand-Drawn Lotus / Meditating Symbol */}
                  <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 my-1">
                    {/* Audio Feedback Pulse */}
                    <AnimatePresence>
                      {feedback === 'correct' && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.4, opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-[#52b788] rounded-full blur-sm"
                        />
                      )}
                    </AnimatePresence>

                    {/* Jade Celadon Disk */}
                    <motion.div
                      animate={{
                        scale: feedback === 'correct' ? [1, 1.05, 1] : 1,
                        x: feedback === 'wrong' ? [-6, 6, -6, 6, 0] : 0,
                      }}
                      className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center shadow-md border transition-all duration-300 ${
                        feedback === 'wrong' 
                          ? 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                          : 'border-white/90 shadow-[0_4px_14px_rgba(64,145,108,0.25)]'
                      }`}
                      style={{
                        background: 'radial-gradient(circle at 35% 30%, #eef9f4 0%, #cae8da 45%, #9bc7b2 85%, #6a9e86 100%)',
                      }}
                    >
                      {/* Meditating Figure on Lotus Flower in Black Ink Brush Lines */}
                      <svg className="w-13 h-13 text-[#18281f]" viewBox="0 0 64 64" fill="none">
                        {/* Meditating Figure Head */}
                        <circle cx="32" cy="18" r="3.2" fill="#18281f" />
                        
                        {/* Upper Body Torso */}
                        <path 
                          d="M32 23 C29 27, 27 33, 24 39 C28 42, 36 42, 40 39 C37 33, 35 27, 32 23 Z" 
                          fill="#18281f" 
                        />
                        
                        {/* Lotus Petal Center Cup */}
                        <path 
                          d="M32 34 C30 38, 30 43, 32 46 C34 43, 34 38, 32 34 Z" 
                          fill="#18281f" 
                        />

                        {/* Graceful Blooming Lotus Petals Left & Right */}
                        <path 
                          d="M30 40 C21 38, 12 43, 16 51 C24 51, 28 46, 31 42 Z" 
                          fill="#18281f" 
                        />
                        <path 
                          d="M34 40 C43 38, 52 43, 48 51 C40 51, 36 46, 33 42 Z" 
                          fill="#18281f" 
                        />
                        
                        {/* Base Lotus Leaf Pod */}
                        <path 
                          d="M22 50 C28 53, 36 53, 42 50 C38 52, 26 52, 22 50 Z" 
                          fill="#18281f" 
                        />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Stage Progress & Tone Count (Below Lotus) */}
                  <div className="text-center mt-0.5">
                    <span className="text-[9.5px] uppercase tracking-widest text-stone-500 font-bold font-serif-zen block">
                      CIRCLE {currentStageIndex + 1} • PUZZLE {puzzleInStage}/3 ({currentPuzzleLength} {currentPuzzleLength === 1 ? 'TONE' : 'TONES'})
                    </span>
                    <span className="text-[10px] italic text-stone-600 font-serif-zen">
                      {isShowingSequence ? 'Listen to the bells...' : 'Repeat the tone'}
                    </span>
                  </div>

                </div>
              </div>

              {/* Tone Input Buttons: Polished Jade River Stones with Carved Arrows */}
              <div className="flex space-x-6 items-center justify-center pt-2 pb-2">
                
                {/* HIGHER TONE Stone */}
                <button
                  type="button"
                  onClick={() => handleInput('up')}
                  disabled={isShowingSequence}
                  className={`jade-stone w-32 sm:w-36 py-3.5 px-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isShowingSequence ? 'opacity-40 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="text-[8.5px] uppercase font-black tracking-widest text-emerald-950/80 mb-0.5 font-serif-zen">
                    Higher Tone
                  </span>
                  <span className="jade-carving text-2xl font-black leading-none">
                    ↑
                  </span>
                </button>

                {/* LOWER TONE Stone */}
                <button
                  type="button"
                  onClick={() => handleInput('down')}
                  disabled={isShowingSequence}
                  className={`jade-stone w-32 sm:w-36 py-3.5 px-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isShowingSequence ? 'opacity-40 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  <span className="text-[8.5px] uppercase font-black tracking-widest text-emerald-950/80 mb-0.5 font-serif-zen">
                    Lower Tone
                  </span>
                  <span className="jade-carving text-2xl font-black leading-none">
                    ↓
                  </span>
                </button>

              </div>

            </div>
          )}

          {/* Lore Detail Modal (Washi Paper Scroll Style) */}
          <AnimatePresence>
            {selectedLoreStage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-left"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  className="washi-card rounded-3xl p-6 sm:p-7 max-w-sm w-full relative shadow-2xl"
                >
                  <button
                    onClick={() => setSelectedLoreStage(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#34705a] mb-1 font-serif-zen">
                    {selectedLoreStage.realm} • Stage {selectedLoreStage.id} of 9
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 font-serif-zen mb-0.5">
                    {selectedLoreStage.name}
                  </h3>
                  <div className="text-xs text-stone-500 font-serif-zen italic mb-4">
                    ({selectedLoreStage.subtitle})
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-stone-700 font-serif-zen">
                    <div>
                      <strong className="text-stone-900 uppercase tracking-wider text-[10px] block mb-0.5">The Concept</strong>
                      <p>{selectedLoreStage.concept}</p>
                    </div>
                    <div>
                      <strong className="text-[#a93226] uppercase tracking-wider text-[10px] block mb-0.5">The Conflict</strong>
                      <p>{selectedLoreStage.conflict}</p>
                    </div>
                    <div>
                      <strong className="text-[#275d49] uppercase tracking-wider text-[10px] block mb-0.5">Game Objective</strong>
                      <p className="font-semibold text-stone-900">{selectedLoreStage.objective}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedLoreStage(null)}
                    className="jade-stone mt-5 w-full py-2.5 text-emerald-950 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider font-serif-zen shadow-sm"
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
                className="absolute inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="washi-card rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3 border border-red-200">
                    <RotateCcw size={26} className="text-red-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-1 font-serif-zen">
                    Memory Faded
                  </h2>
                  <p className="text-stone-600 mb-1 text-xs font-serif-zen">
                    The harmony was lost at Stage {currentStage.id}: <strong className="text-stone-900">{currentStage.name}</strong>
                  </p>
                  <p className="text-stone-500 mb-3 text-[11px] italic font-serif-zen px-2">
                    "{currentStage.conflict}"
                  </p>
                  <p className="text-stone-600 text-xs mb-5 font-serif-zen">
                    Puzzles solved: <strong className="text-stone-900">{puzzleCount} / 27</strong> • Peak streak: <strong className="text-stone-900">{streak}</strong>
                  </p>
                  <button
                    onClick={startGame}
                    className="jade-stone w-full py-3 text-emerald-950 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider font-serif-zen shadow-md"
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
                className="absolute inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="washi-card rounded-3xl p-7 max-w-sm w-full shadow-2xl flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d9eee5] via-[#aed7c4] to-[#7dbb9f] flex items-center justify-center mb-3 shadow-md border border-white">
                    <Sparkles size={30} className="text-[#1c2c23] animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#34705a] uppercase font-serif-zen">
                    Stage 9 • The Eternal Flow
                  </span>
                  <h2 className="text-2xl font-bold text-stone-900 mt-1 mb-2 font-serif-zen">
                    Enlightenment Achieved
                  </h2>
                  <p className="text-stone-700 mb-2 text-xs leading-relaxed font-serif-zen">
                    You solved all 27 puzzles across Mind, Body, and Spirit, attaining ultimate oneness.
                  </p>
                  <p className="text-stone-500 mb-5 text-[11px] italic font-serif-zen">
                    "Everything is sacred, time is a construct, and love is the most important force."
                  </p>
                  <div className="flex flex-col space-y-2 w-full">
                    <button
                      onClick={continueCycle}
                      className="jade-stone w-full py-2.5 text-emerald-950 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider font-serif-zen shadow-md"
                    >
                      Ascend to Cycle 2
                    </button>
                    <button
                      onClick={startGame}
                      className="w-full py-2.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider font-serif-zen"
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