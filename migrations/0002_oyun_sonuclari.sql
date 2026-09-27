-- Grafik tamamlama oyunu sonuçları (sicil sayfası için)
CREATE TABLE IF NOT EXISTS oyun_sonuclari (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	desen TEXT NOT NULL,
	tahmin TEXT NOT NULL, -- 'yukselir' | 'duser'
	dogru_mu INTEGER NOT NULL, -- 1 doğru, 0 yanlış
	olusturulma TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_oyun_desen ON oyun_sonuclari (desen);
