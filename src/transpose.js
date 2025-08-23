// Utility for transposing note frequencies
export function transposeFreq(freq, semitones) {
  return freq * Math.pow(2, semitones / 12);
}
