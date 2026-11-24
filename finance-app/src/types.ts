export type TxType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TxType;
  icon: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  /** 期初餘額（TWD，整數元） */
  initialBalance: number;
}

export interface Transaction {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** 正整數金額（TWD） */
  amount: number;
  type: TxType;
  categoryId: string;
  accountId: string;
  note: string;
}

export interface AppData {
  version: 1;
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  /** 每月支出預算，0 表示未設定 */
  monthlyBudget: number;
}
