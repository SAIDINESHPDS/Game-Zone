/* ==========================================================================
   OFFICIAL 4-WAY TABLE UNO ENGINE (MATCHING RADIAL RETRO SCREENSHOT)
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

  if (type === 'card-play') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.08);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'draw') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(420, now + 0.05);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'uno-alert') {
    [587.33, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.6, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.25);
    });
  } else if (type === 'penalty') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(140, now + 0.1);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
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
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.35);
    });
  }
}

// 108 Card Deck
const COLORS = ['red', 'blue', 'green', 'yellow'];

function createUnoDeck() {
  const deck = [];
  let idCounter = 1;

  COLORS.forEach(color => {
    deck.push({ id: `c_${idCounter++}`, color, value: '0', pts: 0 });

    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `c_${idCounter++}`, color, value: `${i}`, pts: i });
      deck.push({ id: `c_${idCounter++}`, color, value: `${i}`, pts: i });
    }

    for (let i = 0; i < 2; i++) {
      deck.push({ id: `c_${idCounter++}`, color, value: 'skip', pts: 20 });
      deck.push({ id: `c_${idCounter++}`, color, value: 'reverse', pts: 20 });
      deck.push({ id: `c_${idCounter++}`, color, value: 'draw2', pts: 20 });
    }
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c_${idCounter++}`, color: 'wild', value: 'wild', pts: 50 });
    deck.push({ id: `c_${idCounter++}`, color: 'wild', value: 'wild4', pts: 50 });
  }

  return deck;
}

// State
let totalPlayers = 2; // 2 or 4
let victoryMode = 'quick'; // 'quick' or 'score'
let targetScore = 500;
let scores = { 1: 0, 2: 0, 3: 0, 4: 0 };

let drawDeck = [];
let discardPile = [];
let hands = { 1: [], 2: [], 3: [], 4: [] };
let currentTurn = 1;
let playDirection = 1; // 1 = clockwise, -1 = counter-clockwise
let activeColor = 'red';
let gameMode = 'pve';
let gameActive = false;
let isBotThinking = false;

// Table Seat Map
let seatPlayerMap = { bottom: 1, top: 2, left: null, right: null };
let playerNames = { 1: 'Player 1', 2: 'Bot 1', 3: 'Bot 2', 4: 'Bot 3' };

// UNO Call & Challenge
let unoCalled = { 1: false, 2: false, 3: false, 4: false };
let vulnerableUnoPlayer = null;
let pendingWildCard = null;

let lastWild4Player = null;
let lastColorBeforeWild4 = null;
let pendingChallengeVictim = null;

// DOM Elements
let turnDot, turnText, soundBtn, rulesBtn, restartBtn;
let seatTop, seatLeft, seatRight, seatBottom;
let topName, topScore, leftName, leftScore, rightName, rightScore, bottomName, bottomScore;
let topHandRow, leftHandCol, rightHandCol, bottomHandRow;
let drawDeckBtn, deckCountEl, discardCardSlot, centerDiamondBacking, arrowOrbit, gameStatusMsg;
let unoBtn, catchUnoBtn, passTurnBtn;
let colorPickerModal, challengeModal, acceptWild4Btn, challengeWild4Btn, challengeDesc;
let setupModal, rulesModal, gameOverModal;
let playerCountSelect, modeSelect, ruleModeSelect;
let p1NameInput, p2NameInput, p3NameInput, p4NameInput;
let p2NameWrap, p3NameWrap, p4NameWrap;
let startGameBtn, closeRulesBtn, modalExitBtn, gameOverExitBtn, playAgainBtn, confettiContainer;
let winnerTitle, winnerDesc;

function init() {
  cacheDOM();
  bindEvents();
  setupModal.classList.remove('hidden');
  startNewRound();
}

function cacheDOM() {
  turnDot = document.getElementById('turn-dot');
  turnText = document.getElementById('turn-text');
  soundBtn = document.getElementById('sound-btn');
  rulesBtn = document.getElementById('rules-btn');
  restartBtn = document.getElementById('restart-btn');

  seatTop = document.getElementById('seat-top');
  seatLeft = document.getElementById('seat-left');
  seatRight = document.getElementById('seat-right');
  seatBottom = document.getElementById('seat-bottom');

  topName = document.getElementById('top-name');
  topScore = document.getElementById('top-score');
  leftName = document.getElementById('left-name');
  leftScore = document.getElementById('left-score');
  rightName = document.getElementById('right-name');
  rightScore = document.getElementById('right-score');
  bottomName = document.getElementById('bottom-name');
  bottomScore = document.getElementById('bottom-score');

  topHandRow = document.getElementById('top-hand-row');
  leftHandCol = document.getElementById('left-hand-col');
  rightHandCol = document.getElementById('right-hand-col');
  bottomHandRow = document.getElementById('bottom-hand-row');

  drawDeckBtn = document.getElementById('draw-deck-btn');
  deckCountEl = document.getElementById('deck-count');
  discardCardSlot = document.getElementById('discard-card-slot');
  centerDiamondBacking = document.getElementById('center-diamond-backing');
  arrowOrbit = document.getElementById('arrow-orbit');
  gameStatusMsg = document.getElementById('game-status-msg');

  unoBtn = document.getElementById('uno-btn');
  catchUnoBtn = document.getElementById('catch-uno-btn');
  passTurnBtn = document.getElementById('pass-turn-btn');

  colorPickerModal = document.getElementById('color-picker-modal');
  challengeModal = document.getElementById('challenge-modal');
  acceptWild4Btn = document.getElementById('accept-wild4-btn');
  challengeWild4Btn = document.getElementById('challenge-wild4-btn');
  challengeDesc = document.getElementById('challenge-desc');

  setupModal = document.getElementById('setup-modal');
  rulesModal = document.getElementById('rules-modal');
  gameOverModal = document.getElementById('game-over-modal');

  playerCountSelect = document.getElementById('player-count-select');
  modeSelect = document.getElementById('mode-select');
  ruleModeSelect = document.getElementById('rule-mode-select');

  p1NameInput = document.getElementById('p1-name-input');
  p2NameInput = document.getElementById('p2-name-input');
  p3NameInput = document.getElementById('p3-name-input');
  p4NameInput = document.getElementById('p4-name-input');

  p2NameWrap = document.getElementById('p2-name-wrap');
  p3NameWrap = document.getElementById('p3-name-wrap');
  p4NameWrap = document.getElementById('p4-name-wrap');

  startGameBtn = document.getElementById('start-game-btn');
  closeRulesBtn = document.getElementById('close-rules-btn');
  modalExitBtn = document.getElementById('modal-exit-btn');
  gameOverExitBtn = document.getElementById('gameover-exit-btn');
  playAgainBtn = document.getElementById('play-again-btn');
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

  drawDeckBtn.addEventListener('click', handlePlayerDrawCard);
  passTurnBtn.addEventListener('click', handlePlayerPassTurn);
  unoBtn.addEventListener('click', handleUnoShout);
  catchUnoBtn.addEventListener('click', handleCatchUnoPenalty);

  acceptWild4Btn.addEventListener('click', handleAcceptWild4);
  challengeWild4Btn.addEventListener('click', handleExecuteWild4Challenge);

  document.querySelectorAll('.color-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      colorPickerModal.classList.add('hidden');
      if (pendingWildCard) {
        completeCardPlacement(pendingWildCard, color);
        pendingWildCard = null;
      }
    });
  });

  rulesBtn.addEventListener('click', () => rulesModal.classList.remove('hidden'));
  closeRulesBtn.addEventListener('click', () => rulesModal.classList.add('hidden'));
  restartBtn.addEventListener('click', () => setupModal.classList.remove('hidden'));

  modalExitBtn.addEventListener('click', () => window.location.href = '../../index.html');
  gameOverExitBtn.addEventListener('click', () => window.location.href = '../../index.html');

  startGameBtn.addEventListener('click', () => {
    totalPlayers = parseInt(playerCountSelect.value, 10);
    gameMode = modeSelect.value;
    victoryMode = ruleModeSelect.value;
    scores = { 1: 0, 2: 0, 3: 0, 4: 0 };

    playerNames[1] = p1NameInput.value.trim() || 'Player 1';
    if (totalPlayers === 2) {
      playerNames[2] = (gameMode === 'pvp') ? (p2NameInput.value.trim() || 'Player 2') : 'Bot 1';
      seatPlayerMap = { bottom: 1, top: 2, left: null, right: null };
    } else {
      playerNames[2] = (gameMode === 'pvp') ? (p2NameInput.value.trim() || 'Player 2') : 'Bot 1';
      playerNames[3] = (gameMode === 'pvp') ? (p3NameInput.value.trim() || 'Player 3') : 'Bot 2';
      playerNames[4] = (gameMode === 'pvp') ? (p4NameInput.value.trim() || 'Player 4') : 'Bot 3';
      seatPlayerMap = { bottom: 1, left: 2, top: 3, right: 4 };
    }

    setupModal.classList.add('hidden');
    startNewRound();
  });

  playAgainBtn.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    scores = { 1: 0, 2: 0, 3: 0, 4: 0 };
    setupModal.classList.remove('hidden');
  });
}

function startNewRound() {
  gameActive = true;
  isBotThinking = false;
  currentTurn = 1;
  playDirection = 1;
  pendingWildCard = null;
  vulnerableUnoPlayer = null;
  lastWild4Player = null;
  unoCalled = { 1: false, 2: false, 3: false, 4: false };

  drawDeck = createUnoDeck().sort(() => Math.random() - 0.5);

  for (let p = 1; p <= totalPlayers; p++) {
    hands[p] = drawDeck.splice(0, 7);
  }

  // Draw starter card (cannot be wild)
  let starter = drawDeck.pop();
  while (starter.color === 'wild') {
    drawDeck.unshift(starter);
    drawDeck.sort(() => Math.random() - 0.5);
    starter = drawDeck.pop();
  }

  discardPile = [starter];
  activeColor = starter.color;

  updateSeatLayout();
  updateUI();
  renderDiscardPile();
  renderAllHands();

  checkIfBotTurn();
}

function updateSeatLayout() {
  if (totalPlayers === 2) {
    seatLeft.classList.add('hidden-seat');
    seatRight.classList.add('hidden-seat');
    seatTop.classList.remove('hidden-seat');
    topName.textContent = playerNames[2].toUpperCase();
    bottomName.textContent = playerNames[1].toUpperCase();
  } else {
    seatLeft.classList.remove('hidden-seat');
    seatRight.classList.remove('hidden-seat');
    seatTop.classList.remove('hidden-seat');
    bottomName.textContent = playerNames[1].toUpperCase();
    leftName.textContent = playerNames[2].toUpperCase();
    topName.textContent = playerNames[3].toUpperCase();
    rightName.textContent = playerNames[4].toUpperCase();
  }
}

function renderDiscardPile() {
  discardCardSlot.innerHTML = '';
  const topCard = discardPile[discardPile.length - 1];
  if (!topCard) return;

  const cardEl = createCardElement(topCard, false);
  discardCardSlot.appendChild(cardEl);

  // Update glowing diamond backing color
  centerDiamondBacking.style.borderColor = `var(--uno-${activeColor})`;
  centerDiamondBacking.style.boxShadow = `0 0 35px var(--uno-${activeColor})`;
}

function renderAllHands() {
  // 1. Bottom Hand (Player 1 Interactive)
  bottomHandRow.innerHTML = '';
  const p1Hand = hands[1] || [];
  p1Hand.forEach(card => {
    const isPlayable = isCardPlayable(card);
    const cardEl = createCardElement(card, true);

    if (isPlayable && currentTurn === 1 && !isBotThinking) {
      cardEl.classList.add('playable');
      cardEl.addEventListener('click', () => handlePlayerCardClick(card));
    }
    bottomHandRow.appendChild(cardEl);
  });

  // 2. Top Hand (Player 2 in 2P, or Player 3 in 4P)
  topHandRow.innerHTML = '';
  const topPlayerNum = (totalPlayers === 2) ? 2 : 3;
  const topCount = (hands[topPlayerNum] || []).length;
  for (let i = 0; i < topCount; i++) {
    topHandRow.appendChild(createDiamondBackElement());
  }

  // 3. Left Hand (Player 2 in 4P)
  if (totalPlayers === 4) {
    leftHandCol.innerHTML = '';
    const leftCount = (hands[2] || []).length;
    for (let i = 0; i < leftCount; i++) {
      leftHandCol.appendChild(createDiamondBackElement());
    }

    // 4. Right Hand (Player 4 in 4P)
    rightHandCol.innerHTML = '';
    const rightCount = (hands[4] || []).length;
    for (let i = 0; i < rightCount; i++) {
      rightHandCol.appendChild(createDiamondBackElement());
    }
  }

  // Pass Turn button visibility
  const canPlayAny = (hands[currentTurn] || []).some(isCardPlayable);
  if (!canPlayAny && currentTurn === 1 && !isBotThinking) {
    passTurnBtn.classList.remove('hidden');
  } else {
    passTurnBtn.classList.add('hidden');
  }

  // Catch UNO button visibility
  if (vulnerableUnoPlayer !== null && vulnerableUnoPlayer !== currentTurn) {
    catchUnoBtn.classList.remove('hidden');
  } else {
    catchUnoBtn.classList.add('hidden');
  }
}

function createDiamondBackElement() {
  const el = document.createElement('div');
  el.className = 'card-back-diamond';
  el.innerHTML = `
    <div class="back-diamond-quad">
      <span class="quad-p quad-top"></span>
      <span class="quad-p quad-right"></span>
      <span class="quad-p quad-bottom"></span>
      <span class="quad-p quad-left"></span>
    </div>
  `;
  return el;
}

function createCardElement(card, interactive = true) {
  const el = document.createElement('div');
  el.className = `uno-card ${card.color}`;

  const face = document.createElement('div');
  face.className = 'uno-card-face';

  const isSixOrNine = card.value === '6' || card.value === '9';
  const underlineClass = isSixOrNine ? 'underlined' : '';

  const cornerTL = document.createElement('div');
  cornerTL.className = `card-corner top-left ${underlineClass}`;
  cornerTL.innerHTML = getCornerGraphic(card);

  const oval = document.createElement('div');
  oval.className = 'card-oval';
  oval.innerHTML = getCenterGraphic(card, underlineClass);

  const cornerBR = document.createElement('div');
  cornerBR.className = `card-corner bottom-right ${underlineClass}`;
  cornerBR.innerHTML = getCornerGraphic(card);

  face.appendChild(cornerTL);
  face.appendChild(oval);
  face.appendChild(cornerBR);
  el.appendChild(face);

  return el;
}

function getCenterGraphic(card, underlineClass) {
  if (['0','1','2','3','4','5','6','7','8','9'].includes(card.value)) {
    return `<span class="card-center-val ${underlineClass}">${card.value}</span>`;
  }
  if (card.value === 'skip') {
    return `
      <svg viewBox="0 0 100 100" class="action-svg-icon">
        <circle cx="50" cy="50" r="40" stroke="#ffffff" stroke-width="12" fill="none" />
        <line x1="22" y1="22" x2="78" y2="78" stroke="#ffffff" stroke-width="12" stroke-linecap="round" />
      </svg>`;
  }
  if (card.value === 'reverse') {
    return `
      <svg viewBox="0 0 100 100" class="action-svg-icon">
        <path d="M 25 35 L 75 35 L 60 20 M 75 35 L 60 50" fill="none" stroke="#ffffff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 75 65 L 25 65 L 40 50 M 25 65 L 40 80" fill="none" stroke="#ffffff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }
  if (card.value === 'draw2') {
    return `
      <svg viewBox="0 0 100 100" class="action-svg-icon">
        <rect x="22" y="20" width="34" height="52" rx="4" fill="#ffffff" stroke="#000" stroke-width="3" transform="rotate(-12 39 46)"/>
        <rect x="44" y="28" width="34" height="52" rx="4" fill="#ffffff" stroke="#000" stroke-width="3" transform="rotate(10 61 54)"/>
      </svg>`;
  }
  if (card.value === 'wild') {
    return `
      <div class="wild-oval">
        <div class="wild-quad q-red"></div>
        <div class="wild-quad q-blue"></div>
        <div class="wild-quad q-yellow"></div>
        <div class="wild-quad q-green"></div>
      </div>`;
  }
  if (card.value === 'wild4') {
    return `
      <div class="wild4-fanned-cards">
        <div class="mini-card mini-c1"></div>
        <div class="mini-card mini-c2"></div>
        <div class="mini-card mini-c3"></div>
        <div class="mini-card mini-c4"></div>
      </div>`;
  }
  return '';
}

function getCornerGraphic(card) {
  if (['0','1','2','3','4','5','6','7','8','9'].includes(card.value)) {
    return card.value;
  }
  if (card.value === 'skip') {
    return `
      <svg viewBox="0 0 100 100" class="action-corner-svg">
        <circle cx="50" cy="50" r="40" stroke="#ffffff" stroke-width="14" fill="none"/>
        <line x1="22" y1="22" x2="78" y2="78" stroke="#ffffff" stroke-width="14"/>
      </svg>`;
  }
  if (card.value === 'reverse') {
    return `
      <svg viewBox="0 0 100 100" class="action-corner-svg">
        <path d="M 20 35 L 80 35 L 60 15 M 80 65 L 20 65 L 40 85" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>
      </svg>`;
  }
  if (card.value === 'draw2') return `+2`;
  if (card.value === 'wild4') return `+4`;
  if (card.value === 'wild') return `★`;
  return '';
}

function isCardPlayable(card) {
  const topCard = discardPile[discardPile.length - 1];
  if (!topCard) return true;

  if (card.color === 'wild') return true;
  if (card.color === activeColor) return true;
  if (card.value === topCard.value) return true;

  return false;
}

/* ==========================================================================
   TURN & PLAY ACTIONS
   ========================================================================== */
