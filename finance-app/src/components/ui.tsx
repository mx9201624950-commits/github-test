import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { C } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.section}>{children}</Text>
      {right}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
}) {
  const bg = variant === 'primary' ? C.primary : variant === 'danger' ? '#FEE2E2' : '#EEF2F7';
  const fg = variant === 'primary' ? '#fff' : variant === 'danger' ? C.danger : C.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }, style]}
      accessibilityRole="button"
    >
      <Text style={[s.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor="#94A3B8" {...props} style={[s.input, props.style]} />
    </View>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; color?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.seg}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[s.segItem, active && { backgroundColor: o.color ?? C.primary }]}
          >
            <Text style={[s.segText, active && { color: '#fff' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MonthSwitcher({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  return (
    <View style={s.month}>
      <Pressable onPress={onPrev} hitSlop={12} style={s.arrow}>
        <Text style={s.arrowText}>‹</Text>
      </Pressable>
      <Text style={s.monthText}>{label}</Text>
      <Pressable onPress={onNext} hitSlop={12} style={s.arrow}>
        <Text style={s.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return <Text style={s.empty}>{text}</Text>;
}

export const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 14, padding: 16, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  section: { fontSize: 15, fontWeight: '700', color: C.text },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 13, color: C.sub, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: C.text,
    backgroundColor: '#fff',
  },
  seg: { flexDirection: 'row', backgroundColor: '#EEF2F7', borderRadius: 10, padding: 3, marginBottom: 12 },
  segItem: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segText: { fontSize: 15, fontWeight: '600', color: C.sub },
  month: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  arrow: { paddingHorizontal: 16, paddingVertical: 4 },
  arrowText: { fontSize: 26, color: C.primary, fontWeight: '600' },
  monthText: { fontSize: 17, fontWeight: '700', color: C.text, minWidth: 120, textAlign: 'center' },
  empty: { color: C.sub, textAlign: 'center', paddingVertical: 24 },
});
