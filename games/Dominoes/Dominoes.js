/* ==========================================================================
   DOMINOES (2 TO 4 PLAYERS) - DIRECTED VECTOR CHAIN & STRICT MATCHING
   ========================================================================== */

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSound(type) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === 'tile-click') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } else if (type === 'draw') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.setValueAtTime(360, now + 0.05);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (type === 'hint') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } else if (type === 'win') {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.55, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }
}

// Full Double-Six Set (28 Pieces)
const FULL_SET = [];
for (let i = 0; i <= 6; i++) {
  for (let j = i; j <= 6; j++) {
    FULL_SET.push({ left: i, right: j, id: `${i}-${j}` });
  }
}

// Clean Symmetrical Vector Pips
function getSvgPips(count) {
  const pips = [];
  const r = 8.5;

  const TL = { cx: 26, cy: 26 };
  const TR = { cx: 74, cy: 26 };
  const ML = { cx: 26, cy: 50 };
  const MR = { cx: 74, cy: 50 };
  const BL = { cx: 26, cy: 74 };
  const BR = { cx: 74, cy: 74 };
  const C  = { cx: 50, cy: 50 };

  if (count === 1) pips.push(C);
  else if (count === 2) pips.push(TL, BR);
  else if (count === 3) pips.push(TL, C, BR);
  else if (count === 4) pips.push(TL, TR, BL, BR);
  else if (count === 5) pips.push(TL, TR, C, BL, BR);
  else if (count === 6) pips.push(TL, TR, ML, MR, BL, BR);

  let circles = '';
  pips.forEach(p => {
    circles += `<circle cx="${p.cx}" cy="${p.cy}" r="${r}" class="pip-dot"></circle>`;
  });

  return `<svg viewBox="0 0 100 100" class="pip-svg">${circles}</svg>`;
}

// Game State
let totalPlayers = 2; // 2 or 4
let boneyard = [];
let hands = { 1: [], 2: [], 3: [], 4: [] };
let scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
let consecutivePasses = 0;
let currentTurn = 1;
let targetScore = 100;
let gameMode = 'pve'; // 'pve' or 'pvp'
let gameActive = false;
let isBotThinking = false;
let playerNames = { 1: 'Player 1', 2: 'Player 2', 3: 'Player 3', 4: 'Player 4' };

// Chain State: Each element has { endA, endB, orient }
let boardChain = [];
let leftOpenPip = null;
let rightOpenPip = null;
let pendingChoiceTile = null;

