const ROWS = 6;
const COLS = 7;
const PLAYER1 = 1;
const PLAYER2 = 2;

let board = [];
let currentPlayer = PLAYER1;
let gameActive = false;
let isBotThinking = false;
let movesMade = 0;

// Configurations
let p1Config = { name: 'Player 1', color: 'red' };
let p2Config = { name: 'Bot', color: 'yellow' };
let gameMode = 'pve-medium';
let scores = { player1: 0, player2: 0, draws: 0 };

// DOM References
const boardElement = document.getElementById('board');
const previewBar = document.getElementById('drop-preview-bar');
const turnIndicator = document.getElementById('turn-indicator');
const turnText = document.getElementById('turn-text');
const turnDisc = document.getElementById('turn-disc');

const scoreP1 = document.getElementById('score-p1');
const scoreP2 = document.getElementById('score-p2');
const scoreDraws = document.getElementById('score-draws');
const cardP1 = document.getElementById('card-p1');
const cardP2 = document.getElementById('card-p2');
const nameDisplayP1 = document.getElementById('display-p1-name');
const nameDisplayP2 = document.getElementById('display-p2-name');
const scoreDiscP1 = document.getElementById('score-disc-p1');
const scoreDiscP2 = document.getElementById('score-disc-p2');
const modeDisplay = document.getElementById('current-mode-display');

// Modal & Buttons
const setupModal = document.getElementById('setup-modal');
const rulesModal = document.getElementById('rules-modal');
const rulesBtn = document.getElementById('rules-btn');
const closeRulesBtn = document.getElementById('close-rules-btn');

const modeSelect = document.getElementById('mode-select');
const p1NameInput = document.getElementById('p1-name-input');
const p2NameInput = document.getElementById('p2-name-input');
const p2NameGroup = document.getElementById('p2-name-group');
const p2ColorLabel = document.getElementById('p2-color-label');
const p1ColorRadios = document.querySelectorAll('input[name="p1-color"]');
const p2ColorRadios = document.querySelectorAll('input[name="p2-color"]');
const startGameBtn = document.getElementById('start-game-btn');
const restartBtn = document.getElementById('restart-btn');

const statusModal = document.getElementById('status-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPlayAgain = document.getElementById('modal-play-again');
const confettiContainer = document.getElementById('confetti-container');

// ---- SETUP LOGIC ----

modeSelect.addEventListener('change', (e) => {
  const isPvP = e.target.value === 'pvp';
  p2NameGroup.style.display = isPvP ? 'block' : 'none';
  p2ColorLabel.textContent = isPvP ? 'Player 2 Color:' : 'Bot Color:';
});

function enforceDifferentColors(changedGroup, otherGroup) {
  let selected = Array.from(changedGroup).find(r => r.checked).value;
  let otherSelected = Array.from(otherGroup).find(r => r.checked);
  
  if (otherSelected.value === selected) {
    let fallback = Array.from(otherGroup).find(r => r.value !== selected);
    fallback.checked = true;
  }
}
p1ColorRadios.forEach(r => r.addEventListener('change', () => enforceDifferentColors(p1ColorRadios, p2ColorRadios)));
p2ColorRadios.forEach(r => r.addEventListener('change', () => enforceDifferentColors(p2ColorRadios, p1ColorRadios)));

// Rules Modal Handlers
rulesBtn.addEventListener('click', () => {
  rulesModal.classList.remove('hidden');
});
closeRulesBtn.addEventListener('click', () => {
  rulesModal.classList.add('hidden');
});

// Start Game
startGameBtn.addEventListener('click', () => {
  gameMode = modeSelect.value;
  p1Config.name = p1NameInput.value.trim() || 'Player 1';
  p2Config.name = (gameMode === 'pvp') ? (p2NameInput.value.trim() || 'Player 2') : 'Bot';
  
  p1Config.color = Array.from(p1ColorRadios).find(r => r.checked).value;
  p2Config.color = Array.from(p2ColorRadios).find(r => r.checked).value;

  nameDisplayP1.textContent = p1Config.name;
  nameDisplayP2.textContent = p2Config.name;
  scoreDiscP1.className = `score-disc ${p1Config.color}`;
  scoreDiscP2.className = `score-disc ${p2Config.color}`;
  modeDisplay.textContent = `Mode: ${modeSelect.options[modeSelect.selectedIndex].text}`;

  scores = { player1: 0, player2: 0, draws: 0 };
  scoreP1.textContent = '0';
  scoreP2.textContent = '0';
  scoreDraws.textContent = '0';

  setupModal.classList.add('hidden');
  initGame();
});


// ---- GAME ENGINE ----

function initGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPlayer = PLAYER1;
  gameActive = true;
  isBotThinking = false;
  movesMade = 0;
  
  cardP1.classList.remove('winner-highlight');
  cardP2.classList.remove('winner-highlight');
  confettiContainer.innerHTML = '';

  renderPreviewSlots();
  renderGrid();
  updateTurnDisplay();
}

