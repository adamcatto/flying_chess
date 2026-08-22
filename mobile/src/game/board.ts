/**
 * Board geometry for Flying Chess (aeroplane chess / Ludo-style board).
 *
 * The board is a 15x15 grid (rows/cols 0..14). Four 6x6 bases sit in the
 * corners, a cross-shaped track fills the arms, and the four colored "home"
 * columns lead into the center finish square at (7,7).
 *
 * Colors are placed to match the classic board:
 *   yellow = top-left, blue = top-right, green = bottom-right, red = bottom-left.
 *
 * Teams (2-player mode): YG = yellow + green, RB = red + blue.
 *
 * The main loop has 56 cells (14 per quadrant). Every pair of consecutive cells
 * (including the wrap from the last to the first) is orthogonally adjacent, so a
 * plane always steps between edge-touching squares.
 */

export type Color = 'yellow' | 'blue' | 'green' | 'red';
export type Team = 'YG' | 'RB';

export const COLORS: Color[] = ['yellow', 'blue', 'green', 'red'];

export const GRID = 15;

/** A cell on the 15x15 grid. */
export interface Cell {
  row: number;
  col: number;
}

/**
 * The 56-cell main loop, listed clockwise. Index 0 is yellow's start square.
 * Adjacent indices are always orthogonally adjacent grid cells; index 55 wraps
 * to index 0.
 */
export const LOOP: Cell[] = [
  { row: 6, col: 1 }, // 0  yellow start
  { row: 6, col: 2 }, // 1
  { row: 6, col: 3 }, // 2
  { row: 6, col: 4 }, // 3
  { row: 6, col: 5 }, // 4
  { row: 6, col: 6 }, // 5  corner
  { row: 5, col: 6 }, // 6
  { row: 4, col: 6 }, // 7
  { row: 3, col: 6 }, // 8
  { row: 2, col: 6 }, // 9
  { row: 1, col: 6 }, // 10
  { row: 0, col: 6 }, // 11
  { row: 0, col: 7 }, // 12 blue home entry (top tip)
  { row: 0, col: 8 }, // 13
  { row: 1, col: 8 }, // 14 blue start
  { row: 2, col: 8 }, // 15
  { row: 3, col: 8 }, // 16
  { row: 4, col: 8 }, // 17
  { row: 5, col: 8 }, // 18
  { row: 6, col: 8 }, // 19 corner
  { row: 6, col: 9 }, // 20
  { row: 6, col: 10 }, // 21
  { row: 6, col: 11 }, // 22
  { row: 6, col: 12 }, // 23
  { row: 6, col: 13 }, // 24
  { row: 6, col: 14 }, // 25
  { row: 7, col: 14 }, // 26 green home entry (right tip)
  { row: 8, col: 14 }, // 27
  { row: 8, col: 13 }, // 28 green start
  { row: 8, col: 12 }, // 29
  { row: 8, col: 11 }, // 30
  { row: 8, col: 10 }, // 31
  { row: 8, col: 9 }, // 32
  { row: 8, col: 8 }, // 33 corner
  { row: 9, col: 8 }, // 34
  { row: 10, col: 8 }, // 35
  { row: 11, col: 8 }, // 36
  { row: 12, col: 8 }, // 37
  { row: 13, col: 8 }, // 38
  { row: 14, col: 8 }, // 39
  { row: 14, col: 7 }, // 40 red home entry (bottom tip)
  { row: 14, col: 6 }, // 41
  { row: 13, col: 6 }, // 42 red start
  { row: 12, col: 6 }, // 43
  { row: 11, col: 6 }, // 44
  { row: 10, col: 6 }, // 45
  { row: 9, col: 6 }, // 46
  { row: 8, col: 6 }, // 47 corner
  { row: 8, col: 5 }, // 48
  { row: 8, col: 4 }, // 49
  { row: 8, col: 3 }, // 50
  { row: 8, col: 2 }, // 51
  { row: 8, col: 1 }, // 52
  { row: 8, col: 0 }, // 53
  { row: 7, col: 0 }, // 54 yellow home entry (left tip)
  { row: 6, col: 0 }, // 55
];

export const LOOP_LEN = LOOP.length; // 56

/** Where each color launches onto the loop (its start index). */
export const START_INDEX: Record<Color, number> = {
  yellow: 0,
  blue: 14,
  green: 28,
  red: 42,
};

/**
 * The colored home column for each color: 6 cells leading toward the center.
 * A plane enters home[0] after completing the loop, and reaches the center
 * (finish) one step past home[5].
 */
export const HOME: Record<Color, Cell[]> = {
  yellow: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
    { row: 7, col: 6 },
  ],
  blue: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
    { row: 6, col: 7 },
  ],
  green: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
    { row: 7, col: 8 },
  ],
  red: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
    { row: 8, col: 7 },
  ],
};

/** The center finish square (all home columns lead here). */
export const CENTER: Cell = { row: 7, col: 7 };

