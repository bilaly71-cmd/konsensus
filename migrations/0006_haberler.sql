-- Ana sayfadaki "Şirket haberleri" ve "Piyasa haberleri" kutuları için.
-- KAP/haber kaynağı otomatik çekilmiyor — Bilal panelden elle giriyor.
CREATE TABLE IF NOT EXISTS haberler (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	tur TEXT NOT NULL, -- 'sirket' | 'piyasa'
	hisse TEXT, -- 'sirket' türünde isteğe bağlı ilgili hisse
	baslik TEXT NOT NULL,
	kaynak_url TEXT,
	olusturulma TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_haberler_tur ON haberler (tur);
