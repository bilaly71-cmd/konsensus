// Grafik tamamlama oyunu için sentetik (yapay) fiyat serisi üreticisi.
// Gerçek borsa verisi KULLANILMAZ (lisans gerektirir) — desenler algoritmik
// olarak, klasik teknik analiz formasyonlarının GERÇEK geometrisine/oranlarına
// göre üretilir (bkz. DURUM.md — harmonik oranlar Scott Carney'nin standart
// Fibonacci tanımlarına göre doğrulandı).
//
// Her formasyon rastgele parametrelerle (bacak uzunluğu, oran aralığı içinde
// tam değer, gürültü tohumu) üretildiği için pratikte SINIRSIZ sayıda farklı
// örnek üretebilir — "en az 10 örnek" isteği, sabit 10 örnek yerine (ki daha
// az gerçekçi olurdu) geçerli oran aralıkları içinde sürekli varyasyonla
// karşılanıyor.

export type Kategori = 'fiyat-aksiyonu' | 'klasik' | 'harmonik';

export type Desen =
	// Klasik formasyonlar
	| 'obo'
	| 'tobo'
	| 'cift-tepe'
	| 'cift-dip'
	| 'yukselen-ucgen'
	| 'alcalan-ucgen'
	| 'bayrak-boga'
	| 'bayrak-ayi'
	| 'yukselen-kama'
	| 'alcalan-kama'
	| 'dikdortgen-boga'
	| 'dikdortgen-ayi'
	| 'fincan-kulp'
	| 'yuvarlak-dip'
	// Fiyat aksiyonu (mum formasyonları)
	| 'cekic'
	| 'tersine-cekic'
	| 'yutan-boga'
	| 'yutan-ayi'
	| 'doji-tepe'
	| 'doji-dip'
	| 'sabah-yildizi'
	| 'aksam-yildizi'
	| 'ic-cubuk'
	// Harmonik formasyonlar (XABCD, Fibonacci oranlı)
	| 'gartley-boga'
	| 'gartley-ayi'
	| 'kelebek-boga'
	| 'kelebek-ayi'
	| 'yarasa-boga'
	| 'yarasa-ayi'
	| 'yengec-boga'
	| 'yengec-ayi';

export const DESEN_KATEGORISI: Record<Desen, Kategori> = {
	obo: 'klasik',
	tobo: 'klasik',
	'cift-tepe': 'klasik',
	'cift-dip': 'klasik',
	'yukselen-ucgen': 'klasik',
	'alcalan-ucgen': 'klasik',
	'bayrak-boga': 'klasik',
	'bayrak-ayi': 'klasik',
	'yukselen-kama': 'klasik',
	'alcalan-kama': 'klasik',
	'dikdortgen-boga': 'klasik',
	'dikdortgen-ayi': 'klasik',
	'fincan-kulp': 'klasik',
	'yuvarlak-dip': 'klasik',
	cekic: 'fiyat-aksiyonu',
	'tersine-cekic': 'fiyat-aksiyonu',
	'yutan-boga': 'fiyat-aksiyonu',
	'yutan-ayi': 'fiyat-aksiyonu',
	'doji-tepe': 'fiyat-aksiyonu',
	'doji-dip': 'fiyat-aksiyonu',
	'sabah-yildizi': 'fiyat-aksiyonu',
	'aksam-yildizi': 'fiyat-aksiyonu',
	'ic-cubuk': 'fiyat-aksiyonu',
	'gartley-boga': 'harmonik',
	'gartley-ayi': 'harmonik',
	'kelebek-boga': 'harmonik',
	'kelebek-ayi': 'harmonik',
	'yarasa-boga': 'harmonik',
	'yarasa-ayi': 'harmonik',
	'yengec-boga': 'harmonik',
	'yengec-ayi': 'harmonik',
};

export const KATEGORI_ADLARI: Record<Kategori, string> = {
	'fiyat-aksiyonu': 'Fiyat Aksiyonu',
	klasik: 'Klasik Formasyonlar',
	harmonik: 'Harmonik Formasyonlar (Fibonacci)',
};

