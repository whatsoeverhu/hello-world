import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from '../../utils/colors';

interface Props {
  onAdd: () => void;
  categoryName?: string;
}

export function EmptyState({ onAdd, categoryName }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>👔</Text>
      </View>
      <Text style={styles.title}>
        {categoryName ? `「${categoryName}」还没有衣物` : '衣柜空空如也'}
      </Text>
      <Text style={styles.subtitle}>
        把你的宝贝衣物添加进来，{'\n'}开始整理你的专属数字衣柜吧
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onAdd} activeOpacity={0.8}>
        <Text style={styles.btnText}>+ 添加第一件衣物</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: C.bgMuted,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  icon: { fontSize: 44 },
  title: { fontSize: 17, fontWeight: '600', color: C.brown, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn: {
    backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
