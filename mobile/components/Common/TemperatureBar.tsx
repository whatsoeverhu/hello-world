import { View, Text, StyleSheet } from 'react-native';

interface Props {
  min: number;
  max: number;
  compact?: boolean;
}

const TOTAL_RANGE = 50; // -10 to 40
const OFFSET = 10;

// Temp color: cold=blue, warm=orange, hot=red
function tempColor(t: number): string {
  if (t <= 5) return '#3b82f6';
  if (t <= 15) return '#06b6d4';
  if (t <= 22) return '#84cc16';
  if (t <= 28) return '#eab308';
  if (t <= 35) return '#f97316';
  return '#ef4444';
}

export function TemperatureBar({ min, max, compact = false }: Props) {
  const leftPct = Math.max(0, Math.min(100, ((min + OFFSET) / TOTAL_RANGE) * 100));
  const widthPct = Math.max(0, Math.min(100, ((max + OFFSET) / TOTAL_RANGE) * 100) - leftPct);
  const label = (t: number) => `${t > 0 ? '+' : ''}${t}°`;
  const midTemp = (min + max) / 2;
  const fillColor = tempColor(midTemp);

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <View style={styles.trackBg}>
          <View style={[styles.fill, { marginLeft: `${leftPct}%` as any, width: `${widthPct}%` as any, backgroundColor: fillColor }]} />
        </View>
        <Text style={styles.compactLabel}>{label(min)}~{label(max)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.label}>{label(min)}</Text>
        <Text style={styles.label}>{label(max)}</Text>
      </View>
      <View style={styles.trackBg}>
        <View style={[styles.fill, { marginLeft: `${leftPct}%` as any, width: `${widthPct}%` as any, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 11, color: '#9d8860' },
  trackBg: {
    height: 6,
    backgroundColor: '#ede4d3',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#f59e0b', // fallback; gradient below
    borderRadius: 3,
  },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compactLabel: { fontSize: 10, color: '#9d8860', flexShrink: 0 },
});