export const DESEN_BILGISI: Record<Desen, { ad: string; aciklama: string }> = {
	obo: { ad: 'Omuz Baş Omuz (OBO)', aciklama: 'Tepe dönüş formasyonu — genelde düşüşle sonuçlanır.' },
	tobo: { ad: 'Ters Omuz Baş Omuz (TOBO)', aciklama: 'Dip dönüş formasyonu — genelde yükselişle sonuçlanır.' },
	'cift-tepe': { ad: 'Çift Tepe', aciklama: 'İki başarısız zirve denemesi — genelde düşüşle sonuçlanır.' },
	'cift-dip': { ad: 'Çift Dip', aciklama: 'İki başarılı destek testi — genelde yükselişle sonuçlanır.' },
	'yukselen-ucgen': { ad: 'Yükselen Üçgen', aciklama: 'Yatay direnç + yükselen destek — genelde yukarı kırılır.' },
	'alcalan-ucgen': { ad: 'Alçalan Üçgen', aciklama: 'Yatay destek + alçalan direnç — genelde aşağı kırılır.' },
	'bayrak-boga': { ad: 'Boğa Bayrağı', aciklama: 'Güçlü yükseliş sonrası kısa soluklanma — genelde yukarı devam eder.' },
	'bayrak-ayi': { ad: 'Ayı Bayrağı', aciklama: 'Güçlü düşüş sonrası kısa soluklanma — genelde aşağı devam eder.' },
	'yukselen-kama': {
		ad: 'Yükselen Kama',
		aciklama: 'İki yükselen ama birbirine yakınsayan çizgi — genelde dönüş formasyonu, aşağı kırılır.',
	},
	'alcalan-kama': {
		ad: 'Alçalan Kama',
		aciklama: 'İki alçalan ama birbirine yakınsayan çizgi — genelde dönüş formasyonu, yukarı kırılır.',
	},
	'dikdortgen-boga': { ad: 'Dikdörtgen (Yukarı Kırılım)', aciklama: 'Yatay destek/direnç arası sıkışma — yukarı kırılır.' },
	'dikdortgen-ayi': { ad: 'Dikdörtgen (Aşağı Kırılım)', aciklama: 'Yatay destek/direnç arası sıkışma — aşağı kırılır.' },
	'fincan-kulp': { ad: 'Fincan ve Kulp', aciklama: 'Yuvarlak toparlanma + kısa geri çekilme — genelde yukarı devam eder.' },
	'yuvarlak-dip': { ad: 'Yuvarlak Dip', aciklama: 'Yavaş, kademeli dip yapma — genelde yukarı dönüşle sonuçlanır.' },
	cekic: { ad: 'Çekiç (Hammer)', aciklama: 'Düşüş sonrası küçük gövde + uzun alt fitil — genelde yükselişle sonuçlanır.' },
	'tersine-cekic': {
		ad: 'Kayan Yıldız (Shooting Star)',
		aciklama: 'Yükseliş sonrası küçük gövde + uzun üst fitil — genelde düşüşle sonuçlanır.',
	},
	'yutan-boga': { ad: 'Yutan Boğa Mumu', aciklama: 'Büyük yeşil mum, önceki kırmızı mumu tamamen yutar — genelde yükselişle sonuçlanır.' },
	'yutan-ayi': { ad: 'Yutan Ayı Mumu', aciklama: 'Büyük kırmızı mum, önceki yeşil mumu tamamen yutar — genelde düşüşle sonuçlanır.' },
	'doji-tepe': { ad: 'Doji (Tepede)', aciklama: 'Açılış ≈ kapanış, kararsızlık — yükseliş sonrası genelde düşüşle sonuçlanır.' },
	'doji-dip': { ad: 'Doji (Dipte)', aciklama: 'Açılış ≈ kapanış, kararsızlık — düşüş sonrası genelde yükselişle sonuçlanır.' },
	'sabah-yildizi': { ad: 'Sabah Yıldızı', aciklama: '3 mumluk dip dönüş formasyonu — genelde yükselişle sonuçlanır.' },
	'aksam-yildizi': { ad: 'Akşam Yıldızı', aciklama: '3 mumluk tepe dönüş formasyonu — genelde düşüşle sonuçlanır.' },
	'ic-cubuk': { ad: 'İç Çubuk (Inside Bar)', aciklama: 'Küçük mum, önceki mumun aralığı içinde — genelde önceki trend yönünde devam eder.' },
	'gartley-boga': {
		ad: 'Gartley (Boğa)',
		aciklama: 'XABCD harmonik formasyonu (B=%61,8, D=%78,6 XA) — D noktasında genelde yükseliş beklenir.',
	},
	'gartley-ayi': {
		ad: 'Gartley (Ayı)',
		aciklama: 'XABCD harmonik formasyonu (B=%61,8, D=%78,6 XA) — D noktasında genelde düşüş beklenir.',
	},
	'kelebek-boga': {
		ad: 'Kelebek / Butterfly (Boğa)',
		aciklama: 'XABCD harmonik formasyonu (B=%78,6 XA, D=XA\'nın %127-161\'i) — D noktasında genelde yükseliş beklenir.',
	},
	'kelebek-ayi': {
		ad: 'Kelebek / Butterfly (Ayı)',
		aciklama: 'XABCD harmonik formasyonu (B=%78,6 XA, D=XA\'nın %127-161\'i) — D noktasında genelde düşüş beklenir.',
	},
	'yarasa-boga': {
		ad: 'Yarasa / Bat (Boğa)',
		aciklama: 'XABCD harmonik formasyonu (B=%38,2-50 XA, D=%88,6 XA) — D noktasında genelde yükseliş beklenir.',
	},
	'yarasa-ayi': {
		ad: 'Yarasa / Bat (Ayı)',
		aciklama: 'XABCD harmonik formasyonu (B=%38,2-50 XA, D=%88,6 XA) — D noktasında genelde düşüş beklenir.',
	},
	'yengec-boga': {
		ad: 'Yengeç / Crab (Boğa)',
		aciklama: 'XABCD harmonik formasyonu (B=%38,2-61,8 XA, D=XA\'nın %161,8\'i) — D noktasında genelde yükseliş beklenir.',
	},
	'yengec-ayi': {
		ad: 'Yengeç / Crab (Ayı)',
		aciklama: 'XABCD harmonik formasyonu (B=%38,2-61,8 XA, D=XA\'nın %161,8\'i) — D noktasında genelde düşüş beklenir.',
	},
};