function renderPreviewSlots() {
  previewBar.innerHTML = '';
  for (let c = 0; c < COLS; c++) {
    const slot = document.createElement('div');
    slot.classList.add('preview-slot');
    slot.dataset.col = c;
    
    const disc = document.createElement('div');
    disc.classList.add('preview-disc');
    slot.appendChild(disc);

    slot.addEventListener('mouseenter', () => showPreview(c));
    slot.addEventListener('mouseleave', () => hidePreview(c));
    slot.addEventListener('click', () => handleColumnClick(c));
    previewBar.appendChild(slot);
  }
}

function renderGrid() {
  boardElement.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;

      cell.addEventListener('mouseenter', () => showPreview(c));
      cell.addEventListener('mouseleave', () => hidePreview(c));
      cell.addEventListener('click', () => handleColumnClick(c));

      boardElement.appendChild(cell);
    }
  }
}

function showPreview(col) {
  if (!gameActive || isBotThinking) return;
  const previewDiscs = previewBar.querySelectorAll('.preview-disc');
  const activeColor = currentPlayer === PLAYER1 ? p1Config.color : p2Config.color;
  
  if (previewDiscs[col]) {
    previewDiscs[col].className = `preview-disc visible ${activeColor}`;
  }
}

function hidePreview(col) {
  const previewDiscs = previewBar.querySelectorAll('.preview-disc');
  if (previewDiscs[col]) {
    previewDiscs[col].className = 'preview-disc';
  }
}

function handleColumnClick(col) {
  if (!gameActive || isBotThinking) return;

  const row = getAvailableRow(col);
  if (row === -1) return; 

  dropDisc(row, col, currentPlayer);
  movesMade++;

  const winningCells = checkWin(board, currentPlayer);
  if (winningCells) {
    handleGameOver(currentPlayer, winningCells);
    return;
  }

  if (checkDraw()) {
    handleGameOver(0);
    return;
  }

  currentPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
  updateTurnDisplay();

  if (gameMode.startsWith('pve') && currentPlayer === PLAYER2 && gameActive) {
    isBotThinking = true;
    setTimeout(triggerBotMove, 600);
  }
}

function getAvailableRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function dropDisc(row, col, player) {
  board[row][col] = player;
  const activeColor = player === PLAYER1 ? p1Config.color : p2Config.color;
  
  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  const disc = document.createElement('div');
  disc.classList.add('disc', activeColor, 'drop-anim');
  
  const distance = (row + 1) * 70;
  disc.style.setProperty('--drop-offset', `-${distance}px`);
  disc.style.setProperty('--drop-duration', `${0.18 + (row + 1) * 0.05}s`);
  
  cell.appendChild(disc);
}

function updateTurnDisplay() {
  const isP1 = currentPlayer === PLAYER1;
  const activeColor = isP1 ? p1Config.color : p2Config.color;
  const activeName = isP1 ? p1Config.name : p2Config.name;

  turnDisc.className = `disc-indicator ${activeColor}`;
  
  if (isP1) {
    turnText.textContent = `${activeName}'s Turn`;
    cardP1.classList.add('active');
    cardP2.classList.remove('active');
  } else {
    turnText.textContent = gameMode.startsWith('pve') ? 'Bot Thinking...' : `${activeName}'s Turn`;
    cardP2.classList.add('active');
    cardP1.classList.remove('active');
  }
}

// Logic Rules
function checkWin(grid, player) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (grid[r][c] === player && grid[r][c+1] === player && grid[r][c+2] === player && grid[r][c+3] === player)
        return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      if (grid[r][c] === player && grid[r+1][c] === player && grid[r+2][c] === player && grid[r+3][c] === player)
        return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
    }
  }
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (grid[r][c] === player && grid[r-1][c+1] === player && grid[r-2][c+2] === player && grid[r-3][c+3] === player)
        return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
    }
  }
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (grid[r][c] === player && grid[r+1][c+1] === player && grid[r+2][c+2] === player && grid[r+3][c+3] === player)
        return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
    }
  }
  return null;
}

