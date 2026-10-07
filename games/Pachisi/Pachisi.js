(function () {
  'use strict';

  /* ==========================================================================
     PACHISI MASTER GAME ENGINE
     - Fully Responsive Mathematical 2D Coordinate Engine
     - Starter Pawns Deployed Immediately for Non-Stop Action
     - Dual-Faced 3D Cowries (బొమ్మ / బొరుసు)
     - 6 Board Fabrics & 6 Goti Styles
     ========================================================================== */
  const Pachisi = {
    PLAYER_CONFIGS: [
      { id: 0, name: 'Yellow King', color: '#facc15', icon: 'fa-chess-king', glow: 'rgba(250, 204, 21, 0.4)' },
      { id: 1, name: 'Green Sultan', color: '#10b981', icon: 'fa-shield-halved', glow: 'rgba(16, 185, 129, 0.4)' },
      { id: 2, name: 'Red Emperor', color: '#ef4444', icon: 'fa-crown', glow: 'rgba(239, 68, 68, 0.4)' },
      { id: 3, name: 'Silver Lord', color: '#94a3b8', icon: 'fa-chess-rook', glow: 'rgba(148, 163, 184, 0.4)' }
    ],

    // Safe sanctuary squares on the track where pawns cannot be cut
    SAFE_SQUARES: [4, 11, 21, 28, 38, 45, 55, 62],

    // 6 Board themes and 6 Goti styles
    currentBoard: 'silk',
    currentGoti: 'bell',

    BOARD_NAMES: {
      'silk': 'Royal Silk Cloth',
      'mughal': 'Mughal Crimson Velvet',
      'brocade': 'Varanasi Gold Brocade',
      'temple': 'Temple Sandstone',
      'ebony': 'Royal Ebony & Ivory',
      'marble': 'Udaipur White Marble'
    },

    GOTI_NAMES: {
      'bell': 'Royal Bell Gotis',
      'wood': 'Carved Minarets',
      'gem': 'Faceted Gemstones',
      'marble': 'Glass Swirl Marbles',
      'coin': 'Stamped Imperial Coins',
      'jade': 'Polished Jade Cones'
    },

    players: [],
    currentPlayerIndex: 0,
    isRolling: false,
    currentPoints: 0,
    hasExtraTurn: false,
    waitingForPawnMove: false,
    matchInProgress: false,
    totalTurns: 0,
    soundEnabled: true,
    audioCtx: null,

    // Celebration Confetti
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
      this.renderLobbySlots(2);
      this.openLobby(false);
    },

    cacheDOMElements() {
      this.dom = {
        pachisiBoard: document.getElementById('pachisi-board'),
        pawnsLayer: document.getElementById('pawns-layer'),
        playersList: document.getElementById('players-list'),
        playerCountBadge: document.getElementById('player-count-badge'),
        currentTurnName: document.getElementById('current-turn-name'),
        throwPointsText: document.getElementById('throw-points-text'),
        throwNameTag: document.getElementById('throw-name-tag'),
        shellCountsBreakdown: document.getElementById('shell-counts-breakdown'),
        rollBtn: document.getElementById('roll-button'),
        turnGuideText: document.getElementById('turn-guide-text'),
        activeBoardLabel: document.getElementById('active-board-label'),
        activeGotiLabel: document.getElementById('active-goti-label'),
        modalBoardIndicator: document.getElementById('modal-board-indicator'),
        modalGotiIndicator: document.getElementById('modal-goti-indicator'),
        soundToggleBtn: document.getElementById('sound-toggle-btn'),
        rulesBtn: document.getElementById('rules-btn'),
        newGameBtn: document.getElementById('new-game-btn'),
        quickThemeBtn: document.getElementById('quick-theme-btn'),
        openStylesCardBtn: document.getElementById('open-styles-card-btn'),

        // 3D Flippable Shell Containers
        cowrieFlippers: [
          document.getElementById('c0'),
          document.getElementById('c1'),
          document.getElementById('c2'),
          document.getElementById('c3'),
          document.getElementById('c4'),
          document.getElementById('c5')
        ],

        // Styles Modal
        stylesModal: document.getElementById('styles-modal'),
        closeStylesBtn: document.getElementById('close-styles-btn'),
        stylesDoneBtn: document.getElementById('styles-done-btn'),

        // Lobby Modal
        lobbyModal: document.getElementById('lobby-modal'),
        lobbySlots: document.getElementById('lobby-slots'),
        lobbyBackBtn: document.getElementById('lobby-back-btn'),
        lobbyBackText: document.getElementById('lobby-back-text'),
        lobbyCloseBtn: document.getElementById('lobby-close-btn'),
        startMatchBtn: document.getElementById('start-match-btn'),

        // Confirmation Modal
        confirmModal: document.getElementById('confirm-modal'),
        acceptConfirmBtn: document.getElementById('accept-confirm-btn'),
        cancelConfirmBtn: document.getElementById('cancel-confirm-btn'),

        // Rules Modal
        rulesModal: document.getElementById('rules-modal'),
        closeRulesBtn: document.getElementById('close-rules-btn'),
        rulesAckBtn: document.getElementById('rules-ack-btn'),

        // Victory Modal
        victoryModal: document.getElementById('victory-modal'),
        victoryConfettiCanvas: document.getElementById('victory-confetti-canvas'),
        winnerAnnouncement: document.getElementById('winner-announcement'),
        statTurns: document.getElementById('stat-turns'),
        statHome: document.getElementById('stat-home'),
        statKills: document.getElementById('stat-kills'),
        victoryReplayBtn: document.getElementById('victory-replay-btn'),
        victoryExitBtn: document.getElementById('victory-exit-btn')
      };
    },

    /* --------------------------------------------------------------------------
       SYNTHESIZED AUDIO
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

      if (type === 'cowries') {
        for (let i = 0; i < 4; i++) {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(1100 + Math.random() * 600, now + i * 0.08);
          o.frequency.exponentialRampToValueAtTime(300, now + i * 0.08 + 0.05);
          g.gain.setValueAtTime(0.2, now + i * 0.08);
          g.gain.linearRampToValueAtTime(0.01, now + i * 0.08 + 0.05);
          o.start(now + i * 0.08);
          o.stop(now + i * 0.08 + 0.05);
        }
      } else if (type === 'hop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'kill') {
        [600, 450, 300, 150].forEach((freq, idx) => {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.type = 'sawtooth';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.18, now + idx * 0.07);
          g.gain.linearRampToValueAtTime(0.01, now + idx * 0.07 + 0.1);
          o.start(now + idx * 0.07);
          o.stop(now + idx * 0.07 + 0.1);
        });
      } else if (type === 'home') {
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
          g.gain.setValueAtTime(0.25, now + idx * 0.09);
          g.gain.linearRampToValueAtTime(0.01, now + idx * 0.09 + 0.4);
          o.start(now + idx * 0.09);
          o.stop(now + idx * 0.09 + 0.4);
        });
      }
    },

    /* --------------------------------------------------------------------------
       BUILD BOARD (ROYAL CROSS FABRIC)
       -------------------------------------------------------------------------- */
    buildBoard() {
      const svg = `
        <svg class="pachisi-svg-canvas" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <defs>
            <filter id="silk-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.6"/>
            </filter>
          </defs>

          <!-- Group rotated 45 degrees around center (500, 500) -->
          <g transform="rotate(45 500 500)">
            <!-- North Arm -->
            <rect x="410" y="20" width="180" height="390" fill="var(--cloth-primary)" stroke="var(--cloth-line)" stroke-width="3" filter="url(#silk-shadow)"/>
            <rect x="470" y="20" width="60" height="390" fill="var(--cloth-secondary)" stroke="var(--cloth-line)" stroke-width="2"/>

            <!-- South Arm -->
            <rect x="410" y="590" width="180" height="390" fill="var(--cloth-primary)" stroke="var(--cloth-line)" stroke-width="3" filter="url(#silk-shadow)"/>
            <rect x="470" y="590" width="60" height="390" fill="var(--cloth-secondary)" stroke="var(--cloth-line)" stroke-width="2"/>

            <!-- West Arm -->
            <rect x="20" y="410" width="390" height="180" fill="var(--cloth-primary)" stroke="var(--cloth-line)" stroke-width="3" filter="url(#silk-shadow)"/>
            <rect x="20" y="470" width="390" height="60" fill="var(--cloth-secondary)" stroke="var(--cloth-line)" stroke-width="2"/>

            <!-- East Arm -->
            <rect x="590" y="410" width="390" height="180" fill="var(--cloth-primary)" stroke="var(--cloth-line)" stroke-width="3" filter="url(#silk-shadow)"/>
            <rect x="590" y="470" width="390" height="60" fill="var(--cloth-secondary)" stroke="var(--cloth-line)" stroke-width="2"/>

            <!-- Grid Lines for 8 Squares per Arm -->
            ${this.generateArmGridLines()}

            <!-- Central Charkoni -->
            <rect x="410" y="410" width="180" height="180" fill="var(--cloth-secondary)" stroke="var(--cloth-line)" stroke-width="4"/>
            <circle cx="500" cy="500" r="65" fill="none" stroke="var(--cloth-accent)" stroke-width="4" stroke-dasharray="8 6"/>
            <circle cx="500" cy="500" r="35" fill="none" stroke="var(--cloth-accent)" stroke-width="3"/>
            <polygon points="500,450 515,485 550,500 515,515 500,550 485,515 450,500 485,485" fill="none" stroke="var(--cloth-accent)" stroke-width="2.5"/>
          </g>
        </svg>
      `;

      this.dom.pachisiBoard.innerHTML = svg;
      this.updateBoardAndGotiClasses();
    },

    generateArmGridLines() {
      let lines = '';
      for (let i = 1; i <= 8; i++) {
        const yTop = 20 + i * 48.75;
        const yBottom = 590 + (i - 1) * 48.75;
        lines += `<line x1="410" y1="${yTop}" x2="590" y2="${yTop}" stroke="var(--cloth-line)" stroke-width="2"/>`;
        lines += `<line x1="410" y1="${yBottom}" x2="590" y2="${yBottom}" stroke="var(--cloth-line)" stroke-width="2"/>`;
      }

      for (let i = 1; i <= 8; i++) {
        const xLeft = 20 + i * 48.75;
        const xRight = 590 + (i - 1) * 48.75;
        lines += `<line x1="${xLeft}" y1="410" x2="${xLeft}" y2="590" stroke="var(--cloth-line)" stroke-width="2"/>`;
        lines += `<line x1="${xRight}" y1="410" x2="${xRight}" y2="590" stroke="var(--cloth-line)" stroke-width="2"/>`;
      }

      // Safe Sanctuary Castles with 'X' cross marks
      lines += `
        <g stroke="var(--cloth-line)" stroke-width="3">
          <line x1="470" y1="215" x2="530" y2="264"/>
          <line x1="530" y1="215" x2="470" y2="264"/>

          <line x1="470" y1="736" x2="530" y2="785"/>
          <line x1="530" y1="736" x2="470" y2="785"/>

          <line x1="215" y1="470" x2="264" y2="530"/>
          <line x1="264" y1="470" x2="215" y2="530"/>

          <line x1="736" y1="470" x2="785" y2="530"/>
          <line x1="785" y1="470" x2="736" y2="530"/>
        </g>
      `;
      return lines;
    },

    /* --------------------------------------------------------------------------
       ROTATED AFFINE 2D MATRIX COORDINATE MAPPING (PIXEL PERFECT)
       -------------------------------------------------------------------------- */
    transform45(ux, uy) {
      const cos45 = 0.70710678;
      const sin45 = 0.70710678;
      const dx = ux - 500;
      const dy = uy - 500;

      const rx = 500 + (dx * cos45 - dy * sin45);
      const ry = 500 + (dx * sin45 + dy * cos45);

      return {
        x: rx / 10,
        y: ry / 10
      };
    },

    getTileCoords(tileIndex, playerId, pawnIndex) {
      // 1. In Yard / Charkoni (Index -1)
      if (tileIndex === -1) {
        const charkoniCenters = [
          { ux: 500, uy: 535 }, // Player 0 (South)
          { ux: 465, uy: 500 }, // Player 1 (West)
          { ux: 500, uy: 465 }, // Player 2 (North)
          { ux: 535, uy: 500 }  // Player 3 (East)
        ];
        const center = charkoniCenters[playerId] || charkoniCenters[0];
        const subX = (pawnIndex % 2 === 0 ? -14 : 14);
        const subY = (pawnIndex < 2 ? -14 : 14);

        return this.transform45(center.ux + subX, center.uy + subY);
      }

      // 2. Central Charkoni Home Victory Goal (Index >= 84)
      if (tileIndex >= 84) {
        const offsetAngle = (playerId * 90 + pawnIndex * 22) * (Math.PI / 180);
        const ux = 500 + Math.cos(offsetAngle) * 26;
        const uy = 500 + Math.sin(offsetAngle) * 26;
        return this.transform45(ux, uy);
      }

      // 3. Home-Run Path into Charkoni (Tiles 68 to 83)
      if (tileIndex >= 68 && tileIndex < 84) {
        const stepIn = tileIndex - 68; // 0 to 7
        let ux = 500;
        let uy = 500;
        if (playerId === 0) { // South
          ux = 500;
          uy = 955 - stepIn * 44;
        } else if (playerId === 1) { // West
          ux = 44 + stepIn * 44;
          uy = 500;
        } else if (playerId === 2) { // North
          ux = 500;
          uy = 44 + stepIn * 44;
        } else if (playerId === 3) { // East
          ux = 955 - stepIn * 44;
          uy = 500;
        }
        return this.transform45(ux, uy);
      }

      // 4. Perimeter 68-square track navigation:
      const startOffset = playerId * 17;
      const globalTile = (tileIndex + startOffset) % 68;
      const armIndex = Math.floor(globalTile / 17);
      const stepInArm = globalTile % 17;

      let ux = 500;
      let uy = 500;

      if (armIndex === 0) { // South Arm
        if (stepInArm < 8) {
          ux = 440;
          uy = 615 + stepInArm * 44;
        } else if (stepInArm === 8) {
          ux = 500;
          uy = 955;
        } else {
          ux = 560;
          uy = 955 - (stepInArm - 9) * 44;
        }
      } else if (armIndex === 1) { // East Arm
        if (stepInArm < 8) {
          ux = 615 + stepInArm * 44;
          uy = 560;
        } else if (stepInArm === 8) {
          ux = 955;
          uy = 500;
        } else {
          ux = 955 - (stepInArm - 9) * 44;
          uy = 440;
        }
      } else if (armIndex === 2) { // North Arm
        if (stepInArm < 8) {
          ux = 560;
          uy = 385 - stepInArm * 44;
        } else if (stepInArm === 8) {
          ux = 500;
          uy = 44;
        } else {
          ux = 440;
          uy = 44 + (stepInArm - 9) * 44;
        }
      } else if (armIndex === 3) { // West Arm
        if (stepInArm < 8) {
          ux = 385 - stepInArm * 44;
          uy = 440;
        } else if (stepInArm === 8) {
          ux = 44;
          uy = 500;
        } else {
          ux = 44 + (stepInArm - 9) * 44;
          uy = 560;
        }
      }

      return this.transform45(ux, uy);
    },

    /* --------------------------------------------------------------------------
       UPDATE THEMES & GOTI STYLES
       -------------------------------------------------------------------------- */
    updateBoardAndGotiClasses() {
      this.dom.pachisiBoard.className = `pachisi-cloth-board theme-${this.currentBoard}`;
      this.dom.activeBoardLabel.textContent = this.BOARD_NAMES[this.currentBoard];
      this.dom.activeGotiLabel.textContent = this.GOTI_NAMES[this.currentGoti];

      if (this.dom.modalBoardIndicator) this.dom.modalBoardIndicator.textContent = `Active: ${this.BOARD_NAMES[this.currentBoard]}`;
      if (this.dom.modalGotiIndicator) this.dom.modalGotiIndicator.textContent = `Active: ${this.GOTI_NAMES[this.currentGoti]}`;

      document.querySelectorAll('.board-option-card').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.board === this.currentBoard);
      });
      document.querySelectorAll('.goti-option-card').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.goti === this.currentGoti);
      });

      this.renderPawns();
    },

    /* --------------------------------------------------------------------------
       RENDER PAWNS & STANDINGS
       -------------------------------------------------------------------------- */
    renderPawns() {
      this.dom.pawnsLayer.innerHTML = '';

      const tileGroups = {};
      this.players.forEach(p => {
        p.pawns.forEach(pawn => {
          if (pawn.tile !== -1 && !pawn.isHome) {
            const key = `${pawn.tile}`;
            tileGroups[key] = tileGroups[key] || [];
            tileGroups[key].push(pawn);
          }
        });
      });

      this.players.forEach(p => {
        p.pawns.forEach(pawn => {
          const coords = this.getTileCoords(pawn.tile, p.id, pawn.id);

          let subX = 0;
          let subY = 0;
          if (pawn.tile !== -1 && !pawn.isHome) {
            const key = `${pawn.tile}`;
            const group = tileGroups[key] || [];
            if (group.length > 1) {
              const idxInGrp = group.indexOf(pawn);
              subX = (idxInGrp % 2 === 0 ? -7 : 7);
              subY = (idxInGrp < 2 ? -7 : 7);
            }
          }

          const el = document.createElement('div');
          el.className = `pachisi-pawn goti-${this.currentGoti}`;
          el.id = `pawn-${p.id}-${pawn.id}`;
          el.style.setProperty('--pawn-color', p.color);
          el.style.left = `calc(${coords.x}% + ${subX}px)`;
          el.style.top = `calc(${coords.y}% + ${subY}px)`;

          el.innerHTML = `
            <div class="pawn-inner">
              <span class="pawn-num">${pawn.id + 1}</span>
            </div>
          `;

          el.addEventListener('click', () => {
            if (this.waitingForPawnMove && this.currentPlayerIndex === p.id && el.classList.contains('can-move')) {
              this.movePawn(p, pawn, this.currentPoints);
            }
          });

          this.dom.pawnsLayer.appendChild(el);
        });

        const cardStatus = document.getElementById(`p-status-${p.id}`);
        const killStatus = document.getElementById(`p-kill-${p.id}`);
        if (cardStatus) cardStatus.textContent = `${p.pawnsHome}/4 Home`;
        if (killStatus) killStatus.textContent = p.hasKilled ? '✓ Inner Path Unlocked' : '✗ Needs 1 Kill to Enter Home';
      });
    },

    /* --------------------------------------------------------------------------
       COWRIES THROW SYSTEM (3D DUAL-FACED GAVVALU)
       -------------------------------------------------------------------------- */
    executeRoll() {
      if (this.isRolling || this.waitingForPawnMove) return;
      this.isRolling = true;
      this.dom.rollBtn.disabled = true;

      const player = this.players[this.currentPlayerIndex];
      this.playSound('cowries');
      this.dom.throwNameTag.textContent = 'Throwing...';

      this.dom.cowrieFlippers.forEach(flipper => {
        flipper.classList.remove('is-mouth-up', 'is-mouth-down');
        flipper.classList.add('tumbling');
      });

      setTimeout(() => {
        let mouthsUp = 0;
        let backsUp = 0;

        this.dom.cowrieFlippers.forEach(flipper => {
          flipper.classList.remove('tumbling');
          const isUp = Math.random() >= 0.48;

          if (isUp) {
            flipper.classList.add('is-mouth-up');
            mouthsUp++;
          } else {
            flipper.classList.add('is-mouth-down');
            backsUp++;
          }
        });

        this.dom.shellCountsBreakdown.textContent = `${mouthsUp} Mouths Up (బొమ్మ) • ${backsUp} Backs Up (బొరుసు)`;

        // Traditional Pachisi / Chaupar scoring:
        // 1 Mouth Up: 10 pts + Extra Turn
        // 2, 3, 4 Mouths Up: 2, 3, 4 pts
        // 5 Mouths Up: 25 pts (Pachisi!) + Extra Turn
        // 6 Mouths Up: 12 pts (Barah) + Extra Turn
        // 0 Mouths Up: 6 pts (Chakka) + Extra Turn
        let points = 0;
        let bonusTurn = false;
        let rollName = '';

        if (mouthsUp === 1) {
          points = 10;
          bonusTurn = true;
          rollName = '10 (Pau) + Extra Throw!';
        } else if (mouthsUp === 2) {
          points = 2;
          rollName = '2 Points';
        } else if (mouthsUp === 3) {
          points = 3;
          rollName = '3 Points';
        } else if (mouthsUp === 4) {
          points = 4;
          rollName = '4 Points';
        } else if (mouthsUp === 5) {
          points = 25;
          bonusTurn = true;
          rollName = '25 (PACHISI) + Extra Throw!';
        } else if (mouthsUp === 6) {
          points = 12;
          bonusTurn = true;
          rollName = '12 (Barah) + Extra Throw!';
        } else if (mouthsUp === 0) {
          points = 6;
          bonusTurn = true;
          rollName = '6 (Chakka) + Extra Throw!';
        }

        this.currentPoints = points;
        this.hasExtraTurn = bonusTurn;
        this.dom.throwPointsText.textContent = points;
        this.dom.throwNameTag.textContent = rollName;

        this.isRolling = false;
        this.resolvePostRoll(player, points);
      }, 700);
    },

    resolvePostRoll(player, points) {
      // Find all pawns that can execute a valid move:
      // - Already active on the board: tile + points <= 84
      // - In the Charkoni: can enter on any bonus throw (6, 10, 12, or 25)
      const canEnterFromYard = (points === 6 || points === 10 || points === 12 || points === 25);

      const movablePawns = player.pawns.filter(p => {
        if (p.isHome) return false;
        if (p.tile === -1) {
          return canEnterFromYard;
        }
        return (p.tile + points <= 84);
      });

      if (movablePawns.length === 0) {
        this.dom.turnGuideText.textContent = `No valid moves for ${points} points.`;
        setTimeout(() => this.endTurn(), 1000);
        return;
      }

      if (player.isBot) {
        this.dom.turnGuideText.textContent = `${player.name} is moving a goti...`;
        setTimeout(() => {
          const chosen = this.pickBestBotPawn(movablePawns, points);
          this.movePawn(player, chosen, points);
        }, 750);
      } else {
        this.waitingForPawnMove = true;
        this.dom.turnGuideText.textContent = `Tap your glowing goti to advance ${points} steps!`;
        this.highlightMovablePawns(movablePawns);
      }
    },

    highlightMovablePawns(pawns) {
      document.querySelectorAll('.pachisi-pawn').forEach(el => el.classList.remove('can-move'));
      pawns.forEach(p => {
        const el = document.getElementById(`pawn-${p.playerId}-${p.id}`);
        if (el) el.classList.add('can-move');
      });
    },

    movePawn(player, pawn, steps) {
      this.waitingForPawnMove = false;
      document.querySelectorAll('.pachisi-pawn').forEach(el => el.classList.remove('can-move'));

      // If entering fresh from Charkoni
      if (pawn.tile === -1) {
        pawn.tile = 0;
        this.playSound('hop');
        this.renderPawns();
        this.checkTileOutcome(player, pawn);
        return;
      }

      this.stepAnimatePawn(player, pawn, steps, () => {
        this.checkTileOutcome(player, pawn);
      });
    },

    stepAnimatePawn(player, pawn, stepsLeft, onComplete) {
      if (stepsLeft <= 0) {
        onComplete();
        return;
      }

      pawn.tile++;
      this.playSound('hop');
      this.renderPawns();

      setTimeout(() => {
        this.stepAnimatePawn(player, pawn, stepsLeft - 1, onComplete);
      }, 150);
    },

    checkTileOutcome(player, pawn) {
      // 1. Reached Final Goal inside Charkoni
      if (pawn.tile >= 84) {
        pawn.isHome = true;
        player.pawnsHome++;
        this.playSound('home');
        this.dom.turnGuideText.textContent = `🎉 ${player.name}'s goti reached Home!`;

        if (player.pawnsHome >= 4) {
          this.handleVictory(player);
          return;
        }

        this.endTurn();
        return;
      }

      // 2. Check for Capture (Cut opponent if not on sanctuary)
      const isSafe = this.SAFE_SQUARES.includes(pawn.tile);
      if (!isSafe) {
        this.players.forEach(otherPlayer => {
          if (otherPlayer.id !== player.id) {
            otherPlayer.pawns.forEach(otherPawn => {
              if (otherPawn.tile === pawn.tile && !otherPawn.isHome && otherPawn.tile !== -1) {
                otherPawn.tile = -1;
                player.kills++;
                player.hasKilled = true;
                this.hasExtraTurn = true;
                this.playSound('kill');
                this.dom.turnGuideText.textContent = `⚔️ ${player.name} cut ${otherPlayer.name}'s goti! Extra throw awarded!`;
              }
            });
          }
        });
      }

      this.renderPawns();
      this.endTurn();
    },

    endTurn() {
      if (this.hasExtraTurn) {
        this.dom.turnGuideText.textContent = `Bonus throw for ${this.players[this.currentPlayerIndex].name}!`;
        this.dom.rollBtn.disabled = false;
        if (this.players[this.currentPlayerIndex].isBot) {
          setTimeout(() => this.executeRoll(), 800);
        }
        return;
      }

      this.totalTurns++;
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.updateActiveTurnUI();

      if (this.players[this.currentPlayerIndex].isBot) {
        setTimeout(() => this.executeRoll(), 850);
      }
    },

    pickBestBotPawn(movablePawns, points) {
      // 1. Prioritize capturing an opponent
      for (const p of movablePawns) {
        const dest = (p.tile === -1) ? 0 : p.tile + points;
        if (!this.SAFE_SQUARES.includes(dest)) {
          for (const opp of this.players) {
            if (opp.id !== this.currentPlayerIndex) {
              if (opp.pawns.some(op => op.tile === dest && !op.isHome)) return p;
            }
          }
        }
      }

      // 2. Prioritize entering a new pawn if board has few active pieces
      const yardPawn = movablePawns.find(p => p.tile === -1);
      if (yardPawn && Math.random() > 0.4) return yardPawn;

      // 3. Move the most advanced goti towards Home
      return movablePawns.sort((a, b) => b.tile - a.tile)[0];
    },

    updateActiveTurnUI() {
      const active = this.players[this.currentPlayerIndex];
      this.dom.currentTurnName.textContent = active.name;
      this.dom.currentTurnName.style.color = active.color;

      document.querySelectorAll('.player-card').forEach((card, idx) => {
        card.classList.toggle('active-turn', idx === this.currentPlayerIndex);
      });

      this.dom.throwPointsText.textContent = '-';
      this.dom.throwNameTag.textContent = 'Roll Cowries';

      if (active.isBot) {
        this.dom.turnGuideText.textContent = `${active.name} is calculating their throw...`;
        this.dom.rollBtn.disabled = true;
      } else {
        this.dom.turnGuideText.textContent = 'Your turn! Tap Throw Cowries or hit Space.';
        this.dom.rollBtn.disabled = false;
      }
    },

    /* --------------------------------------------------------------------------
       VICTORY CELEBRATION
       -------------------------------------------------------------------------- */
    handleVictory(winner) {
      this.matchInProgress = false;
      this.playSound('win');

      this.dom.winnerAnnouncement.textContent = `${winner.name} crowned Champion of Pachisi!`;
      this.dom.statTurns.textContent = this.totalTurns;
      this.dom.statHome.textContent = `${winner.pawnsHome} / 4`;
      this.dom.statKills.textContent = winner.kills;

      setTimeout(() => {
        this.dom.victoryModal.classList.remove('hidden');
        this.startCelebrationConfetti();
      }, 500);
    },

    startCelebrationConfetti() {
      const canvas = this.dom.victoryConfettiCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      this.isCelebrating = true;
      this.confettiParticles = [];
      const colors = ['#facc15', '#e11d74', '#1d2b7b', '#10b981', '#ef4444', '#f59e0b', '#ffffff'];

      for (let i = 0; i < 140; i++) {
        this.confettiParticles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.4 - canvas.height * 0.2,
          w: Math.random() * 8 + 5,
          h: Math.random() * 12 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: Math.random() * 4 - 2,
          vy: Math.random() * 3 + 2.5,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 8 - 4,
          oscillation: Math.random() * 0.1
        });
      }

      const animate = () => {
        if (!this.isCelebrating) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.confettiParticles.forEach(p => {
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
        });

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
       LOBBY & MODAL HANDLERS
       -------------------------------------------------------------------------- */
    openStylesModal() {
      this.updateBoardAndGotiClasses();
      this.dom.stylesModal.classList.remove('hidden');
    },

    closeStylesModal() {
      this.dom.stylesModal.classList.add('hidden');
    },

    openLobby(showBackOption = false) {
      if (showBackOption && this.matchInProgress) {
        this.dom.lobbyBackText.textContent = 'Back to Game';
      } else {
        this.dom.lobbyBackText.textContent = 'Back to Game Zone';
      }
      this.dom.lobbyModal.classList.remove('hidden');
    },

    closeLobby() {
      this.dom.lobbyModal.classList.add('hidden');
    },

    renderLobbySlots(count) {
      let html = '';
      for (let i = 0; i < count; i++) {
        const cfg = this.PLAYER_CONFIGS[i];
        const isBot = (i > 0);
        html += `
          <div class="lobby-row" data-index="${i}">
            <div class="lobby-color-indicator" style="background:${cfg.color}"></div>
            <input type="text" class="lobby-name-input" value="${cfg.name}" placeholder="Player ${i + 1} Name"/>
            <button type="button" class="lobby-bot-toggle ${isBot ? 'active' : ''}">
              <i class="fa-solid fa-robot"></i> ${isBot ? 'Bot' : 'Human'}
            </button>
          </div>
        `;
      }
      this.dom.lobbySlots.innerHTML = html;

      this.dom.lobbySlots.querySelectorAll('.lobby-bot-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('active');
          const isNowBot = btn.classList.contains('active');
          btn.innerHTML = `<i class="fa-solid fa-robot"></i> ${isNowBot ? 'Bot' : 'Human'}`;
        });
      });
    },

    startMatch() {
      const rows = this.dom.lobbySlots.querySelectorAll('.lobby-row');
      this.players = [];

      rows.forEach((row, i) => {
        const cfg = this.PLAYER_CONFIGS[i];
        const nameInput = row.querySelector('.lobby-name-input');
        const isBot = row.querySelector('.lobby-bot-toggle').classList.contains('active');

        this.players.push({
          id: i,
          name: nameInput.value.trim() || cfg.name,
          color: cfg.color,
          icon: cfg.icon,
          isBot: isBot,
          kills: 0,
          pawnsHome: 0,
          hasKilled: false,
          pawns: [
            // Pawn 0 starts directly on the track (tile: 0) for instant playability!
            { id: 0, playerId: i, tile: 0, isHome: false },
            { id: 1, playerId: i, tile: -1, isHome: false },
            { id: 2, playerId: i, tile: -1, isHome: false },
            { id: 3, playerId: i, tile: -1, isHome: false }
          ]
        });
      });

      this.currentPlayerIndex = 0;
      this.totalTurns = 0;
      this.isRolling = false;
      this.waitingForPawnMove = false;
      this.matchInProgress = true;

      this.dom.cowrieFlippers.forEach((flipper, idx) => {
        flipper.className = `cowrie-flipper-3d ${idx % 2 === 0 ? 'is-mouth-up' : 'is-mouth-down'}`;
      });
      this.dom.shellCountsBreakdown.textContent = '3 Mouths Up • 3 Backs Up';

      this.stopCelebrationConfetti();
      this.closeLobby();
      this.renderPlayerRoster();
      this.renderPawns();
      this.updateActiveTurnUI();

      if (this.players[0].isBot) {
        setTimeout(() => this.executeRoll(), 900);
      }
    },

    renderPlayerRoster() {
      this.dom.playerCountBadge.textContent = `${this.players.length} Players`;
      let html = '';
      this.players.forEach(p => {
        html += `
          <div id="player-card-${p.id}" class="player-card" style="--player-theme:${p.color};">
            <div class="p-avatar">
              <i class="fa-solid ${p.icon}"></i>
              ${p.isBot ? '<span class="bot-tag">BOT</span>' : ''}
            </div>
            <div class="p-meta">
              <div class="p-name-row">
                <span class="p-name">${p.name}</span>
                <span class="p-pawns-status" id="p-status-${p.id}">0/4 Home</span>
              </div>
              <span class="p-kill-status" id="p-kill-${p.id}">✗ Needs 1 Kill to Enter Home</span>
            </div>
          </div>
        `;
      });
      this.dom.playersList.innerHTML = html;
    },

    /* --------------------------------------------------------------------------
       EVENT LISTENERS
       -------------------------------------------------------------------------- */
    bindEvents() {
      // Styles Modal Triggers
      this.dom.quickThemeBtn.addEventListener('click', () => this.openStylesModal());
      if (this.dom.openStylesCardBtn) {
        this.dom.openStylesCardBtn.addEventListener('click', () => this.openStylesModal());
      }
      this.dom.closeStylesBtn.addEventListener('click', () => this.closeStylesModal());
      this.dom.stylesDoneBtn.addEventListener('click', () => this.closeStylesModal());

      // Live Board Switch
      document.querySelectorAll('.board-option-card').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentBoard = btn.dataset.board;
          this.updateBoardAndGotiClasses();
          this.playSound('hop');
        });
      });

      // Live Goti Switch
      document.querySelectorAll('.goti-option-card').forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentGoti = btn.dataset.goti;
          this.updateBoardAndGotiClasses();
          this.playSound('hop');
        });
      });

      // Throw Button
      this.dom.rollBtn.addEventListener('click', () => {
        const player = this.players[this.currentPlayerIndex];
        if (!player.isBot) this.executeRoll();
      });

      // Spacebar
      window.addEventListener('keydown', (e) => {
        const modalsOpen = !this.dom.lobbyModal.classList.contains('hidden') ||
                           !this.dom.confirmModal.classList.contains('hidden') ||
                           !this.dom.rulesModal.classList.contains('hidden') ||
                           !this.dom.stylesModal.classList.contains('hidden') ||
                           !this.dom.victoryModal.classList.contains('hidden');

        if (e.code === 'Space' && !this.dom.rollBtn.disabled && !modalsOpen) {
          const player = this.players[this.currentPlayerIndex];
          if (player && !player.isBot) {
            e.preventDefault();
            this.executeRoll();
          }
        }
      });

      // Player Count in Lobby
      document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderLobbySlots(parseInt(btn.dataset.count, 10));
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

      this.dom.acceptConfirmBtn.addEventListener('click', () => {
        this.dom.confirmModal.classList.add('hidden');
        this.openLobby(true);
      });

      this.dom.cancelConfirmBtn.addEventListener('click', () => {
        this.dom.confirmModal.classList.add('hidden');
      });

      this.dom.lobbyBackBtn.addEventListener('click', () => {
        if (this.matchInProgress) {
          this.closeLobby();
        } else {
          window.location.href = '../../index.html';
        }
      });

      this.dom.lobbyCloseBtn.addEventListener('click', () => {
        this.closeLobby();
      });

      this.dom.startMatchBtn.addEventListener('click', () => this.startMatch());

      this.dom.victoryReplayBtn.addEventListener('click', () => {
        this.stopCelebrationConfetti();
        this.dom.victoryModal.classList.add('hidden');
        this.openLobby(false);
      });

      this.dom.victoryExitBtn.addEventListener('click', () => {
        this.stopCelebrationConfetti();
        window.location.href = '../../index.html';
      });

      this.dom.rulesBtn.addEventListener('click', () => this.dom.rulesModal.classList.remove('hidden'));
      this.dom.closeRulesBtn.addEventListener('click', () => this.dom.rulesModal.classList.add('hidden'));
      this.dom.rulesAckBtn.addEventListener('click', () => this.dom.rulesModal.classList.add('hidden'));

      this.dom.soundToggleBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        this.dom.soundToggleBtn.innerHTML = this.soundEnabled
          ? '<i class="fa-solid fa-volume-high"></i>'
          : '<i class="fa-solid fa-volume-xmark"></i>';
      });
    }
  };

  window.Pachisi = Pachisi;

  window.addEventListener('DOMContentLoaded', () => {
    window.Pachisi.init();
  });
})();