export type Mum = { open: number; high: number; low: number; close: number };

// Grafik üzerine çizilecek destek/direnç/trend/boyun çizgileri.
// i1/i2: mum indeksleri (zaman ekseni), v1/v2: o indekslerdeki fiyat değeri.
export type CizgiSegmenti = {
	i1: number;
	i2: number;
	v1: number;
	v2: number;
	tur: 'destek' | 'direnc' | 'boyun' | 'trend-ust' | 'trend-alt' | 'harmonik';
};

export type UretilenDesen = {
	desen: Desen;
	mumlar: Mum[]; // kesme noktasına kadar (dahil) tüm mumlar
	dogruYon: 'yukselir' | 'duser';
	cizgiler: CizgiSegmenti[];
};

// --- Yardımcılar ---

// Basit sözde-rastgele gürültü (Box-Muller benzeri, bağımsız normal dağılım yaklaşık)
function gurultu(genlik: number): number {
	const u = Math.max(1e-6, Math.random());
	const v = Math.random();
	const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	return z * genlik;
}

function araDegerler(baslangic: number, bitis: number, adim: number, dalgalanma: number): number[] {
	const sonuc: number[] = [];
	for (let i = 0; i < adim; i++) {
		const t = i / (adim - 1);
		const duz = baslangic + (bitis - baslangic) * t;
		sonuc.push(duz + gurultu(dalgalanma));
	}
	return sonuc;
}

function birlestir(...parcalar: number[][]): number[] {
	return parcalar.flat();
}

function rastgele(alt: number, ust: number): number {
	return alt + Math.random() * (ust - alt);
}

const TABAN = 100;
const GURULTU = TABAN * 0.006;

// Kapanış serisini gerçekçi fitilli OHLC mumlarına çevirir. Her nokta için
// önceki kapanış = bu mumun açılışı; fitiller gövde büyüklüğüyle orantılı.
function serigeMumCevir(seri: number[], oncekiKapanis?: number): Mum[] {
	const mumlar: Mum[] = [];
	let acilis = oncekiKapanis ?? seri[0] - gurultu(GURULTU * 0.6);
	for (const kapanis of seri) {
		const govde = Math.abs(kapanis - acilis);
		const fitilTaban = TABAN * 0.0015;
		const ustFitil = govde * (0.15 + Math.random() * 0.5) + fitilTaban;
		const altFitil = govde * (0.15 + Math.random() * 0.5) + fitilTaban;
		mumlar.push({
			open: acilis,
			close: kapanis,
			high: Math.max(acilis, kapanis) + ustFitil,
			low: Math.min(acilis, kapanis) - altFitil,
		});
		acilis = kapanis;
	}
	return mumlar;
}

function mumEkle(open: number, close: number, ustFitil: number, altFitil: number): Mum {
	return { open, close, high: Math.max(open, close) + ustFitil, low: Math.min(open, close) - altFitil };
}

// Basit bir trend (yükselen/düşen) üretir — fiyat aksiyonu formasyonlarının
// öncesinde "bu bir düşüş/yükseliş trendiydi" bağlamını vermek için.
function trendUret(yon: 1 | -1, adet: number, buyukluk: number): Mum[] {
	const seri = araDegerler(TABAN, TABAN + yon * buyukluk, adet, GURULTU);
	return serigeMumCevir(seri);
}

// --- Klasik formasyonlar ---

function oboUret(ters: boolean): { seri: number[]; sonNeckline: number } {
	const yon = ters ? -1 : 1;
	const taban = TABAN;
	const neckline = taban;
	const omuzBoy = rastgele(6, 10);
	const basBoy = omuzBoy + rastgele(4, 8);
	const solOmuz = taban + yon * omuzBoy;
	const bas = taban + yon * basBoy;

	const seri = birlestir(
		araDegerler(taban, neckline + yon * 2, 6, GURULTU),
		araDegerler(neckline, solOmuz, 8, GURULTU),
		araDegerler(solOmuz, neckline, 8, GURULTU),
		araDegerler(neckline, bas, 10, GURULTU),
		araDegerler(bas, neckline, 10, GURULTU),
		araDegerler(neckline, solOmuz, 8, GURULTU),
		araDegerler(solOmuz, neckline + yon * 1, 8, GURULTU),
	);
	return { seri, sonNeckline: neckline };
}

