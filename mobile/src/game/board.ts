/**
 * Board geometry for Flying Chess, derived directly from images/board.png so the
 * in-app board matches that image exactly.
 *
 * All positions are normalized coordinates in [0,1] relative to the (square)
 * board image: {x, y} with x to the right, y downward. Multiply by the rendered
 * board size to get pixels.
 *
 * The board is a real aeroplane-chess board: a 48-cell octagonal main loop
 * (12 cells per quadrant, diagonally-cut corners), four colored home runways
 * (6 cells each) leading to the center, and four corner hangars (4 planes each).
 *
 * Color placement (from the image): yellow = top-left, blue = top-right,
 * green = bottom-right, red = bottom-left. Home runways: blue = top, red =
 * bottom, yellow = left, green = right.
 *
 * Teams (2-player mode): YG = yellow + green, RB = red + blue.
 */

export type Color = 'yellow' | 'blue' | 'green' | 'red';
export type Team = 'YG' | 'RB';

export interface Point {
  x: number;
  y: number;
}

export const COLORS: Color[] = ['yellow', 'blue', 'green', 'red'];

/** The 48 main-loop squares, clockwise. Index 0 is the top tip (blue's home entry). */
const LOOP_XY: [number, number][] = [
  [0.5, 0.03333], [0.56667, 0.03333], [0.63333, 0.03333], [0.7, 0.1], [0.7, 0.16667],
  [0.7, 0.23333], [0.7, 0.3], [0.76667, 0.3], [0.83333, 0.3], [0.9, 0.3],
  [0.96667, 0.36667], [0.96667, 0.43333], [0.96667, 0.5], [0.96667, 0.56667], [0.96667, 0.63333],
  [0.9, 0.7], [0.83333, 0.7], [0.76667, 0.7], [0.7, 0.7], [0.7, 0.76667],
  [0.7, 0.83333], [0.7, 0.9], [0.63333, 0.96667], [0.56667, 0.96667], [0.5, 0.96667],
  [0.43333, 0.96667], [0.36667, 0.96667], [0.3, 0.9], [0.3, 0.83333], [0.3, 0.76667],
  [0.3, 0.7], [0.23333, 0.7], [0.16667, 0.7], [0.1, 0.7], [0.03333, 0.63333],
  [0.03333, 0.56667], [0.03333, 0.5], [0.03333, 0.43333], [0.03333, 0.36667], [0.1, 0.3],
  [0.16667, 0.3], [0.23333, 0.3], [0.3, 0.3], [0.3, 0.23333], [0.3, 0.16667],
  [0.3, 0.1], [0.36667, 0.03333], [0.43333, 0.03333],
];

export const LOOP: Point[] = LOOP_XY.map(([x, y]) => ({ x, y }));
export const LOOP_LEN = LOOP.length; // 48

/** Where each color launches onto the loop (its start index). */
export const START_INDEX: Record<Color, number> = {
  yellow: 38,
  blue: 2,
  green: 14,
  red: 26,
};

/**
 * Colored home runways (6 cells), ordered from the loop entry inward toward the
 * center. blue = top, red = bottom, yellow = left, green = right.
 */
const HOME_XY: Record<Color, [number, number][]> = {
  blue: [[0.5, 0.1], [0.5, 0.16667], [0.5, 0.23333], [0.5, 0.3], [0.5, 0.36667], [0.5, 0.43333]],
  red: [[0.5, 0.9], [0.5, 0.83333], [0.5, 0.76667], [0.5, 0.7], [0.5, 0.63333], [0.5, 0.56667]],
  yellow: [[0.1, 0.5], [0.16667, 0.5], [0.23333, 0.5], [0.3, 0.5], [0.36667, 0.5], [0.43333, 0.5]],
  green: [[0.9, 0.5], [0.83333, 0.5], [0.76667, 0.5], [0.7, 0.5], [0.63333, 0.5], [0.56667, 0.5]],
};
export const HOME: Record<Color, Point[]> = {
  yellow: HOME_XY.yellow.map(([x, y]) => ({ x, y })),
  blue: HOME_XY.blue.map(([x, y]) => ({ x, y })),
  green: HOME_XY.green.map(([x, y]) => ({ x, y })),
  red: HOME_XY.red.map(([x, y]) => ({ x, y })),
};

/** The center finish square. */
export const CENTER: Point = { x: 0.5, y: 0.5 };

/** The 4 hangar slot positions per color (corner bases). */
const HANGAR_XY: Record<Color, [number, number][]> = {
  yellow: [[0.1, 0.1], [0.23333, 0.1], [0.1, 0.23333], [0.23333, 0.23333]],
  blue: [[0.76667, 0.1], [0.9, 0.1], [0.76667, 0.23333], [0.9, 0.23333]],
  green: [[0.76667, 0.76667], [0.9, 0.76667], [0.76667, 0.9], [0.9, 0.9]],
  red: [[0.1, 0.76667], [0.23333, 0.76667], [0.1, 0.9], [0.23333, 0.9]],
};
export const HANGAR_SLOTS: Record<Color, Point[]> = {
  yellow: HANGAR_XY.yellow.map(([x, y]) => ({ x, y })),
  blue: HANGAR_XY.blue.map(([x, y]) => ({ x, y })),
  green: HANGAR_XY.green.map(([x, y]) => ({ x, y })),
  red: HANGAR_XY.red.map(([x, y]) => ({ x, y })),
};

// --- Path progression -------------------------------------------------------

/**
 * A plane's progress is a single integer `pos`:
 *   -1        -> in hangar (not launched)
 *   0..46     -> on the main loop (relative to the color's start; 46 = the
 *                home-entry tip, i.e. START_INDEX - 2)
 *   47..52    -> in the color's home runway (home[0]..home[5])
 *   53        -> finished (reached the center)
 */
export const HANGAR = -1;
export const LOOP_MAX = 46; // last loop position (the home-entry tip)
export const HOME_START = 47; // pos of home[0]
export const FINISH = 53;

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

/** Start squares (where planes launch) are safe from capture. */
export const SAFE_LOOP_INDICES = new Set<number>(Object.values(START_INDEX));

/**
 * Relative loop positions that land on a square of the plane's own color (a
 * "jump" square). Same for every color by the board's 4-fold symmetry, and
 * read directly from board.png. The home-entry tip (46) is excluded.
 */
export const OWN_COLOR_RELS = [2, 9, 13, 17, 20, 24, 27, 31, 35, 42];
const OWN_SET = new Set(OWN_COLOR_RELS);

/**
 * Same-color jump: if a move ends on one of your color's squares, advance to the
 * next same-color square. Applied once (bounded), and never past the home entry.
 */
export function applyJump(rel: number): number {
  if (!OWN_SET.has(rel)) return rel;
  for (const o of OWN_COLOR_RELS) {
    if (o > rel && o < LOOP_MAX) return o;
  }
  return rel; // no further same-color square before home; stay put
}

/** Normalized point a plane currently occupies (hangar planes use their slot). */
export function planePoint(color: Color, pos: number, slot: number): Point {
  if (pos === HANGAR) return HANGAR_SLOTS[color][slot];
  if (pos >= 0 && pos <= LOOP_MAX) return LOOP[absLoopIndex(color, pos)!];
  if (pos >= HOME_START && pos <= 52) return HOME[color][pos - HOME_START];
  return CENTER; // FINISH
}
