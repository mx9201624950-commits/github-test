import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { categoryBreakdown, monthTotals } from '../calc';
import { Donut } from '../components/Charts';
import { Card, Empty, MonthSwitcher, Segmented } from '../components/ui';
import { compactTWD, currentMonth, formatTWD, monthLabel, shiftMonth } from '../format';
import { useStore } from '../store';
import { C } from '../theme';
import { TxType } from '../types';

export function StatsScreen() {
  const { data } = useStore();
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState<TxType>('expense');

  const slices = categoryBreakdown(data, month, type);
  const totals = monthTotals(data, month);
  const total = type === 'expense' ? totals.expense : totals.income;
  const prev = monthTotals(data, shiftMonth(month, -1));
  const prevTotal = type === 'expense' ? prev.expense : prev.income;
  const diff = total - prevTotal;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <MonthSwitcher label={monthLabel(month)} onPrev={() => setMonth(shiftMonth(month, -1))} onNext={() => setMonth(shiftMonth(month, 1))} />
      <Segmented
        value={type}
        onChange={setType}
        options={[
          { value: 'expense', label: '支出', color: C.expense },
          { value: 'income', label: '收入', color: C.income },
        ]}
      />
      <Card>
        <Text style={st.totalLabel}>本月{type === 'expense' ? '支出' : '收入'}</Text>
        <Text style={[st.total, { color: type === 'expense' ? C.expense : C.income }]}>{formatTWD(total)}</Text>
        {prevTotal > 0 && (
          <Text style={st.compare}>
            比上個月{diff >= 0 ? '多' : '少'} {formatTWD(Math.abs(diff))}（{diff >= 0 ? '+' : '-'}
            {Math.round((Math.abs(diff) / prevTotal) * 100)}%）
          </Text>
        )}
      </Card>
      <Card>
        {slices.length === 0 ? (
          <Empty text="這個月沒有資料" />
        ) : (
          <>
            <Donut slices={slices} centerLabel={compactTWD(total)} />
            <View style={{ marginTop: 16 }}>
              {slices.map((sl) => (
                <View key={sl.categoryId} style={st.row}>
                  <Text style={{ fontSize: 18, width: 28 }}>{sl.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={st.rowTop}>
                      <Text style={st.name}>{sl.name}</Text>
                      <Text style={st.amt}>{formatTWD(sl.total)}</Text>
                    </View>
                    <View style={st.track}>
                      <View style={[st.fill, { width: `${sl.ratio * 100}%`, backgroundColor: sl.color }]} />
                    </View>
                  </View>
                  <Text style={st.pct}>{Math.round(sl.ratio * 100)}%</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Card>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  totalLabel: { fontSize: 13, color: C.sub },
  total: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  compare: { fontSize: 13, color: C.sub, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  name: { fontSize: 14, color: C.text, fontWeight: '600' },
  amt: { fontSize: 14, color: C.text },
  track: { height: 6, backgroundColor: '#EEF2F7', borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  pct: { width: 42, textAlign: 'right', fontSize: 13, color: C.sub },
});
