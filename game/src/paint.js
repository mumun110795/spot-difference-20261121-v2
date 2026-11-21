// Double Take — painting. Everything is flat vector shapes on a 2D canvas:
// solid fills, bold silhouettes, no gradients and no images. A scene's
// backdrop is painted first, then its props in data order. The same painters
// draw both panels; the right panel simply receives the edited prop list.

import { SCENE_W, SCENE_H } from './scenes.js';

// ---------- small shape helpers ----------

function circle(ctx, x, y, r, fill) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
}

function rrect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}

function stroke(ctx, points, width, colour, cap = 'round') {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.lineCap = cap; ctx.lineJoin = 'round';
  ctx.stroke();
}

// A horizontal band whose top edge is a gentle wave.
function waveBand(ctx, y, amp, colour) {
  ctx.beginPath();
  ctx.moveTo(0, SCENE_H);
  ctx.lineTo(0, y);
  for (let x = 0; x <= SCENE_W; x += 60) {
    ctx.quadraticCurveTo(x + 30, y - amp, x + 60, y);
  }
  ctx.lineTo(SCENE_W, SCENE_H);
  ctx.closePath(); ctx.fillStyle = colour; ctx.fill();
}

function star4(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}

// ---------- backdrops ----------

function reefBackdrop(ctx, P) {
  rect(ctx, 0, 0, SCENE_W, SCENE_H, P.seaTop);
  // light shafts from the surface
  ctx.globalAlpha = 0.10;
  poly(ctx, [[70, 0], [150, 0], [210, 300], [130, 300]], P.white);
  poly(ctx, [[330, 0], [395, 0], [430, 300], [380, 300]], P.white);
  ctx.globalAlpha = 1;
  waveBand(ctx, 168, 10, P.seaMid);
  waveBand(ctx, 292, 12, P.seaDeep);
  // distant reef silhouettes
  ellipse(ctx, 90, 330, 90, 26, P.rock);
  ellipse(ctx, 520, 318, 110, 30, P.rock);
  ellipse(ctx, 300, 344, 70, 18, P.rock);
  waveBand(ctx, 378, 8, P.sand);
  // pebbles on the sand
  for (const [x, y, r] of [[60, 412, 5], [150, 428, 4], [262, 416, 5], [388, 430, 4], [470, 412, 5], [556, 428, 4]]) {
    circle(ctx, x, y, r, P.seaDeep);
  }
}

function cabinBackdrop(ctx, P) {
  rect(ctx, 0, 0, SCENE_W, SCENE_H, P.sky);
  // far peaks with snow caps
  poly(ctx, [[-20, 240], [120, 96], [260, 240]], P.peakFar);
  poly(ctx, [[110, 240], [248, 128], [390, 240]], P.peakFar);
  poly(ctx, [[96, 122], [120, 96], [146, 124], [132, 118], [120, 130], [108, 118]], P.snow);
  poly(ctx, [[226, 152], [248, 128], [272, 154], [258, 148], [248, 160], [236, 148]], P.snow);
  // near ridge
  poly(ctx, [[300, 252], [452, 138], [620, 252]], P.peakNear);
  poly(ctx, [[428, 162], [452, 138], [478, 164], [464, 158], [452, 170], [440, 158]], P.snow);
  poly(ctx, [[0, 258], [90, 196], [210, 258]], P.hill);
  // snowfield
  waveBand(ctx, 292, 7, P.snow);
  // frozen lake, bottom left
  ellipse(ctx, 128, 392, 108, 30, P.lake);
  ellipse(ctx, 100, 384, 44, 8, P.white);
}

