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
  const effects = window.shrutiEffects || {};
  let baseFreq = getNoteFreq(tuning, idx);
  const freq = transposeFreq(baseFreq, getState().transpose);

  // Envelope (attack/release) and harmonics volume compensation
  const envGain = audioCtx.createGain();
  // If harmonics is on, scale gain to ~0.6 for perceived loudness match
  const baseGain = (effects.harmonics ? 0.6 : 1.0);
  envGain.gain.value = effects.envelope ? 0 : baseGain;
  envGain.connect(gainNode);

  // Main oscillator (triangle or with harmonics)
  const osc = audioCtx.createOscillator();
  let oscOutput = osc;
  osc.type = (effects.harmonics ? 'sawtooth' : 'triangle');
  osc.frequency.value = freq;
  // If harmonics, add a gentle lowpass filter to mellow the sawtooth
  let harmonicsFilter = null;
  if (effects.harmonics) {
    harmonicsFilter = audioCtx.createBiquadFilter();
    harmonicsFilter.type = 'lowpass';
    harmonicsFilter.frequency.value = 2200;
    osc.connect(harmonicsFilter);
    oscOutput = harmonicsFilter;
  }

  // Subtle detuning (second oscillator)
  let detuneOsc = null;
  if (effects.detune) {
    detuneOsc = audioCtx.createOscillator();
    detuneOsc.type = osc.type;
    const detuneRatio = 1 + (Math.random() * 0.008 - 0.004); // ±4 cents
    detuneOsc._detuneRatio = detuneRatio;
    detuneOsc.frequency.value = freq * detuneRatio;
    detuneOsc.connect(envGain);
  }

  // Breath/noise layer
  let noiseNode = null;
  if (effects.noise) {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.08;
    }
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    // Gentle lowpass filter
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1200;
    noiseNode.connect(noiseFilter).connect(envGain);
    noiseNode.loop = true;
    noiseNode.start();
  }

  // Tremolo (volume LFO)
  let tremoloLFO = null, tremoloGain = null;
  if (effects.tremolo) {
    tremoloLFO = audioCtx.createOscillator();
    tremoloLFO.type = 'sine';
    tremoloLFO.frequency.value = 1.5 + Math.random();
    tremoloGain = audioCtx.createGain();
    tremoloGain.gain.value = 0.18;
    tremoloLFO.connect(tremoloGain).connect(envGain.gain);
    tremoloLFO.start();
  }

  // Vibrato (pitch LFO, always on for naturalism)
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 2.5 + Math.random();
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);
  lfo.start();
  lfoGain.connect(osc.frequency);
  if (detuneOsc) lfoGain.connect(detuneOsc.frequency);

  // Stereo spread
  let panNode = null;
  if (effects.stereo) {
    panNode = audioCtx.createStereoPanner();
    // Pan based on note index
    panNode.pan.value = (idx - 6) / 8; // -1 (left) to +1 (right)
    envGain.disconnect();
    envGain.connect(panNode).connect(gainNode);
  }

  // Reverb/ambience
  let reverbNode = null;
  if (effects.reverb) {
    reverbNode = audioCtx.createConvolver();
    // Simple impulse response: short noise burst
    const len = audioCtx.sampleRate * 1.2;
    const ir = audioCtx.createBuffer(2, len, audioCtx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2) * 0.25;
      }
    }
    reverbNode.buffer = ir;
    if (panNode) {
      panNode.disconnect();
      panNode.connect(reverbNode).connect(gainNode);
    } else {
      envGain.disconnect();
      envGain.connect(reverbNode).connect(gainNode);
    }
  }

  // Envelope (attack/release)
  if (effects.envelope) {
    envGain.gain.setValueAtTime(0, audioCtx.currentTime);
    envGain.gain.linearRampToValueAtTime(baseGain, audioCtx.currentTime + 0.35);
  }

  oscOutput.connect(envGain);
  if (detuneOsc) detuneOsc.start();
  osc.start();

  oscillators[noteName] = {
    osc,
    lfo,
    lfoGain,
    detuneOsc,
    noiseNode,
    tremoloLFO,
    tremoloGain,
    envGain,
    panNode,
    reverbNode
  };
}

export function stopNote(noteName) {
  if (oscillators[noteName]) {
    const o = oscillators[noteName];
    if (o.osc) o.osc.stop();
    if (o.lfo) o.lfo.stop();
    if (o.detuneOsc) o.detuneOsc.stop();
    if (o.noiseNode) o.noiseNode.stop();
    if (o.tremoloLFO) o.tremoloLFO.stop();
    // No need to stop gain, pan, or reverb nodes (they are not sources)
    delete oscillators[noteName];
  }
}

export function updateTuning(tuning) {
  const transpose = getState().transpose;
  Object.keys(oscillators).forEach(noteName => {
    const idx = NOTES.findIndex(n => n.name === noteName);
    if (idx !== -1) {
      let baseFreq = getNoteFreq(tuning, idx);
      // No frequency doubling for B or high C; tuning table logic already handles correct octave
      const freq = transposeFreq(baseFreq, transpose);
      const o = oscillators[noteName];
      o.osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      // If detuned oscillator exists, update its frequency as well
      if (o.detuneOsc && o.detuneOsc._detuneRatio) {
        o.detuneOsc.frequency.setValueAtTime(freq * o.detuneOsc._detuneRatio, audioCtx.currentTime);
      }
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
