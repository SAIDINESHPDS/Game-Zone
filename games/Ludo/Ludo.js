/* =========================================================================
   LUDO.JS - ARCHITECTURE: Multi-Bot Engine, 6 Players, Restart Modal & Sound
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     SYNTHESIZED AUDIO ENGINE (Zero external dependencies)
     --------------------------------------------------------- */
  const SoundFX = {
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },
    play(freq, type = 'sine', duration = 0.1) {
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (_) {}
    },
    roll() {
      this.play(340, 'triangle', 0.12);
      setTimeout(() => this.play(460, 'sine', 0.08), 80);
      setTimeout(() => this.play(580, 'triangle', 0.1), 160);
    },
    move() { this.play(540, 'sine', 0.08); },

    // PUNCHY MULTI-STAGE KNOCKOUT / KILL SOUND
    capture() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Stage 1: Heavy punch impact
        const punchOsc = this.ctx.createOscillator();
        const punchGain = this.ctx.createGain();
        punchOsc.type = 'sawtooth';
        punchOsc.frequency.setValueAtTime(320, now);
        punchOsc.frequency.exponentialRampToValueAtTime(50, now + 0.18);

        punchGain.gain.setValueAtTime(0.35, now);
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        punchOsc.connect(punchGain);
        punchGain.connect(this.ctx.destination);
        punchOsc.start(now);
        punchOsc.stop(now + 0.18);

        // Stage 2: Descending retro defeat whistle
        const whistleOsc = this.ctx.createOscillator();
        const whistleGain = this.ctx.createGain();
        whistleOsc.type = 'triangle';
        whistleOsc.frequency.setValueAtTime(700, now + 0.06);
        whistleOsc.frequency.exponentialRampToValueAtTime(110, now + 0.38);

        whistleGain.gain.setValueAtTime(0.22, now + 0.06);
        whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        whistleOsc.connect(whistleGain);
        whistleGain.connect(this.ctx.destination);
        whistleOsc.start(now + 0.06);
        whistleOsc.stop(now + 0.38);
      } catch (_) {}
    },

    win() { this.play(760, 'square', 0.4); }
  };

  // Clockwise 52-tile Perimeter Track Coordinates
  const TRACK_COORDS = [
    { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
    { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
    { r: 0, c: 7 },
    { r: 0, c: 8 }, { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
    { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
    { r: 7, c: 14 },
    { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
    { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
    { r: 14, c: 7 },
    { r: 14, c: 6 }, { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
    { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
    { r: 7, c: 0 },
    { r: 6, c: 0 }
  ];

  const RUNWAY_COORDS = [
    [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }],
    [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }],
    [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }],
    [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }]
  ];

  const SAFE_POSITIONS = [8, 21, 34, 47];

  // 6 Available Colors
  const COLOR_DEFINITIONS = {
    red:    { name: 'Red', letter: 'R', hex: '#dc2626' },
    green:  { name: 'Green', letter: 'G', hex: '#15803d' },
    yellow: { name: 'Yellow', letter: 'Y', hex: '#eab308' },
    orange: { name: 'Orange', letter: 'O', hex: '#ea580c' },
    blue:   { name: 'Blue', letter: 'B', hex: '#1d4ed8' },
    purple: { name: 'Purple', letter: 'P', hex: '#7e22ce' }
  };

  const SLOT_CONFIGS = [
    { startIndex: 0, endTrackIndex: 51 },
    { startIndex: 13, endTrackIndex: 11 },
    { startIndex: 26, endTrackIndex: 24 },
    { startIndex: 39, endTrackIndex: 37 },
    { startIndex: 26, endTrackIndex: 24 },
    { startIndex: 0, endTrackIndex: 51 }
  ];

  /* ---------------------------------------------------------
     LOBBY STATE (Setup Screen)
     --------------------------------------------------------- */
  const LobbyState = {
    playerCount: 4, // 1 to 6
    coinStyle: 'pawn', // 'pawn', 'crown', 'star'
    botDifficulty: 'hard',
    seatNames: { 0: 'Player 1', 1: 'Player 2', 2: 'Player 3', 3: 'Player 4', 4: 'Player 5', 5: 'Player 6' },
    seatColors: { 0: 'red', 1: 'green', 2: 'yellow', 3: 'blue', 4: 'orange', 5: 'purple' },
    seatRoles: { 0: 'human', 1: 'human', 2: 'human', 3: 'human', 4: 'human', 5: 'human' }
  };

  /* ---------------------------------------------------------
     ACTIVE MATCH STATE
     --------------------------------------------------------- */
  const GameState = {
    slotColors: ['red', 'green', 'yellow', 'blue', 'orange', 'purple'],
    activeSlots: [0, 1, 2, 3],
    exitedSlots: new Set(),
    seatNames: {},
    seatRoles: {},
    coinStyle: 'pawn',
    botDifficulty: 'hard',
    currentTurnSlot: 0,
    diceValue: null,
    hasRolled: false,
    isMoving: false,
    pendingExitSlot: null,
    tokens: {},

    isBot(slot) {
      return this.seatRoles[slot] === 'bot';
    }
  };

  /* ---------------------------------------------------------
     RENDER ENGINE (Clean Homes, Fixed Stars, Clean Center)
     --------------------------------------------------------- */
  const RenderEngine = {
    buildBoard() {
      const board = document.getElementById('ludo-board');
      board.innerHTML = '';

      // 1. Home Bases - Clean porcelain pedestals
      for (let slot = 0; slot < 4; slot++) {
        const colorKey = GameState.slotColors[slot];

        const homeZone = document.createElement('div');
        homeZone.className = `home-zone slot-${slot} color-${colorKey}`;

        const inner = document.createElement('div');
        inner.className = 'inner-home-square';

        for (let i = 0; i < 4; i++) {
          const pocket = document.createElement('div');
          pocket.className = 'token-pocket';
          pocket.id = `pocket-${slot}-${i}`;
          inner.appendChild(pocket);
        }

        homeZone.appendChild(inner);
        board.appendChild(homeZone);
      }

      // 2. Center Finish Area - Clean triangles without dashed pocket marks
      const centerZone = document.createElement('div');
      centerZone.className = 'center-finish-zone';
      centerZone.id = 'center-finish';
      centerZone.innerHTML = `
        <div class="triangle tri-left color-${GameState.slotColors[0]}"></div>
        <div class="triangle tri-top color-${GameState.slotColors[1]}"></div>
        <div class="triangle tri-right color-${GameState.slotColors[2]}"></div>
        <div class="triangle tri-bottom color-${GameState.slotColors[3]}"></div>

        <div class="finish-cluster cluster-0" id="finish-cluster-0"></div>
        <div class="finish-cluster cluster-1" id="finish-cluster-1"></div>
        <div class="finish-cluster cluster-2" id="finish-cluster-2"></div>
        <div class="finish-cluster cluster-3" id="finish-cluster-3"></div>
      `;
      board.appendChild(centerZone);

      // 3. Playable Track Cells
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          const isBase0 = r < 6 && c < 6;
          const isBase1 = r < 6 && c >= 9;
          const isBase3 = r >= 9 && c < 6;
          const isBase2 = r >= 9 && c >= 9;
          const isCenter = (r >= 6 && r <= 8) && (c >= 6 && c <= 8);

          if (isBase0 || isBase1 || isBase2 || isBase3 || isCenter) continue;

          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.r = r;
          cell.dataset.c = c;
          cell.style.gridRow = `${r + 1}`;
          cell.style.gridColumn = `${c + 1}`;

          // Colored Start cells
          if (r === 6 && c === 1) cell.classList.add(`color-${GameState.slotColors[0]}`, 'start-cell');
          if (r === 1 && c === 8) cell.classList.add(`color-${GameState.slotColors[1]}`, 'start-cell');
          if (r === 8 && c === 13) cell.classList.add(`color-${GameState.slotColors[2]}`, 'start-cell');
          if (r === 13 && c === 6) cell.classList.add(`color-${GameState.slotColors[3]}`, 'start-cell');

          // Colored Runway cells
          if (r === 7 && c >= 1 && c <= 5) cell.classList.add(`color-${GameState.slotColors[0]}`);
          if (c === 7 && r >= 1 && r <= 5) cell.classList.add(`color-${GameState.slotColors[1]}`);
          if (r === 7 && c >= 9 && c <= 13) cell.classList.add(`color-${GameState.slotColors[2]}`);
          if (c === 7 && r >= 9 && r <= 13) cell.classList.add(`color-${GameState.slotColors[3]}`);

          // Alt+9885 (⚝) Fixed Safe Star
          const trackIdx = TRACK_COORDS.findIndex(coord => coord.r === r && coord.c === c);
          if (trackIdx !== -1 && SAFE_POSITIONS.includes(trackIdx)) {
            cell.classList.add('star-cell');
          }

          board.appendChild(cell);
        }
      }
    },

    renderTokens() {
      // Clear all existing tokens and empty stacks for fresh layout
      document.querySelectorAll('.token').forEach(t => t.remove());
      document.querySelectorAll('.tokens-stack').forEach(s => s.remove());

      GameState.activeSlots.forEach(slot => {
        if (GameState.exitedSlots.has(slot)) return;

        const colorKey = GameState.slotColors[slot];
        const styleClass = `token-style-${GameState.coinStyle}`;
        const baseSlot = slot % 4;

        GameState.tokens[slot].forEach(token => {
          const el = document.createElement('div');
          el.className = `token ${styleClass} ${colorKey}-piece`;
          el.dataset.slot = slot;
          el.dataset.tokenId = token.id;
          el.onclick = (e) => {
            e.stopPropagation();
            GameEngine.onTokenClick(slot, token.id);
          };

          if (token.state === 'home') {
            const pocket = document.getElementById(`pocket-${baseSlot}-${token.id}`);
            if (pocket) pocket.appendChild(el);
          } else if (token.state === 'track') {
            const coords = TRACK_COORDS[token.step];
            this.placeToken(el, coords.r, coords.c);
          } else if (token.state === 'runway') {
            const coords = RUNWAY_COORDS[baseSlot][token.step];
            this.placeToken(el, coords.r, coords.c);
          } else if (token.state === 'finish') {
            const finishCluster = document.getElementById(`finish-cluster-${baseSlot}`);
            if (finishCluster) finishCluster.appendChild(el);
          }
        });
      });

      this.highlightMovableTokens();
    },

    placeToken(tokenEl, r, c) {
      const cell = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
      if (!cell) return;

      let stack = cell.querySelector('.tokens-stack');
      if (!stack) {
        stack = document.createElement('div');
        stack.className = 'tokens-stack';
        cell.appendChild(stack);
      }
      stack.appendChild(tokenEl);
    },

    highlightMovableTokens() {
      document.querySelectorAll('.token').forEach(t => t.classList.remove('highlight-move'));
      if (!GameState.hasRolled || GameState.diceValue === null) return;
      if (GameState.exitedSlots.has(GameState.currentTurnSlot)) return;

      const movable = GameEngine.getMovableTokens(GameState.currentTurnSlot, GameState.diceValue);
      movable.forEach(id => {
        const el = document.querySelector(`.token[data-slot="${GameState.currentTurnSlot}"][data-tokenId="${id}"]`);
        if (el) el.classList.add('highlight-move');
      });
    },

    updateTurnUI() {
      const currentSlot = GameState.currentTurnSlot;
      const def = COLOR_DEFINITIONS[GameState.slotColors[currentSlot]];
      const isBot = GameState.isBot(currentSlot);
      const name = GameState.seatNames[currentSlot] || `Player ${currentSlot + 1}`;

      for (let s = 0; s < 6; s++) {
        const prof = document.getElementById(`profile-slot-${s}`);
        if (prof) {
          if (s === currentSlot && !GameState.exitedSlots.has(s)) {
            prof.classList.add('active-turn');
          } else {
            prof.classList.remove('active-turn');
          }
        }
      }

      const ann = document.getElementById('turn-announcer');
      if (ann) {
        ann.innerText = isBot
          ? `${name} (Bot) is rolling...`
          : `${name}'s Turn - Click your 3D dice!`;
      }
    },

    updateScores() {
      GameState.activeSlots.forEach(slot => {
        const scoreEl = document.getElementById(`score-slot-${slot}`);
        if (!scoreEl) return;
        if (GameState.exitedSlots.has(slot)) {
          scoreEl.innerText = 'Exited';
          return;
        }
        const finished = GameState.tokens[slot].filter(t => t.state === 'finish').length;
        scoreEl.innerText = `${finished}/4 Home`;
      });
    },

    updateProfiles() {
      for (let s = 0; s < 6; s++) {
        const prof = document.getElementById(`profile-slot-${s}`);
        const nameEl = document.getElementById(`name-slot-${s}`);
        const avatarEl = document.getElementById(`avatar-slot-${s}`);
        const boxBadge = document.getElementById(`box-badge-slot-${s}`);
        const exitBtn = document.getElementById(`exit-btn-${s}`);

        const colorKey = GameState.slotColors[s] || 'red';
        const def = COLOR_DEFINITIONS[colorKey];
        const isBot = GameState.isBot(s);
        const isExited = GameState.exitedSlots.has(s);
        const isActive = GameState.activeSlots.includes(s);

        if (prof) {
          prof.style.display = isActive ? 'flex' : 'none';
          prof.style.opacity = isActive && !isExited ? '1' : '0.2';
          prof.style.pointerEvents = isActive && !isExited ? 'auto' : 'none';

          if (isExited) prof.classList.add('player-exited');
          else prof.classList.remove('player-exited');
        }

        if (avatarEl) {
          avatarEl.innerText = isBot ? '🤖' : (s === 0 ? '🧑' : '👤');
        }

        if (boxBadge) {
          boxBadge.innerText = def.letter;
          boxBadge.style.backgroundColor = def.hex;
        }

        if (nameEl) {
          const customName = GameState.seatNames[s] || (s === 0 ? 'Player 1' : `Player ${s + 1}`);
          nameEl.innerText = isBot ? `${customName} (Bot)` : customName;
          nameEl.style.color = def.hex;
        }

        // BOTS CANNOT BE REMOVED/EXITED DURING PLAY
        if (exitBtn) {
          if (isActive && !isExited && !isBot) {
            exitBtn.style.display = 'inline-block';
          } else {
            exitBtn.style.display = 'none';
          }
        }
      }

      const modeBadge = document.getElementById('hud-mode-badge');
      const diffBadge = document.getElementById('hud-diff-badge');

      if (modeBadge) {
        modeBadge.innerText = `${GameState.activeSlots.length} Players`;
      }

      const hasBots = GameState.activeSlots.some(s => GameState.isBot(s));
      if (diffBadge) {
        if (hasBots && GameState.activeSlots.length <= 2) {
          diffBadge.style.display = 'inline-block';
          diffBadge.innerText = `${GameState.botDifficulty.toUpperCase()} Bot`;
        } else {
          diffBadge.style.display = 'none';
        }
      }
    }
  };

  /* ---------------------------------------------------------
     GAME LOGIC & 3D DICE ANIMATION ENGINE
     --------------------------------------------------------- */
  const GameEngine = {
    rollDice() {
      if (GameState.isMoving || GameState.hasRolled) return;
      if (GameState.exitedSlots.has(GameState.currentTurnSlot)) {
        this.nextTurn();
        return;
      }

      SoundFX.roll();
      const currentSlot = GameState.currentTurnSlot;
      const cubeEl = document.getElementById(`dice-cube-${currentSlot}`);
      const shadowEl = document.getElementById(`dice-shadow-${currentSlot}`);

      if (cubeEl) cubeEl.classList.add('rolling-3d');
      if (shadowEl) shadowEl.classList.add('rolling-shadow');

      setTimeout(() => {
        GameState.diceValue = Math.floor(Math.random() * 6) + 1;

        if (cubeEl) {
          cubeEl.classList.remove('rolling-3d');
          for (let i = 1; i <= 6; i++) cubeEl.classList.remove(`show-${i}`);
          cubeEl.classList.add(`show-${GameState.diceValue}`);
        }
        if (shadowEl) shadowEl.classList.remove('rolling-shadow');

        GameState.hasRolled = true;
        const name = GameState.seatNames[currentSlot] || `Player ${currentSlot + 1}`;
        const isBot = GameState.isBot(currentSlot);
        const ann = document.getElementById('turn-announcer');
        ann.innerText = `${name} ${isBot ? '(Bot)' : ''} rolled a ${GameState.diceValue}!`;

        const movable = this.getMovableTokens(currentSlot, GameState.diceValue);

        if (movable.length === 0) {
          ann.innerText = `${name} rolled ${GameState.diceValue}. No moves available!`;
          setTimeout(() => this.nextTurn(), 1000);
        } else {
          RenderEngine.highlightMovableTokens();
          if (isBot) {
            setTimeout(() => this.botMove(currentSlot, movable), 650);
          } else if (movable.length === 1 && GameState.tokens[currentSlot][movable[0]].state === 'home' && GameState.diceValue === 6) {
            setTimeout(() => this.onTokenClick(currentSlot, movable[0]), 300);
          }
        }
      }, 550);
    },

    getMovableTokens(slot, roll) {
      if (GameState.exitedSlots.has(slot)) return [];
      const tokens = GameState.tokens[slot];
      const valid = [];
      tokens.forEach((t) => {
        if (t.state === 'home') {
          if (roll === 6) valid.push(t.id);
        } else if (t.state === 'track') {
          valid.push(t.id);
        } else if (t.state === 'runway') {
          if (t.step + roll <= 5) valid.push(t.id);
        }
      });
      return valid;
    },

    onTokenClick(slot, tokenId) {
      if (!GameState.hasRolled || GameState.isMoving) return;
      if (slot !== GameState.currentTurnSlot) return;
      if (GameState.exitedSlots.has(slot)) return;

      const movable = this.getMovableTokens(GameState.currentTurnSlot, GameState.diceValue);
      if (!movable.includes(tokenId)) return;

      this.moveToken(slot, tokenId, GameState.diceValue);
    },

    moveToken(slot, tokenId, steps) {
      GameState.isMoving = true;
      SoundFX.move();
      const token = GameState.tokens[slot][tokenId];
      const baseSlot = slot % 4;
      const config = SLOT_CONFIGS[baseSlot];

      if (token.state === 'home') {
        token.state = 'track';
        token.step = config.startIndex;
        this.finishMove(slot, true);
        return;
      }

      let stepsLeft = steps;
      const interval = setInterval(() => {
        if (stepsLeft <= 0) {
          clearInterval(interval);
          this.evaluateLanding(slot, token);
          return;
        }

        if (token.state === 'track') {
          if (token.step === config.endTrackIndex) {
            token.state = 'runway';
            token.step = 0;
          } else {
            token.step = (token.step + 1) % 52;
          }
        } else if (token.state === 'runway') {
          if (token.step + 1 >= 5) {
            token.state = 'finish';
            token.step = 5;
            stepsLeft = 0;
            clearInterval(interval);
            this.evaluateLanding(slot, token);
            return;
          } else {
            token.step += 1;
          }
        }

        SoundFX.move();
        stepsLeft--;
        RenderEngine.renderTokens();
      }, 110);
    },

    evaluateLanding(slot, token) {
      let getsBonus = (GameState.diceValue === 6);

      // Capture opponent token (PLAYS SATISFYING KNOCKOUT SOUND)
      if (token.state === 'track' && !SAFE_POSITIONS.includes(token.step)) {
        GameState.activeSlots.forEach(otherSlot => {
          if (otherSlot !== slot && !GameState.exitedSlots.has(otherSlot)) {
            GameState.tokens[otherSlot].forEach(otherToken => {
              if (otherToken.state === 'track' && otherToken.step === token.step) {
                otherToken.state = 'home';
                otherToken.step = -1;
                
                SoundFX.capture();
                
                getsBonus = true;
                const killerName = GameState.seatNames[slot] || `Player ${slot + 1}`;
                const victimName = GameState.seatNames[otherSlot] || `Player ${otherSlot + 1}`;
                document.getElementById('turn-announcer').innerText = `💥 ${killerName} knocked out ${victimName}'s coin! Extra roll!`;
              }
            });
          }
        });
      }

      if (token.state === 'finish') {
        SoundFX.win();
        getsBonus = true;
      }

      RenderEngine.renderTokens();
      RenderEngine.updateScores();

      const allFinished = GameState.tokens[slot].every(t => t.state === 'finish');
      if (allFinished) {
        this.declareWinner(slot);
        return;
      }

      this.finishMove(slot, getsBonus);
    },

    finishMove(slot, getsBonus) {
      RenderEngine.renderTokens();
      GameState.isMoving = false;
      GameState.hasRolled = false;

      if (getsBonus) {
        const name = GameState.seatNames[slot] || `Player ${slot + 1}`;
        document.getElementById('turn-announcer').innerText = `${name} earned another turn! Roll again.`;
        if (GameState.isBot(slot)) {
          setTimeout(() => this.rollDice(), 800);
        }
      } else {
        this.nextTurn();
      }
    },

    nextTurn() {
      GameState.hasRolled = false;
      GameState.isMoving = false;

      const liveSlots = GameState.activeSlots.filter(s => !GameState.exitedSlots.has(s));
      if (liveSlots.length <= 1) {
        if (liveSlots.length === 1) this.declareWinner(liveSlots[0], true);
        return;
      }

      let currentIdx = GameState.activeSlots.indexOf(GameState.currentTurnSlot);
      let attempts = 0;
      do {
        currentIdx = (currentIdx + 1) % GameState.activeSlots.length;
        attempts++;
      } while (GameState.exitedSlots.has(GameState.activeSlots[currentIdx]) && attempts < 14);

      GameState.currentTurnSlot = GameState.activeSlots[currentIdx];
      RenderEngine.updateTurnUI();

      if (GameState.isBot(GameState.currentTurnSlot)) {
        setTimeout(() => this.rollDice(), 750);
      }
    },

    botMove(slot, movableIds) {
      const difficulty = GameState.botDifficulty;
      const roll = GameState.diceValue;

      if (difficulty === 'easy') {
        this.moveToken(slot, movableIds[Math.floor(Math.random() * movableIds.length)], roll);
        return;
      }

      if (difficulty === 'medium') {
        if (Math.random() < 0.5) {
          const capId = this.findCaptureToken(slot, movableIds, roll);
          if (capId !== null) return this.moveToken(slot, capId, roll);
        }
        this.moveToken(slot, movableIds[Math.floor(Math.random() * movableIds.length)], roll);
        return;
      }

      if (difficulty === 'hard') {
        const capId = this.findCaptureToken(slot, movableIds, roll);
        if (capId !== null) return this.moveToken(slot, capId, roll);
        if (roll === 6) {
          const homeId = movableIds.find(id => GameState.tokens[slot][id].state === 'home');
          if (homeId !== undefined) return this.moveToken(slot, homeId, roll);
        }
        const finishId = movableIds.find(id => {
          const t = GameState.tokens[slot][id];
          return t.state === 'runway' && (t.step + roll >= 5);
        });
        if (finishId !== undefined) return this.moveToken(slot, finishId, roll);
        this.moveToken(slot, movableIds[0], roll);
        return;
      }

      // Master AI
      let bestId = movableIds[0];
      let highestScore = -9999;

      movableIds.forEach(id => {
        let score = 0;
        const t = GameState.tokens[slot][id];

        if (t.state === 'home' && roll === 6) score += 65;

        if (t.state === 'track') {
          const targetPos = (t.step + roll) % 52;
          const canCap = GameState.activeSlots.some(other => {
            if (other === slot || GameState.exitedSlots.has(other)) return false;
            return GameState.tokens[other].some(ot => ot.state === 'track' && ot.step === targetPos && !SAFE_POSITIONS.includes(targetPos));
          });
          if (canCap) score += 200;
          if (SAFE_POSITIONS.includes(targetPos)) score += 80;

          const isUnderThreat = GameState.activeSlots.some(other => {
            if (other === slot || GameState.exitedSlots.has(other)) return false;
            return GameState.tokens[other].some(ot => {
              if (ot.state !== 'track') return false;
              const dist = (t.step - ot.step + 52) % 52;
              return dist >= 1 && dist <= 6;
            });
          });
          if (isUnderThreat && !SAFE_POSITIONS.includes(t.step)) score += 90;
          score += (t.step % 52);
        }

        if (t.state === 'runway') {
          if (t.step + roll === 5) score += 150;
          else score += 70;
        }

        if (score > highestScore) {
          highestScore = score;
          bestId = id;
        }
      });

      this.moveToken(slot, bestId, roll);
    },

    findCaptureToken(slot, movableIds, roll) {
      for (const id of movableIds) {
        const t = GameState.tokens[slot][id];
        if (t.state === 'track') {
          const targetPos = (t.step + roll) % 52;
          const canCap = GameState.activeSlots.some(other => {
            if (other === slot || GameState.exitedSlots.has(other)) return false;
            return GameState.tokens[other].some(ot => ot.state === 'track' && ot.step === targetPos && !SAFE_POSITIONS.includes(targetPos));
          });
          if (canCap) return id;
        }
      }
      return null;
    },

    declareWinner(slot, byDefault = false) {
      const modal = document.getElementById('winner-modal');
      const title = document.getElementById('winner-title');
      const desc = document.getElementById('winner-desc');
      const name = GameState.seatNames[slot] || `Player ${slot + 1}`;
      const isBot = GameState.isBot(slot);

      if (title) title.innerText = `🏆 ${name} ${isBot ? '(Bot)' : ''} Wins!`;
      if (desc) {
        desc.innerText = byDefault
          ? `All opponents have exited the match! ${name} wins!`
          : `Congratulations! ${name} successfully guided all 4 tokens home!`;
      }
      if (modal) modal.classList.remove('hidden');
    }
  };

  /* ---------------------------------------------------------
     PUBLIC LUDO MODULE API
     --------------------------------------------------------- */
  window.LudoModule = {
    openLobby() {
      const modal = document.getElementById('lobby-modal');
      if (modal) modal.classList.remove('hidden');
      this.refreshLobbyUI();
    },

    closeLobby() {
      const modal = document.getElementById('lobby-modal');
      if (modal) modal.classList.add('hidden');
    },

    changeSetupFromWinner() {
      const winModal = document.getElementById('winner-modal');
      if (winModal) winModal.classList.add('hidden');
      this.openLobby();
    },

    openMobileGuide() {
      const modal = document.getElementById('mobile-guide-modal');
      if (modal) modal.classList.remove('hidden');
    },

    closeMobileGuide() {
      const modal = document.getElementById('mobile-guide-modal');
      if (modal) modal.classList.add('hidden');
    },

    setPlayerCount(count) {
      LobbyState.playerCount = count;
      if (count === 1) {
        LobbyState.seatRoles[0] = 'human';
        for (let i = 1; i < 6; i++) LobbyState.seatRoles[i] = 'bot';
      } else {
        for (let i = 0; i < 6; i++) LobbyState.seatRoles[i] = 'human';
      }
      this.refreshLobbyUI();
    },

    setCoinStyle(style) {
      LobbyState.coinStyle = style;
      document.querySelectorAll('#coin-style-selector .coin-option-card').forEach(card => {
        if (card.dataset.style === style) card.classList.add('active');
        else card.classList.remove('active');
      });
    },

    toggleAllBotsMode() {
      const activeSlotList = this.getActiveSlotsForCount(LobbyState.playerCount);
      const hasBots = activeSlotList.some(s => s !== 0 && LobbyState.seatRoles[s] === 'bot');

      activeSlotList.forEach(slot => {
        if (slot !== 0) {
          LobbyState.seatRoles[slot] = hasBots ? 'human' : 'bot';
        }
      });
      this.refreshLobbyUI();
    },

    updateSeatName(slot, newName) {
      LobbyState.seatNames[slot] = newName.trim() || `Player ${slot + 1}`;
    },

    setSeatColor(slot, newColor) {
      const oldColor = LobbyState.seatColors[slot];
      if (oldColor === newColor) return;

      const activeSlotList = this.getActiveSlotsForCount(LobbyState.playerCount);
      let conflictSlot = -1;
      for (const s of activeSlotList) {
        if (s !== slot && LobbyState.seatColors[s] === newColor) {
          conflictSlot = s;
          break;
        }
      }

      if (conflictSlot !== -1) {
        LobbyState.seatColors[conflictSlot] = oldColor;
      }
      LobbyState.seatColors[slot] = newColor;

      this.refreshLobbyUI();
    },

    setBotLevel(level) {
      LobbyState.botDifficulty = level;
      this.refreshLobbyUI();
    },

    toggleSeatRole(slotIndex, role) {
      LobbyState.seatRoles[slotIndex] = role;
      this.refreshLobbyUI();
    },

    getActiveSlotsForCount(count) {
      if (count === 1 || count === 2) return [0, 2];
      if (count === 3) return [0, 1, 2];
      if (count === 4) return [0, 1, 2, 3];
      if (count === 5) return [0, 1, 2, 3, 4];
      return [0, 1, 2, 3, 4, 5]; // 6 Players
    },

    refreshLobbyUI() {
      // 1. Update Player Count Buttons
      document.querySelectorAll('#player-count-pills .pill-btn').forEach(btn => {
        const c = parseInt(btn.dataset.count, 10);
        if (c === LobbyState.playerCount) btn.classList.add('active');
        else btn.classList.remove('active');
      });

      // 2. Update Coin Selector
      document.querySelectorAll('#coin-style-selector .coin-option-card').forEach(card => {
        if (card.dataset.style === LobbyState.coinStyle) card.classList.add('active');
        else card.classList.remove('active');
      });

      // 3. Render Seats List with Name Edit & Blurred Exclusive Color Chips
      const container = document.getElementById('seats-config-container');
      if (container) {
        container.innerHTML = '';
        const activeSlotList = this.getActiveSlotsForCount(LobbyState.playerCount);
        const allColors = ['red', 'green', 'yellow', 'orange', 'blue', 'purple'];

        const takenColors = {};
        activeSlotList.forEach(s => {
          takenColors[LobbyState.seatColors[s]] = s;
        });

        activeSlotList.forEach((slot, index) => {
          const selectedColor = LobbyState.seatColors[slot];
          const isPlayer1 = (slot === 0);
          const currentRole = LobbyState.seatRoles[slot];
          const currentName = LobbyState.seatNames[slot] || (isPlayer1 ? 'Player 1' : `Player ${index + 1}`);

          const card = document.createElement('div');
          card.className = 'seat-row-card';

          let chipsHTML = '';
          allColors.forEach(c => {
            const def = COLOR_DEFINITIONS[c];
            const isSelected = (c === selectedColor);
            const isTakenByOther = (!isSelected && takenColors[c] !== undefined);

            const chipClass = `mini-color-chip ${isSelected ? 'chip-active' : ''} ${isTakenByOther ? 'chip-blurred' : ''}`;
            const clickAttr = isTakenByOther ? '' : `onclick="LudoModule.setSeatColor(${slot}, '${c}')"`;

            chipsHTML += `
              <div class="${chipClass}" style="background-color: ${def.hex};" ${clickAttr} title="${def.name} (${def.letter})">
                ${def.letter}
              </div>
            `;
          });

          card.innerHTML = `
            <div class="seat-left-group">
              <input type="text" class="seat-name-input" maxlength="12" value="${currentName}" 
                placeholder="Name" onchange="LudoModule.updateSeatName(${slot}, this.value)" />
              <div class="seat-color-chips">
                ${chipsHTML}
              </div>
            </div>
            ${isPlayer1 ? `
              <span style="font-size:0.75rem; font-weight:700; color:#34d399;">You (P1)</span>
            ` : `
              <div class="role-toggle-group">
                <button class="role-btn ${currentRole === 'human' ? 'active' : ''}" onclick="LudoModule.toggleSeatRole(${slot}, 'human')">👤 Friend</button>
                <button class="role-btn ${currentRole === 'bot' ? 'bot-active' : ''}" onclick="LudoModule.toggleSeatRole(${slot}, 'bot')">🤖 Bot</button>
              </div>
            `}
          `;
          container.appendChild(card);
        });
      }

      const quickBtn = document.getElementById('btn-quick-toggle');
      if (quickBtn) {
        const activeSlotList = this.getActiveSlotsForCount(LobbyState.playerCount);
        const hasBots = activeSlotList.some(s => s !== 0 && LobbyState.seatRoles[s] === 'bot');
        quickBtn.innerText = hasBots ? '👥 Remove All Bots (All Friends)' : '🤖 Add Bots to Empty Seats';
      }

      // Toughness strictly hidden if playerCount > 2 or if no bots
      const activeSlotList = this.getActiveSlotsForCount(LobbyState.playerCount);
      const anyBotActive = activeSlotList.some(s => s !== 0 && LobbyState.seatRoles[s] === 'bot') || LobbyState.playerCount === 1;
      
      const botSection = document.getElementById('bot-difficulty-section');
      if (botSection) {
        if (LobbyState.playerCount > 2 || !anyBotActive) {
          botSection.style.display = 'none';
        } else {
          botSection.style.display = 'flex';
        }
      }

      document.querySelectorAll('#difficulty-pills .diff-btn').forEach(btn => {
        if (btn.dataset.level === LobbyState.botDifficulty) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    },

    startConfiguredMatch() {
      this.closeLobby();

      document.querySelectorAll('.seat-name-input').forEach((input, idx) => {
        const activeSlotList = this.getActiveSlotsForCount(LobbyState.playerCount);
        if (activeSlotList[idx] !== undefined) {
          LobbyState.seatNames[activeSlotList[idx]] = input.value.trim() || `Player ${idx + 1}`;
        }
      });

      GameState.slotColors = [
        LobbyState.seatColors[0],
        LobbyState.seatColors[1],
        LobbyState.seatColors[2],
        LobbyState.seatColors[3],
        LobbyState.seatColors[4],
        LobbyState.seatColors[5]
      ];
      GameState.activeSlots = this.getActiveSlotsForCount(LobbyState.playerCount);
      GameState.exitedSlots = new Set();
      GameState.seatRoles = { ...LobbyState.seatRoles };
      GameState.seatNames = { ...LobbyState.seatNames };
      GameState.coinStyle = LobbyState.coinStyle;
      GameState.botDifficulty = LobbyState.botDifficulty;

      if (LobbyState.playerCount === 1) {
        GameState.seatRoles[0] = 'human';
        GameState.seatRoles[2] = 'bot';
      }

      GameState.currentTurnSlot = 0;
      GameState.diceValue = null;
      GameState.hasRolled = false;
      GameState.isMoving = false;

      GameState.tokens = {};
      for (let s = 0; s < 6; s++) {
        GameState.tokens[s] = [
          { id: 0, state: 'home', step: -1 },
          { id: 1, state: 'home', step: -1 },
          { id: 2, state: 'home', step: -1 },
          { id: 3, state: 'home', step: -1 }
        ];
      }

      document.getElementById('winner-modal').classList.add('hidden');
      document.getElementById('exit-modal').classList.add('hidden');
      const restartModal = document.getElementById('restart-modal');
      if (restartModal) restartModal.classList.add('hidden');

      RenderEngine.buildBoard();
      RenderEngine.updateProfiles();
      RenderEngine.updateTurnUI();
      RenderEngine.renderTokens();
      RenderEngine.updateScores();
    },

    restartCurrentMatch() {
      this.startConfiguredMatch();
    },

    /* ---------------------------------------------------------
       RESTART CONFIRMATION MODAL SYSTEM
       --------------------------------------------------------- */
    confirmRestart() {
      const modal = document.getElementById('restart-modal');
      if (modal) modal.classList.remove('hidden');
    },

    cancelRestart() {
      const modal = document.getElementById('restart-modal');
      if (modal) modal.classList.add('hidden');
    },

    executeRestart() {
      this.cancelRestart();
      this.restartCurrentMatch();
    },

    /* ---------------------------------------------------------
       HUMAN-ONLY EXIT CONFIRMATION MODAL SYSTEM
       --------------------------------------------------------- */
    confirmPlayerExit(slot) {
      if (GameState.exitedSlots.has(slot) || GameState.isBot(slot)) return;
      GameState.pendingExitSlot = slot;

      const modal = document.getElementById('exit-modal');
      const desc = document.getElementById('exit-modal-desc');
      if (desc) desc.innerText = `Confirm exit?`;
      if (modal) modal.classList.remove('hidden');
    },

    cancelExit() {
      GameState.pendingExitSlot = null;
      const modal = document.getElementById('exit-modal');
      if (modal) modal.classList.add('hidden');
    },

    executeExit() {
      const slot = GameState.pendingExitSlot;
      if (slot === null || slot === undefined) return;

      this.cancelExit();
      GameState.exitedSlots.add(slot);

      GameState.tokens[slot] = [
        { id: 0, state: 'forfeit', step: -1 },
        { id: 1, state: 'forfeit', step: -1 },
        { id: 2, state: 'forfeit', step: -1 },
        { id: 3, state: 'forfeit', step: -1 }
      ];

      RenderEngine.renderTokens();
      RenderEngine.updateProfiles();
      RenderEngine.updateScores();

      const name = GameState.seatNames[slot] || `Player ${slot + 1}`;
      document.getElementById('turn-announcer').innerText = `${name} exited the match!`;

      const liveSlots = GameState.activeSlots.filter(s => !GameState.exitedSlots.has(s));
      if (liveSlots.length <= 1) {
        if (liveSlots.length === 1) {
          GameEngine.declareWinner(liveSlots[0], true);
        }
        return;
      }

      if (GameState.currentTurnSlot === slot) {
        GameEngine.nextTurn();
      }
    },

    triggerSlotDice(slot) {
      if (slot !== GameState.currentTurnSlot || GameState.isBot(slot) || GameState.exitedSlots.has(slot)) return;
      GameEngine.rollDice();
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    LudoModule.refreshLobbyUI();
    LudoModule.startConfiguredMatch();
    LudoModule.openLobby();
  });

})();