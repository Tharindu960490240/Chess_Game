// Small synthesized sound set (no audio files needed).
let ctx = null;
export const sound = { enabled: true };

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function knock(t, freq, gain, len) {
  const c = ac(); if (!c) return;
  const n = Math.floor(c.sampleRate * len);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1.4;
  const g = c.createGain(); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(c.destination);
  src.start(c.currentTime + t);
}

function tone(t, freq, gain, len, type) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(); o.type = type || 'sine'; o.frequency.value = freq;
  const g = c.createGain();
  const s = c.currentTime + t;
  g.gain.setValueAtTime(0.0001, s);
  g.gain.exponentialRampToValueAtTime(gain, s + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, s + len);
  o.connect(g); g.connect(c.destination);
  o.start(s); o.stop(s + len + 0.05);
}

export function play(kind) {
  if (!sound.enabled) return;
  switch (kind) {
    case 'move': knock(0, 1400, 1.6, 0.07); break;
    case 'capture': knock(0, 900, 2.2, 0.09); knock(0.05, 1500, 1.2, 0.06); break;
    case 'castle': knock(0, 1400, 1.4, 0.07); knock(0.09, 1250, 1.4, 0.07); break;
    case 'check': knock(0, 1200, 1.4, 0.07); tone(0.02, 880, 0.08, 0.25, 'triangle'); break;
    case 'end': tone(0, 523, 0.08, 0.6); tone(0.12, 659, 0.08, 0.6); tone(0.24, 784, 0.08, 0.8); break;
    case 'low': tone(0, 660, 0.05, 0.12, 'square'); break;
    case 'start': tone(0, 587, 0.06, 0.25); tone(0.1, 880, 0.06, 0.35); break;
  }
}

export function unlock() { ac(); }