// DOM References
let chainBoard, playerHandTray, opponentHandBar, currentPlayerHandLabel;
let turnDot, turnText, modeDisplay, statusMsg, openEndsLabel;
let cardP1, cardP2, cardP3, cardP4;
let p1Name, p2Name, p3Name, p4Name;
let p1Score, p2Score, p3Score, p4Score;
let p1TilesCount, p2TilesCount, p3TilesCount, p4TilesCount;
let boneyardCount, drawBoneyardBtn, passTurnBtn, hintBtn;
let choiceModal, chooseLeftBtn, chooseRightBtn, cancelChoiceBtn, choiceDesc;
let setupModal, themeModal, exitModal, rulesModal, gameOverModal;
let playerCountSelect, modeSelect, targetScoreSelect;
let p1NameInput, p2NameInput, p3NameInput, p4NameInput;
let p2NameWrap, p3NameWrap, p4NameWrap;
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
  chainBoard = document.getElementById('chain-board');
  playerHandTray = document.getElementById('player-hand-tray');
  opponentHandBar = document.getElementById('opponent-hand-bar');
  currentPlayerHandLabel = document.getElementById('current-player-hand-label');

  turnDot = document.getElementById('turn-dot');
  turnText = document.getElementById('turn-text');
  modeDisplay = document.getElementById('mode-display');
  statusMsg = document.getElementById('status-msg');
  openEndsLabel = document.getElementById('open-ends-label');

  cardP1 = document.getElementById('card-p1');
  cardP2 = document.getElementById('card-p2');
  cardP3 = document.getElementById('card-p3');
  cardP4 = document.getElementById('card-p4');

  p1Name = document.getElementById('p1-name');
  p2Name = document.getElementById('p2-name');
  p3Name = document.getElementById('p3-name');
  p4Name = document.getElementById('p4-name');

  p1Score = document.getElementById('p1-score');
  p2Score = document.getElementById('p2-score');
  p3Score = document.getElementById('p3-score');
  p4Score = document.getElementById('p4-score');

  p1TilesCount = document.getElementById('p1-tiles-count');
  p2TilesCount = document.getElementById('p2-tiles-count');
  p3TilesCount = document.getElementById('p3-tiles-count');
  p4TilesCount = document.getElementById('p4-tiles-count');

  boneyardCount = document.getElementById('boneyard-count');
  drawBoneyardBtn = document.getElementById('draw-boneyard-btn');
  passTurnBtn = document.getElementById('pass-turn-btn');
  hintBtn = document.getElementById('hint-btn');

  choiceModal = document.getElementById('choice-modal');
  chooseLeftBtn = document.getElementById('choose-left-btn');
  chooseRightBtn = document.getElementById('choose-right-btn');
  cancelChoiceBtn = document.getElementById('cancel-choice-btn');
  choiceDesc = document.getElementById('choice-desc');

  setupModal = document.getElementById('setup-modal');
  themeModal = document.getElementById('theme-modal');
  exitModal = document.getElementById('exit-modal');
  rulesModal = document.getElementById('rules-modal');
  gameOverModal = document.getElementById('game-over-modal');

  playerCountSelect = document.getElementById('player-count-select');
  modeSelect = document.getElementById('mode-select');
  targetScoreSelect = document.getElementById('target-score-select');

  p1NameInput = document.getElementById('p1-name-input');
  p2NameInput = document.getElementById('p2-name-input');
  p3NameInput = document.getElementById('p3-name-input');
  p4NameInput = document.getElementById('p4-name-input');

  p2NameWrap = document.getElementById('p2-name-wrap');
  p3NameWrap = document.getElementById('p3-name-wrap');
  p4NameWrap = document.getElementById('p4-name-wrap');

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

  playerCountSelect.addEventListener('change', (e) => {
    const is4P = e.target.value === '4';
    p3NameWrap.style.display = is4P ? 'block' : 'none';
    p4NameWrap.style.display = is4P ? 'block' : 'none';
  });

  drawBoneyardBtn.addEventListener('click', handleDrawBoneyard);
  passTurnBtn.addEventListener('click', handlePassTurn);
  hintBtn.addEventListener('click', handleHintRequest);

  chooseLeftBtn.addEventListener('click', () => {
    if (pendingChoiceTile) {
      const tile = pendingChoiceTile;
      pendingChoiceTile = null;
      choiceModal.classList.add('hidden');
      placeTile(tile, 'left');
    }
  });

  chooseRightBtn.addEventListener('click', () => {
    if (pendingChoiceTile) {
      const tile = pendingChoiceTile;
      pendingChoiceTile = null;
      choiceModal.classList.add('hidden');
      placeTile(tile, 'right');
    }
  });

  cancelChoiceBtn.addEventListener('click', () => {
    pendingChoiceTile = null;
    choiceModal.classList.add('hidden');
  });

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
    totalPlayers = parseInt(playerCountSelect.value, 10);
    gameMode = modeSelect.value;
    targetScore = parseInt(targetScoreSelect.value, 10);

    playerNames[1] = p1NameInput.value.trim() || 'Player 1';

    if (totalPlayers === 2) {
      playerNames[2] = (gameMode === 'pvp') ? (p2NameInput.value.trim() || 'Player 2') : 'Bot';
    } else {
      playerNames[2] = (gameMode === 'pvp') ? (p2NameInput.value.trim() || 'Player 2') : 'Bot 1';
      playerNames[3] = (gameMode === 'pvp') ? (p3NameInput.value.trim() || 'Player 3') : 'Bot 2';
      playerNames[4] = (gameMode === 'pvp') ? (p4NameInput.value.trim() || 'Player 4') : 'Bot 3';
    }

    modeDisplay.textContent = `${totalPlayers} Players (${gameMode === 'pvp' ? 'Local' : 'vs Bot'})`;

    setupModal.classList.add('hidden');
    scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
    startNewGame();
  });

  playAgainBtn.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
    setupModal.classList.remove('hidden');
  });

  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === btn.dataset.theme));
      document.body.setAttribute('data-tile-theme', btn.dataset.theme);
    });
  });
}