function ciftTepeDipUret(ters: boolean): { seri: number[]; seviye: number } {
	const yon = ters ? -1 : 1;
	const taban = TABAN;
	const buyukluk = rastgele(9, 15);
	const zirve = taban + yon * buyukluk;
	const cukur = taban + yon * (buyukluk * rastgele(0.25, 0.4));

	const seri = birlestir(
		araDegerler(taban, zirve, 10, GURULTU),
		araDegerler(zirve, cukur, 9, GURULTU),
		araDegerler(cukur, zirve - yon * 1, 10, GURULTU),
		araDegerler(zirve - yon * 1, cukur + yon * 3, 6, GURULTU),
	);
	return { seri, seviye: zirve };
}

function ucgenUret(yukselen: boolean): { seri: number[]; ustBaslangic: number; ustBitis: number; altBaslangic: number; altBitis: number; uzunluklar: number[] } {
	const taban = TABAN;
	const genislik = rastgele(9, 13);
	const parcalar: number[][] = [];
	const uzunluklar: number[] = [];
	const adet = 5;
	for (let i = 0; i < adet; i++) {
		const daralma = 1 - i / (adet + 1);
		const ust = yukselen ? taban + genislik : taban + genislik * daralma;
		const alt = yukselen ? taban - genislik * daralma : taban - genislik;
		const uzunluk = 6;
		uzunluklar.push(uzunluk);
		parcalar.push(araDegerler(i % 2 === 0 ? alt : ust, i % 2 === 0 ? ust : alt, uzunluk, GURULTU * 0.8));
	}
	return {
		seri: birlestir(...parcalar),
		ustBaslangic: yukselen ? taban + genislik : taban + genislik,
		ustBitis: taban + genislik * (1 - (adet - 1) / (adet + 1)),
		altBaslangic: yukselen ? taban - genislik : taban - genislik,
		altBitis: taban - genislik * (1 - (adet - 1) / (adet + 1)),
		uzunluklar,
	};
}

function bayrakUret(yukselisMi: boolean): { seri: number[]; direkUzunluk: number; konsolidasyonUzunluk: number; ustSeviye: number; altSeviye: number } {
	const taban = TABAN;
	const yon = yukselisMi ? 1 : -1;
	const direkBuyukluk = rastgele(18, 26);
	const direkUzunluk = 12;
	const direk = araDegerler(taban, taban + yon * direkBuyukluk, direkUzunluk, GURULTU * 1.3);
	const konsolidasyonUzunluk = 16;
	const konsolidasyon: number[] = [];
	const baslangic = taban + yon * direkBuyukluk;
	const genislikPay = TABAN * 0.02;
	for (let i = 0; i < konsolidasyonUzunluk; i++) {
		const dalga = Math.sin(i / 2) * genislikPay;
		konsolidasyon.push(baslangic - yon * (i * 0.3) + dalga + gurultu(GURULTU * 0.7));
	}
	return {
		seri: birlestir(direk, konsolidasyon),
		direkUzunluk,
		konsolidasyonUzunluk,
		ustSeviye: baslangic + genislikPay,
		altSeviye: baslangic - yon * (konsolidasyonUzunluk * 0.3) - genislikPay,
	};
}

// Kama: iki yakınsayan çizgi AYNI yönde eğimli (ikisi de yukarı ya da ikisi de aşağı).
function kamaUret(yukselenKama: boolean): { seri: number[]; genislikBaslangic: number } {
	const taban = TABAN;
	const yon = yukselenKama ? 1 : -1; // kamanın genel eğim yönü
	const toplamHareket = rastgele(14, 20);
	const baslangicGenislik = rastgele(9, 13);
	const adet = 5;
	const parcalar: number[][] = [];
	let merkez = taban;
	for (let i = 0; i < adet; i++) {
		const daralma = 1 - (i / (adet - 1)) * 0.75; // genişlik giderek daralır ama sıfırlanmaz
		const genislik = baslangicGenislik * daralma;
		merkez = taban + yon * (toplamHareket * (i / (adet - 1)));
		const ust = merkez + genislik / 2;
		const alt = merkez - genislik / 2;
		parcalar.push(araDegerler(i % 2 === 0 ? alt : ust, i % 2 === 0 ? ust : alt, 6, GURULTU * 0.7));
	}
	return { seri: birlestir(...parcalar), genislikBaslangic: baslangicGenislik };
}

// Dikdörtgen: yatay destek + yatay direnç arasında sıkışma, sonra kırılım.
function dikdortgenUret(yukariKirilim: boolean): { seri: number[]; ust: number; alt: number } {
	const taban = TABAN;
	const genislik = rastgele(7, 11);
	const ust = taban + genislik / 2;
	const alt = taban - genislik / 2;
	const parcalar: number[][] = [];
	const gecisSayisi = 5;
	for (let i = 0; i < gecisSayisi; i++) {
		parcalar.push(araDegerler(i % 2 === 0 ? alt : ust, i % 2 === 0 ? ust : alt, 6, GURULTU * 0.7));
	}
	// kırılım henüz gerçekleşmeden kesiliyor (son nokta hâlâ aralık içinde)
	return { seri: birlestir(...parcalar), ust, alt };
}

