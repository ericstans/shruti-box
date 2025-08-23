import { createUI } from './ui.js';
// Shruti Box Web App
// 12 notes, C chromatic scale, mapped to ZSXDC VGBHNJM
// Tuning tables: ratios relative to C (MIDI 60, 261.63 Hz)
const BASE_FREQ = 261.63; // C
const TUNINGS = {
	'12tet': [
		1.0000, // C
		Math.pow(2,1/12), // C#
		Math.pow(2,2/12), // D
		Math.pow(2,3/12), // D#
		Math.pow(2,4/12), // E
		Math.pow(2,5/12), // F
		Math.pow(2,6/12), // F#
		Math.pow(2,7/12), // G
		Math.pow(2,8/12), // G#
		Math.pow(2,9/12), // A
		Math.pow(2,10/12), // A#
		Math.pow(2,11/12), // B
	],
	'just': [
		1.0000,      // C
		16/15,       // C#
		9/8,         // D
		6/5,         // D#
		5/4,         // E
		4/3,         // F
		45/32,       // F#
		3/2,         // G
		8/5,         // G#
		5/3,         // A
		9/5,         // A#
		15/8,        // B
	],
	'pythagorean': [
		1.0000,      // C
		2187/2048,   // C#
		9/8,         // D
		32/27,       // D#
		81/64,       // E
		4/3,         // F
		729/512,     // F#
		3/2,         // G
		128/81,      // G#
		27/16,       // A
		16/9,        // A#
		243/128,     // B
	],
	'meantone': [
		1.0000,
		1.0696, // C#
		1.1180, // D
		1.1963, // D#
		1.25,   // E
		1.3375, // F
		1.3975, // F#
		1.4953, // G
		1.6018, // G#
		1.6719, // A
		1.7818, // A#
		1.8692, // B
	],
};

const NOTES = [
	{ name: 'C', key: 'Z' },
	{ name: 'C#', key: 'S' },
	{ name: 'D', key: 'X' },
	{ name: 'D#', key: 'D' },
	{ name: 'E', key: 'C' },
	{ name: 'F', key: 'V' },
	{ name: 'F#', key: 'G' },
	{ name: 'G', key: 'B' },
	{ name: 'G#', key: 'H' },
	{ name: 'A', key: 'N' },
	{ name: 'A#', key: 'J' },
	{ name: 'B', key: 'M' },
];

let audioCtx = null;
let oscillators = {};
let gainNode = null;
let isPlaying = false;
let currentTuning = '12tet';

function getSelectedNotes() {
	// Map checkboxes to notes by data-note
	return Array.from(document.querySelectorAll('.note-toggle'))
		.filter(cb => cb.checked)
		.map(cb => NOTES.find(n => n.name === cb.getAttribute('data-note')))
		.filter(Boolean);
}

function getNoteFreq(idx) {
	const ratio = TUNINGS[currentTuning][idx];
	return BASE_FREQ * ratio;
}

function startShruti() {
	if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	if (!gainNode) {
		gainNode = audioCtx.createGain();
		gainNode.gain.value = parseFloat(document.querySelector('.volume-slider').value);
		gainNode.connect(audioCtx.destination);
	}
	const selected = getSelectedNotes();
	oscillators = {};
	selected.forEach(note => {
		const idx = NOTES.findIndex(n => n.name === note.name);
		const osc = audioCtx.createOscillator();
		osc.type = 'triangle';
		osc.frequency.value = getNoteFreq(idx);
		// Gentle amplitude modulation for realism
		const lfo = audioCtx.createOscillator();
		lfo.type = 'sine';
		lfo.frequency.value = 2.5 + Math.random();
		const lfoGain = audioCtx.createGain();
		lfoGain.gain.value = 0.08;
		lfo.connect(lfoGain).connect(gainNode.gain);
		lfo.start();
		osc.connect(gainNode);
		osc.start();
		oscillators[note.name] = { osc, lfo, lfoGain };
	});
	isPlaying = true;
	// Listen for note toggle changes
	document.querySelectorAll('.note-toggle').forEach(cb => {
		cb.addEventListener('change', () => {
			if (!isPlaying) return;
			const noteName = cb.getAttribute('data-note');
			const note = NOTES.find(n => n.name === noteName);
			if (!note) return;
			const idx = NOTES.findIndex(n => n.name === noteName);
			if (cb.checked && !oscillators[note.name]) {
				// Add note
				const osc = audioCtx.createOscillator();
				osc.type = 'triangle';
				osc.frequency.value = getNoteFreq(idx);
				const lfo = audioCtx.createOscillator();
				lfo.type = 'sine';
				lfo.frequency.value = 2.5 + Math.random();
				const lfoGain = audioCtx.createGain();
				lfoGain.gain.value = 0.08;
				lfo.connect(lfoGain).connect(gainNode.gain);
				lfo.start();
				osc.connect(gainNode);
				osc.start();
				oscillators[note.name] = { osc, lfo, lfoGain };
			} else if (!cb.checked && oscillators[note.name]) {
				// Remove note
				const { osc, lfo } = oscillators[note.name];
				osc.stop();
				lfo.stop();
				delete oscillators[note.name];
			}
		});
	});
}

// Update frequencies of all playing oscillators in real time
function updateNoteFrequencies() {
	Object.keys(oscillators).forEach(noteName => {
		const idx = NOTES.findIndex(n => n.name === noteName);
		if (idx !== -1) {
			oscillators[noteName].osc.frequency.setValueAtTime(getNoteFreq(idx), audioCtx ? audioCtx.currentTime : 0);
		}
	});
}
// ...existing code...
function stopShruti() {
	Object.values(oscillators).forEach(({ osc, lfo }) => {
		osc.stop();
		lfo.stop();
	});
	oscillators = {};
	isPlaying = false;
}

window.addEventListener('DOMContentLoaded', createUI);