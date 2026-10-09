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

export const setDroneMuted = (muted: boolean) => {
  isDroneMuted = muted;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zen_drone_muted', muted ? 'true' : 'false');
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  if (dronePlayer) {
    dronePlayer.mute = muted;
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

  // Player for lowtone.mp3
  try {
    lowTonePlayer = new Tone.Player({
      url: '/lowtone.mp3',
      volume: -4,
    }).connect(reverb);
  } catch (e) {
    console.warn('Failed to load low tone player', e);
  }

  // Player for hightone.mp3
  try {
    highTonePlayer = new Tone.Player({
      url: '/hightone.mp3',
      volume: -4,
    }).connect(reverb);
  } catch (e) {
    console.warn('Failed to load high tone player', e);
  }

  // Looping drone player for drone.mp3
  try {
    dronePlayer = new Tone.Player({
      url: '/drone.mp3',
      loop: true,
      volume: -24,
      fadeIn: 2,
      fadeOut: 2,
      autostart: false,
    }).toDestination();
    dronePlayer.mute = isDroneMuted;
  } catch (e) {
    console.warn('Failed to load drone player', e);
  }

  isInitialized = true;
};

export const startDrone = async () => {
  await initializeAudio();
  if (!dronePlayer) return;
  dronePlayer.mute = isDroneMuted;
  // If player buffer is already loaded, start immediately
  if (dronePlayer.loaded) {
    if (dronePlayer.state !== 'started') {
      dronePlayer.start();
    }
  } else {
    // Wait until loaded
    const checkLoaded = setInterval(() => {
      if (dronePlayer && dronePlayer.loaded) {
        clearInterval(checkLoaded);
        if (dronePlayer.state !== 'started') {
          dronePlayer.start();
        }
      }
    }, 100);
  }
};

export const stopDrone = () => {
  if (dronePlayer && dronePlayer.state === 'started') {
    dronePlayer.stop();
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