/* ==========================================================================
   TIC-TAC-TOE (XO) - UNBEATABLE MINIMAX AI, AUDIO & SERIES LOGIC
   ========================================================================== */

const WINNING_COMBOS = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6]
];

// Audio Synthesizer (Zero external dependencies)
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

function playSound(type) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === 'mark-x') {
    // Sharp high snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'mark-o') {
    // Warmer double tap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(170, now + 0.09);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } else if (type === 'win') {
    // Upbeat chime
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.35, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  } else if (type === 'tie') {
    // Muted low bounce
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(180, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

// Game State
let boardState = Array(9).fill(null);
let currentTurn = 'X';
let gameActive = false;
let gameMode = 'pve-medium';
let humanSide = 'X';
let isBotThinking = false;

let scores = { X: 0, O: 0, ties: 0 };
let currentRound = 1;
let targetWins = 2; // e.g. Best of 3 target is 2
let matchOver = false;

let playerNames = {
  X: 'Player 1',
  O: 'Bot (Medium)'
};

// DOM References
let cells, winningLine, turnSymbol, turnText, modeDisplay, roundBadge, targetScoreText;
let cardX, cardO, xName, oName, xScore, oScore, tieScore, totalRounds, nextRoundBtn;
let setupModal, themeModal, exitModal, gameOverModal;
let modeSelect, xNameInput, oNameInput, oNameGroup, sideSelect, sideSelectGroup, targetSelect;
let startGameBtn, themeBtn, closeThemeBtn, exitBtn, confirmExitBtn, cancelExitBtn;
let modalExitBtn, gameOverExitBtn, backNavBtn, restartBtn, playAgainBtn, soundBtn, confettiContainer;
let winnerTitle, winnerDesc;

function init() {
  cacheDOM();
  bindEvents();

  // Load saved session if exists
  const saved = localStorage.getItem('ttt_save_session');
  if (saved) {
    try {
      loadSavedGame(JSON.parse(saved));
      return;
    } catch (e) {
      console.warn("Failed to load saved session.", e);
    }
  }

  // Open setup on initial visit
  setupModal.classList.remove('hidden');
  startNewSeries();
}

function cacheDOM() {
  cells = document.querySelectorAll('.cell');
  winningLine = document.getElementById('winning-line');
  turnSymbol = document.getElementById('turn-symbol');
  turnText = document.getElementById('turn-text');
  modeDisplay = document.getElementById('mode-display');
  roundBadge = document.getElementById('round-badge');
  targetScoreText = document.getElementById('target-score-text');

  cardX = document.getElementById('card-x');
  cardO = document.getElementById('card-o');
  xName = document.getElementById('x-name');
  oName = document.getElementById('o-name');
  xScore = document.getElementById('x-score');
  oScore = document.getElementById('o-score');
  tieScore = document.getElementById('tie-score');
  totalRounds = document.getElementById('total-rounds');
  nextRoundBtn = document.getElementById('next-round-btn');

  setupModal = document.getElementById('setup-modal');
  themeModal = document.getElementById('theme-modal');
  exitModal = document.getElementById('exit-modal');
  gameOverModal = document.getElementById('game-over-modal');

  modeSelect = document.getElementById('mode-select');
  xNameInput = document.getElementById('x-name-input');
  oNameInput = document.getElementById('o-name-input');
  oNameGroup = document.getElementById('o-name-group');
  sideSelect = document.getElementById('side-select');
  sideSelectGroup = document.getElementById('side-select-group');
  targetSelect = document.getElementById('target-select');

  startGameBtn = document.getElementById('start-game-btn');
  themeBtn = document.getElementById('theme-btn');
  closeThemeBtn = document.getElementById('close-theme-btn');
  exitBtn = document.getElementById('exit-btn');
  confirmExitBtn = document.getElementById('confirm-exit-btn');
  cancelExitBtn = document.getElementById('cancel-exit-btn');
  modalExitBtn = document.getElementById('modal-exit-btn');
  gameOverExitBtn = document.getElementById('gameover-exit-btn');
  backNavBtn = document.getElementById('back-nav-btn');
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

  cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(parseInt(cell.dataset.index, 10)));
  });

  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      const isPvP = e.target.value === 'pvp';
      oNameGroup.style.display = isPvP ? 'block' : 'none';
      sideSelectGroup.style.display = isPvP ? 'none' : 'block';
    });
  }

  if (themeBtn) themeBtn.addEventListener('click', () => themeModal.classList.remove('hidden'));
  if (closeThemeBtn) closeThemeBtn.addEventListener('click', () => themeModal.classList.add('hidden'));

  if (restartBtn) {
    restartBtn.addEventListener('click', () => setupModal.classList.remove('hidden'));
  }

  // Exit Confirmation
  if (exitBtn) exitBtn.addEventListener('click', () => exitModal.classList.remove('hidden'));
  if (cancelExitBtn) cancelExitBtn.addEventListener('click', () => exitModal.classList.add('hidden'));
  if (confirmExitBtn) {
    confirmExitBtn.addEventListener('click', () => {
      localStorage.removeItem('ttt_save_session');
      window.location.href = '../../index.html';
    });
  }
  if (modalExitBtn) {
    modalExitBtn.addEventListener('click', () => {
      localStorage.removeItem('ttt_save_session');
      window.location.href = '../../index.html';
    });
  }
  if (gameOverExitBtn) {
    gameOverExitBtn.addEventListener('click', () => {
      localStorage.removeItem('ttt_save_session');
      window.location.href = '../../index.html';
    });
  }

  // Back Navigation Auto-Save
  if (backNavBtn) {
    backNavBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!matchOver) saveSession();
      window.location.href = '../../index.html';
    });
  }

  if (nextRoundBtn) {
    nextRoundBtn.addEventListener('click', () => startNextRound());
  }

  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      gameMode = modeSelect.value;
      humanSide = sideSelect ? sideSelect.value : 'X';
      const targetVal = parseInt(targetSelect.value, 10);
      targetWins = (targetVal === 1) ? 1 : (targetVal === 3) ? 2 : (targetVal === 5) ? 3 : 999;

      const isPvP = gameMode === 'pvp';
      if (isPvP) {
        playerNames.X = xNameInput.value.trim() || 'Player 1';
        playerNames.O = oNameInput.value.trim() || 'Player 2';
      } else {
        const botLabel = modeSelect.options[modeSelect.selectedIndex].text.replace('vs Computer ', '');
        if (humanSide === 'X') {
          playerNames.X = xNameInput.value.trim() || 'Player 1';
          playerNames.O = `Bot ${botLabel}`;
        } else {
          playerNames.X = `Bot ${botLabel}`;
          playerNames.O = xNameInput.value.trim() || 'Player 1';
        }
      }

      modeDisplay.textContent = modeSelect.options[modeSelect.selectedIndex].text;
      setupModal.classList.add('hidden');
      localStorage.removeItem('ttt_save_session');
      startNewSeries();
    });
  }

  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      gameOverModal.classList.add('hidden');
      setupModal.classList.remove('hidden');
    });
  }

  // Live Board Theme Swatches
  document.querySelectorAll('.theme-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-card-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.board === btn.dataset.board);
      });
      document.body.setAttribute('data-board-theme', btn.dataset.board);
      saveSession();
    });
  });
}

