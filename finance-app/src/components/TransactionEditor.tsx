import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirm, notify } from '../confirm';
import { dayLabel, isValidDate, newId, shiftDate, todayStr } from '../format';
import { useStore } from '../store';
import { C } from '../theme';
import { Transaction, TxType } from '../types';
import { Button, Field, Segmented, s as ui } from './ui';

export function TransactionEditor({
  visible,
  editing,
  onClose,
}: {
  visible: boolean;
  editing: Transaction | null;
  onClose: () => void;
}) {
  const { data, saveTransaction, deleteTransaction } = useStore();
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr());
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setType(editing.type);
      setAmount(String(editing.amount));
      setDate(editing.date);
      setCategoryId(editing.categoryId);
      setAccountId(editing.accountId);
      setNote(editing.note);
    } else {
      setType('expense');
      setAmount('');
      setDate(todayStr());
      setCategoryId(data.categories.find((c) => c.type === 'expense')?.id ?? '');
      setAccountId(data.accounts[0]?.id ?? '');
      setNote('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editing]);

  const cats = data.categories.filter((c) => c.type === type);

  const changeType = (t: TxType) => {
    setType(t);
    if (!data.categories.some((c) => c.id === categoryId && c.type === t)) {
      setCategoryId(data.categories.find((c) => c.type === t)?.id ?? '');
    }
  };

  const save = () => {
    const n = Math.round(Number(amount.replace(/,/g, '')));
    if (!Number.isFinite(n) || n <= 0) return notify('金額有誤', '請輸入大於 0 的金額');
    if (!isValidDate(date)) return notify('日期有誤', '請用 YYYY-MM-DD 格式，例如 2026-11-24');
    if (!categoryId) return notify('缺少分類', '請先選擇分類');
    if (!accountId) return notify('缺少帳戶', '請先到「設定」新增帳戶');
    saveTransaction({ id: editing?.id ?? newId(), type, amount: n, date, categoryId, accountId, note: note.trim() });
    onClose();
  };

  const remove = () => {
    if (!editing) return;
    confirm('刪除這筆紀錄？', '刪除後無法復原', () => {
      deleteTransaction(editing.id);
      onClose();
    });
  };

  const accent = type === 'income' ? C.income : C.expense;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
        <View style={st.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={st.headerBtn}>取消</Text>
          </Pressable>
          <Text style={st.headerTitle}>{editing ? '編輯紀錄' : '記一筆'}</Text>
          <Pressable onPress={save} hitSlop={10}>
            <Text style={[st.headerBtn, { fontWeight: '700' }]}>儲存</Text>
          </Pressable>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Segmented
              value={type}
              onChange={changeType}
              options={[
                { value: 'expense', label: '支出', color: C.expense },
                { value: 'income', label: '收入', color: C.income },
              ]}
            />

            <View style={st.amountBox}>
              <Text style={[st.currency, { color: accent }]}>NT$</Text>
              <TextInput
                value={amount}
                onChangeText={(v) => setAmount(v.replace(/[^\d]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#CBD5E1"
                style={[st.amount, { color: accent }]}
                autoFocus={!editing}
              />
            </View>

            <Text style={ui.label}>分類</Text>
            <View style={st.chips}>
              {cats.map((c) => {
                const active = c.id === categoryId;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={[st.chip, active && { borderColor: c.color, backgroundColor: `${c.color}1A` }]}
                  >
                    <Text style={st.chipText}>
                      {c.icon} {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={ui.label}>帳戶</Text>
            <View style={st.chips}>
              {data.accounts.map((a) => {
                const active = a.id === accountId;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => setAccountId(a.id)}
                    style={[st.chip, active && { borderColor: C.primary, backgroundColor: '#DBEAFE' }]}
                  >
                    <Text style={st.chipText}>{a.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={ui.label}>日期</Text>
            <View style={st.dateRow}>
              <Pressable style={st.dateBtn} onPress={() => isValidDate(date) && setDate(shiftDate(date, -1))}>
                <Text style={st.dateBtnText}>前一天</Text>
              </Pressable>
              <TextInput value={date} onChangeText={setDate} style={[ui.input, { flex: 1, minWidth: 0, textAlign: 'center' }]} maxLength={10} />
              <Pressable style={st.dateBtn} onPress={() => isValidDate(date) && setDate(shiftDate(date, 1))}>
                <Text style={st.dateBtnText}>後一天</Text>
              </Pressable>
            </View>
            <Text style={st.dateHint}>
              {isValidDate(date) ? dayLabel(date) : '格式：YYYY-MM-DD'}
              {date !== todayStr() && (
                <Text style={{ color: C.primary }} onPress={() => setDate(todayStr())}>
                  {'   '}回到今天
                </Text>
              )}
            </Text>

            <Field label="備註" value={note} onChangeText={setNote} placeholder="例如：午餐便當" />

            <Button title="儲存" onPress={save} style={{ marginTop: 8 }} />
            {editing && <Button title="刪除這筆" variant="danger" onPress={remove} style={{ marginTop: 10 }} />}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    backgroundColor: C.card,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  headerBtn: { fontSize: 16, color: C.primary },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  currency: { fontSize: 20, fontWeight: '700', marginRight: 8 },
  amount: { flex: 1, minWidth: 0, fontSize: 36, fontWeight: '700', paddingVertical: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { fontSize: 14, color: C.text },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBtn: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, backgroundColor: '#EEF2F7' },
  dateBtnText: { fontSize: 13, color: C.text },
  dateHint: { fontSize: 12, color: C.sub, marginTop: 6, marginBottom: 16 },
});
