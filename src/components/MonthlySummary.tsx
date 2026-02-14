"use client";

import { useState, useEffect, useCallback } from "react";
import { getMonthlySavings, getExtraIncomes, getSpecialExpenses } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useRealtimeTable } from "@/lib/useRealtimeTable";

interface Props {
  year: number;
  month: number;
}

export default function MonthlySummary({ year, month }: Props) {
  const [data, setData] = useState({
    savings: 0,
    income: 0,
    expense: 0,
  });

  const load = useCallback(async () => {
    const [savings, incomes, expenses] = await Promise.all([
      getMonthlySavings(year, month),
      getExtraIncomes(year, month),
      getSpecialExpenses(year, month),
    ]);

    setData({
      savings: savings.reduce((s, r) => s + r.amount, 0),
      income: incomes.reduce((s, r) => s + r.amount, 0),
      expense: expenses.reduce((s, r) => s + r.amount, 0),
    });
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeTable("monthly_savings", undefined, load);
  useRealtimeTable("extra_income", undefined, load);
  useRealtimeTable("special_expenses", undefined, load);

  const net = data.savings + data.income - data.expense;

  return (
    <section className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white shadow-lg">
      <h2 className="mb-3 text-lg font-bold">月次サマリー</h2>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>貯蓄合計</span>
          <span>{formatCurrency(data.savings)}</span>
        </div>
        <div className="flex justify-between">
          <span>+ 臨時収入</span>
          <span className="text-green-300">+{formatCurrency(data.income)}</span>
        </div>
        <div className="flex justify-between">
          <span>- 特別出費</span>
          <span className="text-red-300">-{formatCurrency(data.expense)}</span>
        </div>
        <div className="border-t border-white/30 pt-2 mt-2 flex justify-between text-lg font-bold">
          <span>純貯蓄額</span>
          <span className={net >= 0 ? "text-yellow-300" : "text-red-300"}>
            {net >= 0 ? "+" : ""}
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    </section>
  );
}
