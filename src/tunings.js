// Tuning tables and frequency logic
export const BASE_FREQ = 261.63; // C
export const TUNINGS = {
  '12tet': [
    1.0000, Math.pow(2,1/12), Math.pow(2,2/12), Math.pow(2,3/12), Math.pow(2,4/12), Math.pow(2,5/12), Math.pow(2,6/12), Math.pow(2,7/12), Math.pow(2,8/12), Math.pow(2,9/12), Math.pow(2,10/12), Math.pow(2,11/12)
  ],
  'just': [
    1.0000, 16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8
  ],
  'pythagorean': [
    1.0000, 2187/2048, 9/8, 32/27, 81/64, 4/3, 729/512, 3/2, 128/81, 27/16, 16/9, 243/128
  ],
  'meantone': [
    1.0000, 1.0696, 1.1180, 1.1963, 1.25, 1.3375, 1.3975, 1.4953, 1.6018, 1.6719, 1.7818, 1.8692
  ],
};

// root: note name string (e.g. 'C'), idx: 0-11
import { NOTES } from './state.js';
export function getNoteFreq(tuning, idx, root) {
  // Find root index
  const rootIdx = NOTES.findIndex(n => n.name === root);
  // Calculate semitone offset from C
  const noteIdx = (idx - rootIdx + 12) % 12;
  return BASE_FREQ * TUNINGS[tuning][noteIdx];
}