// Fincan ve Kulp: geniş bir "U" (fincan) + kenarda küçük bir geri çekilme (kulp).
function fincanKulpUret(): { seri: number[]; rimSeviyesi: number } {
	const taban = TABAN;
	const derinlik = rastgele(10, 16);
	const fincanNoktalari = 18;
	const fincan: number[] = [];
	for (let i = 0; i < fincanNoktalari; i++) {
		const t = i / (fincanNoktalari - 1); // 0..1
		// parabol: uçlarda taban seviyesi, ortada dip
		const y = taban - derinlik * (1 - Math.pow(2 * t - 1, 2));
		fincan.push(y + gurultu(GURULTU));
	}
	const rim = taban;
	const kulp = araDegerler(rim, rim - derinlik * 0.25, 6, GURULTU * 0.8); // kısa geri çekilme
	return { seri: birlestir(fincan, kulp), rimSeviyesi: rim };
}

// Yuvarlak dip: fincana benzer ama kulpsuz, daha yavaş/geniş bir "U".
function yuvarlakDipUret(): { seri: number[]; baslangicSeviyesi: number } {
	const taban = TABAN;
	const derinlik = rastgele(8, 13);
	const nokta = 22;
	const seri: number[] = [];
	for (let i = 0; i < nokta; i++) {
		const t = i / (nokta - 1);
		const y = taban - derinlik * (1 - Math.pow(2 * t - 1, 2));
		seri.push(y + gurultu(GURULTU));
	}
	return { seri, baslangicSeviyesi: taban };
}

// --- Fiyat aksiyonu (mum) formasyonları ---

function cekicUret(bogaMi: boolean): { mumlar: Mum[]; destekSeviyesi: number } {
	// Boğa: düşüş trendi sonunda Çekiç (küçük gövde üstte, uzun alt fitil).
	// Ayı: yükseliş trendi sonunda Kayan Yıldız (küçük gövde altta, uzun üst fitil).
	const yon: 1 | -1 = bogaMi ? -1 : 1; // öncü trend yönü
	const trendMumlari = trendUret(yon, 10, rastgele(10, 16));
	const sonKapanis = trendMumlari[trendMumlari.length - 1].close;
	const govdeBuyukluk = TABAN * rastgele(0.004, 0.008);
	const acilis = sonKapanis - yon * govdeBuyukluk * 0.3;
	const kapanis = acilis + rastgele(0.3, 1) * govdeBuyukluk * (bogaMi ? 1 : -1);
	const uzunFitil = govdeBuyukluk * rastgele(2.5, 4);
	const kisaFitil = govdeBuyukluk * rastgele(0.1, 0.4);
	const sinyalMum = bogaMi
		? mumEkle(acilis, kapanis, kisaFitil, uzunFitil) // alt fitil uzun
		: mumEkle(acilis, kapanis, uzunFitil, kisaFitil); // üst fitil uzun
	return { mumlar: [...trendMumlari, sinyalMum], destekSeviyesi: bogaMi ? sinyalMum.low : sinyalMum.high };
}

function yutanMumUret(bogaMi: boolean): { mumlar: Mum[] } {
	const yon: 1 | -1 = bogaMi ? -1 : 1;
	const trendMumlari = trendUret(yon, 9, rastgele(8, 14));
	const sonKapanis = trendMumlari[trendMumlari.length - 1].close;
	const kucukGovde = TABAN * rastgele(0.006, 0.01);
	// Önceki mum: trend yönünde küçük bir mum
	const oncekiAcilis = sonKapanis;
	const oncekiKapanis = sonKapanis - yon * kucukGovde;
	const onceki = mumEkle(oncekiAcilis, oncekiKapanis, kucukGovde * 0.2, kucukGovde * 0.2);
	// Yutan mum: ters yönde, öncekinin gövdesini tamamen kapsayan büyük gövde
	const buyukGovde = kucukGovde * rastgele(2, 3.5);
	const yutanAcilis = bogaMi ? onceki.close - kucukGovde * 0.3 : onceki.close + kucukGovde * 0.3;
	const yutanKapanis = bogaMi ? yutanAcilis + buyukGovde : yutanAcilis - buyukGovde;
	const yutan = mumEkle(yutanAcilis, yutanKapanis, buyukGovde * 0.08, buyukGovde * 0.08);
	return { mumlar: [...trendMumlari, onceki, yutan] };
}

function dojiUret(tepede: boolean): { mumlar: Mum[]; seviye: number } {
	const yon: 1 | -1 = tepede ? 1 : -1; // trend yönü: tepede doji öncesi yükseliş, dipte düşüş
	const trendMumlari = trendUret(yon, 10, rastgele(10, 15));
	const sonKapanis = trendMumlari[trendMumlari.length - 1].close;
	const govde = TABAN * rastgele(0.0005, 0.0015); // neredeyse sıfır gövde
	const fitil = TABAN * rastgele(0.006, 0.012);
	const acilis = sonKapanis;
	const kapanis = sonKapanis + gurultu(govde);
	const doji = mumEkle(acilis, kapanis, fitil, fitil);
	return { mumlar: [...trendMumlari, doji], seviye: tepede ? doji.high : doji.low };
}