function saveSession() {
  const session = {
    boardState,
    currentTurn,
    scores,
    currentRound,
    targetWins,
    gameMode,
    humanSide,
    playerNames,
    boardTheme: document.body.getAttribute('data-board-theme')
  };
  localStorage.setItem('ttt_save_session', JSON.stringify(session));
}

function loadSavedGame(save) {
  boardState = save.boardState;
  currentTurn = save.currentTurn;
  scores = save.scores;
  currentRound = save.currentRound;
  targetWins = save.targetWins;
  gameMode = save.gameMode;
  humanSide = save.humanSide;
  playerNames = save.playerNames;

  document.body.setAttribute('data-board-theme', save.boardTheme || 'cyber-neon');
  gameActive = true;
  isBotThinking = false;
  matchOver = false;

  updateUI();
  renderBoard();
}

function startNewSeries() {
  scores = { X: 0, O: 0, ties: 0 };
  currentRound = 1;
  matchOver = false;
  startNextRound();
}

function startNextRound() {
  boardState = Array(9).fill(null);
  currentTurn = 'X';
  gameActive = true;
  isBotThinking = false;
  winningLine.style.display = 'none';
  nextRoundBtn.classList.add('hidden');

  updateUI();
  renderBoard();

  // If Bot plays as X
  if (gameMode !== 'pvp' && humanSide === 'O' && currentTurn === 'X') {
    isBotThinking = true;
    setTimeout(botPlay, 500);
  }
}

