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
- [x] Adım 3 tamamlandı (27.09.2026): D1 veritabanı (`konsensus-db`, binding `DB`) + `/panel` yönetim paneli. `migrations/0001_oneriler.sql` hem uzak hem yerel D1'e uygulandı. `/panel`: tarih seç → yapıştır (sekme/`|` ile ayrılmış satırlar) → "Tabloya çevir" ile önizleme → "Onayla ve kaydet" → `src/pages/api/oneriler.ts` (GET/POST/DELETE) ile D1'e yazar. Ana sayfa artık D1'den okuyor: "Bugünkü öneri" ve "Konsensüs hissesi" KPI'ları, "Günün konsensüsü" listesi ve "Bugünkü öneriler" tablosu gerçek veriyle doluyor. Canlıda uçtan uca test edildi (ekle + sil çalışıyor, veritabanı şu an temiz/boş).
  - Teknik notlar: `@astrojs/cloudflare` adaptörü + `wrangler.jsonc` (main alanı YOK — Astro build kendi `dist/server/wrangler.json`'ını üretiyor, deploy ondan yapılıyor: `npm run deploy` → `astro build && wrangler deploy -c dist/server/wrangler.json`). `compatibility_date` ileri tarihli olamıyor, workerd sürümüne göre ayarlandı. Astro v7'de binding erişimi `Astro.locals.runtime.env` DEĞİL, `import { env } from 'cloudflare:workers'` (bkz. `src/lib/db.ts`). `wrangler login` ile bu makinede Cloudflare'e kimlik doğrulandı (offline_access token, `~/.wrangler`'da durur).
  - Bulunan/düzeltilen hata: `Buton.astro` bileşeni `id` gibi ekstra HTML özelliklerini elemente aktarmıyordu (props'ları spread etmiyordu) — düzeltildi, artık `{...rest}` ile geçiyor.
- **Kritik, kasıtlı olarak ertelendi:** `/panel` şu an herkese açık (linki bilen girebilir). Cloudflare Zero Trust artık Access'i açmak için kart bilgisi istiyor (ücretsiz sınırda ücretsiz, ama kart isteniyor); Bilal kart ekranında durdu, henüz karar vermedi. İki seçenek konuşuldu: (a) basit paylaşılan şifre (kod içinde, Cloudflare secret — kart gerekmez), (b) Cloudflare Access (e-posta girişi, kart gerekir). Bilal "şimdilik hiçbiri" dedi. **Panel linkini kimseyle paylaşma** uyarısı verildi. Bir sonraki oturumda bu karara geri dönülmeli.
- Doğrulandı: Cloudflare'in git-push'ta otomatik derleme/dağıtım sistemi (Workers Builds) yeni yapıyla (adaptör + D1 + wrangler.jsonc main'siz) sorunsuz çalışıyor — ekstra dashboard ayarı gerekmedi.
- Panel UX düzeltmesi (27.09.2026): İlk tasarımda tek bir metin kutusuna ayraçla (tab/`|`/virgül) ayrılmış satır yapıştırma isteniyordu; Bilal tek boşlukla yazınca (ayraç kullanmadan) satır doğru bölünmüyordu ve bu "çalışmıyor" izlenimi verdi. Çözüm: `/panel` artık önce yedi ayrı kutulu bir form gösteriyor (Kurum, Hisse, Tür, Giriş, Hedef, Stop, Potansiyel + "Satır ekle"); toplu Excel/Sheets yapıştırma katlanır "isteğe bağlı" bölümde ikinci seçenek olarak duruyor. Bilal test etti, "çalışıyor, mükemmel" dedi ve kendi başına gerçek bir öneri ekledi (THYAO/garan).
- Bilal talimatı (27.09.2026): "Bundan sonrakiler için benden teyit isteme, sürekli yapmaya devam et limit bitene kadar." — kalan yol haritası adımları onay beklemeden art arda yapılıyor; her adım yine de canlıda test edilip commit/push ediliyor, sadece "devam edeyim mi" sorusu atlanıyor.
- [x] Adım 4 tamamlandı (27.09.2026): `/oneriler` artık gerçek Öneri Merkezi. `src/lib/oneriler.ts` ortak D1 sorgularını (tariheGoreOneriler, konsensusHesapla) barındırıyor, hem `/` hem `/oneriler` bunu kullanıyor. Özellikler: önceki/sonraki gün gezinme (`?tarih=YYYY-MM-DD`), özet KPI'lar (toplam öneri, kapsayan kurum, konsensüs hissesi), günün konsensüsü listesi, tür filtreleri (Tümü/Günlük/Haftalık/Model portföy/Takip listesi — istemci tarafı JS ile satır gizleme). Canlıda test edildi.
- [x] Adım 5 tamamlandı (27.09.2026): Hisse sayfaları + hedef fiyatlar.
  - `src/lib/oneriler.ts`'e eklendi: `tumOneriler`, `hisseyeGoreOneriler`, `sayiyaCevir` (Türkçe/İngilizce ondalık ayraçlarını sayıya çevirir, "[hedef]" gibi placeholder'larda null döner), `hisseleriOzetle` (hisse bazında kurum sayısı + en düşük/ortalama/en yüksek hedef).
  - `/hedef-fiyatlar`: tüm hisselerin listesi, her satır `/hisse/[kod]`'a bağlı.
  - `/hisse/[kod]` (dinamik rota, `getStaticPaths` yok — `prerender = false` ile istek anında D1'den okunuyor): grafik yer tutucu (GrafikKutusu — gerçek grafik/fiyat verisi yok, "yakında"), konsensüs KPI'ları, öneri türü dağılımı, kurum bazlı tam tablo. Hisse hiç önerilmemişse nazik boş durum gösteriyor (hataya düşmüyor, test edildi: `/hisse/ABCDE`).
  - Ana sayfa ve `/oneriler`'daki konsensüs satırları artık ilgili `/hisse/[kod]` sayfasına linkli. **Bilinen eksik:** `Tablo.astro` bileşeni (öneri tablolarında kullanılıyor) hücreleri link yapamıyor, o yüzden "Bugünkü öneriler" tablosundaki hisse kodları henüz tıklanamıyor — ileride Tablo'ya link desteği eklenebilir.
  - **Henüz yok (kapsam dışı bırakıldı):** Gerçek zamanlı/15dk gecikmeli fiyat verisi ve grafik — bunun için bir piyasa verisi kaynağı seçilmesi lazım, Bilal'e sorulmadı, roadmap'te ayrıca ele alınmalı.
