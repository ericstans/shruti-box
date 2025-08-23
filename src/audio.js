// Web Audio API logic for shruti box
import { getNoteFreq } from './tunings.js';
import { NOTES, getState } from './state.js';
import { transposeFreq } from './transpose.js';

let audioCtx = null;
let gainNode = null;
let oscillators = {};

export function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (!gainNode) {
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
  }
}

export function setVolume(vol) {
  if (gainNode) gainNode.gain.value = vol;
}

export function startNote(noteName, idx, tuning) {
  if (!audioCtx) initAudio();
  if (oscillators[noteName]) return;
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  let baseFreq = getNoteFreq(tuning, idx);
  // Check if the corresponding checkbox has data-octave='1' or is high C
  const cb = document.querySelector(`.note-toggle[data-note="${noteName.replace('"', '\"')}"]`);
  if (cb && cb.getAttribute('data-octave') === '1') {
    baseFreq *= 2;
  }
  if (noteName === "C'") {
    baseFreq *= 2;
  }
  const freq = transposeFreq(baseFreq, getState().transpose);
  osc.frequency.value = freq;
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 2.5 + Math.random();
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain).connect(gainNode.gain);
  lfo.start();
  osc.connect(gainNode);
  osc.start();
  oscillators[noteName] = { osc, lfo, lfoGain };
}

export function stopNote(noteName) {
  if (oscillators[noteName]) {
    oscillators[noteName].osc.stop();
    oscillators[noteName].lfo.stop();
    delete oscillators[noteName];
  }
}

export function updateTuning(tuning) {
  const transpose = getState().transpose;
  Object.keys(oscillators).forEach(noteName => {
    const idx = NOTES.findIndex(n => n.name === noteName);
    if (idx !== -1) {
      let baseFreq = getNoteFreq(tuning, idx);
      // Check if the corresponding checkbox has data-octave='1' or is high C
      const cb = document.querySelector(`.note-toggle[data-note="${noteName.replace('"', '\"')}"]`);
      if (cb && cb.getAttribute('data-octave') === '1') {
        baseFreq *= 2;
      }
      if (noteName === "C'") {
        baseFreq *= 2;
      }
      const freq = transposeFreq(baseFreq, transpose);
      oscillators[noteName].osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    }
  });
}

// Also update frequencies if transpose changes
export function updateTranspose() {
  updateTuning(getState().tuning);
}
export function stopAll() {
  Object.keys(oscillators).forEach(stopNote);
}
