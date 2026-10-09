/* ==========================================================================
   CARROM BOARD - BOARD CLEARANCE MODE, PINK QUEEN WITH STAR & CELEBRATION
   ========================================================================== */

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(type, intensity = 1) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const vol = Math.min(1, Math.max(0.12, intensity));

  if (type === 'strike') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.85 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'cushion') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(0.7 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'pocket') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } else if (type === 'foul') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(110, now + 0.1);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  } else if (type === 'win') {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.65, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.45);
    });
  }
}

// Board Dimensions
const C_SIZE = 600;
const BOARD_MARGIN = 24;
const POCKET_RADIUS = 28;
const POCKETS = [
  { x: BOARD_MARGIN + 16, y: BOARD_MARGIN + 16 },
  { x: C_SIZE - BOARD_MARGIN - 16, y: BOARD_MARGIN + 16 },
  { x: BOARD_MARGIN + 16, y: C_SIZE - BOARD_MARGIN - 16 },
  { x: C_SIZE - BOARD_MARGIN - 16, y: C_SIZE - BOARD_MARGIN - 16 }
];

const COIN_RADIUS = 15;
const STRIKER_RADIUS = 20.5;

const FRICTION = 0.9885;
const MAX_FLICK_SPEED = 52.0;

let pieces = [];
let striker = null;
let currentTurn = 1;
let gameActive = false;
let isPhysicsActive = false;
let gameMode = 'pve-medium';
let matchRuleStyle = 'clearance'; // 'clearance', 'points', or 'championship'
let targetPoints = 12;

let scores = { 1: 0, 2: 0 };
let pocketedHistory = { 1: [], 2: [] };
let playerNames = { 1: 'Player 1', 2: 'Bot (Medium)' };

// Queen State
let queenPocketedBy = null;
let queenCovered = false;

let coinsPocketedThisTurn = [];
let strikerPocketedThisTurn = false;

// Direct interaction
let isPositioningStriker = false;
let isAimingFlick = false;
let dragStartX = 0;
let dragStartY = 0;
let dragCurrentX = 0;
let dragCurrentY = 0;

let canvas, ctx;
let turnText, turnColorDot, modeDisplay, queenStatusText, statusMsg;
let cardP1, cardP2, p1Name, p2Name, p1Score, p2Score, p1Tray, p2Tray, p1SubInfo, p2SubInfo;
let powerFill, powerNum, setupModal, themeModal, exitModal, rulesModal, gameOverModal;
let modeSelect, gameTypeSelect, p1NameInput, p2NameInput, p2NameGroup;
let startGameBtn, themeBtn, closeThemeBtn, rulesBtn, closeRulesBtn;
let exitBtn, confirmExitBtn, cancelExitBtn, modalExitBtn, gameOverExitBtn;
let restartBtn, playAgainBtn, soundBtn, confettiContainer;
let winnerTitle, winnerDesc;

function init() {
  cacheDOM();
  bindEvents();
  setupModal.classList.remove('hidden');
  startNewGame();
}

function cacheDOM() {
  canvas = document.getElementById('carrom-canvas');
  ctx = canvas.getContext('2d');

  turnText = document.getElementById('turn-text');
  turnColorDot = document.getElementById('turn-color-dot');
  modeDisplay = document.getElementById('mode-display');
  queenStatusText = document.getElementById('queen-status-text');
  statusMsg = document.getElementById('status-msg');

  cardP1 = document.getElementById('card-p1');
  cardP2 = document.getElementById('card-p2');
  p1Name = document.getElementById('p1-name');
  p2Name = document.getElementById('p2-name');
  p1Score = document.getElementById('p1-score');
  p2Score = document.getElementById('p2-score');
  p1Tray = document.getElementById('p1-pocketed-tray');
  p2Tray = document.getElementById('p2-pocketed-tray');
  p1SubInfo = document.getElementById('p1-sub-info');
  p2SubInfo = document.getElementById('p2-sub-info');

  powerFill = document.getElementById('power-fill');
  powerNum = document.getElementById('power-num');

  setupModal = document.getElementById('setup-modal');
  themeModal = document.getElementById('theme-modal');
  exitModal = document.getElementById('exit-modal');
  rulesModal = document.getElementById('rules-modal');
  gameOverModal = document.getElementById('game-over-modal');

  modeSelect = document.getElementById('mode-select');
  gameTypeSelect = document.getElementById('game-type-select');
  p1NameInput = document.getElementById('p1-name-input');
  p2NameInput = document.getElementById('p2-name-input');
  p2NameGroup = document.getElementById('p2-name-group');

  startGameBtn = document.getElementById('start-game-btn');
  themeBtn = document.getElementById('theme-btn');
  closeThemeBtn = document.getElementById('close-theme-btn');
  rulesBtn = document.getElementById('rules-btn');
  closeRulesBtn = document.getElementById('close-rules-btn');
  exitBtn = document.getElementById('exit-btn');
  confirmExitBtn = document.getElementById('confirm-exit-btn');
  cancelExitBtn = document.getElementById('cancel-exit-btn');
  modalExitBtn = document.getElementById('modal-exit-btn');
  gameOverExitBtn = document.getElementById('gameover-exit-btn');
  restartBtn = document.getElementById('restart-btn');
  playAgainBtn = document.getElementById('play-again-btn');
  soundBtn = document.getElementById('sound-btn');
  confettiContainer = document.getElementById('confetti-container');
  winnerTitle = document.getElementById('winner-title');
  winnerDesc = document.getElementById('winner-desc');
}

