// Serbest metinden (kurum bülteni, e-posta, WhatsApp mesajı vb.) öneri
// alanlarını olabildiğince otomatik çıkarır. Hiçbir kaynaktan otomatik veri
// çekilmiyor — Bilal bülteni buraya yapıştırıyor, sistem alanlara ayırmaya
// ÇALIŞIYOR, kesin doğruluk garanti etmiyor (onay ekranında düzeltilebilir).

export type TaslakSatir = {
	kurum: string;
	hisse: string;
	tur: string;
	giris: string;
	hedef: string;
	stop: string;
	potansiyel: string;
	guvenSkoru: number; // 0-3: kaç alan güvenle bulundu (kurum, hisse, hedef sayılır)
};

const HARIC_TUTULAN_KISALTMALAR = new Set([
	'TL',
	'BIST',
	'KAP',
	'SPK',
	'VOB',
	'ABD',
	'AVM',
	'GYO',
	'VS',
	'VE',
	'İLE',
	'ADET',
	'LOT',
	'KKTC',
	'TCMB',
	'FED',
	'ECB',
	'CDS',
	'GSYH',
]);

// Not: bare "Portföy" kasıtlı olarak yok — "Model portföy" (öneri türü) ile
// karışıyordu. Kurum isimlerinde daha çok "Portföy Yönetimi" şeklinde geçer.
const KURUM_SONEKLERI = /(Yatırım|Menkul Değerler|Menkul Kıymetler|Portföy Yönetimi|Bank|Invest|Securities)/i;

function hisseKoduBul(metin: string, haricMetin = ''): string {
	const adaylar = metin.match(/\b[A-ZÇĞİÖŞÜ]{4,6}\b/g) ?? [];
	for (const aday of adaylar) {
		if (HARIC_TUTULAN_KISALTMALAR.has(aday)) continue;
		if (haricMetin && haricMetin.includes(aday)) continue; // kurum adının parçasıysa (ör. "BBVA") atla
		return aday;
	}
	return '';
}

// Metnin en başındaki, ":" ile biten kısa bölüm (yaygın bülten formatı:
// "Kurum Adı: ..."). Bulunamazsa boş döner.
const ALAN_ETIKETI_DESENI = /hedef|giri[şs]|stop|potansiyel/i;

function kurumIkiNoktaOncesi(metin: string): string {
	const ikiNoktaIndex = metin.indexOf(':');
	if (ikiNoktaIndex > 0 && ikiNoktaIndex < 60) {
		const aday = metin.slice(0, ikiNoktaIndex).trim();
		// ":" bir kurum ayracı değil de "hedef:"/"stop:" gibi bir alan etiketiyse
		// (metnin ortasında bu etiketlerden biri geçiyorsa) bunu kurum sayma.
		if (aday.split(/\s+/).length <= 6 && !ALAN_ETIKETI_DESENI.test(aday)) return aday;
	}
	return '';
}

// "... Yatırım/Menkul Değerler/Bank" gibi bilinen soneklerle biten öbeği,
// verilen metin parçası içinde arar (parça genelde hisse kodundan ÖNCEki kısım).
function kurumSonekIle(metinParcasi: string): string {
	const sonekEslesme = metinParcasi.match(
		new RegExp(`([A-ZÇĞİÖŞÜ][\\wçğıöşüÇĞİÖŞÜ]*(?:\\s+[A-ZÇĞİÖŞÜ][\\wçğıöşüÇĞİÖŞÜ]*){0,3}\\s+${KURUM_SONEKLERI.source})`, 'i'),
	);
	return sonekEslesme ? sonekEslesme[1].trim() : '';
}

function turBul(metin: string): string {
	const kucuk = metin.toLowerCase();
	if (kucuk.includes('model portföy')) return 'Model portföy';
	if (kucuk.includes('takip listesi')) return 'Takip listesi';
	if (kucuk.includes('haftalık')) return 'Haftalık';
	if (kucuk.includes('günlük')) return 'Günlük';
	return '';
}

// Bir anahtar kelimenin (giriş/hedef/stop) önünde veya arkasında geçen sayıyı bulur.
// Türkçe bülten metinlerinde sayı genelde kelimeden ÖNCE gelir ("330 TL girişle"),
// bu yüzden önce o yön denenir. Kelime-sonra-sayı ("Hedef: 365") sadece açık bir
// ":" veya "-" ayracıyla kabul edilir — aksi halde başka bir alana ait, sonradan
// geçen bir sayıyı yanlışlıkla yakalama riski var.
function sayiBul(metin: string, anahtarKok: string): string {
	const sayiDeseni = '([\\d]{1,3}(?:[.,]\\d{1,3})*)';

	// "365 TL hedef", "365 hedef" (öncelikli — Türkçe'de en yaygın sıralama)
	const geri = new RegExp(`${sayiDeseni}\\s*(?:tl|₺)?\\s*${anahtarKok}\\w*`, 'i');
	const geriEslesme = metin.match(geri);
	if (geriEslesme) return normalleştirSayi(geriEslesme[1]);

	// "hedef: 365", "hedef fiyatı 365", "hedef 390 TL" — geri sırası zaten
	// denenip başarısız olduysa (öncelik ondaydı), burada ayraç şart değil.
	const ileri = new RegExp(`${anahtarKok}\\w*\\s*(?:fiyat[ıi]?)?\\s*[:\\-]?\\s*(?:tl|₺)?\\s*${sayiDeseni}`, 'i');
	const ileriEslesme = metin.match(ileri);
	if (ileriEslesme) return normalleştirSayi(ileriEslesme[1]);

	return '';
}

