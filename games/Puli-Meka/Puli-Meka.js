/* ==========================================================================
   PULI MEKA (TIGERS & GOATS) - AUTHENTIC 23-POINT BHARATIYA KHEL ENGINE
   ========================================================================== */

// 23 nodes configured to the traditional Telugu cloth board topology
const NODES = [
  // 0: Apex (Top center)
  { id: 0, x: 250, y: 70 },

  // Level 1: Y = 195 (6 nodes: 2 left wing, 2 central inner, 2 right wing)
  { id: 1, x: 75,  y: 195 },
  { id: 2, x: 165, y: 195 },
  { id: 3, x: 220, y: 195 }, // Inner point closest to apex
  { id: 4, x: 280, y: 195 }, // Inner point closest to apex
  { id: 5, x: 335, y: 195 },
  { id: 6, x: 425, y: 195 },

  // Level 2: Y = 275 (6 nodes)
  { id: 7,  x: 75,  y: 275 },
  { id: 8,  x: 140, y: 275 },
  { id: 9,  x: 210, y: 275 },
  { id: 10, x: 290, y: 275 },
  { id: 11, x: 360, y: 275 },
  { id: 12, x: 425, y: 275 },

  // Level 3: Y = 355 (6 nodes)
  { id: 13, x: 75,  y: 355 },
  { id: 14, x: 120, y: 355 },
  { id: 15, x: 200, y: 355 },
  { id: 16, x: 300, y: 355 },
  { id: 17, x: 380, y: 355 },
  { id: 18, x: 425, y: 355 },

  // Level 4: Base endpoints of 4 radiating lines (Y = 445)
  { id: 19, x: 80,  y: 445 },
  { id: 20, x: 190, y: 445 },
  { id: 21, x: 310, y: 445 },
  { id: 22, x: 420, y: 445 }
];

// Legitimate connections (lines on the board)
const EDGES = [
  // 4 Main Rays from Apex
  [0, 2], [2, 8],  [8, 14],  [14, 19], // Outer Left Slant
  [0, 3], [3, 9],  [9, 15],  [15, 20], // Central Left Slant
  [0, 4], [4, 10], [10, 16], [16, 21], // Central Right Slant
  [0, 5], [5, 11], [11, 17], [17, 22], // Outer Right Slant

  // Level 1 Horizontal Crossbar
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],

  // Level 2 Horizontal Crossbar
  [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],

  // Level 3 Horizontal Crossbar
  [13, 14], [14, 15], [15, 16], [16, 17], [17, 18],

  // Left Outer Rail Verticals
  [1, 7], [7, 13],

  // Right Outer Rail Verticals
  [6, 12], [12, 18]
];

// Straight lines for Tiger Jumps: [start, hopped_goat, empty_landing]
const JUMP_PATHS = [
  // Ray 1 jumps
  [0, 2, 8], [2, 8, 14], [8, 14, 19],
  [19, 14, 8], [14, 8, 2], [8, 2, 0],

  // Ray 2 jumps
  [0, 3, 9], [3, 9, 15], [9, 15, 20],
  [20, 15, 9], [15, 9, 3], [9, 3, 0],

  // Ray 3 jumps
  [0, 4, 10], [4, 10, 16], [10, 16, 21],
  [21, 16, 10], [16, 10, 4], [10, 4, 0],

  // Ray 4 jumps
  [0, 5, 11], [5, 11, 17], [11, 17, 22],
  [22, 17, 11], [17, 11, 5], [11, 5, 0],

  // Horizontal jumps Level 1
  [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6],
  [6, 5, 4], [5, 4, 3], [4, 3, 2], [3, 2, 1],

  // Horizontal jumps Level 2
  [7, 8, 9], [8, 9, 10], [9, 10, 11], [10, 11, 12],
  [12, 11, 10], [11, 10, 9], [10, 9, 8], [9, 8, 7],

  // Horizontal jumps Level 3
  [13, 14, 15], [14, 15, 16], [15, 16, 17], [16, 17, 18],
  [18, 17, 16], [17, 16, 15], [16, 15, 14], [15, 14, 13],

  // Outer Rail Vertical jumps
  [1, 7, 13], [13, 7, 1],
  [6, 12, 18], [18, 12, 6]
];

// Adjacency graph
const ADJACENCY = Array.from({ length: 23 }, () => []);
EDGES.forEach(([u, v]) => {
  if (!ADJACENCY[u].includes(v)) ADJACENCY[u].push(v);
  if (!ADJACENCY[v].includes(u)) ADJACENCY[v].push(u);
});

