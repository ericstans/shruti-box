// UI creation and event binding
import { NOTES, getState, setState, subscribe } from './state.js';
import { startNote, stopNote, setVolume, updateTuning, initAudio, stopAll, updateTranspose } from './audio.js';

export function createUI() {
  let volSlider;
  const app = document.createElement('div');
  app.style.fontFamily = 'sans-serif';
  app.style.maxWidth = '400px';
  app.style.margin = '2em auto';
  app.style.padding = '2em';
  app.style.background = '#f9f9f9';
  app.style.borderRadius = '12px';
  app.style.boxShadow = '0 2px 8px #ccc';

  const title = document.createElement('h2');
  title.textContent = 'Shruti Box';
  app.appendChild(title);

  // Note toggles (styled as shruti box holes)
  const whiteKeys = [0,2,4,5,7,9,11];
  const blackKeys = [1,3,6,8,10];

  // Container for both rows
  const holesContainer = document.createElement('div');
  holesContainer.style.position = 'relative';
  holesContainer.style.width = '300px'; // increased for 8 holes
  holesContainer.style.height = '70px';
  holesContainer.style.margin = '1.2em auto 1.5em auto';
  holesContainer.style.display = 'block';

  // White keys row (bottom, 8 holes)
  const whitePositions = [0, 38, 76, 114, 152, 190, 228, 266];
  for (let i = 0, w = 0; i < NOTES.length; i++) {
    // Add 8th hole for high C
    if ((whiteKeys.includes(i) && i < 12) || i === 12) {
      // Create a wrapper for the hole and label
      const holeWrapper = document.createElement('div');
      holeWrapper.style.position = 'absolute';
      holeWrapper.style.left = whitePositions[w] + 'px';
      holeWrapper.style.top = '32px';
      holeWrapper.style.width = '32px';
      holeWrapper.style.height = '32px';
      holeWrapper.style.display = 'flex';
      holeWrapper.style.alignItems = 'center';
      holeWrapper.style.justifyContent = 'center';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'note-toggle';
      cb.setAttribute('data-key', NOTES[i].key);
      cb.setAttribute('data-note', NOTES[i].name);
      // Mark the rightmost B with data-octave="1"
      if (w === 6 && i < 12) {
        cb.setAttribute('data-octave', '1');
      }
      cb.style.width = '32px';
      cb.style.height = '32px';
      cb.style.borderRadius = '50%';
      cb.style.background = '#e0c080';
      cb.style.border = '2.5px solid #b89b5a';
      cb.style.appearance = 'none';
      cb.style.webkitAppearance = 'none';
      cb.style.outline = 'none';
      cb.style.cursor = 'pointer';
      cb.style.boxShadow = '0 2px 8px #b89b5a44';
      cb.style.position = 'absolute';
      cb.style.left = '0';
      cb.style.top = '0';
      cb.addEventListener('change', function() {
        cb.style.background = cb.checked ? '#c2a05a' : '#e0c080';
      });

      // Hotkey label
      const label = document.createElement('span');
      label.textContent = NOTES[i].key;
      label.style.position = 'relative';
      label.style.zIndex = '2';
      label.style.color = '#5a4a1a';
      label.style.fontWeight = 'bold';
      label.style.fontSize = '1.1em';
      label.style.pointerEvents = 'none';
      label.style.userSelect = 'none';
      label.style.textAlign = 'center';
      label.style.width = '32px';
      label.style.height = '32px';
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.justifyContent = 'center';

      holeWrapper.appendChild(cb);
      holeWrapper.appendChild(label);
      holesContainer.appendChild(holeWrapper);
      w++;
    }
  }

  // Black keys row (top, 5 holes, offset between white holes)
  // Place black keys between white keys: after 1st, 2nd, 4th, 5th, 6th white key
  const blackPositions = [27, 65, 141, 179, 217];
  let blackKeyOrder = [1,3,6,8,10];
  for (let j = 0; j < blackKeyOrder.length; j++) {
    const i = blackKeyOrder[j];
    // Create a wrapper for the hole and label
    const holeWrapper = document.createElement('div');
    holeWrapper.style.position = 'absolute';
    holeWrapper.style.left = blackPositions[j] + 'px';
    holeWrapper.style.top = '6px';
    holeWrapper.style.width = '28px';
    holeWrapper.style.height = '28px';
    holeWrapper.style.display = 'flex';
    holeWrapper.style.alignItems = 'center';
    holeWrapper.style.justifyContent = 'center';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'note-toggle';
    cb.setAttribute('data-key', NOTES[i].key);
    cb.setAttribute('data-note', NOTES[i].name);
    cb.style.width = '28px';
    cb.style.height = '28px';
    cb.style.borderRadius = '50%';
    cb.style.background = '#e0c080';
    cb.style.border = '2.5px solid #b89b5a';
    cb.style.appearance = 'none';
    cb.style.webkitAppearance = 'none';
    cb.style.outline = 'none';
    cb.style.cursor = 'pointer';
    cb.style.boxShadow = '0 2px 8px #b89b5a44';
    cb.style.position = 'absolute';
    cb.style.left = '0';
    cb.style.top = '0';
    cb.addEventListener('change', function() {
      cb.style.background = cb.checked ? '#c2a05a' : '#e0c080';
    });

    // Hotkey label
    const label = document.createElement('span');
    label.textContent = NOTES[i].key;
    label.style.position = 'relative';
    label.style.zIndex = '2';
    label.style.color = '#5a4a1a';
    label.style.fontWeight = 'bold';
    label.style.fontSize = '1.05em';
    label.style.pointerEvents = 'none';
    label.style.userSelect = 'none';
    label.style.textAlign = 'center';
    label.style.width = '28px';
    label.style.height = '28px';
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.justifyContent = 'center';

    holeWrapper.appendChild(cb);
    holeWrapper.appendChild(label);
    holesContainer.appendChild(holeWrapper);
  }
  app.appendChild(holesContainer);
  holesContainer.style.marginLeft = 'auto';
  holesContainer.style.marginRight = 'auto';

  // Options panel
  const optionsPanel = document.createElement('div');
  optionsPanel.style.marginTop = '2em';
  optionsPanel.style.padding = '1em';
  optionsPanel.style.background = '#f1f1f1';
  optionsPanel.style.borderRadius = '8px';
  optionsPanel.style.boxShadow = '0 1px 4px #ddd';

  const optionsTitle = document.createElement('h3');
  optionsTitle.textContent = 'Options';
  optionsTitle.style.marginTop = '0';
  optionsPanel.appendChild(optionsTitle);

  // Tuning picklist and explanation
  const tuningRow = document.createElement('div');
  tuningRow.style.display = 'flex';
  tuningRow.style.alignItems = 'center';

  const tuningLabel = document.createElement('label');
  tuningLabel.textContent = 'Tuning: ';
  tuningLabel.style.marginRight = '0.5em';
  const tuningSelect = document.createElement('select');
  tuningSelect.className = 'tuning-select';
  const tuningOptions = [
    { label: '12-TET (Equal Temperament)', value: '12tet' },
    { label: 'Just Intonation', value: 'just' },
    { label: 'Pythagorean', value: 'pythagorean' },
    { label: 'Meantone', value: 'meantone' }
  ];
  tuningOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    tuningSelect.appendChild(option);
  });
  tuningLabel.appendChild(tuningSelect);
  tuningRow.appendChild(tuningLabel);

  const tuningExplanations = {
    '12tet': '12-TET (Twelve-tone equal temperament) divides the octave into 12 equal steps. Standard for modern Western music.',
    'just': 'Just intonation uses simple whole-number ratios for pure intervals. Harmonically rich, but key-dependent.',
    'pythagorean': 'Pythagorean tuning is based on pure fifths (3:2 ratio). Bright, but some intervals are wide or narrow.',
    'meantone': 'Meantone temperament tempers fifths to improve major thirds. Used in Renaissance/Baroque music.'
  };
  const tuningDesc = document.createElement('span');
  tuningDesc.style.marginLeft = '1.5em';
  tuningDesc.style.fontSize = '0.95em';
  tuningDesc.style.maxWidth = '220px';
  tuningDesc.style.display = 'inline-block';
  tuningDesc.textContent = tuningExplanations['12tet'];
  tuningRow.appendChild(tuningDesc);

  optionsPanel.appendChild(tuningRow);
  
  // --- Effects checkboxes ---
  const effects = [
    { key: 'detune', label: 'Subtle Detuning' },
    { key: 'envelope', label: 'Envelope (Attack/Release)' },
    { key: 'harmonics', label: 'Harmonic Content' },
    { key: 'noise', label: 'Bellows Noise Layer' },
    { key: 'tremolo', label: 'Dynamic Volume (Tremolo)' },
    { key: 'stereo', label: 'Stereo Spread' },
    { key: 'reverb', label: 'Reverb/Ambience' },
  ];
  if (!window.shrutiEffects) window.shrutiEffects = {};
  const effectsPanel = document.createElement('div');
  effectsPanel.style.marginTop = '1em';
  effectsPanel.style.display = 'flex';
  effectsPanel.style.flexWrap = 'wrap';
  effectsPanel.style.gap = '1.2em 2em';
  effects.forEach(eff => {
    const effLabel = document.createElement('label');
    effLabel.style.display = 'flex';
    effLabel.style.alignItems = 'center';
    effLabel.style.gap = '0.4em';
    const effBox = document.createElement('input');
    effBox.type = 'checkbox';
    effBox.checked = false;
    effBox.addEventListener('change', ev => {
      window.shrutiEffects[eff.key] = ev.target.checked;
      // Restart all currently playing notes (stop and start each selected note)
      const state = getState();
      state.selectedNotes.forEach(noteName => {
        stopNote(noteName);
        const idx = NOTES.findIndex(n => n.name === noteName);
        startNote(noteName, idx, state.tuning);
      });
    });
    effLabel.appendChild(effBox);
    effLabel.appendChild(document.createTextNode(eff.label));
    effectsPanel.appendChild(effLabel);
    window.shrutiEffects[eff.key] = false;
  });
  optionsPanel.appendChild(effectsPanel);

  // Transpose
  const transposeLabel = document.createElement('label');
  transposeLabel.textContent = 'Transpose:';
  transposeLabel.style.display = 'block';
  transposeLabel.style.marginTop = '1em';
  const transposeSlider = document.createElement('input');
  transposeSlider.type = 'range';
  transposeSlider.min = -24;
  transposeSlider.max = 24;
  transposeSlider.step = 1;
  transposeSlider.value = getState().transpose;
  transposeSlider.style.width = '100%';
  transposeSlider.className = 'transpose-slider';
  transposeLabel.appendChild(transposeSlider);
  const transposeValue = document.createElement('span');
  transposeValue.textContent = ' ' + getState().transpose + ' semitones';
  transposeLabel.appendChild(transposeValue);
  optionsPanel.appendChild(transposeLabel);

  transposeSlider.addEventListener('input', () => {
    setState({ transpose: parseInt(transposeSlider.value, 10) });
    transposeValue.textContent = ' ' + transposeSlider.value + ' semitones';
    updateTranspose();
  });

  // Volume
  const volLabel = document.createElement('label');
  volLabel.textContent = 'Volume:';
  volLabel.style.display = 'block';
  volLabel.style.marginTop = '1em';
  volSlider = document.createElement('input');
  volSlider.type = 'range';
  volSlider.min = 0;
  volSlider.max = 1;
  volSlider.step = 0.01;
  volSlider.value = getState().volume;
  volSlider.style.width = '100%';
  volSlider.className = 'volume-slider';
  volLabel.appendChild(volSlider);
  optionsPanel.appendChild(volLabel);

  volSlider.addEventListener('input', () => {
    setState({ volume: parseFloat(volSlider.value) });
    setVolume(parseFloat(volSlider.value));
  });

  app.appendChild(optionsPanel);


  document.body.appendChild(app);

  // Start audio as soon as the page loads
  let isPlaying = true;
  initAudio();
  getState().selectedNotes.forEach(noteName => {
    const idx = NOTES.findIndex(n => n.name === noteName);
    startNote(noteName, idx, getState().tuning);
  });

  tuningSelect.addEventListener('change', () => {
    setState({ tuning: tuningSelect.value });
    updateTuning(tuningSelect.value);
    tuningDesc.textContent = tuningExplanations[tuningSelect.value];
  });

  // Note toggles
  document.querySelectorAll('.note-toggle').forEach(cb => {
    cb.addEventListener('change', () => {
      const noteName = cb.getAttribute('data-note');
      let selected = getState().selectedNotes.slice();
      if (cb.checked && !selected.includes(noteName)) {
        selected.push(noteName);
        setState({ selectedNotes: selected });
        if (isPlaying) {
          const idx = NOTES.findIndex(n => n.name === noteName);
          startNote(noteName, idx, getState().tuning);
        }
      } else if (!cb.checked && selected.includes(noteName)) {
        selected = selected.filter(n => n !== noteName);
        setState({ selectedNotes: selected });
        if (isPlaying) stopNote(noteName);
      }
    });
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    const key = e.key.toUpperCase();
    const idx = NOTES.findIndex(n => n.key === key);
    if (idx !== -1) {
      const toggles = Array.from(document.querySelectorAll('.note-toggle'));
      const toggle = toggles.find(cb => cb.getAttribute('data-key') === key);
      if (toggle) {
        toggle.checked = !toggle.checked;
        toggle.dispatchEvent(new Event('change'));
      }
      e.preventDefault();
    }
  });

  // Sync UI with state
  subscribe(state => {
    // Update checkboxes
    document.querySelectorAll('.note-toggle').forEach(cb => {
      const noteName = cb.getAttribute('data-note');
      cb.checked = state.selectedNotes.includes(noteName);
    });
    volSlider.value = state.volume;
    tuningSelect.value = state.tuning;
    tuningDesc.textContent = tuningExplanations[state.tuning];
  });
}
