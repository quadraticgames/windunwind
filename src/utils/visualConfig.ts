/**
 * ============================================================================
 * VISUAL EFFECTS & PARTICLE CONFIGURATION
 * ============================================================================
 * Edit this file to customize visual effects, particle densities, and movement
 * randomness across all 9 stages in Attune / Siddhartha's Journey.
 *
 * All particle systems dynamically update based on these settings.
 */

// ----------------------------------------------------------------------------
// 1. GLOBAL VISUAL TUNING (Quick Adjustments)
// ----------------------------------------------------------------------------

export const GLOBAL_VISUAL_CONFIG = {
  /**
   * Density Multiplier across all particle systems:
   * 1.0 = Default current density
   * 2.0 = Double density
   * 0.5 = Half density
   * 0.0 = Disable particles
   */
  densityMultiplier: 2.0,

  /**
   * Movement Randomness Intensity:
   * Controls horizontal sway variance, velocity jitter, and trajectory chaos.
   * 0.0 = Uniform, mechanical movement
   * 1.0 = Balanced organic movement
   * 2.0 = Highly turbulent, unpredictable drift
   */
  movementRandomness: 2.0,

  /**
   * Global Animation Speed Multiplier:
   * 1.0 = Normal serene speed
   * 0.5 = Dreamy, slow-motion flow
   * 2.0 = Fast, energetic flow
   */
  speedMultiplier: 1.0,

  /**
   * Global Particle Size Multiplier:
   * 1.0 = Normal size
   * 1.5 = 50% larger particles
   * 0.75 = 25% smaller, subtler particles
   */
  sizeMultiplier: 1.0,
};

// ----------------------------------------------------------------------------
// 2. PER-STAGE PARTICLE & MOVEMENT CONFIGURATION
// ----------------------------------------------------------------------------

