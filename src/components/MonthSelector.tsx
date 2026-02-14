"use client";

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthSelector({ year, month, onChange }: Props) {
  const prev = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const next = () => {
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        onClick={prev}
        className="rounded-lg bg-gray-200 px-4 py-2 text-lg font-bold active:bg-gray-300"
      >
        ◀
      </button>
      <span className="text-xl font-bold min-w-[140px] text-center">
        {year}年{month}月
      </span>
      <button
        onClick={next}
        className="rounded-lg bg-gray-200 px-4 py-2 text-lg font-bold active:bg-gray-300"
      >
        ▶
      </button>
    </div>
  );
}
