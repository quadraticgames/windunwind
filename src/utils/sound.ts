import * as Tone from 'tone';

let reverb: Tone.Reverb | null = null;
let chimeSynth: Tone.PolySynth<Tone.FMSynth> | null = null;
let isInitialized = false;

export const initializeAudio = async () => {
  if (isInitialized) return;

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

  // Sparkling crystalline chime synthesizer
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

  isInitialized = true;
};

export const playCorrectNote = (direction: 'up' | 'down') => {
  if (!chimeSynth) return;
  // C6 for higher tone chime, G5 for lower tone chime
  const note = direction === 'up' ? 'C6' : 'G5';
  chimeSynth.triggerAttackRelease(note, '0.5');
};

export const playWrongNote = () => {
  if (!chimeSynth) return;
  chimeSynth.triggerAttackRelease('F#4', '0.5');
};