export const STAGE_PARTICLE_CONFIG = {
  // Stage 1: The Brahmin’s Cage - Morning Mist & Ethereal Cloud Wisps
  stage1: {
    mistMotes: {
      baseCount: 30, // Number of floating mist particles
      sizeRange: [1.7, 3.2] as [number, number],
      opacityRange: [0.45, 0.70] as [number, number],
      durationRange: [7.2, 11.0] as [number, number], // in seconds
      movementRandomness: 1.0,
      colors: ['#bbf7d0', '#fef3c7', '#e2f5ec'],
    },
    cloudWisps: {
      count: 9, // Number of drifting horizontal cloud wisps
      widthRange: [260, 420] as [number, number], // px width (less width, more compact)
      heightRange: [120, 185] as [number, number], // px height (much fatter, plump curved silhouettes)
      opacityRange: [0.55, 0.82] as [number, number], // clearly visible ethereal wisps
      durationRange: [22, 34] as [number, number], // drift duration in seconds for graceful transit
      blurRange: [1.5, 3.5] as [number, number], // gentle Gaussian blur preserving curved edges
      movementRandomness: 1.0,
    },
  },

  // Stage 2: The Samana Trials - Frosty Himalayan Winter Falling Snow
  stage2: {
    snowflakes: {
      baseCount: 58, // Total falling snowflakes
      sizeRange: [1.6, 4.2] as [number, number],
      opacityRange: [0.45, 0.92] as [number, number],
      durationRange: [5.0, 9.0] as [number, number], // fall duration in seconds
      movementRandomness: 1.2, // horizontal sway & wobble variance
      swayWidthPx: 28, // max horizontal drift distance in px
    },
  },

  // Stage 3: Confronting the Buddha - Sacred Sparks & Heat Shimmer Motion Blur
  stage3: {
    goldenSparks: {
      baseCount: 24, // Ascending golden enlightenment sparks
      sizeRange: [2.0, 3.6] as [number, number],
      opacityRange: [0.55, 0.85] as [number, number],
      durationRange: [6.5, 9.4] as [number, number],
      movementRandomness: 1.0,
      colors: ['#fef08a', '#fde047', '#f59e0b'],
    },
    heatDistortion: {
      streakCount: 7, // Rising vertical heat plumes
      streakWidthRange: [28, 44] as [number, number],
      streakHeightRange: [210, 300] as [number, number],
      streakDurationRange: [4.4, 5.5] as [number, number],
      hazeBandCount: 4, // Horizontal refraction mirage wave bands
      hazeBandBlurPx: 2.0, // Backdrop filter blur amount in px
      heatCoronaRadiusPx: 260, // Buddha sun halo shimmer size
      movementRandomness: 1.1,
    },
  },

  // Stage 4: The Garden of Kamala - Awakening of Senses Drifting Peach Petals
  stage4: {
    blossomPetals: {
      baseCount: 28, // Drifting peach & lotus blossom petals
      sizeRange: [5.0, 7.2] as [number, number],
      opacityRange: [0.50, 0.75] as [number, number],
      durationRange: [8.0, 10.4] as [number, number],
      movementRandomness: 1.3, // tumbling sway and rotation variation
      colors: ['#fbcfe8', '#fce7f3', '#f472b6'],
    },
  },

  // Stage 5: Rich Man - Opulent Gilded Cinnabar Marketplace Lantern Embers
  stage5: {
    lanternEmbers: {
      baseCount: 24, // Rising warm cinnabar and gold sparks
      sizeRange: [2.0, 3.4] as [number, number],
      opacityRange: [0.65, 0.90] as [number, number],
      durationRange: [6.0, 8.2] as [number, number],
      movementRandomness: 1.1,
      colors: ['#fb923c', '#fb7185', '#fda4af', '#f43f5e'],
    },
  },

  // Stage 6: The River of Rebirth (The Dark Night of the Soul) - Sapphire Night Stars
  stage6: {
    sapphireStars: {
      baseCount: 68, // Twinkling night stars
      sizeRange: [1.3, 4.2] as [number, number],
      opacityRange: [0.50, 0.98] as [number, number],
      durationRange: [2.9, 5.4] as [number, number], // twinkle period in seconds
      movementRandomness: 1.0,
      majorSparkleRatio: 0.15, // Ratio of stars with 4-point diamond sparkle flare
      defaultGlow: 'rgba(165, 243, 252, 0.85)',
    },
  },

  // Stage 7: The Ferryman’s Disciple - Sacred Flowing Aqua River & Bamboo Dew
  stage7: {
    bambooLeaves: {
      baseCount: 24, // Drifting bamboo leaves
      sizeRange: [6.0, 8.2] as [number, number],
      opacityRange: [0.50, 0.70] as [number, number],
      durationRange: [8.6, 10.8] as [number, number],
      movementRandomness: 1.25,
      colors: ['#38bdf8', '#67e8f9', '#22d3ee', '#a7f3d0', '#34d399'], // Aqua river & fresh bamboo jade
    },
    aquaRiverOverlay: {
      enabled: true,
      /**
       * Overall opacity of the aqua river overlay (0.0 to 1.0).
       * Set high for prominent, immersive aqua blue atmosphere.
       */
      opacity: 0.68,
      /**
       * Secondary river current shimmer wave opacity (0.0 to 1.0).
       */
      shimmerOpacity: 0.45,
      /**
       * Aqua gradient wash stops from morning sky down into the deep river current
       */
      skyWash: 'rgba(6, 182, 212, 0.45)',      // Vibrant luminous aqua
      midRiverWash: 'rgba(14, 165, 233, 0.58)', // Rich river cerulean
      deepRiverWash: 'rgba(2, 132, 199, 0.72)', // Flowing river water
      riverbedWash: 'rgba(3, 105, 161, 0.82)',  // Deep meditative river current
      /**
       * Flowing water ripple wave highlight color
       */
      waterRippleColor: 'rgba(103, 232, 249, 0.65)',
    },
  },

  // Stage 8: The Wound of Love - Solitary Amethyst Twilight Glowing Stars
  stage8: {
    amethystStars: {
      baseCount: 64, // Twinkling twilight stars
      sizeRange: [1.3, 4.0] as [number, number],
      opacityRange: [0.50, 0.98] as [number, number],
      durationRange: [2.8, 5.3] as [number, number],
      movementRandomness: 1.0,
      majorSparkleRatio: 0.14,
      defaultGlow: 'rgba(216, 180, 254, 0.85)',
    },
  },

  // Stage 9: The Eternal Flow (The Eternal Glow) - Celestial Winter Snow & Radiant Enlightenment
  stage9: {
    snowflakes: {
      baseCount: 60, // Total falling celestial snowflakes
      sizeRange: [1.8, 4.4] as [number, number],
      opacityRange: [0.55, 0.95] as [number, number],
      durationRange: [4.8, 8.5] as [number, number], // fall duration in seconds
      movementRandomness: 1.25,
      swayWidthPx: 28,
    },
    spiritMotes: {
      baseCount: 22, // Ascending transcendental spirit particles
      sizeRange: [2.0, 3.8] as [number, number],
      opacityRange: [0.55, 0.88] as [number, number],
      durationRange: [6.2, 9.0] as [number, number],
      movementRandomness: 1.2,
      colors: ['#ffffff', '#e0f2fe', '#bae6fd', '#fef08a'],
    },
  },
};

