import * as Tone from 'tone';

let reverb: Tone.Reverb | null = null;
let chimeSynth: Tone.PolySynth<Tone.FMSynth> | null = null;
let lowTonePlayer: Tone.Player | null = null;
let highTonePlayer: Tone.Player | null = null;
let dronePlayer: Tone.Player | null = null;
let isInitialized = false;

// Persistent drone mute state with localStorage support
let isDroneMuted = false;
try {
  if (typeof window !== 'undefined' && (localStorage.getItem('zen_drone_muted') === 'true' || localStorage.getItem('zen_audio_muted') === 'true')) {
    isDroneMuted = true;
  }
} catch (e) {
  // Ignore localStorage access errors
}

// Web Audio engine for seamless pop-free ambient drone
let droneAudioContext: AudioContext | null = null;
let droneGainNode: GainNode | null = null;
let droneSourceNode: AudioBufferSourceNode | null = null;
let seamlessDroneBuffer: AudioBuffer | null = null;
let isDroneLoading = false;
let isDronePlaying = false;
let fallbackAudio: HTMLAudioElement | null = null;

const getDroneContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!droneAudioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      droneAudioContext = new AudioCtx();
    }
  }
  return droneAudioContext;
};

let hasDroneFadedIn = false;
// Ambient drone volume reduced by 60% (from 0.35 down to 0.14) for a delicate background presence
const DRONE_VOLUME = 0.14;

// Generates an equal-power seamless loop buffer from the raw recording,
// eliminating MP3 boundary discontinuities and browser seek pops.
function createSeamlessLoopBuffer(audioBuf: AudioBuffer, ctx: AudioContext, crossfadeDuration = 1.0): AudioBuffer {
  const sampleRate = audioBuf.sampleRate;
  const crossfadeSamples = Math.floor(crossfadeDuration * sampleRate);
  const safeCrossfadeSamples = Math.min(crossfadeSamples, Math.floor(audioBuf.length / 2));
  const loopLength = audioBuf.length - safeCrossfadeSamples;

  const seamlessBuffer = ctx.createBuffer(
    audioBuf.numberOfChannels,
    loopLength,
    sampleRate
  );

  for (let ch = 0; ch < audioBuf.numberOfChannels; ch++) {
    const src = audioBuf.getChannelData(ch);
    const dest = seamlessBuffer.getChannelData(ch);

    // Copy core body
    for (let i = 0; i < loopLength; i++) {
      dest[i] = src[i];
    }

    // Blend the tail into the head with an equal-power crossfade
    for (let i = 0; i < safeCrossfadeSamples; i++) {
      const progress = i / safeCrossfadeSamples;
      const gainOut = Math.cos(progress * 0.5 * Math.PI);
      const gainIn = Math.sin(progress * 0.5 * Math.PI);

      const tailSample = src[loopLength + i];
      const headSample = dest[i];
      dest[i] = headSample * gainIn + tailSample * gainOut;
    }
  }

  return seamlessBuffer;
}

export const setDroneMuted = (muted: boolean) => {
  isDroneMuted = muted;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zen_drone_muted', muted ? 'true' : 'false');
    }
  } catch (e) {
    // Ignore localStorage errors
  }

  if (droneGainNode && droneAudioContext) {
    const now = droneAudioContext.currentTime;
    const targetGain = muted ? 0 : DRONE_VOLUME;
    droneGainNode.gain.cancelScheduledValues(now);
    droneGainNode.gain.setValueAtTime(droneGainNode.gain.value, now);
    droneGainNode.gain.linearRampToValueAtTime(targetGain, now + 0.05);
  }

  if (fallbackAudio) {
    fallbackAudio.muted = muted;
  }
};

export const getIsDroneMuted = () => isDroneMuted;

export const toggleDroneMute = () => {
  setDroneMuted(!isDroneMuted);
  return isDroneMuted;
};

// Aliases for compatibility
export const setMuted = setDroneMuted;
export const getIsMuted = getIsDroneMuted;
export const toggleMute = toggleDroneMute;

