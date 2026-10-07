/* ==========================================================================
   CHESS - MASTER STAUNTON VECTORS, DYNAMIC THEMES & TACTILE AUDIO SYNTHESIZER
   ========================================================================== */

// 6 distinct architectures: Master Staunton, Neo Tournament, Woodmaster, Classic Royal, Medieval, Maharaja
const PIECE_DESIGNS = {
  // 1. Master Staunton
  'master-staunton': {
    k: "M32 4v7m-4-3.5h8M21 16c3 3 5 5 11 5s8-2 11-5c3 0 6 3 6 8 0 5-4 8-7 10l2 11H20l2-11c-3-2-7-5-7-10 0-5 3-8 6-8zm-2 35h26v4H19zm-3 6h32v4H16z",
    q: "M16 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm16-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm16 2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 23l4 14h18l4-14-7 5-6-10-6 10-7-5zm2 17h22v4H21zm-3 6h28v4H18z",
    r: "M18 13h28v9h-4v-4h-5v4h-6v-4h-5v4h-4zm3 11h22l-1 16H22zm-1 19h24v4H20zm-3 6h30v4H17z",
    b: "M32 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0 4c-6 0-10 4-10 10 0 4 2 8 5 10l-1 10h12l-1-10c3-2 5-6 5-10 0-6-4-10-10-10zm-4 9l8-5m-8 0l8 5M21 43h22v4H21zm-3 6h28v4H18z",
    n: "M18 49h28v4H18zm3-6h22c0-3-2-6-2-6s7-1 7-9c0-7-7-10-11-10-2 0-6 1-9 4l-4 4c0 3 2 4 2 6s-4 3-4 6 2 4 2 4l-3 3zm11-26c1-2 4-3 6-3",
    p: "M32 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-8 4c4 2 12 2 16 0-1 4-2 9-2 15H26c0-6-1-11-2-15zm-2 18h24v4H22zm-3 6h26v4H19z"
  },
  // 2. Neo Tournament
  'neo-staunton': {
    k: "M32 5v7m-4-3.5h8M22 17c3 4 5 5 10 5s7-1 10-5c3 0 6 3 6 8 0 6-5 9-8 11l2 11H22l2-11c-3-2-8-5-8-11 0-5 3-8 6-8zm-2 35h24v4H20zm-3 6h30v4H17z",
    q: "M16 16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm16-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm16 2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 23l4 14h18l4-14-7 5-6-10-6 10-7-5zm2 17h22v4H21zm-3 6h28v4H18z",
    r: "M18 14h28v8h-4v-4h-5v4h-6v-4h-5v4h-4zm3 10h22l-1 16H22zm-1 19h24v4H20zm-3 6h30v4H17z",
    b: "M32 6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0 4c-6 0-10 4-10 10 0 4 2 8 5 10l-1 10h12l-1-10c3-2 5-6 5-10 0-6-4-10-10-10zm-4 9l8-5m-8 0l8 5M21 43h22v4H21zm-3 6h28v4H18z",
    n: "M18 49h28v4H18zm3-6h22c0-3-2-6-2-6s7-1 7-9c0-7-7-10-11-10-2 0-6 1-9 4l-4 4c0 3 2 4 2 6s-4 3-4 6 2 4 2 4l-3 3zm11-26c1-2 4-3 6-3",
    p: "M32 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-8 4c4 2 12 2 16 0-1 4-2 9-2 15H26c0-6-1-11-2-15zm-2 18h24v4H22zm-3 6h26v4H19z"
  },
  // 3. Woodmaster Classics
  'woodmaster-pieces': {
    k: "M32 4v8m-4-4h8M23 16c2 4 5 5 9 5s7-1 9-5c3 0 6 3 6 7 0 5-4 8-7 10l2 11H22l2-11c-3-2-7-5-7-10 0-4 3-7 6-7zm-3 35h24v4H20zm-3 6h30v4H17z",
    q: "M17 15a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm15-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm15 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM20 22l3 15h18l3-15-6 4-6-8-6 8zm1 18h22v4H21zm-3 6h28v4H18z",
    r: "M19 14h26v8h-4v-4h-4v4h-6v-4h-4v4h-4zm3 10h20l-1 16H23zm-1 19h22v4H21zm-3 6h28v4H18z",
    b: "M32 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-7 11c3-3 11-3 14 0 3 6 0 13-2 16H27c-2-3-5-10-2-16zm-5 24h24v4H20zm-3 6h30v4H17z",
    n: "M18 49h28v4H18zm4-6h20c0-4-2-7-2-7s6-2 6-8c0-6-6-9-10-9s-6 2-8 4l-4 4 1 5-4 2 2 5zm10-21a4 4 0 0 1 4 2",
    p: "M32 17a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zm-7 5h14l-2 18H27zm-5 20h24v4H20zm-3 6h30v4H17z"
  },
  // 4. Classic Royal
  'classic-royal': {
    k: "M32 4v6m-3-3h6M24 16c2 4 4 5 8 5s6-1 8-5c3 0 7 3 7 7 0 5-4 8-7 10l2 11H20l2-11c-3-2-7-5-7-10 0-4 4-7 7-7zm-4 35h24v4H20zm-3 6h30v4H17z",
    q: "M16 16a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm16-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm16 2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 23l4 14h18l4-14-7 5-6-10-6 10-7-5zm2 17h22v4H21zm-3 6h28v4H18z",
    r: "M18 14h28v8h-4v-4h-5v4h-6v-4h-5v4h-4zm3 10h22l-1 16H22zm-1 19h24v4H20zm-3 6h30v4H17z",
    b: "M32 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 4c-6 0-10 4-10 10 0 4 2 8 5 10l-1 10h12l-1-10c3-2 5-6 5-10 0-6-4-10-10-10zm-3 9l6-4m-6 0l6 4M21 43h22v4H21zm-3 6h28v4H18z",
    n: "M18 49h28v4H18zm3-6h22c0-3-2-6-2-6s7-1 7-9c0-7-7-10-11-10-2 0-6 1-9 4l-4 4c0 3 2 4 2 6s-4 3-4 6 2 4 2 4l-3 3zm11-26c1-2 4-3 6-3",
    p: "M32 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-8 4c4 2 12 2 16 0-1 4-2 9-2 15H26c0-6-1-11-2-15zm-2 18h24v4H22zm-3 6h26v4H19z"
  },
  // 5. Medieval Knights
  'medieval': {
    k: "M32 4v7m-4-3.5h8M21 16h22l-2 10 4 5-3 9H22l-3-9 4-5zm0 33h22v4H21zm-4 6h30v5H17z",
    q: "M20 12l4 8 8-8 8 8 4-8 2 18-5 10H23l-5-10zm1 29h22v4H21zm-3 6h28v5H18z",
    r: "M16 12h32v10h-5v-4h-7v4h-6v-4h-7v4h-5zm3 12h26v16H19zm-1 18h28v4H18zm-3 6h34v5H15z",
    b: "M32 4l-9 14 3 12h12l3-12zm-3 12h6M20 42h24v4H20zm-3 6h30v5H17z",
    n: "M17 50h30v4H17zm4-6h22l3-9c0-8-5-14-11-14s-7 3-10 6l-5 4 1 5-4 2 2 6zm9-23l4 3",
    p: "M32 10l-6 10h12zm-7 12h14l-2 16H27zm-5 18h24v4H20zm-3 6h30v4H17z"
  },
  // 6. Maharaja Heritage
  'maharaja': {
    k: "M32 4c2 3 5 4 5 7s-3 4-5 6c-2-2-5-3-5-6s3-4 5-7zm-10 16c4-3 16-3 20 0 3 6-1 14-4 17l2 11H24l2-11c-3-3-7-11-4-17zm-1 31h22v4H21zm-3 6h28v4H18z",
    q: "M32 8c3 4 8 5 8 9s-4 5-8 7c-4-2-8-3-8-7s5-5 8-9zm-12 18h24l-3 12H23zm0 15h24v4H20zm-3 6h30v4H17z",
    r: "M19 12h26v6l-3 4 2 16H20l2-16-3-4zm0 29h26v4H19zm-3 6h32v4H16z",
    b: "M32 5c2 4 4 6 4 9 0 4-4 6-4 9-2-3-4-5-4-9 0-3 2-5 4-9zm-9 22h18l-2 13H25zm-3 15h24v4H20zm-3 6h30v4H17z",
    n: "M17 50h30v4H17zm4-6h22l2-7c0-6-3-12-8-15-4-2-8 0-11 3l-6 5 2 4-5 3 2 5zm11-21c2 1 4 3 4 6",
    p: "M32 8c2 3 4 4 4 7s-2 4-4 6c-2-2-4-3-4-6s2-4 4-7zm-6 15h12l-2 17H28zm-6 19h24v4H20zm-3 6h30v4H17z"
  }
};