// ----------------------------------------------------------------------------
// 3. TYPES
// ----------------------------------------------------------------------------

export type ParticleItem = {
  x: number;
  y?: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
  variant: 1 | 2 | 3;
  color?: string;
};

export type GlowingStarItem = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
  variant: 1 | 2 | 3;
  isMajor?: boolean;
  color?: string;
  glow?: string;
};

export type CloudWispItem = {
  y: number;
  width: number;
  height: number;
  opacity: number;
  dur: number;
  delay: number;
  variant: 1 | 2 | 3;
  blur: number;
};

export type HeatStreakItem = {
  x: number;
  width: number;
  height: number;
  opacity: number;
  dur: number;
  delay: number;
  variant: 1 | 2;
};

export type HeatHazeBandItem = {
  y: number;
  height: number;
  dur: number;
  delay: number;
  variant: 1 | 2;
};

// ----------------------------------------------------------------------------
// 4. DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR
// ----------------------------------------------------------------------------
// Ensures consistent, flicker-free rendering while enabling dynamic adjustments.

function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

// ----------------------------------------------------------------------------
// 5. PROCEDURAL PARTICLE GENERATORS
// ----------------------------------------------------------------------------

/**
 * Generate Stage 1 Mist Motes
 */
export function getStage1MistMotes(): ParticleItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage1.mistMotes;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(101);
  const items: ParticleItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(3, 97, (i + prng() * 0.8) / count));
    const y = Math.round(lerp(18, 76, prng()));
    const size = +(lerp(cfg.sizeRange[0], cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const speedJitter = lerp(0.85, 1.15, prng() * cfg.movementRandomness * GLOBAL_VISUAL_CONFIG.movementRandomness);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) * speedJitter / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.2, dur * 0.9, prng())).toFixed(1);
    const variant = (prng() > 0.5 ? 2 : 1) as 1 | 2;
    const color = cfg.colors[Math.floor(prng() * cfg.colors.length)];

    items.push({ x, y, size, opacity, dur, delay, variant, color });
  }

  return items;
}

/**
 * Generate Stage 1 Mountain Cloud Wisps
 */
export function getStage1CloudWisps(): CloudWispItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage1.cloudWisps;
  const count = cfg.count;
  const prng = createPRNG(202);
  const items: CloudWispItem[] = [];

  const baseElevations = [8, 16, 26, 36, 48, 58, 68, 78];

  for (let i = 0; i < count; i++) {
    const y = baseElevations[i % baseElevations.length];
    const width = Math.round(lerp(cfg.widthRange[0], cfg.widthRange[1], prng()));
    const height = Math.round(lerp(cfg.heightRange[0], cfg.heightRange[1], prng()));
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const dur = Math.round(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) / GLOBAL_VISUAL_CONFIG.speedMultiplier);
    const delay = +(-lerp(1, dur * 0.9, prng())).toFixed(1);
    const variant = ((i % 3) + 1) as 1 | 2 | 3;
    const blur = Math.round(lerp(cfg.blurRange[0], cfg.blurRange[1], prng()));

    items.push({ y, width, height, opacity, dur, delay, variant, blur });
  }

  return items;
}

/**
 * Generate Stage 2 Falling Snowflakes
 */
export function getStage2Snowflakes(): ParticleItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage2.snowflakes;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(303);
  const items: ParticleItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(2, 98, (i + prng() * 0.85) / count));
    const size = +(lerp(cfg.sizeRange[0], cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const speedJitter = lerp(0.8, 1.2, prng() * cfg.movementRandomness * GLOBAL_VISUAL_CONFIG.movementRandomness);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) * speedJitter / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.3, dur * 0.95, prng())).toFixed(1);
    const randVar = prng();
    const variant = (randVar < 0.35 ? 1 : randVar < 0.7 ? 2 : 3) as 1 | 2 | 3;

    items.push({ x, size, opacity, dur, delay, variant });
  }

  return items;
}

/**
 * Generate Stage 3 Golden Sparks
 */
export function getStage3GoldenSparks(): ParticleItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage3.goldenSparks;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(404);
  const items: ParticleItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(5, 96, (i + prng() * 0.85) / count));
    const y = Math.round(lerp(5, 24, prng()));
    const size = +(lerp(cfg.sizeRange[0], cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const speedJitter = lerp(0.85, 1.15, prng() * cfg.movementRandomness * GLOBAL_VISUAL_CONFIG.movementRandomness);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) * speedJitter / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.5, dur * 0.9, prng())).toFixed(1);
    const variant = (prng() > 0.5 ? 2 : 1) as 1 | 2;
    const color = cfg.colors[Math.floor(prng() * cfg.colors.length)];

    items.push({ x, y, size, opacity, dur, delay, variant, color });
  }

  return items;
}

