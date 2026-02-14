export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}

export function getMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}