function rooftopBackdrop(ctx, P) {
  rect(ctx, 0, 0, SCENE_W, SCENE_H, P.sky);
  // far skyline
  ctx.fillStyle = P.skyFar;
  for (const [x, w, top] of [[0, 70, 120], [78, 54, 96], [140, 84, 132], [232, 60, 104], [300, 92, 140], [400, 58, 100], [466, 76, 128], [550, 50, 108]]) {
    ctx.fillRect(x, top, w, 240 - top);
  }
  // near skyline
  ctx.fillStyle = P.skyNear;
  for (const [x, w, top] of [[16, 88, 168], [356, 96, 178], [520, 80, 158]]) {
    ctx.fillRect(x, top, w, 246 - top);
  }
  // a few lit windows in the near blocks
  for (const [x, y] of [[44, 190], [72, 214], [384, 198], [420, 220], [548, 182], [572, 206]]) {
    rect(ctx, x, y, 10, 13, P.sun);
  }
  // parapet and roof floor
  rect(ctx, 0, 240, SCENE_W, 16, P.parapet);
  rect(ctx, 0, 256, SCENE_W, SCENE_H - 256, P.floor);
  ctx.globalAlpha = 0.16;
  for (let x = 24; x < SCENE_W; x += 64) rect(ctx, x, 268, 3, SCENE_H - 280, P.ink);
  ctx.globalAlpha = 1;
}

const BACKDROPS = { 'coral-cove': reefBackdrop, 'pinewood-cabin': cabinBackdrop, 'rooftop-garden': rooftopBackdrop };

export function paintBackdrop(ctx, scene) {
  BACKDROPS[scene.id](ctx, scene.palette);
}

// ---------- prop painters ----------
// Each painter draws centred on (0,0); render.js translates, scales and
// flips. `P` is the scene palette and `tone` the prop's resolved colour.

