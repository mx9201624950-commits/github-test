import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { defaultData } from './defaults';
import { Account, AppData, Category, Transaction } from './types';

const KEY = 'finance-app/data/v1';

interface Store {
  data: AppData;
  loaded: boolean;
  saveTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  saveCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  saveAccount: (a: Account) => void;
  deleteAccount: (id: string) => void;
  setMonthlyBudget: (n: number) => void;
  replaceAll: (d: AppData) => void;
}

const Ctx = createContext<Store | null>(null);

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const i = list.findIndex((x) => x.id === item.id);
  if (i < 0) return [...list, item];
  const copy = list.slice();
  copy[i] = item;
  return copy;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [loaded, setLoaded] = useState(false);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as AppData;
          setData({ ...defaultData(), ...parsed });
        }
      })
      .catch((e) => console.warn('讀取資料失敗', e))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch((e) => console.warn('儲存失敗', e));
  }, [data, loaded]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  const store: Store = {
    data,
    loaded,
    saveTransaction: (t) => update((d) => ({ ...d, transactions: upsert(d.transactions, t) })),
    deleteTransaction: (id) => update((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) })),
    saveCategory: (c) => update((d) => ({ ...d, categories: upsert(d.categories, c) })),
    deleteCategory: (id) => update((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) })),
    saveAccount: (a) => update((d) => ({ ...d, accounts: upsert(d.accounts, a) })),
    deleteAccount: (id) => update((d) => ({ ...d, accounts: d.accounts.filter((a) => a.id !== id) })),
    setMonthlyBudget: (n) => update((d) => ({ ...d, monthlyBudget: n })),
    replaceAll: (d) => setData(d),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