// Game state variables
let boardState = Array(23).fill(null); // null, 'T', 'G'
let turn = 'G'; // Goats always play first
let goatsInHand = 15;
let goatsKilled = 0;
let selectedNode = null;
let gameActive = false;
let gameMode = 'pvp';
let soundEnabled = true;
let isBotThinking = false;

// 3-Fold Repetition tracker
let positionHistory = {};

// DOM Elements
const svgLines = document.getElementById('board-lines');
const svgNodes = document.getElementById('board-nodes');
const svgPieces = document.getElementById('board-pieces');
const turnText = document.getElementById('turn-text');
const turnIcon = document.getElementById('turn-icon');
const phaseText = document.getElementById('phase-text');
const tigerKills = document.getElementById('tiger-kills');
const goatsHand = document.getElementById('goats-hand');
const goatsBoard = document.getElementById('goats-board');
const cardTigers = document.getElementById('card-tigers');
const cardGoats = document.getElementById('card-goats');
const modeDisplay = document.getElementById('mode-display');

// Modals
const setupModal = document.getElementById('setup-modal');
const rulesModal = document.getElementById('rules-modal');
const gameOverModal = document.getElementById('game-over-modal');
const winnerTitle = document.getElementById('winner-title');
const winnerDesc = document.getElementById('winner-desc');
const modeSelect = document.getElementById('mode-select');
const startGameBtn = document.getElementById('start-game-btn');
const rulesBtn = document.getElementById('rules-btn');
const closeRulesBtn = document.getElementById('close-rules-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const soundBtn = document.getElementById('sound-btn');
const confettiContainer = document.getElementById('confetti-container');

function init() {
  drawStaticBoard();
  bindEvents();
}

function drawStaticBoard() {
  svgLines.innerHTML = '';
  svgNodes.innerHTML = '';

  // Render straight board lines
  EDGES.forEach(([u, v]) => {
    const p1 = NODES[u];
    const p2 = NODES[v];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
    line.setAttribute('class', 'board-line');
    svgLines.appendChild(line);
  });

  // Render small point markers
  NODES.forEach(n => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    circle.setAttribute('r', 6);
    circle.setAttribute('class', 'board-node-circle');
    circle.dataset.id = n.id;
    circle.addEventListener('click', () => handleNodeClick(n.id));
    svgNodes.appendChild(circle);
  });
}

function bindEvents() {
  rulesBtn.addEventListener('click', () => rulesModal.classList.remove('hidden'));
  closeRulesBtn.addEventListener('click', () => rulesModal.classList.add('hidden'));

  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.innerHTML = soundEnabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
  });

  restartBtn.addEventListener('click', () => setupModal.classList.remove('hidden'));

  startGameBtn.addEventListener('click', () => {
    gameMode = modeSelect.value;
    modeDisplay.textContent = `Mode: ${modeSelect.options[modeSelect.selectedIndex].text}`;
    setupModal.classList.add('hidden');
    startNewGame();
  });

  playAgainBtn.addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    setupModal.classList.remove('hidden');
  });
}

function startNewGame() {
  boardState = Array(23).fill(null);

  // AUTHENTIC START: 1 Tiger at Apex (0), 2 Tigers at the two central inner points (3 and 4)
  boardState[0] = 'T';
  boardState[3] = 'T';
  boardState[4] = 'T';

  turn = 'G'; // Goat player always plays first
  goatsInHand = 15;
  goatsKilled = 0;
  selectedNode = null;
  gameActive = true;
  isBotThinking = false;
  positionHistory = {};
  confettiContainer.innerHTML = '';

  recordPosition();
  updateUI();
  renderBoardState();

  // If Bot is playing as Goats
  if (gameMode === 'pve-tiger' && turn === 'G') {
    isBotThinking = true;
    setTimeout(botPlay, 600);
  }
}

