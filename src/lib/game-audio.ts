// Lightweight Web Audio synth for game SFX + a simple looping music bed.
// No external assets required.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicNodes: { osc: OscillatorNode; gain: GainNode; interval: number } | null = null;
let muted = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.4;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType = "square", vol = 0.3) {
  const c = ensureCtx();
  if (!c || !masterGain) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(g).connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sfx = {
  flap: () => beep(520, 0.09, "square", 0.25),
  score: () => {
    beep(700, 0.08, "triangle", 0.3);
    setTimeout(() => beep(950, 0.09, "triangle", 0.3), 70);
  },
  hit: () => {
    beep(180, 0.18, "sawtooth", 0.4);
    setTimeout(() => beep(90, 0.25, "sawtooth", 0.4), 120);
  },
};

// Simple 4-note looping bassline as ambient music.
const NOTES = [196, 246.94, 293.66, 246.94]; // G3 B3 D4 B3
export function startMusic() {
  const c = ensureCtx();
  if (!c || !masterGain || musicNodes) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  g.gain.value = 0.08;
  osc.connect(g).connect(masterGain);
  osc.start();
  let i = 0;
  osc.frequency.setValueAtTime(NOTES[0], c.currentTime);
  const interval = window.setInterval(() => {
    if (!ctx) return;
    i = (i + 1) % NOTES.length;
    osc.frequency.setValueAtTime(NOTES[i], ctx.currentTime);
  }, 500);
  musicNodes = { osc, gain: g, interval };
}

export function stopMusic() {
  if (!musicNodes) return;
  clearInterval(musicNodes.interval);
  try {
    musicNodes.osc.stop();
  } catch {}
  musicNodes.osc.disconnect();
  musicNodes.gain.disconnect();
  musicNodes = null;
}

export function setMuted(m: boolean) {
  muted = m;
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(m ? 0 : 0.4, ctx.currentTime);
  }
}

export function isMuted() {
  return muted;
}
