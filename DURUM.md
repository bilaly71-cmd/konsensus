# DURUM — otonom çalışma günlüğü

Bu dosya, otonom modda alınan kararların gerekçelerini ve Bilal'le teyit edilmesi gereken varsayımları tutar. `CLAUDE.md`'deki "Durum" bölümü yol haritası özetidir; burası daha ayrıntılı karar günlüğüdür.

Başlangıç: 27.09.2026, Bilal'in "tamamen otonom çalış" talimatıyla.

## Yapılacaklar sırası (Bilal'in verdiği sıra)
1. [x] Teminat simülatörünü gerçek derinliğe getir (A/B/C grup, açığa satış, üç depo)
2. [x] Grafik tamamlama oyunu — sentetik desen üretimi (OBO, TOBO, çift tepe/dip, üçgenler, bayrak)
3. [x] Hisse önerileri veri girişi — akıllı ayrıştırma (serbest metinden otomatik alan çıkarma)
4. [ ] Öneri Merkezi + hisse sayfalarını 3'teki veri yapısına tam bağla
5. [~] Eksik/yüzeysel kalan her şeyi gözden geçir, derinleştir (sürüyor)
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

### 3. Panel — akıllı ayrıştırma (27.09.2026)
- `src/lib/ayristir.ts`: hiçbir veri otomatik çekilmiyor (öyle bir kaynak yok) — Bilal bülteni yapıştırıyor, sistem heuristik (kural tabanlı, yapay zekâ değil) regex'lerle kurum/hisse/tür/giriş/hedef/stop/potansiyel alanlarını çıkarmaya çalışıyor.
- Önce yapılandırılmış format denenir (tab/`|`/`;` ile ayrılmış tek satır — Excel'den kopyala-yapıştır), o tutmazsa serbest metin sezgisel çıkarımına geçilir. İkisi de aynı "Bülteni yapıştır" kutusundan çalışır, Bilal hangi formatta yapıştırdığını düşünmek zorunda değil.
- Panel artık **3 katmanlı**: (1) bülten yapıştır + akıllı ayrıştır (birincil yöntem), (2) katlanır "tek tek ekle" formu (istisnai/tek satır durumlar için), (3) düzenlenebilir önizleme tablosu — her hücre doğrudan tıklanıp düzeltilebiliyor (eskiden sadece "satırı sil, formdan yeniden ekle" vardı, artık hatalı bir hücreyi tek tıkla düzeltmek yeterli). Her satırın başında bir güven rozeti (✓ yüksek / ? orta / ! düşük) var, kaç alanın güvenle bulunduğunu gösteriyor.
- Gerçek örnek cümlelerle test edildi (bkz. konuşma günlüğü): "Garanti BBVA Yatırım: THYAO hissesi için 330 TL girişle 365 TL hedef, 310 TL stop", "Deniz Yatırım THYAO Model portföy hedef 390 TL potansiyel %18,2", "Şeker Yatırım: SISE hissesi için haftalık işlemde 45 TL giriş, 50 TL hedef" — üçü de tüm alanları doğru çıkardı. Test sırasında 3 gerçek hata bulundu ve düzeltildi: (a) kurum adı içindeki kısaltma ("BBVA") hisse kodu sanılıyordu, (b) "330 TL girişle 365 TL hedef" gibi cümlelerde giriş değeri yanlışlıkla hedefin sayısını alıyordu, (c) kurum adı olmayan bir ":" (ör. "hedef: 120") kurum ayracı sanılıyordu.
- Ana sayfa, `/oneriler` ve `/hisse/[kod]` zaten Adım 3-5'te D1'e bağlanmıştı; bu değişiklikle veri girişi kolaylaştı ama okuma tarafında değişiklik gerekmedi (Görev 4 zaten karşılanmış durumda, ayrıca doğrulandı).

### 4. Görev 4 doğrulaması + Görev 5 (gözden geçirme) (27.09.2026)
- Görev 4 (Öneri Merkezi + hisse sayfalarının veri yapısına bağlanması) önceki oturumda zaten yapılmıştı; kod taraması ile doğrulandı, ek iş gerekmedi.
- Gözden geçirmede bulunan yüzeysel nokta: ana sayfadaki "Hedefi yükselen" / "Hedefi düşen" KPI'ları hep "—" gösteriyordu ("yakında" notuyla bırakılmıştı). Şimdi gerçek: `hedefRevizyonlariHesapla` aynı kurumun aynı hisse için önceki tarihli girişiyle bugünkü girişini karşılaştırıyor, farkı buluyor. Ana sayfaya ayrıca yeni bir "Hedef revizyonları" kartı eklendi (tasarım mockup'ında vardı, siteye hiç eklenmemişti) — yükselen/düşen oku, eski→yeni hedef, ilgili hisse sayfasına link.
- Gerçek veriyle uçtan uca test edildi (iki farklı tarihte aynı kurum+hisse için hedef girildi, KPI ve kart doğru güncellendi, test verisi temizlendi).
- Devam eden gözden geçirme: sırada ana sayfadaki "Şirket haberleri"/"Piyasa haberleri" kutularının hâlâ statik örnek metin olması var — bunu Görev 6 sonrası, zaman kalırsa ele alacağım (aynı panel-yapıştır-kaydet deseniyle çözülebilir ama görev listesinde açıkça istenmedi, önceliklendirmedim).

