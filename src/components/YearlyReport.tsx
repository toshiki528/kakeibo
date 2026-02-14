"use client";

import { useState, useEffect } from "react";
import { getYearlySummary, getAllTimeTotals, getAvailableYears } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function YearlyReport() {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [monthly, setMonthly] = useState<
    Record<number, { savings: number; income: number; expense: number }> | null
  >(null);
  const [allTime, setAllTime] = useState<{
    savings: number;
    income: number;
    expense: number;
    net: number;
  } | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const [y, totals] = await Promise.all([
        getAvailableYears(),
        getAllTimeTotals(),
      ]);
      setYears(y.length > 0 ? y : [new Date().getFullYear()]);
      setAllTime(totals);
      if (y.length > 0) {
        setSelectedYear(y[0]);
      } else {
        setSelectedYear(new Date().getFullYear());
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedYear !== null) {
      getYearlySummary(selectedYear).then(setMonthly);
    }
  }, [selectedYear]);

  if (!allTime || !monthly || selectedYear === null) {
    return (
      <section className="rounded-xl bg-white p-4 shadow">
        <p className="text-center text-gray-400">読み込み中...</p>
      </section>
    );
  }

  const yearTotal = Object.values(monthly).reduce(
    (acc, m) => ({
      savings: acc.savings + m.savings,
      income: acc.income + m.income,
      expense: acc.expense + m.expense,
    }),
    { savings: 0, income: 0, expense: 0 }
  );
  const yearNet = yearTotal.savings + yearTotal.income - yearTotal.expense;

  return (
    <div className="space-y-4">
      {/* 全期間累計 */}
      <section className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 p-4 text-white shadow-lg">
        <h2 className="mb-2 text-lg font-bold">全期間 累計純貯蓄</h2>
        <p
          className={`text-2xl font-bold ${
            allTime.net >= 0 ? "text-yellow-300" : "text-red-300"
          }`}
        >
          {allTime.net >= 0 ? "+" : ""}
          {formatCurrency(allTime.net)}
        </p>
        <div className="mt-2 text-xs space-y-0.5 text-purple-200">
          <div className="flex justify-between">
            <span>貯蓄合計</span>
            <span>{formatCurrency(allTime.savings)}</span>
          </div>
          <div className="flex justify-between">
            <span>臨時収入</span>
            <span>+{formatCurrency(allTime.income)}</span>
          </div>
          <div className="flex justify-between">
            <span>特別出費</span>
            <span>-{formatCurrency(allTime.expense)}</span>
          </div>
        </div>
      </section>

      {/* 年別レポート */}
      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-bold text-purple-700">年別レポート</h2>

        <div className="flex gap-2 mb-3 flex-wrap">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => {
                setSelectedYear(y);
                setExpanded(false);
              }}
              className={`rounded-full px-4 py-1 text-sm font-bold ${
                y === selectedYear
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {y}年
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-purple-50 p-3 mb-3">
          <div className="flex justify-between font-bold">
            <span>{selectedYear}年 合計</span>
            <span className={yearNet >= 0 ? "text-green-700" : "text-red-700"}>
              {yearNet >= 0 ? "+" : ""}
              {formatCurrency(yearNet)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
            <div className="flex justify-between">
              <span>貯蓄</span>
              <span>{formatCurrency(yearTotal.savings)}</span>
            </div>
            <div className="flex justify-between">
              <span>臨時収入</span>
              <span>+{formatCurrency(yearTotal.income)}</span>
            </div>
            <div className="flex justify-between">
              <span>特別出費</span>
              <span>-{formatCurrency(yearTotal.expense)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center text-sm text-purple-600 font-medium py-1"
        >
          {expanded ? "月別明細を閉じる ▲" : "月別明細を展開 ▼"}
        </button>

        {expanded && (
          <div className="mt-2 space-y-1">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const d = monthly[m];
              const net = d.savings + d.income - d.expense;
              const hasData = d.savings || d.income || d.expense;
              return (
                <div
                  key={m}
                  className={`flex justify-between rounded px-3 py-1.5 text-sm ${
                    hasData ? "bg-gray-50" : "bg-gray-50/50 text-gray-300"
                  }`}
                >
                  <span className="w-12">{m}月</span>
                  <span className="text-xs text-gray-400 flex-1 text-center">
                    {hasData
                      ? `貯${formatCurrency(d.savings)} / +${formatCurrency(
                          d.income
                        )} / -${formatCurrency(d.expense)}`
                      : "—"}
                  </span>
                  <span
                    className={`w-24 text-right font-bold ${
                      !hasData
                        ? "text-gray-300"
                        : net >= 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {hasData
                      ? `${net >= 0 ? "+" : ""}${formatCurrency(net)}`
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
