-- Fon akıllı para: yatırım fonlarının aylık portföy raporlarından hisse
-- hareketleri. Gerçek veri kaynağı (TEFAS/KAP) otomatik çekilmiyor — Bilal
-- raporu okuyup panelden giriyor.
CREATE TABLE IF NOT EXISTS fon_hareketleri (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	donem TEXT NOT NULL, -- "2026-08" gibi ay (rapor dönemi)
	fon_adi TEXT NOT NULL,
	hisse TEXT NOT NULL,
	hareket TEXT NOT NULL, -- 'yeni' | 'artirdi' | 'azaltti' | 'cikti'
	agirlik TEXT, -- isteğe bağlı, ör. "%3,2"
	aciklama TEXT,
	olusturulma TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fon_hisse ON fon_hareketleri (hisse);
CREATE INDEX IF NOT EXISTS idx_fon_donem ON fon_hareketleri (donem);