function startNewGame() {
  gameActive = true;
  isBotThinking = false;
  boardChain = [];
  leftOpenPip = null;
  rightOpenPip = null;
  pendingChoiceTile = null;
  consecutivePasses = 0;

  const deck = FULL_SET.map(t => ({ ...t })).sort(() => Math.random() - 0.5);
  const initialHandSize = (totalPlayers === 2) ? 7 : 5;

  hands[1] = autoSortHand(deck.splice(0, initialHandSize));
  hands[2] = autoSortHand(deck.splice(0, initialHandSize));

  if (totalPlayers === 4) {
    hands[3] = autoSortHand(deck.splice(0, initialHandSize));
    hands[4] = autoSortHand(deck.splice(0, initialHandSize));
  } else {
    hands[3] = [];
    hands[4] = [];
  }

  boneyard = deck;

  currentTurn = determineFirstPlayer();

  updateUI();
  renderBoard();
  renderHands();

  checkIfBotTurn();
}

function determineFirstPlayer() {
  for (let doublePip = 6; doublePip >= 0; doublePip--) {
    for (let p = 1; p <= totalPlayers; p++) {
      if (hands[p].some(t => t.left === doublePip && t.right === doublePip)) {
        return p;
      }
    }
  }

  let maxWeight = -1;
  let starter = 1;
  for (let p = 1; p <= totalPlayers; p++) {
    hands[p].forEach(t => {
      const weight = t.left * 10 + t.right;
      if (weight > maxWeight) {
        maxWeight = weight;
        starter = p;
      }
    });
  }
  return starter;
}

function autoSortHand(hand) {
  return hand.slice().sort((a, b) => {
    const minA = Math.min(a.left, a.right);
    const minB = Math.min(b.left, b.right);
    if (minA !== minB) return minA - minB;
    return Math.max(a.left, a.right) - Math.max(b.left, b.right);
  });
}

/* ==========================================================================
   2D SERPENTINE SNAKING WITH DIRECTED TILE ORIENTATIONS
   ========================================================================== */
