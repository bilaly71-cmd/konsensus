-- Takvim, Halka arz ve SPK bülteni ortak tablo. Gerçek veri kaynağı yok
-- (KAP/SPK otomatik çekilmiyor), Bilal panelden elle giriyor.
CREATE TABLE IF NOT EXISTS takvim_etkinlikleri (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tarih TEXT NOT NULL, -- YYYY-MM-DD
	tur TEXT NOT NULL, -- 'temettu' | 'bedelsiz' | 'genel_kurul' | 'halka_arz' | 'spk_bulten' | 'diger'
	hisse TEXT, -- isteğe bağlı (SPK bülteni gibi genel haberlerde boş olabilir)
	baslik TEXT NOT NULL,
	aciklama TEXT,
	kaynak_url TEXT,
	olusturulma TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_takvim_tarih ON takvim_etkinlikleri (tarih);
CREATE INDEX IF NOT EXISTS idx_takvim_tur ON takvim_etkinlikleri (tur);
