"use client";

import { useState, useEffect, useCallback } from "react";
import { getMonthlySavings, upsertMonthlySaving } from "@/lib/api";
import { PERSONS, type Person } from "@/lib/types";
import { formatCurrency, formatNumberInput, parseNumberInput } from "@/lib/utils";
import { useRealtimeTable } from "@/lib/useRealtimeTable";

interface Props {
  year: number;
  month: number;
}

export default function SavingsInput({ year, month }: Props) {
  const [amounts, setAmounts] = useState<Record<Person, string>>({
    俊樹: "",
    ハン: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const data = await getMonthlySavings(year, month);
    const next: Record<Person, string> = { 俊樹: "", ハン: "" };
    for (const d of data) {
      next[d.person as Person] = d.amount ? d.amount.toLocaleString("ja-JP") : "";
    }
    setAmounts(next);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeTable("monthly_savings", undefined, load);

  const save = async (person: Person) => {
    const val = parseNumberInput(amounts[person]);
    setSaving(true);
    await upsertMonthlySaving(year, month, person, val);
    setSaving(false);
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-bold text-blue-700">月次貯蓄額</h2>
      <div className="space-y-3">
        {PERSONS.map((person) => (
          <div key={person} className="flex items-center gap-2">
            <span className="w-14 font-medium text-sm">{person}</span>
            <input
              type="text"
              inputMode="numeric"
              value={amounts[person]}
              onChange={(e) =>
                setAmounts((a) => ({ ...a, [person]: formatNumberInput(e.target.value) }))
              }
              onBlur={() => save(person)}
              placeholder="0"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-right text-lg focus:border-blue-500 focus:outline-none"
            />
            <span className="text-sm text-gray-500">円</span>
          </div>
        ))}
      </div>
      {saving && (
        <p className="mt-2 text-xs text-gray-400">保存中...</p>
      )}
      <div className="mt-3 text-right text-sm text-gray-600">
        合計:{" "}
        <span className="font-bold text-blue-700">
          {formatCurrency(
            PERSONS.reduce(
              (s, p) => s + parseNumberInput(amounts[p]),
              0
            )
          )}
        </span>
      </div>
    </section>
  );
}
