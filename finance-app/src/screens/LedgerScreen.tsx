import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { groupByDay, monthTotals, signed, txInMonth } from '../calc';
import { TransactionEditor } from '../components/TransactionEditor';
import { Card, Empty, MonthSwitcher } from '../components/ui';
import { currentMonth, dayLabel, formatTWD, monthLabel, shiftMonth } from '../format';
import { useStore } from '../store';
import { C } from '../theme';
import { Transaction } from '../types';

export function LedgerScreen() {
  const { data } = useStore();
  const [month, setMonth] = useState(currentMonth());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const totals = monthTotals(data, month);
  const groups = useMemo(() => groupByDay(txInMonth(data, month)), [data, month]);
  const budget = data.monthlyBudget;
  const budgetRatio = budget > 0 ? totals.expense / budget : 0;

  const open = (t: Transaction | null) => {
    setEditing(t);
    setEditorOpen(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.date}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <MonthSwitcher label={monthLabel(month)} onPrev={() => setMonth(shiftMonth(month, -1))} onNext={() => setMonth(shiftMonth(month, 1))} />
            <Card>
              <View style={st.sumRow}>
                <View style={st.sumCol}>
                  <Text style={st.sumLabel}>收入</Text>
                  <Text style={[st.sumVal, { color: C.income }]}>{formatTWD(totals.income)}</Text>
                </View>
                <View style={st.sumCol}>
                  <Text style={st.sumLabel}>支出</Text>
                  <Text style={[st.sumVal, { color: C.expense }]}>{formatTWD(totals.expense)}</Text>
                </View>
                <View style={st.sumCol}>
                  <Text style={st.sumLabel}>結餘</Text>
                  <Text style={[st.sumVal, { color: totals.net >= 0 ? C.text : C.expense }]}>{formatTWD(totals.net)}</Text>
                </View>
              </View>
              {budget > 0 && (
                <View style={{ marginTop: 14 }}>
                  <View style={st.budgetTrack}>
                    <View
                      style={[
                        st.budgetFill,
                        { width: `${Math.min(100, budgetRatio * 100)}%`, backgroundColor: budgetRatio > 1 ? C.expense : budgetRatio > 0.8 ? '#F59E0B' : C.primary },
                      ]}
                    />
                  </View>
                  <Text style={st.budgetText}>
                    預算 {formatTWD(budget)}・
                    {budgetRatio > 1 ? `已超支 ${formatTWD(totals.expense - budget)}` : `剩餘 ${formatTWD(budget - totals.expense)}`}
                  </Text>
                </View>
              )}
            </Card>
          </>
        }
        ListEmptyComponent={<Empty text="這個月還沒有紀錄，按右下角「＋」記第一筆吧！" />}
        renderItem={({ item: g }) => (
          <Card style={{ paddingVertical: 8 }}>
            <View style={st.dayHead}>
              <Text style={st.dayLabel}>{dayLabel(g.date)}</Text>
              <Text style={st.dayNet}>{formatTWD(g.net)}</Text>
            </View>
            {g.items.map((t) => {
              const c = data.categories.find((x) => x.id === t.categoryId);
              const a = data.accounts.find((x) => x.id === t.accountId);
              return (
                <Pressable key={t.id} onPress={() => open(t)} style={({ pressed }) => [st.row, pressed && { opacity: 0.6 }]}>
                  <View style={[st.icon, { backgroundColor: `${c?.color ?? '#94A3B8'}22` }]}>
                    <Text style={{ fontSize: 18 }}>{c?.icon ?? '❔'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.rowTitle}>{c?.name ?? '（已刪除分類）'}</Text>
                    <Text style={st.rowSub} numberOfLines={1}>
                      {a?.name ?? '（已刪除帳戶）'}
                      {t.note ? `・${t.note}` : ''}
                    </Text>
                  </View>
                  <Text style={[st.rowAmt, { color: t.type === 'income' ? C.income : C.expense }]}>{formatTWD(signed(t))}</Text>
                </Pressable>
              );
            })}
          </Card>
        )}
      />
      <Pressable style={({ pressed }) => [st.fab, pressed && { opacity: 0.8 }]} onPress={() => open(null)} accessibilityLabel="記一筆">
        <Text style={st.fabText}>＋</Text>
      </Pressable>
      <TransactionEditor visible={editorOpen} editing={editing} onClose={() => setEditorOpen(false)} />
    </View>
  );
}

const st = StyleSheet.create({
  sumRow: { flexDirection: 'row' },
  sumCol: { flex: 1, alignItems: 'center' },
  sumLabel: { fontSize: 12, color: C.sub, marginBottom: 4 },
  sumVal: { fontSize: 16, fontWeight: '700' },
  budgetTrack: { height: 8, backgroundColor: '#EEF2F7', borderRadius: 4, overflow: 'hidden' },
  budgetFill: { height: 8, borderRadius: 4 },
  budgetText: { fontSize: 12, color: C.sub, marginTop: 6 },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  dayLabel: { fontSize: 13, color: C.sub, fontWeight: '600' },
  dayNet: { fontSize: 13, color: C.sub },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, color: C.text, fontWeight: '600' },
  rowSub: { fontSize: 12, color: C.sub, marginTop: 2 },
  rowAmt: { fontSize: 16, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 34, fontWeight: '500' },
});