function calculateSnakingCoordinates() {
  if (boardChain.length === 0) return [];

  const TILE_L = 76;
  const TILE_W = 38;
  const ROW_GAP = 96;
  const TILE_GAP = 5;

  const placed = [];
  const rootIdx = boardChain.findIndex(t => t.isFirst);
  const startIdx = rootIdx !== -1 ? rootIdx : 0;

  const originX = 600;
  const originY = 320;

  const rootTile = boardChain[startIdx];
  const isRootDouble = rootTile.valA === rootTile.valB;

  // Root Tile placed at origin
  placed[startIdx] = {
    x: originX,
    y: originY,
    isVertical: isRootDouble,
    w: isRootDouble ? TILE_W : TILE_L,
    h: isRootDouble ? TILE_L : TILE_W,
    val1: rootTile.valA,
    val2: rootTile.valB
  };

  // 1. Trace RIGHTWARD chain (startIdx + 1 to end)
  let curX = originX + (isRootDouble ? TILE_W / 2 : TILE_L / 2);
  let curY = originY;
  let dirX = 1; // 1 = rightward, -1 = leftward

  for (let i = startIdx + 1; i < boardChain.length; i++) {
    const tile = boardChain[i];
    const isDouble = tile.valA === tile.valB;

    // Corner turnaround logic
    if (dirX === 1 && curX + TILE_L + 60 > 1200) {
      curY += ROW_GAP;
      // Corner vertical connector: valA touches top row, valB faces down
      placed[i] = {
        x: curX,
        y: curY - ROW_GAP / 2,
        isVertical: true,
        w: TILE_W,
        h: TILE_L,
        val1: tile.valA,
        val2: tile.valB
      };
      dirX = -1; // Reverse to left
      curX -= TILE_L / 2;
      continue;
    } else if (dirX === -1 && curX - TILE_L - 60 < 80) {
      curY += ROW_GAP;
      placed[i] = {
        x: curX,
        y: curY - ROW_GAP / 2,
        isVertical: true,
        w: TILE_W,
        h: TILE_L,
        val1: tile.valA,
        val2: tile.valB
      };
      dirX = 1; // Reverse to right
      curX += TILE_L / 2;
      continue;
    }

    const isVert = isDouble;
    const tW = isDouble ? TILE_W : TILE_L;
    const tH = isDouble ? TILE_L : TILE_W;

    curX += dirX * (tW / 2 + TILE_GAP);

    // CRUCIAL: If traveling leftward, valA (inward matching pip) is on the right side!
    const v1 = (dirX === 1) ? tile.valA : tile.valB;
    const v2 = (dirX === 1) ? tile.valB : tile.valA;

    placed[i] = {
      x: curX,
      y: curY,
      isVertical: isVert,
      w: tW,
      h: tH,
      val1: v1,
      val2: v2
    };

    curX += dirX * (tW / 2);
  }

  // 2. Trace LEFTWARD chain (startIdx - 1 down to 0)
  curX = originX - (isRootDouble ? TILE_W / 2 : TILE_L / 2);
  curY = originY;
  dirX = -1; // Traveling leftwards

  for (let i = startIdx - 1; i >= 0; i--) {
    const tile = boardChain[i];
    const isDouble = tile.valA === tile.valB;

    if (dirX === -1 && curX - TILE_L - 60 < 80) {
      curY -= ROW_GAP;
      // Corner vertical connector: valB touches bottom row, valA faces up
      placed[i] = {
        x: curX,
        y: curY + ROW_GAP / 2,
        isVertical: true,
        w: TILE_W,
        h: TILE_L,
        val1: tile.valA,
        val2: tile.valB
      };
      dirX = 1; // Reverse to right
      curX += TILE_L / 2;
      continue;
    } else if (dirX === 1 && curX + TILE_L + 60 > 1200) {
      curY -= ROW_GAP;
      placed[i] = {
        x: curX,
        y: curY + ROW_GAP / 2,
        isVertical: true,
        w: TILE_W,
        h: TILE_L,
        val1: tile.valA,
        val2: tile.valB
      };
      dirX = -1; // Reverse to left
      curX -= TILE_L / 2;
      continue;
    }

    const isVert = isDouble;
    const tW = isDouble ? TILE_W : TILE_L;
    const tH = isDouble ? TILE_L : TILE_W;

    curX += dirX * (tW / 2 + TILE_GAP);

    // CRUCIAL: tile.valA is the outward facing pip, tile.valB is inward matching pip
    const v1 = (dirX === -1) ? tile.valA : tile.valB;
    const v2 = (dirX === -1) ? tile.valB : tile.valA;

    placed[i] = {
      x: curX,
      y: curY,
      isVertical: isVert,
      w: tW,
      h: tH,
      val1: v1,
      val2: v2
    };

    curX += dirX * (tW / 2);
  }

  return placed;
}

