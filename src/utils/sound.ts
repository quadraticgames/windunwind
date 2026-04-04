import * as Tone from 'tone';

let synth: Tone.Synth | null = null;

export const initializeAudio = async () => {
  await Tone.start();
  synth = new Tone.Synth().toDestination();
};

export const playCorrectNote = (direction: 'up' | 'down') => {
  if (!synth) return;
  const note = direction === 'up' ? 'C4' : 'G3';
  synth.triggerAttackRelease(note, '0.2');
};

export const playWrongNote = () => {
  if (!synth) return;
  synth.triggerAttackRelease('F#3', '0.3');
};