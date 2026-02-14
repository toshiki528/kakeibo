"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSpecialExpenses,
  addSpecialExpense,
  deleteSpecialExpense,
} from "@/lib/api";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  type SpecialExpense,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  year: number;
  month: number;
  onUpdate: () => void;
}

export default function SpecialExpenseList({ year, month, onUpdate }: Props) {
  const [items, setItems] = useState<SpecialExpense[]>([]);
  const [category, setCategory] = useState<ExpenseCategory>("旅行");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const data = await getSpecialExpenses(year, month);
    setItems(data);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const val = parseInt(amount);
    if (!val || val <= 0) return;
    setAdding(true);
    await addSpecialExpense(year, month, category, val, memo);
    setAmount("");
    setMemo("");
    await load();
    setAdding(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteSpecialExpense(id);
    await load();
    onUpdate();
  };

  const total = items.reduce((s, i) => s + i.amount, 0);

  const categoryEmoji: Record<ExpenseCategory, string> = {
    旅行: "✈️",
    車検: "🚗",
    税金: "🏛️",
    家具: "🪑",
    家電: "📺",
    リフォーム: "🔨",
    医療: "🏥",
    その他: "📦",
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-bold text-red-700">特別出費</h2>

      {items.length > 0 && (
        <ul className="mb-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs">
                  {categoryEmoji[item.category]} {item.category}
                </span>
                <span className="ml-2 font-bold">
                  {formatCurrency(item.amount)}
                </span>
                {item.memo && (
                  <span className="ml-2 text-xs text-gray-500 truncate">
                    {item.memo}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="ml-2 text-red-400 hover:text-red-600 text-sm"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 border-t border-gray-100 pt-3">
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ExpenseCategory)
            }
            className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryEmoji[c]} {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="金額"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-red-500 focus:outline-none"
          />
          <span className="self-center text-sm text-gray-500">円</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモ（任意）"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white active:bg-red-700 disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-3 text-right text-sm text-gray-600">
          合計:{" "}
          <span className="font-bold text-red-700">
            -{formatCurrency(total)}
          </span>
        </div>
      )}
    </section>
  );
}
