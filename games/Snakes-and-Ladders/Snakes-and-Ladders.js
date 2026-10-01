(function () {
  'use strict';

  /* ==========================================================================
     SNAKES & LADDERS MASTER ENGINE
     - Fully Distinct Non-Overlapping Board Maps (P1 != P2 != P3...)
     - Realistic Anatomical Serpents (Varied Sizes: Mega, Large, Medium, Short)
     - Continuous 360° 3D Tumble Dice Rotation
     ========================================================================== */
  const SnakesAndLadders = {
    currentTheme: 'cartoon',
    matchInProgress: false,

    diceAngleX: 0,
    diceAngleY: 0,

    FACE_ROTATIONS: {
      1: { x: 0,   y: 0 },
      2: { x: 90,  y: 0 },
      3: { x: 0,   y: -90 },
      4: { x: 0,   y: 90 },
      5: { x: -90, y: 0 },
      6: { x: 0,   y: 180 }
    },

    /* --------------------------------------------------------------------------
       5 DISTINCT BOARD SCHEMATICS (P1 != P2 != P3...)
       - Maximum 1-3 clean touchpoints per board
       - 7 distinct snakes with varying lengths (Mega down to Short)
       -------------------------------------------------------------------------- */
    THEMES_DATA: {
      // 1. Classic Cartoon (Layout P1)
      cartoon: {
        name: 'Classic Cartoon (P1)',
        ladderName: 'Wooden Ladder',
        snakeName: 'Cartoon Boa',
        ladders: {
          2: 38,
          8: 31,
          21: 42,
          36: 77,
          51: 67,
          71: 92,
          78: 98
        },
        snakes: {
          95: 24, // Mega (drops 71)
          88: 48, // Large (drops 40)
          74: 53, // Medium (drops 21)
          62: 19, // Medium (drops 43)
          47: 26, // Small (drops 21)
          34: 12, // Short (drops 22)
          99: 79  // Short (drops 20)
        },
        skins: {
          95: { body: '#15803d', belly: '#fef08a', pattern: '#b45309', head: '#166534', eye: '#facc15', name: 'Apex Titan Boa' },
          88: { body: '#c2410c', belly: '#fed7aa', pattern: '#7c2d12', head: '#9a3412', eye: '#fef08a', name: 'Flame Viper' },
          74: { body: '#2563eb', belly: '#bfdbfe', pattern: '#1d4ed8', head: '#1d4ed8', eye: '#ffffff', name: 'Cobalt Adder' },
          62: { body: '#9333ea', belly: '#f5d0fe', pattern: '#6b21a8', head: '#7e22ce', eye: '#fde047', name: 'Amethyst Slither' },
          47: { body: '#059669', belly: '#a7f3d0', pattern: '#047857', head: '#047857', eye: '#fef08a', name: 'Emerald Asp' },
          34: { body: '#dc2626', belly: '#fee2e2', pattern: '#991b1b', head: '#b91c1c', eye: '#facc15', name: 'Ruby Striker' },
          99: { body: '#ea580c', belly: '#ffedd5', pattern: '#c2410c', head: '#c2410c', eye: '#ffffff', name: 'Crowned Python' }
        }
      },

      // 2. Realistic Jungle (Layout P2 != P1)
      jungle: {
        name: 'Realistic Jungle (P2)',
        ladderName: 'Bamboo Ladder',
        snakeName: 'Pit Viper',
        ladders: {
          4: 25,
          13: 46,
          29: 50,
          41: 63,
          54: 85,
          69: 91,
          73: 93
        },
        snakes: {
          97: 35, // Mega (drops 62)
          83: 39, // Large (drops 44)
          89: 52, // Medium (drops 37)
          76: 43, // Medium (drops 33)
          58: 18, // Medium (drops 40)
          37: 16, // Small (drops 21)
          27: 7   // Short (drops 20)
        },
        skins: {
          97: { body: '#047857', belly: '#fef08a', scale: '#022c22', eye: '#facc15', name: 'Amazon Green Anaconda' },
          83: { body: '#b45309', belly: '#fed7aa', scale: '#451a03', eye: '#f59e0b', name: 'Diamondback Viper' },
          89: { body: '#15803d', belly: '#86efac', scale: '#052e16', eye: '#fbbf24', name: 'Emerald Tree Boa' },
          76: { body: '#78350f', belly: '#fef3c7', scale: '#292524', eye: '#f87171', name: 'Bushmaster' },
          58: { body: '#475569', belly: '#cbd5e1', scale: '#0f172a', eye: '#38bdf8', name: 'Black Rock Adder' },
          37: { body: '#c2410c', belly: '#ffedd5', scale: '#431407', eye: '#fef08a', name: 'Copperhead' },
          27: { body: '#991b1b', belly: '#fef08a', scale: '#000000', eye: '#ffffff', name: 'Harlequin Coral Snake' }
        }
      },

      // 3. Royal Gold (Layout P3 != P2 != P1)
      royal: {
        name: 'Royal Obsidian & Gold (P3)',
        ladderName: '24K Gilded Ladder',
        snakeName: 'Imperial Cobra',
        ladders: {
          5: 35,
          18: 43,
          23: 64,
          32: 53,
          50: 72,
          66: 87,
          79: 99
        },
        snakes: {
          94: 33, // Mega (drops 61)
          89: 48, // Large (drops 41)
          82: 41, // Large (drops 41)
          70: 29, // Medium (drops 41)
          60: 21, // Medium (drops 39)
          45: 14, // Small (drops 31)
          28: 9   // Short (drops 19)
        },
        skins: {
          94: { body: '#09090b', belly: '#eab308', scale: '#ca8a04', eye: '#ef4444', name: 'Grand Emperor Cobra' },
          89: { body: '#1e1b4b', belly: '#c084fc', scale: '#9333ea', eye: '#38bdf8', name: 'Midnight Sovereign' },
          82: { body: '#701a75', belly: '#f472b6', scale: '#d946ef', eye: '#fef08a', name: 'Gilded Basilisk' },
          70: { body: '#14532d', belly: '#4ade80', scale: '#16a34a', eye: '#fbbf24', name: 'Imperial Jade Serpent' },
          60: { body: '#1f2937', belly: '#9ca3af', scale: '#f3f4f6', eye: '#f43f5e', name: 'Silver Wyrm' },
          45: { body: '#7c2d12', belly: '#fdba74', scale: '#ea580c', eye: '#fef08a', name: 'Bronze Asp' },
          28: { body: '#831843', belly: '#fbcfe8', scale: '#db2777', eye: '#fef08a', name: 'Ruby Dragon' }
        }
      },

      // 4. Cyber Neon (Layout P4)
      cyber: {
        name: 'Cyber Neon (P4)',
        ladderName: 'Laser Energy Ladder',
        snakeName: 'Cyber Circuit Serpent',
        ladders: {
          6: 27,
          14: 34,
          26: 67,
          39: 59,
          52: 71,
          61: 82,
          75: 96
        },
        snakes: {
          98: 37, // Mega (drops 61)
          86: 45, // Large (drops 41)
          78: 47, // Medium (drops 31)
          69: 28, // Medium (drops 41)
          55: 24, // Small (drops 31)
          43: 12, // Small (drops 31)
          31: 10  // Short (drops 21)
        },
        skins: {
          98: { body: '#0f172a', belly: '#06b6d4', scale: '#38bdf8', eye: '#22d3ee', name: 'Quantum Cyber-Wyrm' },
          86: { body: '#18181b', belly: '#ec4899', scale: '#f43f5e', eye: '#fb7185', name: 'Neon Synth Hydra' },
          78: { body: '#0f172a', belly: '#10b981', scale: '#34d399', eye: '#4ade80', name: 'Matrix Viper' },
          69: { body: '#1e1b4b', belly: '#8b5cf6', scale: '#a78bfa', eye: '#c084fc', name: 'Void Drake' },
          55: { body: '#09090b', belly: '#f59e0b', scale: '#fbbf24', eye: '#fde047', name: 'Volt Serpent' },
          43: { body: '#172554', belly: '#3b82f6', scale: '#60a5fa', eye: '#93c5fd', name: 'Plasma Boa' },
          31: { body: '#450a0a', belly: '#ef4444', scale: '#f87171', eye: '#fca5a5', name: 'Overclock Python' }
        }
      },

      // 5. Lava Inferno (Layout P5)
      inferno: {
        name: 'Lava Inferno (P5)',
        ladderName: 'Forged Iron Ladder',
        snakeName: 'Molten Magma Wyrm',
        ladders: {
          3: 24,
          16: 37,
          22: 58,
          35: 66,
          48: 73,
          62: 83,
          74: 95
        },
        snakes: {
          96: 32, // Mega (drops 64)
          90: 51, // Large (drops 39)
          84: 44, // Large (drops 40)
          71: 30, // Medium (drops 41)
          57: 26, // Small (drops 31)
          42: 13, // Small (drops 29)
          28: 7   // Short (drops 21)
        },
        skins: {
          96: { body: '#18181b', belly: '#ef4444', scale: '#f97316', eye: '#fde047', name: 'Infernal Magma Titan' },
          90: { body: '#450a0a', belly: '#f97316', scale: '#fbbf24', eye: '#ffffff', name: 'Volcanic Hell-Adder' },
          84: { body: '#292524', belly: '#ea580c', scale: '#f97316', eye: '#fef08a', name: 'Molten Drake' },
          71: { body: '#1c1917', belly: '#dc2626', scale: '#ea580c', eye: '#fca5a5', name: 'Obsidian Pyro-Serpent' },
          57: { body: '#3f3f46', belly: '#f59e0b', scale: '#fde047', eye: '#ffffff', name: 'Ash Wyrm' },
          42: { body: '#27272a', belly: '#e11d48', scale: '#fb7185', eye: '#fef08a', name: 'Brimstone Viper' },
          28: { body: '#7f1d1d', belly: '#f97316', scale: '#fde047', eye: '#ffffff', name: 'Lava Scourge' }
        }
      }
    },

    PLAYER_CONFIGS: [
      { id: 0, name: 'Red Ranger', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', icon: 'fa-shield-halved' },
      { id: 1, name: 'Blue Knight', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', icon: 'fa-chess-knight' },
      { id: 2, name: 'Green Sage', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', icon: 'fa-wand-magic-sparkles' },
      { id: 3, name: 'Amber Rogue', color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', icon: 'fa-bolt' }
    ],

    players: [],
    currentPlayerIndex: 0,
    isRolling: false,
    soundEnabled: true,
    totalTurns: 0,
    audioCtx: null,

    /* --------------------------------------------------------------------------
       INIT
       -------------------------------------------------------------------------- */
    init() {
      this.cacheDOMElements();
      this.initAudio();
      this.buildBoard();
      this.bindEvents();
      this.renderLobbySlots(2);
      this.openLobby(false);
    },

    cacheDOMElements() {
      this.dom = {
        boardWrapper: document.getElementById('board-wrapper'),
        boardGrid: document.getElementById('board-grid'),
        boardSvg: document.getElementById('board-svg'),
        laddersGroup: document.getElementById('ladders-group'),
        snakesGroup: document.getElementById('snakes-group'),
        pawnsLayer: document.getElementById('pawns-layer'),
        playersList: document.getElementById('players-list'),
        playerCountBadge: document.getElementById('player-count-badge'),
        diceCube: document.getElementById('dice-cube'),
        rollBtn: document.getElementById('roll-button'),
        rollFeedback: document.getElementById('roll-feedback'),
        currentTurnName: document.getElementById('current-turn-name'),
        soundToggleBtn: document.getElementById('sound-toggle-btn'),
        rulesBtn: document.getElementById('rules-btn'),
        newGameBtn: document.getElementById('new-game-btn'),

        // Modals
        lobbyModal: document.getElementById('lobby-modal'),
        lobbySlots: document.getElementById('lobby-slots'),
        lobbyBackBtn: document.getElementById('lobby-back-btn'),
        startMatchBtn: document.getElementById('start-match-btn'),

        confirmModal: document.getElementById('confirm-modal'),
        acceptConfirmBtn: document.getElementById('accept-confirm-btn'),
        cancelConfirmBtn: document.getElementById('cancel-confirm-btn'),

        rulesModal: document.getElementById('rules-modal'),
        closeRulesBtn: document.getElementById('close-rules-btn'),
        rulesAckBtn: document.getElementById('rules-ack-btn'),

        victoryModal: document.getElementById('victory-modal'),
        winnerAnnouncement: document.getElementById('winner-announcement'),
        statTurns: document.getElementById('stat-turns'),
        statLadders: document.getElementById('stat-ladders'),
        statSnakes: document.getElementById('stat-snakes'),
        victoryReplayBtn: document.getElementById('victory-replay-btn')
      };
    },

    /* --------------------------------------------------------------------------
       THEME APPLICATION
       -------------------------------------------------------------------------- */
    applyTheme(themeName) {
      if (!this.THEMES_DATA[themeName]) return;
      this.currentTheme = themeName;
      this.dom.boardWrapper.className = `board-wrapper theme-${themeName}`;

      document.querySelectorAll('.theme-card-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
      });

      this.renderSVGLaddersAndSnakes();
    },

    /* --------------------------------------------------------------------------
       SYNTHESIZED AUDIO
       -------------------------------------------------------------------------- */
    initAudio() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      } catch (e) {
        console.warn('Audio Context not supported.');
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

      if (type === 'dice') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'ladder') {
        [440, 554, 659, 880].forEach((freq, idx) => {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.type = 'triangle';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.14, now + idx * 0.07);
          g.gain.linearRampToValueAtTime(0.01, now + idx * 0.07 + 0.16);
          o.start(now + idx * 0.07);
          o.stop(now + idx * 0.07 + 0.16);
        });
      } else if (type === 'snake') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.type = 'sine';
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.2, now + idx * 0.1);
          g.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);
          o.start(now + idx * 0.1);
          o.stop(now + idx * 0.1 + 0.4);
        });
      }
    },

    /* --------------------------------------------------------------------------
       BUILD 10x10 BOARD TILES
       -------------------------------------------------------------------------- */
    buildBoard() {
      this.dom.boardGrid.innerHTML = '';
      for (let r = 9; r >= 0; r--) {
        const isReverse = (r % 2 !== 0);
        for (let c = 0; c < 10; c++) {
          const colIndex = isReverse ? (9 - c) : c;
          const tileNumber = (r * 10) + colIndex + 1;

          const tileEl = document.createElement('div');
          tileEl.className = 'tile';
          tileEl.dataset.tileNumber = tileNumber;
          tileEl.id = `tile-${tileNumber}`;

          const colorIdx = (colIndex + r * 3) % 4;
          tileEl.classList.add(`tc-${colorIdx}`);

          let extraContent = '';
          if (tileNumber === 1) {
            tileEl.classList.add('tile-start');
            extraContent = '<span class="tile-badge-start">START</span>';
          } else if (tileNumber === 100) {
            tileEl.classList.add('tile-finish');
            extraContent = '<span class="tile-badge-finish">👑</span>';
          }

          tileEl.innerHTML = `
            <span class="tile-num">${tileNumber}</span>
            ${extraContent}
          `;
          this.dom.boardGrid.appendChild(tileEl);
        }
      }

      this.renderSVGLaddersAndSnakes();
    },

    getTileCoords(tileNumber) {
      const idx = tileNumber - 1;
      const row = Math.floor(idx / 10);
      const isReverse = (row % 2 !== 0);
      const col = isReverse ? (9 - (idx % 10)) : (idx % 10);

      const x = col * 100 + 50;
      const y = (9 - row) * 100 + 50;
      return { x, y };
    },

    generateSnakeSpline(p1, p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      const ux = dx / dist;
      const uy = dy / dist;
      const nx = -uy;
      const ny = ux;

      const points = [p1];
      const steps = Math.max(3, Math.min(6, Math.round(dist / 115)));
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const sign = (i % 2 === 1) ? 1 : -1;
        const waveAmp = Math.sin(t * Math.PI) * Math.min(48, dist * 0.2);
        const bx = p1.x + ux * (dist * t);
        const by = p1.y + uy * (dist * t);
        points.push({
          x: bx + nx * waveAmp * sign,
          y: by + ny * waveAmp * sign
        });
      }
      points.push(p2);

      let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const pCurrent = points[i];
        const pNext = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = pCurrent.x + (pNext.x - p0.x) / 6;
        const cp1y = pCurrent.y + (pNext.y - p0.y) / 6;
        const cp2x = pNext.x - (p3.x - pCurrent.x) / 6;
        const cp2y = pNext.y - (p3.y - pCurrent.y) / 6;

        pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${pNext.x.toFixed(1)} ${pNext.y.toFixed(1)}`;
      }
      return { pathD, points, dist };
    },

    /* --------------------------------------------------------------------------
       RENDER SVG (REALISTIC TAPERING, SCULPTED HEADS, NO OVERLAPPING)
       -------------------------------------------------------------------------- */
    renderSVGLaddersAndSnakes() {
      const theme = this.currentTheme;
      const themeData = this.THEMES_DATA[theme];
      const currentLadders = themeData.ladders;
      const currentSnakes = themeData.snakes;

      // 1. RENDER LADDERS
      let laddersHTML = '';
      Object.entries(currentLadders).forEach(([start, end]) => {
        const p1 = this.getTileCoords(Number(start));
        const p2 = this.getTileCoords(Number(end));

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const nx = -dy / dist * 13;
        const ny = dx / dist * 13;
        const rungs = Math.floor(dist / 34);

        if (theme === 'cartoon') {
          laddersHTML += `
            <g class="ladder-cartoon">
              <line x1="${p1.x - nx + 5}" y1="${p1.y - ny + 8}" x2="${p2.x - nx + 5}" y2="${p2.y - ny + 8}" stroke="rgba(0,0,0,0.3)" stroke-width="11" stroke-linecap="round"/>
              <line x1="${p1.x + nx + 5}" y1="${p1.y + ny + 8}" x2="${p2.x + nx + 5}" y2="${p2.y + ny + 8}" stroke="rgba(0,0,0,0.3)" stroke-width="11" stroke-linecap="round"/>
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#78350f" stroke-width="11" stroke-linecap="round"/>
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#78350f" stroke-width="11" stroke-linecap="round"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
          `;
          for (let r = 1; r < rungs; r++) {
            const t = r / rungs;
            const rx = p1.x + dx * t;
            const ry = p1.y + dy * t;
            laddersHTML += `
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#fbbf24" stroke-width="4.5" stroke-linecap="round"/>
            `;
          }
          laddersHTML += `</g>`;
        } else if (theme === 'jungle') {
          laddersHTML += `
            <g class="ladder-bamboo">
              <line x1="${p1.x - nx + 5}" y1="${p1.y - ny + 7}" x2="${p2.x - nx + 5}" y2="${p2.y - ny + 7}" stroke="rgba(0,0,0,0.4)" stroke-width="9" stroke-linecap="round"/>
              <line x1="${p1.x + nx + 5}" y1="${p1.y + ny + 7}" x2="${p2.x + nx + 5}" y2="${p2.y + ny + 7}" stroke="rgba(0,0,0,0.4)" stroke-width="9" stroke-linecap="round"/>
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#3f6212" stroke-width="8" stroke-linecap="round"/>
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#84cc16" stroke-width="5" stroke-dasharray="20 5" stroke-linecap="round"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#3f6212" stroke-width="8" stroke-linecap="round"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#84cc16" stroke-width="5" stroke-dasharray="20 5" stroke-linecap="round"/>
          `;
          for (let r = 1; r < rungs; r++) {
            const t = r / rungs;
            const rx = p1.x + dx * t;
            const ry = p1.y + dy * t;
            laddersHTML += `
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#14532d" stroke-width="6" stroke-linecap="round"/>
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#a3e635" stroke-width="3.5" stroke-linecap="round"/>
              <circle cx="${rx - nx}" cy="${ry - ny}" r="2.5" fill="#15803d"/>
              <circle cx="${rx + nx}" cy="${ry + ny}" r="2.5" fill="#15803d"/>
            `;
          }
          laddersHTML += `</g>`;
        } else if (theme === 'royal') {
          laddersHTML += `
            <g class="ladder-royal">
              <line x1="${p1.x - nx + 5}" y1="${p1.y - ny + 7}" x2="${p2.x - nx + 5}" y2="${p2.y - ny + 7}" stroke="rgba(0,0,0,0.5)" stroke-width="8" stroke-linecap="round"/>
              <line x1="${p1.x + nx + 5}" y1="${p1.y + ny + 7}" x2="${p2.x + nx + 5}" y2="${p2.y + ny + 7}" stroke="rgba(0,0,0,0.5)" stroke-width="8" stroke-linecap="round"/>
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#fbbf24" stroke-width="4.5" stroke-linecap="round"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#fbbf24" stroke-width="4.5" stroke-linecap="round"/>
          `;
          for (let r = 1; r < rungs; r++) {
            const t = r / rungs;
            const rx = p1.x + dx * t;
            const ry = p1.y + dy * t;
            laddersHTML += `
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#b45309" stroke-width="5" stroke-linecap="round"/>
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
            `;
          }
          laddersHTML += `</g>`;
        } else if (theme === 'cyber') {
          laddersHTML += `
            <g class="ladder-cyber">
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#06b6d4" stroke-width="3.5" stroke-linecap="round" filter="drop-shadow(0 0 5px #06b6d4)"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#06b6d4" stroke-width="3.5" stroke-linecap="round" filter="drop-shadow(0 0 5px #06b6d4)"/>
          `;
          for (let r = 1; r < rungs; r++) {
            const t = r / rungs;
            const rx = p1.x + dx * t;
            const ry = p1.y + dy * t;
            laddersHTML += `
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" filter="drop-shadow(0 0 4px #38bdf8)"/>
            `;
          }
          laddersHTML += `</g>`;
        } else if (theme === 'inferno') {
          laddersHTML += `
            <g class="ladder-inferno">
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#18181b" stroke-width="7" stroke-linecap="round"/>
              <line x1="${p1.x - nx}" y1="${p1.y - ny}" x2="${p2.x - nx}" y2="${p2.y - ny}" stroke="#7f1d1d" stroke-width="3.5" stroke-linecap="round"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#18181b" stroke-width="7" stroke-linecap="round"/>
              <line x1="${p1.x + nx}" y1="${p1.y + ny}" x2="${p2.x + nx}" y2="${p2.y + ny}" stroke="#7f1d1d" stroke-width="3.5" stroke-linecap="round"/>
          `;
          for (let r = 1; r < rungs; r++) {
            const t = r / rungs;
            const rx = p1.x + dx * t;
            const ry = p1.y + dy * t;
            laddersHTML += `
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#ea580c" stroke-width="4.5" stroke-linecap="round" filter="drop-shadow(0 0 3px #f97316)"/>
              <line x1="${rx - nx}" y1="${ry - ny}" x2="${rx + nx}" y2="${ry + ny}" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round"/>
            `;
          }
          laddersHTML += `</g>`;
        }
      });
      this.dom.laddersGroup.innerHTML = laddersHTML;

      // 2. RENDER REALISTIC TAPERED SNAKES WITH HIGH-END HEADS
      let snakesHTML = '';
      Object.entries(currentSnakes).forEach(([headStr, tailStr]) => {
        const head = Number(headStr);
        const tail = Number(tailStr);
        const p1 = this.getTileCoords(head);
        const p2 = this.getTileCoords(tail);

        const skin = themeData.skins[head] || { body: '#10b981', belly: '#fef08a', scale: '#047857', eye: '#facc15' };
        const { pathD, points, dist } = this.generateSnakeSpline(p1, p2);
        const headAngle = Math.atan2(points[1].y - p1.y, points[1].x - p1.x) * (180 / Math.PI) - 90;

        // Size modulation (Mega snakes are wider, short snakes are sleeker)
        const isMega = dist > 450;
        const isSmall = dist < 250;
        const bodyWidth = isMega ? 22 : (isSmall ? 15 : 18);
        const bellyWidth = isMega ? 11 : (isSmall ? 7 : 9);
        const headScale = isMega ? 1.15 : (isSmall ? 0.85 : 1.0);

        if (theme === 'cartoon') {
          // Playful yet sleek cartoon boa with smooth tapering
          snakesHTML += `
            <g class="snake-cartoon">
              <path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="${bodyWidth + 6}" stroke-linecap="round" transform="translate(4, 7)"/>
              <path d="${pathD}" fill="none" stroke="#18181b" stroke-width="${bodyWidth + 5}" stroke-linecap="round"/>
              <path d="${pathD}" fill="none" stroke="${skin.body}" stroke-width="${bodyWidth}" stroke-linecap="round"/>
              <path d="${pathD}" fill="none" stroke="${skin.belly}" stroke-width="${bellyWidth}" stroke-linecap="round"/>
              <path d="${pathD}" fill="none" stroke="${skin.pattern}" stroke-width="${bellyWidth * 0.45}" stroke-dasharray="8 14" stroke-linecap="round"/>
              <circle cx="${p2.x}" cy="${p2.y}" r="${bodyWidth * 0.22}" fill="${skin.body}" stroke="#18181b" stroke-width="2"/>

              <g transform="translate(${p1.x}, ${p1.y}) rotate(${headAngle}) scale(${headScale})">
                <path d="M 0 14 Q 2 22 0 28 L -3 33 M 0 28 L 3 33" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M -16 6 C -20 -4, -14 -18, -5 -20 C -2 -21, 2 -21, 5 -20 C 14 -18, 20 -4, 16 6 C 12 16, -12 16, -16 6 Z" fill="${skin.head}" stroke="#18181b" stroke-width="2.5"/>
                <circle cx="-3" cy="9" r="1.2" fill="#18181b"/>
                <circle cx="3" cy="9" r="1.2" fill="#18181b"/>
                <ellipse cx="-7" cy="-7" rx="5.5" ry="7.5" fill="#ffffff" stroke="#18181b" stroke-width="1.8"/>
                <ellipse cx="-6" cy="-6" rx="3" ry="4.5" fill="#18181b"/>
                <circle cx="-7.5" cy="-8.5" r="1.4" fill="#ffffff"/>
                <ellipse cx="7" cy="-7" rx="5.5" ry="7.5" fill="#ffffff" stroke="#18181b" stroke-width="1.8"/>
                <ellipse cx="6" cy="-6" rx="3" ry="4.5" fill="#18181b"/>
                <circle cx="4.5" cy="-8.5" r="1.4" fill="#ffffff"/>
              </g>
            </g>
          `;
        } else if (theme === 'jungle' || theme === 'royal') {
          // Realistic Pit Viper / Imperial Cobra with 3D Dorsal Volume
          const isRoyal = (theme === 'royal');
          snakesHTML += `
            <g class="${isRoyal ? 'snake-royal' : 'snake-jungle'}">
              <!-- Soft Depth Shadow -->
              <path d="${pathD}" fill="none" stroke="rgba(0,0,0,0.65)" stroke-width="${bodyWidth + 6}" stroke-linecap="round" transform="translate(5, 9)"/>
              
              <!-- Muscular Base -->
              <path d="${pathD}" fill="none" stroke="${skin.body}" stroke-width="${bodyWidth}" stroke-linecap="round"/>
              
              <!-- Ventral Scales / Underbelly Ridge -->
              <path d="${pathD}" fill="none" stroke="${skin.belly}" stroke-width="${bellyWidth}" stroke-linecap="round"/>
              
              <!-- Specular 3D Dorsal Spine Highlight -->
              <path d="${pathD}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="${bellyWidth * 0.4}" stroke-dasharray="12 18" stroke-linecap="round"/>
              
              <!-- Tapered Sharp Tail Tip -->
              <circle cx="${p2.x}" cy="${p2.y}" r="${bodyWidth * 0.18}" fill="${skin.body}"/>

              <!-- Realistic Anatomical Serpent Head -->
              <g transform="translate(${p1.x}, ${p1.y}) rotate(${headAngle}) scale(${headScale})">
                <!-- Forked Slender Tongue -->
                <path d="M 0 15 L 0 27 L -3 33 M 0 27 L 3 33" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round" fill="none"/>
                
                ${isRoyal ? `
                  <!-- Flared Imperial Cobra Hood -->
                  <path d="M -18 -2 C -22 -12, -12 -19, 0 -19 C 12 -19, 22 -12, 18 -2 C 14 10, -14 10, -18 -2 Z" fill="${skin.body}" stroke="${skin.scale}" stroke-width="2"/>
                  <ellipse cx="0" cy="-6" rx="6" ry="8" fill="${skin.belly}"/>
                  <ellipse cx="0" cy="-6" rx="3" ry="5" fill="${skin.scale}"/>
                ` : `
                  <!-- Angular Arrowhead Viper Jaw -->
                  <path d="M -13 6 L -14 -8 L -3 -18 L 3 -18 L 14 -8 L 13 6 C 9 14, -9 14, -13 6 Z" fill="${skin.body}" stroke="${skin.scale}" stroke-width="1.8"/>
                  <circle cx="-4" cy="6" r="1" fill="#000"/>
                  <circle cx="4" cy="6" r="1" fill="#000"/>
                `}

                <!-- Piercing Cat/Viper Eye Slits with Glass Reflections -->
                <ellipse cx="-6" cy="-4" rx="3" ry="4.2" fill="${skin.eye}"/>
                <line x1="-6" y1="-7.5" x2="-6" y2="-0.5" stroke="#000" stroke-width="1.5"/>
                <circle cx="-7" cy="-5" r="0.8" fill="#fff"/>

                <ellipse cx="6" cy="-4" rx="3" ry="4.2" fill="${skin.eye}"/>
                <line x1="6" y1="-7.5" x2="6" y2="-0.5" stroke="#000" stroke-width="1.5"/>
                <circle cx="5" cy="-5" r="0.8" fill="#fff"/>
              </g>
            </g>
          `;
        } else if (theme === 'cyber') {
          // Cyber Circuit Serpent
          snakesHTML += `
            <g class="snake-cyber">
              <path d="${pathD}" fill="none" stroke="${skin.body}" stroke-width="${bodyWidth}" stroke-linecap="round"/>
              <path d="${pathD}" fill="none" stroke="${skin.belly}" stroke-width="${bellyWidth}" stroke-linecap="round" filter="drop-shadow(0 0 6px ${skin.belly})"/>
              <path d="${pathD}" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="3 14" stroke-linecap="round"/>
              <circle cx="${p2.x}" cy="${p2.y}" r="${bodyWidth * 0.2}" fill="${skin.belly}"/>

              <g transform="translate(${p1.x}, ${p1.y}) rotate(${headAngle}) scale(${headScale})">
                <path d="M -12 7 L -14 -7 L 0 -19 L 14 -7 L 12 7 Z" fill="${skin.body}" stroke="${skin.belly}" stroke-width="2"/>
                <line x1="-10" y1="-3" x2="10" y2="-3" stroke="${skin.belly}" stroke-width="1.5"/>
                <rect x="-7" y="-7" width="3.5" height="3.5" fill="${skin.eye}" filter="drop-shadow(0 0 4px ${skin.eye})"/>
                <rect x="3.5" y="-7" width="3.5" height="3.5" fill="${skin.eye}" filter="drop-shadow(0 0 4px ${skin.eye})"/>
              </g>
            </g>
          `;
        } else if (theme === 'inferno') {
          // Molten Magma Wyrm
          snakesHTML += `
            <g class="snake-inferno">
              <path d="${pathD}" fill="none" stroke="${skin.body}" stroke-width="${bodyWidth}" stroke-linecap="round"/>
              <path d="${pathD}" fill="none" stroke="${skin.belly}" stroke-width="${bellyWidth}" stroke-linecap="round" filter="drop-shadow(0 0 8px ${skin.belly})"/>
              <path d="${pathD}" fill="none" stroke="#000000" stroke-width="${bellyWidth * 0.45}" stroke-dasharray="6 10" stroke-linecap="round"/>
              <circle cx="${p2.x}" cy="${p2.y}" r="${bodyWidth * 0.2}" fill="#f97316"/>

              <g transform="translate(${p1.x}, ${p1.y}) rotate(${headAngle}) scale(${headScale})">
                <path d="M -10 -10 L -17 -18 M 10 -10 L 17 -18" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M -12 5 L -14 -10 L 0 -17 L 14 -10 L 12 5 C 7 13, -7 13, -12 5 Z" fill="${skin.body}" stroke="#ef4444" stroke-width="1.8"/>
                <circle cx="-5" cy="-3" r="3" fill="${skin.eye}" filter="drop-shadow(0 0 5px ${skin.eye})"/>
                <circle cx="5" cy="-3" r="3" fill="${skin.eye}" filter="drop-shadow(0 0 5px ${skin.eye})"/>
              </g>
            </g>
          `;
        }
      });
      this.dom.snakesGroup.innerHTML = snakesHTML;
    },

    /* --------------------------------------------------------------------------
       LOBBY & ROSTER
       -------------------------------------------------------------------------- */
    openLobby(showBackOption = false) {
      if (showBackOption && this.matchInProgress) {
        this.dom.lobbyBackBtn.classList.remove('hidden');
      } else {
        this.dom.lobbyBackBtn.classList.add('hidden');
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
          glow: cfg.glow,
          icon: cfg.icon,
          isBot: isBot,
          currentTile: 1,
          laddersClimbed: 0,
          snakesBitten: 0
        });
      });

      this.currentPlayerIndex = 0;
      this.totalTurns = 0;
      this.isRolling = false;
      this.matchInProgress = true;

      this.closeLobby();
      this.renderPlayerCards();
      this.renderPawns();
      this.updateActiveTurnUI();

      if (this.players[0].isBot) {
        setTimeout(() => this.executeTurn(), 900);
      }
    },

    renderPlayerCards() {
      this.dom.playerCountBadge.textContent = `${this.players.length} Players`;
      let html = '';
      this.players.forEach((p, idx) => {
        html += `
          <div id="player-card-${p.id}" class="player-card ${idx === 0 ? 'active-turn' : ''}" style="--player-theme:${p.color}; --player-theme-glow:${p.glow};">
            <div class="p-avatar">
              <i class="fa-solid ${p.icon}"></i>
              ${p.isBot ? '<span class="bot-tag">BOT</span>' : ''}
            </div>
            <div class="p-meta">
              <div class="p-name-row">
                <span class="p-name">${p.name}</span>
                <span class="p-tile-badge" id="p-badge-${p.id}">Tile 1</span>
              </div>
              <div class="p-progress">
                <div class="p-progress-bar" id="p-bar-${p.id}" style="width: 1%"></div>
              </div>
            </div>
          </div>
        `;
      });
      this.dom.playersList.innerHTML = html;
    },

    renderPawns() {
      this.dom.pawnsLayer.innerHTML = '';
      this.players.forEach(p => {
        const token = document.createElement('div');
        token.className = 'pawn-token';
        token.id = `pawn-${p.id}`;
        token.style.setProperty('--token-color', p.color);
        token.innerHTML = `<i class="fa-solid ${p.icon}"></i>`;
        this.dom.pawnsLayer.appendChild(token);
      });
      this.positionAllPawns();
    },

    positionAllPawns() {
      const tileGroups = {};
      this.players.forEach(p => {
        tileGroups[p.currentTile] = tileGroups[p.currentTile] || [];
        tileGroups[p.currentTile].push(p.id);
      });

      this.players.forEach(p => {
        const coords = this.getTileCoords(p.currentTile);
        const group = tileGroups[p.currentTile];
        const indexInGroup = group.indexOf(p.id);
        const totalInGroup = group.length;

        let offsetX = 0;
        let offsetY = 0;
        if (totalInGroup > 1) {
          const angle = (indexInGroup / totalInGroup) * Math.PI * 2;
          offsetX = Math.cos(angle) * 16;
          offsetY = Math.sin(angle) * 16;
        }

        const pawnEl = document.getElementById(`pawn-${p.id}`);
        if (pawnEl) {
          pawnEl.style.left = `${(coords.x / 1000) * 100}%`;
          pawnEl.style.top = `${(coords.y / 1000) * 100}%`;
          pawnEl.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        }

        const badge = document.getElementById(`p-badge-${p.id}`);
        const bar = document.getElementById(`p-bar-${p.id}`);
        if (badge) badge.textContent = `Tile ${p.currentTile}`;
        if (bar) bar.style.width = `${Math.min(100, p.currentTile)}%`;
      });
    },

    /* --------------------------------------------------------------------------
       DICE & TURNS (360°+ CUMULATIVE TUMBLE ANIMATION)
       -------------------------------------------------------------------------- */
    executeTurn() {
      if (this.isRolling) return;
      this.isRolling = true;
      this.dom.rollBtn.disabled = true;

      const player = this.players[this.currentPlayerIndex];
      this.dom.rollFeedback.textContent = `${player.name} rolling...`;
      this.playSound('dice');

      const rollValue = Math.floor(Math.random() * 6) + 1;
      const targetFace = this.FACE_ROTATIONS[rollValue];

      // Full 360°+ multi-revolution rotation on every roll
      const fullSpinsX = (Math.floor(Math.random() * 2) + 2) * 360;
      const fullSpinsY = (Math.floor(Math.random() * 2) + 2) * 360;

      const deltaX = targetFace.x - (this.diceAngleX % 360);
      const deltaY = targetFace.y - (this.diceAngleY % 360);

      this.diceAngleX += fullSpinsX + deltaX;
      this.diceAngleY += fullSpinsY + deltaY;

      this.dom.diceCube.style.transform = `translateZ(-48px) rotateX(${this.diceAngleX}deg) rotateY(${this.diceAngleY}deg)`;

      setTimeout(() => {
        this.dom.rollFeedback.textContent = `${player.name} rolled a ${rollValue}!`;

        this.stepMovePlayer(player, rollValue, () => {
          this.checkTileConsequences(player, rollValue);
        });
      }, 950);
    },

    stepMovePlayer(player, stepsRemaining, onComplete) {
      if (stepsRemaining <= 0) {
        onComplete();
        return;
      }

      if (player.currentTile + 1 > 100) {
        player.currentTile = 100 - (player.currentTile + 1 - 100);
      } else {
        player.currentTile++;
      }

      this.playSound('hop');
      const pawnEl = document.getElementById(`pawn-${player.id}`);
      if (pawnEl) {
        pawnEl.classList.add('hopping');
        setTimeout(() => pawnEl.classList.remove('hopping'), 300);
      }
      this.positionAllPawns();

      setTimeout(() => {
        this.stepMovePlayer(player, stepsRemaining - 1, onComplete);
      }, 260);
    },

    checkTileConsequences(player, rolledValue) {
      const tile = player.currentTile;
      const themeData = this.THEMES_DATA[this.currentTheme];
      const ladders = themeData.ladders;
      const snakes = themeData.snakes;

      if (tile === 100) {
        this.handleVictory(player);
        return;
      }

      // Check ladder
      if (ladders[tile]) {
        const newTile = ladders[tile];
        player.laddersClimbed++;
        this.playSound('ladder');
        this.dom.rollFeedback.textContent = `🚀 Climbed ladder to ${newTile}!`;

        setTimeout(() => {
          player.currentTile = newTile;
          this.positionAllPawns();
          this.continueAfterTurn(rolledValue);
        }, 600);
        return;
      }

      // Check snake
      if (snakes[tile]) {
        const newTile = snakes[tile];
        const snakeSkin = themeData.skins[tile];
        const snakeName = snakeSkin ? snakeSkin.name : 'Snake';
        player.snakesBitten++;
        this.playSound('snake');
        this.dom.rollFeedback.textContent = `🐍 Caught by ${snakeName}, slid to ${newTile}!`;

        setTimeout(() => {
          player.currentTile = newTile;
          this.positionAllPawns();
          this.continueAfterTurn(rolledValue);
        }, 600);
        return;
      }

      this.continueAfterTurn(rolledValue);
    },

    continueAfterTurn(rolledValue) {
      if (rolledValue === 6) {
        this.dom.rollFeedback.textContent = `🎲 Rolled a 6! Extra roll awarded.`;
        this.isRolling = false;
        this.dom.rollBtn.disabled = false;
        if (this.players[this.currentPlayerIndex].isBot) {
          setTimeout(() => this.executeTurn(), 900);
        }
        return;
      }

      this.totalTurns++;
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.updateActiveTurnUI();

      this.isRolling = false;
      this.dom.rollBtn.disabled = false;

      const nextPlayer = this.players[this.currentPlayerIndex];
      if (nextPlayer.isBot) {
        setTimeout(() => this.executeTurn(), 900);
      }
    },

    updateActiveTurnUI() {
      const activePlayer = this.players[this.currentPlayerIndex];
      this.dom.currentTurnName.textContent = activePlayer.name;
      this.dom.currentTurnName.style.color = activePlayer.color;

      document.querySelectorAll('.player-card').forEach((card, idx) => {
        card.classList.toggle('active-turn', idx === this.currentPlayerIndex);
      });

      if (activePlayer.isBot) {
        this.dom.rollFeedback.textContent = `${activePlayer.name} is thinking...`;
        this.dom.rollBtn.disabled = true;
      } else {
        this.dom.rollFeedback.textContent = 'Your turn! Press Roll or hit Space.';
        this.dom.rollBtn.disabled = false;
      }
    },

    /* --------------------------------------------------------------------------
       VICTORY
       -------------------------------------------------------------------------- */
    handleVictory(winner) {
      this.playSound('victory');
      this.matchInProgress = false;

      this.dom.winnerAnnouncement.textContent = `${winner.name} won the championship!`;
      this.dom.statTurns.textContent = this.totalTurns + 1;
      this.dom.statLadders.textContent = winner.laddersClimbed;
      this.dom.statSnakes.textContent = winner.snakesBitten;

      setTimeout(() => {
        this.dom.victoryModal.classList.remove('hidden');
      }, 700);
    },

    /* --------------------------------------------------------------------------
       MODAL CONTROLLERS & EVENT BINDINGS
       -------------------------------------------------------------------------- */
    openRules() {
      document.getElementById('rules-modal').classList.remove('hidden');
    },

    closeRules() {
      document.getElementById('rules-modal').classList.add('hidden');
    },

    bindEvents() {
      // Lobby Theme Card Selection
      document.querySelectorAll('.theme-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.applyTheme(btn.dataset.theme);
        });
      });

      // Top Back Button in Lobby
      this.dom.lobbyBackBtn.addEventListener('click', () => {
        this.closeLobby();
      });

      // Top "New Match" button with Confirmation Guard
      this.dom.newGameBtn.addEventListener('click', () => {
        if (this.matchInProgress) {
          this.dom.confirmModal.classList.remove('hidden');
        } else {
          this.openLobby(false);
        }
      });

      // Confirmation Modal Handlers
      this.dom.acceptConfirmBtn.addEventListener('click', () => {
        this.dom.confirmModal.classList.add('hidden');
        this.openLobby(true); // Opens setup with Back button visible!
      });

      this.dom.cancelConfirmBtn.addEventListener('click', () => {
        this.dom.confirmModal.classList.add('hidden');
      });

      // Roll Button
      this.dom.rollBtn.addEventListener('click', () => {
        const player = this.players[this.currentPlayerIndex];
        if (!player.isBot) this.executeTurn();
      });

      // Spacebar
      window.addEventListener('keydown', (e) => {
        const modalsOpen = !this.dom.lobbyModal.classList.contains('hidden') ||
                           !this.dom.confirmModal.classList.contains('hidden') ||
                           !this.dom.rulesModal.classList.contains('hidden') ||
                           !this.dom.victoryModal.classList.contains('hidden');

        if (e.code === 'Space' && !this.dom.rollBtn.disabled && !modalsOpen) {
          const player = this.players[this.currentPlayerIndex];
          if (player && !player.isBot) {
            e.preventDefault();
            this.executeTurn();
          }
        }
      });

      // Sound
      this.dom.soundToggleBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        this.dom.soundToggleBtn.innerHTML = this.soundEnabled
          ? '<i class="fa-solid fa-volume-high"></i>'
          : '<i class="fa-solid fa-volume-xmark"></i>';
      });

      // Rules
      this.dom.rulesBtn.addEventListener('click', () => this.openRules());
      this.dom.closeRulesBtn.addEventListener('click', () => this.closeRules());
      this.dom.rulesAckBtn.addEventListener('click', () => this.closeRules());

      // Lobby Count selection
      document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.renderLobbySlots(parseInt(btn.dataset.count, 10));
        });
      });

      // Start Match & Victory Replay
      this.dom.startMatchBtn.addEventListener('click', () => this.startMatch());
      this.dom.victoryReplayBtn.addEventListener('click', () => {
        this.dom.victoryModal.classList.add('hidden');
        this.openLobby(false);
      });
    }
  };

  window.SnakesAndLadders = SnakesAndLadders;

  window.addEventListener('DOMContentLoaded', () => {
    window.SnakesAndLadders.init();
  });
})();