function renderBoard() {
  chainBoard.innerHTML = '';
  const coords = calculateSnakingCoordinates();

  boardChain.forEach((tile, index) => {
    const pos = coords[index];
    if (!pos) return;

    const tileEl = createBoardTileElement(pos.val1, pos.val2, pos.isVertical);
    tileEl.style.left = `${pos.x - pos.w / 2}px`;
    tileEl.style.top = `${pos.y - pos.h / 2}px`;
    chainBoard.appendChild(tileEl);
  });

  if (leftOpenPip !== null && rightOpenPip !== null) {
    openEndsLabel.textContent = `[${leftOpenPip}] and [${rightOpenPip}]`;
  } else {
    openEndsLabel.textContent = 'None';
  }
}

function renderHands() {
  playerHandTray.innerHTML = '';
  opponentHandBar.innerHTML = '';

  const isCurrentHuman = (gameMode === 'pvp') || (currentTurn === 1);
  const visiblePlayerIndex = (gameMode === 'pvp') ? currentTurn : 1;
  const displayHand = hands[visiblePlayerIndex] || [];

  currentPlayerHandLabel.textContent = (gameMode === 'pvp')
    ? `${playerNames[currentTurn]}'s Hand (Select tile):`
    : `Your Hand (${playerNames[1]}):`;

  displayHand.forEach(tile => {
    const tileEl = createHandTileElement(tile);
    tileEl.dataset.tileId = tile.id;

    if (isCurrentHuman && !isBotThinking && visiblePlayerIndex === currentTurn) {
      tileEl.addEventListener('click', () => handlePlayerTileClick(tile));
    }

    playerHandTray.appendChild(tileEl);
  });

  // Opponents hidden tiles
  for (let p = 1; p <= totalPlayers; p++) {
    if (p === visiblePlayerIndex) continue;
    const oppGroup = document.createElement('div');
    oppGroup.className = 'opp-group';

    const lbl = document.createElement('span');
    lbl.className = 'hand-label';
    lbl.textContent = `${playerNames[p]} (${hands[p].length}):`;
    oppGroup.appendChild(lbl);

    const tray = document.createElement('div');
    tray.className = 'hand-tiles-tray';
    for (let i = 0; i < hands[p].length; i++) {
      const hTile = document.createElement('div');
      hTile.className = 'hidden-tile';
      tray.appendChild(hTile);
    }
    oppGroup.appendChild(tray);
    opponentHandBar.appendChild(oppGroup);
  }

  // Pass Turn button visibility
  const currentCanPlay = (hands[currentTurn] || []).some(isTilePlayable);
  if (!currentCanPlay && boneyard.length === 0 && isCurrentHuman) {
    passTurnBtn.classList.remove('hidden');
    statusMsg.textContent = `${playerNames[currentTurn]}: No playable moves. Pass turn!`;
  } else {
    passTurnBtn.classList.add('hidden');
  }
}

function createHandTileElement(tile) {
  const el = document.createElement('div');
  el.className = 'domino-tile vertical';

  const topHalf = document.createElement('div');
  topHalf.className = 'tile-half';
  topHalf.innerHTML = getSvgPips(tile.left);

  const divider = document.createElement('div');
  divider.className = 'tile-divider';

  const bottomHalf = document.createElement('div');
  bottomHalf.className = 'tile-half';
  bottomHalf.innerHTML = getSvgPips(tile.right);

  el.appendChild(topHalf);
  el.appendChild(divider);
  el.appendChild(bottomHalf);

  return el;
}

function createBoardTileElement(val1, val2, isVertical = false) {
  const el = document.createElement('div');
  el.className = `domino-tile placed ${isVertical ? 'vert' : 'horiz'}`;

  const firstHalf = document.createElement('div');
  firstHalf.className = 'tile-half';
  firstHalf.innerHTML = getSvgPips(val1);

  const divider = document.createElement('div');
  divider.className = 'tile-divider';

  const secondHalf = document.createElement('div');
  secondHalf.className = 'tile-half';
  secondHalf.innerHTML = getSvgPips(val2);

  el.appendChild(firstHalf);
  el.appendChild(divider);
  el.appendChild(secondHalf);

  return el;
}

