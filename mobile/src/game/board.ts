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

/**
 * The 48 main-loop squares, clockwise. Index 0 is the top tip (blue's home
 * entry). Coordinates are the actual centers of the landing circles in
 * board.png (detected from the image), so a token placed here sits exactly on
 * its circle — the circles are not centered in their grid cells.
 */
const LOOP_XY: [number, number][] = [
  [0.49902, 0.0579], [0.55776, 0.05776], [0.6166, 0.05776], [0.68382, 0.0809], [0.70476, 0.14588],
  [0.70489, 0.20489], [0.68867, 0.27181], [0.79315, 0.29315], [0.85217, 0.29328], [0.91895, 0.31576],
  [0.94029, 0.38145], [0.94027, 0.44027], [0.94015, 0.49902], [0.94027, 0.55778], [0.94029, 0.6166],
  [0.91895, 0.68372], [0.85217, 0.70476], [0.79315, 0.70489], [0.72793, 0.68859], [0.70489, 0.79315],
  [0.70476, 0.85217], [0.68372, 0.91895], [0.6166, 0.94029], [0.55776, 0.94029], [0.49902, 0.94015],
  [0.44027, 0.94027], [0.38145, 0.94029], [0.31576, 0.91895], [0.29328, 0.85217], [0.29315, 0.79315],
  [0.31024, 0.72699], [0.20489, 0.70489], [0.14588, 0.70476], [0.0809, 0.68382], [0.05776, 0.6166],
  [0.05778, 0.55778], [0.0579, 0.49902], [0.05778, 0.44027], [0.05776, 0.38145], [0.08097, 0.31584],
  [0.14588, 0.29328], [0.20489, 0.29315], [0.27242, 0.3104], [0.29315, 0.20489], [0.29328, 0.14588],
  [0.31584, 0.08097], [0.38145, 0.05776], [0.44027, 0.05778],
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
// Runway circle centers, detected from board.png (entry -> center order).
const HOME_XY: Record<Color, [number, number][]> = {
  blue: [[0.49902, 0.12329], [0.49902, 0.18685], [0.49902, 0.25225], [0.49902, 0.31576], [0.49902, 0.38151], [0.49902, 0.44661]],
  red: [[0.49902, 0.87476], [0.49902, 0.8112], [0.49877, 0.74849], [0.49902, 0.68229], [0.49902, 0.61654], [0.49902, 0.55143]],
  yellow: [[0.12329, 0.49902], [0.18685, 0.49902], [0.25099, 0.49898], [0.31576, 0.49902], [0.38151, 0.49902], [0.44661, 0.49902]],
  green: [[0.87476, 0.49902], [0.8112, 0.49902], [0.74711, 0.49912], [0.68229, 0.49902], [0.61654, 0.49902], [0.55143, 0.49902]],
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
 * The flight ("fly") shortcut. Each color's dashed line on board.png connects the
 * square at relative position 6 (takeoff, near its own base) to the square at
 * relative position 38 (landing, near its home stretch) — the same offsets for
 * every color by the board's symmetry. Landing exactly on the takeoff square
 * flies the plane the whole way across (+32).
 */
export const FLIGHT_TAKEOFF_REL = 6;
export const FLIGHT_LANDING_REL = 38;

export type ShortcutKind = 'none' | 'jump' | 'flight';

/**
 * Resolve board shortcuts for a move that ends on relative loop position `rel`:
 *   - landing on the flight takeoff square flies to the landing square;
 *   - otherwise landing on one of your color's squares jumps to the next one.
 * At most one shortcut is applied, so the result is always bounded.
 */
export function applyShortcut(rel: number): { to: number; kind: ShortcutKind } {
  if (rel === FLIGHT_TAKEOFF_REL) return { to: FLIGHT_LANDING_REL, kind: 'flight' };
  if (OWN_SET.has(rel)) {
    for (const o of OWN_COLOR_RELS) {
      if (o > rel && o < LOOP_MAX) return { to: o, kind: 'jump' };
    }
  }
  return { to: rel, kind: 'none' };
}

/** Normalized point a plane currently occupies (hangar planes use their slot). */
export function planePoint(color: Color, pos: number, slot: number): Point {
  if (pos === HANGAR) return HANGAR_SLOTS[color][slot];
  if (pos >= 0 && pos <= LOOP_MAX) return LOOP[absLoopIndex(color, pos)!];
  if (pos >= HOME_START && pos <= 52) return HOME[color][pos - HOME_START];
  return CENTER; // FINISH
}