export const initializeAudio = async () => {
  if (isInitialized) {
    if (Tone.context.state === 'suspended') {
      await Tone.context.resume();
    }
    return;
  }

  await Tone.start();

  // Lush space reverb with long decay
  reverb = new Tone.Reverb({
    decay: 4.5,
    preDelay: 0.04,
    wet: 0.45,
  }).toDestination();

  try {
    await reverb.generate();
  } catch (e) {
    console.warn('Reverb impulse generation fallback', e);
  }

  // Fallback synthesizer
  chimeSynth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.51,
    modulationIndex: 2.8,
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.001,
      decay: 2.4,
      sustain: 0.01,
      release: 2.8,
    },
    modulation: {
      type: 'sine',
    },
    modulationEnvelope: {
      attack: 0.002,
      decay: 0.35,
      sustain: 0.0,
      release: 0.8,
    },
    volume: -8,
  }).connect(reverb);

  // Player for lowtone.mp3 with anti-click crossfades (boosted to balance with hightone)
  try {
    lowTonePlayer = new Tone.Player({
      url: '/lowtone.mp3',
      volume: 0.5,
      fadeIn: 0.005,
      fadeOut: 0.04,
    }).connect(reverb);
  } catch (e) {
    console.warn('Failed to load low tone player', e);
  }

  // Player for hightone.mp3 with anti-click crossfades
  try {
    highTonePlayer = new Tone.Player({
      url: '/hightone.mp3',
      volume: -4,
      fadeIn: 0.005,
      fadeOut: 0.04,
    }).connect(reverb);
  } catch (e) {
    console.warn('Failed to load high tone player', e);
  }

  isInitialized = true;
};

export const startDrone = async () => {
  if (typeof window === 'undefined') return;

  const ctx = getDroneContext();
  if (ctx) {
    // If context is suspended by autoplay policy, resume it
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        // Will resume on first user interaction
      }
    }

    if (isDronePlaying && droneSourceNode) {
      // Already running cleanly
      return;
    }

    if (isDroneLoading) {
      return;
    }

    try {
      if (!seamlessDroneBuffer) {
        isDroneLoading = true;
        const resp = await fetch('/drone.mp3');
        const arrayBuf = await resp.arrayBuffer();
        const rawBuf = await ctx.decodeAudioData(arrayBuf);
        seamlessDroneBuffer = createSeamlessLoopBuffer(rawBuf, ctx, 1.0);
        isDroneLoading = false;
      }

      const shouldFadeIn = !hasDroneFadedIn && ctx.state === 'running';
      if (shouldFadeIn) {
        hasDroneFadedIn = true;
      }
      const targetGain = isDroneMuted ? 0 : DRONE_VOLUME;
      const FADE_IN_DURATION = 4.4; // 4.4-second gentle ambient swell

      if (!droneGainNode) {
        droneGainNode = ctx.createGain();
        droneGainNode.connect(ctx.destination);
      }

      droneGainNode.gain.cancelScheduledValues(ctx.currentTime);
      if (shouldFadeIn && !isDroneMuted) {
        droneGainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
        droneGainNode.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + FADE_IN_DURATION);
      } else {
        droneGainNode.gain.setValueAtTime(targetGain, ctx.currentTime);
      }

      if (droneSourceNode) {
        try {
          droneSourceNode.stop();
          droneSourceNode.disconnect();
        } catch (e) {}
      }

      droneSourceNode = ctx.createBufferSource();
      droneSourceNode.buffer = seamlessDroneBuffer;
      droneSourceNode.loop = true;
      droneSourceNode.connect(droneGainNode);
      droneSourceNode.start(0);
      isDronePlaying = true;
    } catch (e) {
      console.warn('Web Audio drone error, falling back to HTMLAudioElement', e);
      if (!fallbackAudio) {
        fallbackAudio = new Audio('/drone.mp3');
        fallbackAudio.loop = true;
        fallbackAudio.muted = isDroneMuted;
        if (!hasDroneFadedIn && !isDroneMuted) {
          hasDroneFadedIn = true;
          fallbackAudio.volume = 0;
          let currentVol = 0;
          const fadeTimer = setInterval(() => {
            currentVol = Math.min(DRONE_VOLUME, currentVol + (DRONE_VOLUME / 20));
            if (fallbackAudio) fallbackAudio.volume = currentVol;
            if (currentVol >= DRONE_VOLUME) clearInterval(fadeTimer);
          }, 220);
        } else {
          fallbackAudio.volume = DRONE_VOLUME;
        }
      }
      fallbackAudio.play().catch(() => {});
    }
  }

  // Also resume Tone context if already initialized
  if (isInitialized && Tone.context.state === 'suspended') {
    Tone.context.resume().catch(() => {});
  }
};

