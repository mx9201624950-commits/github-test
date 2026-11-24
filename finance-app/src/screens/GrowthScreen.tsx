import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { accountBalance, growthSeries, netWorth } from '../calc';
import { GrowthLine, IncomeExpenseBars } from '../components/Charts';
import { Card, Segmented, SectionTitle } from '../components/ui';
import { currentMonth, formatTWD, shiftMonth } from '../format';
import { useStore } from '../store';
import { C } from '../theme';

type Range = '6' | '12';

export function GrowthScreen() {
  const { data } = useStore();
  const { width } = useWindowDimensions();
  const [range, setRange] = useState<Range>('6');
  const chartW = Math.min(width, 600) - 32 - 32;

  const series = growthSeries(data, currentMonth(), Number(range));
  const now = netWorth(data);
  // 以區間開始前一個月的月底為基準，才是完整 N 個月的變化
  const base = netWorth(data, `${shiftMonth(series[0].month, -1)}-31`);
  const change = series[series.length - 1].netWorth - base;
  const months = series.filter((p) => p.income > 0);
  const savingRate =
    months.length > 0
      ? months.reduce((s, p) => s + (p.income - p.expense), 0) / months.reduce((s, p) => s + p.income, 0)
      : null;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Card>
        <Text style={st.label}>目前總資產</Text>
        <Text style={[st.big, { color: now >= 0 ? C.text : C.expense }]}>{formatTWD(now)}</Text>
        <View style={st.kpis}>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>近 {range} 個月成長</Text>
            <Text style={[st.kpi, { color: change >= 0 ? C.income : C.expense }]}>
              {change >= 0 ? '+' : ''}
              {formatTWD(change)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.label}>儲蓄率</Text>
            <Text style={st.kpi}>{savingRate === null ? '—' : `${Math.round(savingRate * 100)}%`}</Text>
          </View>
        </View>
      </Card>

      <Segmented
        value={range}
        onChange={setRange}
        options={[
          { value: '6', label: '近 6 個月' },
          { value: '12', label: '近 12 個月' },
        ]}
      />

      <Card>
        <SectionTitle>每月總資產</SectionTitle>
        <GrowthLine points={series} width={chartW} />
      </Card>

      <Card>
        <SectionTitle
          right={
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Legend color={C.income} text="收入" />
              <Legend color={C.expense} text="支出" />
            </View>
          }
        >
          每月收支
        </SectionTitle>
        <IncomeExpenseBars points={series} width={chartW} />
      </Card>

      <Card>
        <SectionTitle>各帳戶餘額</SectionTitle>
        {data.accounts.map((a) => {
          const b = accountBalance(data, a.id);
          return (
            <View key={a.id} style={st.accRow}>
              <Text style={st.accName}>{a.name}</Text>
              <Text style={[st.accVal, { color: b >= 0 ? C.text : C.expense }]}>{formatTWD(b)}</Text>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}

function Legend({ color, text }: { color: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: C.sub }}>{text}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  label: { fontSize: 13, color: C.sub },
  big: { fontSize: 30, fontWeight: '800', marginTop: 4 },
  kpis: { flexDirection: 'row', marginTop: 14 },
  kpi: { fontSize: 17, fontWeight: '700', marginTop: 4, color: C.text },
  accRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border },
  accName: { fontSize: 15, color: C.text },
  accVal: { fontSize: 15, fontWeight: '600' },
});
