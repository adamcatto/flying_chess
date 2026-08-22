/**
 * Node sanity checks for the game engine and board geometry.
 * Run with: npx tsx scripts/simulate.ts
 */
import {
  LOOP,
  LOOP_LEN,
  LOOP_MAX,
  HOME,
  HOME_START,
  FINISH,
  CENTER,
  START_INDEX,
  applyShortcut,
  FLIGHT_TAKEOFF_REL,
  FLIGHT_LANDING_REL,
  absLoopIndex,
  OWN_COLOR_RELS,
  Color,
} from '../src/game/board';
import {
  initGame,
  roll,
  applyMove,
  GameState,
  RandomSource,
  planesOfTeam,
} from '../src/game/engine';

let failures = 0;
function check(name: string, cond: boolean) {
  if (!cond) {
    failures++;
    console.error('  ✗ FAIL:', name);
  } else {
    console.log('  ✓', name);
  }
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

console.log('\n== Board geometry (from board.png) ==');
check('loop has 48 cells', LOOP.length === 48 && LOOP_LEN === 48);
// consecutive loop cells adjacent (~1/15 apart, or ~sqrt2/15 at cut corners)
const step = 1 / 15;
let ringOk = true;
for (let i = 0; i < LOOP.length; i++) {
  const d = dist(LOOP[i], LOOP[(i + 1) % LOOP.length]);
  // Diagonally-cut corners step ~1.6 cells; allow up to 1.7.
  if (d > step * 1.7 + 1e-6) {
    ringOk = false;
    console.error('    gap at', i, d.toFixed(3));
  }
}
check('loop cells form a connected ring', ringOk);
// home runways: 6 cells, last adjacent to center, first near a loop tip
for (const color of ['yellow', 'blue', 'green', 'red'] as Color[]) {
  const h = HOME[color];
  let ok = h.length === 6 && dist(h[5], CENTER) <= step * 1.2;
  const tip = LOOP[(START_INDEX[color] + LOOP_LEN - 2) % LOOP_LEN];
  ok = ok && dist(tip, h[0]) <= step * 1.2;
  check(`${color} runway valid + connects loop tip -> center`, ok);
}

console.log('\n== Shortcuts (jump + flight) ==');
check('shortcut only fires on special squares', applyShortcut(3).kind === 'none' && applyShortcut(2).kind === 'jump');
check('flight takeoff flies to landing', applyShortcut(FLIGHT_TAKEOFF_REL).kind === 'flight' && applyShortcut(FLIGHT_TAKEOFF_REL).to === FLIGHT_LANDING_REL);
let bounded = true;
for (let r = 1; r < LOOP_MAX; r++) {
  const s = applyShortcut(r);
  if (s.to < r || s.to >= LOOP_MAX) bounded = false;
}
check('shortcuts never go backward or past home entry', bounded);
check('own-color rels are within loop', OWN_COLOR_RELS.every((r) => r >= 1 && r < LOOP_MAX));

console.log('\n== Full random games ==');
function playGame(seed: number) {
  let x = seed >>> 0;
  const rand: RandomSource = () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 0xffffffff;
  };
  let state: GameState = initGame();
  let steps = 0, launches = 0, captures = 0, jumps = 0, flights = 0;
  while (!state.winner && steps < 300000) {
    steps++;
    if (state.phase === 'roll') state = roll(state, rand);
    else if (state.phase === 'move') {
      const moves = state.legalMoves;
      const best =
        moves.find((m) => m.capturedIds.length > 0) ??
        moves.find((m) => m.to === FINISH) ??
        moves[Math.floor(rand() * moves.length)];
      if (best.from === -1) launches++;
      if (best.shortcut === 'jump') jumps++;
      if (best.shortcut === 'flight') flights++;
      captures += best.capturedIds.length;
      state = applyMove(state, best.planeId);
    } else break;
  }
  return { winner: state.winner, steps, launches, captures, jumps, flights };
}

let wins = { YG: 0, RB: 0, none: 0 };
let tl = 0, tc = 0, tj = 0, tf = 0, maxSteps = 0;
const N = 300;
for (let i = 0; i < N; i++) {
  const r = playGame(i * 7919 + 1);
  if (r.winner === 'YG') wins.YG++;
  else if (r.winner === 'RB') wins.RB++;
  else wins.none++;
  tl += r.launches; tc += r.captures; tj += r.jumps; tf += r.flights; maxSteps = Math.max(maxSteps, r.steps);
}
console.log(`  played ${N} games -> YG:${wins.YG} RB:${wins.RB} unfinished:${wins.none}`);
console.log(`  avg launches:${(tl / N).toFixed(1)} captures:${(tc / N).toFixed(1)} jumps:${(tj / N).toFixed(1)} flights:${(tf / N).toFixed(1)} maxSteps:${maxSteps}`);
check('every game finishes with a winner', wins.none === 0);
check('both teams win at least some games', wins.YG > 0 && wins.RB > 0);
check('launches, captures, jumps and flights all occur', tl > 0 && tc > 0 && tj > 0 && tf > 0);

console.log('\n== Rule spot checks ==');
{
  const g = initGame();
  check('roll of 1 with all in hangar -> no move', roll(g, () => 0).phase === 'roll');
  const six = roll(g, () => 0.99);
  check('roll of 6 offers a launch', six.phase === 'move' && six.legalMoves.some((m) => m.from === -1));
  check('blue launches at loop index 2', absLoopIndex('blue', 0) === 2);
  check('yellow launches at loop index 38', absLoopIndex('yellow', 0) === 38);
  check('home position has no loop index', absLoopIndex('yellow', HOME_START) === null);
}

console.log('\n== Result ==');
if (failures === 0) {
  console.log('ALL CHECKS PASSED ✅');
  process.exit(0);
} else {
  console.error(`${failures} CHECK(S) FAILED ❌`);
  process.exit(1);
}
