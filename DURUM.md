# DURUM — otonom çalışma günlüğü

Bu dosya, otonom modda alınan kararların gerekçelerini ve Bilal'le teyit edilmesi gereken varsayımları tutar. `CLAUDE.md`'deki "Durum" bölümü yol haritası özetidir; burası daha ayrıntılı karar günlüğüdür.

Başlangıç: 27.09.2026, Bilal'in "tamamen otonom çalış" talimatıyla.

## Yapılacaklar sırası (Bilal'in verdiği sıra)
1. [x] Teminat simülatörünü gerçek derinliğe getir (A/B/C grup, açığa satış, üç depo)
2. [x] Grafik tamamlama oyunu — sentetik desen üretimi (OBO, TOBO, çift tepe/dip, üçgenler, bayrak)
3. [ ] Hisse önerileri veri girişi — akıllı ayrıştırma (serbest metinden otomatik alan çıkarma)
4. [ ] Öneri Merkezi + hisse sayfalarını 3'teki veri yapısına tam bağla
5. [ ] Eksik/yüzeysel kalan her şeyi gözden geçir, derinleştir
6. [ ] Bütçe kalırsa: Öneri Karnesi, Fon Akıllı Para, Takvim

## Kararlar ve gerekçeler

### 1. Teminat simülatörü — A/B/C/D grup mantığı (27.09.2026)
- `src/lib/teminat.ts`: BIST'te payların likidite/hacme göre gruplara ayrılıp her grubun farklı "teminata kabul oranı" (haircut), "başlangıç özkaynak oranı" ve "sürdürme/çağrı oranı" olduğu genel/tipik yapı modellendi. Gerçek BIST duyurularındaki grup listesi ve kurumların tam yüzdeleri elimde yok; A/B/C/D için makul, birbirinden farklı ve tutarlı örnek rakamlar seçildi (A: %90/%50/%35, B: %70/%60/%40, C: %50/%75/%50 + açığa satışa kapalı, D: tamamen kapalı).
- Üç depo mantığı (serbest/teminat/kredili) basitleştirilmiş bir modelle kuruldu: özkaynak = serbest depo + teminat deposu×haircut + kredili depo − kredi; oran = özkaynak / (serbest depo + toplam portföy değeri). Bu, SPK'nın gerçek formülüne yakın ama birebir aynı değil — gerçek formülde "nakit" ve "menkul kıymet cari değeri" ayrımı biraz farklı işleyebilir.
- Açığa satış için başlangıç %50 / sürdürme %35 tipik değerleri kullanıldı (SPK açığa satış tebliğinin genel uygulaması). Zarar yönü doğru kuruldu: fiyat yükselirse açığa satan zarar eder (uzun pozisyonun tersi).
- Sekmeli arayüz (Kredili alım / Açığa satış) ile iki ayrı hesap makinesi kuruldu, ikisi de kaydırıcı ile "kaç % de çağrı gelir" hesaplıyor (ikili arama / binary search ile, formülü tersine çözmek yerine — daha az hata riski, kolay doğrulanabilir).
- Test: A/B/C/D grup geçişleri, D grubu "kredili kapalı" uyarısı, açığa satış senaryosu — hepsi elle hesaplanıp doğrulandı (bkz. konuşma günlüğü), matematik tutarlı.