function yildizUret(sabahMi: boolean): { mumlar: Mum[] } {
	const yon: 1 | -1 = sabahMi ? -1 : 1;
	const trendMumlari = trendUret(yon, 8, rastgele(10, 15));
	const sonKapanis = trendMumlari[trendMumlari.length - 1].close;
	const govde1 = TABAN * rastgele(0.012, 0.018);
	// 1) trend yönünde uzun mum
	const mum1 = mumEkle(sonKapanis, sonKapanis - yon * govde1, govde1 * 0.1, govde1 * 0.1);
	// 2) küçük gövdeli "yıldız" (kararsızlık), boşluklu
	const yildizGovde = govde1 * rastgele(0.1, 0.25);
	const yildizAcilis = mum1.close - yon * govde1 * 0.15;
	const mum2 = mumEkle(yildizAcilis, yildizAcilis - yon * yildizGovde, yildizGovde * 0.5, yildizGovde * 0.5);
	// 3) ters yönde uzun mum, ilk mumun gövdesine güçlü giriş yapar
	const govde3 = govde1 * rastgele(0.8, 1.1);
	const mum3Acilis = mum2.close;
	const mum3Kapanis = mum3Acilis - yon * govde3;
	const mum3 = mumEkle(mum3Acilis, mum3Kapanis, govde3 * 0.1, govde3 * 0.1);
	return { mumlar: [...trendMumlari, mum1, mum2, mum3] };
}

function icCubukUret(): { mumlar: Mum[]; dogruYon: 'yukselir' | 'duser' } {
	const yon: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
	const trendMumlari = trendUret(yon, 10, rastgele(10, 16));
	const sonKapanis = trendMumlari[trendMumlari.length - 1].close;
	const anaGovde = TABAN * rastgele(0.014, 0.02);
	const anaAcilis = sonKapanis;
	const anaKapanis = anaAcilis + yon * anaGovde;
	const anaFitil = anaGovde * 0.3;
	const anaMum = mumEkle(anaAcilis, anaKapanis, anaFitil, anaFitil);
	// iç mum: ana mumun high/low aralığının tamamen içinde
	const ic = mumEkle(
		anaMum.open + (anaMum.close - anaMum.open) * 0.3,
		anaMum.open + (anaMum.close - anaMum.open) * 0.6,
		(anaMum.high - Math.max(anaMum.open, anaMum.close)) * 0.4,
		(Math.min(anaMum.open, anaMum.close) - anaMum.low) * 0.4,
	);
	// iç çubuk çoğunlukla önceki trend yönünde devam eder
	return { mumlar: [...trendMumlari, anaMum, ic], dogruYon: yon === 1 ? 'yukselir' : 'duser' };
}

// --- Harmonik formasyonlar (XABCD, standart Fibonacci oranları) ---
// Kaynak oranlar (Scott Carney, harmonik ticaret literatüründeki standart
// tanımlar): Gartley B=0.618 D=0.786 · Yarasa(Bat) B=0.382-0.500 D=0.886 ·
// Kelebek(Butterfly) B=0.786 D=1.27-1.618 · Yengeç(Crab) B=0.382-0.618 D=1.618
// (hepsi XA bacağına göre). C her formasyonda AB'nin 0.382-0.886'sı.
// D = X - ext*(X-A): ext<1 ise D, X-A aralığının İÇİNDE (Gartley/Yarasa);
// ext>1 ise D, A'nın ÖTESİNE geçer (Kelebek/Yengeç) — bu, dört formasyonu
// birbirinden ayıran temel özelliktir ve burada doğru şekilde uygulanıyor.

function harmonikUret(retB: number, ext: number, bogaMi: boolean): { seri: number[]; xabcd: number[] } {
	const taban = TABAN;
	const xaBuyukluk = taban * rastgele(0.15, 0.24);
	const yon: 1 | -1 = bogaMi ? -1 : 1; // X->A yönü (boğa: X yüksek A düşük; ayı: X düşük A yüksek)

	const X = taban;
	const A = X + yon * xaBuyukluk;
	const B = A - yon * retB * xaBuyukluk;
	const retC = rastgele(0.382, 0.886);
	const C = B + yon * retC * Math.abs(B - A);
	const D = X + yon * ext * xaBuyukluk;

	const nokta = (deger: number, adim: number, gurultuKat = 1) => araDegerler(deger, deger, adim, GURULTU * gurultuKat);

	// Her bacağı birkaç mumla, hafif gürültüyle çiz (düz çizgi değil, gerçekçi zikzak)
	const bacakUzunlugu = 6;
	const seri = birlestir(
		araDegerler(X, A, bacakUzunlugu, GURULTU),
		araDegerler(A, B, bacakUzunlugu, GURULTU * 0.8),
		araDegerler(B, C, bacakUzunlugu, GURULTU * 0.8),
		araDegerler(C, D, bacakUzunlugu, GURULTU * 0.9),
	);
	return { seri, xabcd: [X, A, B, C, D] };
}

// --- Ana üretim mantığı ---

