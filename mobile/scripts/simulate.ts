/**
 * Node sanity checks for the game engine and board geometry.
 * Run with: npx tsx scripts/simulate.ts
 */
import {
  LOOP,
  LOOP_LEN,
  HOME,
  CENTER,
  START_INDEX,
  applyShortcuts,
  absLoopIndex,
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

function adjacent(a: { row: number; col: number }, b: { row: number; col: number }) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

console.log('\n== Board geometry ==');
check('loop has 56 cells', LOOP.length === 56 && LOOP_LEN === 56);
let allAdjacent = true;
for (let i = 0; i < LOOP.length; i++) {
  if (!adjacent(LOOP[i], LOOP[(i + 1) % LOOP.length])) {
    allAdjacent = false;
    console.error('    non-adjacent at', i, LOOP[i], LOOP[(i + 1) % LOOP.length]);
  }
}
check('loop cells are all adjacent (closed ring)', allAdjacent);

const uniq = new Set(LOOP.map((c) => `${c.row},${c.col}`));
check('loop cells are unique', uniq.size === 56);

// Home columns: 6 cells each, adjacent, last one adjacent to center.
for (const color of ['yellow', 'blue', 'green', 'red'] as Color[]) {
  const h = HOME[color];
  let ok = h.length === 6;
  for (let i = 0; i < h.length - 1; i++) ok = ok && adjacent(h[i], h[i + 1]);
  ok = ok && adjacent(h[5], CENTER);
  // entry: tip is 2 before start; home[0] adjacent to that tip
  const tip = LOOP[(START_INDEX[color] + LOOP_LEN - 2) % LOOP_LEN];
  ok = ok && adjacent(tip, h[0]);
  check(`${color} home column valid + connects to loop & center`, ok);
}

console.log('\n== Shortcuts (bounded, no infinite loop) ==');
let bounded = true;
for (let p = 0; p <= 57; p++) {
  const r = applyShortcuts(p);
  if (r < p || r > 57) bounded = false;
}
check('applyShortcuts never decreases or overshoots finish', bounded);
check('flight takeoff (16) flies +12 then jumps +4 -> 32', applyShortcuts(16) === 32);
check('own-color square (8) jumps +4', applyShortcuts(8) === 12);
check('jump into flight combo (12 -> 16 -> 28)', applyShortcuts(12) === 28);
check('non-color square (5) unchanged', applyShortcuts(5) === 5);

console.log('\n== Full random games ==');
function playGame(seed: number): { winner: string | null; steps: number; launches: number; captures: number } {
  // simple deterministic PRNG for reproducibility
  let x = seed >>> 0;
  const rand: RandomSource = () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 0xffffffff;
  };
  let state: GameState = initGame();
  let steps = 0;
  let launches = 0;
  let captures = 0;
  while (!state.winner && steps < 200000) {
    steps++;
    if (state.phase === 'roll') {
      state = roll(state, rand);
    } else if (state.phase === 'move') {
      // pick a random legal move, preferring captures then finishing then launches
      const moves = state.legalMoves;
      const best =
        moves.find((m) => m.capturedIds.length > 0) ??
        moves.find((m) => m.to === 57) ??
        moves[Math.floor(rand() * moves.length)];
      if (best.from === -1) launches++;
      captures += best.capturedIds.length;
      state = applyMove(state, best.planeId);
    } else break;
  }
  return { winner: state.winner, steps, launches, captures };
}

let wins = { YG: 0, RB: 0, none: 0 };
let totalLaunches = 0;
let totalCaptures = 0;
let maxSteps = 0;
const N = 300;
for (let i = 0; i < N; i++) {
  const r = playGame(i * 7919 + 1);
  if (r.winner === 'YG') wins.YG++;
  else if (r.winner === 'RB') wins.RB++;
  else wins.none++;
  totalLaunches += r.launches;
  totalCaptures += r.captures;
  maxSteps = Math.max(maxSteps, r.steps);
}
console.log(`  played ${N} games -> YG:${wins.YG} RB:${wins.RB} unfinished:${wins.none}`);
console.log(`  avg launches/game: ${(totalLaunches / N).toFixed(1)}, avg captures/game: ${(totalCaptures / N).toFixed(1)}, max steps: ${maxSteps}`);
check('every game finishes with a winner', wins.none === 0);
check('both teams win at least some games (fair-ish)', wins.YG > 0 && wins.RB > 0);
check('planes launch during play', totalLaunches > 0);
check('captures occur during play', totalCaptures > 0);

console.log('\n== Rule spot checks ==');
{
  // Hangar plane cannot move on a non-6.
  const g = initGame();
  const forcedNonSix = roll(g, () => 0); // rand->1
  check('roll of 1 with all planes in hangar yields no move (turn continues)', forcedNonSix.phase === 'roll');
  const forcedSix = roll(g, () => 0.99); // rand->6
  check('roll of 6 offers a launch move', forcedSix.phase === 'move' && forcedSix.legalMoves.some((m) => m.from === -1));
  // absLoopIndex sanity
  check('yellow pos 0 is loop index 0', absLoopIndex('yellow', 0) === 0);
  check('blue pos 0 is loop index 14', absLoopIndex('blue', 0) === 14);
  check('home pos has no loop index', absLoopIndex('yellow', 55) === null);
}

console.log('\n== Result ==');
if (failures === 0) {
  console.log('ALL CHECKS PASSED ✅');
  process.exit(0);
} else {
  console.error(`${failures} CHECK(S) FAILED ❌`);
  process.exit(1);
}
