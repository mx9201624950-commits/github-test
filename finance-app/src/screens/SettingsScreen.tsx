import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirm, notify } from '../confirm';
import { Button, Card, Field, Segmented, SectionTitle } from '../components/ui';
import { COLOR_CHOICES, defaultData } from '../defaults';
import { formatTWD, newId } from '../format';
import { useStore } from '../store';
import { C } from '../theme';
import { Account, AppData, Category, TxType } from '../types';

export function SettingsScreen() {
  const store = useStore();
  const { data } = store;
  const [catType, setCatType] = useState<TxType>('expense');
  const [cat, setCat] = useState<Category | null>(null);
  const [acc, setAcc] = useState<Account | null>(null);
  const [budget, setBudget] = useState(data.monthlyBudget ? String(data.monthlyBudget) : '');
  const [importOpen, setImportOpen] = useState(false);

  const exportData = async () => {
    try {
      await Share.share({ message: JSON.stringify(data), title: '記帳資料備份' });
    } catch (e) {
      notify('匯出失敗', String(e));
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <SectionTitle>每月支出預算</SectionTitle>
      <Card>
        <Field
          label="金額（留空或 0 表示不設定）"
          value={budget}
          keyboardType="number-pad"
          placeholder="例如 20000"
          onChangeText={(v) => setBudget(v.replace(/[^\d]/g, ''))}
          onEndEditing={() => store.setMonthlyBudget(Number(budget) || 0)}
          onBlur={() => store.setMonthlyBudget(Number(budget) || 0)}
        />
        <Text style={st.hint}>設定後，「帳本」頁會顯示本月預算使用進度。</Text>
      </Card>

      <SectionTitle right={<SmallBtn text="＋ 新增" onPress={() => setAcc({ id: '', name: '', initialBalance: 0 })} />}>帳戶</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        {data.accounts.map((a, i) => (
          <Pressable key={a.id} onPress={() => setAcc(a)} style={[st.row, i > 0 && st.rowBorder]}>
            <Text style={st.rowText}>{a.name}</Text>
            <Text style={st.rowSub}>期初 {formatTWD(a.initialBalance)} ›</Text>
          </Pressable>
        ))}
      </Card>

      <SectionTitle
        right={<SmallBtn text="＋ 新增" onPress={() => setCat({ id: '', name: '', type: catType, icon: '🏷️', color: COLOR_CHOICES[0] })} />}
      >
        分類
      </SectionTitle>
      <Segmented
        value={catType}
        onChange={setCatType}
        options={[
          { value: 'expense', label: '支出分類', color: C.expense },
          { value: 'income', label: '收入分類', color: C.income },
        ]}
      />
      <Card style={{ paddingVertical: 4 }}>
        {data.categories
          .filter((c) => c.type === catType)
          .map((c, i) => (
            <Pressable key={c.id} onPress={() => setCat(c)} style={[st.row, i > 0 && st.rowBorder]}>
              <Text style={st.rowText}>
                <Text>{c.icon}</Text> {c.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.color }} />
                <Text style={st.rowSub}>›</Text>
              </View>
            </Pressable>
          ))}
      </Card>

      <SectionTitle>資料</SectionTitle>
      <Card>
        <Text style={st.hint}>資料只存在這支手機上。換手機或重裝 App 前，請先匯出備份（可存到備忘錄或傳給自己）。</Text>
        <Button title="匯出備份" variant="ghost" onPress={exportData} style={{ marginTop: 12 }} />
        <Button title="從備份匯入" variant="ghost" onPress={() => setImportOpen(true)} style={{ marginTop: 10 }} />
        <Button
          title="清除所有資料"
          variant="danger"
          style={{ marginTop: 10 }}
          onPress={() => confirm('清除所有資料？', '所有紀錄、分類與帳戶都會回到初始狀態，無法復原。', () => store.replaceAll(defaultData()), '清除')}
        />
      </Card>
      <Text style={[st.hint, { textAlign: 'center', marginTop: 8 }]}>{data.transactions.length} 筆紀錄・幣別 TWD</Text>

      <CategoryEditor value={cat} onClose={() => setCat(null)} />
      <AccountEditor value={acc} onClose={() => setAcc(null)} />
      <ImportModal visible={importOpen} onClose={() => setImportOpen(false)} />
    </ScrollView>
  );
}

function SmallBtn({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={{ color: C.primary, fontSize: 14, fontWeight: '600' }}>{text}</Text>
    </Pressable>
  );
}

