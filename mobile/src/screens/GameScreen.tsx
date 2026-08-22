import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Modal,
  SafeAreaView,
} from 'react-native';
import BoardView from '../components/BoardView';
import Die from '../components/Die';
import {
  initGame,
  roll,
  applyMove,
  GameState,
  planesOfTeam,
  teamLabel,
} from '../game/engine';
import { FINISH, Team } from '../game/board';
import { COLOR_HEX, TEAM_COLORS, UI } from '../theme';
import RulesModal from './RulesModal';

interface Props {
  onExit: () => void;
}

function TeamChips({ team, active }: { team: Team; active: boolean }) {
  return (
    <View style={[styles.chips, active && styles.chipsActive]}>
      {TEAM_COLORS[team].map((c) => (
        <View key={c} style={[styles.dot, { backgroundColor: COLOR_HEX[c] }]} />
      ))}
    </View>
  );
}

export default function GameScreen({ onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const [state, setState] = useState<GameState>(() => initGame());
  const [showRules, setShowRules] = useState(false);

  const boardSize = useMemo(() => {
    const raw = Math.min(width - 20, height * 0.56);
    return Math.floor(raw / 15) * 15;
  }, [width, height]);

  const highlightIds = useMemo(
    () => new Set(state.phase === 'move' ? state.legalMoves.map((m) => m.planeId) : []),
    [state],
  );

  const finished = (team: Team) => planesOfTeam(state, team).filter((p) => p.pos === FINISH).length;

  const onRoll = () => setState((s) => roll(s));
  const onSelectPlane = (id: string) => setState((s) => applyMove(s, id));
  const onNewGame = () => setState(initGame());

  const canRoll = state.phase === 'roll' && !state.winner;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onExit} hitSlop={10} style={styles.iconBtn}>
          <Text style={styles.iconText}>‹ Menu</Text>
        </Pressable>
        <Text style={styles.title}>Flying Chess</Text>
        <Pressable onPress={() => setShowRules(true)} hitSlop={10} style={styles.iconBtn}>
          <Text style={styles.iconText}>Rules</Text>
        </Pressable>
      </View>

      {/* Scoreboard */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreCell}>
          <TeamChips team="YG" active={state.currentTeam === 'YG'} />
          <Text style={styles.scoreText}>{finished('YG')}/8 home</Text>
        </View>
        <Text style={styles.vs}>vs</Text>
        <View style={styles.scoreCell}>
          <TeamChips team="RB" active={state.currentTeam === 'RB'} />
          <Text style={styles.scoreText}>{finished('RB')}/8 home</Text>
        </View>
      </View>

      {/* Board */}
      <View style={styles.boardWrap}>
        <BoardView state={state} size={boardSize} highlightIds={highlightIds} onSelectPlane={onSelectPlane} />
      </View>

      {/* Message */}
      <Text style={styles.message} numberOfLines={2}>
        {state.message}
      </Text>

      {/* Controls */}
      <View style={styles.controls}>
        <Die value={state.die} size={54} />
        <Pressable
          onPress={onRoll}
          disabled={!canRoll}
          style={[styles.rollBtn, !canRoll && styles.rollBtnDisabled]}
        >
          <Text style={styles.rollText}>{state.phase === 'move' ? 'TAP A PLANE' : 'ROLL'}</Text>
        </Pressable>
      </View>

      {/* Win overlay */}
      <Modal transparent visible={!!state.winner} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.winCard}>
            <Text style={styles.winEmoji}>🎉</Text>
            <Text style={styles.winTitle}>{state.winner ? teamLabel(state.winner) : ''}</Text>
            <Text style={styles.winSub}>wins the game!</Text>
            <Pressable onPress={onNewGame} style={[styles.rollBtn, styles.winBtn]}>
              <Text style={styles.rollText}>PLAY AGAIN</Text>
            </Pressable>
            <Pressable onPress={onExit} style={styles.linkBtn}>
              <Text style={styles.linkText}>Back to menu</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <RulesModal visible={showRules} onClose={() => setShowRules(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: UI.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  title: { color: UI.text, fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  iconBtn: { paddingVertical: 4, paddingHorizontal: 6, minWidth: 56 },
  iconText: { color: UI.subtext, fontSize: 14, fontWeight: '600' },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 6,
  },
  scoreCell: { alignItems: 'center', gap: 4 },
  scoreText: { color: UI.subtext, fontSize: 12, fontWeight: '600' },
  vs: { color: UI.subtext, fontSize: 12 },
  chips: {
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipsActive: { borderColor: UI.accent, backgroundColor: 'rgba(242,183,5,0.12)' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#0006' },
  boardWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  message: {
    color: UI.text,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 20,
    minHeight: 40,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 'auto',
    paddingBottom: 8,
  },
  rollBtn: {
    backgroundColor: UI.accent,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  rollBtnDisabled: { backgroundColor: '#3A455C' },
  rollText: { color: '#1A1200', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  overlay: { flex: 1, backgroundColor: '#000A', alignItems: 'center', justifyContent: 'center', padding: 24 },
  winCard: {
    backgroundColor: UI.panel,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI.panelBorder,
    width: '100%',
    maxWidth: 360,
  },
  winEmoji: { fontSize: 56 },
  winTitle: { color: UI.text, fontSize: 26, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  winSub: { color: UI.subtext, fontSize: 16, marginBottom: 20 },
  winBtn: { marginTop: 4 },
  linkBtn: { marginTop: 14 },
  linkText: { color: UI.subtext, fontSize: 14, textDecorationLine: 'underline' },
});