function bindEvents() {
  document.body.addEventListener('click', () => getAudioContext(), { once: true });

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
    });
  }

  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      p2NameGroup.style.display = e.target.value === 'pvp' ? 'block' : 'none';
    });
  }

  canvas.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  canvas.addEventListener('touchstart', (e) => onPointerDown(e.touches[0]), { passive: false });
  window.addEventListener('touchmove', (e) => {
    if (isPositioningStriker || isAimingFlick) {
      e.preventDefault();
      onPointerMove(e.touches[0]);
    }
  }, { passive: false });
  window.addEventListener('touchend', onPointerUp);

  themeBtn.addEventListener('click', () => themeModal.classList.remove('hidden'));
  closeThemeBtn.addEventListener('click', () => themeModal.classList.add('hidden'));
  rulesBtn.addEventListener('click', () => rulesModal.classList.remove('hidden'));
  closeRulesBtn.addEventListener('click', () => rulesModal.classList.add('hidden'));
  restartBtn.addEventListener('click', () => setupModal.classList.remove('hidden'));

  exitBtn.addEventListener('click', () => exitModal.classList.remove('hidden'));
  cancelExitBtn.addEventListener('click', () => exitModal.classList.add('hidden'));
  confirmExitBtn.addEventListener('click', () => window.location.href = '../../index.html');
  modalExitBtn.addEventListener('click', () => window.location.href = '../../index.html');
  gameOverExitBtn.addEventListener('click', () => window.location.href = '../../index.html');

  startGameBtn.addEventListener('click', () => {
    gameMode = modeSelect.value;
    matchRuleStyle = gameTypeSelect.value;

    if (matchRuleStyle === 'points') targetPoints = 12;
    else if (matchRuleStyle === 'championship') targetPoints = 21;
    else targetPoints = 999; // Clearance mode

    playerNames[1] = p1NameInput.value.trim() || 'Player 1';
    if (gameMode === 'pvp') {
      playerNames[2] = p2NameInput.value.trim() || 'Player 2';
    } else {
      const label = modeSelect.options[modeSelect.selectedIndex].text.replace('vs Computer ', '');
      playerNames[2] = `Bot ${label}`;
    }

    modeDisplay.textContent = (matchRuleStyle === 'clearance')
      ? `${modeSelect.options[modeSelect.selectedIndex].text} (Clearance)`
      : modeSelect.options[modeSelect.selectedIndex].text;

    setupModal.classList.add('hidden');
    startNewGame();
  });

  playAgainBtn.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    setupModal.classList.remove('hidden');
  });

  document.querySelectorAll('[data-board]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-board]').forEach(b => b.classList.toggle('active', b.dataset.board === btn.dataset.board));
      document.body.setAttribute('data-board-theme', btn.dataset.board);
      drawScene();
    });
  });

  document.querySelectorAll('[data-striker]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-striker]').forEach(b => b.classList.toggle('active', b.dataset.striker === btn.dataset.striker));
      if (striker) striker.theme = btn.dataset.striker;
      drawScene();
    });
  });
}

function startNewGame() {
  scores = { 1: 0, 2: 0 };
  pocketedHistory = { 1: [], 2: [] };
  queenPocketedBy = null;
  queenCovered = false;
  currentTurn = 1;
  gameActive = true;

  resetBoardLayout();
  updateUI();
  drawScene();
}

