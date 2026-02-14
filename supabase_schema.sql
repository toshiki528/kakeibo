-- ========================================
-- 家計簿アプリ Supabase スキーマ
-- ========================================

-- 月次貯蓄テーブル（各名義の月ごとの貯蓄額）
CREATE TABLE monthly_savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  person TEXT NOT NULL CHECK (person IN ('俊樹', 'ハン')),
  amount INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (year, month, person)
);

-- 臨時収入テーブル
CREATE TABLE extra_income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  person TEXT NOT NULL CHECK (person IN ('俊樹', 'ハン')),
  amount INT NOT NULL CHECK (amount > 0),
  memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 特別出費テーブル
CREATE TABLE special_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  category TEXT NOT NULL CHECK (category IN ('旅行', '車検', '税金', '家具', '家電', 'リフォーム', '医療', 'その他')),
  amount INT NOT NULL CHECK (amount > 0),
  memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX idx_monthly_savings_ym ON monthly_savings (year, month);
CREATE INDEX idx_extra_income_ym ON extra_income (year, month);
CREATE INDEX idx_special_expenses_ym ON special_expenses (year, month);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_monthly_savings_updated
  BEFORE UPDATE ON monthly_savings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS（Row Level Security）を無効化（認証不要のため）
ALTER TABLE monthly_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE extra_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_expenses ENABLE ROW LEVEL SECURITY;

-- 全員アクセス可能なポリシー
CREATE POLICY "Allow all on monthly_savings" ON monthly_savings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on extra_income" ON extra_income FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on special_expenses" ON special_expenses FOR ALL USING (true) WITH CHECK (true);
