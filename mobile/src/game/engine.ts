/**
 * Pure game engine for Flying Chess — 2-player team mode.
 *
 * Teams: YG (yellow + green) vs RB (red + blue). Each team owns 8 planes.
 * On a turn a team gets 2 base rolls; rolling a 6 grants an extra roll on top
 * (and lets a plane launch from the hangar). Three 6s in a row forfeit the turn
 * and send the last-moved plane back to the hangar. First team to get all 8 of
 * its planes to the center wins.
 *
 * The engine is deterministic given a random source, and holds no UI state, so
 * it can be unit-tested directly under node.
 */

import {
  Color,
  Team,
  FINISH,
  HANGAR,
  LOOP_MAX,
  absLoopIndex,
  applyShortcut,
  ShortcutKind,
  colorsOfTeam,
  teamOf,
  SAFE_LOOP_INDICES,
} from './board';

export interface Plane {
  id: string;
  color: Color;
  slot: number; // 0..3, stable hangar slot for rendering
  pos: number; // -1 hangar, 0..56 board/home, 57 finished
}

export type Phase = 'roll' | 'move' | 'gameover';

export interface LegalMove {
  planeId: string;
  from: number;
  to: number;
  capturedIds: string[];
  /** which board shortcut (if any) this move used */
  shortcut: ShortcutKind;
}

export interface GameState {
  planes: Plane[];
  currentTeam: Team;
  phase: Phase;
  die: number | null;
  rollsLeft: number; // base rolls remaining this turn
  consecutiveSixes: number;
  legalMoves: LegalMove[];
  lastMovedPlaneId: string | null;
  winner: Team | null;
  message: string;
}

export const BASE_ROLLS_PER_TURN = 2;

export function planesOfColor(state: GameState, color: Color): Plane[] {
  return state.planes.filter((p) => p.color === color);
}

export function planesOfTeam(state: GameState, team: Team): Plane[] {
  const colors = colorsOfTeam(team);
  return state.planes.filter((p) => colors.includes(p.color));
}

export function teamLabel(team: Team): string {
  return team === 'YG' ? 'Yellow + Green' : 'Red + Blue';
}

/** Create a fresh game. YG moves first. */
export function initGame(): GameState {
  const planes: Plane[] = [];
  for (const color of ['yellow', 'green', 'red', 'blue'] as Color[]) {
    for (let slot = 0; slot < 4; slot++) {
      planes.push({ id: `${color}-${slot}`, color, slot, pos: HANGAR });
    }
  }
  return {
    planes,
    currentTeam: 'YG',
    phase: 'roll',
    die: null,
    rollsLeft: BASE_ROLLS_PER_TURN,
    consecutiveSixes: 0,
    legalMoves: [],
    lastMovedPlaneId: null,
    winner: null,
    message: `${teamLabel('YG')} — tap ROLL to begin`,
  };
}

function otherTeam(team: Team): Team {
  return team === 'YG' ? 'RB' : 'YG';
}

/** Compute where a plane would land for a given die, or null if it can't move. */
function landingFor(plane: Plane, die: number): { to: number; shortcut: ShortcutKind } | null {
  if (plane.pos === FINISH) return null;

  // In the hangar: can only launch with a 6.
  if (plane.pos === HANGAR) {
    if (die !== 6) return null;
    return { to: 0, shortcut: 'none' };
  }

  // On the loop or in the home column.
  let raw = plane.pos + die;
  if (raw > FINISH) {
    // Overshoot the center bounces back the same number of steps.
    raw = FINISH - (raw - FINISH);
  }
  let to = raw;
  let shortcut: ShortcutKind = 'none';
  if (to >= 1 && to < LOOP_MAX) {
    const res = applyShortcut(to);
    to = res.to;
    shortcut = res.kind;
  }
  return { to, shortcut };
}

/** Opponent planes that would be captured by landing on `to`. */
function capturesFor(state: GameState, mover: Plane, to: number): string[] {
  const absIdx = absLoopIndex(mover.color, to);
  if (absIdx === null) return []; // not on the loop -> no capture (home is private)
  if (SAFE_LOOP_INDICES.has(absIdx)) return []; // start squares are safe
  const moverTeam = teamOf(mover.color);
  const captured: string[] = [];
  for (const p of state.planes) {
    if (p.id === mover.id) continue;
    if (teamOf(p.color) === moverTeam) continue; // never capture teammates
    if (absLoopIndex(p.color, p.pos) === absIdx) captured.push(p.id);
  }
  return captured;
}

export function computeLegalMoves(state: GameState, die: number): LegalMove[] {
  const moves: LegalMove[] = [];
  for (const plane of planesOfTeam(state, state.currentTeam)) {
    const landing = landingFor(plane, die);
    if (!landing) continue;
    moves.push({
      planeId: plane.id,
      from: plane.pos,
      to: landing.to,
      capturedIds: capturesFor(state, plane, landing.to),
      shortcut: landing.shortcut,
    });
  }
  return moves;
}

function clone(state: GameState): GameState {
  return {
    ...state,
    planes: state.planes.map((p) => ({ ...p })),
    legalMoves: [],
  };
}