function handlePlayerCardClick(card) {
  if (!gameActive || isBotThinking) return;

  if (card.color === 'wild') {
    pendingWildCard = card;
    colorPickerModal.classList.remove('hidden');
  } else {
    completeCardPlacement(card, card.color);
  }
}

function completeCardPlacement(card, chosenColor) {
  playSound('card-play');

  const previousPlayer = currentTurn;
  const previousColor = activeColor;

  if (hands[previousPlayer].length === 2 && !unoCalled[previousPlayer]) {
    vulnerableUnoPlayer = previousPlayer;
  } else {
    vulnerableUnoPlayer = null;
  }

  hands[previousPlayer] = hands[previousPlayer].filter(c => c.id !== card.id);
  discardPile.push(card);
  activeColor = chosenColor;

  updateUI();
  renderDiscardPile();

  if (hands[previousPlayer].length === 0) {
    handleRoundWon(previousPlayer);
    return;
  }

  resolveActionCard(card, previousPlayer, previousColor);
}

function resolveActionCard(card, playerWhoPlayed, colorBeforePlay) {
  let skipNext = false;
  const nextTarget = getNextPlayer();

  if (card.value === 'reverse') {
    if (totalPlayers === 2) {
      skipNext = true;
      gameStatusMsg.textContent = `${playerNames[playerWhoPlayed]} played Reverse (Skip in 2P)!`;
    } else {
      playDirection *= -1;
      arrowOrbit.classList.toggle('reversed', playDirection === -1);
      gameStatusMsg.textContent = `${playerNames[playerWhoPlayed]} reversed play direction!`;
    }
  } else if (card.value === 'skip') {
    skipNext = true;
    gameStatusMsg.textContent = `${playerNames[playerWhoPlayed]} played Skip! ${playerNames[nextTarget]} skipped!`;
  } else if (card.value === 'draw2') {
    drawPenaltyCards(nextTarget, 2);
    skipNext = true;
    gameStatusMsg.textContent = `${playerNames[playerWhoPlayed]} played +2! ${playerNames[nextTarget]} draws 2!`;
  } else if (card.value === 'wild4') {
    lastWild4Player = playerWhoPlayed;
    lastColorBeforeWild4 = colorBeforePlay;
    pendingChallengeVictim = nextTarget;

    if (nextTarget === 1 || gameMode === 'pvp') {
      challengeDesc.textContent = `${playerNames[playerWhoPlayed]} played Wild Draw Four (+4)! Challenge to see if they held ${lastColorBeforeWild4.toUpperCase()}?`;
      challengeModal.classList.remove('hidden');
      return;
    } else {
      const botWillChallenge = Math.random() < 0.25;
      if (botWillChallenge) {
        executeWild4Challenge(nextTarget);
      } else {
        drawPenaltyCards(nextTarget, 4);
        currentTurn = nextTarget;
        advanceTurn();
      }
      return;
    }
  }

  if (skipNext) {
    currentTurn = nextTarget;
  }

  advanceTurn();
}