function isTilePlayable(tile) {
  if (boardChain.length === 0) return true;
  return (
    tile.left === leftOpenPip ||
    tile.right === leftOpenPip ||
    tile.left === rightOpenPip ||
    tile.right === rightOpenPip
  );
}

/* ==========================================================================
   STRICT TOUCHING NUMBER MATCHING LOGIC (GUARANTEED IDENTICAL TOUCHING PIPS)
   ========================================================================== */
function handlePlayerTileClick(tile) {
  if (!gameActive || isBotThinking) return;

  const validPlays = getValidPlacements(tile);
  if (validPlays.length === 0) {
    statusMsg.textContent = `Tile [${tile.left}|${tile.right}] doesn't fit on open ends [${leftOpenPip}] or [${rightOpenPip}].`;
    return;
  }

  clearHintHighlights();

  if (validPlays.length === 2 && leftOpenPip !== rightOpenPip) {
    pendingChoiceTile = tile;
    choiceDesc.textContent = `Connect [${tile.left}|${tile.right}] to Left End (${leftOpenPip}) or Right End (${rightOpenPip})?`;
    chooseLeftBtn.textContent = `◀ Connect to Left (${leftOpenPip})`;
    chooseRightBtn.textContent = `Connect to Right (${rightOpenPip}) ▶`;
    choiceModal.classList.remove('hidden');
  } else {
    placeTile(tile, validPlays[0]);
  }
}

function getValidPlacements(tile) {
  if (boardChain.length === 0) return ['first'];
  const placements = [];

  if (tile.left === leftOpenPip || tile.right === leftOpenPip) placements.push('left');
  if (tile.left === rightOpenPip || tile.right === rightOpenPip) placements.push('right');

  return placements;
}

function placeTile(tile, end) {
  playSound('tile-click');
  consecutivePasses = 0;

  // Remove played tile from hand
  hands[currentTurn] = hands[currentTurn].filter(t => t.id !== tile.id);

  if (end === 'first') {
    // Initial tile
    boardChain.push({ valA: tile.left, valB: tile.right, isFirst: true });
    leftOpenPip = tile.left;
    rightOpenPip = tile.right;
  } else if (end === 'left') {
    // Left placement: valB MUST touch leftOpenPip, valA becomes new leftOpenPip!
    // Example: leftOpenPip = 4. If tile is [1|4], valA=1, valB=4. (1 touches outward, 4 touches 4)
    // If tile is [4|1], flip it: valA=1, valB=4!
    let valA, valB;
    if (tile.right === leftOpenPip) {
      valA = tile.left;
      valB = tile.right;
    } else {
      valA = tile.right;
      valB = tile.left;
    }
    boardChain.unshift({ valA, valB, isFirst: false });
    leftOpenPip = valA; // New open left end
  } else if (end === 'right') {
    // Right placement: valA MUST touch rightOpenPip, valB becomes new rightOpenPip!
    // Example: rightOpenPip = 4. If tile is [4|5], valA=4, valB=5. (4 touches 4, 5 touches outward)
    // If tile is [5|4], flip it: valA=4, valB=5!
    let valA, valB;
    if (tile.left === rightOpenPip) {
      valA = tile.left;
      valB = tile.right;
    } else {
      valA = tile.right;
      valB = tile.left;
    }
    boardChain.push({ valA, valB, isFirst: false });
    rightOpenPip = valB; // New open right end
  }

  renderBoard();
  checkRoundEnd();
}