function handleNodeClick(nodeId) {
  if (!gameActive || isBotThinking) return;

  // Turn check against human player
  if (gameMode === 'pve-goat' && turn === 'T') return;
  if (gameMode === 'pve-tiger' && turn === 'G') return;

  const occupant = boardState[nodeId];

  // PHASE 1: GOAT PLACEMENT (No moving allowed for goats yet)
  if (turn === 'G' && goatsInHand > 0) {
    if (occupant === null) {
      boardState[nodeId] = 'G';
      goatsInHand--;
      endTurn();
    }
    return;
  }

  // MOVEMENT & SELECTION PHASE
  if (selectedNode === null) {
    // Select own piece
    if (occupant === turn) {
      selectedNode = nodeId;
      highlightValidMoves(nodeId);
      renderBoardState();
    }
  } else {
    // Deselect if clicking the same piece
    if (nodeId === selectedNode) {
      selectedNode = null;
      clearHighlights();
      renderBoardState();
      return;
    }

    // Switch selection to another friendly piece
    if (occupant === turn) {
      selectedNode = nodeId;
      highlightValidMoves(nodeId);
      renderBoardState();
      return;
    }

    // Destination clicked
    if (occupant === null) {
      const validMoves = getValidMoves(selectedNode, turn);
      const chosen = validMoves.find(m => m.to === nodeId);

      if (chosen) {
        executeMove(chosen);
        selectedNode = null;
        clearHighlights();
        endTurn();
      }
    }
  }
}

function executeMove(move) {
  boardState[move.to] = turn;
  boardState[move.from] = null;

  // Tiger capture: strictly 1 goat removed per jump, no bonus turns
  if (move.captured !== undefined) {
    boardState[move.captured] = null;
    goatsKilled++;
  }
}

function endTurn() {
  updateUI();
  renderBoardState();

  // 1. Check Win conditions
  const winner = checkGameOver();
  if (winner) {
    handleGameOver(winner);
    return;
  }

  // 2. Check 3-Fold Repetition Draw
  if (recordPosition() >= 3) {
    handleGameOver('D');
    return;
  }

  // Switch turns
  turn = (turn === 'G') ? 'T' : 'G';
  updateUI();

  // Bot response loop
  if (gameActive) {
    if ((gameMode === 'pve-goat' && turn === 'T') || (gameMode === 'pve-tiger' && turn === 'G')) {
      isBotThinking = true;
      setTimeout(botPlay, 600);
    }
  }
}

function getValidMoves(nodeId, player) {
  const moves = [];

  // 1. Single-step move along connected lines
  ADJACENCY[nodeId].forEach(adj => {
    if (boardState[adj] === null) {
      moves.push({ from: nodeId, to: adj });
    }
  });

  // 2. Tiger capture leaps (only available to Tigers)
  if (player === 'T') {
    JUMP_PATHS.forEach(([from, over, to]) => {
      if (from === nodeId && boardState[over] === 'G' && boardState[to] === null) {
        moves.push({ from, to, captured: over });
      }
    });
  }

  return moves;
}

function highlightValidMoves(nodeId) {
  clearHighlights();
  const valid = getValidMoves(nodeId, turn);
  valid.forEach(m => {
    const circle = svgNodes.querySelector(`circle[data-id="${m.to}"]`);
    if (circle) circle.classList.add('valid-move');
  });
}

function clearHighlights() {
  svgNodes.querySelectorAll('.valid-move').forEach(el => el.classList.remove('valid-move'));
}

/* ==========================================================================
   WIN / DRAW CONDITIONS
   ========================================================================== */

function checkGameOver() {
  // Tiger Win: Captured 5 Goats
  if (goatsKilled >= 5) return 'T';

  // Goat Win: All 3 Tigers are trapped (0 legal moves)
  const tigerPositions = [];
  boardState.forEach((val, idx) => {
    if (val === 'T') tigerPositions.push(idx);
  });

  let totalTigerMoves = 0;
  tigerPositions.forEach(p => totalTigerMoves += getValidMoves(p, 'T').length);
  if (totalTigerMoves === 0) return 'G';

  return null;
}

function recordPosition() {
  // Hash the boardState, current turn, and goats remaining in hand
  const key = `${turn}|${goatsInHand}|${boardState.map(c => c || '_').join('')}`;
  positionHistory[key] = (positionHistory[key] || 0) + 1;
  return positionHistory[key];
}

