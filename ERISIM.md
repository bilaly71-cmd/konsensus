# Konsensüs — Erişim Bilgileri

Bu dosya kalıcı başvuru içindir. **Gizli bilgi (token, şifre) içermez** ve içermemelidir.

## Bağlantılar

| Ne | Değer |
|---|---|
| GitHub repo | https://github.com/bilaly71-cmd/konsensus |
| Canlı site (Cloudflare Workers, workers.dev) | https://konsensus.bilaly71.workers.dev |
| Yönetim paneli | https://konsensus.bilaly71.workers.dev/panel |
| Bileşen vitrini | https://konsensus.bilaly71.workers.dev/bilesenler |
| Sitemap | https://konsensus.bilaly71.workers.dev/sitemap.xml |
| Domain | Yok (Bilal isteğiyle ertelendi) |

## Cloudflare

- Proje türü: Workers projesi (birleşik "Workers & Pages"), adı `konsensus`. Git push'ta otomatik build/deploy (Workers Builds).
- D1 veritabanı adı: `konsensus-db` (binding: `DB`)
- D1 veritabanı ID: `8187f9b0-a22a-4f0d-98de-bccca3708414` (gizli değil, `wrangler.jsonc`'de de yazıyor)
- Migrasyonlar: `migrations/` klasörü (0001–0006)
- Elle yayın: `npm run deploy` (`astro build && wrangler deploy -c dist/server/wrangler.json`)

## Güvenlik notu

- `/panel` **korumasız / herkese açık** (linki bilen girebilir). Cloudflare Access kart bilgisi istediği için ertelendi; alternatif: Cloudflare secret ile paylaşılan şifre. **Panel linkini paylaşma.**

## Yeni sohbet/proje için bağlam dosyaları

Repo kökündeki şu dosyaları oku: `CLAUDE.md` (kalıcı talimat, tasarım sistemi, yol haritası), `DURUM.md` (karar günlüğü, varsayımlar), `README.md`, `tasarim/` (referans ekranlar).
