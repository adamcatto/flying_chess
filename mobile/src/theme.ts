import { Color, Team } from './game/board';

/** Solid brand color per plane color. */
export const COLOR_HEX: Record<Color, string> = {
  yellow: '#F2B705',
  blue: '#2E6FEF',
  green: '#2FA84F',
  red: '#E23B3B',
};

/** Softer tint used for bases, home columns and jump squares. */
export const COLOR_TINT: Record<Color, string> = {
  yellow: '#FBE9A6',
  blue: '#BFD3FB',
  green: '#BEE6C8',
  red: '#F6C3C3',
};

/** A readable text color to sit on top of the solid brand color. */
export const ON_COLOR: Record<Color, string> = {
  yellow: '#3A2E00',
  blue: '#FFFFFF',
  green: '#FFFFFF',
  red: '#FFFFFF',
};

export const TEAM_COLORS: Record<Team, Color[]> = {
  YG: ['yellow', 'green'],
  RB: ['red', 'blue'],
};

export const UI = {
  bg: '#0E1726',
  panel: '#17223A',
  panelBorder: '#2A3960',
  boardBg: '#FFFFFF',
  boardLine: '#C7CDD6',
  text: '#EAF0FB',
  subtext: '#9FB0CC',
  accent: '#F2B705',
  danger: '#E23B3B',
};