## Bilal'le teyit edilecekler

- **Teminat simülatörü grup yüzdeleri (öncelikli):** A/B/C/D grupları ve %90/70/50/0 haircut + %50/60/75/100 başlangıç + %35/40/50/100 sürdürme rakamları genel/tipik varsayımdır, gerçek BIST duyurusu veya Bilal'in kullandığı aracı kurumun tam listesiyle karşılaştırılmadı. Kendi kurumunun "kredili işleme kabul edilen paylar ve teminat oranları" listesi varsa (genelde kurumun web sitesinde PDF olarak yayınlanır), bana verirse rakamları gerçeğe göre güncellerim.
- Açığa satışın başlangıç/sürdürme oranları (%50/%35) da aynı şekilde tipik varsayım, teyit edilebilir.

## Hata çıkma ihtimali olan yerler

- **Teminat simülatörü — ikili arama (binary search) eşik bulma:** `esikDegisimBul` ve `acikPozisyonEsikBul` fonksiyonları 40 iterasyonluk ikili arama kullanıyor; matematiksel olarak sağlam ama arama aralığı sınırlı (-95%/+30% kredili, 0%/+300% açığa satış). Aşırı uç senaryolarda (çok büyük kredi/çok küçük teminat) "çok büyük düşüşte bile çağrı gelmiyor" mesajı yanlış çıkabilir — sınır değerlerde tekrar test edilmeli.
- **Grafik oyunu — desen üretiminin görsel netliği:** Gürültü (noise) parametreleri elle ayarlandı; bazı üretimlerde desen biraz belirsiz/gürültülü çıkabilir (ör. bayrak deseninin "direk" kısmı bazen çok kısa kalabilir). Kullanıcı testinde "bu grafik desene hiç benzemiyor" hissi oluşursa `src/lib/desenler.ts`'deki genlik/nokta sayıları ayarlanmalı. Fonksiyonel olarak (kesme, tahmin, puanlama, sicil) hepsi çalışıyor; sadece "görsel gerçekçilik" öznel ve iyileştirilebilir.
- **Grafik oyunu — sicil verisi herkese açık ve kimliksiz:** `/api/oyun` şu an kimlik doğrulama yapmıyor, herkes sonuç POST edebilir (oyunun doğası gereği anonim skor kaydı bu şekilde çalışır, ama teorik olarak biri API'ye doğrudan sahte "doğru" sonuçlar gönderebilir). Düşük risk (sadece eğlence/istatistik amaçlı, gerçek para/işlem yok) ama bilinmesi gereken bir açık.
- **Panel akıllı ayrıştırma — bitişik iki sayı belirsizliği:** "hedef: 120,50 stop: 95" gibi İKİ alan-değer çiftinin birbirine bitişik yazıldığı cümlelerde (aralarında başka kelime olmadan), ikinci sayı bazen yanlış alana atanabiliyor (test örneğinde "stop" yanlışlıkla "hedef"in değerini aldı, doğrusu düzenlenebilir tablodan tek tıkla düzeltildi). Kök sebep: "sayı hemen öncesinde/sonrasında" yakınlık sezgisiyle çalışıyor, cümle dilbilgisini anlamıyor. Kalıcı çözüm gerçek bir dil modeli (LLM) ile ayrıştırma olurdu ama bu proje kapsamında (statik site + D1, sunucu tarafı AI çağrısı yok) tercih edilmedi — mevcut haliyle "çoğu satırı doğru çıkarır, geri kalanı 5 saniyede elle düzeltirsin" seviyesinde, ki zaten hedeflenen buydu.
- **Panel akıllı ayrıştırma — kurum/hisse tespiti genel olarak sezgiseldir:** Regex tabanlı olduğu için alışılmadık cümle yapılarında (kısaltma kullanımı, farklı sıralama) yanlış veya boş çıkabilir. Güven rozeti (✓/?/!) bunu görünür kılıyor ama garanti değil — Bilal'in ilk birkaç bülteni yapıştırdığında sonuçları dikkatlice kontrol etmesi, tuhaf durumlar görürse bana örnek metni iletmesi kalıcı iyileştirme için değerli olur.