function resetBoardLayout() {
  pieces = [];
  const cx = C_SIZE / 2;
  const cy = C_SIZE / 2;
  const r = COIN_RADIUS;

  // Center Pink Queen
  pieces.push({ id: 'queen', type: 'queen', x: cx, y: cy, vx: 0, vy: 0, radius: r, pocketed: false });

  // Inner ring: 6 coins
  const innerRadius = r * 2.05;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const type = i % 2 === 0 ? 'white' : 'black';
    pieces.push({
      id: `in_${i}`,
      type,
      x: cx + Math.cos(angle) * innerRadius,
      y: cy + Math.sin(angle) * innerRadius,
      vx: 0, vy: 0,
      radius: r,
      pocketed: false
    });
  }

  // Outer ring: 12 coins
  const outerRadius = r * 3.95;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const type = (Math.floor(i / 2) % 2 === 0) ? 'white' : 'black';
    pieces.push({
      id: `out_${i}`,
      type,
      x: cx + Math.cos(angle) * outerRadius,
      y: cy + Math.sin(angle) * outerRadius,
      vx: 0, vy: 0,
      radius: r,
      pocketed: false
    });
  }

  setupStrikerForTurn();
}

function setupStrikerForTurn() {
  isPhysicsActive = false;
  isPositioningStriker = false;
  isAimingFlick = false;
  coinsPocketedThisTurn = [];
  strikerPocketedThisTurn = false;

  const baselineY = (currentTurn === 1) ? (C_SIZE - 105) : 105;
  const activeStrikerTheme = document.querySelector('[data-striker].active')?.dataset.striker || 'tournament-geometric';

  striker = {
    x: C_SIZE / 2,
    y: baselineY,
    vx: 0,
    vy: 0,
    radius: STRIKER_RADIUS,
    baselineY,
    theme: activeStrikerTheme,
    pocketed: false
  };

  statusMsg.textContent = `${playerNames[currentTurn]}: Click/drag baseline to position striker, pull to flick!`;
  drawScene();

  if (gameActive && gameMode !== 'pvp' && currentTurn === 2) {
    statusMsg.textContent = `${playerNames[2]} is positioning striker & aiming...`;
    setTimeout(botShoot, 700);
  }
}

function clampStrikerX(x) {
  const minX = 145;
  const maxX = C_SIZE - 145;
  return Math.max(minX, Math.min(maxX, x));
}

function checkStrikerOverlap(x, y) {
  for (const p of pieces) {
    if (!p.pocketed) {
      const dist = Math.hypot(x - p.x, y - p.y);
      if (dist < STRIKER_RADIUS + p.radius) {
        return true;
      }
    }
  }
  return false;
}

function onPointerDown(e) {
  if (!gameActive || isPhysicsActive || !striker || (gameMode !== 'pvp' && currentTurn === 2)) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = C_SIZE / rect.width;
  const scaleY = C_SIZE / rect.height;

  const clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  const clientY = e.clientY !== undefined ? e.clientY : e.pageY;

  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;

  const distToStriker = Math.hypot(x - striker.x, y - striker.y);
  const baselineDistY = Math.abs(y - striker.baselineY);

  if (distToStriker <= striker.radius + 15) {
    isAimingFlick = true;
    dragStartX = striker.x;
    dragStartY = striker.y;
    dragCurrentX = x;
    dragCurrentY = y;
  } else if (baselineDistY <= 26 && x >= 135 && x <= C_SIZE - 135) {
    const candidateX = clampStrikerX(x);
    if (!checkStrikerOverlap(candidateX, striker.baselineY)) {
      striker.x = candidateX;
      isPositioningStriker = true;
      drawScene();
    } else {
      statusMsg.textContent = "Striker touches coin! Choose a clear baseline spot.";
    }
  }
}

function onPointerMove(e) {
  if (!isAimingFlick && !isPositioningStriker) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = C_SIZE / rect.width;
  const scaleY = C_SIZE / rect.height;

  const clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  const clientY = e.clientY !== undefined ? e.clientY : e.pageY;

  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;

  if (isPositioningStriker) {
    const candidateX = clampStrikerX(x);
    if (!checkStrikerOverlap(candidateX, striker.baselineY)) {
      striker.x = candidateX;
    }
    drawScene();
  } else if (isAimingFlick) {
    dragCurrentX = x;
    dragCurrentY = y;

    const pullDist = Math.hypot(dragCurrentX - dragStartX, dragCurrentY - dragStartY);
    const maxPull = 140;
    const power = Math.min(100, Math.round((pullDist / maxPull) * 100));

    powerFill.style.width = `${power}%`;
    powerNum.textContent = `${power}%`;
    drawScene();
  }
}

function onPointerUp() {
  if (isPositioningStriker) {
    isPositioningStriker = false;
    return;
  }

  if (isAimingFlick) {
    isAimingFlick = false;

    const dx = dragStartX - dragCurrentX;
    const dy = dragStartY - dragCurrentY;
    const pullDist = Math.hypot(dx, dy);

    if (pullDist > 10) {
      const maxPull = 140;
      const forceRatio = Math.min(pullDist, maxPull) / maxPull;

      const speed = Math.pow(forceRatio, 1.12) * MAX_FLICK_SPEED;
      const angle = Math.atan2(dy, dx);
      striker.vx = Math.cos(angle) * speed;
      striker.vy = Math.sin(angle) * speed;

      playSound('strike', Math.max(0.3, forceRatio));
      isPhysicsActive = true;
      requestAnimationFrame(updatePhysicsLoop);
    }

    powerFill.style.width = '0%';
    powerNum.textContent = '0%';
    drawScene();
  }
}

