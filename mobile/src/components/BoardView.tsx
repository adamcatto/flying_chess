import React from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet } from 'react-native';
import { planePoint, Point } from '../game/board';
import { GameState, Plane } from '../game/engine';
import { COLOR_HEX, ON_COLOR } from '../theme';

interface Props {
  state: GameState;
  size: number;
  highlightIds: Set<string>;
  onSelectPlane: (id: string) => void;
}

// The board image is images/board.png, cleaned of its baked-in hangar icons.
const BOARD_IMG = require('../../assets/board.png');

export default function BoardView({ state, size, highlightIds, onSelectPlane }: Props) {
  // Group planes by the board point they occupy so stacks fan out.
  const groups = new Map<string, Plane[]>();
  for (const p of state.planes) {
    const pt = planePoint(p.color, p.pos, p.slot);
    const key = `${pt.x.toFixed(4)},${pt.y.toFixed(4)}`;
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }

  // The landing circles in board.png are ~0.0396 of the board width in diameter.
  // Size a single token's diameter to match, so it sits just inside a circle.
  const CIRCLE_DIAM = 0.0396 * size;

  const nodes: React.ReactNode[] = [];
  groups.forEach((arr) => {
    const pt: Point = planePoint(arr[0].color, arr[0].pos, arr[0].slot);
    const n = arr.length;
    const single = n === 1;
    // `token` is the token radius. Single tokens match the circle; stacked
    // tokens shrink so a 2x2 cluster still fits around one circle.
    const token = single ? CIRCLE_DIAM * 0.5 : CIRCLE_DIAM * 0.4;
    const off = single
      ? [[0, 0]]
      : [
          [-0.22, -0.22],
          [0.22, -0.22],
          [-0.22, 0.22],
          [0.22, 0.22],
        ];
    arr.forEach((p, j) => {
      const [ox, oy] = off[Math.min(j, 3)];
      const cx = pt.x * size + ox * token * 2;
      const cy = pt.y * size + oy * token * 2;
      const highlighted = highlightIds.has(p.id);
      nodes.push(
        <Pressable
          key={p.id}
          disabled={!highlighted}
          onPress={() => onSelectPlane(p.id)}
          style={{
            position: 'absolute',
            left: cx - token,
            top: cy - token,
            width: token * 2,
            height: token * 2,
            borderRadius: token,
            backgroundColor: COLOR_HEX[p.color],
            borderWidth: highlighted ? Math.max(2, token * 0.28) : Math.max(1.5, token * 0.14),
            borderColor: highlighted ? '#FFD400' : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: highlighted ? 20 : 10,
            shadowColor: '#000',
            shadowOpacity: 0.4,
            shadowRadius: highlighted ? 5 : 2,
            shadowOffset: { width: 0, height: 1 },
            elevation: highlighted ? 8 : 3,
          }}
        >
          <Text style={{ fontSize: token * 1.1, color: ON_COLOR[p.color], fontWeight: '900' }}>✈</Text>
        </Pressable>,
      );
    });
    if (n > 4) {
      nodes.push(
        <View
          key={`count-${pt.x}-${pt.y}`}
          style={{
            position: 'absolute',
            left: pt.x * size + token,
            top: pt.y * size - token * 1.6,
            paddingHorizontal: 3,
            height: token * 1.3,
            minWidth: token * 1.3,
            borderRadius: token,
            backgroundColor: '#111',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
          }}
        >
          <Text style={{ color: '#fff', fontSize: token * 0.9, fontWeight: '800' }}>{n}</Text>
        </View>,
      );
    }
  });

  return (
    <ImageBackground
      source={BOARD_IMG}
      style={{ width: size, height: size }}
      imageStyle={{ borderRadius: size * 0.02 }}
      resizeMode="cover"
    >
      {nodes}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({});
