import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GrowthScreen } from './src/screens/GrowthScreen';
import { LedgerScreen } from './src/screens/LedgerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { StoreProvider, useStore } from './src/store';
import { C } from './src/theme';

type Tab = 'ledger' | 'stats' | 'growth' | 'settings';

const TABS: { key: Tab; label: string; icon: string; title: string }[] = [
  { key: 'ledger', label: '帳本', icon: '📒', title: '帳本' },
  { key: 'stats', label: '統計', icon: '📊', title: '分類統計' },
  { key: 'growth', label: '資產', icon: '📈', title: '資產成長' },
  { key: 'settings', label: '設定', icon: '⚙️', title: '設定' },
];

function Main() {
  const { loaded } = useStore();
  const [tab, setTab] = useState<Tab>('ledger');
  const current = TABS.find((t) => t.key === tab)!;

  return (
    <SafeAreaView style={st.root} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={st.header}>
        <Text style={st.title}>{current.title}</Text>
      </View>
      <View style={{ flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
        {!loaded ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : tab === 'ledger' ? (
          <LedgerScreen />
        ) : tab === 'stats' ? (
          <StatsScreen />
        ) : tab === 'growth' ? (
          <GrowthScreen />
        ) : (
          <SettingsScreen />
        )}
      </View>
      <View style={st.tabbar}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable key={t.key} style={st.tab} onPress={() => setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <Text style={[st.tabIcon, { opacity: active ? 1 : 0.45 }]}>{t.icon}</Text>
              <Text style={[st.tabLabel, active && { color: C.primary, fontWeight: '700' }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: C.text },
  tabbar: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: C.sub, marginTop: 2 },
});