function handleAcceptWild4() {
  challengeModal.classList.add('hidden');
  const victim = pendingChallengeVictim;
  drawPenaltyCards(victim, 4);
  gameStatusMsg.textContent = `${playerNames[victim]} accepted the +4 and drew 4 cards.`;

  currentTurn = victim;
  advanceTurn();
}

function handleExecuteWild4Challenge() {
  challengeModal.classList.add('hidden');
  executeWild4Challenge(pendingChallengeVictim);
}

function executeWild4Challenge(challenger) {
  const accusedHand = hands[lastWild4Player];
  const heldMatchingColor = accusedHand.some(c => c.color === lastColorBeforeWild4);

  if (heldMatchingColor) {
    playSound('penalty');
    drawPenaltyCards(lastWild4Player, 4);
    gameStatusMsg.textContent = `Challenge Won! ${playerNames[lastWild4Player]} had ${lastColorBeforeWild4.toUpperCase()}! They draw 4!`;
    currentTurn = challenger;
  } else {
    playSound('penalty');
    drawPenaltyCards(challenger, 6);
    gameStatusMsg.textContent = `Challenge Failed! ${playerNames[lastWild4Player]} played legally. ${playerNames[challenger]} draws 6 cards!`;
    currentTurn = challenger;
    advanceTurn();
    return;
  }

  updateUI();
  renderAllHands();
  checkIfBotTurn();
}

