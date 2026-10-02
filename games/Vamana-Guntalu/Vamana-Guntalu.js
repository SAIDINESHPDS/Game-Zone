(function () {
  'use strict';

  /* ==========================================================================
     VAMANA-GUNTALU MASTER ENGINE
     - Styles Modal controller connected to top "Styles" button
     - Real-time Board & Coin swatches with immediate visual switch
     - Confetti celebration + Exit to Game Zone
     ========================================================================== */
  const VamanaGuntalu = {
    P1_PITS: [0, 1, 2, 3, 4, 5, 6],
    P2_PITS: [7, 8, 9, 10, 11, 12, 13],

    currentBoard: 'teak',
    currentToken: 'cowrie',

    BOARD_NAMES: {
      'teak': 'Classic Teak Wood',
      'rosewood': 'Antique Rosewood & Brass',
      'temple': 'Temple Sandstone',
      'ebony-gold': 'Royal Ebony & Gold',
      'terracotta': 'Red Terracotta Clay',
      'marble-jade': 'Imperial Marble & Jade'
    },

    TOKEN_NAMES: {
      'cowrie': 'Cowrie Shells',
      'tamarind': 'Tamarind Seeds',
      'brass-coins': 'Imperial Brass Coins',
      'gemstones': 'Navaratna Gemstones',
      'river-pebbles': 'River Stones',
      'coral-beads': 'Red Corals'
    },

    pits: new Array(14).fill(5),
    scores: [0, 0],
    currentPlayer: 0,
    isAnimating: false,
    shellsPerPitSetting: 5,
    gameMode: 'bot',
    p1Name: 'Player 1',
    p2Name: 'Smart Bot',
    totalRounds: 0,
    matchInProgress: false,
    soundEnabled: true,
    audioCtx: null,

    // Celebration Confetti Controller
    confettiAnimationId: null,
    confettiParticles: [],
    isCelebrating: false,

    /* --------------------------------------------------------------------------
       INITIALIZATION
       -------------------------------------------------------------------------- */
    init() {
      this.cacheDOMElements();
      this.initAudio();
      this.bindEvents();
      this.buildBoard();
      this.openLobby(false);
    },

    cacheDOMElements() {
      this.dom = {
        boardContainer: document.getElementById('board-container'),
        rowPlayer1: document.getElementById('row-player-1'),
        rowPlayer2: document.getElementById('row-player-2'),
        currentTurnName: document.getElementById('current-turn-name'),
        handCountText: document.getElementById('hand-count-text'),
        turnGuideText: document.getElementById('turn-guide-text'),
        handTokenPreview: document.getElementById('hand-token-preview'),
        activeBoardLabel: document.getElementById('active-board-label'),
        activeTokenLabel: document.getElementById('active-token-label'),
        modalBoardIndicator: document.getElementById('modal-board-indicator'),
        modalTokenIndicator: document.getElementById('modal-token-indicator'),
        playerCard0: document.getElementById('player-card-0'),
        playerCard1: document.getElementById('player-card-1'),
        p1DisplayName: document.getElementById('p1-display-name'),
        p2DisplayName: document.getElementById('p2-display-name'),
        p1Score: document.getElementById('p1-score'),
        p2Score: document.getElementById('p2-score'),
        p2BotTag: document.getElementById('p2-bot-tag'),
        p2AvatarIcon: document.getElementById('p2-avatar-icon'),
        soundToggleBtn: document.getElementById('sound-toggle-btn'),
        rulesBtn: document.getElementById('rules-btn'),
        newGameBtn: document.getElementById('new-game-btn'),
        quickThemeBtn: document.getElementById('quick-theme-btn'),
        openStylesCardBtn: document.getElementById('open-styles-card-btn'),

        // Dedicated Styles Modal
        stylesModal: document.getElementById('styles-modal'),
        closeStylesBtn: document.getElementById('close-styles-btn'),
        stylesApplyBtn: document.getElementById('styles-apply-btn'),

        // Lobby Modal
        lobbyModal: document.getElementById('lobby-modal'),
        lobbyBackBtn: document.getElementById('lobby-back-btn'),
        lobbyBackText: document.getElementById('lobby-back-text'),
        lobbyCloseBtn: document.getElementById('lobby-close-btn'),
        startMatchBtn: document.getElementById('start-match-btn'),
        p1NameInput: document.getElementById('p1-name-input'),
        p2NameInput: document.getElementById('p2-name-input'),

        confirmModal: document.getElementById('confirm-modal'),
        acceptConfirmBtn: document.getElementById('accept-confirm-btn'),
        cancelConfirmBtn: document.getElementById('cancel-confirm-btn'),

        rulesModal: document.getElementById('rules-modal'),
        closeRulesBtn: document.getElementById('close-rules-btn'),
        rulesAckBtn: document.getElementById('rules-ack-btn'),

        // Victory Modal & Confetti
        victoryModal: document.getElementById('victory-modal'),
        victoryConfettiCanvas: document.getElementById('victory-confetti-canvas'),
        winnerAnnouncement: document.getElementById('winner-announcement'),
        statP1Shells: document.getElementById('stat-p1-shells'),
        statP2Shells: document.getElementById('stat-p2-shells'),
        statRounds: document.getElementById('stat-rounds'),
        victoryReplayBtn: document.getElementById('victory-replay-btn'),
        victoryExitBtn: document.getElementById('victory-exit-btn')
      };
    },

    /* --------------------------------------------------------------------------
       MATERIAL-SPECIFIC SYNTHESIZED AUDIO
       -------------------------------------------------------------------------- */
    initAudio() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      } catch (e) {
        console.warn('AudioContext not supported');
      }
    },

    playSound(type) {
      if (!this.soundEnabled || !this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'drop') {
        let baseFreq = 1200;
        let decay = 0.05;
        let waveType = 'sine';

        if (this.currentToken === 'brass-coins') {
          baseFreq = 2200 + Math.random() * 300;
          decay = 0.08;
          waveType = 'triangle';
        } else if (this.currentToken === 'tamarind' || this.currentToken === 'river-pebbles') {
          baseFreq = 650 + Math.random() * 150;
          decay = 0.04;
          waveType = 'sine';
        } else if (this.currentToken === 'gemstones') {
          baseFreq = 1800 + Math.random() * 400;
          decay = 0.09;
          waveType = 'sine';
        } else if (this.currentToken === 'coral-beads') {
          baseFreq = 950 + Math.random() * 200;
          decay = 0.045;
          waveType = 'triangle';
        }

        osc.type = waveType;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + decay);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + decay);
        osc.start(now);
        osc.stop(now + decay);
      } else if (type === 'pickup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'capture') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.type = 'triangle';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.2, now + idx * 0.07);
          g.gain.linearRampToValueAtTime(0.01, now + idx * 0.07 + 0.2);
          o.start(now + idx * 0.07);
          o.stop(now + idx * 0.07 + 0.2);
        });
      } else if (type === 'win') {
        [392.0, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.22, now + idx * 0.08);
          g.gain.linearRampToValueAtTime(0.01, now + idx * 0.08 + 0.45);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.45);
        });
      }
    },

    /* --------------------------------------------------------------------------
       BUILD BOARD (14 GUNTALU)
       -------------------------------------------------------------------------- */
    buildBoard() {
      this.dom.rowPlayer2.innerHTML = '';
      for (let i = 13; i >= 7; i--) {
        this.dom.rowPlayer2.appendChild(this.createPitElement(i));
      }

      this.dom.rowPlayer1.innerHTML = '';
      for (let i = 0; i <= 6; i++) {
        this.dom.rowPlayer1.appendChild(this.createPitElement(i));
      }

      this.updateBoardAndTokenClasses();
      this.renderPits();
    },

    createPitElement(index) {
      const pit = document.createElement('div');
      pit.className = 'pit-hole';
      pit.id = `pit-${index}`;
      pit.dataset.index = index;

      const numLabel = (index >= 7) ? (14 - (13 - index)) : (index + 1);

      pit.innerHTML = `
        <span class="pit-num-tag">#${numLabel}</span>
        <div class="shells-cluster" id="cluster-${index}"></div>
        <span class="pit-shell-count" id="count-${index}">0</span>
      `;

      pit.addEventListener('click', () => {
        if (!this.isAnimating && this.matchInProgress) {
          this.handlePitClick(index);
        }
      });

      return pit;
    },

    updateBoardAndTokenClasses() {
      // 1. Board theme class
      this.dom.boardContainer.className = `wooden-board-container theme-${this.currentBoard}`;

      // 2. Text badges & Indicators
      const boardTitle = this.BOARD_NAMES[this.currentBoard];
      const tokenTitle = this.TOKEN_NAMES[this.currentToken];

      if (this.dom.activeBoardLabel) this.dom.activeBoardLabel.textContent = boardTitle;
      if (this.dom.activeTokenLabel) this.dom.activeTokenLabel.textContent = tokenTitle;
      if (this.dom.modalBoardIndicator) this.dom.modalBoardIndicator.textContent = `Active: ${boardTitle}`;
      if (this.dom.modalTokenIndicator) this.dom.modalTokenIndicator.textContent = `Active: ${tokenTitle}`;

      // 3. Right panel token hand preview
      if (this.dom.handTokenPreview) {
        this.dom.handTokenPreview.innerHTML = `<span class="token-${this.currentToken}" style="position:static; transform:none;"></span>`;
      }

      // 4. Sync active classes in Styles Modal
      document.querySelectorAll('.board-option-card').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.board === this.currentBoard);
      });
      document.querySelectorAll('.token-option-card').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.token === this.currentToken);
      });
    },

    renderPits() {
      for (let i = 0; i < 14; i++) {
        const count = this.pits[i];
        const countEl = document.getElementById(`count-${i}`);
        const clusterEl = document.getElementById(`cluster-${i}`);

        if (countEl) countEl.textContent = count;
        if (clusterEl) {
          clusterEl.innerHTML = '';
          const visualCount = Math.min(count, 12);

          for (let s = 0; s < visualCount; s++) {
            const token = document.createElement('div');
            token.className = `token-${this.currentToken}`;

            const angle = (s / visualCount) * Math.PI * 2;
            const distance = visualCount > 1 ? (6 + (s % 3) * 4) : 0;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const rotation = (s * 49) % 360;

            token.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            clusterEl.appendChild(token);
          }
        }
      }

      this.updatePitInteractivity();
    },

    updatePitInteractivity() {
      const isPlayerTurn = (this.currentPlayer === 0) || (this.currentPlayer === 1 && this.gameMode === 'local');

      for (let i = 0; i < 14; i++) {
        const pitEl = document.getElementById(`pit-${i}`);
        if (!pitEl) continue;

        const isOwner = (this.currentPlayer === 0 && this.P1_PITS.includes(i)) ||
                        (this.currentPlayer === 1 && this.P2_PITS.includes(i));
        const hasSeeds = this.pits[i] > 0;

        if (isOwner && hasSeeds && isPlayerTurn && !this.isAnimating) {
          pitEl.classList.remove('disabled');
          pitEl.classList.add('highlight-active');
        } else {
          pitEl.classList.remove('highlight-active');
          pitEl.classList.add('disabled');
        }
      }
    },

    /* --------------------------------------------------------------------------
       SOWING & RELAY LOGIC
       -------------------------------------------------------------------------- */
    handlePitClick(pitIndex) {
      const isOwner = (this.currentPlayer === 0 && this.P1_PITS.includes(pitIndex)) ||
                      (this.currentPlayer === 1 && this.P2_PITS.includes(pitIndex));

      if (!isOwner || this.pits[pitIndex] === 0) return;

      this.executeSowingTurn(pitIndex);
    },

    async executeSowingTurn(startPit) {
      this.isAnimating = true;
      this.updatePitInteractivity();

      const activeName = (this.currentPlayer === 0) ? this.p1Name : this.p2Name;
      let hand = this.pits[startPit];
      this.pits[startPit] = 0;
      this.renderPits();

      this.playSound('pickup');
      this.dom.handCountText.textContent = hand;
      this.dom.turnGuideText.textContent = `${activeName} picked ${hand} coins from Gunta #${startPit + 1}...`;

      let currentPit = startPit;

      while (hand > 0) {
        currentPit = (currentPit + 1) % 14;

        await this.delay(240);
        this.pits[currentPit]++;
        hand--;

        this.playSound('drop');
        this.dom.handCountText.textContent = hand;

        const pitEl = document.getElementById(`pit-${currentPit}`);
        if (pitEl) {
          pitEl.classList.add('sowing-target');
          setTimeout(() => pitEl.classList.remove('sowing-target'), 260);
        }

        this.renderPits();

        if (hand === 0) {
          const nextPit = (currentPit + 1) % 14;

          if (this.pits[nextPit] > 0) {
            await this.delay(350);
            hand = this.pits[nextPit];
            this.pits[nextPit] = 0;
            currentPit = nextPit;

            this.playSound('pickup');
            this.dom.handCountText.textContent = hand;
            this.dom.turnGuideText.textContent = `Picked up ${hand} coins from next pit (#${nextPit + 1}) to continue...`;
            this.renderPits();
          } else {
            const capturePit = (nextPit + 1) % 14;
            const capturedCount = this.pits[capturePit];

            if (capturedCount > 0) {
              await this.delay(450);
              this.scores[this.currentPlayer] += capturedCount;
              this.pits[capturePit] = 0;

              this.playSound('capture');
              this.renderPits();
              this.updateScoresUI();

              this.dom.turnGuideText.textContent = `🎯 Captured all ${capturedCount} coins from Gunta #${capturePit + 1}!`;
            } else {
              this.dom.turnGuideText.textContent = `Turn ended.`;
            }

            break;
          }
        }
      }

      this.dom.handCountText.textContent = '0';
      await this.delay(400);

      if (this.checkGameOver()) {
        this.handleGameOver();
        return;
      }

      this.totalRounds++;
      this.currentPlayer = 1 - this.currentPlayer;
      this.isAnimating = false;
      this.updateActiveTurnUI();

      if (this.currentPlayer === 1 && this.gameMode === 'bot') {
        setTimeout(() => this.executeBotTurn(), 900);
      }
    },

    /* --------------------------------------------------------------------------
       BOT AI
       -------------------------------------------------------------------------- */
    executeBotTurn() {
      if (!this.matchInProgress) return;

      const validPits = this.P2_PITS.filter(p => this.pits[p] > 0);
      if (validPits.length === 0) {
        this.handleGameOver();
        return;
      }

      let bestPit = validPits[0];
      let maxCaptured = -1;

      for (const p of validPits) {
        const potential = this.simulateMoveScore(p);
        if (potential > maxCaptured) {
          maxCaptured = potential;
          bestPit = p;
        }
      }

      this.executeSowingTurn(bestPit);
    },

    simulateMoveScore(startPit) {
      const seeds = this.pits[startPit];
      const landPit = (startPit + seeds) % 14;
      const nextPit = (landPit + 1) % 14;
      const capturePit = (nextPit + 1) % 14;

      if (this.pits[nextPit] === 0 && this.pits[capturePit] > 0) {
        return this.pits[capturePit] * 10;
      }
      return seeds;
    },

    /* --------------------------------------------------------------------------
       GAME OVER & CELEBRATION TRIGGER
       -------------------------------------------------------------------------- */
    checkGameOver() {
      const p1HasSeeds = this.P1_PITS.some(p => this.pits[p] > 0);
      const p2HasSeeds = this.P2_PITS.some(p => this.pits[p] > 0);

      if (this.currentPlayer === 0 && !p1HasSeeds) return true;
      if (this.currentPlayer === 1 && !p2HasSeeds) return true;

      return this.pits.every(count => count === 0);
    },

    handleGameOver() {
      this.matchInProgress = false;
      this.isAnimating = false;
      this.playSound('win');

      this.P1_PITS.forEach(p => { this.scores[0] += this.pits[p]; this.pits[p] = 0; });
      this.P2_PITS.forEach(p => { this.scores[1] += this.pits[p]; this.pits[p] = 0; });
      this.renderPits();
      this.updateScoresUI();

      let winnerText = '';
      if (this.scores[0] > this.scores[1]) {
        winnerText = `${this.p1Name} won with ${this.scores[0]} coins!`;
      } else if (this.scores[1] > this.scores[0]) {
        winnerText = `${this.p2Name} won with ${this.scores[1]} coins!`;
      } else {
        winnerText = `It's a Tie! Both players captured ${this.scores[0]} coins.`;
      }

      this.dom.winnerAnnouncement.textContent = winnerText;
      this.dom.statP1Shells.textContent = this.scores[0];
      this.dom.statP2Shells.textContent = this.scores[1];
      this.dom.statRounds.textContent = this.totalRounds;

      setTimeout(() => {
        this.dom.victoryModal.classList.remove('hidden');
        this.startCelebrationConfetti();
      }, 500);
    },

    /* --------------------------------------------------------------------------
       CONFETTI SYSTEM
       -------------------------------------------------------------------------- */
    startCelebrationConfetti() {
      const canvas = this.dom.victoryConfettiCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      this.isCelebrating = true;
      this.confettiParticles = [];

      const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#fef08a', '#06b6d4'];
      const totalParticles = Math.min(140, Math.floor(window.innerWidth / 8));

      for (let i = 0; i < totalParticles; i++) {
        this.confettiParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.4 - canvas.height * 0.2,
          w: Math.random() * 9 + 5,
          h: Math.random() * 14 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: Math.random() * 4 - 2,
          vy: Math.random() * 3 + 2.5,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 8 - 4,
          oscillation: Math.random() * 0.1,
          opacity: 1
        });
      }

      const animate = () => {
        if (!this.isCelebrating) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.confettiParticles.length; i++) {
          const p = this.confettiParticles[i];

          p.y += p.vy;
          p.x += Math.sin(p.y * p.oscillation) * 1.5 + p.vx * 0.4;
          p.rotation += p.rotationSpeed;

          if (p.y > canvas.height) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }

        this.confettiAnimationId = requestAnimationFrame(animate);
      };

      animate();
    },

    stopCelebrationConfetti() {
      this.isCelebrating = false;
      if (this.confettiAnimationId) {
        cancelAnimationFrame(this.confettiAnimationId);
        this.confettiAnimationId = null;
      }
      const canvas = this.dom.victoryConfettiCanvas;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },

    /* --------------------------------------------------------------------------
       UI UPDATES
       -------------------------------------------------------------------------- */
    updateActiveTurnUI() {
      const isP1 = (this.currentPlayer === 0);
      const activeName = isP1 ? this.p1Name : this.p2Name;
      const themeColor = isP1 ? '#f59e0b' : '#38bdf8';

      this.dom.currentTurnName.textContent = activeName;
      this.dom.currentTurnName.style.color = themeColor;

      this.dom.playerCard0.classList.toggle('active-turn', isP1);
      this.dom.playerCard1.classList.toggle('active-turn', !isP1);

      if (!isP1 && this.gameMode === 'bot') {
        this.dom.turnGuideText.textContent = `${this.p2Name} is calculating the best pit...`;
      } else {
        this.dom.turnGuideText.textContent = `${activeName}, pick any pit on your side to sow.`;
      }

      this.updatePitInteractivity();
    },

    updateScoresUI() {
      this.dom.p1Score.textContent = this.scores[0];
      this.dom.p2Score.textContent = this.scores[1];
    },

    /* --------------------------------------------------------------------------
       LOBBY & MODALS
       -------------------------------------------------------------------------- */
    openStylesModal() {
      this.updateBoardAndTokenClasses();
      this.dom.stylesModal.classList.remove('hidden');
    },

    closeStylesModal() {
      this.dom.stylesModal.classList.add('hidden');
    },

    openLobby(isMatchActive = false) {
      if (isMatchActive || this.matchInProgress) {
        this.dom.lobbyBackText.textContent = 'Back to Game';
      } else {
        this.dom.lobbyBackText.textContent = 'Back to Game Zone';
      }
      this.dom.lobbyModal.classList.remove('hidden');
    },

    closeLobby() {
      this.dom.lobbyModal.classList.add('hidden');
    },

    startMatch() {
      this.p1Name = this.dom.p1NameInput.value.trim() || 'Player 1';
      this.p2Name = this.dom.p2NameInput.value.trim() || (this.gameMode === 'bot' ? 'Smart Bot' : 'Player 2');

      this.dom.p1DisplayName.textContent = this.p1Name;
      this.dom.p2DisplayName.textContent = this.p2Name;

      if (this.gameMode === 'bot') {
        this.dom.p2BotTag.style.display = 'block';
        this.dom.p2AvatarIcon.className = 'fa-solid fa-robot';
      } else {
        this.dom.p2BotTag.style.display = 'none';
        this.dom.p2AvatarIcon.className = 'fa-solid fa-user';
      }

      this.pits = new Array(14).fill(this.shellsPerPitSetting);
      this.scores = [0, 0];
      this.currentPlayer = 0;
      this.totalRounds = 0;
      this.isAnimating = false;
      this.matchInProgress = true;

      this.stopCelebrationConfetti();
      this.closeLobby();
      this.updateBoardAndTokenClasses();
      this.renderPits();
      this.updateScoresUI();
      this.updateActiveTurnUI();
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    /* --------------------------------------------------------------------------
       EVENT LISTENERS
       -------------------------------------------------------------------------- */
    bindEvents() {
      // 1. CLICKING "STYLES" BUTTON IN HEADER OPENS THE DEDICATED STYLES MODAL
      this.dom.quickThemeBtn.addEventListener('click', () => {
        this.openStylesModal();
      });

      // Also opening via left-panel "Change" badge
      if (this.dom.openStylesCardBtn) {
        this.dom.openStylesCardBtn.addEventListener('click', () => {
          this.openStylesModal();
        });
      }

      // Close Styles Modal buttons
      this.dom.closeStylesBtn.addEventListener('click', () => {
        this.closeStylesModal();
      });
      this.dom.stylesApplyBtn.addEventListener('click', () => {
        this.closeStylesModal();
      });

      // 2. BOARD CARD SELECTION IN STYLES MODAL (INSTANT LIVE SWITCH)
      document.querySelectorAll('.board-option-card').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentBoard = btn.dataset.board;
          this.updateBoardAndTokenClasses();
          this.playSound('drop');
        });
      });

      // 3. TOKEN CARD SELECTION IN STYLES MODAL (INSTANT LIVE SWITCH)
      document.querySelectorAll('.token-option-card').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentToken = btn.dataset.token;
          this.updateBoardAndTokenClasses();
          this.renderPits();
          this.playSound('drop');
        });
      });

      // Game Mode selection
      document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.gameMode = btn.dataset.mode;
          this.dom.p2NameInput.value = (this.gameMode === 'bot') ? 'Smart Bot' : 'Player 2';
        });
      });

      // Shells per pit selection
      document.querySelectorAll('.shell-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.shell-opt-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.shellsPerPitSetting = parseInt(btn.dataset.shells, 10);
        });
      });

      // Header New Match Button with Confirmation Guard
      this.dom.newGameBtn.addEventListener('click', () => {
        if (this.matchInProgress) {
          this.dom.confirmModal.classList.remove('hidden');
        } else {
          this.openLobby(false);
        }
      });

      // Confirmation Handlers
      this.dom.acceptConfirmBtn.addEventListener('click', () => {
        this.dom.confirmModal.classList.add('hidden');
        this.openLobby(true);
      });

      this.dom.cancelConfirmBtn.addEventListener('click', () => {
        this.dom.confirmModal.classList.add('hidden');
      });

      // Lobby Back Navigation Button
      this.dom.lobbyBackBtn.addEventListener('click', () => {
        if (this.matchInProgress) {
          this.closeLobby();
        } else {
          window.location.href = '../../index.html';
        }
      });

      // Lobby Close 'X' Button
      this.dom.lobbyCloseBtn.addEventListener('click', () => {
        this.closeLobby();
      });

      // Start Match Button
      this.dom.startMatchBtn.addEventListener('click', () => this.startMatch());

      // Victory Replay Button
      this.dom.victoryReplayBtn.addEventListener('click', () => {
        this.stopCelebrationConfetti();
        this.dom.victoryModal.classList.add('hidden');
        this.openLobby(false);
      });

      // Victory Exit to Game Zone Button
      this.dom.victoryExitBtn.addEventListener('click', () => {
        this.stopCelebrationConfetti();
        window.location.href = '../../index.html';
      });

      // Rules Modal
      this.dom.rulesBtn.addEventListener('click', () => this.dom.rulesModal.classList.remove('hidden'));
      this.dom.closeRulesBtn.addEventListener('click', () => this.dom.rulesModal.classList.add('hidden'));
      this.dom.rulesAckBtn.addEventListener('click', () => this.dom.rulesModal.classList.add('hidden'));

      // Sound Toggle
      this.dom.soundToggleBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        this.dom.soundToggleBtn.innerHTML = this.soundEnabled
          ? '<i class="fa-solid fa-volume-high"></i>'
          : '<i class="fa-solid fa-volume-xmark"></i>';
      });
    }
  };

  window.VamanaGuntalu = VamanaGuntalu;

  window.addEventListener('DOMContentLoaded', () => {
    window.VamanaGuntalu.init();
  });
})();