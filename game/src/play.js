// Double Take — game controller. Owns the state of a run (scene, found set,
// score, timer, hints), turns clicks and keys into spots, and keeps both
// canvases and the HUD in sync. A spot is checked against the differences'
// hotspots; clicking either panel counts, because players compare the two.

import { SCENES, rightProps, SCENE_W, SCENE_H } from './scenes.js';
import { drawPanel } from './render.js';
import { Hud, fmtTime } from './ui.js';
import { sound } from './sound.js';

const FIND_POINTS = 100;
const MISS_PENALTY = 25;
const MISS_TIME_PENALTY = 5;
const HINT_COST = 40;
const HINTS_PER_SCENE = 3;

export class Game {
  constructor(root, opts = {}) {
    this.frozen = !!opts.frozen; // shot mode: the clock never ticks
    this.sceneIndex = 0;
    this.totalScore = 0;
    this.mode = 'title';
    this.hud = new Hud(root, {
      onHint: () => this.useHint(),
      onMute: () => this.hud.setMuted(sound.toggleMute()),
      onMenu: () => this.showTitle(),
      onRestart: () => this.startScene(this.sceneIndex),
    });
    this.leftCtx = this.hud.leftCanvas.getContext('2d');
    this.rightCtx = this.hud.rightCanvas.getContext('2d');
    this.cursorSide = 'right';
    this.cursor = { x: SCENE_W / 2, y: SCENE_H / 2 };
    this.showCursor = false;
    this.bindInput();
    this.lastTick = performance.now();
    setInterval(() => this.tick(), 100);
    const loop = () => { this.draw(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // ---------- scene setup ----------

  startScene(index) {
    this.sceneIndex = index;
    this.scene = SCENES[index];
    this.editedProps = rightProps(this.scene);
    this.found = new Set();
    this.misses = [];
    this.hintsLeft = HINTS_PER_SCENE;
    this.timeLeft = this.scene.seconds;
    this.sceneMisses = 0;
    this.hint = null;
    this.mode = 'playing';
    this.hud.hideOverlay();
    this.hud.setScene(this.scene, index, SCENES.length);
    this.hud.say(`Postcard ${index + 1}: ${this.scene.name}. ${this.scene.differences.length} differences are hiding.`);
    this.syncHud();
  }

  showTitle() {
    this.mode = 'title';
    if (!this.scene) { // title before any scene: stage postcard 1 behind the card
      this.scene = SCENES[0];
      this.editedProps = rightProps(this.scene);
      this.found = new Set();
      this.misses = [];
      this.hintsLeft = HINTS_PER_SCENE;
      this.timeLeft = this.scene.seconds;
      this.sceneMisses = 0;
      this.hint = null;
      this.hud.setScene(this.scene, 0, SCENES.length);
    }
    this.hud.showCard({
      title: 'DOUBLE TAKE',
      lines: [
        'Three postcards, two prints apiece — and the second print is never quite right.',
        'Spot every difference between the panels. A miss costs points and time; a hint costs more.',
      ],
      buttons: SCENES.map((s, i) => ({
        label: `${i + 1} · ${s.name} (${s.differences.length})`,
        onClick: () => { sound.unlock(); this.startScene(i); },
      })),
    });
    this.syncHud();
  }

  // ---------- the hunt ----------

  spotAt(x, y) {
    if (this.mode !== 'playing') return 'idle';
    const hit = this.scene.differences.find((d) => {
      if (this.found.has(d.id)) return false;
      const near = (hx, hy) => Math.hypot(hx - x, hy - y) <= d.r + 6;
      return near(d.x, d.y) || (d.also && near(d.also.x, d.also.y));
    });
    if (hit) {
      this.found.add(hit.id);
      this.totalScore += FIND_POINTS;
      sound.find();
      this.hud.say(`Found: ${hit.label}. +${FIND_POINTS}`);
      if (this.found.size === this.scene.differences.length) this.onClear();
      this.syncHud();
      return 'found';
    }
    this.sceneMisses += 1;
    this.totalScore = Math.max(0, this.totalScore - MISS_PENALTY);
    this.timeLeft = Math.max(0, this.timeLeft - MISS_TIME_PENALTY);
    this.misses.push({ x, y, at: performance.now() });
    sound.miss();
    this.hud.say(`Not there. −${MISS_PENALTY} points, −${MISS_TIME_PENALTY} seconds.`);
    this.syncHud();
    return 'miss';
  }

  useHint() {
    if (this.mode !== 'playing' || this.hintsLeft <= 0) return null;
    const remaining = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (!remaining.length) return null;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.totalScore = Math.max(0, this.totalScore - HINT_COST);
    this.hint = { diffId: pick.id, until: performance.now() + 1600 };
    sound.hint();
    this.hud.say(`A glimmer, over there… −${HINT_COST} points.`);
    this.syncHud();
    return pick;
  }

  starsForClear() {
    if (this.sceneMisses === 0) return 3;
    if (this.sceneMisses <= 2) return 2;
    return 1;
  }

  onClear() {
    const bonus = Math.ceil(this.timeLeft) * 2;
    this.totalScore += bonus;
    this.mode = 'clear';
    sound.clear();
    const last = this.sceneIndex === SCENES.length - 1;
    if (last) { this.onWin(bonus); return; }
    this.hud.showCard({
      title: `${this.scene.name} — clear!`,
      stars: this.starsForClear(),
      lines: [
        `Every difference found, with ${fmtTime(this.timeLeft)} to spare. Time bonus +${bonus}.`,
        `Score so far: ★ ${this.totalScore}`,
      ],
      buttons: [{ label: `Next postcard: ${SCENES[this.sceneIndex + 1].name} →`, onClick: () => this.startScene(this.sceneIndex + 1) }],
    });
    this.syncHud();
  }

  onWin(finalBonus) {
    this.mode = 'win';
    sound.win();
    this.hud.showCard({
      title: 'YOU WIN — SHARP EYES!',
      stars: this.starsForClear(),
      lines: [
        `All three postcards solved. Final time bonus +${finalBonus}.`,
        `Final score: ★ ${this.totalScore}`,
        this.totalScore >= 2400 ? 'Rank: Eagle Eye' : this.totalScore >= 1800 ? 'Rank: Keen Spotter' : 'Rank: Postcard Pro',
      ],
      buttons: [{ label: 'Play again', onClick: () => { this.totalScore = 0; this.startScene(0); } }],
    });
    this.syncHud();
  }

  onTimeUp() {
    this.mode = 'timeup';
    sound.miss();
    this.hud.showCard({
      title: 'Time up!',
      lines: [
        `The ${this.scene.name} postcard kept ${this.scene.differences.length - this.found.size} of its secrets.`,
        `Score so far: ★ ${this.totalScore}`,
      ],
      buttons: [
        { label: 'Retry this postcard', onClick: () => this.startScene(this.sceneIndex) },
        { label: 'Back to scenes', onClick: () => this.showTitle() },
      ],
    });
    this.syncHud();
  }

  // ---------- clock and frame ----------

  tick() {
    const now = performance.now();
    const dt = (now - this.lastTick) / 1000;
    this.lastTick = now;
    if (this.mode !== 'playing' || this.frozen) return;
    const before = Math.ceil(this.timeLeft);
    this.timeLeft -= dt;
    if (Math.ceil(this.timeLeft) !== before && this.timeLeft <= 5.5 && this.timeLeft > 0) sound.tick();
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.onTimeUp();
    }
    this.syncHud();
  }

  draw() {
    if (!this.scene) return;
    const now = performance.now();
    this.misses = this.misses.filter((m) => (now - m.at) / 700 < 1);
    const view = (props, side) => ({
      scene: this.scene,
      props,
      found: this.found,
      misses: this.misses.map((m) => ({ ...m, age: (now - m.at) / 700 })),
      hint: this.hint,
      cursor: this.showCursor && this.cursorSide === side ? this.cursor : null,
      now,
    });
    drawPanel(this.leftCtx, view(this.scene.props, 'left'));
    drawPanel(this.rightCtx, view(this.editedProps, 'right'));
  }

  syncHud() {
    this.hud.update({
      timeLeft: this.timeLeft,
      score: this.totalScore,
      hintsLeft: this.hintsLeft,
      found: this.found,
      scene: this.scene,
      mode: this.mode,
    });
  }

  // ---------- input ----------

  bindInput() {
    const toScene = (canvas, evt) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (evt.clientX - r.left) * (SCENE_W / r.width),
        y: (evt.clientY - r.top) * (SCENE_H / r.height),
      };
    };
    for (const [canvas, side] of [[this.hud.leftCanvas, 'left'], [this.hud.rightCanvas, 'right']]) {
      canvas.addEventListener('pointerdown', (evt) => {
        sound.unlock();
        const { x, y } = toScene(canvas, evt);
        this.cursorSide = side;
        this.cursor = { x, y };
        this.spotAt(x, y);
      });
    }
    window.addEventListener('keydown', (evt) => this.onKey(evt));
  }