function drawPenaltyCards(playerNum, count) {
  for (let i = 0; i < count; i++) {
    if (drawDeck.length === 0) recycleDiscardPile();
    if (drawDeck.length > 0) {
      hands[playerNum].push(drawDeck.pop());
    }
  }
}

function handlePlayerDrawCard() {
  if (!gameActive || isBotThinking) return;

  if (drawDeck.length === 0) recycleDiscardPile();
  if (drawDeck.length === 0) return;

  const drawn = drawDeck.pop();
  hands[currentTurn].push(drawn);
  playSound('draw');

  updateUI();
  renderAllHands();

  if (isCardPlayable(drawn)) {
    gameStatusMsg.textContent = `You drew a playable card! Tap it to play or click Pass Turn.`;
  } else {
    gameStatusMsg.textContent = `${playerNames[currentTurn]} drew a card and passed.`;
    advanceTurn();
  }
}

function handlePlayerPassTurn() {
  if (!gameActive || isBotThinking) return;
  gameStatusMsg.textContent = `${playerNames[currentTurn]} passed.`;
  advanceTurn();
}

function handleUnoShout() {
  if (!gameActive) return;

  unoCalled[currentTurn] = true;
  vulnerableUnoPlayer = null;
  playSound('uno-alert');
  gameStatusMsg.textContent = `${playerNames[currentTurn]} called UNO! 🔥`;
}

