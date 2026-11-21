import { SCENES, DIFF_COUNTS } from './scenes.js';
import { paintScene, propCenter } from './painter.js';

const VIRTUAL_W = 1000;
const VIRTUAL_H = 600;
const MISS_COOLDOWN = 400;

function createGame(canvasL, canvasR, hooks = {}) {
  let state = 'menu';
  let levelIndex = 0;
  let score = 0;
  let streak = 0;
  let hintsLeft = 2;
  let timeLeft = 0;
  let timeTotal = 0;
  let lastTime = 0;
  let rafId = null;
  let paused = false;
  let foundDiffs = new Set();
  let mutatedProps = new Set();
  let activeDiffs = [];
  let hintPulse = null;
  let hintPulseTime = 0;
  let missCooldownUntil = 0;
  let phase = 0;

  function getScale(canvas) {
    const scaleX = canvas.width / VIRTUAL_W;
    const scaleY = canvas.height / VIRTUAL_H;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (canvas.width - VIRTUAL_W * scale) / 2;
    const offsetY = (canvas.height - VIRTUAL_H * scale) / 2;
    return { scale, offsetX, offsetY };
  }

  function virtualToCanvas(canvas, vx, vy) {
    const { scale, offsetX, offsetY } = getScale(canvas);
    return { x: vx * scale + offsetX, y: vy * scale + offsetY };
  }

  function canvasToVirtual(canvas, cx, cy) {
    const { scale, offsetX, offsetY } = getScale(canvas);
    return { x: (cx - offsetX) / scale, y: (cy - offsetY) / scale };
  }

  function loadLevel(idx) {
    levelIndex = idx;
    const scene = SCENES[levelIndex];
    const diffCount = DIFF_COUNTS[levelIndex];
    activeDiffs = scene.diffs.slice(0, diffCount);
    foundDiffs.clear();
    mutatedProps.clear();
    hintsLeft = 2;
    streak = 0;
    timeTotal = 95 - 5 * levelIndex;
    timeLeft = timeTotal;
    hintPulse = null;
    hintPulseTime = 0;
    missCooldownUntil = 0;
    state = 'play';
  }

  function applyMutations() {
    mutatedProps.clear();
    for (const diff of activeDiffs) {
      mutatedProps.add(diff.prop);
    }
  }

  function hitTest(vx, vy) {
    for (const diff of activeDiffs) {
      if (foundDiffs.has(diff.id)) continue;
      const dx = vx - diff.cx;
      const dy = vy - diff.cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= diff.r) {
        return diff;
      }
    }
    return null;
  }

  function findNearestUnhinted() {
    let nearest = null;
    let nearestDist = Infinity;
    const centerX = VIRTUAL_W / 2;
    const centerY = VIRTUAL_H / 2;
    for (const diff of activeDiffs) {
      if (foundDiffs.has(diff.id)) continue;
      const dx = diff.cx - centerX;
      const dy = diff.cy - centerY;
      const dist = dx * dx + dy * dy;
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = diff;
      }
    }
    return nearest;
  }

  function draw() {
    const ctxL = canvasL.getContext('2d');
    const ctxR = canvasR.getContext('2d');
    const scene = SCENES[levelIndex];

    ctxL.clearRect(0, 0, canvasL.width, canvasL.height);
    ctxR.clearRect(0, 0, canvasR.width, canvasR.height);

    if (state === 'menu') {
      paintScene(ctxL, scene, canvasL.width, canvasL.height, new Set(), phase);
      paintScene(ctxR, scene, canvasR.width, canvasR.height, new Set(), phase);
      drawDimmedOverlay(ctxL);
      drawDimmedOverlay(ctxR);
      drawMenuText(ctxL);
      drawMenuText(ctxR);
      return;
    }

    applyMutations();

    paintScene(ctxL, scene, canvasL.width, canvasL.height, new Set(), phase);
    paintScene(ctxR, scene, canvasR.width, canvasR.height, mutatedProps, phase);

    if (hintPulse && Date.now() - hintPulseTime < 1500) {
      drawHintPulse(ctxL, hintPulse);
      drawHintPulse(ctxR, hintPulse);
    }

    if (state === 'clear') {
      drawClearOverlay(ctxL);
      drawClearOverlay(ctxR);
    } else if (state === 'over') {
      drawOverOverlay(ctxL);
      drawOverOverlay(ctxR);
    } else if (paused) {
      drawPauseOverlay(ctxL);
      drawPauseOverlay(ctxR);
    }

    if (hooks.onAfterDraw) hooks.onAfterDraw();
  }

  function drawDimmedOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  function drawMenuText(ctx) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ODDITORIUM', ctx.canvas.width / 2, ctx.canvas.height / 2 - 40);
    ctx.font = '18px sans-serif';
    ctx.fillText('Click to start', ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
  }

  function drawClearOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 100, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL CLEAR!', ctx.canvas.width / 2, ctx.canvas.height / 2);
  }

  function drawOverOverlay(ctx) {
    ctx.fillStyle = 'rgba(100, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);
    ctx.font = '20px sans-serif';
    ctx.fillText(`Score: ${score}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 30);
  }

  function drawPauseOverlay(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', ctx.canvas.width / 2, ctx.canvas.height / 2);
  }

  function drawHintPulse(ctx, diff) {
    const { scale, offsetX, offsetY } = getScale(ctx.canvas);
    const x = diff.cx * scale + offsetX;
    const y = diff.cy * scale + offsetY;
    const r = diff.r * scale;
    const pulse = 1 + 0.3 * Math.sin((Date.now() - hintPulseTime) * 0.01);
    ctx.strokeStyle = `rgba(255, 255, 0, ${0.8 * (1 - (Date.now() - hintPulseTime) / 1500)})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    phase += dt;

    if (!paused && state === 'play') {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame();
      }
    }

    if (hooks.onTick) {
      const found = foundDiffs.size;
      const total = activeDiffs.length;
      const streakMult = Math.min(Math.max(streak, 1), 4);
      hooks.onTick(timeLeft, timeTotal, score, streak, streakMult, found, total);
    }

    draw();
    if (hooks.onFrame) hooks.onFrame();
    rafId = requestAnimationFrame(loop);
  }

  function onClick(canvas, event) {
    if (state !== 'play' || paused) return;
    const now = Date.now();
    if (now < missCooldownUntil) return;
    const rect = canvas.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;
    const { x: vx, y: vy } = canvasToVirtual(canvas, cx, cy);
    const diff = hitTest(vx, vy);

    if (diff) {
      foundDiffs.add(diff.id);
      streak = Math.min(streak + 1, 4);
      const points = 100 * streak;
      score += points;
      if (hooks.onFind) hooks.onFind(diff, vx, vy);
      if (foundDiffs.size === activeDiffs.length) {
        levelClear();
      }
    } else {
      streak = 0;
      timeLeft = Math.max(0, timeLeft - 3);
      missCooldownUntil = now + MISS_COOLDOWN;
      if (hooks.onMiss) hooks.onMiss(vx, vy);
      if (timeLeft <= 0) endGame();
    }
  }

  function levelClear() {
    state = 'clear';
    const timeBonus = Math.floor(timeLeft * 2);
    score += timeBonus;
    if (hooks.onLevelClear) {
      hooks.onLevelClear({ level: levelIndex, timeBonus, score });
    }
  }

  function endGame() {
    state = 'over';
    if (hooks.onGameOver) hooks.onGameOver({ score });
  }

  function start(idx = 0) {
    loadLevel(idx);
    lastTime = 0;
    phase = 0;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  function nextLevel() {
    if (levelIndex + 1 >= SCENES.length) return;
    loadLevel(levelIndex + 1);
  }

  function useHint() {
    if (state !== 'play' || hintsLeft <= 0) return;
    const diff = findNearestUnhinted();
    if (!diff) return;
    hintsLeft--;
    timeLeft = Math.max(0, timeLeft - 8);
    hintPulse = diff;
    hintPulseTime = Date.now();
    if (hooks.onHint) hooks.onHint(diff);
  }

  function pauseToggle() {
    if (state !== 'play' && state !== 'clear') return;
    paused = !paused;
    if (!paused) lastTime = 0;
  }

  function getState() {
    return {
      state,
      levelIndex,
      score,
      streak,
      hintsLeft,
      timeLeft,
      timeTotal,
      found: foundDiffs.size,
      total: activeDiffs.length,
      paused,
      foundDiffs,
      hintPulse,
      activeDiffs
    };
  }

  canvasL.addEventListener('click', (e) => onClick(canvasL, e));
  canvasR.addEventListener('click', (e) => onClick(canvasR, e));

  const engine = { start, nextLevel, useHint, pauseToggle, getState };
  if (typeof window !== 'undefined') window.__odditorium = { engine };
  return engine;
}

export { createGame };