function updatePhysicsLoop() {
  let anyMoving = false;
  const allObjects = pieces.filter(p => !p.pocketed);
  if (striker && !striker.pocketed) allObjects.push(striker);

  const steps = 4;
  for (let step = 0; step < steps; step++) {
    for (const obj of allObjects) {
      obj.x += (obj.vx / steps);
      obj.y += (obj.vy / steps);

      const minB = BOARD_MARGIN + obj.radius;
      const maxB = C_SIZE - BOARD_MARGIN - obj.radius;

      if (obj.x < minB) { obj.x = minB; obj.vx = -obj.vx * 0.94; if (step === 0) playSound('cushion', Math.abs(obj.vx) / 25); }
      if (obj.x > maxB) { obj.x = maxB; obj.vx = -obj.vx * 0.94; if (step === 0) playSound('cushion', Math.abs(obj.vx) / 25); }
      if (obj.y < minB) { obj.y = minB; obj.vy = -obj.vy * 0.94; if (step === 0) playSound('cushion', Math.abs(obj.vy) / 25); }
      if (obj.y > maxB) { obj.y = maxB; obj.vy = -obj.vy * 0.94; if (step === 0) playSound('cushion', Math.abs(obj.vy) / 25); }

      for (const p of POCKETS) {
        const dist = Math.hypot(obj.x - p.x, obj.y - p.y);
        if (dist < POCKET_RADIUS) {
          handlePocketDrop(obj);
          break;
        }
      }
    }

    for (let i = 0; i < allObjects.length; i++) {
      for (let j = i + 1; j < allObjects.length; j++) {
        const o1 = allObjects[i];
        const o2 = allObjects[j];
        if (o1.pocketed || o2.pocketed) continue;

        const dx = o2.x - o1.x;
        const dy = o2.y - o1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = o1.radius + o2.radius;

        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;

          o1.x -= nx * overlap;
          o1.y -= ny * overlap;
          o2.x += nx * overlap;
          o2.y += ny * overlap;

          const kx = o1.vx - o2.vx;
          const ky = o1.vy - o2.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          o1.vx -= p * nx * 0.98;
          o1.vy -= p * ny * 0.98;
          o2.vx += p * nx * 0.98;
          o2.vy += p * ny * 0.98;

          const impactSpeed = Math.hypot(kx, ky);
          if (impactSpeed > 0.6 && step === 0) {
            playSound('strike', Math.min(1, impactSpeed / 20));
          }
        }
      }
    }
  }

  for (const obj of allObjects) {
    obj.vx *= FRICTION;
    obj.vy *= FRICTION;

    if (Math.hypot(obj.vx, obj.vy) > 0.09) {
      anyMoving = true;
    } else {
      obj.vx = 0;
      obj.vy = 0;
    }
  }

  drawScene();

  if (anyMoving) {
    requestAnimationFrame(updatePhysicsLoop);
  } else {
    onTurnEnd();
  }
}

function handlePocketDrop(obj) {
  obj.pocketed = true;
  obj.vx = 0;
  obj.vy = 0;
  playSound('pocket');

  if (obj === striker) {
    strikerPocketedThisTurn = true;
  } else {
    coinsPocketedThisTurn.push(obj);
  }
}

/* ==========================================================================
   TURN & OFFICIAL QUEEN COVER RESOLUTION
   ========================================================================== */
