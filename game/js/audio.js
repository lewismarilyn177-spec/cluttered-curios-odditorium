let ctx = null;
let masterGain = null;
let muted = false;

function ensureContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function randPitch(base, variance = 0.02) {
  return base * (1 + (Math.random() - 0.5) * variance * 2);
}

function playTone(freq, duration, type = 'sine', gainValue = 0.3, envelope = 'exp') {
  ensureContext();
  if (muted) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(masterGain);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);

  if (envelope === 'exp') {
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  } else {
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
    gain.gain.linearRampToValueAtTime(0, now + duration);
  }

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function find() {
  const base1 = randPitch(880);
  const base2 = randPitch(1320);
  playTone(base1, 0.15, 'sine', 0.25);
  setTimeout(() => playTone(base2, 0.2, 'sine', 0.2), 60);
}

function miss() {
  const base = randPitch(110, 0.05);
  playTone(base, 0.15, 'square', 0.3);
  setTimeout(() => playTone(base * 0.5, 0.2, 'square', 0.25), 80);
}

function hint() {
  playTone(randPitch(1760, 0.01), 0.1, 'sine', 0.15);
}

function fanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => {
    setTimeout(() => playTone(randPitch(n, 0.01), 0.15, 'triangle', 0.2), i * 90);
  });
}

function tick() {
  playTone(randPitch(2000, 0.02), 0.03, 'sine', 0.08, 'lin');
}

function setMute(m) {
  muted = !!m;
  if (masterGain) masterGain.gain.value = muted ? 0 : 1;
}

export function makeAudio() {
  return { find, miss, hint, fanfare, tick, setMute };
}