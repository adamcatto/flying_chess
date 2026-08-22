import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  LOOP,
  GRID,
  HOME,
  BASES,
  CENTER,
  COLORS,
  START_INDEX,
  SAFE_LOOP_INDICES,
  flightOwnerOfSquare,
  jumpTeamOfSquare,
  planeCell,
  Color,
} from '../game/board';
import { GameState, Plane } from '../game/engine';
import { COLOR_HEX, COLOR_TINT, ON_COLOR, UI } from '../theme';

interface Props {
  state: GameState;
  size: number;
  highlightIds: Set<string>;
  onSelectPlane: (id: string) => void;
}

const START_OWNER: Record<number, Color> = (() => {
  const m: Record<number, Color> = {};
  for (const c of COLORS) m[START_INDEX[c]] = c;
  return m;
})();

const TEAM_JUMP_TINT = { YG: '#E4F5CF', RB: '#F8D5D5' } as const;

function box(row: number, col: number, cell: number) {
  return {
    position: 'absolute' as const,
    left: col * cell,
    top: row * cell,
    width: cell,
    height: cell,
  };
}

export default function BoardView({ state, size, highlightIds, onSelectPlane }: Props) {
  const cell = size / GRID;

  // --- bases (corner regions) ---
  const bases = COLORS.map((color) => {
    const b = BASES[color];
    const s = cell * 6;
    return (
      <View
        key={`base-${color}`}
        style={{
          position: 'absolute',
          left: b.origin.col * cell,
          top: b.origin.row * cell,
          width: s,
          height: s,
          backgroundColor: COLOR_HEX[color],
          borderRadius: cell * 0.6,
          padding: cell * 0.5,
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: cell * 0.4, opacity: 0.9 }} />
      </View>
    );
  });

  // --- home columns ---
  const homeCells: React.ReactNode[] = [];
  for (const color of COLORS) {
    HOME[color].forEach((c, i) => {
      homeCells.push(
        <View
          key={`home-${color}-${i}`}
          style={[
            box(c.row, c.col, cell),
            styles.trackCell,
            { backgroundColor: COLOR_HEX[color], borderColor: '#FFFFFF' },
          ]}
        />,
      );
    });
  }

  // --- center finish ---
  const center = (
    <View style={[box(CENTER.row, CENTER.col, cell), styles.center]}>
      <Text style={{ fontSize: cell * 0.6 }}>★</Text>
    </View>
  );

  // --- main loop track ---
  const track = LOOP.map((c, i) => {
    const startOwner = START_OWNER[i];
    const flightOwner = flightOwnerOfSquare(i);
    const jumpTeam = jumpTeamOfSquare(i);
    let bg = '#FFFFFF';
    if (startOwner) bg = COLOR_HEX[startOwner];
    else if (flightOwner) bg = COLOR_TINT[flightOwner];
    else if (jumpTeam) bg = TEAM_JUMP_TINT[jumpTeam];
    const isSafe = SAFE_LOOP_INDICES.has(i);
    return (
      <View key={`loop-${i}`} style={[box(c.row, c.col, cell), styles.trackCell, { backgroundColor: bg }]}>
        {flightOwner && <Text style={{ fontSize: cell * 0.5, color: COLOR_HEX[flightOwner] }}>✈</Text>}
        {isSafe && !flightOwner && <Text style={{ fontSize: cell * 0.45, color: ON_COLOR[startOwner!] }}>✦</Text>}
      </View>
    );
  });

  // --- planes (grouped by cell so stacks fan out) ---
  const groups = new Map<string, Plane[]>();
  for (const p of state.planes) {
    const c = planeCell(p.color, p.pos, p.slot);
    const key = `${c.row},${c.col}`;
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }

  const planeNodes: React.ReactNode[] = [];
  groups.forEach((arr, key) => {
    const [row, col] = key.split(',').map(Number);
    const n = arr.length;
    const single = n === 1;
    const tokenSize = single ? cell * 0.74 : cell * 0.52;
    // offsets (fraction of cell) for up to 4 tokens
    const offsets: [number, number][] = single
      ? [[0, 0]]
      : [
          [-0.2, -0.2],
          [0.2, -0.2],
          [-0.2, 0.2],
          [0.2, 0.2],
        ];
    arr.forEach((p, j) => {
      const [ox, oy] = offsets[Math.min(j, 3)];
      const cx = col * cell + cell / 2 + ox * cell;
      const cy = row * cell + cell / 2 + oy * cell;
      const highlighted = highlightIds.has(p.id);
      planeNodes.push(
        <Pressable
          key={`plane-${p.id}`}
          disabled={!highlighted}
          onPress={() => onSelectPlane(p.id)}
          style={{
            position: 'absolute',
            left: cx - tokenSize / 2,
            top: cy - tokenSize / 2,
            width: tokenSize,
            height: tokenSize,
            borderRadius: tokenSize / 2,
            backgroundColor: COLOR_HEX[p.color],
            borderWidth: highlighted ? Math.max(2, cell * 0.12) : 2,
            borderColor: highlighted ? '#FFD400' : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: highlighted ? 20 : 10,
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: highlighted ? 6 : 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: highlighted ? 8 : 3,
          }}
        >
          <Text style={{ fontSize: tokenSize * 0.5, color: ON_COLOR[p.color], fontWeight: '900' }}>✈</Text>
        </Pressable>,
      );
    });
    if (n > 4) {
      planeNodes.push(
        <View
          key={`count-${key}`}
          style={{
            position: 'absolute',
            left: col * cell + cell * 0.55,
            top: row * cell + cell * 0.05,
            minWidth: cell * 0.4,
            height: cell * 0.4,
            paddingHorizontal: 2,
            borderRadius: cell * 0.2,
            backgroundColor: '#111',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
          }}
        >
          <Text style={{ color: '#fff', fontSize: cell * 0.26, fontWeight: '800' }}>{n}</Text>
        </View>,
      );
    }
  });

  return (
    <View style={{ width: size, height: size, backgroundColor: UI.boardBg, borderRadius: cell * 0.4, overflow: 'hidden' }}>
      {bases}
      {track}
      {homeCells}
      {center}
      {planeNodes}
    </View>
  );
}

const styles = StyleSheet.create({
  trackCell: {
    borderWidth: 1,
    borderColor: UI.boardLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    backgroundColor: '#FFE7A3',
    borderWidth: 1,
    borderColor: UI.boardLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