function onTurnEnd() {
  isPhysicsActive = false;
  let continueTurn = false;
  const myCoinType = (currentTurn === 1) ? 'white' : 'black';
  const opponentTurn = (currentTurn === 1) ? 2 : 1;

  if (strikerPocketedThisTurn) {
    playSound('foul');
    statusMsg.textContent = `Foul! Striker pocketed by ${playerNames[currentTurn]}.`;
    returnCoinToCenter(myCoinType, currentTurn);

    // If waiting for Queen cover, Queen returns to center
    if (queenPocketedBy === currentTurn && !queenCovered) {
      returnQueenToCenter();
      queenPocketedBy = null;
    }
    continueTurn = false;
  } else {
    let pocketedOwn = false;
    let pocketedQueen = false;

    for (const coin of coinsPocketedThisTurn) {
      if (coin.type === myCoinType) {
        pocketedOwn = true;
        scores[currentTurn] += 1;
        pocketedHistory[currentTurn].push('coin');
      } else if (coin.type === 'queen') {
        pocketedQueen = true;
      } else {
        scores[opponentTurn] += 1;
        pocketedHistory[opponentTurn].push('coin');
      }
    }

    // Queen Rules
    if (pocketedQueen) {
      if (queenPocketedBy === null) {
        queenPocketedBy = currentTurn;
        statusMsg.textContent = `${playerNames[currentTurn]} pocketed Pink Queen! Must cover with a coin next shot!`;
        continueTurn = true;
      }
    } else if (queenPocketedBy === currentTurn && !queenCovered) {
      if (pocketedOwn) {
        queenCovered = true;
        scores[currentTurn] += 3;
        pocketedHistory[currentTurn].push('queen');
        statusMsg.textContent = `Queen COVERED by ${playerNames[currentTurn]}! +3 bonus points!`;
        continueTurn = true;
      } else {
        returnQueenToCenter();
        queenPocketedBy = null;
        statusMsg.textContent = "Failed to cover Queen! Pink Queen returned to center.";
        continueTurn = false;
      }
    } else if (pocketedOwn) {
      continueTurn = true;
    }
  }

  updateUI();

  // Check Victory Condition
  const remainingWhite = pieces.filter(p => p.type === 'white' && !p.pocketed).length;
  const remainingBlack = pieces.filter(p => p.type === 'black' && !p.pocketed).length;
  const queenOnBoard = pieces.find(p => p.type === 'queen' && !p.pocketed);

  let victoryWinner = null;

  if (matchRuleStyle === 'clearance') {
    // Mode Requirement: Player must clear ALL 9 of their coins AND the Queen must be cleared & covered!
    if (remainingWhite === 0 && queenCovered && queenPocketedBy === 1) {
      victoryWinner = 1;
    } else if (remainingBlack === 0 && queenCovered && queenPocketedBy === 2) {
      victoryWinner = 2;
    } else if (remainingWhite === 0 && remainingBlack === 0 && !queenOnBoard) {
      victoryWinner = (scores[1] >= scores[2]) ? 1 : 2;
    }
  } else {
    // Points target mode
    if (scores[1] >= targetPoints) victoryWinner = 1;
    else if (scores[2] >= targetPoints) victoryWinner = 2;
    else if (remainingWhite === 0 || remainingBlack === 0) {
      victoryWinner = (scores[1] >= scores[2]) ? 1 : 2;
    }
  }

  if (victoryWinner !== null) {
    handleMatchVictory(victoryWinner);
    return;
  }

  if (!continueTurn) {
    currentTurn = (currentTurn === 1) ? 2 : 1;
  }

  setupStrikerForTurn();
}

function returnCoinToCenter(coinType, playerNum) {
  const pIndex = pocketedHistory[playerNum].indexOf('coin');
  if (pIndex !== -1) {
    pocketedHistory[playerNum].splice(pIndex, 1);
    scores[playerNum] = Math.max(0, scores[playerNum] - 1);
    const deadCoin = pieces.find(p => p.type === coinType && p.pocketed);
    if (deadCoin) {
      deadCoin.pocketed = false;
      deadCoin.x = C_SIZE / 2;
      deadCoin.y = C_SIZE / 2 + (playerNum === 1 ? 30 : -30);
      deadCoin.vx = 0;
      deadCoin.vy = 0;
    }
  }
}

function returnQueenToCenter() {
  const queen = pieces.find(p => p.type === 'queen');
  if (queen) {
    queen.pocketed = false;
    queen.x = C_SIZE / 2;
    queen.y = C_SIZE / 2;
    queen.vx = 0;
    queen.vy = 0;
  }
}

/* ==========================================================================
   VICTORY CELEBRATION (CONFETTI & FIREWORKS)
   ========================================================================== */
function handleMatchVictory(winnerNum) {
  gameActive = false;
  playSound('win');
  startCelebration();

  winnerTitle.textContent = `${playerNames[winnerNum].toUpperCase()} WINS THE BOARD!`;
  if (matchRuleStyle === 'clearance') {
    winnerDesc.textContent = `Outstanding! ${playerNames[winnerNum]} cleared all coins and conquered the Pink Queen! Final Score: ${scores[1]} - ${scores[2]}.`;
  } else {
    winnerDesc.textContent = `Congratulations! ${playerNames[winnerNum]} reached the target points! Final Score: ${scores[1]} - ${scores[2]}.`;
  }

  gameOverModal.classList.remove('hidden');
}

