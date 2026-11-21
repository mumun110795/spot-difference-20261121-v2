// Double Take — sound. Every effect is synthesised with WebAudio at play
// time: no audio files, nothing to load, and the tunes are original
// two-second ideas, not samples. The context wakes on the first user
// gesture, as browsers require.

let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, at, dur, type = 'sine', gain = 0.16) {
  const a = ac();
  if (!a || muted) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  const t0 = a.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sound = {
  unlock() { ac(); },
  find() { tone(659.25, 0, 0.14, 'sine', 0.18); tone(987.77, 0.07, 0.22, 'sine', 0.18); },
  miss() { tone(196, 0, 0.16, 'square', 0.07); tone(155.56, 0.05, 0.2, 'square', 0.06); },
  hint() { tone(523.25, 0, 0.12, 'triangle', 0.14); tone(783.99, 0.09, 0.18, 'triangle', 0.12); },
  clear() { [523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle', 0.15)); },
  win() { [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.24, 'triangle', 0.15)); },
  tick() { tone(1174.66, 0, 0.05, 'sine', 0.05); },
  toggleMute() { muted = !muted; return muted; },
  isMuted() { return muted; },
};