/** The 6x6 base region (corner) for each color, plus the 4 hangar slot cells. */
export interface Base {
  color: Color;
  /** top-left corner of the 6x6 base region */
  origin: Cell;
  /** the 4 slots (grid coords, cell centers) where hangar planes rest */
  slots: Cell[];
}

export const BASES: Record<Color, Base> = {
  yellow: {
    color: 'yellow',
    origin: { row: 0, col: 0 },
    slots: [
      { row: 1, col: 1 },
      { row: 1, col: 3 },
      { row: 3, col: 1 },
      { row: 3, col: 3 },
    ],
  },
  blue: {
    color: 'blue',
    origin: { row: 0, col: 9 },
    slots: [
      { row: 1, col: 10 },
      { row: 1, col: 12 },
      { row: 3, col: 10 },
      { row: 3, col: 12 },
    ],
  },
  green: {
    color: 'green',
    origin: { row: 9, col: 9 },
    slots: [
      { row: 10, col: 10 },
      { row: 10, col: 12 },
      { row: 12, col: 10 },
      { row: 12, col: 12 },
    ],
  },
  red: {
    color: 'red',
    origin: { row: 9, col: 0 },
    slots: [
      { row: 10, col: 1 },
      { row: 10, col: 3 },
      { row: 12, col: 1 },
      { row: 12, col: 3 },
    ],
  },
};

// --- Path progression -------------------------------------------------------

/**
 * A plane's progress is a single integer `pos`:
 *   -1        -> in hangar (not launched)
 *   0..54     -> on the main loop (relative to the color's start)
 *   55..60    -> in the color's home column (home[0]..home[5])
 *   61        -> finished (reached the center)
 */
export const HANGAR = -1;
export const LOOP_MAX = 54; // last loop position (the home-entry tip)
export const HOME_START = 55; // pos of home[0]
export const FINISH = 61;

export function teamOf(color: Color): Team {
  return color === 'yellow' || color === 'green' ? 'YG' : 'RB';
}

export function colorsOfTeam(team: Team): Color[] {
  return team === 'YG' ? ['yellow', 'green'] : ['red', 'blue'];
}

/** Absolute loop index for a plane that is on the main loop, else null. */
export function absLoopIndex(color: Color, pos: number): number | null {
  if (pos < 0 || pos > LOOP_MAX) return null;
  return (START_INDEX[color] + pos) % LOOP_LEN;
}

/** Start squares are safe — planes there can't be captured. */
export const SAFE_LOOP_INDICES = new Set<number>([0, 14, 28, 42]);

/**
 * Relative loop position of each color's "flight" takeoff square. Landing
 * exactly here lets the plane fly forward (a shortcut). Relative to each color's
 * own start, so it is the same value for every color.
 */
export const FLIGHT_TAKEOFF_POS = 16;
export const FLIGHT_JUMP = 12; // squares flown
export const COLOR_JUMP = 4; // squares jumped when landing on your own color

/** Absolute loop index of a color's flight takeoff square. */
export function flightTakeoffIndex(color: Color): number {
  return (START_INDEX[color] + FLIGHT_TAKEOFF_POS) % LOOP_LEN;
}

/** Owner color of a flight takeoff square, or null if the square isn't one. */
export function flightOwnerOfSquare(loopIndex: number): Color | null {
  for (const c of COLORS) if (flightTakeoffIndex(c) === loopIndex) return c;
  return null;
}

/**
 * Which team (if any) can make a same-color jump from a loop square.
 * A plane jumps when it lands on a loop square whose relative position is a
 * positive multiple of 4. Relative multiples of 4 map to absolute residues:
 * yellow/green starts are at residue 0, red/blue at residue 2 — so residue-0
 * squares are YG jump squares and residue-2 squares are RB jump squares.
 */
export function jumpTeamOfSquare(loopIndex: number): Team | null {
  const r = ((loopIndex % 4) + 4) % 4;
  if (r === 0) return 'YG';
  if (r === 2) return 'RB';
  return null;
}

/**
 * Apply aeroplane-chess shortcuts to a landing position (relative pos).
 * At most one flight and one color-jump are applied (in either order), so the
 * result is always bounded and never loops.
 */
export function applyShortcuts(pos: number): number {
  let p = pos;
  let usedFlight = false;
  let usedJump = false;
  for (let i = 0; i < 4; i++) {
    if (p >= 1 && p <= LOOP_MAX && p === FLIGHT_TAKEOFF_POS && !usedFlight) {
      p += FLIGHT_JUMP;
      usedFlight = true;
      continue;
    }
    if (p >= 1 && p <= LOOP_MAX && p % 4 === 0 && !usedJump) {
      p += COLOR_JUMP;
      usedJump = true;
      continue;
    }
    break;
  }
  return p;
}

/** Grid cell a plane currently occupies (hangar planes use their slot). */
export function planeCell(color: Color, pos: number, slot: number): Cell {
  if (pos === HANGAR) return BASES[color].slots[slot];
  if (pos >= 0 && pos <= LOOP_MAX) return LOOP[absLoopIndex(color, pos)!];
  if (pos >= HOME_START && pos <= 60) return HOME[color][pos - HOME_START];
  return CENTER; // FINISH
}