function startCelebration() {
  if (!confettiContainer) return;
  confettiContainer.innerHTML = '';
  const colors = ['#f43f5e', '#fbbf24', '#38bdf8', '#10b981', '#ec4899', '#f8fafc', '#a855f7'];

  // 120 confetti pieces shower
  for (let i = 0; i < 120; i++) {
    const el = document.createElement('div');
    el.classList.add('confetti-piece');
    el.style.left = `${Math.random() * 100}vw`;
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = `${Math.random() * 2.2 + 2.2}s`;
    el.style.animationDelay = `${Math.random() * 1.2}s`;
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    confettiContainer.appendChild(el);
  }
}

function botShoot() {
  if (!gameActive || !striker || isPhysicsActive) return;

  const myCoinType = 'black';
  const myCoins = pieces.filter(p => (p.type === myCoinType || (p.type === 'queen' && !queenCovered)) && !p.pocketed);

  const randomX = 160 + Math.random() * (C_SIZE - 320);
  striker.x = clampStrikerX(randomX);

  let targetCoin = myCoins[Math.floor(Math.random() * myCoins.length)];
  if (!targetCoin) targetCoin = { x: C_SIZE / 2, y: C_SIZE / 2 };

  const dx = targetCoin.x - striker.x;
  const dy = targetCoin.y - striker.y;
  let angle = Math.atan2(dy, dx);

  if (gameMode === 'pve-easy') {
    angle += (Math.random() - 0.5) * 0.26;
  } else if (gameMode === 'pve-medium') {
    angle += (Math.random() - 0.5) * 0.09;
  }

  const speed = 28 + Math.random() * 16;
  striker.vx = Math.cos(angle) * speed;
  striker.vy = Math.sin(angle) * speed;

  playSound('strike', 0.85);
  isPhysicsActive = true;
  requestAnimationFrame(updatePhysicsLoop);
}

/* ==========================================================================
   CANVAS RENDERING (STAR ON PINK QUEEN & ALL STRIKERS)
   ========================================================================== */
function drawScene() {
  ctx.clearRect(0, 0, C_SIZE, C_SIZE);

  drawTournamentMarkings();

  for (const p of pieces) {
    if (!p.pocketed) drawAuthenticWoodenCoin(p);
  }

  if (striker && !striker.pocketed) {
    drawStriker(striker);
  }

  if (isAimingFlick && striker) {
    drawAimTrajectory();
  }
}

function drawTournamentMarkings() {
  const cx = C_SIZE / 2;
  const cy = C_SIZE / 2;
  const lineCol = getComputedStyle(document.body).getPropertyValue('--board-lines').trim() || '#2b170c';
  const redCol = getComputedStyle(document.body).getPropertyValue('--base-red').trim() || '#c52222';

  ctx.save();

  // Corner Pocket Netting & Hole
  for (const p of POCKETS) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, POCKET_RADIUS + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#080808';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#27272a';
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, POCKET_RADIUS - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let offset = -POCKET_RADIUS; offset <= POCKET_RADIUS; offset += 6) {
      ctx.moveTo(p.x + offset, p.y - POCKET_RADIUS);
      ctx.lineTo(p.x + offset, p.y + POCKET_RADIUS);
      ctx.moveTo(p.x - POCKET_RADIUS, p.y + offset);
      ctx.lineTo(p.x + POCKET_RADIUS, p.y + offset);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 2.2;
  ctx.strokeRect(BOARD_MARGIN + 12, BOARD_MARGIN + 12, C_SIZE - 2 * (BOARD_MARGIN + 12), C_SIZE - 2 * (BOARD_MARGIN + 12));

  drawBaselineTrack(145, C_SIZE - 145, C_SIZE - 105, lineCol, redCol, false);
  drawBaselineTrack(145, C_SIZE - 145, 105, lineCol, redCol, false);
  drawBaselineTrack(145, C_SIZE - 145, 105, lineCol, redCol, true);
  drawBaselineTrack(145, C_SIZE - 145, C_SIZE - 105, lineCol, redCol, true);

  drawFoulArrow(cx - 78, cy - 78, POCKETS[0].x + 22, POCKETS[0].y + 22, lineCol, redCol);
  drawFoulArrow(cx + 78, cy - 78, POCKETS[1].x - 22, POCKETS[1].y + 22, lineCol, redCol);
  drawFoulArrow(cx - 78, cy + 78, POCKETS[2].x + 22, POCKETS[2].y - 22, lineCol, redCol);
  drawFoulArrow(cx + 78, cy + 78, POCKETS[3].x - 22, POCKETS[3].y - 22, lineCol, redCol);

  drawCenterRosette(cx, cy, lineCol, redCol);

  ctx.restore();
}

