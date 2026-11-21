// Double Take — screenshot states. The maker's screenshots are real renders
// of this game in a browser; a ?shot=<name> URL parks the game in one fixed,
// honest mid-game state (a real scene, real finds on real hotspots, the real
// HUD) with the clock frozen, so the picture can be captured exactly as a
// player would see it. Nothing here draws anything the game doesn't draw.

import { SCENES } from './scenes.js';

const ids = (sceneIdx, n) => SCENES[sceneIdx].differences.slice(0, n).map((d) => d.id);

export const SHOTS = {
  // The cover: Coral Cove mid-round, three found and ringed, five to go.
  cover(game) {
    game.applyState({ scene: 0, foundIds: ids(0, 3), timeLeft: 167, score: 300, hintsLeft: 3 });
    game.hud.say('Found: The starfish turned pink. +100');
  },
  // Pinewood Cabin mid-round, four found.
  cabin(game) {
    game.applyState({ scene: 1, foundIds: ids(1, 4), timeLeft: 183, score: 400, hintsLeft: 2 });
    game.hud.say('Found: A window went dark. +100');
  },
  // Rooftop Garden late-round: seven found, three to go, clock running low.
  rooftop(game) {
    game.applyState({ scene: 2, foundIds: ids(2, 7), timeLeft: 24, score: 700, hintsLeft: 1 });
    game.hud.say('Found: A new flower pot appeared. +100');
  },
  // The win card over the finished rooftop, every difference ringed.
  win(game) {
    game.applyState({ scene: 2, foundIds: ids(2, 10), timeLeft: 74, score: 2262, hintsLeft: 1 });
    game.onWin(148);
  },
};

export function applyShot(game, name) {
  const shot = SHOTS[name];
  if (!shot) return false;
  shot(game);
  document.body.classList.add('shot');
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = name; }));
  return true;
}