const INITIAL_BOARD = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
];

const PST = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50]
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20]
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0]
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20]
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20]
  ]
};

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

/* ==========================================================================
   ENHANCED WEB AUDIO API ENGINE - LOUD, TACTILE CHESS IMPACTS
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Master synthesized audio generator: rich, wooden, crisp, and loud
function playSound(type) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'select') {
    // Subtle crisp wood lift / tap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.05);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'move') {
    // Solid, authentic wooden board THUD/KNOCK (dual-layer)
    // Layer 1: High crisp impact snap (the edge contacting the wood)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(580, now);
    snapOsc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

    snapGain.gain.setValueAtTime(0.75, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.09);

    // Layer 2: Deep hollow board resonance body
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(210, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(75, now + 0.16);

    bodyGain.gain.setValueAtTime(0.70, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.16);
  } else if (type === 'capture') {
    // Punchy, heavy piece TAKE / KILL crack
    // Layer 1: Sharp percussive click
    const strikeOsc = ctx.createOscillator();
    const strikeGain = ctx.createGain();
    strikeOsc.type = 'sawtooth';
    strikeOsc.frequency.setValueAtTime(720, now);
    strikeOsc.frequency.exponentialRampToValueAtTime(90, now + 0.14);

    strikeGain.gain.setValueAtTime(0.85, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    strikeOsc.connect(strikeGain);
    strikeGain.connect(ctx.destination);
    strikeOsc.start(now);
    strikeOsc.stop(now + 0.14);

    // Layer 2: Deep tactile chest thump
    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(160, now);
    thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    thudGain.gain.setValueAtTime(0.80, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.2);
  } else if (type === 'check') {
    // Resonant high royal chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(784, now); // G5
    osc.frequency.setValueAtTime(987.77, now + 0.08); // B5

    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'win') {
    // Grandmaster victory fanfare chords
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.55, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.38);
    });
  }
}

// Game State
let board = INITIAL_BOARD.map(row => [...row]);
let currentTurn = 'w';
let selectedSquare = null;
let validMoves = [];
let gameActive = false;
let gameMode = 'pvp';
let humanSide = 'w';
let isBotThinking = false;

let playerNames = {
  w: 'Player 1',
  b: 'Player 2'
};

let castlingRights = {
  w: { kingMoved: false, rookKmoved: false, rookQmoved: false },
  b: { kingMoved: false, rookKmoved: false, rookQmoved: false }
};
let enPassantTarget = null;
let lastMove = null;
let capturedPieces = { w: [], b: [] };

let positionHistory = {};
let halfMoveClock = 0;

let timerInterval = null;
let timeLimit = 600;
let clocks = { w: 600, b: 600 };

let pendingPromotion = null;

// DOM references
let boardElement, turnText, turnDot, cardWhite, cardBlack, whiteName, blackName;
let whiteClock, blackClock, capturedByWhite, capturedByBlack, gameStatusPill, modeDisplay, moveHistory;
let p1NameInput, p2NameInput, p2NameGroup, playerSideGroup, modeSelect, sideSelect, timeSelect;
let setupModal, themeModal, rulesModal, promotionModal, gameOverModal, exitModal;
let winnerTitle, winnerDesc, startGameBtn, themeBtn, closeThemeBtn, rulesBtn, closeRulesBtn;
let restartBtn, playAgainBtn, drawBtn, resignBtn, exitBtn, confirmExitBtn, cancelExitBtn;
let modalExitBtn, gameOverExitBtn, backNavBtn, soundBtn, confettiContainer;

function init() {
  cacheDOM();
  bindEvents();

  // Load untimed saved game if available
  const savedState = localStorage.getItem('chess_untimed_save');
  if (savedState) {
    try {
      loadSavedGame(JSON.parse(savedState));
      return;
    } catch (e) {
      console.warn("Failed to load saved state, starting fresh.", e);
    }
  }

  // Open setup modal on first entry
  setupModal.classList.remove('hidden');
  startNewGame();
}

function cacheDOM() {
  boardElement = document.getElementById('board');
  turnText = document.getElementById('turn-text');
  turnDot = document.getElementById('turn-dot');
  cardWhite = document.getElementById('card-white');
  cardBlack = document.getElementById('card-black');
  whiteName = document.getElementById('white-name');
  blackName = document.getElementById('black-name');
  whiteClock = document.getElementById('white-clock');
  blackClock = document.getElementById('black-clock');
  capturedByWhite = document.getElementById('captured-by-white');
  capturedByBlack = document.getElementById('captured-by-black');
  gameStatusPill = document.getElementById('game-status-pill');
  modeDisplay = document.getElementById('mode-display');
  moveHistory = document.getElementById('move-history');

  p1NameInput = document.getElementById('p1-name-input');
  p2NameInput = document.getElementById('p2-name-input');
  p2NameGroup = document.getElementById('p2-name-group');
  playerSideGroup = document.getElementById('player-side-group');
  modeSelect = document.getElementById('mode-select');
  sideSelect = document.getElementById('side-select');
  timeSelect = document.getElementById('time-select');

  setupModal = document.getElementById('setup-modal');
  themeModal = document.getElementById('theme-modal');
  rulesModal = document.getElementById('rules-modal');
  promotionModal = document.getElementById('promotion-modal');
  gameOverModal = document.getElementById('game-over-modal');
  exitModal = document.getElementById('exit-modal');
  winnerTitle = document.getElementById('winner-title');
  winnerDesc = document.getElementById('winner-desc');

  startGameBtn = document.getElementById('start-game-btn');
  themeBtn = document.getElementById('theme-btn');
  closeThemeBtn = document.getElementById('close-theme-btn');
  rulesBtn = document.getElementById('rules-btn');
  closeRulesBtn = document.getElementById('close-rules-btn');
  restartBtn = document.getElementById('restart-btn');
  playAgainBtn = document.getElementById('play-again-btn');
  drawBtn = document.getElementById('draw-btn');
  resignBtn = document.getElementById('resign-btn');
  exitBtn = document.getElementById('exit-btn');
  confirmExitBtn = document.getElementById('confirm-exit-btn');
  cancelExitBtn = document.getElementById('cancel-exit-btn');
  modalExitBtn = document.getElementById('modal-exit-btn');
  gameOverExitBtn = document.getElementById('gameover-exit-btn');
  backNavBtn = document.getElementById('back-nav-btn');
  soundBtn = document.getElementById('sound-btn');
  confettiContainer = document.getElementById('confetti-container');
}

function bindEvents() {
  // Unlock Web Audio context on user interaction
  document.body.addEventListener('click', () => getAudioContext(), { once: true });

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
    });
  }

  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      const isPvP = e.target.value === 'pvp';
      if (p2NameGroup) p2NameGroup.style.display = isPvP ? 'block' : 'none';
      if (playerSideGroup) playerSideGroup.style.display = isPvP ? 'none' : 'block';
    });
  }

  if (themeBtn) themeBtn.addEventListener('click', () => themeModal.classList.remove('hidden'));
  if (closeThemeBtn) closeThemeBtn.addEventListener('click', () => themeModal.classList.add('hidden'));

  if (rulesBtn) rulesBtn.addEventListener('click', () => rulesModal.classList.remove('hidden'));
  if (closeRulesBtn) closeRulesBtn.addEventListener('click', () => rulesModal.classList.add('hidden'));

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      clearInterval(timerInterval);
      setupModal.classList.remove('hidden');
    });
  }

  // Exit flow: Confirms exit and does NOT save
  if (exitBtn) exitBtn.addEventListener('click', () => exitModal.classList.remove('hidden'));
  if (cancelExitBtn) cancelExitBtn.addEventListener('click', () => exitModal.classList.add('hidden'));
  if (confirmExitBtn) {
    confirmExitBtn.addEventListener('click', () => {
      localStorage.removeItem('chess_untimed_save');
      window.location.href = '../../index.html';
    });
  }
  if (modalExitBtn) {
    modalExitBtn.addEventListener('click', () => {
      localStorage.removeItem('chess_untimed_save');
      window.location.href = '../../index.html';
    });
  }
  if (gameOverExitBtn) {
    gameOverExitBtn.addEventListener('click', () => {
      localStorage.removeItem('chess_untimed_save');
      window.location.href = '../../index.html';
    });
  }

  // Back button: Saves progress ONLY if untimed match
  if (backNavBtn) {
    backNavBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (gameActive && timeLimit === 0) {
        saveUntimedGame();
      } else {
        localStorage.removeItem('chess_untimed_save');
      }
      window.location.href = '../../index.html';
    });
  }

  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      gameMode = modeSelect.value;
      humanSide = sideSelect ? sideSelect.value : 'w';
      timeLimit = parseInt(timeSelect.value, 10);

      const isPvP = gameMode === 'pvp';
      if (isPvP) {
        playerNames.w = p1NameInput.value.trim() || 'Player 1';
        playerNames.b = p2NameInput.value.trim() || 'Player 2';
      } else {
        const botLabel = modeSelect.options[modeSelect.selectedIndex].text.replace('vs Computer ', '');
        if (humanSide === 'w') {
          playerNames.w = p1NameInput.value.trim() || 'Player 1';
          playerNames.b = `Bot ${botLabel}`;
        } else {
          playerNames.w = `Bot ${botLabel}`;
          playerNames.b = p1NameInput.value.trim() || 'Player 1';
        }
      }

      modeDisplay.textContent = modeSelect.options[modeSelect.selectedIndex].text;
      setupModal.classList.add('hidden');
      localStorage.removeItem('chess_untimed_save');
      startNewGame();
    });
  }

  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      gameOverModal.classList.add('hidden');
      setupModal.classList.remove('hidden');
    });
  }

  if (resignBtn) resignBtn.addEventListener('click', handleResign);
  if (drawBtn) drawBtn.addEventListener('click', handleOfferDraw);

  // Sync board theme selectors
  document.querySelectorAll('.theme-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-card-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.board === btn.dataset.board);
      });
      document.body.setAttribute('data-board-theme', btn.dataset.board);
      if (timeLimit === 0 && gameActive) saveUntimedGame();
    });
  });

  // Sync piece theme selectors
  document.querySelectorAll('.piece-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.piece-card-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.piece === btn.dataset.piece);
      });
      document.body.setAttribute('data-piece-theme', btn.dataset.piece);
      renderBoard();
      if (timeLimit === 0 && gameActive) saveUntimedGame();
    });
  });

  document.querySelectorAll('.promo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (pendingPromotion) {
        const choice = btn.dataset.piece;
        pendingPromotion(choice);
        pendingPromotion = null;
        promotionModal.classList.add('hidden');
      }
    });
  });
}

function saveUntimedGame() {
  const savePayload = {
    board,
    currentTurn,
    playerNames,
    castlingRights,
    enPassantTarget,
    lastMove,
    capturedPieces,
    halfMoveClock,
    gameMode,
    humanSide,
    boardTheme: document.body.getAttribute('data-board-theme'),
    pieceTheme: document.body.getAttribute('data-piece-theme')
  };
  localStorage.setItem('chess_untimed_save', JSON.stringify(savePayload));
}

function loadSavedGame(save) {
  board = save.board;
  currentTurn = save.currentTurn;
  playerNames = save.playerNames;
  castlingRights = save.castlingRights;
  enPassantTarget = save.enPassantTarget;
  lastMove = save.lastMove;
  capturedPieces = save.capturedPieces;
  halfMoveClock = save.halfMoveClock;
  gameMode = save.gameMode;
  humanSide = save.humanSide;
  timeLimit = 0;
  gameActive = true;
  isBotThinking = false;

  document.body.setAttribute('data-board-theme', save.boardTheme || 'tournament-green');
  document.body.setAttribute('data-piece-theme', save.pieceTheme || 'master-staunton');

  if (whiteName) whiteName.textContent = playerNames.w;
  if (blackName) blackName.textContent = playerNames.b;
  if (whiteClock) whiteClock.textContent = "∞";
  if (blackClock) blackClock.textContent = "∞";

  updateUI();
  renderBoard();
}

function startNewGame() {
  clearInterval(timerInterval);
  board = INITIAL_BOARD.map(row => [...row]);
  currentTurn = 'w';
  selectedSquare = null;
  validMoves = [];
  gameActive = true;
  isBotThinking = false;
  lastMove = null;
  enPassantTarget = null;
  halfMoveClock = 0;
  capturedPieces = { w: [], b: [] };
  positionHistory = {};

  castlingRights = {
    w: { kingMoved: false, rookKmoved: false, rookQmoved: false },
    b: { kingMoved: false, rookKmoved: false, rookQmoved: false }
  };

  if (whiteName) whiteName.textContent = playerNames.w;
  if (blackName) blackName.textContent = playerNames.b;

  clocks = { w: timeLimit, b: timeLimit };
  updateClockDisplay();
  if (timeLimit > 0) {
    timerInterval = setInterval(handleClockTick, 1000);
  } else {
    if (whiteClock) whiteClock.textContent = "∞";
    if (blackClock) blackClock.textContent = "∞";
  }

  if (moveHistory) moveHistory.innerHTML = '<span class="empty-history">Game started...</span>';
  if (confettiContainer) confettiContainer.innerHTML = '';

  recordPositionState();
  updateUI();
  renderBoard();

  if (gameMode !== 'pvp' && humanSide === 'b' && currentTurn === 'w') {
    isBotThinking = true;
    setTimeout(triggerBotMove, 500);
  }
}

function renderBoard() {
  boardElement.innerHTML = '';
  const currentTheme = document.body.getAttribute('data-piece-theme') || 'master-staunton';
  const themePaths = PIECE_DESIGNS[currentTheme] || PIECE_DESIGNS['master-staunton'];

  const inCheckSquare = getKingPosition(currentTurn, board);
  const isInCheck = isSquareAttacked(inCheckSquare.r, inCheckSquare.c, currentTurn === 'w' ? 'b' : 'w', board);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement('div');
      const isLight = (r + c) % 2 === 0;
      square.className = `square ${isLight ? 'light' : 'dark'}`;
      square.dataset.r = r;
      square.dataset.c = c;

      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        square.classList.add('selected');
      }
      if (lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c))) {
        square.classList.add('last-move');
      }
      if (isInCheck && inCheckSquare.r === r && inCheckSquare.c === c) {
        square.classList.add('in-check');
      }

      const moveOpt = validMoves.find(m => m.r === r && m.c === c);
      if (moveOpt) {
        if (moveOpt.isCapture) square.classList.add('valid-capture');
        else square.classList.add('valid-empty');
      }

      const piece = board[r][c];
      if (piece) {
        const color = piece[0];
        const type = piece[1];

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 64 64");
        svg.setAttribute("class", `piece-svg ${color}`);

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", themePaths[type] || PIECE_DESIGNS['master-staunton'][type]);
        svg.appendChild(path);
        square.appendChild(svg);
      }

      square.addEventListener('click', () => handleSquareClick(r, c));
      boardElement.appendChild(square);
    }
  }
}

function handleSquareClick(r, c) {
  if (!gameActive || isBotThinking) return;

  if (gameMode !== 'pvp') {
    if (humanSide === 'w' && currentTurn === 'b') return;
    if (humanSide === 'b' && currentTurn === 'w') return;
  }

  const piece = board[r][c];

  if (selectedSquare) {
    if (selectedSquare.r === r && selectedSquare.c === c) {
      selectedSquare = null;
      validMoves = [];
      renderBoard();
      return;
    }

    if (piece && piece[0] === currentTurn) {
      selectedSquare = { r, c };
      validMoves = getLegalMovesForPiece(r, c, board);
      playSound('select');
      renderBoard();
      return;
    }

    const move = validMoves.find(m => m.r === r && m.c === c);
    if (move) {
      const fromSquare = { ...selectedSquare };
      selectedSquare = null;
      validMoves = [];
      executePlayerMove(fromSquare, move);
      return;
    }
  } else {
    if (piece && piece[0] === currentTurn) {
      selectedSquare = { r, c };
      validMoves = getLegalMovesForPiece(r, c, board);
      playSound('select');
      renderBoard();
    }
  }
}

function executePlayerMove(from, toMove) {
  const piece = board[from.r][from.c];
  if (!piece) return;

  const type = piece[1];

  if (type === 'p' && (toMove.r === 0 || toMove.r === 7)) {
    promotionModal.classList.remove('hidden');
    pendingPromotion = (choice) => {
      applyMove(board, from, toMove, choice);
      finalizeTurn(from, toMove, piece);
    };
  } else {
    applyMove(board, from, toMove);
    finalizeTurn(from, toMove, piece);
  }
}

function finalizeTurn(from, toMove, movedPiece) {
  lastMove = { from: { ...from }, to: { r: toMove.r, c: toMove.c } };

  // Audio: loud tactile impact on piece move and capture
  if (toMove.isCapture) {
    playSound('capture');
  } else {
    playSound('move');
  }

  if (movedPiece === 'wk') castlingRights.w.kingMoved = true;
  if (movedPiece === 'bk') castlingRights.b.kingMoved = true;
  if (from.r === 7 && from.c === 7) castlingRights.w.rookKmoved = true;
  if (from.r === 7 && from.c === 0) castlingRights.w.rookQmoved = true;
  if (from.r === 0 && from.c === 7) castlingRights.b.rookKmoved = true;
  if (from.r === 0 && from.c === 0) castlingRights.b.rookQmoved = true;

  if (movedPiece[1] === 'p' || toMove.isCapture) {
    halfMoveClock = 0;
  } else {
    halfMoveClock++;
  }

  logMove(from, toMove, movedPiece);

  currentTurn = (currentTurn === 'w') ? 'b' : 'w';
  updateUI();
  renderBoard();

  if (timeLimit === 0) {
    saveUntimedGame();
  }

  const gameOverResult = evaluateGameState();
  if (gameOverResult) {
    handleGameOver(gameOverResult);
    return;
  }

  // Audio: chime if opponent king is checked
  const kingPos = getKingPosition(currentTurn, board);
  const opponent = (currentTurn === 'w') ? 'b' : 'w';
  if (isSquareAttacked(kingPos.r, kingPos.c, opponent, board)) {
    playSound('check');
  }

  if (gameActive && gameMode !== 'pvp') {
    if ((humanSide === 'w' && currentTurn === 'b') || (humanSide === 'b' && currentTurn === 'w')) {
      isBotThinking = true;
      setTimeout(triggerBotMove, 500);
    }
  }
}

function isSquareAttacked(targetR, targetC, attackerColor, currentBoard) {
  const pawnPusherRow = (attackerColor === 'w') ? targetR + 1 : targetR - 1;
  if (pawnPusherRow >= 0 && pawnPusherRow < 8) {
    for (const dc of [-1, 1]) {
      const pc = targetC + dc;
      if (pc >= 0 && pc < 8 && currentBoard[pawnPusherRow][pc] === `${attackerColor}p`) {
        return true;
      }
    }
  }

  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightOffsets) {
    const nr = targetR + dr;
    const nc = targetC + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (currentBoard[nr][nc] === `${attackerColor}n`) return true;
    }
  }

  const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of straightDirs) {
    let step = 1;
    while (true) {
      const nr = targetR + dr * step;
      const nc = targetC + dc * step;
      if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
      const occ = currentBoard[nr][nc];
      if (occ) {
        if (occ[0] === attackerColor && (occ[1] === 'r' || occ[1] === 'q')) return true;
        break;
      }
      step++;
    }
  }

  const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diagDirs) {
    let step = 1;
    while (true) {
      const nr = targetR + dr * step;
      const nc = targetC + dc * step;
      if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
      const occ = currentBoard[nr][nc];
      if (occ) {
        if (occ[0] === attackerColor && (occ[1] === 'b' || occ[1] === 'q')) return true;
        break;
      }
      step++;
    }
  }

  const kingOffsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  for (const [dr, dc] of kingOffsets) {
    const nr = targetR + dr;
    const nc = targetC + dc;
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (currentBoard[nr][nc] === `${attackerColor}k`) return true;
    }
  }

  return false;
}

function getLegalMovesForPiece(r, c, currentBoard) {
  const pseudoMoves = getPseudoMoves(r, c, currentBoard);
  const legal = [];
  const color = currentBoard[r][c][0];

  pseudoMoves.forEach(move => {
    const tempBoard = currentBoard.map(row => [...row]);
    applySimulatedMove(tempBoard, { r, c }, move);

    const kingPos = getKingPosition(color, tempBoard);
    const opponent = (color === 'w') ? 'b' : 'w';

    if (!isSquareAttacked(kingPos.r, kingPos.c, opponent, tempBoard)) {
      legal.push(move);
    }
  });

  return legal;
}

function getPseudoMoves(r, c, currentBoard) {
  const piece = currentBoard[r][c];
  if (!piece) return [];
  const color = piece[0];
  const type = piece[1];
  const moves = [];

  const forward = (color === 'w') ? -1 : 1;
  const startRow = (color === 'w') ? 6 : 1;

  if (type === 'p') {
    if (isInBounds(r + forward, c) && !currentBoard[r + forward][c]) {
      moves.push({ r: r + forward, c, isCapture: false });
      if (r === startRow && !currentBoard[r + 2 * forward][c]) {
        moves.push({ r: r + 2 * forward, c, isCapture: false, isDoublePawn: true });
      }
    }
    [-1, 1].forEach(dc => {
      const nr = r + forward;
      const nc = c + dc;
      if (isInBounds(nr, nc)) {
        if (currentBoard[nr][nc] && currentBoard[nr][nc][0] !== color) {
          moves.push({ r: nr, c: nc, isCapture: true });
        }
        if (enPassantTarget && enPassantTarget.r === nr && enPassantTarget.c === nc) {
          moves.push({ r: nr, c: nc, isCapture: true, isEnPassant: true });
        }
      }
    });
  }

  if (type === 'n') {
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    offsets.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (isInBounds(nr, nc)) {
        if (!currentBoard[nr][nc]) moves.push({ r: nr, c: nc, isCapture: false });
        else if (currentBoard[nr][nc][0] !== color) moves.push({ r: nr, c: nc, isCapture: true });
      }
    });
  }

  const rays = [];
  if (type === 'b' || type === 'q') rays.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  if (type === 'r' || type === 'q') rays.push([-1, 0], [1, 0], [0, -1], [0, 1]);

  rays.forEach(([dr, dc]) => {
    let step = 1;
    while (true) {
      const nr = r + dr * step;
      const nc = c + dc * step;
      if (!isInBounds(nr, nc)) break;

      if (!currentBoard[nr][nc]) {
        moves.push({ r: nr, c: nc, isCapture: false });
      } else {
        if (currentBoard[nr][nc][0] !== color) {
          moves.push({ r: nr, c: nc, isCapture: true });
        }
        break;
      }
      step++;
    }
  });

  if (type === 'k') {
    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    offsets.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (isInBounds(nr, nc)) {
        if (!currentBoard[nr][nc]) moves.push({ r: nr, c: nc, isCapture: false });
        else if (currentBoard[nr][nc][0] !== color) moves.push({ r: nr, c: nc, isCapture: true });
      }
    });

    const rights = castlingRights[color];
    const opponent = color === 'w' ? 'b' : 'w';
    const kingRow = color === 'w' ? 7 : 0;

    if (!rights.kingMoved && r === kingRow && c === 4 && !isSquareAttacked(kingRow, 4, opponent, currentBoard)) {
      if (!rights.rookKmoved && !currentBoard[kingRow][5] && !currentBoard[kingRow][6] && currentBoard[kingRow][7] === `${color}r`) {
        if (!isSquareAttacked(kingRow, 5, opponent, currentBoard) && !isSquareAttacked(kingRow, 6, opponent, currentBoard)) {
          moves.push({ r: kingRow, c: 6, isCastling: 'k', isCapture: false });
        }
      }
      if (!rights.rookQmoved && !currentBoard[kingRow][3] && !currentBoard[kingRow][2] && !currentBoard[kingRow][1] && currentBoard[kingRow][0] === `${color}r`) {
        if (!isSquareAttacked(kingRow, 3, opponent, currentBoard) && !isSquareAttacked(kingRow, 2, opponent, currentBoard)) {
          moves.push({ r: kingRow, c: 2, isCastling: 'q', isCapture: false });
        }
      }
    }
  }

  return moves;
}

function applyMove(targetBoard, from, toMove, promotionChoice = 'q') {
  const piece = targetBoard[from.r][from.c];
  const color = piece[0];
  const target = targetBoard[toMove.r][toMove.c];

  if (target) {
    capturedPieces[color].push(target);
  }

  if (toMove.isEnPassant) {
    const epRow = from.r;
    const epCol = toMove.c;
    capturedPieces[color].push(targetBoard[epRow][epCol]);
    targetBoard[epRow][epCol] = null;
  }

  targetBoard[toMove.r][toMove.c] = piece;
  targetBoard[from.r][from.c] = null;

  if (piece[1] === 'p' && (toMove.r === 0 || toMove.r === 7)) {
    targetBoard[toMove.r][toMove.c] = `${color}${promotionChoice}`;
  }

  if (toMove.isCastling === 'k') {
    targetBoard[toMove.r][5] = `${color}r`;
    targetBoard[toMove.r][7] = null;
  } else if (toMove.isCastling === 'q') {
    targetBoard[toMove.r][3] = `${color}r`;
    targetBoard[toMove.r][0] = null;
  }

  if (toMove.isDoublePawn) {
    const epForward = color === 'w' ? 1 : -1;
    enPassantTarget = { r: toMove.r + epForward, c: toMove.c };
  } else {
    enPassantTarget = null;
  }
}

function applySimulatedMove(simBoard, from, toMove) {
  const piece = simBoard[from.r][from.c];
  simBoard[toMove.r][toMove.c] = piece;
  simBoard[from.r][from.c] = null;

  if (toMove.isEnPassant) simBoard[from.r][toMove.c] = null;
  if (toMove.isCastling === 'k') {
    simBoard[toMove.r][5] = `${piece[0]}r`;
    simBoard[toMove.r][7] = null;
  } else if (toMove.isCastling === 'q') {
    simBoard[toMove.r][3] = `${piece[0]}r`;
    simBoard[toMove.r][0] = null;
  }
}

function getKingPosition(color, currentBoard) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (currentBoard[r][c] === `${color}k`) return { r, c };
    }
  }
  return { r: 0, c: 4 };
}

function isInBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function hasInsufficientMaterial() {
  const pieces = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]) pieces.push(board[r][c]);
    }
  }
  if (pieces.length === 2) return true;
  if (pieces.length === 3) {
    const minor = pieces.find(p => p[1] === 'b' || p[1] === 'n');
    if (minor) return true;
  }
  return false;
}

function evaluateGameState() {
  let hasLegalMoves = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece[0] === currentTurn) {
        if (getLegalMovesForPiece(r, c, board).length > 0) {
          hasLegalMoves = true;
          break;
        }
      }
    }
    if (hasLegalMoves) break;
  }

  const kingPos = getKingPosition(currentTurn, board);
  const opponent = (currentTurn === 'w') ? 'b' : 'w';
  const inCheck = isSquareAttacked(kingPos.r, kingPos.c, opponent, board);

  if (!hasLegalMoves) {
    if (inCheck) return (currentTurn === 'w') ? 'b' : 'w';
    return 'stalemate';
  }

  if (hasInsufficientMaterial()) return 'insufficient';
  if (halfMoveClock >= 100) return '50move';
  if (recordPositionState() >= 3) return 'repetition';

  if (inCheck) {
    gameStatusPill.className = "status-badge check";
    gameStatusPill.textContent = `${currentTurn === 'w' ? 'White' : 'Black'} in Check!`;
  } else {
    gameStatusPill.className = "status-badge";
    gameStatusPill.textContent = "Active Match";
  }

  return null;
}

function recordPositionState() {
  const hash = `${currentTurn}|${board.map(r => r.map(p => p || '.').join('')).join('')}`;
  positionHistory[hash] = (positionHistory[hash] || 0) + 1;
  return positionHistory[hash];
}

function handleGameOver(result) {
  gameActive = false;
  isBotThinking = false;
  clearInterval(timerInterval);
  localStorage.removeItem('chess_untimed_save');

  let title = "";
  let desc = "";

  if (result === 'stalemate') {
    title = "🤝 Stalemate!";
    desc = "No legal moves available and not in check. Game drawn.";
  } else if (result === 'insufficient') {
    title = "🤝 Insufficient Material";
    desc = "Neither side has enough pieces to force checkmate.";
  } else if (result === 'repetition') {
    title = "🤝 Draw by Repetition!";
    desc = "The exact same board position occurred 3 times.";
  } else if (result === '50move') {
    title = "🤝 50-Move Draw!";
    desc = "50 consecutive moves completed with no pawn move or capture.";
  } else if (result === 'timeout-w') {
    title = "⏱️ Time Forfeit!";
    desc = `${playerNames.b} wins on time!`;
  } else if (result === 'timeout-b') {
    title = "⏱️ Time Forfeit!";
    desc = `${playerNames.w} wins on time!`;
  } else if (result === 'resign-w') {
    title = `🏳️ ${playerNames.w} Resigned`;
    desc = `${playerNames.b} wins the match.`;
  } else if (result === 'resign-b') {
    title = `🏳️ ${playerNames.b} Resigned`;
    desc = `${playerNames.w} wins the match.`;
  } else if (result === 'draw-agreed') {
    title = "🤝 Mutual Draw";
    desc = "Both players agreed to a draw.";
  } else {
    const winnerName = (result === 'w') ? playerNames.w : playerNames.b;
    playSound('win');
    if (gameMode !== 'pvp') {
      if (result === humanSide) {
        title = `🏆 ${winnerName} Wins!`;
        desc = "Flawless checkmate against the computer!";
        triggerConfetti();
      } else {
        title = `🤖 ${winnerName} Wins!`;
        desc = "The computer achieved checkmate. Try another match!";
      }
    } else {
      title = `👑 ${winnerName} Wins!`;
      desc = `Well played! Checkmate achieved by ${winnerName}.`;
      triggerConfetti();
    }
  }

  winnerTitle.textContent = title;
  winnerDesc.textContent = desc;
  gameOverModal.classList.remove('hidden');
}

function triggerBotMove() {
  if (!gameActive) return;

  const depthMap = {
    'pve-easy': 1,
    'pve-medium': 2,
    'pve-hard': 3,
    'pve-expert': 4
  };
  const searchDepth = depthMap[gameMode] || 2;
  const botColor = currentTurn;

  const bestMove = getBestMoveMinimax(searchDepth, botColor);

  if (bestMove) {
    const piece = board[bestMove.from.r][bestMove.from.c];
    applyMove(board, bestMove.from, bestMove.to, 'q');
    isBotThinking = false;
    finalizeTurn(bestMove.from, bestMove.to, piece);
  }
}

function getBestMoveMinimax(depth, botColor) {
  const legalMoves = getAllTeamLegalMoves(botColor, board);
  if (legalMoves.length === 0) return null;

  if (gameMode === 'pve-easy' && Math.random() < 0.45) {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  let bestMove = null;
  let bestScore = -Infinity;
  const alpha = -Infinity;
  const beta = Infinity;

  legalMoves.sort((a, b) => (b.to.isCapture ? 1 : 0) - (a.to.isCapture ? 1 : 0));

  for (const move of legalMoves) {
    const simBoard = board.map(r => [...r]);
    applySimulatedMove(simBoard, move.from, move.to);

    const score = -minimax(simBoard, depth - 1, -beta, -alpha, botColor === 'w' ? 'b' : 'w', botColor);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove || legalMoves[0];
}

function minimax(simBoard, depth, alpha, beta, currentMover, botColor) {
  if (depth === 0) {
    return evaluateBoardPosition(simBoard, botColor);
  }

  const moves = getAllTeamLegalMoves(currentMover, simBoard);
  if (moves.length === 0) {
    const kingPos = getKingPosition(currentMover, simBoard);
    const inCheck = isSquareAttacked(kingPos.r, kingPos.c, currentMover === 'w' ? 'b' : 'w', simBoard);
    if (inCheck) return -99999 + (4 - depth);
    return 0;
  }

  moves.sort((a, b) => (b.to.isCapture ? 1 : 0) - (a.to.isCapture ? 1 : 0));

  let maxEval = -Infinity;
  for (const move of moves) {
    const nextBoard = simBoard.map(r => [...r]);
    applySimulatedMove(nextBoard, move.from, move.to);

    const evaluation = -minimax(nextBoard, depth - 1, -beta, -alpha, currentMover === 'w' ? 'b' : 'w', botColor);
    maxEval = Math.max(maxEval, evaluation);
    alpha = Math.max(alpha, evaluation);
    if (beta <= alpha) break;
  }

  return maxEval;
}

function evaluateBoardPosition(currentBoard, botColor) {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = currentBoard[r][c];
      if (!piece) continue;

      const color = piece[0];
      const type = piece[1];
      const val = PIECE_VALUES[type] + (color === 'w' ? PST[type][r][c] : PST[type][7 - r][c]);

      if (color === botColor) score += val;
      else score -= val;
    }
  }

  return score;
}

function getAllTeamLegalMoves(color, currentBoard) {
  const allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = currentBoard[r][c];
      if (piece && piece[0] === color) {
        const moves = getLegalMovesForPiece(r, c, currentBoard);
        moves.forEach(m => allMoves.push({ from: { r, c }, to: m }));
      }
    }
  }
  return allMoves;
}

function handleResign() {
  if (!gameActive) return;
  const currentName = currentTurn === 'w' ? playerNames.w : playerNames.b;
  const confirmResign = confirm(`${currentName}, are you sure you want to resign?`);
  if (confirmResign) {
    handleGameOver(`resign-${currentTurn}`);
  }
}

function handleOfferDraw() {
  if (!gameActive) return;
  if (gameMode !== 'pvp') {
    alert("The Computer declined your draw offer.");
  } else {
    const proposingName = currentTurn === 'w' ? playerNames.w : playerNames.b;
    const accepted = confirm(`${proposingName} offers a draw. Do you accept?`);
    if (accepted) handleGameOver('draw-agreed');
  }
}

function handleClockTick() {
  if (!gameActive || timeLimit === 0) return;

  clocks[currentTurn]--;
  updateClockDisplay();

  if (clocks[currentTurn] <= 0) {
    handleGameOver(`timeout-${currentTurn}`);
  }
}

function updateClockDisplay() {
  if (timeLimit === 0) return;
  if (whiteClock) whiteClock.textContent = formatTime(clocks.w);
  if (blackClock) blackClock.textContent = formatTime(clocks.b);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateUI() {
  if (turnDot) turnDot.className = `turn-dot ${currentTurn === 'w' ? 'white' : 'black'}`;
  const currentActiveName = currentTurn === 'w' ? playerNames.w : playerNames.b;
  if (turnText) turnText.textContent = `${currentActiveName}'s Turn`;

  if (cardWhite && cardBlack) {
    if (currentTurn === 'w') {
      cardWhite.classList.add('active');
      cardBlack.classList.remove('active');
    } else {
      cardBlack.classList.add('active');
      cardWhite.classList.remove('active');
    }
  }

  const charSymbols = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };
  if (capturedByWhite) {
    capturedByWhite.innerHTML = capturedPieces.w.map(p => `<span>${charSymbols[p[1]] || p[1]}</span>`).join('');
  }
  if (capturedByBlack) {
    capturedByBlack.innerHTML = capturedPieces.b.map(p => `<span>${charSymbols[p[1]] || p[1]}</span>`).join('');
  }
}

function logMove(from, toMove, piece) {
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const pieceChar = (piece && piece[1].toUpperCase() !== 'P') ? piece[1].toUpperCase() : '';
  const captureSign = toMove.isCapture ? 'x' : '-';
  const moveStr = `${pieceChar}${cols[from.c]}${8 - from.r}${captureSign}${cols[toMove.c]}${8 - toMove.r}`;

  if (moveHistory) {
    if (moveHistory.querySelector('.empty-history')) {
      moveHistory.innerHTML = '';
    }
    const span = document.createElement('span');
    span.className = 'history-item';
    span.textContent = moveStr;
    moveHistory.prepend(span);
  }
}

function triggerConfetti() {
  if (!confettiContainer) return;
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#f8fafc'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    el.classList.add('confetti-piece');
    el.style.left = Math.random() * 100 + 'vw';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (Math.random() * 2.5 + 2) + 's';
    el.style.animationDelay = (Math.random() * 0.8) + 's';
    confettiContainer.appendChild(el);
  }
}

document.addEventListener('DOMContentLoaded', init);