function drawBaselineTrack(start, end, pos, lineCol, redCol, isVertical) {
  const trackWidth = 14;

  ctx.save();
  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 1.6;

  ctx.beginPath();
  if (!isVertical) {
    ctx.moveTo(start, pos - trackWidth / 2);
    ctx.lineTo(end, pos - trackWidth / 2);
    ctx.moveTo(start, pos + trackWidth / 2);
    ctx.lineTo(end, pos + trackWidth / 2);
  } else {
    ctx.moveTo(pos - trackWidth / 2, start);
    ctx.lineTo(pos - trackWidth / 2, end);
    ctx.moveTo(pos + trackWidth / 2, start);
    ctx.lineTo(pos + trackWidth / 2, end);
  }
  ctx.stroke();

  const ends = !isVertical ? [{ x: start, y: pos }, { x: end, y: pos }] : [{ x: pos, y: start }, { x: pos, y: end }];
  for (const ep of ends) {
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 11, 0, Math.PI * 2);
    ctx.fillStyle = redCol;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = lineCol;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = lineCol;
    ctx.fill();
  }
  ctx.restore();
}

function drawFoulArrow(fromX, fromY, toX, toY, lineCol, redCol) {
  ctx.save();
  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 1.6;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  const angle = Math.atan2(toY - fromY, toX - fromX);
  const headLen = 14;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(fromX, fromY, 18, angle - Math.PI / 2, angle + Math.PI / 2);
  ctx.stroke();

  ctx.restore();
}

function drawCenterRosette(cx, cy, lineCol, redCol) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = lineCol;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = redCol;
  ctx.fill();
  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a1 = (i * Math.PI) / 4;
    const a2 = a1 + Math.PI / 8;
    const a3 = a1 - Math.PI / 8;

    const tipX = cx + Math.cos(a1) * 60;
    const tipY = cy + Math.sin(a1) * 60;
    const midX1 = cx + Math.cos(a2) * 18;
    const midY1 = cy + Math.sin(a2) * 18;
    const midX2 = cx + Math.cos(a3) * 18;
    const midY2 = cy + Math.sin(a3) * 18;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(midX1, midY1);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fillStyle = (i % 2 === 0) ? redCol : lineCol;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(midX2, midY2);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fillStyle = (i % 2 === 0) ? lineCol : redCol;
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = lineCol;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.restore();
}

// Draw Star Helper
function drawStar(cx, cy, spikes, outerRadius, innerRadius, fillStyle, strokeStyle = null) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();

  ctx.fillStyle = fillStyle;
  ctx.fill();
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

// Coins: Pink Queen with Golden Star, Natural Wood & Ebony Carrom Men
function drawAuthenticWoodenCoin(c) {
  ctx.save();

  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 6.5;
  ctx.shadowOffsetX = 2.5;
  ctx.shadowOffsetY = 4.0;

  ctx.beginPath();
  ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);

  if (c.type === 'queen') {
    // Shaded Rich Pink Lacquered Queen (Custom requested pink finish)
    const grad = ctx.createRadialGradient(c.x - 4, c.y - 4, 2, c.x, c.y, c.radius);
    grad.addColorStop(0, '#fecdd3');
    grad.addColorStop(0.35, '#fb7185');
    grad.addColorStop(0.85, '#f43f5e');
    grad.addColorStop(1, '#9f1239');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#fef08a';
    ctx.stroke();

    // Concentric turned rings
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.65)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.46, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(159, 18, 57, 0.8)';
    ctx.stroke();

    // Little Golden Star in the center of the Queen
    drawStar(c.x, c.y, 5, c.radius * 0.34, c.radius * 0.16, '#fef08a', '#854d0e');
  } else if (c.type === 'white') {
    // Natural Turned Rosewood / Teak (Image 2)
    const grad = ctx.createRadialGradient(c.x - 4, c.y - 4, 2, c.x, c.y, c.radius);
    grad.addColorStop(0, '#ffedd5');
    grad.addColorStop(0.35, '#fed7aa');
    grad.addColorStop(0.75, '#ea580c');
    grad.addColorStop(1, '#9a3412');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#7c2d12';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(124, 45, 18, 0.6)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.44, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(67, 20, 7, 0.7)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#7c2d12';
    ctx.fill();
  } else {
    // Deep Turned Ebony Hardwood
    const grad = ctx.createRadialGradient(c.x - 4, c.y - 4, 2, c.x, c.y, c.radius);
    grad.addColorStop(0, '#52525b');
    grad.addColorStop(0.35, '#27272a');
    grad.addColorStop(0.85, '#09090b');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#a1a1aa';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 212, 216, 0.45)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.44, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(24, 24, 27, 0.9)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#d4d4d8';
    ctx.fill();
  }

  ctx.restore();
}

