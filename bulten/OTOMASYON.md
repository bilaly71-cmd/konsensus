# Sabah bülteni → siteye otomatik gönderim

Bülteni Bilal'in bilgisayarında çalışan "V10 Sabah Bülteni (06:30)" rutini üretir; siteye gitmesi için rutinin **son adımı** aşağıdaki gibi olmalı.

**Güncel prompt: `bulten/PROMPT-v4.md` (sosyal medya taramalı, TESLİM 4. adım siteye gönderimi içerir).** Rutinin prompt'unu bununla değiştir. Aşağıdaki blok yalnızca eski v3 prompt'a eklemek içindir.

## (v3 için) Rutinin prompt'una eklenecek son bölüm

```
SON ADIM — SİTEYE GÖNDER
1. Bülteni, konsensus reposundaki JSON şemasına göre yaz. Şema: bulten/SEMA.md, tam örnek: src/data/bulten/2026-09-29.json (aynı anahtarlar, aynı yapı). Metinlerde **kalın** ve [[ESKİ tarih kaynak]] işaretlerini kullan.
2. Dosyayı konsensus klasöründe bulten/taslak-YYYY-AA-GG.json olarak kaydet (date alanı bugünün tarihi).
3. Konsensus klasöründe şunu çalıştır:  git pull origin main  ve sonra  npm run bulten:yayinla -- bulten/taslak-YYYY-AA-GG.json
4. Komut "HATALAR" listeliyorsa JSON'u düzelt ve 3. adımı tekrarla. "Yayınlandı" yazınca bitir. Site 1-2 dakikada güncellenir (/bulten).
```

## Gerekenler
- Bilal'in bilgisayarında konsensus reposunun klonu, `git push` yetkisi (GitHub'a giriş yapılmış) ve Node.js kurulu olmalı; rutin bu klasörde çalışmalı (ya da ilk adımda `cd` ile oraya geçmeli).
- Doğrulama: `npm run bulten:kontrol -- <dosya.json>` (sadece kontrol, yayınlamaz).
- Bir gün atlanırsa sayfa bir önceki bülteni gösterir; arşiv seçicisinden eski günler açılır.
