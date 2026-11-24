import { AppData, Transaction } from './types';
import { monthKey, shiftMonth } from './format';

export function signed(t: Transaction): number {
  return t.type === 'income' ? t.amount : -t.amount;
}

export function txInMonth(data: AppData, month: string): Transaction[] {
  return data.transactions.filter((t) => monthKey(t.date) === month);
}

export function monthTotals(data: AppData, month: string) {
  let income = 0;
  let expense = 0;
  for (const t of txInMonth(data, month)) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

export interface CategorySlice {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  ratio: number;
}

export function categoryBreakdown(data: AppData, month: string, type: 'income' | 'expense'): CategorySlice[] {
  const sums = new Map<string, number>();
  for (const t of txInMonth(data, month)) {
    if (t.type !== type) continue;
    sums.set(t.categoryId, (sums.get(t.categoryId) ?? 0) + t.amount);
  }
  const total = [...sums.values()].reduce((a, b) => a + b, 0);
  return [...sums.entries()]
    .map(([categoryId, sum]) => {
      const c = data.categories.find((x) => x.id === categoryId);
      return {
        categoryId,
        name: c?.name ?? '（已刪除分類）',
        icon: c?.icon ?? '❔',
        color: c?.color ?? '#94A3B8',
        total: sum,
        ratio: total ? sum / total : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function accountBalance(data: AppData, accountId: string, upToDate?: string): number {
  const acc = data.accounts.find((a) => a.id === accountId);
  let bal = acc?.initialBalance ?? 0;
  for (const t of data.transactions) {
    if (t.accountId !== accountId) continue;
    if (upToDate && t.date > upToDate) continue;
    bal += signed(t);
  }
  return bal;
}

/** 總資產（所有帳戶期初餘額 + 截至該日的收支） */
export function netWorth(data: AppData, upToDate?: string): number {
  let total = data.accounts.reduce((s, a) => s + a.initialBalance, 0);
  // 刪除帳戶後，其交易不再計入，與帳戶餘額一致
  const ids = new Set(data.accounts.map((a) => a.id));
  for (const t of data.transactions) {
    if (!ids.has(t.accountId)) continue;
    if (upToDate && t.date > upToDate) continue;
    total += signed(t);
  }
  return total;
}

export interface GrowthPoint {
  month: string;
  netWorth: number;
  income: number;
  expense: number;
}

/** 最近 n 個月（含 endMonth）每月月底的總資產 */
export function growthSeries(data: AppData, endMonth: string, n: number): GrowthPoint[] {
  const pts: GrowthPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const m = shiftMonth(endMonth, -i);
    const { income, expense } = monthTotals(data, m);
    pts.push({ month: m, netWorth: netWorth(data, `${m}-31`), income, expense });
  }
  return pts;
}

/** 依日期分組（新到舊） */
export function groupByDay(txs: Transaction[]): { date: string; items: Transaction[]; net: number }[] {
  const map = new Map<string, Transaction[]>();
  for (const t of txs) {
    if (!map.has(t.date)) map.set(t.date, []);
    map.get(t.date)!.push(t);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({ date, items, net: items.reduce((s, t) => s + signed(t), 0) }));
}