function handleGameOver(winner) {
  gameActive = false;
  isBotThinking = false;

  let title = "";
  let desc = "";

  if (winner === 'D') {
    title = "🤝 Draw by Repetition!";
    desc = "The exact same board position occurred 3 times. The game ends in a strategic draw.";
  } else if (gameMode === 'pve-goat') {
    if (winner === 'T') {
      title = "🤖 Bot (Tigers) Wins!";
      desc = "The Tiger Bot captured 5 goats and broke free. Better luck next time!";
    } else {
      title = "🎉 You (Goats) Won!";
      desc = "Brilliant tactics! You successfully immobilized all 3 tigers!";
      triggerConfetti();
    }
  } else if (gameMode === 'pve-tiger') {
    if (winner === 'T') {
      title = "🎉 You (Tigers) Won!";
      desc = "You hunted down 5 goats and overwhelmed the herd!";
      triggerConfetti();
    } else {
      title = "🤖 Bot (Goats) Wins!";
      desc = "The Goat Bot managed to encircle and trap all your tigers!";
    }
  } else {
    if (winner === 'T') {
      title = "🔴 Player 1 (Tigers) Wins!";
      desc = "5 Goats were captured. The tigers broke free!";
      triggerConfetti();
    } else {
      title = "🟡 Player 2 (Goats) Wins!";
      desc = "The goat herd skillfully trapped all 3 tigers!";
      triggerConfetti();
    }
  }

  winnerTitle.textContent = title;
  winnerDesc.textContent = desc;
  gameOverModal.classList.remove('hidden');
}

/* ==========================================================================
   AI / BOT ENGINE
   ========================================================================== */

function botPlay() {
  if (!gameActive) return;

  if (turn === 'T') {
    // TIGER AI
    const tigers = [];
    boardState.forEach((val, idx) => { if (val === 'T') tigers.push(idx); });

    let moves = [];
    tigers.forEach(p => moves = moves.concat(getValidMoves(p, 'T')));
    if (moves.length === 0) return;

    // Strict priority: Leap captures > Strategic movement
    const captures = moves.filter(m => m.captured !== undefined);
    const chosen = captures.length > 0
      ? captures[Math.floor(Math.random() * captures.length)]
      : moves[Math.floor(Math.random() * moves.length)];

    executeMove(chosen);
    isBotThinking = false;
    endTurn();

  } else if (turn === 'G') {
    // GOAT AI
    if (goatsInHand > 0) {
      // Phase 1: Strategic Placement
      const empty = [];
      boardState.forEach((val, idx) => { if (val === null) empty.push(idx); });

      // Identify and avoid points that allow immediate tiger jump captures
      const safe = empty.filter(n => {
        return !JUMP_PATHS.some(([from, over, to]) => boardState[from] === 'T' && over === n && boardState[to] === null);
      });

      const target = safe.length > 0
        ? safe[Math.floor(Math.random() * safe.length)]
        : empty[Math.floor(Math.random() * empty.length)];

      boardState[target] = 'G';
      goatsInHand--;
      isBotThinking = false;
      endTurn();
    } else {
      // Phase 2: Movement Phase
      const goats = [];
      boardState.forEach((val, idx) => { if (val === 'G') goats.push(idx); });

      let moves = [];
      goats.forEach(p => moves = moves.concat(getValidMoves(p, 'G')));
      if (moves.length === 0) return;

      const chosen = moves[Math.floor(Math.random() * moves.length)];
      executeMove(chosen);
      isBotThinking = false;
      endTurn();
    }
  }
}

/* ==========================================================================
   RENDER & UI
   ========================================================================== */

function renderBoardState() {
  svgPieces.innerHTML = '';

  boardState.forEach((piece, id) => {
    if (!piece) return;

    const node = NODES[id];
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `piece-group ${id === selectedNode ? 'selected' : ''}`);
    group.dataset.id = id;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', 16);
    circle.setAttribute('class', piece === 'T' ? 'tiger-bead' : 'goat-bead');

    group.appendChild(circle);
    group.addEventListener('click', (e) => {
      e.stopPropagation();
      handleNodeClick(id);
    });

    svgPieces.appendChild(group);
  });
}

function updateUI() {
  const goatsOnBoard = boardState.filter(p => p === 'G').length;
  goatsHand.textContent = goatsInHand;
  goatsBoard.textContent = goatsOnBoard;
  tigerKills.textContent = goatsKilled;

  phaseText.textContent = (goatsInHand > 0) ? "Phase 1: Placing Goats" : "Phase 2: Moving Goats";

  if (turn === 'T') {
    turnIcon.textContent = '🔴';
    turnText.textContent = (gameMode.startsWith('pve') && gameMode === 'pve-goat') ? "Bot (Tigers) Thinking..." : "Tigers' Turn";
    cardTigers.classList.add('active');
    cardGoats.classList.remove('active');
  } else {
    turnIcon.textContent = '🟡';
    turnText.textContent = (gameMode.startsWith('pve') && gameMode === 'pve-tiger') ? "Bot (Goats) Thinking..." : "Goats' Turn";
    cardGoats.classList.add('active');
    cardTigers.classList.remove('active');
  }
}

function triggerConfetti() {
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'];
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