  onKey(evt) {
    const step = evt.shiftKey ? 3 : 14;
    let used = true;
    switch (evt.key) {
      case 'ArrowLeft': this.cursor.x -= step; this.showCursor = true; break;
      case 'ArrowRight': this.cursor.x += step; this.showCursor = true; break;
      case 'ArrowUp': this.cursor.y -= step; this.showCursor = true; break;
      case 'ArrowDown': this.cursor.y += step; this.showCursor = true; break;
      case 'Tab': this.cursorSide = this.cursorSide === 'left' ? 'right' : 'left'; this.showCursor = true; break;
      case 'Enter': case ' ': this.spotAt(this.cursor.x, this.cursor.y); break;
      case 'h': case 'H': this.useHint(); break;
      case 'm': case 'M': this.hud.setMuted(sound.toggleMute()); break;
      default: used = false;
    }
    if (used) {
      this.cursor.x = Math.min(SCENE_W - 4, Math.max(4, this.cursor.x));
      this.cursor.y = Math.min(SCENE_H - 4, Math.max(4, this.cursor.y));
      evt.preventDefault();
    }
  }

  // ---------- deterministic states for screenshots and the selftest ----------

  applyState({ scene = 0, foundIds = [], timeLeft = null, score = 0, hintsLeft = HINTS_PER_SCENE }) {
    this.startScene(scene);
    this.mode = 'playing';
    for (const id of foundIds) this.found.add(id);
    if (timeLeft != null) this.timeLeft = timeLeft;
    this.totalScore = score;
    this.hintsLeft = hintsLeft;
    this.syncHud();
  }
}
