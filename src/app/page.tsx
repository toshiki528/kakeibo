"use client";

import { useState } from "react";
import MonthSelector from "@/components/MonthSelector";
import SavingsInput from "@/components/SavingsInput";
import ExtraIncomeList from "@/components/ExtraIncomeList";
import SpecialExpenseList from "@/components/SpecialExpenseList";
import MonthlySummary from "@/components/MonthlySummary";
import YearlyReport from "@/components/YearlyReport";

export default function Home() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<"monthly" | "report">("monthly");

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* タブ切り替え */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto flex">
          <button
            onClick={() => setTab("monthly")}
            className={`flex-1 py-3 text-center text-sm font-bold ${
              tab === "monthly"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400"
            }`}
          >
            月次入力
          </button>
          <button
            onClick={() => setTab("report")}
            className={`flex-1 py-3 text-center text-sm font-bold ${
              tab === "report"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-400"
            }`}
          >
            レポート
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {tab === "monthly" ? (
          <>
            <MonthSelector
              year={year}
              month={month}
              onChange={(y, m) => {
                setYear(y);
                setMonth(m);
              }}
            />

            <div className="space-y-4">
              <MonthlySummary
                year={year}
                month={month}
                refreshKey={refreshKey}
              />
              <SavingsInput
                key={`s-${year}-${month}`}
                year={year}
                month={month}
                onUpdate={refresh}
              />
              <ExtraIncomeList
                key={`e-${year}-${month}`}
                year={year}
                month={month}
                onUpdate={refresh}
              />
              <SpecialExpenseList
                key={`x-${year}-${month}`}
                year={year}
                month={month}
                onUpdate={refresh}
              />
            </div>
          </>
        ) : (
          <div className="py-4 space-y-4">
            <YearlyReport key={refreshKey} />
          </div>
        )}
      </div>
    </main>
  );
}
