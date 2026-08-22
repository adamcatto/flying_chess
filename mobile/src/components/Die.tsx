import React from 'react';
import { View, StyleSheet } from 'react-native';

/** Standard pip layout per die face. */
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

interface Props {
  value: number | null;
  size?: number;
}

export default function Die({ value, size = 56 }: Props) {
  const pad = size * 0.16;
  const pip = size * 0.16;
  const cellStep = (size - pad * 2 - pip) / 2;
  const pips = value && PIPS[value] ? PIPS[value] : [];
  return (
    <View style={[styles.die, { width: size, height: size, borderRadius: size * 0.18 }]}>
      {value == null ? (
        <View style={[styles.empty, { width: pip, height: pip }]} />
      ) : (
        pips.map(([r, c], i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: pip,
              height: pip,
              borderRadius: pip / 2,
              backgroundColor: '#17223A',
              top: pad + r * cellStep,
              left: pad + c * cellStep,
            }}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  die: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D3D8E0',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  empty: {
    borderRadius: 99,
    backgroundColor: '#D3D8E0',
  },
});
