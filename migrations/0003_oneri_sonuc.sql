-- Öneri karnesi: her önerinin sonucu (gerçek fiyat verisi yok, Bilal panelden
-- elle işaretliyor — bkz. DURUM.md).
ALTER TABLE oneriler ADD COLUMN sonuc TEXT; -- NULL: bekliyor | 'hedef' | 'stop' | 'sure_doldu'
ALTER TABLE oneriler ADD COLUMN sonuc_tarihi TEXT; -- sonucun işaretlendiği tarih (YYYY-MM-DD)
