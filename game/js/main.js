import { SCENES } from './scenes.js';
import { createGame } from './engine.js';
import { bindHud } from './hud.js';
import { makeAudio } from './audio.js';
import { MarkerLayer } from './fx.js';

const panelL = document.getElementById('panelL');
const panelR = document.getElementById('panelR');

const audio = makeAudio();

const markerL = new MarkerLayer(panelL);
const markerR = new MarkerLayer(panelR);

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
}

function handleResize() {
  resizeCanvas(panelL);
  resizeCanvas(panelR);
}

const engine = createGame(panelL, panelR, {
  onTick: (timeLeft, timeTotal, score, streak, streakMult, found, total) => {
    if (audio.tick) audio.tick();
    window.dispatchEvent(new CustomEvent('odditorium-tick', { detail: [timeLeft, timeTotal, score, streak, streakMult, found, total] }));
  },
  onFind: (diff, vx, vy) => {
    audio.find();
    const { scale, offsetX, offsetY } = getScale(panelL);
    const x = diff.cx * scale + offsetX;
    const y = diff.cy * scale + offsetY;
    const sparks = Array.from({ length: 12 }, (_, i) => {
      const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.3;
      return { x, y, angle, speed: 60 + Math.random() * 80, color: ['#ffd700', '#fff8dc', '#ffeb3b', '#fff'][Math.floor(Math.random() * 4)], born: performance.now(), len: 8 + Math.random() * 12 };
    });
    markerL.sparks.push(...sparks);
    markerR.sparks.push(...sparks);
    window.dispatchEvent(new CustomEvent('odditorium-find', { detail: [diff] }));
  },
  onMiss: (vx, vy) => {
    audio.miss();
    const { scale, offsetX, offsetY } = getScale(panelL);
    const x = vx * scale + offsetX;
    const y = vy * scale + offsetY;
    markerL.missFlash = { x, y, time: performance.now() };
    markerR.missFlash = { x, y, time: performance.now() };
    window.dispatchEvent(new CustomEvent('odditorium-miss', { detail: [] }));
  },
  onHint: (diff) => {
    audio.hint();
    window.dispatchEvent(new CustomEvent('odditorium-hint', { detail: [diff] }));
  },
  onLevelClear: (data) => {
    audio.fanfare();
    window.dispatchEvent(new CustomEvent('odditorium-clear', { detail: [data] }));
  },
  onGameOver: (data) => {
    window.dispatchEvent(new CustomEvent('odditorium-over', { detail: [data] }));
  },
  onFrame: () => drawMarkers(engine.getState())
});

function getScale(canvas) {
  const VIRTUAL_W = 1000;
  const VIRTUAL_H = 600;
  const scaleX = canvas.width / VIRTUAL_W;
  const scaleY = canvas.height / VIRTUAL_H;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (canvas.width - VIRTUAL_W * scale) / 2;
  const offsetY = (canvas.height - VIRTUAL_H * scale) / 2;
  return { scale, offsetX, offsetY };
}

function panelScale(canvas) {
  const scale = Math.min(canvas.width / 1000, canvas.height / 600);
  const offsetX = (canvas.width - 1000 * scale) / 2;
  const offsetY = (canvas.height - 600 * scale) / 2;
  return { scale, offsetX, offsetY };
}

function mapTo(canvas, x, y) {
  const { scale, offsetX, offsetY } = panelScale(canvas);
  return { x: x * scale + offsetX, y: y * scale + offsetY };
}

function drawMarkers(engineState) {
  const scene = SCENES[engineState.levelIndex];
  if (engineState.state === 'menu') {
    markerL.draw(new Map(), null, null);
    markerR.draw(new Map(), null, null);
    return;
  }
  const collect = (canvas) => {
    const foundDiffs = new Map();
    if (scene.diffs) {
      for (const d of scene.diffs) {
        if (engineState.foundDiffs && engineState.foundDiffs.has(d.id)) {
          const p = mapTo(canvas, d.cx, d.cy);
          foundDiffs.set(d.id, { x: p.x, y: p.y, r: d.r * panelScale(canvas).scale });
        }
      }
    }
    return foundDiffs;
  };
  const pulse = (canvas) => {
    if (!engineState.hintPulse) return null;
    const p = mapTo(canvas, engineState.hintPulse.cx, engineState.hintPulse.cy);
    return { x: p.x, y: p.y, r: engineState.hintPulse.r * panelScale(canvas).scale };
  };
  markerL.draw(collect(markerL.canvas), pulse(markerL.canvas), markerL.missFlash);
  markerR.draw(collect(markerR.canvas), pulse(markerR.canvas), markerR.missFlash);
}

const originalDraw = engine.draw;
engine.draw = function() {
  originalDraw.call(this);
  drawMarkers(this.getState());
};

window.addEventListener('resize', handleResize);
handleResize();

bindHud(engine, { audio });

window.__odditorium = { engine };

// draw the brass markers/sparkles over each panel after the engine repaints (its rAF was
// registered first, so a later rAF always lands on the freshly painted frame)
// start the engine; markers are stamped by hooks.onFrame after each engine repaint
engine.start(0);