// All Strikers with Stars in their centers
function drawStriker(s) {
  ctx.save();

  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 9;
  ctx.shadowOffsetX = 3.2;
  ctx.shadowOffsetY = 5.0;

  ctx.beginPath();
  ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);

  const theme = s.theme || 'tournament-geometric';

  if (theme === 'gold-crest') {
    const grad = ctx.createRadialGradient(s.x - 6, s.y - 6, 3, s.x, s.y, s.radius);
    grad.addColorStop(0, '#fef9c3');
    grad.addColorStop(0.45, '#eab308');
    grad.addColorStop(1, '#854d0e');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#713f12';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.76, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(113, 63, 18, 0.5)';
    ctx.stroke();

    // Central Star
    drawStar(s.x, s.y, 8, s.radius * 0.44, s.radius * 0.2, '#fffbeb', '#713f12');
  } else if (theme === 'ruby-gem') {
    const grad = ctx.createRadialGradient(s.x - 6, s.y - 6, 3, s.x, s.y, s.radius);
    grad.addColorStop(0, '#fda4af');
    grad.addColorStop(0.5, '#e11d48');
    grad.addColorStop(1, '#881337');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.76, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.5)';
    ctx.stroke();

    // Central Star
    drawStar(s.x, s.y, 6, s.radius * 0.44, s.radius * 0.2, '#fde047', '#881337');
  } else if (theme === 'emerald-star') {
    const grad = ctx.createRadialGradient(s.x - 6, s.y - 6, 3, s.x, s.y, s.radius);
    grad.addColorStop(0, '#a7f3d0');
    grad.addColorStop(0.5, '#059669');
    grad.addColorStop(1, '#064e3b');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.76, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
    ctx.stroke();

    // Central Star
    drawStar(s.x, s.y, 8, s.radius * 0.44, s.radius * 0.2, '#facc15', '#064e3b');
  } else {
    // Ivory Championship Striker (Image 2)
    const grad = ctx.createRadialGradient(s.x - 6, s.y - 6, 3, s.x, s.y, s.radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.65, '#f8fafc');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * 0.82, 0, Math.PI * 2);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Central Compass Flower Star
    drawStar(s.x, s.y, 8, s.radius * 0.46, s.radius * 0.2, '#0f172a', '#334155');
  }

  ctx.restore();
}

function drawAimTrajectory() {
  const dx = dragStartX - dragCurrentX;
  const dy = dragStartY - dragCurrentY;
  const dist = Math.hypot(dx, dy);
  if (dist < 8) return;

  const maxPull = 140;
  const forceRatio = Math.min(dist, maxPull) / maxPull;

  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;

  const aimDist = forceRatio * 280;
  const angle = Math.atan2(dy, dx);

  ctx.beginPath();
  ctx.moveTo(striker.x, striker.y);
  ctx.lineTo(striker.x + Math.cos(angle) * aimDist, striker.y + Math.sin(angle) * aimDist);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(striker.x + Math.cos(angle) * aimDist, striker.y + Math.sin(angle) * aimDist, 8.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  ctx.restore();
}

function updateUI() {
  turnColorDot.className = `turn-dot ${currentTurn === 1 ? 'white-coin' : 'black-coin'}`;
  turnText.textContent = `${playerNames[currentTurn]}'s Turn`;

  p1Name.textContent = playerNames[1];
  p2Name.textContent = playerNames[2];
  p1Score.textContent = scores[1];
  p2Score.textContent = scores[2];

  const remWhite = pieces.filter(p => p.type === 'white' && !p.pocketed).length;
  const remBlack = pieces.filter(p => p.type === 'black' && !p.pocketed).length;

  if (p1SubInfo) p1SubInfo.textContent = `${remWhite} Coins Remaining`;
  if (p2SubInfo) p2SubInfo.textContent = `${remBlack} Coins Remaining`;

  if (currentTurn === 1) {
    cardP1.classList.add('active');
    cardP2.classList.remove('active');
  } else {
    cardP2.classList.add('active');
    cardP1.classList.remove('active');
  }

  p1Tray.innerHTML = pocketedHistory[1].map(t => `<span class="coin-mini-dot ${t === 'queen' ? 'q' : 'w'}"></span>`).join('');
  p2Tray.innerHTML = pocketedHistory[2].map(t => `<span class="coin-mini-dot ${t === 'queen' ? 'q' : 'b'}"></span>`).join('');

  if (queenCovered) {
    queenStatusText.textContent = `Queen Covered by P${queenPocketedBy} (★ Covered)`;
  } else if (queenPocketedBy !== null) {
    queenStatusText.textContent = `Queen Sunk! Must cover next shot`;
  } else {
    queenStatusText.textContent = `Pink Queen (★) in Center`;
  }
}

document.addEventListener('DOMContentLoaded', init);