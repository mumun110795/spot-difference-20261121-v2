// Double Take — scene data.
//
// Every scene is a flat list of props painted from this data, plus a list of
// differences. A difference is a small edit (remove / recolor / variant /
// move / add) applied to a copy of the prop list to build the right-hand
// panel, so the two panels can never drift apart: they are the same data,
// once with the edits and once without. Each difference also carries the
// hotspot a player clicks (x, y, r in the 600x450 scene space) and a short
// label the game shows when it is found.

export const SCENE_W = 600;
export const SCENE_H = 450;

function prop(id, kind, x, y, extra = {}) {
  return { id, kind, x, y, s: 1, tone: 'main', flip: false, variant: 'std', ...extra };
}

function diff(id, x, y, r, label, change, also = null) {
  return { id, x, y, r, label, change, also };
}

export const SCENES = [
  {
    id: 'coral-cove',
    name: 'Coral Cove',
    sub: 'A reef at noon',
    seconds: 240,
    palette: {
      seaTop: '#1B7F9E', seaMid: '#146B87', seaDeep: '#0D4E66', sand: '#EAD9A0',
      coral: '#FF7A59', pink: '#FF9FB2', leaf: '#43AA6B', sun: '#FFD166',
      ink: '#083B4A', white: '#FFFFFF', shell: '#FFF3D6', rock: '#0A4256',
    },
    props: [
      prop('weedA', 'seaweed', 58, 336, { s: 1.25 }),
      prop('weedB', 'seaweed', 548, 326, { s: 1.1, flip: true }),
      prop('weedC', 'seaweed', 252, 356, { s: 0.8 }),
      prop('coralFan', 'coralFan', 356, 356, { tone: 'pink' }),
      prop('anemone', 'anemone', 178, 398, {}),
      prop('turtle', 'turtle', 302, 148, { s: 1.25 }),
      prop('fishA', 'fish', 150, 118, { tone: 'coral' }),
      prop('fishB', 'fish', 188, 142, { tone: 'coral', s: 0.75, flip: true }),
      prop('fishC', 'fish', 432, 108, { tone: 'sun', s: 0.9 }),
      prop('seahorse', 'seahorse', 522, 182, { tone: 'sun' }),
      prop('bubblesA', 'bubbles', 322, 84, {}),
      prop('bubblesB', 'bubbles', 118, 204, { s: 0.8 }),
      prop('starfish', 'starfish', 92, 388, { tone: 'coral' }),
      prop('clam', 'clam', 502, 392, { variant: 'pearl' }),
      prop('crab', 'crab', 452, 416, {}),
    ],
    differences: [
      diff('reef-fish', 150, 118, 30, 'The orange fish swam away', { op: 'remove', prop: 'fishA' }),
      diff('reef-star', 92, 388, 27, 'The starfish turned pink', { op: 'recolor', prop: 'starfish', tone: 'pink' }),
      diff('reef-clam', 502, 392, 31, 'The clam hid its pearl', { op: 'variant', prop: 'clam', variant: 'shut' }),
      diff('reef-weed', 548, 326, 30, 'A seaweed frond vanished', { op: 'remove', prop: 'weedB' }),
      diff('reef-crab', 392, 424, 27, 'The crab scuttled sideways', { op: 'move', prop: 'crab', dx: -60, dy: 8 }, { x: 452, y: 416 }),
      diff('reef-coral', 356, 356, 31, 'The fan coral changed colour', { op: 'recolor', prop: 'coralFan', tone: 'coral' }),
      diff('reef-bubbles', 118, 204, 25, 'The bubbles popped', { op: 'remove', prop: 'bubblesB' }),
      diff('reef-guest', 256, 214, 25, 'A little pink fish wandered in', { op: 'add', prop: prop('guestFish', 'fish', 256, 214, { tone: 'pink', s: 0.7 }) }),
    ],
  },
  {
    id: 'pinewood-cabin',
    name: 'Pinewood Cabin',
    sub: 'First snow at dusk',
    seconds: 270,
    palette: {
      sky: '#2E3A67', peakFar: '#8FA3C7', peakNear: '#5D7195', snow: '#EDF3FA',
      hill: '#3E5C48', pine: '#2F5D46', wood: '#8A5A3B', roof: '#6E4630',
      amber: '#FFB347', ink: '#1E2A3A', lake: '#BCD6EA', red: '#D9534F', teal: '#3FA7A0',
    },
    props: [
      prop('moon', 'moon', 506, 68, { variant: 'full' }),
      prop('starA', 'star', 118, 58, {}),
      prop('starB', 'star', 232, 40, { s: 0.8 }),
      prop('starC', 'star', 392, 54, { s: 0.9 }),
      prop('starD', 'star', 316, 84, { s: 0.65 }),
      prop('pineA', 'pine', 88, 238, { s: 1.3 }),
      prop('pineB', 'pine', 142, 266, { s: 1.0 }),
      prop('pineC', 'pine', 472, 248, { s: 1.2 }),
      prop('pineD', 'pine', 528, 274, { s: 0.95 }),
      prop('pineE', 'pine', 198, 278, { s: 0.75 }),
      prop('smoke', 'smoke', 338, 148, {}),
      prop('cabin', 'cabin', 300, 262, {}),
      prop('winL', 'cabinWindow', 264, 268, { variant: 'lit' }),
      prop('winR', 'cabinWindow', 336, 268, { variant: 'lit' }),
      prop('lantern', 'lantern', 300, 306, { variant: 'lit' }),
      prop('woodpile', 'woodpile', 392, 306, {}),
      prop('fire', 'campfire', 148, 352, { variant: 'lit' }),
      prop('snowman', 'snowman', 432, 332, { tone: 'red' }),
      prop('sled', 'sled', 522, 362, {}),
    ],
    differences: [
      diff('cab-moon', 506, 68, 31, 'The moon turned crescent', { op: 'variant', prop: 'moon', variant: 'crescent' }),
      diff('cab-smoke', 338, 148, 27, 'The chimney smoke stopped', { op: 'remove', prop: 'smoke' }),
      diff('cab-window', 336, 268, 23, 'A window went dark', { op: 'variant', prop: 'winR', variant: 'dark' }),
      diff('cab-pine', 472, 248, 31, 'A pine tree is gone', { op: 'remove', prop: 'pineC' }),
      diff('cab-scarf', 432, 322, 26, "The snowman's scarf changed colour", { op: 'recolor', prop: 'snowman', tone: 'teal' }),
      diff('cab-fire', 148, 352, 27, 'The campfire went out', { op: 'variant', prop: 'fire', variant: 'out' }),
      diff('cab-star', 232, 40, 21, 'A star blinked out', { op: 'remove', prop: 'starB' }),
      diff('cab-sled', 452, 376, 29, 'The sled slid downhill', { op: 'move', prop: 'sled', dx: -70, dy: 14 }, { x: 522, y: 362 }),
      diff('cab-owl', 142, 218, 21, 'An owl moved in', { op: 'add', prop: prop('owl', 'owl', 142, 218, {}) }),
    ],
  },
  {
    id: 'rooftop-garden',
    name: 'Rooftop Garden',
    sub: 'Evening above the city',
    seconds: 300,
    palette: {
      sky: '#4B3A6E', skyFar: '#3A3F66', skyNear: '#2C3050', parapet: '#5E382C',
      floor: '#7A4A3C', leaf: '#4E9A51', bloom: '#FF8FA3', sun: '#FFD166',
      ink: '#241F33', pot: '#B56545', teal: '#3FA7A0', white: '#FFFFFF', red: '#D9534F',
    },
    props: [
      prop('sun', 'sundisc', 92, 78, {}),
      prop('winFar', 'skyWindow', 150, 148, { variant: 'lit' }),
      prop('winFar2', 'skyWindow', 268, 128, { variant: 'lit', s: 0.8 }),
      prop('winFar3', 'skyWindow', 428, 158, { variant: 'dark', s: 0.9 }),
      prop('antenna', 'antenna', 560, 62, { variant: 'ball' }),
      prop('birdA', 'bird', 348, 88, {}),
      prop('birdB', 'bird', 386, 104, { s: 0.8 }),
      prop('lightString', 'lightString', 300, 128, {}),
      prop('bulbOdd', 'bulb', 300, 141, { tone: 'sun' }),
      prop('tower', 'waterTower', 482, 128, { variant: 'ladder' }),
      prop('shirt', 'laundry', 96, 226, { tone: 'white' }),
      prop('towel', 'laundry', 152, 222, { tone: 'teal', s: 0.85 }),
      prop('planterA', 'planter', 118, 332, { tone: 'bloom' }),
      prop('planterB', 'planter', 300, 352, { tone: 'leaf' }),
      prop('planterC', 'planter', 468, 342, { tone: 'sun' }),
      prop('pottedTree', 'pottedTree', 352, 296, {}),
      prop('cat', 'cat', 208, 396, {}),
      prop('wateringCan', 'wateringCan', 546, 396, { tone: 'teal' }),
    ],
    differences: [
      diff('roof-cat', 208, 396, 27, 'The cat slipped away', { op: 'remove', prop: 'cat' }),
      diff('roof-bloom', 118, 332, 29, 'The flowers turned yellow', { op: 'recolor', prop: 'planterA', tone: 'sun' }),
      diff('roof-ladder', 482, 196, 25, "The water tower's ladder is gone", { op: 'variant', prop: 'tower', variant: 'plain' }),
      diff('roof-bulb', 300, 141, 21, 'One bulb burns pink', { op: 'recolor', prop: 'bulbOdd', tone: 'bloom' }),
      diff('roof-towel', 152, 222, 23, 'The towel changed colour', { op: 'recolor', prop: 'towel', tone: 'bloom' }),
      diff('roof-bird', 386, 104, 21, 'A bird flew off', { op: 'remove', prop: 'birdB' }),
      diff('roof-planter', 392, 398, 25, 'A new flower pot appeared', { op: 'add', prop: prop('planterMini', 'planter', 392, 398, { tone: 'bloom', s: 0.62 }) }),
      diff('roof-can', 546, 396, 25, 'The watering can turned red', { op: 'recolor', prop: 'wateringCan', tone: 'red' }),
      diff('roof-window', 150, 148, 21, 'A city window went dark', { op: 'variant', prop: 'winFar', variant: 'dark' }),
      diff('roof-antenna', 560, 62, 21, "The antenna's ball fell off", { op: 'variant', prop: 'antenna', variant: 'bare' }),
    ],
  },
];

// Build the right-hand panel's prop list by applying every difference's
// change to a copy of the scene's props.
export function rightProps(scene) {
  const byId = new Map(scene.props.map((p) => [p.id, { ...p }]));
  for (const d of scene.differences) {
    const c = d.change;
    if (c.op === 'remove') byId.delete(c.prop);
    else if (c.op === 'add') byId.set(c.prop.id, { ...c.prop });
    else {
      const target = byId.get(c.prop);
      if (!target) continue;
      if (c.op === 'recolor') target.tone = c.tone;
      if (c.op === 'variant') target.variant = c.variant;
      if (c.op === 'move') { target.x += c.dx; target.y += c.dy; }
    }
  }
  return [...byId.values()];
}
