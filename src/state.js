// App state and state management
export const NOTES = [
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
  { name: "C'", key: ',' }, // High C
];

let state = {
  selectedNotes: [],
  tuning: '12tet',
  volume: 0.3,
  transpose: 0, // in semitones
};

const listeners = [];

export function getState() {
  return { ...state };
}

export function setState(partial) {
  state = { ...state, ...partial };
  listeners.forEach(fn => fn(getState()));
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}