function normalleştirSayi(deger: string): string {
	// "1.234,56" -> "1234,56" gibi göstermek yerine, kullanıcı ne yazdıysa
	// (TL formatında) onu bırakıyoruz — sadece baştaki/sondaki noktalama temizleniyor.
	return deger.trim();
}

function potansiyelBul(metin: string): string {
	const eslesme = metin.match(/([+-]?\s*%\s*[\d]{1,3}(?:[.,]\d{1,2})?)/);
	if (eslesme) return eslesme[1].replace(/\s+/g, '');
	const eslesme2 = metin.match(/(artış potansiyeli|potansiyel)[^%\d]{0,10}%?\s*([\d]{1,3}(?:[.,]\d{1,2})?)/i);
	if (eslesme2) return `+%${eslesme2[2]}`;
	return '';
}

// Yapılandırılmış (tab/`|`/`;` ile ayrılmış) tek satır olup olmadığını kontrol
// eder; öyleyse hızlı ve güvenilir şekilde alanlara böler.
function yapilandirilmisSatirDeneme(satir: string): TaslakSatir | null {
	let parcalar: string[] | null = null;
	if (satir.includes('\t')) parcalar = satir.split('\t');
	else if (satir.includes('|')) parcalar = satir.split('|');
	else if ((satir.match(/;/g) || []).length >= 3) parcalar = satir.split(';');
	if (!parcalar || parcalar.length < 3) return null;

	parcalar = parcalar.map((p) => p.trim());
	const [kurum = '', hisse = '', tur = '', giris = '', hedef = '', stop = '', potansiyel = ''] = parcalar;
	if (!kurum || !hisse) return null;
	return {
		kurum,
		hisse: hisse.toUpperCase(),
		tur: tur || 'Günlük',
		giris,
		hedef,
		stop,
		potansiyel,
		guvenSkoru: 3,
	};
}

function serbestMetinAyristir(blok: string): TaslakSatir {
	// 1) Önce ":" formatını dene (en güvenilir, en yaygın).
	let kurum = kurumIkiNoktaOncesi(blok);

	// 2) Hisse kodunu, kurum adının İÇİNDE geçebilecek (ör. "BBVA") kısaltmaları
	//    hariç tutarak ara.
	const hisse = hisseKoduBul(blok, kurum);

	// 3) ":" formatı yoksa, kurum adını hisse kodundan ÖNCEki metinde ara —
	//    böylece "Deniz Yatırım THYAO Model portföy..." gibi noktalamasız
	//    cümlelerde hisse kodundan sonrasını (tür, hedef vb.) kuruma katmayız.
	if (!kurum) {
		const hisseIndex = hisse ? blok.indexOf(hisse) : -1;
		const oncesi = hisseIndex > 0 ? blok.slice(0, hisseIndex) : blok;
		kurum = kurumSonekIle(oncesi) || kurumSonekIle(blok);
	}

	const tur = turBul(blok);
	const giris = sayiBul(blok, 'giri[şs]');
	const hedef = sayiBul(blok, 'hedef');
	const stop = sayiBul(blok, 'stop');
	const potansiyel = potansiyelBul(blok);

	let guvenSkoru = 0;
	if (kurum) guvenSkoru++;
	if (hisse) guvenSkoru++;
	if (hedef) guvenSkoru++;

	return { kurum, hisse, tur: tur || 'Günlük', giris, hedef, stop, potansiyel, guvenSkoru };
}

export function bulteniAyristir(metin: string): TaslakSatir[] {
	const temiz = metin.replace(/\r\n/g, '\n').trim();
	if (!temiz) return [];

	// Önce boş satırla ayrılmış bloklara böl; birden fazla blok yoksa
	// her satırı ayrı bir kayıt say.
	let bloklar = temiz
		.split(/\n\s*\n/)
		.map((b) => b.trim())
		.filter(Boolean);
	if (bloklar.length <= 1) {
		bloklar = temiz
			.split('\n')
			.map((b) => b.trim())
			.filter(Boolean);
	}

	return bloklar.map((blok) => {
		// Çok satırlı bir blok içindeki satırları tek boşlukla birleştirip
		// (regex aramaları için) tek satır tek blok denemesi de yap.
		const tekSatir = blok.split('\n').map((s) => s.trim()).join(' ');
		const yapilandirilmis = blok.split('\n').length === 1 ? yapilandirilmisSatirDeneme(blok) : null;
		if (yapilandirilmis) return yapilandirilmis;
		return serbestMetinAyristir(tekSatir);
	});
}