const PAINTERS = {
  fish(ctx, p, P, tone) {
    poly(ctx, [[16, 0], [34, -13], [34, 13]], tone); // tail
    ellipse(ctx, -2, 0, 24, 14, tone);
    poly(ctx, [[-4, -12], [6, -20], [10, -11]], tone); // top fin
    circle(ctx, -13, -3, 4.5, P.white);
    circle(ctx, -13, -3, 2.4, P.ink);
  },
  turtle(ctx, p, P, tone) {
    ellipse(ctx, 26, -16, 10, 7, P.leaf); // head
    ellipse(ctx, -30, 12, 13, 6, P.leaf); // back flipper
    ellipse(ctx, 24, 14, 13, 6, P.leaf); // front flipper
    ctx.beginPath(); ctx.arc(0, 6, 30, Math.PI, 0); ctx.closePath();
    ctx.fillStyle = P.leaf; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 6, 22, Math.PI, 0); ctx.closePath();
    ctx.fillStyle = '#2E7D4F'; ctx.fill();
    circle(ctx, -9, -8, 5, P.leaf);
    circle(ctx, 10, -12, 4, P.leaf);
    circle(ctx, 28, -18, 1.8, P.ink);
  },
  starfish(ctx, p, P, tone) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 22 : 9;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    poly(ctx, pts, tone);
    circle(ctx, 0, 0, 4, P.shell);
    circle(ctx, -7, -6, 2, P.shell);
    circle(ctx, 8, 4, 2, P.shell);
  },
  clam(ctx, p, P) {
    ctx.beginPath(); ctx.arc(0, 6, 26, 0, Math.PI); ctx.closePath();
    ctx.fillStyle = P.pink; ctx.fill();
    if (p.variant === 'pearl') {
      ctx.save();
      ctx.translate(-20, 4); ctx.rotate(-0.5);
      ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = '#E87A93'; ctx.fill();
      ctx.restore();
      circle(ctx, 2, -2, 8, P.white);
      circle(ctx, -1, -5, 2.6, '#D9E6EC');
    } else {
      stroke(ctx, [[-24, 4], [24, 4]], 3, '#E87A93');
    }
  },
  seaweed(ctx, p, P) {
    for (const dx of [-12, 0, 12]) {
      ctx.beginPath();
      ctx.moveTo(dx, 26);
      ctx.quadraticCurveTo(dx - 10, -6, dx, -34 + Math.abs(dx));
      ctx.quadraticCurveTo(dx + 10, -62 + Math.abs(dx), dx, -88 + Math.abs(dx) * 1.4);
      ctx.strokeStyle = P.leaf; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
    }
    circle(ctx, 0, 28, 7, P.rock);
  },
  coralFan(ctx, p, P, tone) {
    ctx.beginPath(); ctx.arc(0, 8, 30, Math.PI, 0); ctx.closePath();
    ctx.fillStyle = tone; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2.5;
    for (const a of [-1.2, -0.6, 0, 0.6, 1.2]) {
      ctx.beginPath(); ctx.moveTo(0, 8);
      ctx.lineTo(Math.sin(a) * 28, 8 - Math.cos(a) * 28); ctx.stroke();
    }
    ellipse(ctx, 0, 12, 12, 6, P.rock);
  },
  anemone(ctx, p, P) {
    ellipse(ctx, 0, 8, 20, 10, '#E87A93');
    for (let i = -3; i <= 3; i++) {
      circle(ctx, i * 6, -2 - Math.abs(i), 4.5, P.pink);
      circle(ctx, i * 6, -2 - Math.abs(i), 1.8, P.shell);
    }
  },
  bubbles(ctx, p, P) {
    for (const [x, y, r] of [[0, 0, 8], [-13, 14, 5.5], [11, 16, 6.5]]) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5; ctx.stroke();
      circle(ctx, x - r * 0.3, y - r * 0.3, r * 0.28, 'rgba(255,255,255,0.5)');
    }
  },
  seahorse(ctx, p, P, tone) {
    ctx.beginPath();
    ctx.moveTo(6, -24);
    ctx.quadraticCurveTo(20, -10, 12, 6);
    ctx.quadraticCurveTo(6, 20, -8, 22);
    ctx.quadraticCurveTo(-18, 23, -14, 12);
    ctx.strokeStyle = tone; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.stroke();
    poly(ctx, [[4, -22], [20, -14], [6, -8]], tone); // snout
    circle(ctx, 8, -18, 2.2, P.ink);
    for (const [x, y] of [[2, -28], [9, -30], [15, -27]]) circle(ctx, x, y, 2.6, tone);
  },
  crab(ctx, p, P) {
    for (const s of [-1, 1]) {
      stroke(ctx, [[s * 12, 6], [s * 22, 14], [s * 26, 22]], 4, P.coral);
      circle(ctx, s * 22, -8, 8, P.coral);
      poly(ctx, [[s * 22, -14], [s * 27, -20], [s * 24, -9]], P.sand);
      stroke(ctx, [[s * 4, -8], [s * 5, -16]], 3, P.ink);
      circle(ctx, s * 5, -17, 2.6, P.ink);
    }
    ellipse(ctx, 0, 2, 19, 12, '#E85D3D');
    ellipse(ctx, 0, -1, 11, 6, P.coral);
  },
  moon(ctx, p, P) {
    circle(ctx, 0, 0, 26, P.snow);
    if (p.variant === 'crescent') {
      circle(ctx, 12, -6, 22, P.sky);
    } else {
      circle(ctx, -8, -6, 5, '#D8E2EE');
      circle(ctx, 9, 8, 4, '#D8E2EE');
      circle(ctx, 12, -12, 3, '#D8E2EE');
    }
  },
  star(ctx, p, P) {
    star4(ctx, 0, 0, 11, P.snow);
    circle(ctx, 0, 0, 2, P.white);
  },
  pine(ctx, p, P) {
    rect(ctx, -4, 18, 8, 16, P.roof);
    poly(ctx, [[-26, 22], [0, -16], [26, 22]], P.pine);
    poly(ctx, [[-20, -2], [0, -34], [20, -2]], P.pine);
    poly(ctx, [[-14, -24], [0, -48], [14, -24]], P.pine);
    poly(ctx, [[-13, -26], [0, -48], [13, -26], [0, -34]], P.snow);
  },
  smoke(ctx, p, P) {
    ctx.globalAlpha = 0.45; circle(ctx, 2, 12, 8, '#C9D4E4');
    ctx.globalAlpha = 0.65; circle(ctx, -3, -2, 11, '#C9D4E4');
    ctx.globalAlpha = 0.85; circle(ctx, 3, -18, 14, '#C9D4E4');
    ctx.globalAlpha = 1;
  },
  cabin(ctx, p, P) {
    rect(ctx, -62, -18, 124, 62, P.wood); // walls
    rect(ctx, -62, -18, 124, 8, '#77502F');
    poly(ctx, [[-76, -16], [0, -62], [76, -16]], P.roof); // roof
    poly(ctx, [[-76, -16], [0, -62], [76, -16], [62, -16], [0, -50], [-62, -16]], P.snow);
    rect(ctx, 26, -52, 16, 26, P.roof); // chimney
    rect(ctx, -11, 6, 22, 38, '#5E3A22'); // door
    circle(ctx, 5, 26, 2.4, P.amber);
    rect(ctx, -62, 42, 124, 5, '#77502F'); // step shadow line
  },
  cabinWindow(ctx, p, P) {
    const lit = p.variant === 'lit';
    rrect(ctx, -13, -13, 26, 26, 3, lit ? P.amber : P.ink);
    stroke(ctx, [[0, -13], [0, 13]], 3, P.roof);
    stroke(ctx, [[-13, 0], [13, 0]], 3, P.roof);
    ctx.strokeStyle = P.roof; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-15, -15, 30, 30, 4); ctx.stroke();
  },
  lantern(ctx, p, P) {
    stroke(ctx, [[0, -16], [0, 14]], 4, P.ink);
    if (p.variant === 'lit') {
      circle(ctx, 0, -22, 13, 'rgba(255,179,71,0.35)');
      rrect(ctx, -6, -30, 12, 15, 3, P.amber);
    } else {
      rrect(ctx, -6, -30, 12, 15, 3, P.ink);
    }
  },
  woodpile(ctx, p, P) {
    for (const [x, y] of [[-16, 10], [0, 10], [16, 10], [-8, -4], [8, -4], [0, -18]]) {
      circle(ctx, x, y, 9, '#C89B6A');
      circle(ctx, x, y, 5.5, '#A87B4C');
      circle(ctx, x, y, 2, '#C89B6A');
    }
  },
  campfire(ctx, p, P) {
    for (const [x, y] of [[-14, 12], [0, 15], [14, 12]]) circle(ctx, x, y, 6, '#9AA7B8');
    ctx.save(); ctx.rotate(0.5); rect(ctx, -18, 8, 36, 6, P.roof); ctx.restore();
    ctx.save(); ctx.rotate(-0.5); rect(ctx, -18, 8, 36, 6, '#5E3A22'); ctx.restore();
    if (p.variant === 'lit') {
      poly(ctx, [[-11, 8], [0, -22], [11, 8]], P.coral || '#FF7A59');
      poly(ctx, [[-6, 8], [1, -10], [7, 8]], P.amber);
      poly(ctx, [[-3, 8], [1, 0], [4, 8]], P.snow);
    }
  },
  snowman(ctx, p, P, tone) {
    stroke(ctx, [[-16, -18], [-30, -30]], 4, P.roof);
    stroke(ctx, [[16, -18], [30, -26]], 4, P.roof);
    circle(ctx, 0, 14, 17, P.snow);
    circle(ctx, 0, -12, 12.5, P.snow);
    rect(ctx, -13, -2, 26, 6, tone); // scarf band
    rect(ctx, 7, 2, 6, 14, tone); // scarf tail
    poly(ctx, [[2, -14], [16, -11], [2, -9]], '#FF7A59'); // carrot
    circle(ctx, -4, -16, 1.8, P.ink);
    circle(ctx, 4, -16, 1.8, P.ink);
    circle(ctx, 0, 8, 1.8, P.ink);
    circle(ctx, 0, 18, 1.8, P.ink);
  },
  sled(ctx, p, P) {
    stroke(ctx, [[-24, 12], [22, 12], [28, 6]], 4, P.red);
    stroke(ctx, [[-24, 4], [24, 4]], 4, P.red);
    for (const x of [-16, 0, 16]) rect(ctx, x - 3, -4, 6, 9, P.wood);
    stroke(ctx, [[24, 4], [36, -4]], 2.5, P.ink);
  },
  owl(ctx, p, P) {
    stroke(ctx, [[-14, 14], [14, 14]], 4, P.roof);
    ellipse(ctx, 0, 0, 11, 13, '#7A8BA8');
    ellipse(ctx, 0, 4, 7, 8, P.snow);
    poly(ctx, [[-10, -10], [-5, -16], [-2, -10]], '#7A8BA8');
    poly(ctx, [[10, -10], [5, -16], [2, -10]], '#7A8BA8');
    circle(ctx, -4, -5, 3.6, P.white);
    circle(ctx, 4, -5, 3.6, P.white);
    circle(ctx, -4, -5, 1.8, P.ink);
    circle(ctx, 4, -5, 1.8, P.ink);
    poly(ctx, [[-2, -1], [2, -1], [0, 2]], P.amber);
  },
  sundisc(ctx, p, P) {
    circle(ctx, 0, 0, 30, P.sun);
    circle(ctx, 0, 0, 38, 'rgba(255,209,102,0.3)');
    circle(ctx, 0, 0, 30, P.sun);
  },
  skyWindow(ctx, p, P) {
    rect(ctx, -8, -10, 16, 20, p.variant === 'lit' ? P.sun : '#1F2440');
    stroke(ctx, [[-8, 0], [8, 0]], 2, P.skyNear);
  },
  antenna(ctx, p, P) {
    stroke(ctx, [[0, 34], [0, -16]], 4, P.ink);
    stroke(ctx, [[-13, -4], [13, -4]], 3, P.ink);
    stroke(ctx, [[-9, 8], [9, 8]], 3, P.ink);
    if (p.variant === 'ball') circle(ctx, 0, -22, 6, P.red);
  },
  bird(ctx, p, P) {
    ctx.beginPath();
    ctx.arc(-8, 0, 8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.arc(8, 0, 8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
  },
  lightString(ctx, p, P) {
    ctx.beginPath();
    ctx.moveTo(-262, -20);
    ctx.quadraticCurveTo(0, 26, 262, -26);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.stroke();
    const tones = [P.sun, P.bloom, P.teal, P.white, P.white, P.teal, P.bloom, P.sun];
    for (let i = 0; i < 8; i++) {
      const t = 0.07 + i * 0.122;
      if (Math.abs(t - 0.5) < 0.05) continue; // centre bulb is its own prop
      const x = -262 + t * 524;
      const y = (1 - t) * (1 - t) * -20 + 2 * (1 - t) * t * 26 + t * t * -26;
      stroke(ctx, [[x, y], [x, y + 7]], 2, P.ink);
      circle(ctx, x, y + 12, 5.5, tones[i]);
    }
  },
  bulb(ctx, p, P, tone) {
    stroke(ctx, [[0, -13], [0, -4]], 2, P.ink);
    circle(ctx, 0, 3, 8, tone);
    circle(ctx, -2.5, 0.5, 2.4, 'rgba(255,255,255,0.65)');
  },
  waterTower(ctx, p, P) {
    for (const s of [-1, 1]) {
      stroke(ctx, [[s * 20, 6], [s * 30, 108]], 6, P.ink);
      stroke(ctx, [[s * 26, 58], [-s * 26, 58]], 4, P.ink);
    }
    rrect(ctx, -34, -34, 68, 44, 8, P.pot);
    poly(ctx, [[-40, -32], [0, -58], [40, -32]], P.parapet);
    rect(ctx, -34, -12, 68, 6, 'rgba(0,0,0,0.18)');
    if (p.variant === 'ladder') {
      stroke(ctx, [[14, 10], [14, 106]], 3.5, P.sun);
      stroke(ctx, [[26, 10], [26, 106]], 3.5, P.sun);
      for (let y = 22; y < 104; y += 14) stroke(ctx, [[14, y], [26, y]], 3, P.sun);
    }
  },
  laundry(ctx, p, P, tone) {
    stroke(ctx, [[-30, -16], [30, -20]], 2.5, P.white);
    if (p.id === 'shirt') {
      poly(ctx, [[-13, -15], [13, -17], [20, -6], [12, -2], [11, 16], [-11, 16], [-12, -2], [-20, -6]], tone);
      circle(ctx, 0, -8, 2, P.ink);
    } else {
      rrect(ctx, -13, -16, 26, 32, 2, tone);
      rect(ctx, -13, -6, 26, 4, 'rgba(255,255,255,0.35)');
    }
  },
  planter(ctx, p, P, tone) {
    if (tone === P.leaf) {
      circle(ctx, -12, -14, 12, P.leaf);
      circle(ctx, 10, -16, 13, P.leaf);
      circle(ctx, 0, -24, 12, '#5CB85F');
    } else {
      for (const [x, y] of [[-13, -18], [0, -26], [13, -18], [-6, -10], [7, -11]]) {
        stroke(ctx, [[x, 0], [x, y + 4]], 3, P.leaf);
        circle(ctx, x, y, 6, tone);
        circle(ctx, x, y, 2.2, P.sun);
      }
    }
    poly(ctx, [[-19, 0], [19, 0], [14, 20], [-14, 20]], P.pot);
    rect(ctx, -21, -3, 42, 6, '#9A5138');
  },
  pottedTree(ctx, p, P) {
    rect(ctx, -4, -16, 8, 26, '#5E3A22');
    circle(ctx, 0, -38, 24, P.leaf);
    circle(ctx, -20, -26, 16, P.leaf);
    circle(ctx, 20, -26, 16, '#5CB85F');
    circle(ctx, -8, -34, 3.4, P.bloom);
    circle(ctx, 12, -44, 3.4, P.bloom);
    poly(ctx, [[-16, 8], [16, 8], [12, 28], [-12, 28]], P.pot);
    rect(ctx, -18, 5, 36, 6, '#9A5138');
  },
  cat(ctx, p, P) {
    ellipse(ctx, 2, 6, 20, 13, P.ink); // body
    circle(ctx, -14, -8, 10, P.ink); // head
    poly(ctx, [[-22, -14], [-19, -24], [-13, -16]], P.ink);
    poly(ctx, [[-12, -16], [-7, -25], [-4, -14]], P.ink);
    ctx.beginPath();
    ctx.moveTo(20, 12);
    ctx.quadraticCurveTo(36, 10, 33, -8);
    ctx.strokeStyle = P.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    circle(ctx, -17, -9, 1.7, P.sun);
    circle(ctx, -10, -9, 1.7, P.sun);
  },
  wateringCan(ctx, p, P, tone) {
    rrect(ctx, -14, -8, 30, 22, 5, tone);
    poly(ctx, [[-14, -2], [-28, -12], [-26, -2], [-14, 6]], tone); // spout
    circle(ctx, -29, -12, 4, tone);
    ctx.beginPath(); ctx.arc(18, 2, 9, -1.2, 1.6);
    ctx.strokeStyle = tone; ctx.lineWidth = 5; ctx.stroke();
    rect(ctx, -6, -14, 14, 6, tone);
  },
};

export function paintProp(ctx, p, palette) {
  const painter = PAINTERS[p.kind];
  if (!painter) return;
  const tone = palette[p.tone] || palette.ink;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.flip) ctx.scale(-p.s, p.s); else ctx.scale(p.s, p.s);
  painter(ctx, p, palette, tone);
  ctx.restore();
}
