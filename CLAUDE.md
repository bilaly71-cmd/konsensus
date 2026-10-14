# Konsensüs — BIST öneri ve hedef fiyat platformu

Bu dosya projenin kalıcı talimatıdır. Her oturumun başında oku.

## Çalışma modu: otonom
Bilal'in 27.09.2026 talimatıyla yürürlükte. Bu bölüm, üstündeki/altındaki "parça parça ilerle, onay al" kurallarını geçersiz kılar — bu proje için otonom mod kalıcıdır, her oturum başında geçerli sayılır.

**Çalışma kuralları:**
- Bilal'e hiçbir onay sorulmaz. Tasarım, kütüphane, veri yapısı kararları kendi başına verilir, `DURUM.md`'ye kısa gerekçesiyle yazılır.
- Durmak için tek geçerli sebep: **ödeme gerektiren bir işlem** (kredi kartı, satın alma vb.) — bunun dışında hiçbir şey için durulmaz.
- Bir görev bitince otomatik olarak sıradakine geçilir. "Devam edeyim mi?" diye sorulmaz.
- Kural netleşmediğinde makul bir varsayım kullanılır, `DURUM.md`'ye "Bilal'le teyit edilecek" diye not düşülür, iş DURDURULMAZ.
- Kota/oturum limiti dolarsa `DURUM.md` güncellenip durulur; Bilal "devam et" dediğinde kaldığı yerden sürülür.
- İş bitince veya durunca Bilal'e şu dörtlü rapor verilir: (1) ne yapıldığı madde madde, (2) hangi varsayımların teyit edilmesi gerektiği, (3) hata çıkma ihtimali olan yerler, (4) telefonda/bilgisayarda tek tek denenecek gerçek test listesi.
- Karar günlüğü ve varsayımlar `DURUM.md`'de tutulur. Bu dosyadaki "Durum" yalnız kısa özet + teknik tuzaklardır; ayrıntı buraya YAZILMAZ (her oturumda yüklenir, token yer).

## Nasıl çalışıyoruz
- Sahibi: Bilal. Kodlama bilmiyor ama teknik kavramları hızlı kavrıyor. Türkçe, kısa ve net anlat.
- Bilal'in elle yapması gereken şeyi (tıklama, hesap açma vb.) numaralı adımlarla yaz.
- Her adım canlıda doğrulanır (build + sayfa açılıyor) ve commit/push edilir; onay beklenmez (bkz. otonom mod).
- Gizli bilgileri (token, şifre) asla koda yazma; Cloudflare/GitHub secret olarak girilecek.

## Teknik altyapı
- **Astro** (statik site üretici) + **Cloudflare Workers** (statik varlık + sunucu rotaları, ücretsiz). Portal (Kokpit) içinde `/konsensus` alt yolunda sunulur (`astro.config.mjs` → `base: '/konsensus'`); kök Worker `portal` service binding ile buraya yönlendirir.
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

## Durum (özet — ayrıntı ve tarihçe `DURUM.md`)
- Canlı: https://konsensus.bilaly71.workers.dev ve portal altında `/konsensus/*`. Git push → Workers Builds otomatik deploy.
- Yol haritası 0–5 tamam; ek modüller (teminat simülatörü, grafik oyunu, öneri karnesi, fon radar, takvim/halka arz/SPK, opsiyon lab, özkaynak planlayıcı, bülten) canlıda. Trade defteri ayrı repoya (`trade-journal`) paketlendi, sayfa burada da duruyor.
- Açık güvenlik notu: `/panel` ve yazma API'leri kimliksiz (Bilal onayladı; linki paylaşma).

### Teknik tuzaklar (bunları bilmeden kod yazma)
- Deploy: `npm run deploy` = `astro build && wrangler deploy -c dist/server/wrangler.json`; `wrangler.jsonc`'de `main` alanı YOK (Astro kendi wrangler.json'unu üretir).
- Astro v7: binding erişimi `import { env } from 'cloudflare:workers'` (bkz. `src/lib/db.ts`), `Astro.locals.runtime.env` DEĞİL.
- `compatibility_date` ileri tarihli olamaz (workerd sürümüne göre).
- Dinamik sayfalar `export const prerender = false`; geri kalan statik.
- Astro bileşenlerinde satır sonu boşluğu kaybolur: kelime aralarında `{' '}` kullan.
- Bileşenler ekstra HTML özelliklerini `{...rest}` ile geçirir (Buton.astro örneği).
- Windows'ta node PATH'te değilse: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.
