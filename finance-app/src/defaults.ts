import { AppData, Category } from './types';

const expense: [string, string, string][] = [
  ['餐飲', '🍱', '#F97316'],
  ['交通', '🚌', '#0EA5E9'],
  ['購物', '🛍️', '#EC4899'],
  ['居住', '🏠', '#8B5CF6'],
  ['娛樂', '🎮', '#14B8A6'],
  ['醫療', '💊', '#EF4444'],
  ['學習', '📚', '#6366F1'],
  ['其他', '📦', '#64748B'],
];

const income: [string, string, string][] = [
  ['薪資', '💼', '#16A34A'],
  ['獎金', '🎁', '#22C55E'],
  ['投資收益', '📈', '#059669'],
  ['其他收入', '💰', '#65A30D'],
];

export function defaultData(): AppData {
  const categories: Category[] = [
    ...expense.map(([name, icon, color], i) => ({ id: `ce${i}`, name, icon, color, type: 'expense' as const })),
    ...income.map(([name, icon, color], i) => ({ id: `ci${i}`, name, icon, color, type: 'income' as const })),
  ];
  return {
    version: 1,
    categories,
    accounts: [
      { id: 'a0', name: '現金', initialBalance: 0 },
      { id: 'a1', name: '銀行帳戶', initialBalance: 0 },
      { id: 'a2', name: '信用卡', initialBalance: 0 },
    ],
    transactions: [],
    monthlyBudget: 0,
  };
}

export const COLOR_CHOICES = [
  '#F97316', '#0EA5E9', '#EC4899', '#8B5CF6', '#14B8A6', '#EF4444',
  '#6366F1', '#64748B', '#16A34A', '#EAB308', '#059669', '#D946EF',
];
