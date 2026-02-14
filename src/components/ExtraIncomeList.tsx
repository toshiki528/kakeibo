"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getExtraIncomes,
  addExtraIncome,
  deleteExtraIncome,
} from "@/lib/api";
import { PERSONS, type Person, type ExtraIncome } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  year: number;
  month: number;
  onUpdate: () => void;
}

export default function ExtraIncomeList({ year, month, onUpdate }: Props) {
  const [items, setItems] = useState<ExtraIncome[]>([]);
  const [person, setPerson] = useState<Person>("俊樹");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const data = await getExtraIncomes(year, month);
    setItems(data);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const val = parseInt(amount);
    if (!val || val <= 0) return;
    setAdding(true);
    await addExtraIncome(year, month, person, val, memo);
    setAmount("");
    setMemo("");
    await load();
    setAdding(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await deleteExtraIncome(id);
    await load();
    onUpdate();
  };

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-bold text-green-700">臨時収入</h2>

      {items.length > 0 && (
        <ul className="mb-3 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs text-green-600 font-medium">
                  {item.person}
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
            value={person}
            onChange={(e) => setPerson(e.target.value as Person)}
            className="rounded-lg border border-gray-300 px-2 py-2 text-sm"
          >
            {PERSONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="金額"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-right focus:border-green-500 focus:outline-none"
          />
          <span className="self-center text-sm text-gray-500">円</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="メモ（任意）"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white active:bg-green-700 disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-3 text-right text-sm text-gray-600">
          合計:{" "}
          <span className="font-bold text-green-700">
            +{formatCurrency(total)}
          </span>
        </div>
      )}
    </section>
  );
}
