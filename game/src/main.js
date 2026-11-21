// Double Take — boot. Wires the game into the page and picks the mode from
// the URL: plain (title screen), ?shot=<name> (a fixed state for the
// maker's screenshots), or ?selftest=1 (the game plays itself and reports).

import { Game } from './play.js';
import { applyShot } from './shots.js';
import { runSelftest } from './selftest.js';

const params = new URLSearchParams(location.search);
const root = document.getElementById('app');
const game = new Game(root, { frozen: params.has('shot') });
window.DoubleTake = { game };

if (params.has('selftest')) {
  runSelftest(game);
} else if (params.has('shot')) {
  if (!applyShot(game, params.get('shot'))) game.showTitle();
} else {
  game.showTitle();
}