function handleDrawBoneyard() {
  if (!gameActive || isBotThinking || boneyard.length === 0) return;

  const drawn = boneyard.pop();
  hands[currentTurn].push(drawn);
  hands[currentTurn] = autoSortHand(hands[currentTurn]);
  playSound('draw');

  updateUI();
  renderHands();

  statusMsg.textContent = `${playerNames[currentTurn]} drew a tile from the Boneyard.`;
}

function handlePassTurn() {
  if (!gameActive || isBotThinking) return;

  consecutivePasses++;
  statusMsg.textContent = `${playerNames[currentTurn]} passed.`;

  if (checkBlockedGame()) {
    return;
  }

  advanceTurn();
}

function handleHintRequest() {
  if (!gameActive || isBotThinking) return;

  playSound('hint');
  clearHintHighlights();

  const currentHand = hands[currentTurn] || [];
  const playable = currentHand.filter(isTilePlayable);

  if (playable.length > 0) {
    playable.forEach(tile => {
      const tileEl = playerHandTray.querySelector(`[data-tile-id="${tile.id}"]`);
      if (tileEl) tileEl.classList.add('hint-active');
    });

    const best = playable[0];
    statusMsg.textContent = `💡 Hint: You can play [${best.left}|${best.right}]. Tap to play!`;
    setTimeout(clearHintHighlights, 4500);
  } else if (boneyard.length > 0) {
    statusMsg.textContent = "💡 Hint: No playable tiles. Draw from the Boneyard!";
  } else {
    statusMsg.textContent = "💡 Hint: No valid moves & Boneyard is empty. Click Pass Turn!";
  }
}

function clearHintHighlights() {
  playerHandTray.querySelectorAll('.hint-active').forEach(el => el.classList.remove('hint-active'));
}

function advanceTurn() {
  clearHintHighlights();
  currentTurn = (currentTurn % totalPlayers) + 1;

  updateUI();
  renderHands();

  checkIfBotTurn();
}

function checkIfBotTurn() {
  if (!gameActive) return;
  const isBot = (gameMode === 'pve') && (currentTurn > 1);

  if (isBot) {
    isBotThinking = true;
    setTimeout(botTurn, 700);
  }
}

/* ==========================================================================
   TACTICAL BOT AI
   ========================================================================== */
function botTurn() {
  if (!gameActive) return;

  const botHand = hands[currentTurn] || [];
  const playable = botHand.filter(isTilePlayable);

  if (playable.length > 0) {
    // Strategy: Play doubles first, then highest pip sum
    playable.sort((a, b) => {
      const aDouble = a.left === a.right ? 1 : 0;
      const bDouble = b.left === b.right ? 1 : 0;
      if (bDouble !== aDouble) return bDouble - aDouble;
      return (b.left + b.right) - (a.left + a.right);
    });

    const chosen = playable[0];
    const validEnds = getValidPlacements(chosen);

    isBotThinking = false;
    placeTile(chosen, validEnds[0]);
  } else if (boneyard.length > 0) {
    const drawn = boneyard.pop();
    botHand.push(drawn);
    hands[currentTurn] = autoSortHand(botHand);
    playSound('draw');
    updateUI();
    renderHands();

    setTimeout(botTurn, 450);
  } else {
    isBotThinking = false;
    consecutivePasses++;
    statusMsg.textContent = `${playerNames[currentTurn]} had to pass.`;

    if (checkBlockedGame()) {
      return;
    }

    advanceTurn();
  }
}

/* ==========================================================================
   ROUND VICTORY & DEADLOCK PREVENTION
   ========================================================================== */
function checkRoundEnd() {
  for (let p = 1; p <= totalPlayers; p++) {
    if (hands[p].length === 0) {
      let earnedPoints = 0;
      for (let op = 1; op <= totalPlayers; op++) {
        if (op !== p) earnedPoints += calculateHandPoints(hands[op]);
      }
      handleRoundWon(p, earnedPoints);
      return;
    }
  }

  if (checkBlockedGame()) {
    return;
  }

  advanceTurn();
}