/**
 * Generate Stage 3 Heat Streaks
 */
export function getStage3HeatStreaks(): HeatStreakItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage3.heatDistortion;
  const count = cfg.streakCount;
  const prng = createPRNG(505);
  const items: HeatStreakItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(8, 92, (i + prng() * 0.7) / count));
    const width = Math.round(lerp(cfg.streakWidthRange[0], cfg.streakWidthRange[1], prng()));
    const height = Math.round(lerp(cfg.streakHeightRange[0], cfg.streakHeightRange[1], prng()));
    const opacity = +(lerp(0.35, 0.48, prng())).toFixed(2);
    const dur = +(lerp(cfg.streakDurationRange[0], cfg.streakDurationRange[1], prng()) / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.6, dur * 0.8, prng())).toFixed(1);
    const variant = (i % 2 === 0 ? 1 : 2) as 1 | 2;

    items.push({ x, width, height, opacity, dur, delay, variant });
  }

  return items;
}

/**
 * Generate Stage 3 Heat Haze Bands
 */
export function getStage3HeatHazeBands(): HeatHazeBandItem[] {
  return [
    { y: 35, height: 120, dur: 4.8 / GLOBAL_VISUAL_CONFIG.speedMultiplier, delay: -0.6, variant: 1 },
    { y: 50, height: 140, dur: 5.6 / GLOBAL_VISUAL_CONFIG.speedMultiplier, delay: -2.4, variant: 2 },
    { y: 65, height: 160, dur: 4.5 / GLOBAL_VISUAL_CONFIG.speedMultiplier, delay: -1.2, variant: 1 },
    { y: 78, height: 180, dur: 5.2 / GLOBAL_VISUAL_CONFIG.speedMultiplier, delay: -3.8, variant: 2 },
  ];
}

/**
 * Generate Stage 4 Peach Blossom Petals
 */
export function getStage4BlossomPetals(): ParticleItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage4.blossomPetals;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(606);
  const items: ParticleItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(3, 97, (i + prng() * 0.85) / count));
    const size = +(lerp(cfg.sizeRange[0], cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const speedJitter = lerp(0.85, 1.2, prng() * cfg.movementRandomness * GLOBAL_VISUAL_CONFIG.movementRandomness);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) * speedJitter / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.4, dur * 0.9, prng())).toFixed(1);
    const variant = (prng() > 0.5 ? 2 : 1) as 1 | 2;
    const color = cfg.colors[Math.floor(prng() * cfg.colors.length)];

    items.push({ x, size, opacity, dur, delay, variant, color });
  }

  return items;
}

/**
 * Generate Stage 5 Lantern Embers
 */
export function getStage5LanternEmbers(): ParticleItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage5.lanternEmbers;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(707);
  const items: ParticleItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(5, 96, (i + prng() * 0.85) / count));
    const y = Math.round(lerp(7, 26, prng()));
    const size = +(lerp(cfg.sizeRange[0], cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const speedJitter = lerp(0.85, 1.15, prng() * cfg.movementRandomness * GLOBAL_VISUAL_CONFIG.movementRandomness);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) * speedJitter / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.5, dur * 0.9, prng())).toFixed(1);
    const variant = (prng() > 0.5 ? 2 : 1) as 1 | 2;
    const color = cfg.colors[Math.floor(prng() * cfg.colors.length)];

    items.push({ x, y, size, opacity, dur, delay, variant, color });
  }

  return items;
}

/**
 * Generate Stage 6 Sapphire Night Stars
 */
export function getStage6NightStars(): GlowingStarItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage6.sapphireStars;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(808);
  const items: GlowingStarItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(3, 98, (i + prng() * 0.85) / count));
    const y = Math.round(lerp(5, 46, prng()));
    const isMajor = prng() < cfg.majorSparkleRatio;
    const size = isMajor
      ? +(lerp(3.2, cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1)
      : +(lerp(cfg.sizeRange[0], 2.8, prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.2, dur * 0.9, prng())).toFixed(1);
    const variant = isMajor ? 3 : (prng() > 0.5 ? 2 : 1);

    items.push({
      x,
      y,
      size,
      opacity,
      dur,
      delay,
      variant: variant as 1 | 2 | 3,
      isMajor,
      color: '#ffffff',
      glow: isMajor ? 'rgba(199, 210, 254, 0.95)' : cfg.defaultGlow,
    });
  }

  return items;
}

