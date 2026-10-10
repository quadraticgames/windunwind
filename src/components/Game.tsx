import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Sparkles, Check, X, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { playCorrectNote, playWrongNote, initializeAudio, startDrone, stopDrone, playStageFanfare, toggleMute, getIsMuted, playClickSound } from '../utils/sound';

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
  // BODY: Stages 1 - 3
  {
    id: 1,
    name: "The Brahmin’s Cage",
    subtitle: "The Departure",
    realm: "BODY",
    angle: 35,
    concept: "The protagonist begins in a world of perfection, ritual, and intellectual privilege.",
    conflict: "Despite mastering all the texts, Siddhartha feels a profound inner emptiness. He must stand up to his father's traditional expectations to earn the right to leave.",
    objective: "Break away from comfort and cross the threshold into the unknown.",
  },
  {
    id: 2,
    name: "The Samana Trials",
    subtitle: "Asceticism",
    realm: "BODY",
    angle: 75,
    concept: "A stage of extreme denial, survival, and testing the limits of the physical body.",
    conflict: "Siddhartha fasts, breathes minimally, and endures pain to kill the 'Self.' However, he realizes that self-mortification is just a temporary escape, not true enlightenment.",
    objective: "Survive the elements and strip away the ego through intense discipline.",
  },
  {
    id: 3,
    name: "Confronting the Buddha",
    subtitle: "The Rejection of Doctrine",
    realm: "BODY",
    angle: 110,
    concept: "Meeting the ultimate spiritual authority - Gotama, the Buddha.",
    conflict: "Siddhartha recognizes the Buddha's perfection but realizes that wisdom cannot be taught through words or doctrines; it must be experienced firsthand. He leaves his companion Govinda behind to walk alone.",
    objective: "Walk away from ready-made answers and choose a solitary, unguided path.",
  },

  // MIND: Stages 4 - 6
  {
    id: 4,
    name: "The Garden of Kamala",
    subtitle: "The Awakening of Senses",
    realm: "MIND",
    angle: 145,
    concept: "Stepping into the vibrant, beautiful, and tactile material world.",
    conflict: "Siddhartha enters the city and encounters the beautiful courtesan Kamala. To win her love, he must learn the art of desire, trade, and love-making, transitioning from a monk to a creature of the flesh.",
    objective: "Master the arts of the material world, social status, and physical pleasure.",
  },
  {
    id: 5,
    name: "Rich Man",
    subtitle: "Greed",
    realm: "MIND",
    angle: 180,
    concept: "The slow decay of the soul through wealth, greed, and addiction.",
    conflict: "Over the years, Siddhartha becomes a wealthy merchant (working with Kamaswami). He falls victim to high-stakes gambling, drinking, and spiritual sloth, completely losing touch with his inner voice.",
    objective: "Walk through worldly excess so you can finally leave it behind with zero regrets.",
  },
  {
    id: 6,
    name: "The River of Rebirth",
    subtitle: "The Dark Night of the Soul",
    realm: "MIND",
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

type StageTheme = {
  skyGradient: [string, string, string, string];
  farMountain: string;
  midMountain: string;
  slopeMountain: string;
  fogColor: string;
  fogOpacity: number;
  celestial: {
    cx: number;
    cy: number;
    r: number;
    fill: string;
    glow: string;
    opacity: number;
  };
  sparkleColor: string;
  waterColor: string;
};

const STAGE_THEMES: Record<number, StageTheme> = {
  // Stage 1: The Brahmin’s Cage - Crisp Pale Morning Mist & Green Bamboo Dawn
  1: {
    skyGradient: ['#fbf7ed', '#f4ece1', '#f7eae4', '#eeddd6'],
    farMountain: '#e3dbcc',
    midMountain: '#dbd1bd',
    slopeMountain: '#cfc3af',
    fogColor: '#52b788',
    fogOpacity: 0.12,
    celestial: { cx: 280, cy: 95, r: 38, fill: '#fff9ee', glow: '#fed7aa', opacity: 0.55 },
    sparkleColor: '#a5f3fc',
    waterColor: '#ded4be',
  },
  // Stage 2: The Samana Trials - Arid Desert Winds, Sunbaked Ochre, Dusty Sand
  2: {
    skyGradient: ['#fcf6ea', '#f5e8d3', '#edd6ba', '#dfc4a2'],
    farMountain: '#ded0b8',
    midMountain: '#d2c0a4',
    slopeMountain: '#c4ad8e',
    fogColor: '#d97706',
    fogOpacity: 0.16,
    celestial: { cx: 340, cy: 80, r: 42, fill: '#fff7e6', glow: '#f59e0b', opacity: 0.75 },
    sparkleColor: '#fde68a',
    waterColor: '#d6c4a8',
  },
  // Stage 3: Confronting the Buddha - Sacred Golden Enlightenment Radiance
  3: {
    skyGradient: ['#fefce8', '#fef3c7', '#fde68a', '#fcd34d'],
    farMountain: '#e5d19a',
    midMountain: '#d9c283',
    slopeMountain: '#c9b06b',
    fogColor: '#f59e0b',
    fogOpacity: 0.20,
    celestial: { cx: 500, cy: 105, r: 64, fill: '#fef08a', glow: '#f59e0b', opacity: 0.7 },
    sparkleColor: '#fef08a',
    waterColor: '#e0c98f',
  },
  // Stage 4: The Garden of Kamala - Senses Awakening, Blooming Peach & Rose Dusk
  4: {
    skyGradient: ['#fdf2f4', '#fce7ed', '#fbcfe8', '#f5d0fe'],
    farMountain: '#e2bccd',
    midMountain: '#d4a9bc',
    slopeMountain: '#c292a8',
    fogColor: '#ec4899',
    fogOpacity: 0.15,
    celestial: { cx: 720, cy: 90, r: 46, fill: '#fdf2f8', glow: '#f472b6', opacity: 0.65 },
    sparkleColor: '#fbcfe8',
    waterColor: '#ddb8ca',
  },
  // Stage 5: Rich Man (Greed) - Opulent Cinnabar Dusk & Smoked Burgundy Lanterns
  5: {
    skyGradient: ['#fbf1f0', '#f6dcde', '#eec1c7', '#deb0b8'],
    farMountain: '#cfabb4',
    midMountain: '#bf94a0',
    slopeMountain: '#af7e8c',
    fogColor: '#e11d48',
    fogOpacity: 0.17,
    celestial: { cx: 780, cy: 85, r: 44, fill: '#ffe4e6', glow: '#fb7185', opacity: 0.75 },
    sparkleColor: '#fda4af',
    waterColor: '#caa2ab',
  },
  // Stage 6: The River of Rebirth - Dark Night of the Soul, Indigo Mist & Silvery Full Moon
  6: {
    skyGradient: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd'],
    farMountain: '#a5c4e8',
    midMountain: '#8fb1d9',
    slopeMountain: '#769ac5',
    fogColor: '#3b82f6',
    fogOpacity: 0.20,
    celestial: { cx: 480, cy: 80, r: 36, fill: '#ffffff', glow: '#93c5fd', opacity: 0.95 },
    sparkleColor: '#bfdbfe',
    waterColor: '#9bbde3',
  },
  // Stage 7: The Ferryman’s Disciple - Deep Emerald River Waters & Sacred Flow
  7: {
    skyGradient: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac'],
    farMountain: '#9fd4b6',
    midMountain: '#86c2a1',
    slopeMountain: '#6eac8b',
    fogColor: '#10b981',
    fogOpacity: 0.18,
    celestial: { cx: 280, cy: 95, r: 48, fill: '#f0fdf4', glow: '#34d399', opacity: 0.7 },
    sparkleColor: '#6ee7b7',
    waterColor: '#93cca8',
  },
  // Stage 8: The Wound of Love - Amethyst Sunset, Grief & Transcendence
  8: {
    skyGradient: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe'],
    farMountain: '#c6a8dc',
    midMountain: '#b28ecb',
    slopeMountain: '#9e73ba',
    fogColor: '#8b5cf6',
    fogOpacity: 0.18,
    celestial: { cx: 640, cy: 90, r: 45, fill: '#faf5ff', glow: '#c084fc', opacity: 0.8 },
    sparkleColor: '#e9d5ff',
    waterColor: '#baa0d2',
  },
  // Stage 9: The Eternal Flow - Radiant Celestial Aurora, Ultimate Oneness
  9: {
    skyGradient: ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4'],
    farMountain: '#7ecec1',
    midMountain: '#62baa9',
    slopeMountain: '#47a492',
    fogColor: '#14b8a6',
    fogOpacity: 0.24,
    celestial: { cx: 885, cy: 80, r: 56, fill: '#ffffff', glow: '#2dd4bf', opacity: 0.95 },
    sparkleColor: '#5eead4',
    waterColor: '#75c8b9',
  },
};

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
  const [stageCelebration, setStageCelebration] = useState<{ stageId: number; name: string; realm: string } | null>(null);
  const [isMuted, setIsMuted] = useState(() => getIsMuted());

  const handleToggleMute = useCallback(() => {
    const next = toggleMute();
    setIsMuted(next);
  }, []);

  // Keyboard shortcut: Press 'M' to toggle mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMute]);

  // Start ambient drone at the start screen / main menu
  useEffect(() => {
    // Attempt playback immediately on load
    startDrone();

    // Browser autoplay policy fallback: unlock and start drone on user gesture
    const handleFirstInteraction = () => {
      startDrone();
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Each stage has 3 puzzles (total 27 puzzles)
  const currentStageIndex = Math.min(Math.floor(puzzleCount / 3), 8);
  const currentStage = STAGES[currentStageIndex];
  const puzzleInStage = (puzzleCount % 3) + 1;
  const currentPuzzleLength = currentStageIndex + 1;
  const currentTheme = STAGE_THEMES[currentStage.id] || STAGE_THEMES[1];

  const tutorialTonesRef = useRef<Direction[]>([]);
  const puzzleCountRef = useRef(puzzleCount);
  puzzleCountRef.current = puzzleCount;
  const sequenceIdRef = useRef<number>(0);
  const pendingTimeoutRef = useRef<number | null>(null);
  const isAwaitingLoreContinueRef = useRef<boolean>(false);
  const pendingStageSequenceRef = useRef<Direction[] | null>(null);

  const generateTutorialTones = useCallback((): Direction[] => {
    // Stage 1 (tutorial) has 3 single-tone puzzles.
    // Guarantee that both 'up' and 'down' tones are played at least once during this stage:
    // First two puzzles contain both tones ('up' and 'down') in random order,
    // and the third puzzle is randomly either 'up' or 'down'.
    const firstTwo: Direction[] = Math.random() > 0.5 ? ['up', 'down'] : ['down', 'up'];
    const third: Direction = Math.random() > 0.5 ? 'up' : 'down';
    return [...firstTwo, third];
  }, []);

  const generateSequenceForPuzzle = useCallback((count: number): Direction[] => {
    // Tutorial stage (Stage 1 = puzzles 0, 1, 2): guarantee each tone is played at least once
    if (count < 3) {
      if (!tutorialTonesRef.current || tutorialTonesRef.current.length < 3) {
        tutorialTonesRef.current = generateTutorialTones();
      }
      return [tutorialTonesRef.current[count]];
    }

    const stageIdx = Math.min(Math.floor(count / 3), 8);
    const len = stageIdx + 1;
    return Array(len)
      .fill(null)
      .map(() => (Math.random() > 0.5 ? 'up' : 'down'));
  }, [generateTutorialTones]);

  const showSequence = useCallback(async (seq: Direction[]) => {
    const seqId = ++sequenceIdRef.current;
    setIsShowingSequence(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (sequenceIdRef.current !== seqId) return;
      playCorrectNote(seq[i]);
      setFeedback('correct'); 
      setTimeout(() => {
        if (sequenceIdRef.current === seqId) {
          setFeedback(null);
        }
      }, 320);
    }
    if (sequenceIdRef.current !== seqId) return;
    setIsShowingSequence(false);
    setPlayerSequence([]);
  }, []);

  const handleCloseLore = useCallback(() => {
    setSelectedLoreStage(null);
    if (isAwaitingLoreContinueRef.current && pendingStageSequenceRef.current) {
      isAwaitingLoreContinueRef.current = false;
      const seqToPlay = pendingStageSequenceRef.current;
      pendingStageSequenceRef.current = null;
      setIsShowingSequence(true);
      setTimeout(() => {
        setSequence(seqToPlay);
        showSequence(seqToPlay);
      }, 350);
    }
  }, [showSequence]);

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
      pendingTimeoutRef.current = window.setTimeout(() => {
        pendingTimeoutRef.current = null;
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
        puzzleCountRef.current = nextCount;
        setPuzzleCount(nextCount);
        setStreak(s => s + 1);

        if (nextCount >= TOTAL_PUZZLES_TO_ENLIGHTENMENT) {
          setIsTranscendence(true);
          return;
        }

        const isAdvancingStage = Math.floor(nextCount / 3) > Math.floor(puzzleCount / 3);
        if (isAdvancingStage) {
          const nextStage = STAGES[Math.min(Math.floor(nextCount / 3), 8)];
          playStageFanfare();
          setStageCelebration({
            stageId: nextStage.id,
            name: nextStage.name,
            realm: nextStage.realm,
          });
          const nextSeq = generateSequenceForPuzzle(nextCount);
          pendingStageSequenceRef.current = nextSeq;
          isAwaitingLoreContinueRef.current = true;
          setIsShowingSequence(false);

          pendingTimeoutRef.current = window.setTimeout(() => {
            pendingTimeoutRef.current = null;
            setStageCelebration(null);
            setSelectedLoreStage(nextStage);
          }, 2500);
        } else {
          pendingTimeoutRef.current = window.setTimeout(() => {
            pendingTimeoutRef.current = null;
            const nextSeq = generateSequenceForPuzzle(nextCount);
            setSequence(nextSeq);
            showSequence(nextSeq);
          }, 800);
        }
      }
    }
  }, [isPlaying, isShowingSequence, gameOver, isTranscendence, playerSequence, sequence, strikes, puzzleCount, generateSequenceForPuzzle, showSequence]);

  const advanceToNextStage = useCallback(async () => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    const curSeqId = ++sequenceIdRef.current;
    setFeedback(null);

    await initializeAudio();
    startDrone();

    if (!isPlaying || gameOver) {
      setIsPlaying(true);
      setGameOver(false);
      setStrikes(0);
      setStreak(0);
      setSelectedLoreStage(null);
    }

    if (isTranscendence) {
      setIsTranscendence(false);
      puzzleCountRef.current = 0;
      setPuzzleCount(0);
      setStrikes(0);
      setPlayerSequence([]);
      const initialSeq = generateSequenceForPuzzle(0);
      setSequence(initialSeq);
      showSequence(initialSeq);
      return;
    }

    const currentCount = puzzleCountRef.current;
    const currentStageIdx = Math.min(Math.floor(currentCount / 3), 8);
    const nextStageIdx = currentStageIdx + 1;
    const nextPuzzleCount = nextStageIdx * 3;

    if (nextPuzzleCount >= TOTAL_PUZZLES_TO_ENLIGHTENMENT) {
      puzzleCountRef.current = TOTAL_PUZZLES_TO_ENLIGHTENMENT;
      setPuzzleCount(TOTAL_PUZZLES_TO_ENLIGHTENMENT);
      setIsTranscendence(true);
      setIsShowingSequence(false);
      setPlayerSequence([]);
      playStageFanfare();
      return;
    }

    const nextStage = STAGES[nextStageIdx];
    puzzleCountRef.current = nextPuzzleCount;
    setPuzzleCount(nextPuzzleCount);
    setStrikes(0);
    setPlayerSequence([]);
    setIsShowingSequence(false);
    playStageFanfare();
    setStageCelebration({
      stageId: nextStage.id,
      name: nextStage.name,
      realm: nextStage.realm,
    });
    const nextSeq = generateSequenceForPuzzle(nextPuzzleCount);
    pendingStageSequenceRef.current = nextSeq;
    isAwaitingLoreContinueRef.current = true;

    pendingTimeoutRef.current = window.setTimeout(() => {
      pendingTimeoutRef.current = null;
      if (sequenceIdRef.current === curSeqId) {
        setStageCelebration(null);
        setSelectedLoreStage(nextStage);
      }
    }, 2500);
  }, [isPlaying, gameOver, isTranscendence, generateSequenceForPuzzle, showSequence]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) {
      e.preventDefault();
      advanceToNextStage();
      return;
    }

    if (e.key === 'ArrowUp') handleInput('up');
    if (e.key === 'ArrowDown') handleInput('down');
  }, [advanceToNextStage, handleInput]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Global click sound effect for all UI buttons except tone buttons
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      // Check if clicked element or its parent is a button
      const button = target.closest('button');
      if (button) {
        if (button.disabled || button.getAttribute('data-tone-button') === 'true' || button.getAttribute('aria-disabled') === 'true') {
          return;
        }
        playClickSound();
        return;
      }

      // Check if clicked element is a stage lore node along the path
      const stageNode = target.closest('[data-stage-node]');
      if (stageNode) {
        playClickSound();
      }
    };

    window.addEventListener('click', handleGlobalClick, true);
    return () => window.removeEventListener('click', handleGlobalClick, true);
  }, []);

  const startGame = async () => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    const curSeqId = ++sequenceIdRef.current;
    await initializeAudio();
    startDrone();
    setIsPlaying(true);
    setGameOver(false);
    setIsTranscendence(false);
    setStrikes(0);
    setStreak(0);
    puzzleCountRef.current = 0;
    setPuzzleCount(0);
    setSelectedLoreStage(null);
    tutorialTonesRef.current = generateTutorialTones();
    const initialSeq = generateSequenceForPuzzle(0);

    const stage1 = STAGES[0];
    playStageFanfare();
    setStageCelebration({
      stageId: stage1.id,
      name: stage1.name,
      realm: stage1.realm,
    });
    pendingStageSequenceRef.current = initialSeq;
    isAwaitingLoreContinueRef.current = true;
    setIsShowingSequence(false);

    pendingTimeoutRef.current = window.setTimeout(() => {
      pendingTimeoutRef.current = null;
      if (sequenceIdRef.current === curSeqId) {
        setStageCelebration(null);
        setSelectedLoreStage(stage1);
      }
    }, 2500);
  };

  const continueCycle = () => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    const curSeqId = ++sequenceIdRef.current;
    setIsTranscendence(false);
    startDrone();
    const nextSeq = generateSequenceForPuzzle(puzzleCountRef.current);
    const stageIdx = Math.min(Math.floor(puzzleCountRef.current / 3), 8);
    const stage = STAGES[stageIdx];
    playStageFanfare();
    setStageCelebration({
      stageId: stage.id,
      name: stage.name,
      realm: stage.realm,
    });
    pendingStageSequenceRef.current = nextSeq;
    isAwaitingLoreContinueRef.current = true;
    setIsShowingSequence(false);

    pendingTimeoutRef.current = window.setTimeout(() => {
      pendingTimeoutRef.current = null;
      if (sequenceIdRef.current === curSeqId) {
        setStageCelebration(null);
        setSelectedLoreStage(stage);
      }
    }, 2500);
  };

  // Node coordinates along the left-to-right winding ink brush path
  const stagePositions = useMemo(() => {
    const PATH_COORDINATES = [
      { id: 1, x: 652.0, y: 1185.5 },
      { id: 2, x: 1270.0, y: 1238.6 },
      { id: 3, x: 1888.0, y: 1438.6 },
      { id: 4, x: 2506.0, y: 1529.2 },
      { id: 5, x: 3124.0, y: 1210.5 },
      { id: 6, x: 3742.0, y: 904.2 },
      { id: 7, x: 4360.0, y: 791.7 },
      { id: 8, x: 4978.0, y: 819.9 },
      { id: 9, x: 5596.0, y: 626.1 },
    ];
    return STAGES.map((s, idx) => ({
      ...s,
      x: PATH_COORDINATES[idx].x,
      y: PATH_COORDINATES[idx].y,
    }));
  }, []);

  return (
    <div className="relative min-h-screen bg-twilight-zen flex flex-col items-center justify-center p-0 sm:p-3 md:p-4 select-none overflow-hidden">
      
      {/* Serene Background Landscape: Misty Mountain Ridges and Bamboo Silhouettes */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Twilight Sky Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#261f2d]/60 via-[#161a24]/40 to-transparent" />

        {/* Tibet Scenic Panorama Outer Backdrop */}
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-bottom pointer-events-none filter contrast-125 brightness-95 saturate-95"
          style={{ backgroundImage: `url('/svg/tibet.svg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161a24]/80 via-transparent to-[#161a24]/30 pointer-events-none" />

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
      <div className="relative z-10 w-full max-w-[1240px] flex flex-col items-center px-0 sm:px-2 md:px-4">
        
        {/* Game Area Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-none sm:rounded-[2rem] md:rounded-[2.5rem] w-full flex flex-col items-center justify-between min-h-0 relative overflow-hidden shadow-2xl border border-stone-800/30 p-0"
        >
          {/* Full-Bleed Game Area Backdrop: Dynamic Stage Lighting, Sun/Moon, and Tibet Artwork covering the entire game area with NO side padding */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Sky Background Gradient */}
            <div 
              className="absolute inset-0 transition-all duration-1000 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.skyGradient[0]} 0%, ${currentTheme.skyGradient[1]} 35%, ${currentTheme.skyGradient[2]} 70%, ${currentTheme.skyGradient[3]} 100%)`
              }}
            />

            {/* Celestial Sun / Moon Orb (True 1:1 Circular Disc & Radiant Glow, Never Stretched) */}
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"
              style={{
                left: `${(currentTheme.celestial.cx / 1000) * 100}%`,
                top: `${(currentTheme.celestial.cy / 620) * 60 + 40}px`,
                transition: 'left 1.2s ease-in-out, top 1.2s ease-in-out',
              }}
            >
              {/* Outer Radiant Flare */}
              <div
                className="rounded-full blur-2xl pointer-events-none"
                style={{
                  width: `${currentTheme.celestial.r * 4.2}px`,
                  height: `${currentTheme.celestial.r * 4.2}px`,
                  backgroundColor: currentTheme.celestial.glow,
                  opacity: currentTheme.celestial.opacity * 0.85,
                  transform: 'translate(-50%, -50%)',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transition: 'width 1.2s ease-in-out, height 1.2s ease-in-out, background-color 1.2s ease-in-out, opacity 1.2s ease-in-out',
                }}
              />
              {/* Middle Luminous Glow */}
              <div
                className="rounded-full blur-md pointer-events-none"
                style={{
                  width: `${currentTheme.celestial.r * 2.4}px`,
                  height: `${currentTheme.celestial.r * 2.4}px`,
                  backgroundColor: currentTheme.celestial.glow,
                  opacity: currentTheme.celestial.opacity,
                  transform: 'translate(-50%, -50%)',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  boxShadow: `0 0 ${currentTheme.celestial.r * 1.5}px ${currentTheme.celestial.glow}`,
                  transition: 'width 1.2s ease-in-out, height 1.2s ease-in-out, background-color 1.2s ease-in-out, opacity 1.2s ease-in-out',
                }}
              />
              {/* Crisp Core Celestial Disc */}
              <div
                className="rounded-full pointer-events-none"
                style={{
                  width: `${currentTheme.celestial.r * 1.8}px`,
                  height: `${currentTheme.celestial.r * 1.8}px`,
                  backgroundColor: currentTheme.celestial.fill,
                  opacity: currentTheme.celestial.opacity,
                  transform: 'translate(-50%, -50%)',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  filter: 'blur(1.2px)',
                  boxShadow: `0 0 ${currentTheme.celestial.r * 0.8}px ${currentTheme.celestial.fill}`,
                  transition: 'width 1.2s ease-in-out, height 1.2s ease-in-out, background-color 1.2s ease-in-out, opacity 1.2s ease-in-out',
                }}
              />
            </div>

            {/* Tibet Sacred Landscape (tibet.svg) covering 100% of the game area with authentic, non-stretched proportions */}
            <img
              src="/svg/tibet.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none z-0"
              style={{
                mixBlendMode: 'multiply',
                opacity: 0.94,
              }}
            />

            {/* Atmospheric Stage Color Wash Tint */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-1000 z-0"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.skyGradient[0]} 0%, ${currentTheme.skyGradient[1]} 35%, ${currentTheme.skyGradient[2]} 70%, ${currentTheme.skyGradient[3]} 100%)`,
                opacity: 0.22,
                mixBlendMode: 'color',
              }}
            />

            {/* Subtle Horizon Mist / Fog Ribbon */}
            <div
              className="absolute bottom-12 left-0 right-0 h-12 pointer-events-none blur-lg transition-all duration-1000 z-0"
              style={{
                backgroundColor: currentTheme.fogColor,
                opacity: currentTheme.fogOpacity,
              }}
            />
          </div>
          
          {!isPlaying ? (
            /* Intro / Start Journey Screen in Zen Aesthetic */
            <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8 sm:py-10 px-6 sm:px-8 text-center max-w-md space-y-6 bg-[#fbf9f4]/90 backdrop-blur-md rounded-3xl m-4 sm:m-8 border border-[#e4decb] shadow-2xl">
              
              {/* Mute Toggle Button on Intro Screen */}
              <button
                type="button"
                onClick={handleToggleMute}
                title={isMuted ? "Unmute drone (M)" : "Mute drone (M)"}
                aria-label={isMuted ? "Unmute ambient drone" : "Mute ambient drone"}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-all border cursor-pointer active:scale-95 flex items-center justify-center shadow-sm ${
                  isMuted
                    ? 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border-amber-300/80 ring-1 ring-amber-400/40'
                    : 'bg-stone-200/60 hover:bg-stone-300/60 text-stone-700 hover:text-stone-900 border-stone-300/70'
                }`}
              >
                {isMuted ? (
                  <VolumeX size={16} className="text-amber-800" />
                ) : (
                  <Volume2 size={16} className="text-emerald-800" />
                )}
              </button>
              
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

                {/* Lotus Medallion */}
                <img
                  src="/svg/lotus.svg"
                  alt="Lotus"
                  className="w-20 h-20 rounded-full shadow-lg border-2 border-white/80 object-contain drop-shadow-md select-none pointer-events-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-[0.25em] text-stone-500 uppercase font-serif-zen">
                  Hermann Hesse • Siddhartha
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-1 mb-2 tracking-tight font-serif-zen">
                  Wind & Unwind
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed px-2 font-serif-zen">
                  Travel the 9 circles of <strong className="text-stone-900">Mind</strong>, <strong className="text-stone-900">Body</strong>, and <strong className="text-stone-900">Spirit</strong>. Solve 3 tone puzzles at each stage (27 in total) to reach Enlightenment and Oneness.
                </p>
                <div className="text-[11px] text-stone-500 italic mt-3 font-serif-zen">
                  Stage 1 begins with a tutorial and single-tone repetitions. Each successive circle broadens the number of notes used.
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
            /* Active Game Loop: The Asian / Zen Landscape Interface */
            <div className="relative z-10 w-full flex flex-col items-center justify-between h-full space-y-1">
              
              {/* Header HUD */}
              <div className="w-full grid grid-cols-[1fr_auto_1fr] items-start pt-3 sm:pt-4 px-4 sm:px-8 select-none gap-2">
                
                {/* Left: CURRENT STREAK with Calligraphy Script '道' */}
                <div className="flex flex-col text-left justify-self-start">
                  <span className="text-[10px] sm:text-[11px] tracking-widest text-stone-500 uppercase font-bold font-serif-zen whitespace-nowrap">
                    Current Streak
                  </span>
                  <div className="flex items-baseline space-x-1.5 mt-0.5 whitespace-nowrap">
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

                {/* Center: Stage Progression Breadcrumb & Title */}
                <div className="flex flex-col items-center text-center justify-self-center px-2">
                  {/* Stages Breadcrumb: BODY ➔ MIND ➔ SPIRIT */}
                  <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-[11.5px] font-serif-zen font-bold tracking-widest text-stone-700 uppercase mb-0.5 whitespace-nowrap">
                    <span className="opacity-60 text-[9.5px]">STAGES:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full transition-all duration-300 ${
                        currentStage.realm === 'BODY'
                          ? 'bg-[#aed7c4] text-emerald-950 font-black shadow-sm ring-1 ring-emerald-600/30'
                          : 'opacity-70'
                      }`}
                    >
                      BODY
                    </span>
                    <span className="text-stone-400 font-black text-[9px]">➔</span>
                    <span
                      className={`px-2 py-0.5 rounded-full transition-all duration-300 ${
                        currentStage.realm === 'MIND'
                          ? 'bg-[#aed7c4] text-emerald-950 font-black shadow-sm ring-1 ring-emerald-600/30'
                          : 'opacity-70'
                      }`}
                    >
                      MIND
                    </span>
                    <span className="text-stone-400 font-black text-[9px]">➔</span>
                    <span
                      className={`px-2 py-0.5 rounded-full transition-all duration-300 ${
                        currentStage.realm === 'SPIRIT'
                          ? 'bg-[#aed7c4] text-emerald-950 font-black shadow-sm ring-1 ring-emerald-600/30'
                          : 'opacity-70'
                      }`}
                    >
                      SPIRIT
                    </span>
                  </div>

                  {/* Stage Realm & Title */}
                  <div 
                    className="cursor-pointer group select-none mt-0.5 flex flex-col items-center"
                    onClick={() => setSelectedLoreStage(currentStage)}
                    title="Click to view stage details"
                  >
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-[#34705a] block font-serif-zen whitespace-nowrap">
                      {currentStage.realm} • STAGE {currentStage.id}
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 tracking-tight leading-tight font-serif-zen group-hover:text-emerald-900 transition-colors whitespace-nowrap">
                      {currentStage.name}
                    </h2>
                    <div className="text-[11px] sm:text-[14.5px] text-stone-500 font-serif-zen tracking-widest flex items-center justify-center space-x-2 whitespace-nowrap">
                      <span className="font-bold uppercase text-stone-700">({currentStage.subtitle})</span>
                    </div>
                  </div>
                </div>

                {/* Right: Mute Button, Lore Button & Three Incense Burners (Strikes) */}
                <div className="flex items-center justify-end space-x-2 sm:space-x-2.5 justify-self-end shrink-0">
                  {/* Mute Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    title={isMuted ? "Unmute drone (M)" : "Mute drone (M)"}
                    aria-label={isMuted ? "Unmute ambient drone" : "Mute ambient drone"}
                    className={`p-1.5 rounded-xl transition-all border cursor-pointer active:scale-95 flex items-center justify-center shadow-sm ${
                      isMuted
                        ? 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border-amber-300/80 ring-1 ring-amber-400/40'
                        : 'bg-stone-200/50 hover:bg-stone-300/50 text-stone-600 hover:text-stone-800 border-stone-300/60'
                    }`}
                  >
                    {isMuted ? (
                      <VolumeX size={13} className="text-amber-800" />
                    ) : (
                      <Volume2 size={13} className="text-emerald-800" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLoreStage(currentStage)}
                    title="View Stage Lore & Conflict"
                    className="p-1.5 rounded-xl bg-stone-200/50 hover:bg-stone-300/50 text-stone-600 hover:text-stone-800 transition-all border border-stone-300/60 cursor-pointer active:scale-95 flex items-center space-x-1 shadow-sm whitespace-nowrap"
                  >
                    <BookOpen size={13} />
                    <span className="text-[9px] font-bold uppercase tracking-wider pr-0.5 font-serif-zen">Lore</span>
                  </button>

                  {/* Three Incense Burners */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {[0, 1, 2].map((i) => (
                      <IncenseBurner key={i} active={i >= strikes} />
                    ))}
                  </div>
                </div>

              </div>

              {/* The Central Path: Left-to-Right Sumi-e Brush Stroke Line with Scenic Landscape Backdrop */}
              <div className="relative w-full overflow-hidden select-none my-0.5 flex items-center justify-center">
                {/* Stage Advancement Fanfare Banner */}
                <AnimatePresence>
                  {stageCelebration && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="absolute top-3 z-40 px-5 py-2 rounded-full bg-stone-900/90 backdrop-blur-md text-amber-100 border border-amber-400/50 shadow-2xl flex items-center space-x-2.5 pointer-events-none whitespace-nowrap"
                    >
                      <Sparkles size={16} className="text-amber-300 animate-pulse shrink-0" />
                      <span className="text-xs font-serif-zen tracking-widest uppercase font-bold text-amber-200 whitespace-nowrap">
                        Stage {stageCelebration.stageId}: {stageCelebration.name}
                      </span>
                      <span className="text-[10px] text-amber-300/80 font-mono whitespace-nowrap">[{stageCelebration.realm}]</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <svg className="w-full h-auto max-h-[260px] sm:max-h-[300px] overflow-visible" viewBox="0 0 6292 1821" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    {/* Soft Celadon Glow for Completed Nodes */}
                    <radialGradient id="jadeGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#52b788" stopOpacity="0.65" />
                      <stop offset="100%" stopColor="#52b788" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* 1. THE AFFINITY DESIGNER SUMI-E INK BRUSH STROKE & BASE EARTHY CIRCLES */}
                  <image
                    href="/svg/path.svg"
                    x="0"
                    y="0"
                    width="6292"
                    height="1821"
                    preserveAspectRatio="xMidYMid meet"
                    className="select-none pointer-events-none drop-shadow-md"
                  />

                  {/* 2. THE 9 INTERACTIVE STAGE NODES ALONG THE PATH */}
                  {stagePositions.map((node, i) => {
                    const isPassed = i < currentStageIndex;
                    const isActive = i === currentStageIndex;

                    return (
                      <g 
                        key={node.id} 
                        data-stage-node="true"
                        className="transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedLoreStage(node)}
                      >
                        {/* Soft Jade Halo Glow for Completed Steps */}
                        {isPassed && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="340"
                            fill="url(#jadeGlow)"
                            className="pointer-events-none"
                          />
                        )}

                        {/* White Pulsing Dotted Ring for Active Node */}
                        {isActive && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="290"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="22"
                            strokeDasharray="44 28"
                            className="animate-pulse drop-shadow-md pointer-events-none"
                          />
                        )}

                        {/* Node Disc Content */}
                        {isActive ? (
                          <>
                            {/* Active Stage: Lotus Medallion with White Circular Frame */}
                            <image
                              href="/svg/lotus.svg"
                              x={node.x - 235.4}
                              y={node.y - 235.4}
                              width="470.8"
                              height="470.8"
                              className="drop-shadow-xl select-none pointer-events-none"
                            />
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r="235.4"
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="16"
                              opacity="0.9"
                              className="pointer-events-none"
                            />
                          </>
                        ) : isPassed ? (
                          <>
                            {/* Completed Stage: Jade Disc with White Rim and Checkmark */}
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r="235.4"
                              fill="#389367"
                              stroke="#a3e4c4"
                              strokeWidth="22"
                              className="drop-shadow-lg"
                            />
                            <ellipse
                              cx={node.x - 55}
                              cy={node.y - 75}
                              rx="75"
                              ry="38"
                              fill="rgba(255,255,255,0.4)"
                              transform={`rotate(-30 ${node.x - 55} ${node.y - 75})`}
                              className="pointer-events-none"
                            />
                            <g transform={`translate(${node.x - 105}, ${node.y - 105})`} className="pointer-events-none">
                              <Check
                                size={210}
                                strokeWidth={3.5}
                                className="text-white drop-shadow-sm"
                              />
                            </g>
                          </>
                        ) : (
                          <>
                            {/* Unreached Stage: Base circle from /svg/path.svg + Stage Number */}
                            <text
                              x={node.x}
                              y={node.y}
                              dominantBaseline="central"
                              fill="#ffffff"
                              fontSize="185"
                              fontWeight="900"
                              textAnchor="middle"
                              fontFamily="Shippori Mincho, serif"
                              className="drop-shadow-md select-none pointer-events-none"
                            >
                              {node.id}
                            </text>
                          </>
                        )}

                        {/* Invisible hit target circle covering the entire node area */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="245"
                          fill="transparent"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Stage Progress Info & Tone Input Buttons (Below the Path) */}
              <div className="w-full flex flex-col items-center justify-center pt-2 pb-3 sm:pb-4 px-4 sm:px-8 select-none bg-gradient-to-t from-stone-950/80 via-stone-950/45 to-transparent">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-200/90 font-bold font-serif-zen block whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  STAGE {currentStageIndex + 1} • PUZZLE {puzzleInStage}/3 ({currentPuzzleLength} {currentPuzzleLength === 1 ? 'TONE' : 'TONES'})
                </span>
                {currentStageIndex === 0 ? (
                  <span className="text-[11px] sm:text-[12px] font-bold text-emerald-300 font-serif-zen mt-0.5 block whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {isShowingSequence
                      ? 'Listen closely to the tone...'
                      : sequence[playerSequence.length] === 'up'
                        ? 'That tone was HIGHER - click "Higher Tone"'
                        : 'That tone was LOWER - click "Lower Tone"'}
                  </span>
                ) : (
                  <span className="text-[10.5px] sm:text-[11.5px] italic text-stone-300 font-serif-zen mt-0.5 block whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {isShowingSequence ? 'Listen to the bells...' : 'Repeat the tone'}
                  </span>
                )}

                {/* Tone Input Buttons: Polished Jade River Stones with Yin-Yang */}
                <div className="flex space-x-6 items-center justify-center pt-5 pb-0.5">
                
                {/* HIGHER TONE Stone */}
                <div className="relative flex flex-col items-center">
                  {currentStageIndex === 0 && !isShowingSequence && sequence[playerSequence.length] === 'up' && (
                    <div className="absolute -top-3.5 z-20 px-2.5 py-0.5 bg-emerald-800 text-amber-100 text-[9px] font-black uppercase tracking-wider rounded-full shadow-lg animate-bounce whitespace-nowrap border border-emerald-400/50">
                      Click Here
                    </div>
                  )}
                  <button
                    type="button"
                    data-tone-button="true"
                    onClick={() => handleInput('up')}
                    disabled={isShowingSequence}
                    className={`jade-stone w-32 sm:w-36 py-3 px-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isShowingSequence ? 'opacity-40 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'
                    } ${
                      currentStageIndex === 0 && !isShowingSequence && sequence[playerSequence.length] === 'up'
                        ? 'ring-2 ring-emerald-600 shadow-[0_0_16px_rgba(52,112,90,0.6)] scale-105'
                        : ''
                    }`}
                  >
                    <span className="text-[8.5px] uppercase font-black tracking-widest text-emerald-950/80 mb-1.5 font-serif-zen">
                      Higher Tone
                    </span>
                    <img src="/svg/yinyang.svg" alt="" className="w-7 h-7 object-contain drop-shadow-sm" />
                  </button>
                </div>

                {/* LOWER TONE Stone */}
                <div className="relative flex flex-col items-center">
                  {currentStageIndex === 0 && !isShowingSequence && sequence[playerSequence.length] === 'down' && (
                    <div className="absolute -top-3.5 z-20 px-2.5 py-0.5 bg-emerald-800 text-amber-100 text-[9px] font-black uppercase tracking-wider rounded-full shadow-lg animate-bounce whitespace-nowrap border border-emerald-400/50">
                      Click Here
                    </div>
                  )}
                  <button
                    type="button"
                    data-tone-button="true"
                    onClick={() => handleInput('down')}
                    disabled={isShowingSequence}
                    className={`jade-stone w-32 sm:w-36 py-3 px-3 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      isShowingSequence ? 'opacity-40 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'
                    } ${
                      currentStageIndex === 0 && !isShowingSequence && sequence[playerSequence.length] === 'down'
                        ? 'ring-2 ring-emerald-600 shadow-[0_0_16px_rgba(52,112,90,0.6)] scale-105'
                        : ''
                    }`}
                  >
                    <span className="text-[8.5px] uppercase font-black tracking-widest text-emerald-950/80 mb-1.5 font-serif-zen">
                      Lower Tone
                    </span>
                    <img src="/svg/yinyang.svg" alt="" className="w-7 h-7 object-contain drop-shadow-sm" />
                  </button>
                </div>

                </div>
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
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleCloseLore();
                }}
                className="absolute inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-left"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  className="washi-card rounded-3xl p-6 sm:p-7 max-w-sm w-full relative shadow-2xl"
                >
                  <button
                    onClick={handleCloseLore}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#34705a] mb-1 font-serif-zen whitespace-nowrap">
                    {selectedLoreStage.realm} • Stage {selectedLoreStage.id} of 9
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 font-serif-zen mb-0.5 whitespace-nowrap">
                    {selectedLoreStage.name}
                  </h3>
                  <div className="text-xs text-stone-500 font-serif-zen italic mb-4 whitespace-nowrap">
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
                      <strong className="text-[#275d49] uppercase tracking-wider text-[10px] block mb-0.5">The Lesson</strong>
                      <p className="font-semibold text-stone-900">{selectedLoreStage.objective}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseLore}
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