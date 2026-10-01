/* =========================================================================
   ASHTA-CHAMMA (CHOWKA BHARA) - Master Game Engine
   - FIXED: Token array initialization bug in resetGame() so coins render
   - Roll Points & Labels rendered in the active player's exact token color
   - Active Gavva station border, glow & throw button adapt to player color
   - 9 Curated Heritage Board Themes with Light Main Tiles & Inlaid Borders
   - Decorative Filigree Corner Accents & Inlaid Gold Inlay Border
   - 8-Pointed Star Medallion in Center Winning Goal Box
   - Strict Highlighting: ONLY active player's onboarded (track) coins highlight
   - Cross-player token hover & click interactions strictly disabled
   - Symmetrical Fixed Dual Stations with Player 1, 2, 3, & 4 Dynamic Headers
   - Exact Roll Labels: 1(Kannu), 2(Duga), 3(Theeni), 4(Chamma), 8(Astha)
   - Step 12 Safe Cross Constraint & Image 2 Path Geometry
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     SYNTHESIZED SOUND FX
     --------------------------------------------------------- */
  const SoundFX = {
    enabled: true,
    ctx: null,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },
    play(freq, type = 'sine', duration = 0.1, gainVal = 0.4) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (_) {}
    },
    cowrieRattle() {
      this.play(800, 'triangle', 0.05, 0.45);
      setTimeout(() => this.play(950, 'triangle', 0.04, 0.48), 60);
      setTimeout(() => this.play(680, 'triangle', 0.06, 0.45), 130);
    },
    move() { this.play(520, 'sine', 0.08, 0.38); },
    capture() {
      this.play(280, 'sawtooth', 0.2, 0.55);
      setTimeout(() => this.play(120, 'triangle', 0.3, 0.45), 80);
    },
    win() {
      this.play(740, 'square', 0.45, 0.5);
    }
  };

  /* ---------------------------------------------------------
     CONFETTI ENGINE
     --------------------------------------------------------- */
  const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    init() {
      this.canvas = document.getElementById('confetti-canvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }
    },
    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    burst(count = 140) {
      this.init();
      if (!this.ctx) return;
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          w: Math.random() * 9 + 5,
          h: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 22,
          vy: (Math.random() - 0.7) * 20,
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          gravity: 0.42,
          opacity: 1
        });
      }
      if (!this.animationId) this.loop();
    },
    loop() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.opacity -= 0.007;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.restore();

        if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
          this.particles.splice(idx, 1);
        }
      });

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(() => this.loop());
      } else {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    },
    stop() {
      this.particles = [];
      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.animationId = null;
      if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  const COLOR_DEFS = {
    red:    { name: 'Red', hex: '#ef4444' },
    green:  { name: 'Green', hex: '#10b981' },
    yellow: { name: 'Yellow', hex: '#f59e0b' },
    blue:   { name: 'Blue', hex: '#3b82f6' },
    purple: { name: 'Purple', hex: '#c084fc' },
    orange: { name: 'Orange', hex: '#fb923c' }
  };

  // Exact geometric paths matching traditional flow per Image 2[cite: 8]
  const SLOT_PATHS = {
    0: [
      { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 3, c: 4 }, { r: 2, c: 4 },
      { r: 1, c: 4 }, { r: 0, c: 4 }, { r: 0, c: 3 }, { r: 0, c: 2 }, { r: 0, c: 1 },
      { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 },
      { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 },
      { r: 3, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 },
      { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 3, c: 2 },
      { r: 2, c: 2 }
    ],
    1: [
      { r: 2, c: 4 }, { r: 1, c: 4 }, { r: 0, c: 4 }, { r: 0, c: 3 }, { r: 0, c: 2 },
      { r: 0, c: 1 }, { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 },
      { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 },
      { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 3, c: 4 },
      { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 1 }, { r: 2, c: 1 },
      { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 },
      { r: 2, c: 2 }
    ],
    2: [
      { r: 0, c: 2 }, { r: 0, c: 1 }, { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 },
      { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 },
      { r: 4, c: 4 }, { r: 3, c: 4 }, { r: 2, c: 4 },
      { r: 1, c: 4 }, { r: 0, c: 4 }, { r: 0, c: 3 },
      { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 3 }, { r: 3, c: 3 }, { r: 3, c: 2 },
      { r: 3, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 1 },
      { r: 2, c: 2 }
    ],
    3: [
      { r: 2, c: 0 }, { r: 3, c: 0 }, { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 },
      { r: 4, c: 3 }, { r: 4, c: 4 }, { r: 3, c: 4 }, { r: 2, c: 4 }, { r: 1, c: 4 },
      { r: 0, c: 4 }, { r: 0, c: 3 }, { r: 0, c: 2 },
      { r: 0, c: 1 }, { r: 0, c: 0 }, { r: 1, c: 0 },
      { r: 2, c: 1 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 2, c: 3 },
      { r: 3, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 1 },
      { r: 2, c: 2 }
    ]
  };

  const SAFE_CELLS = [
    { r: 4, c: 2 }, { r: 2, c: 4 }, { r: 0, c: 2 }, { r: 2, c: 0 },
    { r: 1, c: 1 }, { r: 1, c: 3 }, { r: 3, c: 1 }, { r: 3, c: 3 },
    { r: 2, c: 2 }
  ];

  const LobbyState = {
    playerCount: 4,
    isTeamMode: false,
    teamAxis: 'TB',
    teamColors: { 1: 'blue', 2: 'red' },
    names: { 0: 'Player 1', 1: 'Player 2', 2: 'Player 3', 3: 'Player 4' },
    colors: { 0: 'red', 1: 'green', 2: 'yellow', 3: 'blue' },
    roles: { 0: 'human', 1: 'human', 2: 'human', 3: 'human' }
  };

  const GameState = {
    playerCount: 4,
    isTeamMode: false,
    teamAxis: 'TB',
    boardTheme: 'theme-royal-mahogany',
    activeSlots: [0, 1, 2, 3],
    playerTurnOrder: [0, 1, 2, 3],
    currentTurnIndex: 0,
    names: {},
    colors: {},
    roles: {},
    cowriePoints: null,
    hasThrown: false,
    isMoving: false,
    playerUnlocked: { 0: false, 1: false, 2: false, 3: false },
    killRegistered: {},
    tokens: {},
    startTime: null,
    totalTurns: 0,
    totalKills: 0,
    totalAshtas: 0
  };

  function logFeed(text, type = 'normal') {
    const list = document.getElementById('match-log-list');
    if (!list) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${type === 'kill' ? 'kill-log' : (type === 'entry' ? 'entry-log' : '')}`;
    entry.innerText = text;
    list.appendChild(entry);
    list.scrollTop = list.scrollHeight;
  }

  function getBaseSlotForPlayer(pIdx) {
    if (!GameState.isTeamMode) {
      if (GameState.playerCount === 1 || GameState.playerCount === 2) return pIdx === 0 ? 0 : 2;
      return pIdx;
    }
    const team = (pIdx % 2 === 0) ? 1 : 2;
    return GameState.teamAxis === 'TB' ? (team === 1 ? 0 : 2) : (team === 1 ? 3 : 1);
  }

  function getTeamForPlayer(pIdx) {
    if (!GameState.isTeamMode) return null;
    return (pIdx % 2 === 0) ? 1 : 2;
  }

  function getStationForPlayer(pIdx) {
    if (GameState.isTeamMode) {
      return (getTeamForPlayer(pIdx) === 1) ? 'left' : 'right';
    }
    return (pIdx % 2 === 0) ? 'left' : 'right';
  }

  function getPlayerColorHex(pIdx) {
    if (GameState.isTeamMode) {
      const teamId = getTeamForPlayer(pIdx);
      const colorKey = GameState.colors[`team_${teamId}`] || 'blue';
      return COLOR_DEFS[colorKey] ? COLOR_DEFS[colorKey].hex : '#3b82f6';
    }
    const colorKey = GameState.colors[pIdx] || 'yellow';
    return COLOR_DEFS[colorKey] ? COLOR_DEFS[colorKey].hex : '#f59e0b';
  }

  /* ---------------------------------------------------------
     BOARD BUILDER (ORNATE BORDER ACCENTS & LIGHT INNER TILES)
     --------------------------------------------------------- */
  function buildBoard() {
    const board = document.getElementById('ashta-board');
    board.className = `ashta-board ${GameState.boardTheme}`;
    board.innerHTML = '';

    const cornerSVG = `
      <svg class="board-corner-accent corner-tl" viewBox="0 0 36 36">
        <path d="M 3,3 L 30,3 M 3,3 L 3,30 M 7,7 L 22,7 M 7,7 L 7,22 M 5,5 Q 20,5 14,14 Q 5,20 5,5 Z" stroke="var(--board-gold-trim)" fill="none" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <svg class="board-corner-accent corner-tr" viewBox="0 0 36 36">
        <path d="M 3,3 L 30,3 M 3,3 L 3,30 M 7,7 L 22,7 M 7,7 L 7,22 M 5,5 Q 20,5 14,14 Q 5,20 5,5 Z" stroke="var(--board-gold-trim)" fill="none" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <svg class="board-corner-accent corner-bl" viewBox="0 0 36 36">
        <path d="M 3,3 L 30,3 M 3,3 L 3,30 M 7,7 L 22,7 M 7,7 L 7,22 M 5,5 Q 20,5 14,14 Q 5,20 5,5 Z" stroke="var(--board-gold-trim)" fill="none" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <svg class="board-corner-accent corner-br" viewBox="0 0 36 36">
        <path d="M 3,3 L 30,3 M 3,3 L 3,30 M 7,7 L 22,7 M 7,7 L 7,22 M 5,5 Q 20,5 14,14 Q 5,20 5,5 Z" stroke="var(--board-gold-trim)" fill="none" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `;

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        const isCrossed = SAFE_CELLS.some(sc => sc.r === r && sc.c === c);
        if (isCrossed) {
          if (r === 2 && c === 2) {
            cell.classList.add('center-goal');
            cell.innerHTML = `
              <svg class="center-star-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fffbeb"/>
                    <stop offset="60%" stop-color="#fef08a"/>
                    <stop offset="100%" stop-color="#f59e0b"/>
                  </linearGradient>
                  <linearGradient id="goldDark" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#d97706"/>
                    <stop offset="100%" stop-color="#78350f"/>
                  </linearGradient>
                </defs>
                <polygon points="50,4 58,38 50,50" fill="url(#goldLight)"/>
                <polygon points="50,4 42,38 50,50" fill="url(#goldDark)"/>
                <polygon points="83,17 62,38 50,50" fill="url(#goldDark)"/>
                <polygon points="83,17 62,44 50,50" fill="url(#goldLight)"/>
                <polygon points="96,50 62,42 50,50" fill="url(#goldLight)"/>
                <polygon points="96,50 62,58 50,50" fill="url(#goldDark)"/>
                <polygon points="83,83 62,62 50,50" fill="url(#goldDark)"/>
                <polygon points="83,83 44,62 50,50" fill="url(#goldLight)"/>
                <polygon points="50,96 42,62 50,50" fill="url(#goldLight)"/>
                <polygon points="50,96 58,62 50,50" fill="url(#goldDark)"/>
                <polygon points="17,83 38,62 50,50" fill="url(#goldDark)"/>
                <polygon points="17,83 38,44 50,50" fill="url(#goldLight)"/>
                <polygon points="4,50 38,58 50,50" fill="url(#goldLight)"/>
                <polygon points="4,50 38,42 50,50" fill="url(#goldDark)"/>
                <polygon points="17,17 38,38 50,50" fill="url(#goldDark)"/>
                <polygon points="17,17 44,38 50,50" fill="url(#goldLight)"/>
                <circle cx="50" cy="50" r="10" fill="url(#goldLight)" stroke="#78350f" stroke-width="1.8"/>
                <circle cx="50" cy="50" r="4.5" fill="#78350f"/>
              </svg>
            `;
          } else {
            cell.classList.add('crossed-cell');
          }
        }

        board.appendChild(cell);
      }
    }

    const wrapper = document.getElementById('board-wrapper');
    if (wrapper) {
      wrapper.querySelectorAll('.board-corner-accent').forEach(a => a.remove());
      wrapper.insertAdjacentHTML('beforeend', cornerSVG);
    }
  }

  /* ---------------------------------------------------------
     HIGHLIGHTING & PREVIEW CLEANUP
     --------------------------------------------------------- */
  function clearAllHighlights() {
    document.querySelectorAll('.token').forEach(t => t.classList.remove('highlight-move'));
    clearPathPreviews();
  }

  function clearPathPreviews() {
    document.querySelectorAll('.board-cell').forEach(c => {
      c.classList.remove('preview-path', 'preview-landing');
    });
  }

  function highlightMovableTokens() {
    clearAllHighlights();

    if (!GameState.hasThrown || GameState.cowriePoints === null) return;

    const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];

    if (!GameState.playerUnlocked[curPlayer] && GameState.cowriePoints !== 4 && GameState.cowriePoints !== 8) {
      return;
    }

    const isTeam = GameState.isTeamMode;
    const groupKey = isTeam ? `team_${getTeamForPlayer(curPlayer)}` : `player_${curPlayer}`;
    const movable = getMovableTokens(curPlayer, GameState.cowriePoints);

    // ONLY highlight tokens that are ONBOARDED (state === 'track')
    movable.forEach(id => {
      const tokenData = GameState.tokens[groupKey] ? GameState.tokens[groupKey][id] : null;
      if (tokenData && tokenData.state === 'track') {
        const el = document.querySelector(`.token[data-group="${groupKey}"][data-token-id="${id}"]`);
        if (el) el.classList.add('highlight-move');
      }
    });
  }

  function showPathPreview(pIdx, tokenId) {
    if (!GameState.hasThrown || GameState.isMoving || GameState.cowriePoints === null) return;
    clearPathPreviews();

    const isTeam = GameState.isTeamMode;
    const groupKey = isTeam ? `team_${getTeamForPlayer(pIdx)}` : `player_${pIdx}`;
    const token = GameState.tokens[groupKey][tokenId];
    if (!token || token.state !== 'track') return;

    const baseSlot = getBaseSlotForPlayer(pIdx);
    const path = SLOT_PATHS[baseSlot];
    const points = GameState.cowriePoints;
    const targetStep = Math.min(path.length - 1, token.step + points);

    for (let s = token.step + 1; s < targetStep; s++) {
      const coord = path[s];
      const cell = document.querySelector(`.board-cell[data-r="${coord.r}"][data-c="${coord.c}"]`);
      if (cell) cell.classList.add('preview-path');
    }

    const targetCoord = path[targetStep];
    const destCell = document.querySelector(`.board-cell[data-r="${targetCoord.r}"][data-c="${targetCoord.c}"]`);
    if (destCell) destCell.classList.add('preview-landing');
  }

  /* ---------------------------------------------------------
     COWRIE SHELL ROLLER & EXACT LABELS
     --------------------------------------------------------- */
  function throwCowries(stationSide) {
    const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];
    const expectedStation = getStationForPlayer(curPlayer);

    if (stationSide && stationSide !== expectedStation) return;
    if (GameState.isMoving || GameState.hasThrown) return;

    SoundFX.cowrieRattle();
    const activeTray = document.getElementById(`tray-${expectedStation}`);
    if (activeTray) activeTray.classList.add('rolling');

    setTimeout(() => {
      if (activeTray) activeTray.classList.remove('rolling');

      let mouthsUp = 0;
      for (let i = 0; i < 4; i++) {
        const isUp = Math.random() < 0.5;
        const shellEl = document.getElementById(`shell-${expectedStation}-${i}`);
        if (shellEl) {
          const tilt = Math.floor(Math.random() * 40 - 20);
          if (isUp) {
            mouthsUp++;
            shellEl.className = 'cowrie-shell mouth-up';
            shellEl.style.transform = `rotateX(0deg) rotateZ(${tilt}deg)`;
          } else {
            shellEl.className = 'cowrie-shell mouth-down';
            shellEl.style.transform = `rotateX(180deg) rotateZ(${tilt}deg)`;
          }
        }
      }

      let points = mouthsUp;
      let label = '';
      if (mouthsUp === 0) {
        points = 8;
        label = '8(Astha)';
        GameState.totalAshtas++;
      } else if (mouthsUp === 1) {
        points = 1;
        label = '1(Kannu)';
      } else if (mouthsUp === 2) {
        points = 2;
        label = '2(Duga)';
      } else if (mouthsUp === 3) {
        points = 3;
        label = '3(Theeni)';
      } else if (mouthsUp === 4) {
        points = 4;
        label = '4(Chamma)';
      }

      GameState.cowriePoints = points;
      GameState.hasThrown = true;
      GameState.totalTurns++;

      // STYLED IN THE ACTIVE PLAYER'S EXACT COIN COLOR
      const curColorHex = getPlayerColorHex(curPlayer);
      const ptsEl = document.getElementById(`roll-points-${expectedStation}`);
      const lblEl = document.getElementById(`roll-label-${expectedStation}`);
      if (ptsEl) {
        ptsEl.innerText = points;
        ptsEl.style.color = curColorHex;
        ptsEl.style.textShadow = `0 0 16px ${curColorHex}80`;
      }
      if (lblEl) {
        lblEl.innerText = label;
        lblEl.style.color = curColorHex;
        lblEl.style.fontWeight = '800';
      }

      const curName = GameState.names[curPlayer];
      logFeed(`${curName} rolled ${label}`);

      const isTeam = GameState.isTeamMode;
      const groupKey = isTeam ? `team_${getTeamForPlayer(curPlayer)}` : `player_${curPlayer}`;
      const tokenSet = GameState.tokens[groupKey];
      const porchTokens = tokenSet.filter(t => t.state === 'porch');

      // Individual Player Unlock Check
      if (points === 4 || points === 8) {
        if (!GameState.playerUnlocked[curPlayer]) {
          GameState.playerUnlocked[curPlayer] = true;
          logFeed(`🔓 ${curName} unlocked coin movement!`, 'entry');
          updateStationHeaders();
        }
      } else {
        if (!GameState.playerUnlocked[curPlayer]) {
          const ann = document.getElementById('turn-announcer');
          if (ann) {
            ann.innerText = `🔒 ${curName} rolled ${label}, but is locked! Must roll 4(Chamma) or 8(Astha) first.`;
          }
          logFeed(`🔒 ${curName} is locked (Needs 4 or 8)`);
          clearAllHighlights();
          setTimeout(nextTurn, 1400);
          return;
        }
      }

      // ASHTA (8) EXECUTION
      if (points === 8) {
        const onBoardTokens = tokenSet.filter(t => t.state === 'track' || t.state === 'home');
        if (onBoardTokens.length === 0) {
          handleMandatoryEntry(curPlayer, 2, '8(Astha)');
          return;
        }
        if (porchTokens.length === 1) {
          handleSingleEntryAndMove(curPlayer, porchTokens[0].id, 4);
          return;
        }
        if (porchTokens.length === 0) {
          handleTrackOnlyMovement(curPlayer, 8, label);
          return;
        }
        handleMandatoryEntry(curPlayer, 2, '8(Astha)');
        return;
      }

      // CHAMMA (4) EXECUTION
      if (points === 4) {
        if (porchTokens.length >= 1) {
          handleMandatoryEntry(curPlayer, 1, '4(Chamma)');
          return;
        } else {
          handleTrackOnlyMovement(curPlayer, 4, label);
          return;
        }
      }

      // REGULAR ROLLS (1, 2, or 3)
      handleTrackOnlyMovement(curPlayer, points, label);

    }, 480);
  }

  function handleMandatoryEntry(pIdx, countToEnter, rollName) {
    GameState.isMoving = true;
    SoundFX.move();

    const isTeam = GameState.isTeamMode;
    const groupKey = isTeam ? `team_${getTeamForPlayer(pIdx)}` : `player_${pIdx}`;
    const tokenSet = GameState.tokens[groupKey];
    const porchTokens = tokenSet.filter(t => t.state === 'porch');
    const toEnter = porchTokens.slice(0, countToEnter);

    toEnter.forEach(t => {
      t.state = 'track';
      t.step = 0;
    });

    SoundFX.cowrieRattle();
    renderTokens();
    updateScores();

    const name = GameState.names[pIdx];
    const ann = document.getElementById('turn-announcer');
    ann.innerText = `🐚 ${name} rolled ${rollName} → ${toEnter.length} coin(s) entered the board! Roll again to decide movement!`;
    logFeed(`🚪 ${name} brought ${toEnter.length} coin(s) onto the board`, 'entry');

    setTimeout(() => {
      finishMove(pIdx, true);
    }, 600);
  }

  function handleSingleEntryAndMove(pIdx, tokenId, stepsToAdvance) {
    GameState.isMoving = true;
    SoundFX.move();

    const isTeam = GameState.isTeamMode;
    const groupKey = isTeam ? `team_${getTeamForPlayer(pIdx)}` : `player_${pIdx}`;
    const token = GameState.tokens[groupKey][tokenId];

    token.state = 'track';
    token.step = 0;
    renderTokens();

    const name = GameState.names[pIdx];
    const ann = document.getElementById('turn-announcer');
    ann.innerText = `🐚 ${name} rolled 8(Astha) with 1 coin outside → Entered & moving 4 spaces!`;
    logFeed(`🚪 ${name}'s last coin entered & automatically moved 4 steps!`, 'entry');

    setTimeout(() => {
      moveToken(pIdx, tokenId, stepsToAdvance);
    }, 400);
  }

  function handleTrackOnlyMovement(pIdx, points, labelText) {
    const curName = GameState.names[pIdx];
    const movable = getMovableTokens(pIdx, points);

    if (movable.length === 0) {
      clearAllHighlights();
      const getsBonus = (points === 4 || points === 8);
      document.getElementById('turn-announcer').innerText = getsBonus
        ? `${curName} rolled ${labelText}, but no coins can move! Bonus throw awarded!`
        : `${curName} rolled ${labelText}. No moves possible!`;

      logFeed(`${curName} has no valid moves with ${labelText}`);

      if (getsBonus) {
        setTimeout(() => finishMove(pIdx, true), 1000);
      } else {
        setTimeout(nextTurn, 1000);
      }
      return;
    }

    if ((points === 1 || points === 2 || points === 3) && movable.length === 1 && GameState.roles[pIdx] === 'human') {
      highlightMovableTokens();
      document.getElementById('turn-announcer').innerText = `${curName} rolled ${labelText} → Single coin moving automatically!`;
      setTimeout(() => {
        onTokenClick(pIdx, movable[0]);
      }, 350);
      return;
    }

    highlightMovableTokens();
    if (GameState.roles[pIdx] === 'bot') {
      setTimeout(() => botMove(pIdx, movable), 600);
    } else {
      document.getElementById('turn-announcer').innerText = `${curName} rolled ${labelText} → Choose which coin to move!`;
    }
  }

  function getMovableTokens(pIdx, points) {
    const isTeam = GameState.isTeamMode;
    const teamId = getTeamForPlayer(pIdx);
    const tokenSet = isTeam ? GameState.tokens[`team_${teamId}`] : GameState.tokens[`player_${pIdx}`];
    const killDone = isTeam ? GameState.killRegistered[`team_${teamId}`] : GameState.killRegistered[`player_${pIdx}`];
    const valid = [];

    if (!GameState.playerUnlocked[pIdx] && points !== 4 && points !== 8) {
      return [];
    }

    tokenSet.forEach(t => {
      if (t.state === 'track') {
        const nextStep = t.step + points;

        if (!killDone && (t.step <= 12 && nextStep > 12)) return;
        if (!killDone && t.step === 12) return;
        if (!killDone && nextStep > 12) return;

        if (nextStep <= 24) valid.push(t.id);
      }
    });

    return valid;
  }

  function onTokenClick(pIdx, tokenId) {
    if (!GameState.hasThrown || GameState.isMoving) return;
    const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];
    if (pIdx !== curPlayer) return;

    const movable = getMovableTokens(curPlayer, GameState.cowriePoints);
    if (!movable.includes(tokenId)) return;

    clearAllHighlights();
    moveToken(curPlayer, tokenId, GameState.cowriePoints);
  }

  function moveToken(pIdx, tokenId, steps) {
    GameState.isMoving = true;
    SoundFX.move();

    const isTeam = GameState.isTeamMode;
    const groupKey = isTeam ? `team_${getTeamForPlayer(pIdx)}` : `player_${pIdx}`;
    const token = GameState.tokens[groupKey][tokenId];

    let stepsLeft = steps;
    const interval = setInterval(() => {
      if (stepsLeft <= 0) {
        clearInterval(interval);
        evaluateLanding(pIdx, token);
        return;
      }

      token.step += 1;
      if (token.step >= 24) {
        token.step = 24;
        token.state = 'home';
        stepsLeft = 0;
        clearInterval(interval);
        evaluateLanding(pIdx, token);
        return;
      }

      SoundFX.move();
      stepsLeft--;
      renderTokens();
    }, 110);
  }

  function evaluateLanding(pIdx, token) {
    let getsBonus = (GameState.cowriePoints === 4 || GameState.cowriePoints === 8);
    const isTeam = GameState.isTeamMode;
    const myBaseSlot = getBaseSlotForPlayer(pIdx);
    const myGroupKey = isTeam ? `team_${getTeamForPlayer(pIdx)}` : `player_${pIdx}`;

    if (token.state === 'track') {
      const myCoord = SLOT_PATHS[myBaseSlot][token.step];
      const isSafe = SAFE_CELLS.some(sc => sc.r === myCoord.r && sc.c === myCoord.c);

      if (!isSafe) {
        Object.keys(GameState.tokens).forEach(otherGroupKey => {
          if (otherGroupKey !== myGroupKey) {
            let otherBaseSlot = 0;
            if (isTeam) {
              const otherTeamId = otherGroupKey === 'team_1' ? 1 : 2;
              otherBaseSlot = GameState.teamAxis === 'TB' ? (otherTeamId === 1 ? 0 : 2) : (otherTeamId === 1 ? 3 : 1);
            } else {
              const otherPIdx = parseInt(otherGroupKey.replace('player_', ''), 10);
              otherBaseSlot = getBaseSlotForPlayer(otherPIdx);
            }

            GameState.tokens[otherGroupKey].forEach(ot => {
              if (ot.state === 'track') {
                const otherCoord = SLOT_PATHS[otherBaseSlot][ot.step];
                if (otherCoord.r === myCoord.r && otherCoord.c === myCoord.c) {
                  ot.state = 'porch';
                  ot.step = -1;
                  SoundFX.capture();

                  GameState.killRegistered[myGroupKey] = true;
                  GameState.totalKills++;
                  getsBonus = true;

                  const killer = GameState.names[pIdx];
                  document.getElementById('turn-announcer').innerText = `💥 ${killer} captured an opponent coin! Inner ring unlocked!`;
                  logFeed(`⚔️ ${killer} knocked out an opponent coin! Inner ring open!`, 'kill');
                }
              }
            });
          }
        });
      }
    }

    if (token.state === 'home') {
      SoundFX.win();
      getsBonus = true;
      const curName = GameState.names[pIdx];
      logFeed(`🌟 ${curName}'s coin entered the center sanctum!`, 'entry');
    }

    renderTokens();
    updateScores();

    if (isTeam) {
      const team1Won = GameState.tokens['team_1'].every(t => t.state === 'home');
      const team2Won = GameState.tokens['team_2'].every(t => t.state === 'home');
      if (team1Won) { declareWinner(1, true); return; }
      if (team2Won) { declareWinner(2, true); return; }
    } else {
      const allWon = GameState.tokens[myGroupKey].every(t => t.state === 'home');
      if (allWon) { declareWinner(pIdx, false); return; }
    }

    finishMove(pIdx, getsBonus);
  }

  function finishMove(pIdx, getsBonus) {
    clearAllHighlights();
    renderTokens();
    GameState.isMoving = false;
    GameState.hasThrown = false;
    GameState.cowriePoints = null;

    if (getsBonus) {
      const name = GameState.names[pIdx];
      const curColorHex = getPlayerColorHex(pIdx);
      const ann = document.getElementById('turn-announcer');
      if (ann) ann.innerText = `⭐ ${name} earned a bonus throw! Throw the cowries again.`;
      
      const station = getStationForPlayer(pIdx);
      const label = document.getElementById(`roll-label-${station}`);
      if (label) {
        label.innerText = 'Bonus Throw! Tap to Roll';
        label.style.color = curColorHex;
      }

      if (GameState.roles[pIdx] === 'bot') {
        setTimeout(() => throwCowries(station), 750);
      }
    } else {
      nextTurn();
    }
  }

  function nextTurn() {
    clearAllHighlights();
    GameState.hasThrown = false;
    GameState.isMoving = false;
    GameState.cowriePoints = null;

    GameState.currentTurnIndex = (GameState.currentTurnIndex + 1) % GameState.playerTurnOrder.length;
    const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];

    updateTurnUI();
    updateStationHeaders();

    if (GameState.roles[curPlayer] === 'bot') {
      const station = getStationForPlayer(curPlayer);
      setTimeout(() => throwCowries(station), 750);
    }
  }

  function botMove(pIdx, movableIds) {
    const points = GameState.cowriePoints;
    const isTeam = GameState.isTeamMode;
    const groupKey = isTeam ? `team_${getTeamForPlayer(pIdx)}` : `player_${pIdx}`;
    const tokenSet = GameState.tokens[groupKey];
    const baseSlot = getBaseSlotForPlayer(pIdx);
    const path = SLOT_PATHS[baseSlot];

    let bestScore = -999;
    let bestId = movableIds[0];

    movableIds.forEach(id => {
      const t = tokenSet[id];
      let score = 0;
      const targetStep = t.step + points;

      if (targetStep >= 24) {
        score += 200;
      } else {
        const targetCoord = path[targetStep];
        const isSafe = SAFE_CELLS.some(sc => sc.r === targetCoord.r && sc.c === targetCoord.c);

        if (!isSafe) {
          const hasKill = Object.keys(GameState.tokens).some(otherKey => {
            if (otherKey === groupKey) return false;
            let oBase = 0;
            if (isTeam) {
              const oTeam = otherKey === 'team_1' ? 1 : 2;
              oBase = GameState.teamAxis === 'TB' ? (oTeam === 1 ? 0 : 2) : (oTeam === 1 ? 3 : 1);
            } else {
              oBase = getBaseSlotForPlayer(parseInt(otherKey.replace('player_', ''), 10));
            }
            return GameState.tokens[otherKey].some(ot => {
              if (ot.state !== 'track') return false;
              const oc = SLOT_PATHS[oBase][ot.step];
              return oc.r === targetCoord.r && oc.c === targetCoord.c;
            });
          });
          if (hasKill) score += 140;
        } else {
          score += 45;
        }

        if (targetStep > 12) score += 30;
        score += targetStep * 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestId = id;
      }
    });

    moveToken(pIdx, bestId, points);
  }

  function renderTokens() {
    document.querySelectorAll('.token').forEach(t => t.remove());

    const isTeam = GameState.isTeamMode;
    const slotMap = { 0: 'bottom', 1: 'right', 2: 'top', 3: 'left' };

    for (let s = 0; s < 4; s++) {
      const porchEl = document.getElementById(`porch-${slotMap[s]}`);
      let isActiveSlot = false;
      if (isTeam) {
        isActiveSlot = GameState.teamAxis === 'TB' ? (s === 0 || s === 2) : (s === 1 || s === 3);
      } else {
        isActiveSlot = GameState.activeSlots.includes(s);
      }
      if (porchEl) {
        if (isActiveSlot) porchEl.classList.remove('porch-inactive');
        else porchEl.classList.add('porch-inactive');
      }
    }

    Object.keys(GameState.tokens).forEach(groupKey => {
      let baseSlot = 0;
      let colorKey = 'red';

      if (isTeam) {
        const teamId = groupKey === 'team_1' ? 1 : 2;
        baseSlot = GameState.teamAxis === 'TB' ? (teamId === 1 ? 0 : 2) : (teamId === 1 ? 3 : 1);
        colorKey = GameState.colors[groupKey];
      } else {
        const pIdx = parseInt(groupKey.replace('player_', ''), 10);
        baseSlot = getBaseSlotForPlayer(pIdx);
        colorKey = GameState.colors[pIdx];
      }

      GameState.tokens[groupKey].forEach(t => {
        const el = document.createElement('div');
        el.className = `token color-${colorKey}`;
        el.dataset.group = groupKey;
        el.dataset.tokenId = t.id;

        // ONLY active player can hover or click their own tokens
        el.onmouseenter = () => {
          const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];
          const activeGroupKey = isTeam ? `team_${getTeamForPlayer(curPlayer)}` : `player_${curPlayer}`;
          if (groupKey === activeGroupKey && t.state === 'track') {
            showPathPreview(curPlayer, t.id);
          }
        };
        el.onmouseleave = () => clearPathPreviews();

        el.onclick = (e) => {
          e.stopPropagation();
          const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];
          const activeGroupKey = isTeam ? `team_${getTeamForPlayer(curPlayer)}` : `player_${curPlayer}`;
          if (groupKey === activeGroupKey) {
            onTokenClick(curPlayer, t.id);
          }
        };

        if (t.state === 'porch') {
          const porchEl = document.getElementById(`porch-${slotMap[baseSlot]}`);
          if (porchEl) porchEl.appendChild(el);
        } else if (t.state === 'track' || t.state === 'home') {
          const coord = SLOT_PATHS[baseSlot][t.step];
          const cell = document.querySelector(`.board-cell[data-r="${coord.r}"][data-c="${coord.c}"]`);
          if (cell) {
            let cluster = cell.querySelector('.tokens-cluster');
            if (!cluster) {
              cluster = document.createElement('div');
              cluster.className = 'tokens-cluster';
              cell.appendChild(cluster);
            }
            cluster.appendChild(el);
          }
        }
      });
    });

    highlightMovableTokens();
  }

  /* ---------------------------------------------------------
     DYNAMIC STATION HEADERS & THEMED COLOR HARMONIZATION
     --------------------------------------------------------- */
  function updateStationHeaders() {
    const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];
    const isTeam = GameState.isTeamMode;
    const activeStation = getStationForPlayer(curPlayer);
    const curPlayerHex = getPlayerColorHex(curPlayer);

    const stLeft = document.getElementById('station-left');
    const nameLeft = document.getElementById('gavva-name-left');
    const badgeLeft = document.getElementById('gavva-unlock-left');
    const teamLeft = document.getElementById('gavva-team-left');
    const btnLeft = document.getElementById('btn-throw-left');
    const ptL = document.getElementById('roll-points-left');
    const lbL = document.getElementById('roll-label-left');

    const stRight = document.getElementById('station-right');
    const nameRight = document.getElementById('gavva-name-right');
    const badgeRight = document.getElementById('gavva-unlock-right');
    const teamRight = document.getElementById('gavva-team-right');
    const btnRight = document.getElementById('btn-throw-right');
    const ptR = document.getElementById('roll-points-right');
    const lbR = document.getElementById('roll-label-right');

    stLeft.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    stLeft.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    stRight.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    stRight.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';

    if (activeStation === 'left') {
      stLeft.classList.add('active-station');
      stLeft.classList.remove('disabled-station');
      stLeft.style.borderColor = curPlayerHex;
      stLeft.style.boxShadow = `0 0 25px ${curPlayerHex}66`;
      btnLeft.style.boxShadow = `0 4px 14px ${curPlayerHex}66`;

      stRight.classList.remove('active-station');
      stRight.classList.add('disabled-station');

      if (!GameState.hasThrown) {
        lbL.innerText = 'Tap to Throw';
        lbL.style.color = curPlayerHex;
        ptL.style.color = curPlayerHex;
      }
    } else {
      stRight.classList.add('active-station');
      stRight.classList.remove('disabled-station');
      stRight.style.borderColor = curPlayerHex;
      stRight.style.boxShadow = `0 0 25px ${curPlayerHex}66`;
      btnRight.style.boxShadow = `0 4px 14px ${curPlayerHex}66`;

      stLeft.classList.remove('active-station');
      stLeft.classList.add('disabled-station');

      if (!GameState.hasThrown) {
        lbR.innerText = 'Tap to Throw';
        lbR.style.color = curPlayerHex;
        ptR.style.color = curPlayerHex;
      }
    }

    let pLeft = 0;
    let pRight = 1;

    if (curPlayer % 2 === 0) {
      pLeft = curPlayer;
      pRight = (curPlayer === 0) ? 1 : 3;
    } else {
      pRight = curPlayer;
      pLeft = (curPlayer === 1) ? 0 : 2;
    }

    if (pLeft >= GameState.playerTurnOrder.length) pLeft = 0;
    if (pRight >= GameState.playerTurnOrder.length) pRight = 1;

    const pLeftHex = getPlayerColorHex(pLeft);
    const pRightHex = getPlayerColorHex(pRight);

    if (isTeam) {
      teamLeft.innerText = `TEAM 1 (PLAYER ${pLeft + 1})`;
    } else {
      teamLeft.innerText = `PLAYER ${pLeft + 1}`;
    }
    nameLeft.innerText = GameState.names[pLeft];
    nameLeft.style.color = pLeftHex;
    badgeLeft.className = `gavva-unlock-badge ${GameState.playerUnlocked[pLeft] ? 'unlocked' : 'locked'}`;
    badgeLeft.innerText = GameState.playerUnlocked[pLeft] ? '🔓 Unlocked' : '🔒 Needs 4 or 8';

    if (isTeam) {
      teamRight.innerText = `TEAM 2 (PLAYER ${pRight + 1})`;
    } else {
      teamRight.innerText = `PLAYER ${pRight + 1}`;
    }
    nameRight.innerText = GameState.names[pRight];
    nameRight.style.color = pRightHex;
    badgeRight.className = `gavva-unlock-badge ${GameState.playerUnlocked[pRight] ? 'unlocked' : 'locked'}`;
    badgeRight.innerText = GameState.playerUnlocked[pRight] ? '🔓 Unlocked' : '🔒 Needs 4 or 8';
  }

  function updateTurnUI() {
    const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];
    const curName = GameState.names[curPlayer];
    const isBot = GameState.roles[curPlayer] === 'bot';

    GameState.playerTurnOrder.forEach(p => {
      const pill = document.getElementById(`pill-player-${p}`);
      if (pill) {
        if (p === curPlayer) pill.classList.add('active');
        else pill.classList.remove('active');
      }
    });

    const ann = document.getElementById('turn-announcer');
    if (ann) {
      ann.innerText = isBot
        ? `${curName} (Bot) is throwing cowrie shells...`
        : `${curName}'s Turn — Throw the cowrie shells!`;
    }
  }

  function updateScores() {
    const isTeam = GameState.isTeamMode;
    if (isTeam) {
      const wonT1 = GameState.tokens['team_1'].filter(t => t.state === 'home').length;
      const wonT2 = GameState.tokens['team_2'].filter(t => t.state === 'home').length;
      const score1 = document.getElementById('score-team-1');
      const score2 = document.getElementById('score-team-2');
      if (score1) score1.innerText = `${wonT1}/8 Win`;
      if (score2) score2.innerText = `${wonT2}/8 Win`;
    } else {
      GameState.playerTurnOrder.forEach(p => {
        const won = GameState.tokens[`player_${p}`].filter(t => t.state === 'home').length;
        const scoreEl = document.getElementById(`score-player-${p}`);
        if (scoreEl) scoreEl.innerText = `${won}/4 Win`;
      });
    }
  }

  function declareWinner(winnerId, isTeamWin) {
    Confetti.burst(180);
    SoundFX.win();

    const modal = document.getElementById('winner-modal');
    const title = document.getElementById('winner-title');
    const desc = document.getElementById('winner-desc');

    if (isTeamWin) {
      title.innerText = `🏆 Team ${winnerId} Wins!`;
      desc.innerText = `Outstanding match! All 8 coins reached the center sanctum!`;
      logFeed(`🏆 TEAM ${winnerId} CLAIMS VICTORY!`, 'entry');
    } else {
      const name = GameState.names[winnerId];
      title.innerText = `🏆 ${name} Wins!`;
      desc.innerText = `Congratulations! All 4 coins entered the center sanctum!`;
      logFeed(`🏆 ${name.toUpperCase()} WINS THE MATCH!`, 'entry');
    }

    const elapsedSecs = Math.floor((Date.now() - (GameState.startTime || Date.now())) / 1000);
    const mins = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
    const secs = String(elapsedSecs % 60).padStart(2, '0');

    document.getElementById('stat-time').innerText = `${mins}:${secs}`;
    document.getElementById('stat-turns').innerText = GameState.totalTurns;
    document.getElementById('stat-kills').innerText = GameState.totalKills;
    document.getElementById('stat-ashtas').innerText = GameState.totalAshtas;

    if (modal) modal.classList.remove('hidden');
  }

  function renderLobbyUI() {
    document.querySelectorAll('#lobby-modal .player-count-pills .pill-btn').forEach(btn => {
      const count = parseInt(btn.dataset.count, 10);
      if (count === LobbyState.playerCount) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    const teamSection = document.getElementById('team-format-section');
    if (teamSection) {
      teamSection.style.display = (LobbyState.playerCount === 4) ? 'flex' : 'none';
    }

    const btnSolo = document.getElementById('btn-mode-solo');
    const btnTeams = document.getElementById('btn-mode-teams');
    const axisPicker = document.getElementById('team-axis-picker');
    const axisTB = document.getElementById('axis-tb');
    const axisLR = document.getElementById('axis-lr');

    if (btnSolo && btnTeams) {
      if (LobbyState.isTeamMode && LobbyState.playerCount === 4) {
        btnTeams.classList.add('active');
        btnSolo.classList.remove('active');
        if (axisPicker) axisPicker.style.display = 'block';
        if (axisTB && axisLR) {
          if (LobbyState.teamAxis === 'TB') {
            axisTB.classList.add('active');
            axisLR.classList.remove('active');
          } else {
            axisLR.classList.add('active');
            axisTB.classList.remove('active');
          }
        }
      } else {
        btnSolo.classList.add('active');
        btnTeams.classList.remove('active');
        if (axisPicker) axisPicker.style.display = 'none';
      }
    }

    const container = document.getElementById('seats-config-container');
    if (!container) return;
    container.innerHTML = '';

    const colorKeys = Object.keys(COLOR_DEFS);

    if (LobbyState.playerCount === 4 && LobbyState.isTeamMode) {
      document.getElementById('profiles-section-label').innerText = '3. Team Setup (2 Colors Only - Teammates Share Color)';

      [1, 2].forEach(teamId => {
        const teamCard = document.createElement('div');
        teamCard.className = 'seat-row-card';

        const pA = (teamId === 1) ? 0 : 1;
        const pB = (teamId === 1) ? 2 : 3;

        const curTeamColor = LobbyState.teamColors[teamId];
        let chipsHTML = '';
        colorKeys.forEach(ck => {
          const def = COLOR_DEFS[ck];
          const isSelected = (ck === curTeamColor);
          chipsHTML += `
            <div class="mini-color-chip ${isSelected ? 'chip-active' : ''}" 
                 style="background-color: ${def.hex};" 
                 onclick="AshtaChamma.setTeamColor(${teamId}, '${ck}')"
                 title="${def.name}">
            </div>
          `;
        });

        teamCard.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:8px; width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="team-tag team-tag-${teamId}" style="font-size:0.8rem; padding:4px 10px;">Team ${teamId} (8 Coins)</span>
              <div class="seat-color-chips">${chipsHTML}</div>
            </div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <div style="display:flex; align-items:center; gap:6px;">
                <input type="text" class="seat-name-input" value="${LobbyState.names[pA]}" maxlength="12"
                  onchange="AshtaChamma.updateSlotName(${pA}, this.value)" placeholder="Player Name" />
                ${pA === 0 ? '<span style="font-size:0.72rem; color:#34d399; font-weight:700;">You</span>' : `
                  <button class="role-btn ${LobbyState.roles[pA] === 'bot' ? 'active' : ''}" style="background:#2b1f17; border:1px solid #4a3629; color:#cbd5e1; padding:4px 8px; border-radius:6px; cursor:pointer;" onclick="AshtaChamma.toggleBotRole(${pA})">${LobbyState.roles[pA] === 'bot' ? '🤖 Bot' : '👤 Human'}</button>
                `}
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <input type="text" class="seat-name-input" value="${LobbyState.names[pB]}" maxlength="12"
                  onchange="AshtaChamma.updateSlotName(${pB}, this.value)" placeholder="Teammate Name" />
                <button class="role-btn ${LobbyState.roles[pB] === 'bot' ? 'active' : ''}" style="background:#2b1f17; border:1px solid #4a3629; color:#cbd5e1; padding:4px 8px; border-radius:6px; cursor:pointer;" onclick="AshtaChamma.toggleBotRole(${pB})">${LobbyState.roles[pB] === 'bot' ? '🤖 Bot' : '👤 Human'}</button>
              </div>
            </div>
          </div>
        `;
        container.appendChild(teamCard);
      });
      return;
    }

    document.getElementById('profiles-section-label').innerText = '3. Player Profiles & Coin Colors';
    const count = LobbyState.playerCount;

    for (let p = 0; p < count; p++) {
      const card = document.createElement('div');
      card.className = 'seat-row-card';

      const curName = LobbyState.names[p] || `Player ${p + 1}`;
      const curColor = LobbyState.colors[p];
      const curRole = LobbyState.roles[p];

      let chipsHTML = '';
      colorKeys.forEach(ck => {
        const def = COLOR_DEFS[ck];
        const isSelected = (ck === curColor);
        chipsHTML += `
          <div class="mini-color-chip ${isSelected ? 'chip-active' : ''}" 
               style="background-color: ${def.hex};" 
               onclick="AshtaChamma.setSlotColor(${p}, '${ck}')"
               title="${def.name}">
          </div>
        `;
      });

      card.innerHTML = `
        <div class="seat-left-group">
          <input type="text" class="seat-name-input" value="${curName}" maxlength="12"
            onchange="AshtaChamma.updateSlotName(${p}, this.value)" placeholder="Name" />
          <div class="seat-color-chips">${chipsHTML}</div>
        </div>
        ${p === 0 ? `
          <span style="font-size:0.75rem; font-weight:700; color:#34d399;">You (P1)</span>
        ` : `
          <div class="role-toggle-group">
            <button class="role-btn ${curRole === 'human' ? 'active' : ''}" onclick="AshtaChamma.setSlotRole(${p}, 'human')">👤 Human</button>
            <button class="role-btn ${curRole === 'bot' ? 'active' : ''}" onclick="AshtaChamma.setSlotRole(${p}, 'bot')">🤖 Bot</button>
          </div>
        `}
      `;
      container.appendChild(card);
    }
  }

  function renderSeatsBar() {
    const bar = document.getElementById('players-bar');
    if (!bar) return;
    bar.innerHTML = '';

    const isTeam = GameState.isTeamMode;

    if (isTeam) {
      const t1Color = COLOR_DEFS[GameState.colors['team_1']].hex;
      const t2Color = COLOR_DEFS[GameState.colors['team_2']].hex;

      const p0 = GameState.names[0];
      const p1 = GameState.names[1];
      const p2 = GameState.names[2];
      const p3 = GameState.names[3];

      bar.innerHTML = `
        <div class="player-pill active" id="pill-player-0">
          <span class="color-dot" style="background-color: ${t1Color};"></span>
          <span class="p-name">${p0} & ${p2}</span>
          <span class="team-tag team-tag-1">Team 1 (8 Coins)</span>
          <span class="p-score" id="score-team-1">0/8 Win</span>
        </div>
        <div class="player-pill" id="pill-player-1">
          <span class="color-dot" style="background-color: ${t2Color};"></span>
          <span class="p-name">${p1} & ${p3}</span>
          <span class="team-tag team-tag-2">Team 2 (8 Coins)</span>
          <span class="p-score" id="score-team-2">0/8 Win</span>
        </div>
      `;
    } else {
      GameState.playerTurnOrder.forEach(p => {
        const name = GameState.names[p];
        const hex = COLOR_DEFS[GameState.colors[p]].hex;

        const pill = document.createElement('div');
        pill.className = 'player-pill';
        pill.id = `pill-player-${p}`;
        pill.innerHTML = `
          <span class="color-dot" style="background-color: ${hex};"></span>
          <span class="p-name">${name}</span>
          <span class="p-score" id="score-player-${p}">0/4 Win</span>
        `;
        bar.appendChild(pill);
      });
    }
  }

  /* ---------------------------------------------------------
     PUBLIC API
     --------------------------------------------------------- */
  window.AshtaChamma = {
    init() {
      Confetti.init();
      this.openLobby();
      renderLobbyUI();
    },

    openLobby() {
      document.getElementById('lobby-modal').classList.remove('hidden');
      renderLobbyUI();
    },

    closeLobby() {
      document.getElementById('lobby-modal').classList.add('hidden');
    },

    openLobbyFromWin() {
      Confetti.stop();
      document.getElementById('winner-modal').classList.add('hidden');
      this.openLobby();
    },

    openLobbyFromSettings() {
      this.closeSettings();
      this.openLobby();
    },

    openSettings() {
      document.getElementById('settings-modal').classList.remove('hidden');
      document.querySelectorAll('#settings-modal .theme-chip').forEach(chip => {
        if (chip.dataset.theme === GameState.boardTheme) chip.classList.add('active');
        else chip.classList.remove('active');
      });
    },

    closeSettings() {
      document.getElementById('settings-modal').classList.add('hidden');
    },

    setBoardTheme(themeName) {
      GameState.boardTheme = themeName;
      buildBoard();
      document.querySelectorAll('#settings-modal .theme-chip').forEach(chip => {
        if (chip.dataset.theme === themeName) chip.classList.add('active');
        else chip.classList.remove('active');
      });
      renderTokens();
    },

    toggleSound() {
      SoundFX.enabled = !SoundFX.enabled;
      const btn = document.getElementById('btn-toggle-sound');
      if (btn) {
        btn.innerText = SoundFX.enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      }
    },

    resetGameFromSettings() {
      this.closeSettings();
      this.resetGame();
    },

    clearFeed() {
      const list = document.getElementById('match-log-list');
      if (list) list.innerHTML = '';
    },

    setLobbyCount(count) {
      LobbyState.playerCount = count;
      if (count !== 4) LobbyState.isTeamMode = false;
      if (count === 1) {
        LobbyState.roles[0] = 'human';
        LobbyState.roles[1] = 'bot';
      }
      renderLobbyUI();
    },

    setTeamMode(isTeams) {
      if (LobbyState.playerCount === 4) {
        LobbyState.isTeamMode = isTeams;
      } else {
        LobbyState.isTeamMode = false;
      }
      renderLobbyUI();
    },

    setTeamAxis(axis) {
      LobbyState.teamAxis = axis;
      renderLobbyUI();
    },

    setTeamColor(teamId, colorKey) {
      LobbyState.teamColors[teamId] = colorKey;
      const otherTeam = (teamId === 1) ? 2 : 1;
      if (LobbyState.teamColors[otherTeam] === colorKey) {
        const available = Object.keys(COLOR_DEFS).find(c => c !== colorKey);
        LobbyState.teamColors[otherTeam] = available;
      }
      renderLobbyUI();
    },

    toggleBotRole(p) {
      LobbyState.roles[p] = (LobbyState.roles[p] === 'bot') ? 'human' : 'bot';
      renderLobbyUI();
    },

    updateSlotName(p, newName) {
      LobbyState.names[p] = newName.trim() || `Player ${p + 1}`;
    },

    setSlotColor(p, newColor) {
      LobbyState.colors[p] = newColor;
      renderLobbyUI();
    },

    setSlotRole(p, role) {
      LobbyState.roles[p] = role;
      renderLobbyUI();
    },

    startMatchFromLobby() {
      this.closeLobby();

      GameState.playerCount = LobbyState.playerCount;
      GameState.isTeamMode = (LobbyState.playerCount === 4 && LobbyState.isTeamMode);
      GameState.teamAxis = LobbyState.teamAxis;
      GameState.names = { ...LobbyState.names };
      GameState.roles = { ...LobbyState.roles };

      if (GameState.isTeamMode) {
        GameState.colors = {
          'team_1': LobbyState.teamColors[1],
          'team_2': LobbyState.teamColors[2]
        };
      } else {
        GameState.colors = { ...LobbyState.colors };
      }

      if (GameState.playerCount === 1 || GameState.playerCount === 2) {
        GameState.playerTurnOrder = [0, 1];
        GameState.activeSlots = [0, 2];
      } else if (GameState.playerCount === 3) {
        GameState.playerTurnOrder = [0, 1, 2];
        GameState.activeSlots = [0, 1, 2];
      } else {
        GameState.playerTurnOrder = [0, 1, 2, 3];
        GameState.activeSlots = GameState.isTeamMode 
          ? (GameState.teamAxis === 'TB' ? [0, 2] : [3, 1])
          : [0, 1, 2, 3];
      }

      const hudBadge = document.getElementById('hud-mode-badge');
      if (hudBadge) {
        if (GameState.isTeamMode) {
          hudBadge.innerText = `4 Players • 2 Teams (${GameState.teamAxis === 'TB' ? 'Top & Bottom' : 'Left & Right'})`;
        } else {
          hudBadge.innerText = `${GameState.playerCount} Players • Solo`;
        }
      }

      buildBoard();
      renderSeatsBar();
      this.resetGame();
    },

    resetGame() {
      Confetti.stop();
      clearAllHighlights();

      GameState.currentTurnIndex = 0;
      GameState.cowriePoints = null;
      GameState.hasThrown = false;
      GameState.isMoving = false;
      GameState.tokens = {};
      GameState.playerUnlocked = { 0: false, 1: false, 2: false, 3: false };

      GameState.startTime = Date.now();
      GameState.totalTurns = 0;
      GameState.totalKills = 0;
      GameState.totalAshtas = 0;

      // FIXED: Properly initialize token arrays so all coins spawn cleanly in the porches
      if (GameState.isTeamMode) {
        GameState.killRegistered = { 'team_1': false, 'team_2': false };
        GameState.tokens['team_1'] = [];
        GameState.tokens['team_2'] = [];
        for (let i = 0; i < 8; i++) {
          GameState.tokens['team_1'].push({ id: i, state: 'porch', step: -1 });
          GameState.tokens['team_2'].push({ id: i, state: 'porch', step: -1 });
        }
      } else {
        GameState.killRegistered = {};
        GameState.playerTurnOrder.forEach(p => {
          GameState.killRegistered[`player_${p}`] = false;
          GameState.tokens[`player_${p}`] = []; // Explicit empty array assignment
          for (let i = 0; i < 4; i++) {
            GameState.tokens[`player_${p}`].push({ id: i, state: 'porch', step: -1 });
          }
        });
      }

      const ptL = document.getElementById('roll-points-left');
      const ptR = document.getElementById('roll-points-right');
      const lbL = document.getElementById('roll-label-left');
      const lbR = document.getElementById('roll-label-right');
      if (ptL) ptL.innerText = '-';
      if (ptR) ptR.innerText = '-';
      if (lbL) lbL.innerText = 'Tap to Throw';
      if (lbR) lbR.innerText = 'Tap to Throw';

      document.getElementById('winner-modal').classList.add('hidden');
      document.getElementById('rules-modal').classList.add('hidden');
      document.getElementById('settings-modal').classList.add('hidden');

      this.clearFeed();
      logFeed('Match started! Tap cowries to roll.', 'sys');

      renderTokens();
      updateScores();
      updateTurnUI();
      updateStationHeaders();
    },

    rollCowries(stationSide) {
      const curPlayer = GameState.playerTurnOrder[GameState.currentTurnIndex];
      if (GameState.roles[curPlayer] === 'bot') return;
      throwCowries(stationSide);
    },

    openRules() {
      document.getElementById('rules-modal').classList.remove('hidden');
    },

    closeRules() {
      document.getElementById('rules-modal').classList.add('hidden');
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    window.AshtaChamma.init();
  });

})();