/** Move to the next team and reset per-turn counters. */
function passTurn(state: GameState): GameState {
  const next = otherTeam(state.currentTeam);
  return {
    ...state,
    currentTeam: next,
    phase: 'roll',
    die: null,
    rollsLeft: BASE_ROLLS_PER_TURN,
    consecutiveSixes: 0,
    legalMoves: [],
    message: `${teamLabel(next)}'s turn — tap ROLL`,
  };
}

export type RandomSource = () => number; // returns a float in [0,1)

const defaultRandom: RandomSource = Math.random;

export function rollValue(rand: RandomSource = defaultRandom): number {
  return 1 + Math.floor(rand() * 6);
}

/**
 * Roll the die and compute the resulting state. If there are legal moves the
 * phase becomes 'move'; otherwise the roll is consumed and the turn advances.
 */
export function roll(state: GameState, rand: RandomSource = defaultRandom): GameState {
  if (state.phase !== 'roll' || state.winner) return state;
  const die = rollValue(rand);
  const consecutiveSixes = die === 6 ? state.consecutiveSixes + 1 : 0;

  // Three 6s in a row: forfeit the turn; the last plane moved this turn (if
  // any) is sent back to its hangar.
  if (consecutiveSixes >= 3) {
    let s = clone(state);
    if (s.lastMovedPlaneId) {
      const p = s.planes.find((pl) => pl.id === s.lastMovedPlaneId);
      if (p && p.pos !== FINISH) p.pos = HANGAR;
    }
    s = passTurn(s);
    s.die = die;
    s.message = `Three 6s in a row! ${teamLabel(state.currentTeam)} forfeits the turn.`;
    return s;
  }

  const legalMoves = computeLegalMoves(state, die);

  if (legalMoves.length === 0) {
    let s = clone(state);
    s.die = die;
    s.consecutiveSixes = consecutiveSixes;
    if (die === 6) {
      // No move available on a 6 (rare) — just pass to keep play moving.
      s = passTurn(s);
      s.die = die;
      s.message = `Rolled a 6 but no legal move. ${teamLabel(state.currentTeam)}'s turn.`;
      return s;
    }
    // Consume one base roll.
    s.rollsLeft = state.rollsLeft - 1;
    if (s.rollsLeft <= 0) {
      s = passTurn(s);
      s.die = die;
      s.message = `No legal move for a ${die}. ${teamLabel(otherTeam(state.currentTeam))}'s turn.`;
    } else {
      s.consecutiveSixes = 0; // non-6 resets the streak
      s.message = `No legal move for a ${die}. Roll again (${s.rollsLeft} left).`;
    }
    return s;
  }

  return {
    ...clone(state),
    die,
    consecutiveSixes,
    phase: 'move',
    legalMoves,
    message: `Rolled a ${die} — tap a highlighted plane`,
  };
}

/** Apply the chosen plane's move (must be one of state.legalMoves). */
export function applyMove(state: GameState, planeId: string): GameState {
  if (state.phase !== 'move') return state;
  const move = state.legalMoves.find((m) => m.planeId === planeId);
  if (!move) return state;

  const s = clone(state);
  const plane = s.planes.find((p) => p.id === planeId)!;
  plane.pos = move.to;
  for (const cid of move.capturedIds) {
    const cap = s.planes.find((p) => p.id === cid)!;
    cap.pos = HANGAR;
  }
  s.lastMovedPlaneId = planeId;

  const captured = move.capturedIds.length;
  let msg = '';
  if (move.to === FINISH) msg = 'A plane reached home! ';
  if (captured > 0) msg += `Captured ${captured} enemy plane${captured > 1 ? 's' : ''}! `;
  if (move.to !== FINISH) {
    if (move.shortcut === 'flight') msg += 'Flight! ✈ ';
    else if (move.shortcut === 'jump') msg += 'Same-color jump! ';
  }

  // Win check: all 8 planes of the current team finished.
  const teamPlanes = planesOfTeam(s, s.currentTeam);
  if (teamPlanes.every((p) => p.pos === FINISH)) {
    s.phase = 'gameover';
    s.winner = s.currentTeam;
    s.legalMoves = [];
    s.message = `${teamLabel(s.currentTeam)} wins! 🎉`;
    return s;
  }

  const die = s.die!;
  s.legalMoves = [];

  if (die === 6) {
    // Bonus roll for the same team (does not consume a base roll).
    s.phase = 'roll';
    s.die = null;
    s.message = `${msg}Rolled a 6 — roll again!`;
    return s;
  }

  // Non-6: consume a base roll, streak resets.
  s.consecutiveSixes = 0;
  const rollsLeft = s.rollsLeft - 1;
  if (rollsLeft <= 0) {
    const passed = passTurn(s);
    passed.message = `${msg}${teamLabel(passed.currentTeam)}'s turn.`.trim();
    return passed;
  }
  s.rollsLeft = rollsLeft;
  s.phase = 'roll';
  s.die = null;
  s.message = `${msg}Roll again (${rollsLeft} left).`.trim();
  return s;
}
