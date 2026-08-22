import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { COLOR_HEX, UI } from '../theme';
import RulesModal from './RulesModal';

interface Props {
  onStart: () => void;
}

function TeamCard({ label, colors }: { label: string; colors: (keyof typeof COLOR_HEX)[] }) {
  return (
    <View style={styles.teamCard}>
      <View style={styles.teamDots}>
        {colors.map((c) => (
          <View key={c} style={[styles.dot, { backgroundColor: COLOR_HEX[c] }]} />
        ))}
      </View>
      <Text style={styles.teamLabel}>{label}</Text>
    </View>
  );
}

export default function StartScreen({ onStart }: Props) {
  const [showRules, setShowRules] = useState(false);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.plane}>✈️</Text>
        <Text style={styles.title}>Flying Chess</Text>
        <Text style={styles.subtitle}>Aeroplane chess · 2-player team mode · pass & play</Text>

        <View style={styles.teams}>
          <TeamCard label="Team 1" colors={['yellow', 'green']} />
          <Text style={styles.vs}>VS</Text>
          <TeamCard label="Team 2" colors={['red', 'blue']} />
        </View>

        <Text style={styles.blurb}>
          Two players share one phone. Team 1 controls Yellow &amp; Green, Team 2 controls Red &amp; Blue.
          Get all your planes home to win.
        </Text>

        <Pressable onPress={onStart} style={styles.startBtn}>
          <Text style={styles.startText}>START GAME</Text>
        </Pressable>
        <Pressable onPress={() => setShowRules(true)} style={styles.rulesBtn}>
          <Text style={styles.rulesText}>How to play</Text>
        </Pressable>
      </View>
      <RulesModal visible={showRules} onClose={() => setShowRules(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  plane: { fontSize: 64, marginBottom: 4 },
  title: { color: UI.text, fontSize: 40, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: UI.subtext, fontSize: 14, marginTop: 6, textAlign: 'center' },
  teams: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 36 },
  teamCard: {
    backgroundColor: UI.panel,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI.panelBorder,
  },
  teamDots: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#0006' },
  teamLabel: { color: UI.text, fontWeight: '800', fontSize: 15 },
  vs: { color: UI.subtext, fontWeight: '900', fontSize: 16 },
  blurb: { color: UI.subtext, textAlign: 'center', fontSize: 14, lineHeight: 20, marginTop: 30 },
  startBtn: {
    backgroundColor: UI.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 56,
    marginTop: 40,
  },
  startText: { color: '#1A1200', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  rulesBtn: { marginTop: 18 },
  rulesText: { color: UI.subtext, fontSize: 15, textDecorationLine: 'underline' },
});
