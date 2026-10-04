/* =========================================================================
   LUDO.JS - Dual-Mode Board: 2-4 Classical Square & 5-6 Radial Star Wheel
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     SYNTHESIZED SOUND ENGINE
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
    play(freq, type = 'sine', duration = 0.1, gainVal = 0.45) {
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
    roll() {
      this.play(340, 'triangle', 0.12, 0.45);
      setTimeout(() => this.play(480, 'sine', 0.08, 0.45), 70);
      setTimeout(() => this.play(600, 'triangle', 0.1, 0.5), 150);
    },
    move() { this.play(560, 'sine', 0.09, 0.4); },
    safeZone() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [587.33, 739.99, 880.00, 1174.66];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.045);
          gain.gain.setValueAtTime(0.38, now + idx * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.045);
          osc.stop(now + idx * 0.045 + 0.3);
        });
      } catch (_) {}
    },
    capture() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const punchOsc = this.ctx.createOscillator();
        const punchGain = this.ctx.createGain();
        punchOsc.type = 'sawtooth';
        punchOsc.frequency.setValueAtTime(340, now);
        punchOsc.frequency.exponentialRampToValueAtTime(45, now + 0.2);
        punchGain.gain.setValueAtTime(0.55, now);
        punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        punchOsc.connect(punchGain);
        punchGain.connect(this.ctx.destination);
        punchOsc.start(now);
        punchOsc.stop(now + 0.2);
      } catch (_) {}
    },
    win() {
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const chords = [523.25, 659.25, 783.99, 1046.50];
        chords.forEach((f, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.12);
          gain.gain.setValueAtTime(0.45, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.55);
        });
      } catch (_) {}
    }
  };

  /* ---------------------------------------------------------
     CLASSIC 15x15 SQUARE BOARD COORDINATES (IMAGE 1)
     --------------------------------------------------------- */
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

  const COLOR_DEFINITIONS = {
    red:    { name: 'Red', letter: 'R', hex: '#e63946' },
    blue:   { name: 'Blue', letter: 'B', hex: '#2563eb' },
    yellow: { name: 'Yellow', letter: 'Y', hex: '#fbbf24' },
    green:  { name: 'Green', letter: 'G', hex: '#059669' },
    orange: { name: 'Orange', letter: 'O', hex: '#f97316' },
    purple: { name: 'Purple', letter: 'P', hex: '#9333ea' }
  };

  const SLOT_CONFIGS = [
    { startIndex: 0, endTrackIndex: 51 },   // Red (Top-Left)
    { startIndex: 13, endTrackIndex: 11 },  // Blue (Top-Right)
    { startIndex: 26, endTrackIndex: 24 },  // Yellow (Bottom-Right)
    { startIndex: 39, endTrackIndex: 37 }   // Green (Bottom-Left)
  ];

  const LobbyState = {
    playerCount: 2,
    coinStyle: 'pawn',
    botDifficulty: 'hard',
    seatNames: { 0: 'Player 1', 1: 'Player 2', 2: 'Player 3', 3: 'Player 4', 4: 'Player 5', 5: 'Player 6' },
    seatColors: { 0: 'red', 1: 'blue', 2: 'yellow', 3: 'green', 4: 'orange', 5: 'purple' },
    seatRoles: { 0: 'human', 1: 'bot', 2: 'human', 3: 'human', 4: 'human', 5: 'human' }
  };

  const GameState = {
    slotColors: ['red', 'blue', 'yellow', 'green', 'orange', 'purple'],
    activeSlots: [0, 2],
    exitedSlots: new Set(),
    finishedSlots: new Set(),
    rankings: [],
    seatNames: {},
    seatRoles: {},
    coinStyle: 'pawn',
    botDifficulty: 'hard',
    currentTurnSlot: 0,
    diceValue: null,
    hasRolled: false,
    isMoving: false,
    pendingExitSlot: null,
    matchActive: false,
    tokens: {},

    isBot(slot) {
      return this.seatRoles[slot] === 'bot';
    }
  };

  /* ---------------------------------------------------------
     DUAL-MODE RENDER ENGINE
     --------------------------------------------------------- */
  const RenderEngine = {
    buildBoard() {
      const board = document.getElementById('ludo-board');
      board.innerHTML = '';

      const count = GameState.activeSlots.length;

      if (count <= 4) {
        // ==========================================
        // MODE A: CLASSIC 15x15 SQUARE (IMAGE 1, 21 & 22)
        // ==========================================
        board.className = 'ludo-board board-grid-15';

        // 4 Fixed Corner Home Bases matching Image 1
        [0, 1, 2, 3].forEach(slot => {
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
        });

        // Center Finish Zone
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

        // 15x15 Grid Cells
        for (let r = 0; r < 15; r++) {
          for (let c = 0; c < 15; c++) {
            const isBase0 = r < 6 && c < 6;   // Top-Left (Red)
            const isBase1 = r < 6 && c >= 9;  // Top-Right (Blue)
            const isBase2 = r >= 9 && c >= 9; // Bottom-Right (Yellow)
            const isBase3 = r >= 9 && c < 6;  // Bottom-Left (Green)
            const isCenter = (r >= 6 && r <= 8 && c >= 6 && c <= 8);

            if (isBase0 || isBase1 || isBase2 || isBase3 || isCenter) continue;

            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.style.gridRow = `${r + 1}`;
            cell.style.gridColumn = `${c + 1}`;

            // Runways & Start Cells
            if (r === 6 && c === 1) cell.classList.add(`color-${GameState.slotColors[0]}`);
            if (r === 7 && c >= 1 && c <= 5) cell.classList.add(`color-${GameState.slotColors[0]}`);

            if (r === 1 && c === 8) cell.classList.add(`color-${GameState.slotColors[1]}`);
            if (c === 7 && r >= 1 && r <= 5) cell.classList.add(`color-${GameState.slotColors[1]}`);

            if (r === 8 && c === 13) cell.classList.add(`color-${GameState.slotColors[2]}`);
            if (r === 7 && c >= 9 && c <= 13) cell.classList.add(`color-${GameState.slotColors[2]}`);

            if (r === 13 && c === 6) cell.classList.add(`color-${GameState.slotColors[3]}`);
            if (c === 7 && r >= 9 && r <= 13) cell.classList.add(`color-${GameState.slotColors[3]}`);

            // 4 Safe Star Cells Matching Image 1
            if ((r === 8 && c === 2) || (r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8)) {
              cell.classList.add('star-cell');
            }

            board.appendChild(cell);
          }
        }
      } else {
        // ==========================================
        // MODE B: RADIAL STAR BOARD (IMAGES 13 & 14)
        // ==========================================
        board.className = 'ludo-board board-radial';

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 1000 1000');
        svg.setAttribute('id', 'radial-board-svg');

        const cx = 500, cy = 500, outerR = 480, centerR = 120;
        const angleStep = (2 * Math.PI) / count;

        // Background Outer Polygon
        let polyPoints = '';
        for (let i = 0; i < count; i++) {
          const theta = i * angleStep - Math.PI / 2;
          polyPoints += `${cx + outerR * Math.cos(theta)},${cy + outerR * Math.sin(theta)} `;
        }
        const bg = document.createElementNS(svgNS, 'polygon');
        bg.setAttribute('points', polyPoints.trim());
        bg.setAttribute('fill', '#ffffff');
        bg.setAttribute('stroke', '#334155');
        bg.setAttribute('stroke-width', '14');
        svg.appendChild(bg);

        // Render N Radial Arms & Triangular Yards matching Images 13 & 14
        for (let i = 0; i < count; i++) {
          const slot = GameState.activeSlots[i];
          const colorKey = GameState.slotColors[slot];
          const def = COLOR_DEFINITIONS[colorKey] || COLOR_DEFINITIONS.red;
          const theta = i * angleStep - Math.PI / 2;
          const nextTheta = (i + 1) * angleStep - Math.PI / 2;

          const cosA = Math.cos(theta), sinA = Math.sin(theta);
          const cosN = Math.cos(nextTheta), sinN = Math.sin(nextTheta);

          // Outer Triangular Home Yard
          const tipX = cx + outerR * Math.cos((theta + nextTheta) / 2);
          const tipY = cy + outerR * Math.sin((theta + nextTheta) / 2);
          const p1x = cx + (outerR - 150) * cosA;
          const p1y = cy + (outerR - 150) * sinA;
          const p2x = cx + (outerR - 150) * cosN;
          const p2y = cy + (outerR - 150) * sinN;

          const yardOuter = document.createElementNS(svgNS, 'polygon');
          yardOuter.setAttribute('points', `${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`);
          yardOuter.setAttribute('fill', def.hex);
          yardOuter.setAttribute('stroke', '#334155');
          yardOuter.setAttribute('stroke-width', '4');
          svg.appendChild(yardOuter);

          const yardInner = document.createElementNS(svgNS, 'polygon');
          yardInner.setAttribute('points', `
            ${tipX * 0.88 + cx * 0.12},${tipY * 0.88 + cy * 0.12} 
            ${p1x * 0.92 + cx * 0.08},${p1y * 0.92 + cy * 0.08} 
            ${p2x * 0.92 + cx * 0.08},${p2y * 0.92 + cy * 0.08}
          `);
          yardInner.setAttribute('fill', '#ffffff');
          yardInner.setAttribute('stroke', '#475569');
          yardInner.setAttribute('stroke-width', '2.5');
          svg.appendChild(yardInner);

          // 4 Token Pockets inside Yard
          const yardCenterX = (tipX + p1x + p2x) / 3;
          const yardCenterY = (tipY + p1y + p2y) / 3;
          for (let pId = 0; pId < 4; pId++) {
            const circle = document.createElementNS(svgNS, 'circle');
            const offsetX = (pId % 2 === 0 ? -18 : 18);
            const offsetY = (pId < 2 ? -14 : 14);
            circle.setAttribute('cx', yardCenterX + offsetX);
            circle.setAttribute('cy', yardCenterY + offsetY);
            circle.setAttribute('r', '16');
            circle.setAttribute('fill', def.hex);
            circle.setAttribute('stroke', '#ffffff');
            circle.setAttribute('stroke-width', '2.5');
            circle.id = `radial-pocket-${slot}-${pId}`;
            svg.appendChild(circle);
          }

          // 5-Step Colored Home Runway
          for (let s = 0; s < 5; s++) {
            const rDist = centerR + 30 + s * 46;
            const laneX = cx + rDist * Math.cos((theta + nextTheta) / 2);
            const laneY = cy + rDist * Math.sin((theta + nextTheta) / 2);

            const laneCell = document.createElementNS(svgNS, 'circle');
            laneCell.setAttribute('cx', laneX);
            laneCell.setAttribute('cy', laneY);
            laneCell.setAttribute('r', '17');
            laneCell.setAttribute('fill', def.hex);
            laneCell.setAttribute('stroke', '#ffffff');
            laneCell.setAttribute('stroke-width', '2.5');
            svg.appendChild(laneCell);
          }

          // Central Goal Slices
          const g1x = cx + centerR * cosA;
          const g1y = cy + centerR * sinA;
          const g2x = cx + centerR * cosN;
          const g2y = cy + centerR * sinN;

          const goalSlice = document.createElementNS(svgNS, 'polygon');
          goalSlice.setAttribute('points', `${cx},${cy} ${g1x},${g1y} ${g2x},${g2y}`);
          goalSlice.setAttribute('fill', def.hex);
          goalSlice.setAttribute('stroke', '#ffffff');
          goalSlice.setAttribute('stroke-width', '2');
          svg.appendChild(goalSlice);
        }

        // Center Medallion Die Hub
        const hub = document.createElementNS(svgNS, 'circle');
        hub.setAttribute('cx', cx);
        hub.setAttribute('cy', cy);
        hub.setAttribute('r', '38');
        hub.setAttribute('fill', '#0284c7');
        hub.setAttribute('stroke', '#ffffff');
        hub.setAttribute('stroke-width', '4');
        svg.appendChild(hub);

        const hubText = document.createElementNS(svgNS, 'text');
        hubText.setAttribute('x', cx);
        hubText.setAttribute('y', cy + 9);
        hubText.setAttribute('fill', '#ffffff');
        hubText.setAttribute('font-size', '26');
        hubText.setAttribute('font-weight', '900');
        hubText.setAttribute('text-anchor', 'middle');
        hubText.textContent = '⚅';
        svg.appendChild(hubText);

        board.appendChild(svg);
      }

      const arena = document.getElementById('arena-stage');
      if (arena) {
        arena.className = `arena-stage mode-${count}p`;
      }
    },

    renderTokens() {
      document.querySelectorAll('.token').forEach(t => t.remove());
      document.querySelectorAll('.tokens-stack').forEach(s => s.remove());
      document.querySelectorAll('.svg-token').forEach(t => t.remove());

      const count = GameState.activeSlots.length;
      const svg = document.getElementById('radial-board-svg');

      GameState.activeSlots.forEach((slot, i) => {
        if (GameState.exitedSlots.has(slot)) return;

        const colorKey = GameState.slotColors[slot];
        const def = COLOR_DEFINITIONS[colorKey] || COLOR_DEFINITIONS.red;
        const styleClass = `token-style-${GameState.coinStyle}`;

        GameState.tokens[slot].forEach(token => {
          if (count <= 4) {
            // HTML DOM Tokens for 2-4 Players
            const el = document.createElement('div');
            el.className = `token ${styleClass} ${colorKey}-piece`;
            el.dataset.slot = slot;
            el.dataset.tokenId = token.id;
            el.onclick = (e) => {
              e.stopPropagation();
              GameEngine.onTokenClick(slot, token.id);
            };

            if (token.state === 'home') {
              const pocket = document.getElementById(`pocket-${slot}-${token.id}`);
              if (pocket) pocket.appendChild(el);
            } else if (token.state === 'track') {
              const coords = TRACK_COORDS[token.step];
              this.placeToken(el, coords.r, coords.c);
            } else if (token.state === 'runway') {
              const runwayArr = RUNWAY_COORDS[slot] || RUNWAY_COORDS[0];
              const coords = runwayArr[token.step];
              if (coords) this.placeToken(el, coords.r, coords.c);
            } else if (token.state === 'finish') {
              const finishCluster = document.getElementById(`finish-cluster-${slot}`);
              if (finishCluster) finishCluster.appendChild(el);
            }
          } else if (svg) {
            // Vector SVG Tokens for 5-6 Players
            const svgNS = 'http://www.w3.org/2000/svg';
            const g = document.createElementNS(svgNS, 'g');
            g.setAttribute('class', 'svg-token');
            g.dataset.slot = slot;
            g.dataset.tokenId = token.id;
            g.onclick = (e) => {
              e.stopPropagation();
              GameEngine.onTokenClick(slot, token.id);
            };

            let px = 500, py = 500;

            if (token.state === 'home') {
              const pocket = document.getElementById(`radial-pocket-${slot}-${token.id}`);
              if (pocket) {
                px = parseFloat(pocket.getAttribute('cx'));
                py = parseFloat(pocket.getAttribute('cy'));
              }
            } else if (token.state === 'track' || token.state === 'runway') {
              const angleStep = (2 * Math.PI) / count;
              const theta = i * angleStep - Math.PI / 2;
              const nextTheta = (i + 1) * angleStep - Math.PI / 2;
              const rDist = 150 + ((token.step + token.id) % 5) * 46;
              px = 500 + rDist * Math.cos((theta + nextTheta) / 2);
              py = 500 + rDist * Math.sin((theta + nextTheta) / 2);
            } else if (token.state === 'finish') {
              const angleStep = (2 * Math.PI) / count;
              const theta = (i + 0.5) * angleStep - Math.PI / 2;
              px = 500 + 60 * Math.cos(theta);
              py = 500 + 60 * Math.sin(theta);
            }

            g.setAttribute('transform', `translate(${px}, ${py})`);
            g.innerHTML = `
              <ellipse cx="0" cy="8" rx="12" ry="5" fill="rgba(0,0,0,0.35)"/>
              <path d="M -11 6 C -11 0, -4 -7, -4 -13 C -7 -15, -7 -21, 0 -21 C 7 -21, 7 -15, 4 -13 C 4 -7, 11 0, 11 6 Z" fill="${def.hex}" stroke="#ffffff" stroke-width="2"/>
              <circle cx="-2" cy="-15" r="3" fill="#ffffff" opacity="0.6"/>
            `;
            svg.appendChild(g);
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
      document.querySelectorAll('.svg-token').forEach(t => t.classList.remove('highlight-move'));

      if (!GameState.hasRolled || GameState.diceValue === null) return;
      if (GameState.exitedSlots.has(GameState.currentTurnSlot)) return;

      const movable = GameEngine.getMovableTokens(GameState.currentTurnSlot, GameState.diceValue);
      movable.forEach(id => {
        const el = document.querySelector(`.token[data-slot="${GameState.currentTurnSlot}"][data-tokenId="${id}"]`);
        if (el) el.classList.add('highlight-move');

        const svgEl = document.querySelector(`.svg-token[data-slot="${GameState.currentTurnSlot}"][data-token-id="${id}"]`);
        if (svgEl) svgEl.classList.add('highlight-move');
      });
    },

    updateTurnUI() {
      const currentSlot = GameState.currentTurnSlot;
      const isBot = GameState.isBot(currentSlot);
      const name = GameState.seatNames[currentSlot] || `Player ${currentSlot + 1}`;

      for (let s = 0; s < 6; s++) {
        const prof = document.getElementById(`profile-slot-${s}`);
        if (prof) {
          if (s === currentSlot && !GameState.exitedSlots.has(s) && !GameState.finishedSlots.has(s)) {
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
        if (GameState.finishedSlots.has(slot)) {
          scoreEl.innerText = 'Finished 👑';
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
          const customName = GameState.seatNames[s] || `Player ${s + 1}`;
          nameEl.innerText = isBot ? `${customName} (Bot)` : customName;
          nameEl.style.color = def.hex;
        }

        if (exitBtn) {
          if (isActive && !isExited && !isBot) {
            exitBtn.style.display = 'inline-block';
          } else {
            exitBtn.style.display = 'none';
          }
        }
      }

      const modeBadge = document.getElementById('hud-mode-badge');
      if (modeBadge) {
        modeBadge.innerText = `${GameState.activeSlots.length} Players`;
      }
    }
  };

  /* ---------------------------------------------------------
     GAME ENGINE
     --------------------------------------------------------- */
  const GameEngine = {
    rollDice() {
      if (GameState.isMoving || GameState.hasRolled) return;
      const currentSlot = GameState.currentTurnSlot;
      if (GameState.exitedSlots.has(currentSlot) || GameState.finishedSlots.has(currentSlot)) {
        this.nextTurn();
        return;
      }

      SoundFX.roll();
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
        document.getElementById('turn-announcer').innerText = `${name} ${isBot ? '(Bot)' : ''} rolled a ${GameState.diceValue}!`;

        const movable = this.getMovableTokens(currentSlot, GameState.diceValue);

        if (movable.length === 0) {
          document.getElementById('turn-announcer').innerText = `${name} rolled ${GameState.diceValue}. No moves available!`;
          setTimeout(() => this.nextTurn(), 1000);
        } else {
          RenderEngine.highlightMovableTokens();

          if (movable.length === 1) {
            setTimeout(() => {
              this.onTokenClick(currentSlot, movable[0]);
            }, 450);
          } else if (isBot) {
            setTimeout(() => this.botMove(currentSlot, movable), 650);
          }
        }
      }, 650);
    },

    getMovableTokens(slot, roll) {
      if (GameState.exitedSlots.has(slot) || GameState.finishedSlots.has(slot)) return [];
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
      if (GameState.exitedSlots.has(slot) || GameState.finishedSlots.has(slot)) return;

      const movable = this.getMovableTokens(GameState.currentTurnSlot, GameState.diceValue);
      if (!movable.includes(tokenId)) return;

      this.moveToken(slot, tokenId, GameState.diceValue);
    },

    moveToken(slot, tokenId, steps) {
      GameState.isMoving = true;
      SoundFX.move();
      const token = GameState.tokens[slot][tokenId];
      const config = SLOT_CONFIGS[slot] || SLOT_CONFIGS[0];

      if (token.state === 'home') {
        token.state = 'track';
        token.step = config.startIndex;
        SoundFX.safeZone();
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
            SoundFX.safeZone();
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

      if (token.state === 'track' && (token.step === 8 || token.step === 21 || token.step === 34 || token.step === 47)) {
        SoundFX.safeZone();
      }

      if (token.state === 'track' && !(token.step === 8 || token.step === 21 || token.step === 34 || token.step === 47)) {
        GameState.activeSlots.forEach(otherSlot => {
          if (otherSlot !== slot && !GameState.exitedSlots.has(otherSlot) && !GameState.finishedSlots.has(otherSlot)) {
            GameState.tokens[otherSlot].forEach(otherToken => {
              if (otherToken.state === 'track' && otherToken.step === token.step) {
                otherToken.state = 'home';
                otherToken.step = -1;
                SoundFX.capture();
                getsBonus = true;
                const killer = GameState.seatNames[slot] || `Player ${slot + 1}`;
                const victim = GameState.seatNames[otherSlot] || `Player ${otherSlot + 1}`;
                document.getElementById('turn-announcer').innerText = `💥 ${killer} captured ${victim}'s coin! Extra turn!`;
              }
            });
          }
        });
      }

      if (token.state === 'finish') {
        SoundFX.safeZone();
        getsBonus = true;
      }

      RenderEngine.renderTokens();
      RenderEngine.updateScores();

      const allFinished = GameState.tokens[slot].every(t => t.state === 'finish');
      if (allFinished && !GameState.finishedSlots.has(slot)) {
        GameState.finishedSlots.add(slot);
        GameState.rankings.push(slot);

        const totalActive = GameState.activeSlots.filter(s => !GameState.exitedSlots.has(s)).length;
        const requiredFinishes = Math.max(1, totalActive - 1);

        if (GameState.finishedSlots.size >= requiredFinishes || GameState.rankings.length >= totalActive - 1) {
          this.concludeMatchCompletely();
          return;
        }
      }

      this.finishMove(slot, getsBonus);
    },

    finishMove(slot, getsBonus) {
      RenderEngine.renderTokens();
      GameState.isMoving = false;
      GameState.hasRolled = false;

      if (GameState.finishedSlots.has(slot)) {
        this.nextTurn();
        return;
      }

      if (getsBonus) {
        const name = GameState.seatNames[slot] || `Player ${slot + 1}`;
        document.getElementById('turn-announcer').innerText = `${name} rolled a 6! Roll again.`;
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

      const liveSlots = GameState.activeSlots.filter(s => !GameState.exitedSlots.has(s) && !GameState.finishedSlots.has(s));
      if (liveSlots.length <= 1) {
        if (liveSlots.length === 1 && GameState.finishedSlots.size > 0) {
          GameState.rankings.push(liveSlots[0]);
        }
        this.concludeMatchCompletely();
        return;
      }

      let currentIdx = GameState.activeSlots.indexOf(GameState.currentTurnSlot);
      let attempts = 0;
      do {
        currentIdx = (currentIdx + 1) % GameState.activeSlots.length;
        attempts++;
      } while ((GameState.exitedSlots.has(GameState.activeSlots[currentIdx]) || GameState.finishedSlots.has(GameState.activeSlots[currentIdx])) && attempts < 14);

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
        this.moveToken(slot, movableIds[0], roll);
        return;
      }

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
            return GameState.tokens[other].some(ot => ot.state === 'track' && ot.step === targetPos && !(targetPos === 8 || targetPos === 21 || targetPos === 34 || targetPos === 47));
          });
          if (canCap) score += 200;
          if (targetPos === 8 || targetPos === 21 || targetPos === 34 || targetPos === 47) score += 80;
          score += (t.step % 52);
        }
        if (score > highestScore) { highestScore = score; bestId = id; }
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
            return GameState.tokens[other].some(ot => ot.state === 'track' && ot.step === targetPos && !(targetPos === 8 || targetPos === 21 || targetPos === 34 || targetPos === 47));
          });
          if (canCap) return id;
        }
      }
      return null;
    },

    concludeMatchCompletely() {
      GameState.activeSlots.forEach(s => {
        if (!GameState.rankings.includes(s) && !GameState.exitedSlots.has(s)) {
          GameState.rankings.push(s);
        }
      });

      SoundFX.win();

      const modal = document.getElementById('winner-modal');
      const title = document.getElementById('winner-title');
      const rankingsList = document.getElementById('rankings-list');
      const winnerSlot = GameState.rankings[0] !== undefined ? GameState.rankings[0] : 0;
      const winnerName = GameState.seatNames[winnerSlot] || `Player ${winnerSlot + 1}`;

      if (title) title.innerText = `🏆 ${winnerName} Wins 1st Place!`;

      if (rankingsList) {
        rankingsList.innerHTML = '';
        GameState.rankings.forEach((slot, index) => {
          const name = GameState.seatNames[slot] || `Player ${slot + 1}`;
          const isBot = GameState.isBot(slot);
          const colorKey = GameState.slotColors[slot];
          const def = COLOR_DEFINITIONS[colorKey] || COLOR_DEFINITIONS.red;

          const row = document.createElement('div');
          row.style.cssText = `display: flex; justify-content: space-between; align-items: center; background: #0f172a; padding: 8px 14px; border-radius: 8px; border: 1px solid ${index === 0 ? '#fbbf24' : '#334155'};`;
          
          row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 900; color: ${index === 0 ? '#fbbf24' : '#94a3b8'};">#${index + 1}</span>
              <span style="width: 14px; height: 14px; border-radius: 50%; background: ${def.hex}; display: inline-block;"></span>
              <span style="font-weight: 700; color: #f8fafc;">${name} ${isBot ? '(Bot)' : ''}</span>
            </div>
            <span style="font-size: 0.75rem; font-weight: 700; color: ${index === 0 ? '#fbbf24' : '#94a3b8'};">${index === 0 ? '👑 Winner' : 'Finished'}</span>
          `;
          rankingsList.appendChild(row);
        });
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

    lobbyBack() {
      window.location.href = '../../index.html';
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
      for (let i = 0; i < 6; i++) {
        if (i < count) {
          if (i === 0) LobbyState.seatRoles[i] = 'human';
          else if (LobbyState.seatRoles[i] === undefined) LobbyState.seatRoles[i] = 'bot';
        }
      }
      this.ensureUniqueQuadrantColors();
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
      this.ensureUniqueQuadrantColors();
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
      if (count === 2) return [0, 2];
      if (count === 3) return [0, 1, 2];
      if (count === 4) return [0, 1, 2, 3];
      if (count === 5) return [0, 1, 2, 3, 4];
      return [0, 1, 2, 3, 4, 5];
    },

    ensureUniqueQuadrantColors() {
      const all6 = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
      const activeList = this.getActiveSlotsForCount(LobbyState.playerCount);
      const assigned = [];

      activeList.forEach(slot => {
        let color = LobbyState.seatColors[slot];
        if (!color || assigned.includes(color)) {
          color = all6.find(c => !assigned.includes(c)) || all6[0];
          LobbyState.seatColors[slot] = color;
        }
        assigned.push(color);
      });
    },

    refreshLobbyUI() {
      document.querySelectorAll('#player-count-pills .pill-btn').forEach(btn => {
        const c = parseInt(btn.dataset.count, 10);
        if (c === LobbyState.playerCount) btn.classList.add('active');
        else btn.classList.remove('active');
      });

      document.querySelectorAll('#coin-style-selector .coin-option-card').forEach(card => {
        if (card.dataset.style === LobbyState.coinStyle) card.classList.add('active');
        else card.classList.remove('active');
      });

      const container = document.getElementById('seats-config-container');
      if (container) {
        container.innerHTML = '';
        const activeSlotList = this.getActiveSlotsForCount(LobbyState.playerCount);
        const allColors = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];

        const takenColors = {};
        activeSlotList.forEach(s => {
          takenColors[LobbyState.seatColors[s]] = s;
        });

        activeSlotList.forEach((slot, index) => {
          const selectedColor = LobbyState.seatColors[slot];
          const isPlayer1 = (slot === 0);
          const currentRole = LobbyState.seatRoles[slot] || 'human';
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
              <div class="${chipClass}" style="background-color: ${def.hex};" ${clickAttr} title="${def.name}">
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
                <button class="role-btn ${currentRole === 'human' ? 'active' : ''}" onclick="LudoModule.toggleSeatRole(${slot}, 'human')">👤 Player</button>
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

      const activeSlotList = this.getActiveSlotsForCount(LobbyState.playerCount);
      const anyBotActive = activeSlotList.some(s => s !== 0 && LobbyState.seatRoles[s] === 'bot');
      
      const botSection = document.getElementById('bot-difficulty-section');
      if (botSection) {
        botSection.style.display = anyBotActive ? 'flex' : 'none';
      }

      document.querySelectorAll('#difficulty-pills .diff-btn').forEach(btn => {
        if (btn.dataset.level === LobbyState.botDifficulty) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    },

    startConfiguredMatch() {
      this.closeLobby();
      this.ensureUniqueQuadrantColors();

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
      GameState.finishedSlots = new Set();
      GameState.rankings = [];
      GameState.seatRoles = { ...LobbyState.seatRoles };
      GameState.seatNames = { ...LobbyState.seatNames };
      GameState.coinStyle = LobbyState.coinStyle;
      GameState.botDifficulty = LobbyState.botDifficulty;
      GameState.matchActive = true;

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
      document.getElementById('quit-modal').classList.add('hidden');
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

    confirmQuit() {
      const modal = document.getElementById('quit-modal');
      if (modal) modal.classList.remove('hidden');
    },

    cancelQuit() {
      const modal = document.getElementById('quit-modal');
      if (modal) modal.classList.add('hidden');
    },

    executeQuit() {
      this.cancelQuit();
      GameState.matchActive = false;
      this.openLobby();
    },

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

      const liveSlots = GameState.activeSlots.filter(s => !GameState.exitedSlots.has(s) && !GameState.finishedSlots.has(s));
      if (liveSlots.length <= 1) {
        if (liveSlots.length === 1 && GameState.finishedSlots.size > 0) {
          GameState.rankings.push(liveSlots[0]);
        }
        GameEngine.concludeMatchCompletely();
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