function handleCatchUnoPenalty() {
  if (vulnerableUnoPlayer === null) return;

  const caughtPlayer = vulnerableUnoPlayer;
  vulnerableUnoPlayer = null;
  playSound('penalty');
  drawPenaltyCards(caughtPlayer, 2);

  gameStatusMsg.textContent = `Caught! ${playerNames[caughtPlayer]} forgot to call UNO! +2 Penalty cards!`;
  updateUI();
  renderAllHands();
}

function getNextPlayer() {
  let next = currentTurn + playDirection;
  if (next > totalPlayers) next = 1;
  if (next < 1) next = totalPlayers;
  return next;
}

function advanceTurn() {
  currentTurn = getNextPlayer();
  unoCalled[currentTurn] = false;

  updateUI();
  renderAllHands();

  if (vulnerableUnoPlayer !== null && vulnerableUnoPlayer !== currentTurn && gameMode === 'pve') {
    if (Math.random() < 0.65) {
      setTimeout(handleCatchUnoPenalty, 600);
    }
  }

  checkIfBotTurn();
}

function recycleDiscardPile() {
  if (discardPile.length <= 1) return;
  const top = discardPile.pop();
  drawDeck = discardPile.map(c => ({
    ...c,
    color: c.value.startsWith('wild') ? 'wild' : c.color
  })).sort(() => Math.random() - 0.5);
  discardPile = [top];
  gameStatusMsg.textContent = "Reshuffled discard pile into draw deck!";
}