/**
 * Generate Stage 7 Whispering Bamboo Leaves
 */
export function getStage7BambooLeaves(): ParticleItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage7.bambooLeaves;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(909);
  const items: ParticleItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(4, 96, (i + prng() * 0.85) / count));
    const size = +(lerp(cfg.sizeRange[0], cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const speedJitter = lerp(0.85, 1.2, prng() * cfg.movementRandomness * GLOBAL_VISUAL_CONFIG.movementRandomness);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) * speedJitter / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.5, dur * 0.9, prng())).toFixed(1);
    const variant = (prng() > 0.5 ? 2 : 1) as 1 | 2;
    const color = cfg.colors[Math.floor(prng() * cfg.colors.length)];

    items.push({ x, size, opacity, dur, delay, variant, color });
  }

  return items;
}

/**
 * Generate Stage 8 Amethyst Twilight Stars
 */
export function getStage8NightStars(): GlowingStarItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage8.amethystStars;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(1010);
  const items: GlowingStarItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(4, 97, (i + prng() * 0.85) / count));
    const y = Math.round(lerp(6, 45, prng()));
    const isMajor = prng() < cfg.majorSparkleRatio;
    const size = isMajor
      ? +(lerp(3.2, cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1)
      : +(lerp(cfg.sizeRange[0], 2.6, prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.2, dur * 0.9, prng())).toFixed(1);
    const variant = isMajor ? 3 : (prng() > 0.5 ? 2 : 1);

    items.push({
      x,
      y,
      size,
      opacity,
      dur,
      delay,
      variant: variant as 1 | 2 | 3,
      isMajor,
      color: isMajor ? '#f3e8ff' : '#ffffff',
      glow: isMajor ? 'rgba(233, 213, 255, 0.95)' : cfg.defaultGlow,
    });
  }

  return items;
}

/**
 * Generate Stage 9 Celestial Spirit Motes
 */
export function getStage9SpiritMotes(): ParticleItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage9.spiritMotes;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(1111);
  const items: ParticleItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(5, 96, (i + prng() * 0.85) / count));
    const y = Math.round(lerp(7, 24, prng()));
    const size = +(lerp(cfg.sizeRange[0], cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const speedJitter = lerp(0.85, 1.2, prng() * cfg.movementRandomness * GLOBAL_VISUAL_CONFIG.movementRandomness);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) * speedJitter / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.5, dur * 0.9, prng())).toFixed(1);
    const variant = (prng() > 0.5 ? 2 : 1) as 1 | 2;
    const color = cfg.colors[Math.floor(prng() * cfg.colors.length)];

    items.push({ x, y, size, opacity, dur, delay, variant, color });
  }

  return items;
}

/**
 * Stage 7 Aqua Blue River Overlay Configuration Getter
 */
export function getStage7AquaRiverConfig() {
  return STAGE_PARTICLE_CONFIG.stage7.aquaRiverOverlay;
}

/**
 * Generate Stage 9 Celestial Falling Snowflakes
 */
export function getStage9Snowflakes(): ParticleItem[] {
  const cfg = STAGE_PARTICLE_CONFIG.stage9.snowflakes;
  const count = Math.round(cfg.baseCount * GLOBAL_VISUAL_CONFIG.densityMultiplier);
  const prng = createPRNG(1212);
  const items: ParticleItem[] = [];

  for (let i = 0; i < count; i++) {
    const x = Math.round(lerp(2, 98, (i + prng() * 0.85) / count));
    const size = +(lerp(cfg.sizeRange[0], cfg.sizeRange[1], prng()) * GLOBAL_VISUAL_CONFIG.sizeMultiplier).toFixed(1);
    const opacity = +(lerp(cfg.opacityRange[0], cfg.opacityRange[1], prng())).toFixed(2);
    const speedJitter = lerp(0.8, 1.2, prng() * cfg.movementRandomness * GLOBAL_VISUAL_CONFIG.movementRandomness);
    const dur = +(lerp(cfg.durationRange[0], cfg.durationRange[1], prng()) * speedJitter / GLOBAL_VISUAL_CONFIG.speedMultiplier).toFixed(1);
    const delay = +(-lerp(0.3, dur * 0.95, prng())).toFixed(1);
    const randVar = prng();
    const variant = (randVar < 0.35 ? 1 : randVar < 0.7 ? 2 : 3) as 1 | 2 | 3;

    items.push({ x, size, opacity, dur, delay, variant });
  }

  return items;
}


