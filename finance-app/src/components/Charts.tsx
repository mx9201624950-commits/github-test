import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { CategorySlice, GrowthPoint } from '../calc';
import { compactTWD } from '../format';
import { C } from '../theme';

/** 甜甜圈圖：分類占比 */
export function Donut({ slices, size = 180, centerLabel }: { slices: CategorySlice[]; size?: number; centerLabel: string }) {
  const r = size / 2 - 14;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cx} r={r} stroke="#EEF2F7" strokeWidth={22} fill="none" />
        <G rotation={-90} origin={`${cx}, ${cx}`}>
          {slices.map((sl) => {
            const len = sl.ratio * circ;
            const el = (
              <Circle
                key={sl.categoryId}
                cx={cx}
                cy={cx}
                r={r}
                stroke={sl.color}
                strokeWidth={22}
                fill="none"
                strokeDasharray={`${Math.max(len - 1.5, 0.5)} ${circ}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </G>
      </Svg>
      <View style={{ position: 'absolute', top: 0, bottom: 0, justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>{centerLabel}</Text>
      </View>
    </View>
  );
}

const PAD = { l: 44, r: 12, t: 12, b: 26 };

function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    const d = Math.abs(max) || 1000;
    min -= d / 2;
    max += d / 2;
  }
  const raw = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.001; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

/** 折線圖：每月月底總資產 */
export function GrowthLine({ points, width, height = 200 }: { points: GrowthPoint[]; width: number; height?: number }) {
  const vals = points.map((p) => p.netWorth);
  const ticks = niceTicks(Math.min(0, ...vals), Math.max(...vals));
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const w = width - PAD.l - PAD.r;
  const h = height - PAD.t - PAD.b;
  const x = (i: number) => PAD.l + (points.length === 1 ? w / 2 : (i / (points.length - 1)) * w);
  const y = (v: number) => PAD.t + h - ((v - lo) / (hi - lo || 1)) * h;
  const pts = points.map((p, i) => `${x(i)},${y(p.netWorth)}`).join(' ');
  const area = `M${x(0)},${y(lo)} L${points.map((p, i) => `${x(i)},${y(p.netWorth)}`).join(' L')} L${x(points.length - 1)},${y(lo)} Z`;
  const labelEvery = points.length > 6 ? 2 : 1;
  return (
    <Svg width={width} height={height}>
      {ticks.map((t) => (
        <G key={t}>
          <Line x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? '#CBD5E1' : '#EEF2F7'} strokeWidth={1} />
          <SvgText x={PAD.l - 6} y={y(t) + 4} fontSize={10} fill={C.sub} textAnchor="end">
            {compactTWD(t)}
          </SvgText>
        </G>
      ))}
      <Path d={area} fill={C.primary} opacity={0.08} />
      <Polyline points={pts} fill="none" stroke={C.primary} strokeWidth={2.5} strokeLinejoin="round" />
      {points.map((p, i) => (
        <G key={p.month}>
          <Circle cx={x(i)} cy={y(p.netWorth)} r={i === points.length - 1 ? 4.5 : 3} fill={C.primary} />
          {(points.length - 1 - i) % labelEvery === 0 && (
            <SvgText x={x(i)} y={height - 8} fontSize={10} fill={C.sub} textAnchor="middle">
              {`${Number(p.month.slice(5))}月`}
            </SvgText>
          )}
        </G>
      ))}
    </Svg>
  );
}

/** 長條圖：每月收入 vs 支出 */
export function IncomeExpenseBars({ points, width, height = 180 }: { points: GrowthPoint[]; width: number; height?: number }) {
  const max = Math.max(1, ...points.flatMap((p) => [p.income, p.expense]));
  const ticks = niceTicks(0, max);
  const hi = ticks[ticks.length - 1];
  const w = width - PAD.l - PAD.r;
  const h = height - PAD.t - PAD.b;
  const slot = w / points.length;
  const bw = Math.min(10, slot / 2 - 2);
  const y = (v: number) => PAD.t + h - (v / hi) * h;
  const labelEvery = points.length > 6 ? 2 : 1;
  return (
    <Svg width={width} height={height}>
      {ticks.map((t) => (
        <G key={t}>
          <Line x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} stroke="#EEF2F7" strokeWidth={1} />
          <SvgText x={PAD.l - 6} y={y(t) + 4} fontSize={10} fill={C.sub} textAnchor="end">
            {compactTWD(t)}
          </SvgText>
        </G>
      ))}
      {points.map((p, i) => {
        const cx = PAD.l + slot * i + slot / 2;
        return (
          <G key={p.month}>
            <Rect x={cx - bw - 1} y={y(p.income)} width={bw} height={Math.max(0, y(0) - y(p.income))} rx={2} fill={C.income} />
            <Rect x={cx + 1} y={y(p.expense)} width={bw} height={Math.max(0, y(0) - y(p.expense))} rx={2} fill={C.expense} />
            {(points.length - 1 - i) % labelEvery === 0 && (
              <SvgText x={cx} y={height - 8} fontSize={10} fill={C.sub} textAnchor="middle">
                {`${Number(p.month.slice(5))}月`}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}