export const stopDrone = () => {
  if (droneGainNode && droneAudioContext) {
    const now = droneAudioContext.currentTime;
    droneGainNode.gain.cancelScheduledValues(now);
    droneGainNode.gain.setValueAtTime(droneGainNode.gain.value, now);
    droneGainNode.gain.linearRampToValueAtTime(0, now + 0.04);
    setTimeout(() => {
      if (droneSourceNode) {
        try {
          droneSourceNode.stop();
          droneSourceNode.disconnect();
        } catch (e) {}
        droneSourceNode = null;
      }
      isDronePlaying = false;
    }, 50);
  } else if (fallbackAudio && !fallbackAudio.paused) {
    fallbackAudio.pause();
  }
};

export const playCorrectNote = (direction: 'up' | 'down') => {
  if (direction === 'down') {
    if (lowTonePlayer && lowTonePlayer.loaded) {
      if (lowTonePlayer.state === 'started') {
        lowTonePlayer.stop();
      }
      lowTonePlayer.start();
      return;
    }
    // Fallback if player not ready yet
    if (chimeSynth) {
      chimeSynth.triggerAttackRelease('G5', '0.5');
    }
    return;
  }

  // Higher tone (up)
  if (highTonePlayer && highTonePlayer.loaded) {
    if (highTonePlayer.state === 'started') {
      highTonePlayer.stop();
    }
    highTonePlayer.start();
    return;
  }

  // Fallback if player not ready yet
  if (chimeSynth) {
    chimeSynth.triggerAttackRelease('C6', '0.5');
  }
};

export const playWrongNote = () => {
  if (!chimeSynth) return;
  chimeSynth.triggerAttackRelease('F#4', '0.5');
};

export const playStageFanfare = () => {
  if (!chimeSynth) return;
  // A lush, ascending pentatonic bell fanfare that resonates in the temple reverb
  const now = Tone.now();
  const melody = [
    { note: 'D5', delay: 0.0, dur: '0.4', vel: 0.7 },
    { note: 'G5', delay: 0.12, dur: '0.4', vel: 0.75 },
    { note: 'A5', delay: 0.24, dur: '0.4', vel: 0.8 },
    { note: 'C6', delay: 0.38, dur: '0.5', vel: 0.85 },
    { note: 'D6', delay: 0.52, dur: '0.6', vel: 0.9 },
    { note: 'G6', delay: 0.68, dur: '1.2', vel: 0.95 },
  ];

  melody.forEach(({ note, delay, dur, vel }) => {
    chimeSynth?.triggerAttackRelease(note, dur, now + delay, vel);
  });

  // Resonant golden chord swell to crown the progression
  setTimeout(() => {
    if (chimeSynth) {
      chimeSynth.triggerAttackRelease(['G5', 'B5', 'D6', 'G6'], '2.2', undefined, 0.75);
    }
  }, 820);
};

// Audio pool for instantaneous responsive button clicks
const CLICK_POOL_SIZE = 5;
let clickPool: HTMLAudioElement[] = [];
let clickPoolIndex = 0;

export const playClickSound = () => {
  try {
    if (typeof window !== 'undefined') {
      if (clickPool.length === 0) {
        for (let i = 0; i < CLICK_POOL_SIZE; i++) {
          const audio = new Audio('/click.mp3');
          audio.volume = 0.65;
          audio.preload = 'auto';
          clickPool.push(audio);
        }
      }
      const sound = clickPool[clickPoolIndex];
      clickPoolIndex = (clickPoolIndex + 1) % CLICK_POOL_SIZE;
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  } catch (e) {
    // Ignore audio playback errors
  }
};