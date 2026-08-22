import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { UI } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const RULES: { h: string; b: string }[] = [
  { h: 'Teams', b: 'Yellow + Green play as one team; Red + Blue play as the other. Pass the phone between the two players each turn. The two colors on a team share the win.' },
  { h: 'Your turn', b: 'Each turn you get 2 rolls. Tap ROLL, then tap one of the highlighted planes (either of your team’s colors) to move it.' },
  { h: 'Taking off', b: 'A plane leaves the hangar only when you roll a 6. Rolling a 6 also earns you an extra roll on top of your 2.' },
  { h: 'Same-color jump', b: 'Land on a square of your own color and your plane leaps forward to the next square of your color.' },
  { h: 'Capturing', b: 'Land on a square holding an enemy plane and it is sent all the way back to its hangar. Teammates can safely share a square, and each color’s start square is safe for everyone.' },
  { h: 'Going home', b: 'After a full lap a plane turns up its colored runway to the center. You must land on the center exactly — overshooting bounces back.' },
  { h: 'Winning', b: 'The first team to get all 8 of its planes to the center wins. Three 6s in a row forfeits your turn and sends that plane back!' },
];

export default function RulesModal({ visible, onClose }: Props) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>How to play</Text>
          <ScrollView style={{ marginVertical: 8 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {RULES.map((r) => (
              <View key={r.h} style={{ marginBottom: 12 }}>
                <Text style={styles.h}>{r.h}</Text>
                <Text style={styles.b}>{r.b}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable onPress={onClose} style={styles.btn}>
            <Text style={styles.btnText}>GOT IT</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000B', justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: UI.panel,
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: UI.panelBorder,
  },
  title: { color: UI.text, fontSize: 22, fontWeight: '900' },
  h: { color: UI.accent, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  b: { color: UI.subtext, fontSize: 14, lineHeight: 20 },
  btn: { backgroundColor: UI.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#1A1200', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