### 2. Grafik tamamlama oyunu (27.09.2026)
- `src/lib/desenler.ts`: 8 desen (OBO, TOBO, Çift Tepe, Çift Dip, Yükselen Üçgen, Alçalan Üçgen, Boğa Bayrağı, Ayı Bayrağı) — her biri geometrik olarak (kontrol noktaları + Box-Muller benzeri gürültü) üretiliyor. **Gerçek fiyat verisi kullanılmadı**, tamamen algoritmik/sentetik — sayfada ve verilerde açıkça belirtildi ("Sentetik veri" rozeti, açıklama metni, veritabanı tarafında da not).
- Grafik çizimi `lightweight-charts` (TradingView, npm'den resmi paket) ile yapıldı — CLAUDE.md'nin "grafikler Lightweight Charts + atıf zorunlu" kuralına uyuldu; kütüphanenin kendi TradingView logosu (sol alt) + ayrıca metin/link atfı eklendi.
- D1'e yeni tablo: `oyun_sonuclari` (migrations/0002). Her tahmin (doğru/yanlış, hangi desen) kaydediliyor, `/api/oyun` bunu okuyup "Herkesin sicili" bölümüne (toplam oyun, genel doğruluk, desen bazlı doğruluk) besliyor — bu, görevde istenen "sicil sayfası"nı ayrı bir rota yerine oyunun kendi sayfasında bir bölüm olarak karşılıyor (nav yapısı sabit, yeni menü öğesi eklemedim).
- Kişisel seri (streak) `localStorage`'da tutuluyor (tarayıcıya özel, oturumlar arası kalıcı); D1'deki sicil ise herkese açık/toplu.
- Uçtan uca canlıda test edildi: tahmin → çözüm çizgisi (kesikli gri) → doğru/yanlış mesajı → skor güncelleme → "Yeni oyun" → sicil API'sinin gerçek veriyle dolması. Mobilde grafik genişliğe düzgün oturuyor.

## Bilal'le teyit edilecekler

- **Teminat simülatörü grup yüzdeleri (öncelikli):** A/B/C/D grupları ve %90/70/50/0 haircut + %50/60/75/100 başlangıç + %35/40/50/100 sürdürme rakamları genel/tipik varsayımdır, gerçek BIST duyurusu veya Bilal'in kullandığı aracı kurumun tam listesiyle karşılaştırılmadı. Kendi kurumunun "kredili işleme kabul edilen paylar ve teminat oranları" listesi varsa (genelde kurumun web sitesinde PDF olarak yayınlanır), bana verirse rakamları gerçeğe göre güncellerim.
- Açığa satışın başlangıç/sürdürme oranları (%50/%35) da aynı şekilde tipik varsayım, teyit edilebilir.

## Hata çıkma ihtimali olan yerler

- **Teminat simülatörü — ikili arama (binary search) eşik bulma:** `esikDegisimBul` ve `acikPozisyonEsikBul` fonksiyonları 40 iterasyonluk ikili arama kullanıyor; matematiksel olarak sağlam ama arama aralığı sınırlı (-95%/+30% kredili, 0%/+300% açığa satış). Aşırı uç senaryolarda (çok büyük kredi/çok küçük teminat) "çok büyük düşüşte bile çağrı gelmiyor" mesajı yanlış çıkabilir — sınır değerlerde tekrar test edilmeli.
- **Grafik oyunu — desen üretiminin görsel netliği:** Gürültü (noise) parametreleri elle ayarlandı; bazı üretimlerde desen biraz belirsiz/gürültülü çıkabilir (ör. bayrak deseninin "direk" kısmı bazen çok kısa kalabilir). Kullanıcı testinde "bu grafik desene hiç benzemiyor" hissi oluşursa `src/lib/desenler.ts`'deki genlik/nokta sayıları ayarlanmalı. Fonksiyonel olarak (kesme, tahmin, puanlama, sicil) hepsi çalışıyor; sadece "görsel gerçekçilik" öznel ve iyileştirilebilir.
- **Grafik oyunu — sicil verisi herkese açık ve kimliksiz:** `/api/oyun` şu an kimlik doğrulama yapmıyor, herkes sonuç POST edebilir (oyunun doğası gereği anonim skor kaydı bu şekilde çalışır, ama teorik olarak biri API'ye doğrudan sahte "doğru" sonuçlar gönderebilir). Düşük risk (sadece eğlence/istatistik amaçlı, gerçek para/işlem yok) ama bilinmesi gereken bir açık.
