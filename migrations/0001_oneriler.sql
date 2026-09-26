-- Kurumların hisse önerileri
CREATE TABLE IF NOT EXISTS oneriler (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tarih TEXT NOT NULL, -- YYYY-MM-DD, önerinin verildiği gün (İstanbul saatiyle)
	kurum TEXT NOT NULL,
	hisse TEXT NOT NULL,
	tur TEXT NOT NULL, -- Günlük | Haftalık | Model portföy | Takip listesi
	giris TEXT,
	hedef TEXT NOT NULL,
	stop TEXT,
	potansiyel TEXT,
	kaynak_url TEXT,
	olusturulma TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_oneriler_tarih ON oneriler (tarih);
CREATE INDEX IF NOT EXISTS idx_oneriler_hisse ON oneriler (hisse);