function renderBoard() {
  cells.forEach((cell, idx) => {
    const val = boardState[idx];
    cell.className = `cell ${val ? `${val.toLowerCase()} taken` : ''}`;
    cell.textContent = val || '';
  });
}

function handleCellClick(index) {
  if (!gameActive || isBotThinking || boardState[index]) return;

  // Prevent moving out of turn against AI
  if (gameMode !== 'pvp') {
    if (humanSide === 'X' && currentTurn === 'O') return;
    if (humanSide === 'O' && currentTurn === 'X') return;
  }

  executeMove(index, currentTurn);
}

function executeMove(index, player) {
  boardState[index] = player;
  playSound(player === 'X' ? 'mark-x' : 'mark-o');
  renderBoard();

  const winCombo = checkWin(boardState, player);

  if (winCombo) {
    handleRoundWin(player, winCombo);
    return;
  }

  if (boardState.every(c => c !== null)) {
    handleRoundTie();
    return;
  }

  // Switch Turn
  currentTurn = currentTurn === 'X' ? 'O' : 'X';
  updateUI();

  // AI Turn Trigger
  if (gameActive && gameMode !== 'pvp') {
    if ((humanSide === 'X' && currentTurn === 'O') || (humanSide === 'O' && currentTurn === 'X')) {
      isBotThinking = true;
      setTimeout(botPlay, 450);
    }
  }
}

function handleRoundWin(winner, combo) {
  gameActive = false;
  isBotThinking = false;
  scores[winner]++;
  playSound('win');
  drawWinningLine(combo);

  updateUI();

  // Check if series target is reached
  if (scores[winner] >= targetWins) {
    matchOver = true;
    localStorage.removeItem('ttt_save_session');
    setTimeout(() => {
      showGameOverModal(winner);
    }, 900);
  } else {
    currentRound++;
    nextRoundBtn.classList.remove('hidden');
    saveSession();
  }
}

function handleRoundTie() {
  gameActive = false;
  isBotThinking = false;
  scores.ties++;
  playSound('tie');

  updateUI();
  currentRound++;
  nextRoundBtn.classList.remove('hidden');
  saveSession();
}

function drawWinningLine(combo) {
  const [a, , c] = combo;
  const boardRect = document.getElementById('board').getBoundingClientRect();
  const cellA = cells[a].getBoundingClientRect();
  const cellC = cells[c].getBoundingClientRect();

  const x1 = cellA.left + cellA.width / 2 - boardRect.left;
  const y1 = cellA.top + cellA.height / 2 - boardRect.top;
  const x2 = cellC.left + cellC.width / 2 - boardRect.left;
  const y2 = cellC.top + cellC.height / 2 - boardRect.top;

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  winningLine.style.width = `${length}px`;
  winningLine.style.height = `6px`;
  winningLine.style.left = `${x1}px`;
  winningLine.style.top = `${y1}px`;
  winningLine.style.transformOrigin = '0 50%';
  winningLine.style.transform = `rotate(${angle}deg)`;
  winningLine.style.display = 'block';
}

function checkWin(board, player) {
  for (const combo of WINNING_COMBOS) {
    if (combo.every(idx => board[idx] === player)) {
      return combo;
    }
  }
  return null;
}

/* ==========================================================================
   SMART BOT AI: EASY, MEDIUM & UNBEATABLE MINIMAX
   ========================================================================== */