function checkDraw() { return board[0].every(cell => cell !== 0); }

function handleGameOver(winner, winningCells = null) {
  gameActive = false;
  isBotThinking = false;

  if (winningCells) {
    winningCells.forEach(([r, c]) => {
      const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      if (cell) cell.classList.add('win');
    });
  }

  setTimeout(() => {
    if (winner === PLAYER1) {
      scores.player1++;
      scoreP1.textContent = scores.player1;
      cardP1.classList.add('winner-highlight');
      modalTitle.textContent = `${p1Config.name} Wins! 🎉`;
      modalDesc.textContent = 'Fantastic strategy!';
      triggerConfetti();
    } else if (winner === PLAYER2) {
      scores.player2++;
      scoreP2.textContent = scores.player2;
      cardP2.classList.add('winner-highlight');
      modalTitle.textContent = `${p2Config.name} Wins! 👏`;
      modalDesc.textContent = 'Better luck next time!';
      if (gameMode === 'pvp') triggerConfetti();
    } else {
      scores.draws++;
      scoreDraws.textContent = scores.draws;
      modalTitle.textContent = "It's a Draw!";
      modalDesc.textContent = 'The board is completely full.';
    }
    statusModal.classList.remove('hidden');
  }, 600);
}

// Celebration Effects
function triggerConfetti() {
  const colors = ['#ff334b', '#ffb800', '#10b981', '#8b5cf6', '#0ea5e9'];
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti-piece');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    confetti.style.animationDelay = (Math.random() * 1) + 's';
    confettiContainer.appendChild(confetti);
  }
}

// Bot Engine
function triggerBotMove() {
  let targetCol = -1;
  if (gameMode === 'pve-easy') targetCol = getRandomValidCol();
  else if (gameMode === 'pve-medium') {
    targetCol = findWinningMove(PLAYER2);
    if (targetCol === -1) targetCol = findWinningMove(PLAYER1);
    if (targetCol === -1) targetCol = getStrategicCol();
  } else {
    targetCol = findWinningMove(PLAYER2);
    if (targetCol === -1) targetCol = findWinningMove(PLAYER1);
    if (targetCol === -1) targetCol = getBestColMinimax();
  }
  isBotThinking = false;
  if (targetCol !== -1) handleColumnClick(targetCol);
}

function getRandomValidCol() {
  const validCols = [];
  for (let c = 0; c < COLS; c++) { if (board[0][c] === 0) validCols.push(c); }
  return validCols[Math.floor(Math.random() * validCols.length)];
}

function findWinningMove(player) {
  for (let c = 0; c < COLS; c++) {
    const r = getAvailableRow(c);
    if (r !== -1) {
      board[r][c] = player;
      const isWin = checkWin(board, player);
      board[r][c] = 0;
      if (isWin) return c;
    }
  }
  return -1;
}

function getStrategicCol() {
  const preference = [3, 2, 4, 1, 5, 0, 6];
  for (let c of preference) { if (board[0][c] === 0) return c; }
  return getRandomValidCol();
}

function getBestColMinimax() {
  const validCols = [];
  for (let c of [3, 2, 4, 1, 5, 0, 6]) {
    if (board[0][c] === 0) {
      const r = getAvailableRow(c);
      if (r > 0) {
        board[r][c] = PLAYER2;
        board[r - 1][c] = PLAYER1;
        const opponentWins = checkWin(board, PLAYER1);
        board[r - 1][c] = 0;
        board[r][c] = 0;
        if (!opponentWins) return c;
      } else return c;
      validCols.push(c);
    }
  }
  return validCols.length > 0 ? validCols[0] : getRandomValidCol();
}

// Restart button logic with confirmation
restartBtn.addEventListener('click', () => {
  if (movesMade > 0 && gameActive) {
    const confirmRestart = confirm("Are you sure you want to restart? The current game progress will be lost.");
    if (!confirmRestart) return;
  }
  // Re-open setup modal on restart so players can change modes/colors
  setupModal.classList.remove('hidden');
});

modalPlayAgain.addEventListener('click', () => {
  statusModal.classList.add('hidden');
  setupModal.classList.remove('hidden');
});