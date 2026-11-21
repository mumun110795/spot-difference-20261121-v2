// Double Take — the page around the canvases: top bar (scene name, timer,
// score), the two panel headers, the Found pips row with the big remaining
// counter, the caption line that names the last find, and the overlay cards
// (title, level clear, time up, you win). Pure DOM; play.js drives it.

export function fmtTime(totalSeconds) {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

export class Hud {
  constructor(root, callbacks) {
    this.cb = callbacks;
    root.innerHTML = '';

    const bar = el('header', 'topbar');
    this.title = el('div', 'brand', 'DOUBLE TAKE');
    const mid = el('div', 'bar-mid');
    this.sceneName = el('span', 'scene-name', '');
    this.timer = el('span', 'pill timer', '0:00');
    mid.append(this.sceneName, this.timer);
    const right = el('div', 'bar-right');
    this.score = el('span', 'pill score', '★ 0');
    this.hintBtn = el('button', 'btn hint-btn', 'Hint · 3');
    this.hintBtn.addEventListener('click', () => this.cb.onHint());
    this.muteBtn = el('button', 'btn mute-btn', 'Sound: on');
    this.muteBtn.addEventListener('click', () => this.cb.onMute());
    right.append(this.score, this.hintBtn, this.muteBtn);
    bar.append(this.title, mid, right);
    root.append(bar);

    const heads = el('div', 'panel-heads');
    heads.append(el('div', 'panel-head left', 'ORIGINAL'), el('div', 'panel-head right', 'SPOT THE CHANGES'));
    root.append(heads);

    this.stage = el('main', 'stage');
    this.leftCanvas = el('canvas', 'panel');
    this.leftCanvas.width = 600; this.leftCanvas.height = 450;
    this.rightCanvas = el('canvas', 'panel');
    this.rightCanvas.width = 600; this.rightCanvas.height = 450;
    this.stage.append(this.leftCanvas, this.rightCanvas);
    root.append(this.stage);

    const foundRow = el('div', 'found-row');
    foundRow.append(el('span', 'found-label', 'FOUND:'));
    this.pips = el('div', 'pips');
    foundRow.append(this.pips);
    this.counter = el('div', 'counter', '');
    foundRow.append(this.counter);
    root.append(foundRow);

    this.caption = el('div', 'caption', 'Find every difference between the two postcards.');
    root.append(this.caption);

    const foot = el('footer', 'footbar');
    this.menuBtn = el('button', 'btn', '☰ Scenes');
    this.menuBtn.addEventListener('click', () => this.cb.onMenu());
    this.restartBtn = el('button', 'btn', '↺ Restart scene');
    this.restartBtn.addEventListener('click', () => this.cb.onRestart());
    foot.append(
      this.menuBtn, this.restartBtn,
      el('span', 'keys-help', 'Click a difference — or use ←→↑↓ + Enter · Tab swaps panel · H hint'),
    );
    root.append(foot);

    this.overlay = el('div', 'overlay hidden');
    root.append(this.overlay);
  }

  setScene(scene, index, total) {
    this.sceneName.textContent = `Postcard ${index + 1} of ${total} · ${scene.name} — ${scene.sub}`;
    this.pips.innerHTML = '';
    this.pipEls = scene.differences.map(() => {
      const pip = el('span', 'pip');
      this.pips.append(pip);
      return pip;
    });
  }

  update(state) {
    this.timer.textContent = fmtTime(state.timeLeft);
    this.timer.classList.toggle('urgent', state.timeLeft <= 30 && state.mode === 'playing');
    this.score.textContent = `★ ${state.score}`;
    this.hintBtn.textContent = `Hint · ${state.hintsLeft}`;
    this.hintBtn.disabled = state.hintsLeft <= 0 || state.mode !== 'playing';
    const foundCount = state.found.size;
    state.scene.differences.forEach((d, i) => {
      this.pipEls[i].classList.toggle('on', state.found.has(d.id));
    });
    const left = state.scene.differences.length - foundCount;
    this.counter.textContent = left === 0 ? 'ALL FOUND!' : `${left} TO FIND`;
    this.counter.classList.toggle('done', left === 0);
  }

  say(text) { this.caption.textContent = text; }

  setMuted(m) { this.muteBtn.textContent = m ? 'Sound: off' : 'Sound: on'; }

  hideOverlay() { this.overlay.classList.add('hidden'); this.overlay.innerHTML = ''; }

  showCard({ title, lines = [], stars = 0, buttons = [] }) {
    this.overlay.innerHTML = '';
    const card = el('div', 'card');
    card.append(el('h1', 'card-title', title));
    if (stars > 0) {
      const row = el('div', 'stars', '★'.repeat(stars) + '☆'.repeat(3 - stars));
      card.append(row);
    }
    for (const line of lines) card.append(el('p', 'card-line', line));
    const row = el('div', 'card-buttons');
    for (const b of buttons) {
      const btn = el('button', 'btn primary', b.label);
      btn.addEventListener('click', b.onClick);
      row.append(btn);
    }
    card.append(row);
    this.overlay.append(card);
    this.overlay.classList.remove('hidden');
  }
}
