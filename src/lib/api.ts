import { supabase } from "./supabase";
import type {
  MonthlySaving,
  ExtraIncome,
  SpecialExpense,
  Person,
  ExpenseCategory,
} from "./types";

// ========== 月次貯蓄 ==========

export async function getMonthlySavings(
  year: number,
  month: number
): Promise<MonthlySaving[]> {
  const { data, error } = await supabase
    .from("monthly_savings")
    .select("*")
    .eq("year", year)
    .eq("month", month);
  if (error) throw error;
  return data ?? [];
}

export async function upsertMonthlySaving(
  year: number,
  month: number,
  person: Person,
  amount: number
): Promise<void> {
  const { error } = await supabase
    .from("monthly_savings")
    .upsert(
      { year, month, person, amount },
      { onConflict: "year,month,person" }
    );
  if (error) throw error;
}

// ========== 臨時収入 ==========

export async function getExtraIncomes(
  year: number,
  month: number
): Promise<ExtraIncome[]> {
  const { data, error } = await supabase
    .from("extra_income")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addExtraIncome(
  year: number,
  month: number,
  person: Person,
  amount: number,
  memo: string
): Promise<void> {
  const { error } = await supabase
    .from("extra_income")
    .insert({ year, month, person, amount, memo });
  if (error) throw error;
}

export async function deleteExtraIncome(id: string): Promise<void> {
  const { error } = await supabase.from("extra_income").delete().eq("id", id);
  if (error) throw error;
}

// ========== 特別出費 ==========

export async function getSpecialExpenses(
  year: number,
  month: number
): Promise<SpecialExpense[]> {
  const { data, error } = await supabase
    .from("special_expenses")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addSpecialExpense(
  year: number,
  month: number,
  category: ExpenseCategory,
  amount: number,
  memo: string
): Promise<void> {
  const { error } = await supabase
    .from("special_expenses")
    .insert({ year, month, category, amount, memo });
  if (error) throw error;
}

export async function deleteSpecialExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from("special_expenses")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ========== 年別・全期間集計 ==========

export async function getYearlySummary(year: number) {
  const [savingsRes, incomeRes, expenseRes] = await Promise.all([
    supabase
      .from("monthly_savings")
      .select("month, amount")
      .eq("year", year),
    supabase
      .from("extra_income")
      .select("month, amount")
      .eq("year", year),
    supabase
      .from("special_expenses")
      .select("month, amount")
      .eq("year", year),
  ]);

  if (savingsRes.error) throw savingsRes.error;
  if (incomeRes.error) throw incomeRes.error;
  if (expenseRes.error) throw expenseRes.error;

  const monthly: Record<
    number,
    { savings: number; income: number; expense: number }
  > = {};

  for (let m = 1; m <= 12; m++) {
    monthly[m] = { savings: 0, income: 0, expense: 0 };
  }

  for (const r of savingsRes.data ?? []) {
    monthly[r.month].savings += r.amount;
  }
  for (const r of incomeRes.data ?? []) {
    monthly[r.month].income += r.amount;
  }
  for (const r of expenseRes.data ?? []) {
    monthly[r.month].expense += r.amount;
  }

  return monthly;
}

export async function getAllTimeTotals() {
  const [savingsRes, incomeRes, expenseRes] = await Promise.all([
    supabase.from("monthly_savings").select("amount"),
    supabase.from("extra_income").select("amount"),
    supabase.from("special_expenses").select("amount"),
  ]);

  if (savingsRes.error) throw savingsRes.error;
  if (incomeRes.error) throw incomeRes.error;
  if (expenseRes.error) throw expenseRes.error;

  const savings = (savingsRes.data ?? []).reduce(
    (s, r) => s + r.amount,
    0
  );
  const income = (incomeRes.data ?? []).reduce(
    (s, r) => s + r.amount,
    0
  );
  const expense = (expenseRes.data ?? []).reduce(
    (s, r) => s + r.amount,
    0
  );

  return { savings, income, expense, net: savings + income - expense };
}

export async function getAvailableYears(): Promise<number[]> {
  const [s1, s2, s3] = await Promise.all([
    supabase.from("monthly_savings").select("year"),
    supabase.from("extra_income").select("year"),
    supabase.from("special_expenses").select("year"),
  ]);

  const years = new Set<number>();
  for (const r of [...(s1.data ?? []), ...(s2.data ?? []), ...(s3.data ?? [])]) {
    years.add(r.year);
  }

  return Array.from(years).sort((a, b) => b - a);
}