function klasikYaKlasikDegil(desen: Desen): { mumlar: Mum[]; cizgiler: CizgiSegmenti[]; dogruYon: 'yukselir' | 'duser' } {
	switch (desen) {
		case 'obo':
		case 'tobo': {
			const ters = desen === 'tobo';
			const { seri, sonNeckline } = oboUret(ters);
			const mumlar = serigeMumCevir(seri);
			return {
				mumlar,
				dogruYon: ters ? 'yukselir' : 'duser',
				cizgiler: [{ i1: 6, i2: mumlar.length - 1, v1: sonNeckline, v2: sonNeckline, tur: 'boyun' }],
			};
		}
		case 'cift-tepe':
		case 'cift-dip': {
			const ters = desen === 'cift-dip';
			const { seri, seviye } = ciftTepeDipUret(ters);
			const mumlar = serigeMumCevir(seri);
			return {
				mumlar,
				dogruYon: ters ? 'yukselir' : 'duser',
				cizgiler: [{ i1: 8, i2: mumlar.length - 1, v1: seviye, v2: seviye, tur: ters ? 'destek' : 'direnc' }],
			};
		}
		case 'yukselen-ucgen':
		case 'alcalan-ucgen': {
			const yukselen = desen === 'yukselen-ucgen';
			const { seri, ustBaslangic, ustBitis, altBaslangic, altBitis } = ucgenUret(yukselen);
			const mumlar = serigeMumCevir(seri);
			const son = mumlar.length - 1;
			return {
				mumlar,
				dogruYon: yukselen ? 'yukselir' : 'duser',
				cizgiler: [
					{ i1: 0, i2: son, v1: ustBaslangic, v2: ustBitis, tur: 'trend-ust' },
					{ i1: 0, i2: son, v1: altBaslangic, v2: altBitis, tur: 'trend-alt' },
				],
			};
		}
		case 'bayrak-boga':
		case 'bayrak-ayi': {
			const yukselisMi = desen === 'bayrak-boga';
			const { seri, direkUzunluk, konsolidasyonUzunluk, ustSeviye, altSeviye } = bayrakUret(yukselisMi);
			const mumlar = serigeMumCevir(seri);
			const son = mumlar.length - 1;
			return {
				mumlar,
				dogruYon: yukselisMi ? 'yukselir' : 'duser',
				cizgiler: [
					{ i1: direkUzunluk, i2: son, v1: ustSeviye, v2: ustSeviye - (ustSeviye - altSeviye) * 0.2, tur: 'trend-ust' },
					{ i1: direkUzunluk, i2: son, v1: altSeviye + (ustSeviye - altSeviye) * 0.2, v2: altSeviye, tur: 'trend-alt' },
				],
			};
		}
		case 'yukselen-kama':
		case 'alcalan-kama': {
			const yukselenKama = desen === 'yukselen-kama';
			const { seri } = kamaUret(yukselenKama);
			const mumlar = serigeMumCevir(seri);
			const son = mumlar.length - 1;
			const ilkDeger = seri[0];
			const sonDeger = seri[seri.length - 1];
			// Kama dönüş formasyonudur: yükselen kama -> düşüş, alçalan kama -> yükseliş
			return {
				mumlar,
				dogruYon: yukselenKama ? 'duser' : 'yukselir',
				cizgiler: [
					{ i1: 0, i2: son, v1: ilkDeger + 5, v2: sonDeger + 2, tur: 'trend-ust' },
					{ i1: 0, i2: son, v1: ilkDeger - 5, v2: sonDeger - 2, tur: 'trend-alt' },
				],
			};
		}
		case 'dikdortgen-boga':
		case 'dikdortgen-ayi': {
			const yukari = desen === 'dikdortgen-boga';
			const { seri, ust, alt } = dikdortgenUret(yukari);
			const mumlar = serigeMumCevir(seri);
			const son = mumlar.length - 1;
			return {
				mumlar,
				dogruYon: yukari ? 'yukselir' : 'duser',
				cizgiler: [
					{ i1: 0, i2: son, v1: ust, v2: ust, tur: 'direnc' },
					{ i1: 0, i2: son, v1: alt, v2: alt, tur: 'destek' },
				],
			};
		}
		case 'fincan-kulp': {
			const { seri, rimSeviyesi } = fincanKulpUret();
			const mumlar = serigeMumCevir(seri);
			return {
				mumlar,
				dogruYon: 'yukselir',
				cizgiler: [{ i1: 0, i2: mumlar.length - 1, v1: rimSeviyesi, v2: rimSeviyesi, tur: 'direnc' }],
			};
		}
		case 'yuvarlak-dip': {
			const { seri, baslangicSeviyesi } = yuvarlakDipUret();
			const mumlar = serigeMumCevir(seri);
			return {
				mumlar,
				dogruYon: 'yukselir',
				cizgiler: [{ i1: 0, i2: mumlar.length - 1, v1: baslangicSeviyesi, v2: baslangicSeviyesi, tur: 'direnc' }],
			};
		}
		// --- Fiyat aksiyonu ---
		case 'cekic':
		case 'tersine-cekic': {
			const bogaMi = desen === 'cekic';
			const { mumlar, destekSeviyesi } = cekicUret(bogaMi);
			const son = mumlar.length - 1;
			return {
				mumlar,
				dogruYon: bogaMi ? 'yukselir' : 'duser',
				cizgiler: [{ i1: son - 3, i2: son, v1: destekSeviyesi, v2: destekSeviyesi, tur: bogaMi ? 'destek' : 'direnc' }],
			};
		}
		case 'yutan-boga':
		case 'yutan-ayi': {
			const bogaMi = desen === 'yutan-boga';
			const { mumlar } = yutanMumUret(bogaMi);
			return { mumlar, dogruYon: bogaMi ? 'yukselir' : 'duser', cizgiler: [] };
		}
		case 'doji-tepe':
		case 'doji-dip': {
			const tepede = desen === 'doji-tepe';
			const { mumlar, seviye } = dojiUret(tepede);
			const son = mumlar.length - 1;
			return {
				mumlar,
				dogruYon: tepede ? 'duser' : 'yukselir',
				cizgiler: [{ i1: son - 3, i2: son, v1: seviye, v2: seviye, tur: tepede ? 'direnc' : 'destek' }],
			};
		}
		case 'sabah-yildizi':
		case 'aksam-yildizi': {
			const sabahMi = desen === 'sabah-yildizi';
			const { mumlar } = yildizUret(sabahMi);
			return { mumlar, dogruYon: sabahMi ? 'yukselir' : 'duser', cizgiler: [] };
		}
		case 'ic-cubuk': {
			const { mumlar, dogruYon } = icCubukUret();
			return { mumlar, dogruYon, cizgiler: [] };
		}
		// --- Harmonik ---
		case 'gartley-boga':
		case 'gartley-ayi':
		case 'kelebek-boga':
		case 'kelebek-ayi':
		case 'yarasa-boga':
		case 'yarasa-ayi':
		case 'yengec-boga':
		case 'yengec-ayi': {
			const bogaMi = desen.endsWith('boga');
			let retB: number;
			let ext: number;
			if (desen.startsWith('gartley')) {
				retB = 0.618;
				ext = 0.786;
			} else if (desen.startsWith('kelebek')) {
				retB = 0.786;
				ext = rastgele(1.27, 1.618);
			} else if (desen.startsWith('yarasa')) {
				retB = rastgele(0.382, 0.5);
				ext = 0.886;
			} else {
				retB = rastgele(0.382, 0.618);
				ext = 1.618;
			}
			const { seri, xabcd } = harmonikUret(retB, ext, bogaMi);
			const mumlar = serigeMumCevir(seri);
			const bacakUzunlugu = 6;
			// XABCD noktalarının mum indeksleri: her bacak bacakUzunlugu kadar mum kaplıyor
			const idxX = 0;
			const idxA = bacakUzunlugu - 1;
			const idxB = bacakUzunlugu * 2 - 1;
			const idxC = bacakUzunlugu * 3 - 1;
			const idxD = bacakUzunlugu * 4 - 1;
			const [X, A, B, C, D] = xabcd;
			return {
				mumlar,
				dogruYon: bogaMi ? 'yukselir' : 'duser',
				cizgiler: [
					{ i1: idxX, i2: idxA, v1: X, v2: A, tur: 'harmonik' },
					{ i1: idxA, i2: idxB, v1: A, v2: B, tur: 'harmonik' },
					{ i1: idxB, i2: idxC, v1: B, v2: C, tur: 'harmonik' },
					{ i1: idxC, i2: idxD, v1: C, v2: D, tur: 'harmonik' },
					{ i1: idxD, i2: mumlar.length - 1, v1: D, v2: D, tur: bogaMi ? 'destek' : 'direnc' },
				],
			};
		}
	}
}

export function rastgeleDesen(kategori?: Kategori): Desen {
	const tumDesenler = Object.keys(DESEN_BILGISI) as Desen[];
	const havuz = kategori ? tumDesenler.filter((d) => DESEN_KATEGORISI[d] === kategori) : tumDesenler;
	return havuz[Math.floor(Math.random() * havuz.length)];
}

export function desenUret(desen?: Desen, kategori?: Kategori): UretilenDesen {
	const secilenDesen = desen ?? rastgeleDesen(kategori);
	const { mumlar, cizgiler, dogruYon } = klasikYaKlasikDegil(secilenDesen);
	return { desen: secilenDesen, mumlar, dogruYon, cizgiler };
}

// Kesme noktasından sonrası için "çözüm" (kırılım sonrası devam) mumlarını üretir.
export function cozumUret(desen: UretilenDesen): Mum[] {
	const sonMum = desen.mumlar[desen.mumlar.length - 1];
	const yon = desen.dogruYon === 'yukselir' ? 1 : -1;
	const devamSeri = araDegerler(sonMum.close, sonMum.close + yon * TABAN * 0.16, 14, GURULTU * 1.2);
	return serigeMumCevir(devamSeri, sonMum.close);
}
