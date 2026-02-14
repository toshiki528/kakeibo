export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}

export function formatNumberInput(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ja-JP");
}

export function parseNumberInput(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, "")) || 0;
}

export function getMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}
