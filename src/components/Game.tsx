import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Sparkles, Check, X, BookOpen, Volume2, VolumeX, Brain, Wind, Maximize, Minimize } from 'lucide-react';
import { playCorrectNote, playWrongNote, initializeAudio, startDrone, playStageFanfare, toggleMute, getIsMuted, playClickSound } from '../utils/sound';
import {
  GlowingStarItem,
  getStage1MistMotes,
  getStage1CloudWisps,
  getStage2Snowflakes,
  getStage3GoldenSparks,
  getStage3HeatStreaks,
  getStage3HeatHazeBands,
  getStage4BlossomPetals,
  getStage5LanternEmbers,
  getStage6NightStars,
  getStage7BambooLeaves,
  getStage7AquaRiverConfig,
  getStage8NightStars,
  getStage9SpiritMotes,
  getStage9Snowflakes,
} from '../utils/visualConfig';

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

interface CustomCSSProperties extends React.CSSProperties {
  '--star-opacity'?: number;
  '--star-glow'?: string;
  '--wisp-opacity'?: number;
  '--particle-opacity'?: number;
}

type StageTheme = {
  isNight?: boolean;
  isWinter?: boolean;
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

const LANTERN_EMBERS = getStage5LanternEmbers();
const NIGHT_STARS_STAGE_6 = getStage6NightStars();
const NIGHT_STARS_STAGE_8 = getStage8NightStars();

function GlowingStarField({ stars, defaultGlow }: { stars: GlowingStarItem[]; defaultGlow: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star, idx) => {
        const animClass =
          star.variant === 1 ? 'anim-star-1' : star.variant === 2 ? 'anim-star-2' : 'anim-star-glow';
        const starColor = star.color || '#ffffff';
        const glowColor = star.glow || defaultGlow;

        return (
          <React.Fragment key={idx}>
            {/* 4-Point Diamond Sparkle Flare for Major Constellation Stars */}
            {star.isMajor && (
              <div
                className={`absolute pointer-events-none ${animClass}`}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size * 4.8}px`,
                  height: `${star.size * 4.8}px`,
                  transform: 'translate(-50%, -50%)',
                  '--star-opacity': star.opacity,
                  '--star-glow': glowColor,
                  animationDuration: `${star.dur}s`,
                  animationDelay: `${star.delay}s`,
                } as CustomCSSProperties}
              >
                <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible">
                  <path
                    d="M12 2 Q12 12 22 12 Q12 12 12 2 Z"
                    fill={starColor}
                    filter={`drop-shadow(0 0 3px ${glowColor})`}
                  />
                  <circle cx="12" cy="12" r="3.2" fill="#ffffff" />
                </svg>
              </div>
            )}

            {/* Glowing Star Core Point */}
            <div
              className={`absolute rounded-full pointer-events-none ${animClass}`}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: starColor,
                transform: 'translate(-50%, -50%)',
                '--star-opacity': star.opacity,
                '--star-glow': glowColor,
                opacity: star.opacity,
                boxShadow:
                  star.size > 2.2
                    ? `0 0 5px ${starColor}, 0 0 10px ${glowColor}`
                    : `0 0 3px ${starColor}, 0 0 6px ${glowColor}`,
                animationDuration: `${star.dur}s`,
                animationDelay: `${star.delay}s`,
              } as CustomCSSProperties}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------------------
// STAGE-SPECIFIC AMBIENT PARTICLES (Delicate Zen Atmosphere)
// -------------------------------------------------------------------------

const STAGE_1_CLOUD_WISPS = getStage1CloudWisps();

function StageOneCloudWisps() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {STAGE_1_CLOUD_WISPS.map((wisp, idx) => {
        const animClass =
          wisp.variant === 1
            ? 'anim-cloud-wisp-1'
            : wisp.variant === 2
            ? 'anim-cloud-wisp-2'
            : 'anim-cloud-wisp-3';
        return (
          <div
            key={idx}
            className={`absolute pointer-events-none ${animClass}`}
            style={{
              top: `${wisp.y}%`,
              left: 0,
              width: `${wisp.width}px`,
              height: `${wisp.height}px`,
              '--wisp-opacity': wisp.opacity,
              opacity: wisp.opacity,
              filter: `blur(${wisp.blur}px) drop-shadow(0 2px 10px rgba(255, 255, 255, 0.5))`,
              animationDuration: `${wisp.dur}s`,
              animationDelay: `${wisp.delay}s`,
            } as CustomCSSProperties}
          >
            <svg
              viewBox="0 0 320 180"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id={`wispGrad-${idx}`} x1="0%" y1="20%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                  <stop offset="16%" stopColor="#ffffff" stopOpacity="0.86" />
                  <stop offset="42%" stopColor="#f0fdf4" stopOpacity="0.95" />
                  <stop offset="68%" stopColor="#ffffff" stopOpacity="0.90" />
                  <stop offset="88%" stopColor="#f0fdf4" stopOpacity="0.82" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
                </linearGradient>
              </defs>

              {/* Variant 1: Upward-Curving Crescent Cloud with billowing crests */}
              {wisp.variant === 1 && (
                <g>
                  <path
                    d="M 22 118 C 48 138, 88 152, 138 150 C 188 148, 238 132, 278 102 C 302 84, 314 68, 302 60 C 290 52, 268 54, 250 66 C 238 40, 208 26, 178 28 C 150 30, 128 44, 116 60 C 98 44, 68 46, 48 66 C 28 86, 20 104, 22 118 Z"
                    fill={`url(#wispGrad-${idx})`}
                  />
                  <path
                    d="M 58 78 C 78 62, 102 60, 116 72 M 132 54 C 158 38, 192 38, 218 54 M 98 132 C 148 138, 202 125, 248 98"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.38"
                  />
                </g>
              )}

              {/* Variant 2: Undulating S-Curved Auspicious Cloud */}
              {wisp.variant === 2 && (
                <g>
                  <path
                    d="M 18 82 C 44 62, 80 58, 110 72 C 122 48, 152 30, 188 32 C 224 34, 250 52, 260 74 C 286 70, 310 86, 306 108 C 298 132, 268 146, 230 144 C 195 142, 170 130, 148 120 C 124 110, 94 118, 70 135 C 46 148, 26 140, 18 122 C 12 105, 12 92, 18 82 Z"
                    fill={`url(#wispGrad-${idx})`}
                  />
                  <path
                    d="M 78 122 C 102 108, 132 110, 152 118 M 128 64 C 154 46, 188 46, 216 60 M 232 70 C 258 62, 282 74, 286 92"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.38"
                  />
                </g>
              )}

              {/* Variant 3: Plump Billowing Cumulus with Scooped Curved Base */}
              {wisp.variant === 3 && (
                <g>
                  <path
                    d="M 32 126 C 72 148, 140 156, 198 148 C 242 138, 276 124, 292 108 C 304 96, 294 84, 274 82 C 276 60, 252 44, 226 48 C 210 22, 158 18, 130 42 C 106 30, 72 42, 58 70 C 40 80, 24 104, 32 126 Z"
                    fill={`url(#wispGrad-${idx})`}
                  />
                  <path
                    d="M 68 78 C 88 56, 118 54, 136 68 M 144 40 C 170 30, 202 34, 218 56 M 72 132 C 128 142, 188 136, 242 122"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.38"
                  />
                </g>
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

const MIST_MOTES = getStage1MistMotes();
const FALLING_SNOWFLAKES = getStage2Snowflakes();
const STAGE_3_HEAT_HAZE_BANDS = getStage3HeatHazeBands();
const STAGE_3_HEAT_STREAKS = getStage3HeatStreaks();

function StageThreeHeatDistortion() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Ambient Rising Heat Mirage Horizon Glow with Shimmer Pulse */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3/5 anim-heat-flutter pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 100%, rgba(245, 158, 11, 0.18) 0%, rgba(254, 240, 138, 0.09) 45%, transparent 80%)',
        }}
      />

      {/* Vertical Motion-Blurred Heat Shimmer Streaks */}
      {STAGE_3_HEAT_STREAKS.map((streak, idx) => (
        <div
          key={`streak-${idx}`}
          className={`absolute bottom-0 pointer-events-none ${streak.variant === 1 ? 'anim-heat-shimmer-1' : 'anim-heat-shimmer-2'}`}
          style={{
            left: `${streak.x}%`,
            width: `${streak.width}px`,
            height: `${streak.height}px`,
            background:
              'linear-gradient(to top, rgba(245, 158, 11, 0.35) 0%, rgba(253, 224, 71, 0.2) 55%, transparent 100%)',
            opacity: streak.opacity,
            filter: 'blur(2px)',
            transform: 'scaleY(1.35)',
            animationDuration: `${streak.dur}s`,
            animationDelay: `${streak.delay}s`,
          }}
        />
      ))}

      {/* Layered Horizontal Heat Haze Mirage Wave Bands with Backdrop Motion Blur */}
      {STAGE_3_HEAT_HAZE_BANDS.map((band, idx) => (
        <div
          key={`band-${idx}`}
          className={`absolute left-0 right-0 pointer-events-none ${band.variant === 1 ? 'anim-heat-shimmer-1' : 'anim-heat-shimmer-2'}`}
          style={{
            top: `${band.y}%`,
            height: `${band.height}px`,
            backdropFilter: 'blur(2px) contrast(1.06) brightness(1.05)',
            WebkitBackdropFilter: 'blur(2px) contrast(1.06) brightness(1.05)',
            background:
              'linear-gradient(180deg, transparent 0%, rgba(245, 158, 11, 0.07) 35%, rgba(254, 240, 138, 0.1) 65%, transparent 100%)',
            animationDuration: `${band.dur}s`,
            animationDelay: `${band.delay}s`,
          }}
        />
      ))}

      {/* Buddha Aura Heat Corona Shimmer */}
      <div
        className="absolute rounded-full pointer-events-none anim-heat-flutter"
        style={{
          width: '260px',
          height: '260px',
          left: '50%',
          top: '26%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.25) 0%, rgba(245, 158, 11, 0.14) 50%, transparent 75%)',
          filter: 'blur(3.5px)',
        }}
      />
    </div>
  );
}

const GOLDEN_SPARKS = getStage3GoldenSparks();
const BLOSSOM_PETALS = getStage4BlossomPetals();
const BAMBOO_LEAVES = getStage7BambooLeaves();
const SPIRIT_MOTES = getStage9SpiritMotes();
const STAGE_9_SNOWFLAKES = getStage9Snowflakes();

// Stage 7: The Ferryman’s Disciple - Dedicated Aqua Blue River Atmosphere Overlay
function StageSevenAquaRiverOverlay() {
  const cfg = getStage7AquaRiverConfig();
  if (!cfg.enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Deep Aqua Blue Primary Atmosphere Color Wash */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `linear-gradient(180deg, ${cfg.skyWash} 0%, ${cfg.midRiverWash} 32%, ${cfg.deepRiverWash} 65%, ${cfg.riverbedWash} 100%)`,
          opacity: cfg.opacity,
          mixBlendMode: 'color',
        }}
      />

      {/* 2. Soft-Light Aqua Luminosity Gradient Wash for Rich Depth */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 110% 85% at 50% 75%, ${cfg.deepRiverWash} 0%, ${cfg.skyWash} 55%, transparent 90%)`,
          opacity: cfg.opacity * 0.75,
          mixBlendMode: 'soft-light',
        }}
      />

      {/* 3. Sacred River Currents & Luminous Water Shimmer Waves */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3/5 pointer-events-none overflow-hidden"
        style={{ opacity: cfg.shimmerOpacity }}
      >
        {/* River Horizon Ambient Water Pulse Glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-full anim-river-pulse pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 95% 55% at 50% 85%, rgba(6, 182, 212, 0.45) 0%, rgba(14, 165, 233, 0.28) 50%, transparent 80%)',
          }}
        />

        {/* Animated Sacred Flowing River Wave Ribbon 1 */}
        <div
          className="absolute bottom-8 -left-[10%] -right-[10%] h-36 anim-river-wave-1 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(103, 232, 249, 0.30) 25%, rgba(6, 182, 212, 0.42) 50%, rgba(14, 165, 233, 0.25) 75%, transparent 100%)',
            filter: 'blur(3px)',
            transform: 'skewY(-1.2deg)',
          }}
        />

        {/* Animated Sacred Flowing River Wave Ribbon 2 */}
        <div
          className="absolute bottom-0 -left-[10%] -right-[10%] h-48 anim-river-wave-2 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.26) 30%, rgba(6, 182, 212, 0.45) 60%, rgba(2, 132, 199, 0.32) 85%, transparent 100%)',
            filter: 'blur(4px)',
            transform: 'skewY(1deg)',
          }}
        />
      </div>
    </div>
  );
}

function StageAtmosphericParticles({ stageId }: { stageId: number }) {
  switch (stageId) {
    case 1:
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Ethereal Mountain Cloud Wisps */}
          <StageOneCloudWisps />
          {/* Morning Mist Particles */}
          {MIST_MOTES.map((mote, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full pointer-events-none ${mote.variant === 1 ? 'anim-mote-1' : 'anim-mote-2'}`}
              style={{
                left: `${mote.x}%`,
                top: `${mote.y}%`,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                backgroundColor: mote.color,
                '--particle-opacity': mote.opacity,
                opacity: mote.opacity,
                boxShadow: `0 0 3px ${mote.color}`,
                animationDuration: `${mote.dur}s`,
                animationDelay: `${mote.delay}s`,
              } as CustomCSSProperties}
            />
          ))}
        </div>
      );
    case 2:
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {FALLING_SNOWFLAKES.map((flake, idx) => {
            const animClass =
              flake.variant === 1 ? 'anim-snow-1' : flake.variant === 2 ? 'anim-snow-2' : 'anim-snow-3';
            return (
              <div
                key={idx}
                className={`absolute rounded-full bg-white pointer-events-none ${animClass}`}
                style={{
                  left: `${flake.x}%`,
                  top: 0,
                  width: `${flake.size}px`,
                  height: `${flake.size}px`,
                  '--particle-opacity': flake.opacity,
                  opacity: flake.opacity,
                  filter: flake.size > 2.8 ? 'blur(0.5px)' : undefined,
                  boxShadow:
                    flake.size > 2.2
                      ? '0 0 4px rgba(255, 255, 255, 0.9)'
                      : '0 0 2px rgba(255, 255, 255, 0.6)',
                  animationDuration: `${flake.dur}s`,
                  animationDelay: `${flake.delay}s`,
                } as CustomCSSProperties}
              />
            );
          })}
        </div>
      );
    case 3:
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Sacred Ascetic Heat Waves & Motion Blur */}
          <StageThreeHeatDistortion />
          {/* Sacred Golden Enlightenment Sparks */}
          {GOLDEN_SPARKS.map((spark, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full pointer-events-none ${spark.variant === 1 ? 'anim-golden-1' : 'anim-golden-2'}`}
              style={{
                left: `${spark.x}%`,
                bottom: `${spark.y}%`,
                width: `${spark.size}px`,
                height: `${spark.size}px`,
                backgroundColor: spark.color,
                '--particle-opacity': spark.opacity,
                opacity: spark.opacity,
                boxShadow: `0 0 5px ${spark.color}`,
                animationDuration: `${spark.dur}s`,
                animationDelay: `${spark.delay}s`,
              } as CustomCSSProperties}
            />
          ))}
        </div>
      );
    case 4:
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {BLOSSOM_PETALS.map((petal, idx) => (
            <div
              key={idx}
              className={`absolute pointer-events-none ${petal.variant === 1 ? 'anim-petal-1' : 'anim-petal-2'}`}
              style={{
                left: `${petal.x}%`,
                top: 0,
                width: `${petal.size}px`,
                height: `${petal.size * 0.65}px`,
                borderRadius: '65% 15% 65% 15%',
                backgroundColor: petal.color,
                '--particle-opacity': petal.opacity,
                opacity: petal.opacity,
                boxShadow: '0 0 4px rgba(244, 114, 182, 0.35)',
                animationDuration: `${petal.dur}s`,
                animationDelay: `${petal.delay}s`,
              } as CustomCSSProperties}
            />
          ))}
        </div>
      );
    case 5:
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {LANTERN_EMBERS.map((ember, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full pointer-events-none ${ember.variant === 1 ? 'anim-ember-1' : 'anim-ember-2'}`}
              style={{
                left: `${ember.x}%`,
                bottom: `${ember.y}%`,
                width: `${ember.size}px`,
                height: `${ember.size}px`,
                backgroundColor: ember.color,
                '--particle-opacity': ember.opacity,
                opacity: ember.opacity,
                boxShadow: `0 0 5px ${ember.color}`,
                animationDuration: `${ember.dur}s`,
                animationDelay: `${ember.delay}s`,
              } as CustomCSSProperties}
            />
          ))}
        </div>
      );
    case 6:
      return <GlowingStarField stars={NIGHT_STARS_STAGE_6} defaultGlow="rgba(165, 243, 252, 0.85)" />;
    case 7:
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {BAMBOO_LEAVES.map((leaf, idx) => (
            <div
              key={idx}
              className={`absolute pointer-events-none ${leaf.variant === 1 ? 'anim-petal-1' : 'anim-petal-2'}`}
              style={{
                left: `${leaf.x}%`,
                top: 0,
                width: `${leaf.size}px`,
                height: `${leaf.size * 0.42}px`,
                borderRadius: '15% 85% 15% 85%',
                backgroundColor: leaf.color,
                '--particle-opacity': leaf.opacity,
                opacity: leaf.opacity,
                boxShadow: '0 0 4px rgba(34, 211, 238, 0.45)',
                animationDuration: `${leaf.dur}s`,
                animationDelay: `${leaf.delay}s`,
              } as CustomCSSProperties}
            />
          ))}
        </div>
      );
    case 8:
      return <GlowingStarField stars={NIGHT_STARS_STAGE_8} defaultGlow="rgba(216, 180, 254, 0.85)" />;
    case 9:
      return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Celestial Falling Snowflakes for the Final Snow Stage */}
          {STAGE_9_SNOWFLAKES.map((flake, idx) => {
            const animClass =
              flake.variant === 1 ? 'anim-snow-1' : flake.variant === 2 ? 'anim-snow-2' : 'anim-snow-3';
            return (
              <div
                key={`snow-${idx}`}
                className={`absolute rounded-full bg-white pointer-events-none ${animClass}`}
                style={{
                  left: `${flake.x}%`,
                  top: 0,
                  width: `${flake.size}px`,
                  height: `${flake.size}px`,
                  '--particle-opacity': flake.opacity,
                  opacity: flake.opacity,
                  filter: flake.size > 2.8 ? 'blur(0.5px)' : undefined,
                  boxShadow: '0 0 4px rgba(255, 255, 255, 0.7)',
                  animationDuration: `${flake.dur}s`,
                  animationDelay: `${flake.delay}s`,
                } as CustomCSSProperties}
              />
            );
          })}
          {/* Radiant Transcendental Spirit Motes */}
          {SPIRIT_MOTES.map((spirit, idx) => (
            <div
              key={`spirit-${idx}`}
              className={`absolute rounded-full pointer-events-none ${spirit.variant === 1 ? 'anim-golden-1' : 'anim-golden-2'}`}
              style={{
                left: `${spirit.x}%`,
                bottom: `${spirit.y}%`,
                width: `${spirit.size}px`,
                height: `${spirit.size}px`,
                backgroundColor: spirit.color,
                '--particle-opacity': spirit.opacity,
                opacity: spirit.opacity,
                boxShadow: `0 0 7px ${spirit.color}`,
                animationDuration: `${spirit.dur}s`,
                animationDelay: `${spirit.delay}s`,
              } as CustomCSSProperties}
            />
          ))}
        </div>
      );
    default:
      return null;
  }
}


