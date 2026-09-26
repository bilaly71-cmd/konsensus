# Konsensüs — BIST öneri ve hedef fiyat platformu

Bu dosya projenin kalıcı talimatıdır. Her oturumun başında oku.

## Nasıl çalışıyoruz
- Sahibi: Bilal. Kodlama bilmiyor ama teknik kavramları hızlı kavrıyor. Türkçe, kısa ve net anlat.
- Her adımda: ne yaptığını 2-3 cümleyle özetle, sonra Bilal'in yapması gereken şeyi (tıklama, hesap açma vb.) numaralı adımlarla yaz.
- **Parça parça ilerle.** Bir adım canlıda çalışmadan (site açıldı, telefonda denendi) sonrakine geçme.
- Büyük değişiklikten önce planı göster, onay al.
- Gizli bilgileri (token, şifre) asla koda yazma; Cloudflare/GitHub secret olarak girilecek.
- Her adımın sonunda bu dosyadaki "Durum" bölümünü güncelle.

## Teknik altyapı
- **Astro** (statik site üretici) + **Cloudflare Pages** (barındırma, ücretsiz).
- Veritabanı: **Cloudflare D1**. Zamanlanmış işler: Cloudflare Workers cron veya GitHub Actions.
- Grafikler: TradingView **Lightweight Charts** (açık kaynak; sitede TradingView atfı ve linki zorunlu).
- Fiyatlar 15 dk gecikmeli.
- Yönetim paneli (/panel) Cloudflare Access arkasında, sadece Bilal'in e-postası.
- Kod GitHub'da; Cloudflare her push'ta otomatik yayınlar (proje Cloudflare'in yeni birleşik "Workers & Pages" sisteminde bir Workers projesi olarak kuruldu, işlev Pages ile aynı: git bağlantısı, otomatik build/deploy).

## Tasarım sistemi ("gazete + terminal")
Referans ekranlar `tasarim/` klasöründe (Main = masaüstü ana sayfa, Hisse = hisse sayfası, Mobil = mobil). Bunlar bir tasarım aracının dosyaları; görünümü ve yerleşimi bunlardan al, kodu birebir kopyalama. İçlerindeki rakamlar örnek veridir.
- Zemin `#F4F2EC` (sıcak kâğıt), kart `#FFFFFF`, kenarlık `#E2DED3`
- Metin `#15171C`, ikincil metin `#5B5F68`
- Sol menü ve vurgu kartları `#11151F`
- Marka/etkileşim `#3438C9`, vurgu kehribar `#E9A23B`, etiket metni `#A15C07`
- Yükseliş `#0F7A4B`, düşüş `#B83227` — sadece yön anlatır, yanında ▲/▼ işareti
- Yazı tipleri: başlıklar **Fraunces** (serif), gövde **IBM Plex Sans**, hisse kodları **IBM Plex Mono**; rakamlar tabular-nums
- Kart köşeleri 14-16px, butonlar en az 44px yükseklik
- Mobil öncelikli: tablolar telefonda karta dönüşür, altta 5 sekmeli menü

## Sayfa yapısı
Sol menü grupları: PİYASA (Gösterge paneli, Öneriler, Hedef fiyatlar, Öneri karnesi) · AKILLI PARA (Fon radar, Takas ve AKD [PRO], Kripto balinalar) · TAKVİM (Takvim, Halka arz, SPK bülteni) · ARAÇLAR VE ARENA (Teminat simülatörü, Opsiyon lab, Grafik oyunu)

## Yol haritası (sırayla, her biri canlıda çalışınca sonraki)
0. Altyapı: GitHub repo, Astro iskeleti, Cloudflare Pages bağlantısı, domain. Ekranda tek "yakında" sayfası.
1. İskelet + tasarım sistemi: menü, üst bar, alt bilgi, ortak bileşenler (kart, tablo, rozet, buton, grafik kutusu), boş sayfalar.
2. Teminat simülatörü (veritabanı yok; kurallar Bilal'den gelecek).
3. D1 veritabanı + yönetim paneli: öneri listesi yapıştır → tabloya çevir → onayla → kaydet.
4. Öneri Merkezi (günün önerileri, konsensüs sayacı).
5. Hisse sayfaları + hedef fiyatlar (her hisse için otomatik sayfa).
Sonra: Öneri karnesi, Fon akıllı para, bülten + e-posta, halka arz, Arena, kripto, takvim.

## İçerik kuralları
- Öneriler kurumların kamuya açık raporlarından; her satırda kaynak kurum yazılır.
- Her sayfanın altında: "Burada yer alan bilgiler yatırım danışmanlığı kapsamında değildir. Fiyatlar 15 dakika gecikmelidir."
- Rakip sitelerden veri çekilmez.

## Durum
- [x] Adım 0 tamamlandı (27.09.2026): GitHub repo (bilaly71-cmd/konsensus), Astro iskeleti, "yakında" sayfası. Cloudflare'e bağlı, canlı: https://konsensus.bilaly71.workers.dev — masaüstü ve telefonda doğrulandı. Domain şimdilik ertelendi (Bilal isteği), workers.dev adresiyle devam.
- [x] Adım 1 tamamlandı (27.09.2026), telefonda doğrulandı: `src/layouts/AnaLayout.astro` (sol menü, üst bar, alt bilgi, mobil üst bar + 5 sekmeli alt menü + tam menü çekmecesi), `src/lib/menu.ts` (menü ve sekmeler tek yerde), `src/styles/tasarim.css` (renk/yazı değişkenleri), bileşenler `src/components/`: Kart, Rozet, Buton, Tablo (telefonda karta döner), GrafikKutusu (yer tutucu + TradingView atfı), SayfaBasligi, BosSayfa, Ikon. Menüdeki 13 sayfa boş iskelet olarak var. Bileşen vitrini: /bilesenler (menüde yok). Ana sayfaya ayrıca Bilal isteğiyle "Şirket haberleri" ve "Piyasa haberleri" kompakt kartları eklendi (gösterge panelinden önce, ekranı kaplamadan).
- [x] Adım 2 tamamlandı (27.09.2026): `/teminat-simulatoru` — Bilal "genel/tipik BIST kuralı" seçti. Tipik SPK oranları kullanıldı: başlangıç %50, sürdürme/çağrı %35 (sabitler dosyanın başında, kolayca değiştirilebilir). Portföy + kredi girilir, kaydırıcıyla fiyat senaryosu denenir, özkaynak oranı ve "kaç % düşerse çağrı gelir" canlı hesaplanır. Veritabanı yok, tamamen istemci tarafı JS.
- Not: Bu oturumda PATH'te node yok; komutlarda `$env:Path = "C:\Program Files\nodejs;" + $env:Path` kullanılıyor.