function checkIfBotTurn() {
  if (!gameActive) return;
  const isBot = (gameMode === 'pve') && (currentTurn > 1);

  if (isBot) {
    isBotThinking = true;
    setTimeout(botTurn, 850);
  }
}

function botTurn() {
  if (!gameActive) return;

  const botHand = hands[currentTurn] || [];
  const playable = botHand.filter(isCardPlayable);

  if (botHand.length === 2 && Math.random() > 0.15) {
    unoCalled[currentTurn] = true;
    playSound('uno-alert');
    gameStatusMsg.textContent = `${playerNames[currentTurn]} shouted UNO! 🔥`;
  }

  if (playable.length > 0) {
    playable.sort((a, b) => {
      const aVal = a.value.startsWith('wild') ? 0 : (['draw2', 'skip', 'reverse'].includes(a.value) ? 2 : 1);
      const bVal = b.value.startsWith('wild') ? 0 : (['draw2', 'skip', 'reverse'].includes(b.value) ? 2 : 1);
      return bVal - aVal;
    });

    const chosen = playable[0];

    let chosenColor = chosen.color;
    if (chosen.color === 'wild') {
      const colorCounts = { red: 0, blue: 0, green: 0, yellow: 0 };
      botHand.forEach(c => { if (colorCounts[c.color] !== undefined) colorCounts[c.color]++; });
      chosenColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
    }

    isBotThinking = false;
    completeCardPlacement(chosen, chosenColor);
  } else {
    if (drawDeck.length === 0) recycleDiscardPile();
    if (drawDeck.length > 0) {
      const drawn = drawDeck.pop();
      botHand.push(drawn);
      playSound('draw');
      updateUI();
      renderAllHands();

      if (isCardPlayable(drawn)) {
        setTimeout(botTurn, 600);
      } else {
        isBotThinking = false;
        gameStatusMsg.textContent = `${playerNames[currentTurn]} drew and passed.`;
        advanceTurn();
      }
    } else {
      isBotThinking = false;
      advanceTurn();
    }
  }
}