const STAGE_THEMES: Record<number, StageTheme> = {
  // Stage 1: The Brahmin’s Cage - Crisp Pale Morning Mist & Green Bamboo Dawn
  1: {
    isNight: false,
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
  // Stage 2: The Samana Trials - Frosty Himalayan Winter of Asceticism & Desaturated Snow
  2: {
    isWinter: true,
    isNight: false,
    skyGradient: ['#eef3f8', '#dfe8f1', '#cfdce8', '#b8cadc'],
    farMountain: '#8b9cb0',
    midMountain: '#5c6f84',
    slopeMountain: '#3b4b5e',
    fogColor: '#e2e8f0',
    fogOpacity: 0.32,
    celestial: { cx: 340, cy: 75, r: 38, fill: '#ffffff', glow: '#dbeafe', opacity: 0.90 },
    sparkleColor: '#ffffff',
    waterColor: '#cfdce8',
  },
  // Stage 3: Confronting the Buddha - Sacred Golden Enlightenment Radiance
  3: {
    isNight: false,
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
    isNight: false,
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
  // Stage 5: Rich Man (Greed) - Opulent Gilded Cinnabar Marketplace & Gilded Sunset
  5: {
    isNight: false,
    skyGradient: ['#fff7ed', '#ffedd5', '#fed7aa', '#ea580c'],
    farMountain: '#d49b78',
    midMountain: '#b8724e',
    slopeMountain: '#9c5a38',
    fogColor: '#f97316',
    fogOpacity: 0.16,
    celestial: { cx: 780, cy: 85, r: 44, fill: '#fffbeb', glow: '#f59e0b', opacity: 0.85 },
    sparkleColor: '#fde047',
    waterColor: '#b8724e',
  },
  // Stage 6: The River of Rebirth (The Dark Night of the Soul) - Radiant Sapphire Midnight & Moonlit Waters
  6: {
    isNight: true,
    skyGradient: ['#162544', '#203762', '#314e86', '#1a2e54'],
    farMountain: '#253b66',
    midMountain: '#1d3055',
    slopeMountain: '#152544',
    fogColor: '#a5b4fc',
    fogOpacity: 0.24,
    celestial: { cx: 480, cy: 70, r: 44, fill: '#ffffff', glow: '#c7d2fe', opacity: 0.98 },
    sparkleColor: '#c7d2fe',
    waterColor: '#253b66',
  },
  // Stage 7: The Ferryman’s Disciple - Sacred Flowing Aqua River & Eternal Current
  7: {
    isNight: false,
    skyGradient: ['#e0f7fa', '#b2ebf2', '#67e8f9', '#06b6d4'],
    farMountain: '#0284c7',
    midMountain: '#0369a1',
    slopeMountain: '#075985',
    fogColor: '#00e5ff',
    fogOpacity: 0.32,
    celestial: { cx: 280, cy: 95, r: 48, fill: '#ecfeff', glow: '#22d3ee', opacity: 0.90 },
    sparkleColor: '#38bdf8',
    waterColor: '#0284c7',
  },
  // Stage 8: The Wound of Love - Celestial Amethyst Twilight Night & Solitary Moon
  8: {
    isNight: true,
    skyGradient: ['#2b1f42', '#3c2b5c', '#533c7c', '#2f2149'],
    farMountain: '#463268',
    midMountain: '#392756',
    slopeMountain: '#2c1c44',
    fogColor: '#d8b4fe',
    fogOpacity: 0.22,
    celestial: { cx: 640, cy: 75, r: 42, fill: '#ffffff', glow: '#e9d5ff', opacity: 0.96 },
    sparkleColor: '#e9d5ff',
    waterColor: '#392756',
  },
  // Stage 9: The Eternal Flow (The Eternal Glow) - Radiant Celestial Winter Snow & Ultimate Oneness
  9: {
    isWinter: true,
    isNight: false,
    skyGradient: ['#f8fafc', '#edf2f7', '#dbeafe', '#b8cadc'],
    farMountain: '#8094aa',
    midMountain: '#586e85',
    slopeMountain: '#3a4e63',
    fogColor: '#f1f5f9',
    fogOpacity: 0.35,
    celestial: { cx: 885, cy: 80, r: 56, fill: '#ffffff', glow: '#dbeafe', opacity: 0.98 },
    sparkleColor: '#ffffff',
    waterColor: '#cfdce8',
  },
};

/* Incense Burner Component with smoking wisps and candle placed within the container */
function IncenseBurner({ active }: { active: boolean }) {
  return (
    <div className="relative w-8 h-9 flex items-end justify-center select-none">
      <svg className="w-8 h-9 overflow-visible" viewBox="0 0 32 30" fill="none">
        {/* Animated Smoke Wisps when active */}
        {active && (
          <g className="pointer-events-none">
            <path
              d="M16 6 C14 2, 18 -2, 15 -6 C13 -10, 17 -13, 15 -17"
              stroke="rgba(120, 113, 108, 0.55)"
              strokeWidth="1.3"
              strokeLinecap="round"
              className="smoke-curl-1"
            />
            <path
              d="M17 5 C19 1, 15 -3, 17 -7 C19 -11, 16 -14, 18 -18"
              stroke="rgba(140, 130, 122, 0.45)"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="smoke-curl-2"
            />
          </g>
        )}

        {/* 1. Tripod Feet & Handles (Back Layer) */}
        <path d="M8 21 L6.5 26" stroke={active ? "#574839" : "#78716c"} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M24 21 L25.5 26" stroke={active ? "#574839" : "#78716c"} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 22 L16 26.5" stroke={active ? "#4a3c2e" : "#57534e"} strokeWidth="2.2" strokeLinecap="round" />
        {/* Handles */}
        <path d="M4 15 C1.5 15, 1.5 18.5, 5 19.5" stroke={active ? "#695847" : "#8c857e"} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M28 15 C30.5 15, 30.5 18.5, 27 19.5" stroke={active ? "#695847" : "#8c857e"} strokeWidth="1.6" strokeLinecap="round" fill="none" />

        {/* 2. Vessel Interior & Ash / Sand Bed */}
        <ellipse cx="16" cy="15" rx="10.5" ry="5.5" fill={active ? "#423427" : "#57534e"} />
        <ellipse cx="16" cy="15.2" rx="9" ry="4" fill={active ? "#594838" : "#6b6560"} />

        {/* 3. Incense Stick / Candle (Planted deep inside the container) */}
        <rect
          x="15"
          y="8"
          width="2"
          height="9"
          rx="1"
          fill={active ? "#7c2d12" : "#a8a29e"}
          className="transition-colors duration-500"
        />

        {/* 4. Vessel Front Belly & Rim (Covers the lower base of the candle/stick) */}
        <path
          d="M5.5 15 C5.5 22.5, 26.5 22.5, 26.5 15 Z"
          fill={active ? "#6d5b4a" : "#8a837c"}
          stroke={active ? "#544537" : "#716b64"}
          strokeWidth="0.8"
        />
        {/* Front Rim Curved Highlight */}
        <path
          d="M5.5 15 C8.5 19, 23.5 19, 26.5 15"
          stroke={active ? "#8f7c68" : "#aba59e"}
          strokeWidth="1.4"
          fill="none"
        />

        {/* 5. Glowing Candle Flame / Ember (At the top of the stick) */}
        {active ? (
          <g className="transition-opacity duration-300">
            {/* Ambient Flame Halo */}
            <circle cx="16" cy="7.5" r="4.5" fill="#f59e0b" opacity="0.4" filter="blur(1px)" className="animate-pulse" />
            {/* Teardrop Flame */}
            <path
              d="M16 3.5 C14.6 6, 14.5 7.5, 15 8.5 C15.5 9.2, 16.5 9.2, 17 8.5 C17.5 7.5, 17.4 6, 16 3.5 Z"
              fill="#fbbf24"
              className="animate-pulse"
            />
            {/* Intense Flame Core */}
            <ellipse cx="16" cy="7.8" rx="0.9" ry="1.4" fill="#fffbeb" />
          </g>
        ) : (
          /* Burnt Out Cold Wick */
          <line x1="16" y1="7" x2="16" y2="8" stroke="#44403c" strokeWidth="1.2" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

// Realm icons for stage announcement banner (Body, Mind, Spirit)
function RealmBannerIcon({ realm }: { realm: string }) {
  switch (realm) {
    case 'BODY':
      return (
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-300 animate-pulse shrink-0"
        >
          {/* Contemplative Human Body in Lotus Posture */}
          <circle cx="12" cy="5" r="2.2" />
          <path d="M12 7.5v6.5" />
          <path d="M7.5 14l4.5-2 4.5 2" />
          <path d="M5.5 19.5c2-2 4-2.5 6.5-2.5s4.5.5 6.5 2.5" />
        </svg>
      );
    case 'MIND':
      return <Brain size={16} className="text-amber-300 animate-pulse shrink-0" strokeWidth={2.2} />;
    case 'SPIRIT':
      return <Wind size={16} className="text-amber-300 animate-pulse shrink-0" strokeWidth={2.2} />;
    default:
      return <Wind size={16} className="text-amber-300 animate-pulse shrink-0" strokeWidth={2.2} />;
  }
}

function isBrowserFullscreen(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const doc = document as any;
  const hasHtmlFullscreen = Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
  let isDisplayModeFs = false;
  try {
    isDisplayModeFs = window.matchMedia('(display-mode: fullscreen)').matches;
  } catch (e) {
    // ignore
  }
  const isScreenFs =
    Math.abs(window.screen.height - window.innerHeight) <= 4 &&
    Math.abs(window.screen.width - window.innerWidth) <= 4;

  return hasHtmlFullscreen || isDisplayModeFs || isScreenFs;
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
  const [isFullscreen, setIsFullscreen] = useState(() => isBrowserFullscreen());
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleToggleMute = useCallback(() => {
    const next = toggleMute();
    setIsMuted(next);
  }, []);

  const handleToggleFullscreen = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const doc = document as any;
    const docEl = document.documentElement as any;
    const currentlyFs = isBrowserFullscreen();

    if (!currentlyFs) {
      const requestMethod =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.webkitRequestFullScreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;

      if (requestMethod) {
        try {
          const promise = requestMethod.call(docEl);
          if (promise && typeof promise.then === 'function') {
            promise
              .then(() => {
                setIsFullscreen(true);
              })
              .catch((err: any) => {
                console.error('Browser requestFullscreen rejected:', err);
                setIsFullscreen(false);
                alert('Chrome could not enter fullscreen mode (' + (err?.message || err) + ').\n\nPlease press F11 directly on your keyboard to toggle fullscreen.');
              });
          } else {
            setIsFullscreen(true);
          }
        } catch (err: any) {
          console.error('Browser requestFullscreen threw:', err);
          setIsFullscreen(false);
          alert('Chrome could not enter fullscreen mode (' + (err?.message || err) + ').\n\nPlease press F11 directly on your keyboard to toggle fullscreen.');
        }
      } else {
        alert('Fullscreen API not supported in this browser. Please press F11 on your keyboard.');
      }
    } else {
      const exitMethod =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.webkitCancelFullScreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;

      const hasHtmlFs = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (hasHtmlFs && exitMethod) {
        try {
          const promise = exitMethod.call(doc);
          if (promise && typeof promise.then === 'function') {
            promise
              .then(() => setIsFullscreen(false))
              .catch(() => setIsFullscreen(false));
          } else {
            setIsFullscreen(false);
          }
        } catch (err) {
          setIsFullscreen(false);
        }
      } else {
        setIsFullscreen(false);
      }
    }
  }, []);

  // Listen for browser fullscreen changes across all vendor prefixes and window resize (e.g. F11 pressed in Chrome)
  useEffect(() => {
    const handleSyncFullscreen = () => {
      setIsFullscreen(isBrowserFullscreen());
    };

    document.addEventListener('fullscreenchange', handleSyncFullscreen);
    document.addEventListener('webkitfullscreenchange', handleSyncFullscreen);
    document.addEventListener('mozfullscreenchange', handleSyncFullscreen);
    document.addEventListener('MSFullscreenChange', handleSyncFullscreen);
    window.addEventListener('resize', handleSyncFullscreen);

    let mql: MediaQueryList | null = null;
    try {
      mql = window.matchMedia('(display-mode: fullscreen)');
      if (mql && mql.addEventListener) {
        mql.addEventListener('change', handleSyncFullscreen);
      }
    } catch (e) {
      // ignore
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleSyncFullscreen);
      document.removeEventListener('webkitfullscreenchange', handleSyncFullscreen);
      document.removeEventListener('mozfullscreenchange', handleSyncFullscreen);
      document.removeEventListener('MSFullscreenChange', handleSyncFullscreen);
      window.removeEventListener('resize', handleSyncFullscreen);
      if (mql && mql.removeEventListener) {
        mql.removeEventListener('change', handleSyncFullscreen);
      }
    };
  }, []);

  // Native capture-phase click listener for fullscreen buttons to ensure pristine user activation
  useEffect(() => {
    const handleNativeFullscreenClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const btn = target.closest('[data-fullscreen-btn="true"]');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      const doc = document as any;
      const docEl = document.documentElement as any;
      const isFs = isBrowserFullscreen();

      if (!isFs) {
        const req =
          docEl.requestFullscreen ||
          docEl.webkitRequestFullscreen ||
          docEl.mozRequestFullScreen ||
          docEl.msRequestFullscreen;

        if (req) {
          try {
            req.call(docEl).then(() => {
              setIsFullscreen(true);
            }).catch((err: any) => {
              console.warn('Native requestFullscreen error:', err);
              setIsFullscreen(false);
            });
          } catch (err) {
            console.warn('Native requestFullscreen sync error:', err);
          }
        }
      } else {
        const exit =
          doc.exitFullscreen ||
          doc.webkitExitFullscreen ||
          doc.mozCancelFullScreen ||
          doc.msExitFullscreen;

        if (exit) {
          try {
            exit.call(doc).then(() => {
              setIsFullscreen(false);
            }).catch(() => {});
          } catch {}
        }
        setIsFullscreen(false);
      }
    };

    document.addEventListener('click', handleNativeFullscreenClick, true);
    return () => {
      document.removeEventListener('click', handleNativeFullscreenClick, true);
    };
  }, []);

  // Keyboard shortcut: Press 'M' to toggle mute, 'F' or 'F11' to toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
      if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      }
      if (e.key === 'F11') {
        setTimeout(() => {
          setIsFullscreen(isBrowserFullscreen());
        }, 150);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleMute, handleToggleFullscreen]);

  // Start ambient drone at the start screen / main menu
  useEffect(() => {
    // Attempt playback immediately on load
    startDrone();

    // Browser autoplay policy fallback: unlock and start drone on user gesture
    const removeListeners = () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    const handleFirstInteraction = (e: Event) => {
      const target = e.target as Element | null;
      if (target && (target.closest('[data-fullscreen-btn]') || target.closest('button')?.getAttribute('aria-label')?.toLowerCase().includes('fullscreen'))) {
        return;
      }
      startDrone();
      removeListeners();
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });

    return removeListeners;
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

    if (e.key === 'Escape') {
      if (selectedLoreStage) {
        handleCloseLore();
        return;
      }
    }

    if (e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) {
      e.preventDefault();
      advanceToNextStage();
      return;
    }

    if (e.key === 'ArrowUp') handleInput('up');
    if (e.key === 'ArrowDown') handleInput('down');
  }, [advanceToNextStage, handleInput, selectedLoreStage, handleCloseLore]);

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
        if (
          button.disabled ||
          button.getAttribute('data-tone-button') === 'true' ||
          button.getAttribute('data-fullscreen-btn') === 'true' ||
          button.getAttribute('aria-label')?.toLowerCase().includes('fullscreen') ||
          button.getAttribute('aria-disabled') === 'true'
        ) {
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
    <div className={`select-none transition-all duration-300 ${
      isFullscreen
        ? 'fixed inset-0 z-50 w-screen h-screen bg-[#12151c] flex flex-col items-center justify-center p-0 m-0 overflow-hidden'
        : 'relative min-h-screen bg-twilight-zen flex flex-col items-center justify-center p-0 sm:p-3 md:p-4 overflow-hidden'
    }`}>
      
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
      <div className={`relative z-10 w-full flex flex-col items-center transition-all duration-300 ${
        isFullscreen ? 'max-w-none h-full w-full justify-center p-0 m-0' : 'max-w-[1240px] px-0 sm:px-2 md:px-4'
      }`}>
        
        {/* Game Area Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`w-full flex flex-col items-center justify-between min-h-0 relative overflow-hidden shadow-2xl p-0 transition-all duration-300 ${
            isFullscreen ? 'rounded-none border-none h-full min-h-screen w-full' : 'rounded-none sm:rounded-[2rem] md:rounded-[2.5rem] border border-stone-800/30'
          }`}
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
              {/* Wide Ambient Moonlight Wash (Exclusive to Night stages for gentle landscape illumination) */}
              {currentTheme.isNight && (
                <div
                  className="rounded-full blur-3xl pointer-events-none"
                  style={{
                    width: `${currentTheme.celestial.r * 9.5}px`,
                    height: `${currentTheme.celestial.r * 9.5}px`,
                    backgroundColor: currentTheme.celestial.glow,
                    opacity: 0.32,
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transition: 'width 1.2s ease-in-out, height 1.2s ease-in-out, background-color 1.2s ease-in-out, opacity 1.2s ease-in-out',
                  }}
                />
              )}

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
              className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none z-0 transition-all duration-1000"
              style={{
                mixBlendMode: 'multiply',
                opacity: currentTheme.isNight ? 0.62 : currentTheme.isWinter ? 0.92 : 0.94,
                filter: currentTheme.isWinter
                  ? 'grayscale(96%) contrast(1.08) brightness(1.03)'
                  : undefined,
              }}
            />

            {/* Atmospheric Stage Color Wash Tint */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-1000 z-0"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.skyGradient[0]} 0%, ${currentTheme.skyGradient[1]} 35%, ${currentTheme.skyGradient[2]} 70%, ${currentTheme.skyGradient[3]} 100%)`,
                opacity: currentTheme.isWinter ? 0.08 : currentTheme.isNight ? 0.18 : 0.22,
                mixBlendMode: 'color',
              }}
            />

            {/* Subtle Horizon Mist / Fog Ribbon */}
            <div
              className="absolute bottom-12 left-0 right-0 h-16 pointer-events-none blur-lg transition-all duration-1000 z-0"
              style={{
                backgroundColor: currentTheme.fogColor,
                opacity: currentTheme.fogOpacity,
              }}
            />

            {/* Stage-Specific Subtle Ambient Particle Effects (Falling Snow, clouds, petals, embers, fireflies, etc.) */}
            <StageAtmosphericParticles stageId={currentStage.id} />

            {/* Stage 7: The Ferryman’s Disciple - Dedicated Aqua Blue River Atmosphere Overlay */}
            {currentStage.id === 7 && <StageSevenAquaRiverOverlay />}
          </div>
          
          {!isPlaying ? (
            /* Intro / Start Journey Screen in Zen Aesthetic */
            <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8 sm:py-10 px-6 sm:px-8 text-center max-w-md space-y-6 bg-[#fbf9f4]/90 backdrop-blur-md rounded-3xl m-4 sm:m-8 border border-[#e4decb] shadow-2xl">
              
              {/* Fullscreen Toggle Button on Intro Screen */}
              <button
                type="button"
                data-fullscreen-btn="true"
                onClick={handleToggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen (F / F11)" : "Enter Fullscreen (F / F11)"}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                className="absolute top-4 right-4 py-1.5 px-2.5 rounded-xl transition-all border cursor-pointer active:scale-95 flex items-center space-x-1.5 shadow-sm bg-stone-200/70 hover:bg-stone-300/80 text-stone-700 hover:text-stone-900 border-stone-300/80 z-20"
              >
                {isFullscreen ? (
                  <>
                    <Minimize size={14} className="text-stone-800" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-serif-zen">Window (F11)</span>
                  </>
                ) : (
                  <>
                    <Maximize size={14} className="text-stone-800" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-serif-zen">Full Screen (F11)</span>
                  </>
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
                  Siddhartha's Journey
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-1 mb-2 tracking-tight font-serif-zen">
                  Attune
                </h1>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed px-2 font-serif-zen">
                  Travel the 9 circles of <strong className="text-stone-900">Mind</strong>, <strong className="text-stone-900">Body</strong>, and <strong className="text-stone-900">Spirit</strong>. Solve 3 tone puzzles at each stage (27 in total) to reach Enlightenment and Oneness.
                </p>
                <div className="text-[11px] text-stone-500 italic mt-3 font-serif-zen">
                  Stage 1 begins with a tutorial and single-tone repetitions. Each successive stage broadens the number of notes used.
                </div>
              </div>

              <div className="w-full pt-2 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={startGame}
                  className="jade-stone w-full py-3.5 px-6 flex items-center justify-center space-x-2 text-emerald-950 font-bold tracking-wide shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <Play size={18} className="fill-emerald-950/80 text-emerald-950" />
                  <span className="font-serif-zen text-sm font-black tracking-wider uppercase">Begin The Journey</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAboutModal(true)}
                  className="w-full py-2 px-4 flex items-center justify-center space-x-1.5 text-stone-600 hover:text-stone-900 font-bold transition-all text-xs uppercase tracking-wider font-serif-zen cursor-pointer"
                >
                  <BookOpen size={14} />
                  <span>About This Game</span>
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
                  <span className={`text-[10px] sm:text-[11px] tracking-widest uppercase font-bold font-serif-zen whitespace-nowrap transition-colors duration-500 ${
                    currentTheme.isNight ? 'text-amber-200/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : 'text-stone-500'
                  }`}>
                    Current Streak
                  </span>
                  <div className="flex items-baseline space-x-1.5 mt-0.5 whitespace-nowrap">
                    <span className={`font-brush text-3xl sm:text-4xl font-bold leading-none transition-colors duration-500 ${
                      currentTheme.isNight ? 'text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]' : 'text-stone-900'
                    }`}>
                      {streak}
                    </span>
                    <span className={`font-brush text-2xl sm:text-3xl leading-none transition-colors duration-500 ${
                      currentTheme.isNight ? 'text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]' : 'text-stone-800'
                    }`}>
                      道
                    </span>
                    <span className={`text-[11px] font-serif-zen font-semibold ml-1 transition-colors duration-500 ${
                      currentTheme.isNight ? 'text-amber-200/70' : 'text-stone-400'
                    }`}>
                      ({puzzleCount}/27)
                    </span>
                  </div>
                </div>

                {/* Center: Stage Progression Breadcrumb & Title */}
                <div className="flex flex-col items-center text-center justify-self-center px-2">
                  {/* Stages Breadcrumb: BODY ➔ MIND ➔ SPIRIT */}
                  <div className={`flex items-center justify-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-[11.5px] font-serif-zen font-bold tracking-widest uppercase mb-0.5 whitespace-nowrap transition-colors duration-500 ${
                    currentTheme.isNight ? 'text-stone-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : 'text-stone-700'
                  }`}>
                    <span className="opacity-60 text-[9.5px]">STAGES:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full transition-all duration-300 ${
                        currentStage.realm === 'BODY'
                          ? 'bg-[#aed7c4] text-emerald-950 font-black shadow-sm ring-1 ring-emerald-600/30'
                          : currentTheme.isNight ? 'text-stone-300 opacity-80' : 'opacity-70'
                      }`}
                    >
                      BODY
                    </span>
                    <span className={`font-black text-[9px] ${currentTheme.isNight ? 'text-amber-300/70' : 'text-stone-400'}`}>➔</span>
                    <span
                      className={`px-2 py-0.5 rounded-full transition-all duration-300 ${
                        currentStage.realm === 'MIND'
                          ? 'bg-[#aed7c4] text-emerald-950 font-black shadow-sm ring-1 ring-emerald-600/30'
                          : currentTheme.isNight ? 'text-stone-300 opacity-80' : 'opacity-70'
                      }`}
                    >
                      MIND
                    </span>
                    <span className={`font-black text-[9px] ${currentTheme.isNight ? 'text-amber-300/70' : 'text-stone-400'}`}>➔</span>
                    <span
                      className={`px-2 py-0.5 rounded-full transition-all duration-300 ${
                        currentStage.realm === 'SPIRIT'
                          ? 'bg-[#aed7c4] text-emerald-950 font-black shadow-sm ring-1 ring-emerald-600/30'
                          : currentTheme.isNight ? 'text-stone-300 opacity-80' : 'opacity-70'
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
                    <span
                      style={{ paddingTop: '100px' }}
                      className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] block font-serif-zen whitespace-nowrap transition-colors duration-500 pt-[100px] ${
                        currentTheme.isNight ? 'text-emerald-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]' : 'text-[#34705a]'
                      }`}
                    >
                      {currentStage.realm} • STAGE {currentStage.id}
                    </span>
                    <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight font-serif-zen transition-colors duration-500 whitespace-nowrap ${
                      currentTheme.isNight
                        ? 'text-amber-100 group-hover:text-amber-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]'
                        : 'text-stone-900 group-hover:text-emerald-900'
                    }`}>
                      {currentStage.name}
                    </h2>
                    <div className="text-[11px] sm:text-[14.5px] font-serif-zen tracking-widest flex items-center justify-center space-x-2 whitespace-nowrap">
                      <span className={`font-bold uppercase transition-colors duration-500 ${
                        currentTheme.isNight ? 'text-amber-200/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]' : 'text-stone-700'
                      }`}>
                        ({currentStage.subtitle})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Fullscreen, Mute Button, Lore Button & Three Incense Burners (Strikes) */}
                <div className="flex items-center justify-end space-x-2 sm:space-x-2.5 justify-self-end shrink-0">
                  {/* Fullscreen Toggle Button */}
                  <button
                    type="button"
                    data-fullscreen-btn="true"
                    onClick={handleToggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen (F / F11)" : "Full Screen (F / F11)"}
                    aria-label={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
                    className={`p-1.5 rounded-xl transition-all border cursor-pointer active:scale-95 flex items-center justify-center shadow-sm ${
                      currentTheme.isNight
                        ? 'bg-stone-900/70 hover:bg-stone-800/80 text-amber-100 border-stone-700/60'
                        : 'bg-stone-200/50 hover:bg-stone-300/50 text-stone-600 hover:text-stone-800 border-stone-300/60'
                    }`}
                  >
                    {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                  </button>

                  {/* Mute Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    title={isMuted ? "Unmute drone (M)" : "Mute drone (M)"}
                    aria-label={isMuted ? "Unmute ambient drone" : "Mute ambient drone"}
                    className={`p-1.5 rounded-xl transition-all border cursor-pointer active:scale-95 flex items-center justify-center shadow-sm ${
                      isMuted
                        ? 'bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border-amber-300/80 ring-1 ring-amber-400/40'
                        : currentTheme.isNight
                          ? 'bg-stone-900/70 hover:bg-stone-800/80 text-amber-100 border-stone-700/60'
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
                    className={`p-1.5 rounded-xl transition-all border cursor-pointer active:scale-95 flex items-center space-x-1 shadow-sm whitespace-nowrap ${
                      currentTheme.isNight
                        ? 'bg-stone-900/70 hover:bg-stone-800/80 text-amber-100 border-stone-700/60'
                        : 'bg-stone-200/50 hover:bg-stone-300/50 text-stone-600 hover:text-stone-800 border-stone-300/60'
                    }`}
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
                      <RealmBannerIcon realm={stageCelebration.realm} />
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
                    You solved all 27 puzzles across Body, Mind, and Spirit, attaining ultimate oneness.
                  </p>
                  <p className="text-stone-500 mb-5 text-[11px] italic font-serif-zen">
                    "Everything is sacred, time is a construct, and love is the most important force."
                  </p>
                  <div className="flex flex-col space-y-2 w-full">
                    <button
                      onClick={continueCycle}
                      className="jade-stone w-full py-2.5 text-emerald-950 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider font-serif-zen shadow-md"
                    >
                      Reincarnate (Play Again)
                    </button>
                    <button
                      onClick={() => setShowAboutModal(true)}
                      className="w-full py-2.5 bg-stone-200/80 hover:bg-stone-300 text-stone-700 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider font-serif-zen"
                    >
                      About This Game
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* About This Game Modal */}
          <AnimatePresence>
            {showAboutModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowAboutModal(false);
                }}
                className="absolute inset-0 z-50 bg-stone-900/65 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-left"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  className="washi-card rounded-3xl p-6 sm:p-7 max-w-sm w-full relative shadow-2xl overflow-y-auto max-h-[90vh]"
                >
                  <button
                    onClick={() => setShowAboutModal(false)}
                    aria-label="Close About This Game"
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#34705a] mb-1 font-serif-zen">
                    Attune • Siddhartha's Journey
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 font-serif-zen mb-3">
                    About This Game
                  </h3>

                  <div className="space-y-3 text-xs leading-relaxed text-stone-700 font-serif-zen">
                    <div>
                      <strong className="text-stone-900 uppercase tracking-wider text-[10px] block mb-0.5">
                        The Inspiration
                      </strong>
                      <p>
                        Adapted from Hermann Hesse's 1922 spiritual classic <em>Siddhartha</em>, Attune is a meditative audio-visual pitch attunement journey exploring the seeker's quest across three realms of existence.
                      </p>
                    </div>

                    <div>
                      <strong className="text-[#a93226] uppercase tracking-wider text-[10px] block mb-0.5">
                        The Three Realms
                      </strong>
                      <p>
                        Travel through 9 symbolic stages across 27 tone puzzles:
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-600 text-[11px]">
                        <li><strong className="text-stone-800">Body (Stages 1–3):</strong> The Brahmin’s Cage, The Samana Trials, Confronting the Buddha.</li>
                        <li><strong className="text-stone-800">Mind (Stages 4–6):</strong> The Garden of Kamala, Rich Man (Greed), The River of Rebirth.</li>
                        <li><strong className="text-stone-800">Spirit (Stages 7–9):</strong> The Ferryman’s Disciple, The Wound of Love, The Eternal Flow.</li>
                      </ul>
                    </div>

                    <div>
                      <strong className="text-[#275d49] uppercase tracking-wider text-[10px] block mb-0.5">
                        The Lesson
                      </strong>
                      <p className="font-semibold text-stone-900 italic">
                        "Everything is sacred, time is a construct, and love is the most important force."
                      </p>
                    </div>

                    <div className="pt-1 text-[10px] text-stone-500 border-t border-stone-200">
                      Created with reverence by Quadratic Games.
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAboutModal(false)}
                    className="jade-stone mt-5 w-full py-2.5 text-emerald-950 font-bold rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wider font-serif-zen shadow-sm"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>

    </div>
  );
}