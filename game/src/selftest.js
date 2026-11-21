// Double Take — built-in selftest. Open the game with ?selftest=1 and it
// plays itself honestly: for every scene it spots every difference through
// the same spotAt() a click calls, takes a deliberate miss, spends a hint,
// and checks the clear and win states arrive. The verdict is written into
// #selftest-report and the document title, and every page error is counted.

import { SCENES } from './scenes.js';

export function runSelftest(game) {
  const report = document.createElement('pre');
  report.id = 'selftest-report';
  document.body.append(report);
  const lines = [];
  let failures = 0;
  let pageErrors = 0;
  window.addEventListener('error', () => { pageErrors += 1; });

  const check = (name, ok) => {
    lines.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
    if (!ok) failures += 1;
  };

  SCENES.forEach((scene, i) => {
    game.startScene(i);
    // a deliberate miss, far from every hotspot
    const miss = game.spotAt(8, 8);
    check(`scene ${i + 1} miss registers`, miss === 'miss' && game.sceneMisses === 1);
    // a hint names a real unfound difference and costs one hint
    const hinted = game.useHint();
    check(`scene ${i + 1} hint works`, !!hinted && game.hintsLeft === 2);
    // every difference is findable through its own hotspot
    let allFound = true;
    for (const d of scene.differences) {
      if (game.spotAt(d.x, d.y) !== 'found') allFound = false;
    }
    check(`scene ${i + 1} all ${scene.differences.length} differences findable`, allFound);
    check(`scene ${i + 1} found set complete`, game.found.size === scene.differences.length);
    const expectedMode = i === SCENES.length - 1 ? 'win' : 'clear';
    check(`scene ${i + 1} ends in ${expectedMode}`, game.mode === expectedMode);
    // re-spotting a found difference is a miss, never a double count
    game.startScene(i);
    const d0 = scene.differences[0];
    game.spotAt(d0.x, d0.y);
    const again = game.spotAt(d0.x, d0.y);
    check(`scene ${i + 1} no double count`, again === 'miss' && game.found.size === 1);
  });

  // the clock can end a scene: run one tick with a full second elapsed
  game.startScene(0);
  game.timeLeft = 0.05;
  game.lastTick = performance.now() - 1000;
  game.tick();
  check('time up ends the scene', game.mode === 'timeup');

  check('no page errors', pageErrors === 0);
  const total = lines.length;
  const passed = total - failures;
  lines.push(`SELFTEST: ${failures === 0 ? 'PASS' : 'FAIL'} ${passed}/${total}`);
  report.textContent = lines.join('\n');
  document.title = `SELFTEST ${failures === 0 ? 'PASS' : 'FAIL'} ${passed}/${total}`;
  window.__selftest = { passed, total, failures };
}
