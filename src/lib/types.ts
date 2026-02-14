export type Person = "俊樹" | "ハン";

export const PERSONS: Person[] = ["俊樹", "ハン"];

export type ExpenseCategory =
  | "旅行"
  | "車検"
  | "税金"
  | "家具"
  | "家電"
  | "リフォーム"
  | "医療"
  | "その他";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "旅行",
  "車検",
  "税金",
  "家具",
  "家電",
  "リフォーム",
  "医療",
  "その他",
];

export interface MonthlySaving {
  id: string;
  year: number;
  month: number;
  person: Person;
  amount: number;
}

export interface ExtraIncome {
  id: string;
  year: number;
  month: number;
  person: Person;
  amount: number;
  memo: string;
}

export interface SpecialExpense {
  id: string;
  year: number;
  month: number;
  category: ExpenseCategory;
  amount: number;
  memo: string;
}

export interface MonthlySummary {
  savingsTotal: number;
  extraIncomeTotal: number;
  specialExpenseTotal: number;
  netSavings: number;
}
