# Sabah bülteni → siteye otomatik gönderim

Bülteni Bilal'in bilgisayarında çalışan "V10 Sabah Bülteni (06:30)" rutini üretir; bu rutinin **ana/kaynak prompt'u** `C:\projeler\agent-reach\bulten_prompt.md` dosyasıdır. Rutin doğrudan o dosyayı okuyarak çalışır.

`bulten/PROMPT-v4.md` bu dosyanın **senkronize edilmiş bir kopyasıdır** (konsensus reposunda referans olarak durur). Prompt'ta bir değişiklik gerekiyorsa **önce `bulten_prompt.md`'ye yapılır, sonra `bulten/PROMPT-v4.md`'ye aynen kopyalanır** — tersi değil. `bulten_prompt.md`'nin TESLİM bölümünün 4. adımı ("SİTEYE GÖNDER") zaten aşağıdaki akışı içeriyor, ayrıca eklemeye gerek yok.

## Akış (özet, ayrıntı: bulten_prompt.md § 8.4)
1. Bülten yazıldıktan sonra konsensus reposuna geçilir (`C:\Users\bilal\kod\konsensus`), `git pull origin main` çalıştırılır.
2. Bülten, `bulten/SEMA.md` şemasına göre JSON'a çevrilip `bulten/taslak-YYYY-AA-GG.json` olarak kaydedilir.
3. `npm run bulten:kontrol -- bulten/taslak-YYYY-AA-GG.json` ile doğrulanır; "HATALAR" çıkarsa düzeltilip tekrar denenir.
4. `npm run bulten:yayinla -- bulten/taslak-YYYY-AA-GG.json` ile yayınlanır. "Yayınlandı" yazınca bitti — site 1-2 dakikada güncellenir (`/bulten`).

## Gerekenler
- Bilal'in bilgisayarında konsensus reposunun klonu (`C:\Users\bilal\kod\konsensus`), `git push` yetkisi (GitHub'a giriş yapılmış) ve Node.js kurulu olmalı.
- Doğrulama: `npm run bulten:kontrol -- <dosya.json>` (sadece kontrol, yayınlamaz).
- Bir gün atlanırsa sayfa bir önceki bülteni gösterir; arşiv seçicisinden eski günler açılır.
- `npm run bulten:yayinla` canlı siteye push yapar (production deploy) — otomatik/zamanlanmış çalıştırmada onay beklemeden ilerlenir, ama etkileşimli bir oturumda kullanıcıdan onay alınmalı.
