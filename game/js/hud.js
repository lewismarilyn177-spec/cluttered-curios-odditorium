export function bindHud(engine, opts = {}) {
  const {
    audio,
    onTick,
    onFind,
    onMiss,
    onHint,
    onLevelClear,
    onGameOver,
  } = engine;

  const scoreVal = document.getElementById('scoreVal');
  const streakVal = document.getElementById('streakVal');
  const timerBar = document.getElementById('timerBar');
  const counter = document.getElementById('counter');
  const levelName = document.getElementById('levelName');
  const hintBtn = document.getElementById('hintBtn');
  const hintCount = document.getElementById('hintCount');
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const toast = document.getElementById('toast');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const startBtn = document.getElementById('startBtn');

  let lastFound = 0;
  let lastTotal = 0;

  function showToast(msg, duration = 2000) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  function setLevelTitle(title) {
    levelName.textContent = title;
  }

  function setCounter(found, total) {
    counter.textContent = `${found} of ${total} oddities found`;
  }

  function setHintsLeft(n) {
    hintCount.textContent = n;
    hintBtn.disabled = n <= 0;
  }

  function updateTimerBar(timeLeft, timeTotal) {
    const pct = timeTotal > 0 ? (timeLeft / timeTotal) * 100 : 0;
    timerBar.style.width = `${pct}%`;
    timerBar.classList.toggle('low', timeLeft < 15);
  }

  function showTitleScreen() {
    overlayTitle.textContent = 'Cluttered Curios: Night at the Odditorium';
    overlayText.textContent = "Two panels, ten oddities. Click what differs.";
    startBtn.textContent = 'Start';
    startBtn.onclick = () => {
      overlay.classList.add('hidden');
      engine.start();
    };
    overlay.classList.remove('hidden');
  }

  function showLevelClear({ timeBonus, level, score }) {
    overlayTitle.textContent = 'Level Clear!';
    overlayText.textContent = `Time bonus: +${timeBonus}\nTotal score: ${score}`;
    startBtn.textContent = 'Continue';
    startBtn.onclick = () => {
      overlay.classList.add('hidden');
      engine.nextLevel();
    };
    overlay.classList.remove('hidden');
  }

  function showGameOver({ score }) {
    let rank;
    if (score < 600) rank = 'Apprentice';
    else if (score < 1200) rank = 'Journeyman';
    else if (score < 2000) rank = 'Conservator';
    else rank = 'Grand Curator';
    overlayTitle.textContent = 'Game Over';
    overlayText.textContent = `Final score: ${score}\nCurator Rank: ${rank}`;
    startBtn.textContent = 'Play Again';
    startBtn.onclick = () => {
      overlay.classList.add('hidden');
      engine.start(0);
    };
    overlay.classList.remove('hidden');
  }

  function onEngineTick(timeLeft, timeTotal, score, streak, streakMult, found, total) {
    scoreVal.textContent = score;
    streakVal.textContent = streak;
    updateTimerBar(timeLeft, timeTotal);
    setCounter(found, total);
    lastFound = found;
    lastTotal = total;
  }

  function onEngineFind(diff) {
    showToast(diff.label);
  }

  function onEngineMiss() {
    showToast('Not there — time nibbled');
  }

  function onEngineHint(diff) {
    showToast(`Hint: ${diff.label}`);
  }

  function onEngineLevelClear(data) {
    showLevelClear(data);
  }

  function onEngineGameOver(data) {
    showGameOver(data);
  }

  // the engine's hooks live in main.js; it relays each frame through window events
  window.addEventListener('odditorium-tick', (e) => onEngineTick(...e.detail));
  window.addEventListener('odditorium-find', (e) => onEngineFind(...e.detail));
  window.addEventListener('odditorium-miss', () => onEngineMiss());
  window.addEventListener('odditorium-hint', (e) => onEngineHint(...e.detail));
  window.addEventListener('odditorium-clear', (e) => onEngineLevelClear(...e.detail));
  window.addEventListener('odditorium-over', (e) => onEngineGameOver(...e.detail));

  function muteToggle() {
    if (!audio || !audio.setMute) return;
    const muted = audio.setMute();
    muteIcon.textContent = muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
  }

  muteBtn.addEventListener('click', muteToggle);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') muteToggle();
    else if (e.key === 'h' || e.key === 'H') engine.useHint();
    else if (e.key === 'p' || e.key === 'P') engine.pauseToggle();
  });

  const firstScene = engine.getState ? engine.getState().levelIndex : 0;
  const scenes = (typeof SCENES !== 'undefined') ? SCENES : null;
  if (scenes && scenes[firstScene]) {
    setLevelTitle(scenes[firstScene].title);
  } else {
    setLevelTitle("Odditorium — Gallery I");
  }
  setHintsLeft(2);

  showTitleScreen();
}