function checkBlockedGame() {
  const allHandsCantPlay = Object.keys(hands).slice(0, totalPlayers).every(p => !hands[p].some(isTilePlayable));

  if ((consecutivePasses >= totalPlayers || allHandsCantPlay) && boneyard.length === 0) {
    let lowestPips = Infinity;
    let winningPlayer = 1;

    for (let p = 1; p <= totalPlayers; p++) {
      const pips = calculateHandPoints(hands[p]);
      if (pips < lowestPips) {
        lowestPips = pips;
        winningPlayer = p;
      }
    }

    let earnedPoints = 0;
    for (let p = 1; p <= totalPlayers; p++) {
      if (p !== winningPlayer) earnedPoints += calculateHandPoints(hands[p]);
    }

    handleRoundWon(winningPlayer, earnedPoints, true);
    return true;
  }

  return false;
}

function calculateHandPoints(hand) {
  return hand.reduce((sum, tile) => sum + tile.left + tile.right, 0);
}

function handleRoundWon(winner, pointsEarned, isBlocked = false) {
  gameActive = false;
  isBotThinking = false;
  scores[winner] += pointsEarned;
  playSound('win');

  updateUI();

  if (scores[winner] >= targetScore) {
    triggerCelebration();
    winnerTitle.textContent = `${playerNames[winner].toUpperCase()} WINS!`;
    winnerDesc.textContent = `Championship reached! Final Score: ${scores[winner]} points.`;
    gameOverModal.classList.remove('hidden');
  } else {
    const reason = isBlocked ? "Round Blocked (Lowest Pips Wins)" : "Domino (Emptied Hand)";
    statusMsg.textContent = `${reason}! ${playerNames[winner]} won +${pointsEarned} pts. Next round starting...`;
    setTimeout(startNewGame, 2400);
  }
}

function updateUI() {
  turnDot.className = `turn-dot p${currentTurn}-turn`;
  turnText.textContent = `${playerNames[currentTurn]}'s Turn`;

  p1Name.textContent = playerNames[1];
  p2Name.textContent = playerNames[2];
  p1Score.textContent = scores[1];
  p2Score.textContent = scores[2];
  p1TilesCount.textContent = `${hands[1].length} Tiles`;
  p2TilesCount.textContent = `${hands[2].length} Tiles`;

  if (totalPlayers === 4) {
    cardP3.classList.remove('hidden-player');
    cardP4.classList.remove('hidden-player');
    p3Name.textContent = playerNames[3];
    p4Name.textContent = playerNames[4];
    p3Score.textContent = scores[3];
    p4Score.textContent = scores[4];
    p3TilesCount.textContent = `${hands[3].length} Tiles`;
    p4TilesCount.textContent = `${hands[4].length} Tiles`;
  } else {
    cardP3.classList.add('hidden-player');
    cardP4.classList.add('hidden-player');
  }

  boneyardCount.textContent = boneyard.length;
  drawBoneyardBtn.disabled = boneyard.length === 0 || isBotThinking;

  for (let p = 1; p <= 4; p++) {
    const card = document.getElementById(`card-p${p}`);
    if (card) {
      card.classList.toggle('active', p === currentTurn);
    }
  }
}

function triggerCelebration() {
  if (!confettiContainer) return;
  confettiContainer.innerHTML = '';
  const colors = ['#38bdf8', '#f43f5e', '#fbbf24', '#10b981', '#a855f7'];

  for (let i = 0; i < 90; i++) {
    const el = document.createElement('div');
    el.classList.add('confetti-piece');
    el.style.left = `${Math.random() * 100}vw`;
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = `${Math.random() * 2.2 + 2}s`;
    el.style.animationDelay = `${Math.random() * 1}s`;
    confettiContainer.appendChild(el);
  }
}

document.addEventListener('DOMContentLoaded', init);