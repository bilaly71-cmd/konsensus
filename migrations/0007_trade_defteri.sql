-- Trade defteri (yalnızca Bilal'in kişisel kaydı). API ilk istekte tabloları kendisi de oluşturur (bkz. src/pages/api/trade.ts).
CREATE TABLE IF NOT EXISTS trade_kayitlari (
	id TEXT PRIMARY KEY,
	tarih TEXT NOT NULL,
	doc TEXT NOT NULL, -- trade JSON (görseller yalnızca id ile anılır)
	guncelleme TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS trade_gorseller (
	id TEXT PRIMARY KEY,
	veri TEXT NOT NULL, -- data URL (istemcide küçültülmüş JPEG)
	olusturulma TEXT NOT NULL DEFAULT (datetime('now'))
);
