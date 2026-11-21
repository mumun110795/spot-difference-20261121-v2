// Double Take — panel rendering. One function draws a whole panel: the
// scene backdrop, its props, then the player's marks — thick two-tone rings
// on every found difference (they must read at thumbnail size), a pulsing
// ring while a hint is showing, fading crosses on fresh misses, and the
// keyboard crosshair on the focused panel.

import { paintBackdrop, paintProp } from './paint.js';

const RING_OUTER = '#123B2A';
const RING_INNER = '#8DFF6A';

export function drawFoundRing(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2);
  ctx.strokeStyle = RING_OUTER; ctx.lineWidth = 9; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r + 7, 0, Math.PI * 2);
  ctx.strokeStyle = RING_INNER; ctx.lineWidth = 5; ctx.stroke();
  // a small check tag at the top of the ring
  ctx.beginPath(); ctx.arc(x, y - r - 7, 9, 0, Math.PI * 2);
  ctx.fillStyle = RING_INNER; ctx.fill();
  ctx.strokeStyle = RING_OUTER; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 4.5, y - r - 7);
  ctx.lineTo(x - 1, y - r - 3.5);
  ctx.lineTo(x + 5, y - r - 11);
  ctx.stroke();
}

function drawMissCross(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.strokeStyle = '#FF5252'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, -10); ctx.lineTo(10, 10);
  ctx.moveTo(10, -10); ctx.lineTo(-10, 10);
  ctx.stroke();
  ctx.restore();
}

function drawHintPulse(ctx, x, y, r, phase) {
  const grow = 1 + 0.18 * Math.sin(phase * 6);
  ctx.beginPath(); ctx.arc(x, y, (r + 10) * grow, 0, Math.PI * 2);
  ctx.strokeStyle = '#FFD166'; ctx.lineWidth = 5; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, (r + 22) * grow, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,209,102,0.45)'; ctx.lineWidth = 3; ctx.stroke();
}

function drawCursor(ctx, x, y) {
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 20, y); ctx.lineTo(x - 7, y);
  ctx.moveTo(x + 7, y); ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 7);
  ctx.moveTo(x, y + 7); ctx.lineTo(x, y + 20);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF'; ctx.fill();
}

// view: { scene, props, found:Set<diffId>, misses:[{x,y,age}], hint:{diff,until}|null,
//         cursor:{x,y}|null, now }
export function drawPanel(ctx, view) {
  const { scene, props, found, misses, hint, cursor, now } = view;
  paintBackdrop(ctx, scene);
  for (const p of props) paintProp(ctx, p, scene.palette);
  for (const d of scene.differences) {
    if (found.has(d.id)) drawFoundRing(ctx, d.x, d.y, d.r);
  }
  if (hint && now < hint.until) {
    const d = scene.differences.find((dd) => dd.id === hint.diffId);
    if (d) drawHintPulse(ctx, d.x, d.y, d.r, now / 160);
  }
  for (const m of misses) {
    if (m.age < 1) drawMissCross(ctx, m.x, m.y, 0.6 + 0.4 * m.age);
  }
  if (cursor) drawCursor(ctx, cursor.x, cursor.y);
}