function botPlay() {
  if (!gameActive) return;

  const botMark = currentTurn;
  const opponent = botMark === 'X' ? 'O' : 'X';
  const emptyIndices = boardState.map((val, idx) => (val === null ? idx : null)).filter(v => v !== null);

  if (emptyIndices.length === 0) return;

  let chosenIndex;

  if (gameMode === 'pve-easy') {
    // 80% random, 20% block
    if (Math.random() < 0.2) {
      chosenIndex = findWinningMove(boardState, botMark) || findWinningMove(boardState, opponent) || getRandomMove(emptyIndices);
    } else {
      chosenIndex = getRandomMove(emptyIndices);
    }
  } else if (gameMode === 'pve-medium') {
    // Blocks wins and attacks, takes center
    chosenIndex = findWinningMove(boardState, botMark) ||
                  findWinningMove(boardState, opponent) ||
                  (boardState[4] === null ? 4 : getRandomMove(emptyIndices));
  } else {
    // Unbeatable Minimax
    chosenIndex = getBestMoveMinimax(boardState, botMark, opponent);
  }

  isBotThinking = false;
  executeMove(chosenIndex, botMark);
}

function getRandomMove(emptyIndices) {
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

function findWinningMove(board, player) {
  for (const combo of WINNING_COMBOS) {
    const values = combo.map(i => board[i]);
    if (values.filter(v => v === player).length === 2 && values.includes(null)) {
      return combo[values.indexOf(null)];
    }
  }
  return null;
}

function getBestMoveMinimax(currentBoard, botMark, opponent) {
  let bestScore = -Infinity;
  let move = null;

  for (let i = 0; i < 9; i++) {
    if (currentBoard[i] === null) {
      currentBoard[i] = botMark;
      const score = minimax(currentBoard, 0, false, botMark, opponent);
      currentBoard[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing, botMark, opponent) {
  if (checkWin(board, botMark)) return 10 - depth;
  if (checkWin(board, opponent)) return depth - 10;
  if (board.every(cell => cell !== null)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = botMark;
        const evaluation = minimax(board, depth + 1, false, botMark, opponent);
        board[i] = null;
        maxEval = Math.max(maxEval, evaluation);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = opponent;
        const evaluation = minimax(board, depth + 1, true, botMark, opponent);
        board[i] = null;
        minEval = Math.min(minEval, evaluation);
      }
    }
    return minEval;
  }
}

function showGameOverModal(winner) {
  const winnerName = playerNames[winner];
  triggerConfetti();

  if (gameMode !== 'pvp') {
    if (winner === humanSide) {
      winnerTitle.textContent = "🏆 Victory!";
      winnerDesc.textContent = `Magnificent! You defeated ${playerNames[winner === 'X' ? 'O' : 'X']}!`;
    } else {
      winnerTitle.textContent = "🤖 Bot Wins!";
      winnerDesc.textContent = `${winnerName} conquered the match series.`;
    }
  } else {
    winnerTitle.textContent = `👑 ${winnerName} Wins!`;
    winnerDesc.textContent = `${winnerName} won the match series!`;
  }

  gameOverModal.classList.remove('hidden');
}

function updateUI() {
  turnSymbol.textContent = currentTurn;
  turnSymbol.className = `turn-symbol ${currentTurn === 'X' ? 'x-sym' : 'o-sym'}`;
  turnText.textContent = `${playerNames[currentTurn]}'s Turn`;

  xName.textContent = playerNames.X;
  oName.textContent = playerNames.O;
  xScore.textContent = scores.X;
  oScore.textContent = scores.O;
  tieScore.textContent = scores.ties;
  totalRounds.textContent = currentRound;
  roundBadge.textContent = `Round ${currentRound}`;

  if (targetWins >= 999) {
    targetScoreText.textContent = "Endless Play";
  } else {
    targetScoreText.textContent = `First to ${targetWins} Wins`;
  }

  if (currentTurn === 'X') {
    cardX.classList.add('active');
    cardO.classList.remove('active');
  } else {
    cardO.classList.add('active');
    cardX.classList.remove('active');
  }
}

function triggerConfetti() {
  if (!confettiContainer) return;
  const colors = ['#38bdf8', '#f43f5e', '#10b981', '#facc15', '#f8fafc'];
  for (let i = 0; i < 65; i++) {
    const el = document.createElement('div');
    el.classList.add('confetti-piece');
    el.style.left = Math.random() * 100 + 'vw';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDuration = (Math.random() * 2.2 + 2) + 's';
    el.style.animationDelay = (Math.random() * 0.7) + 's';
    confettiContainer.appendChild(el);
  }
}

document.addEventListener('DOMContentLoaded', init);