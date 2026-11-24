export function formatTWD(n: number): string {
  const sign = n < 0 ? '-' : '';
  return `${sign}NT$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
}

/** 圖表座標軸用的精簡數字：1.2萬、350萬 */
export function compactTWD(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e8) return `${sign}${trim(abs / 1e8)}億`;
  if (abs >= 1e4) return `${sign}${trim(abs / 1e4)}萬`;
  return `${sign}${Math.round(abs)}`;
}

function trim(x: number): string {
  return x >= 100 ? Math.round(x).toString() : (Math.round(x * 10) / 10).toString();
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

/** YYYY-MM */
export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function currentMonth(): string {
  return monthKey(todayStr());
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function shiftDate(date: string, delta: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return toDateStr(new Date(y, m - 1, d + delta));
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-');
  return `${y} 年 ${Number(m)} 月`;
}

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
export function dayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return `${m}/${d}（${WEEK[w]}）`;
}

export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