function handleRoundWon(winner) {
  gameActive = false;
  isBotThinking = false;
  playSound('win');

  let roundPoints = 0;
  for (let p = 1; p <= totalPlayers; p++) {
    if (p !== winner) {
      roundPoints += hands[p].reduce((sum, c) => sum + c.pts, 0);
    }
  }

  scores[winner] += roundPoints;
  updateUI();

  if (victoryMode === 'quick' || scores[winner] >= targetScore) {
    triggerCelebration();
    winnerTitle.textContent = `${playerNames[winner].toUpperCase()} WINS!`;
    winnerDesc.textContent = `Championship claimed! Final Score: ${scores[winner]} points.`;
    gameOverModal.classList.remove('hidden');
  } else {
    gameStatusMsg.textContent = `${playerNames[winner]} won the round (+${roundPoints} pts)! Next round starting...`;
    setTimeout(startNewRound, 2400);
  }
}

function updateUI() {
  turnText.textContent = `${playerNames[currentTurn]}'s Turn`;
  deckCountEl.textContent = drawDeck.length;

  bottomScore.innerHTML = `<i class="fa-solid fa-star"></i> ${scores[1]}`;
  if (totalPlayers === 2) {
    topScore.innerHTML = `<i class="fa-solid fa-star"></i> ${scores[2]}`;
  } else {
    leftScore.innerHTML = `<i class="fa-solid fa-star"></i> ${scores[2]}`;
    topScore.innerHTML = `<i class="fa-solid fa-star"></i> ${scores[3]}`;
    rightScore.innerHTML = `<i class="fa-solid fa-star"></i> ${scores[4]}`;
  }
}

function triggerCelebration() {
  if (!confettiContainer) return;
  confettiContainer.innerHTML = '';
  const colors = ['#c7242d', '#0060a8', '#238b38', '#e6b112', '#ffffff'];

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