function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
        <View style={st.sheetHead}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={{ color: C.primary, fontSize: 16 }}>取消</Text>
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: '700', color: C.text }}>{title}</Text>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function CategoryEditor({ value, onClose }: { value: Category | null; onClose: () => void }) {
  const { data, saveCategory, deleteCategory } = useStore();
  const [draft, setDraft] = useState<Category | null>(null);
  const [lastValue, setLastValue] = useState<Category | null>(null);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }
  if (!draft) return null;
  const isNew = !draft.id;
  const used = data.transactions.filter((t) => t.categoryId === draft.id).length;

  const save = () => {
    if (!draft.name.trim()) return notify('請輸入名稱', '');
    saveCategory({ ...draft, id: draft.id || newId(), name: draft.name.trim(), icon: draft.icon.trim() || '🏷️' });
    onClose();
  };
  const remove = () => {
    if (used > 0) return notify('無法刪除', `還有 ${used} 筆紀錄使用這個分類，請先修改那些紀錄。`);
    confirm(`刪除「${draft.name}」？`, '', () => {
      deleteCategory(draft.id);
      onClose();
    });
  };

  return (
    <Sheet visible={!!value} title={isNew ? '新增分類' : '編輯分類'} onClose={onClose}>
      <Field label="名稱" value={draft.name} onChangeText={(name) => setDraft({ ...draft, name })} placeholder="例如：寵物" />
      <Field label="圖示（輸入一個表情符號）" value={draft.icon} onChangeText={(icon) => setDraft({ ...draft, icon })} maxLength={4} />
      <Text style={{ fontSize: 13, color: C.sub, marginBottom: 6 }}>顏色</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        {COLOR_CHOICES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setDraft({ ...draft, color: c })}
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c, borderWidth: draft.color === c ? 3 : 0, borderColor: C.text }}
          />
        ))}
      </View>
      <Button title="儲存" onPress={save} />
      {!isNew && <Button title="刪除分類" variant="danger" onPress={remove} style={{ marginTop: 10 }} />}
    </Sheet>
  );
}

function AccountEditor({ value, onClose }: { value: Account | null; onClose: () => void }) {
  const { data, saveAccount, deleteAccount } = useStore();
  const [name, setName] = useState('');
  const [bal, setBal] = useState('');
  const [lastValue, setLastValue] = useState<Account | null>(null);
  if (value !== lastValue) {
    setLastValue(value);
    setName(value?.name ?? '');
    setBal(value ? String(value.initialBalance) : '');
  }
  if (!value) return null;
  const isNew = !value.id;
  const used = data.transactions.filter((t) => t.accountId === value.id).length;

  const save = () => {
    if (!name.trim()) return notify('請輸入名稱', '');
    const n = Number(bal || 0);
    if (!Number.isFinite(n)) return notify('期初餘額有誤', '請輸入數字，負數代表欠款（例如信用卡）');
    saveAccount({ id: value.id || newId(), name: name.trim(), initialBalance: Math.round(n) });
    onClose();
  };
  const remove = () => {
    if (used > 0) return notify('無法刪除', `還有 ${used} 筆紀錄使用這個帳戶，請先修改那些紀錄。`);
    confirm(`刪除「${value.name}」？`, '', () => {
      deleteAccount(value.id);
      onClose();
    });
  };

  return (
    <Sheet visible title={isNew ? '新增帳戶' : '編輯帳戶'} onClose={onClose}>
      <Field label="名稱" value={name} onChangeText={setName} placeholder="例如：郵局、證券戶" />
      <Field
        label="期初餘額（開始記帳時的餘額，負數代表欠款）"
        value={bal}
        onChangeText={(v) => setBal(v.replace(/[^\d-]/g, ''))}
        keyboardType="numbers-and-punctuation"
        placeholder="0"
      />
      <Button title="儲存" onPress={save} />
      {!isNew && <Button title="刪除帳戶" variant="danger" onPress={remove} style={{ marginTop: 10 }} />}
    </Sheet>
  );
}

function ImportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { replaceAll } = useStore();
  const [text, setText] = useState('');
  const doImport = () => {
    try {
      const d = JSON.parse(text) as AppData;
      if (!Array.isArray(d.transactions) || !Array.isArray(d.categories) || !Array.isArray(d.accounts)) throw new Error('格式不符');
      confirm('匯入備份？', `會用備份裡的 ${d.transactions.length} 筆紀錄取代目前所有資料。`, () => {
        replaceAll({ ...defaultData(), ...d });
        setText('');
        onClose();
      }, '匯入');
    } catch {
      notify('匯入失敗', '請貼上「匯出備份」產生的完整內容');
    }
  };
  if (!visible) return null;
  return (
    <Sheet visible title="從備份匯入" onClose={onClose}>
      <Field label="貼上備份內容" value={text} onChangeText={setText} multiline style={{ height: 200, textAlignVertical: 'top' }} />
      <Button title="匯入" onPress={doImport} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border },
  rowText: { fontSize: 15, color: C.text },
  rowSub: { fontSize: 14, color: C.sub },
  hint: { fontSize: 12, color: C.sub, lineHeight: 18 },
  sheetHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
});
