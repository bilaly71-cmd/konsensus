// Opsiyon stratejisi kâr/zarar hesaplayıcısı. Tamamen matematiksel — dış veri
// gerektirmez. Vade sonu (expiration) değerlemesi kullanılır (zaman değeri /
// Yunanlılar hesaba katılmaz, basit ve anlaşılır tutulur).

export type OpsiyonTuru = 'call' | 'put';
export type Yon = 'al' | 'sat'; // long | short

export type OpsiyonBacagi = {
	tur: OpsiyonTuru;
	yon: Yon;
	kullanimFiyati: number; // strike
	prim: number; // premium (birim başına)
	adet: number; // kontrat/lot adedi (çarpan)
};

// Tek bir bacağın, dayanak fiyatı S'de vade sonu kâr/zararı (birim başına × adet)
function bacakKarZarar(bacak: OpsiyonBacagi, S: number): number {
	const icsel = bacak.tur === 'call' ? Math.max(S - bacak.kullanimFiyati, 0) : Math.max(bacak.kullanimFiyati - S, 0);
	const birimKarZarar = bacak.yon === 'al' ? icsel - bacak.prim : bacak.prim - icsel;
	return birimKarZarar * bacak.adet;
}

export function toplamKarZarar(bacaklar: OpsiyonBacagi[], S: number): number {
	return bacaklar.reduce((toplam, b) => toplam + bacakKarZarar(b, S), 0);
}

export type StratejiSonucu = {
	noktalar: { S: number; karZarar: number }[];
	maksKar: number;
	maksZarar: number;
	ustSinirsizKar: boolean; // fiyat çok yükselirse kâr sınırsız artar mı
	ustSinirsizZarar: boolean; // fiyat çok yükselirse zarar sınırsız artar mı
	basabasNoktalari: number[];
};

export function stratejiHesapla(bacaklar: OpsiyonBacagi[], altSinir: number, ustSinir: number, adimSayisi = 200): StratejiSonucu {
	const noktalar: { S: number; karZarar: number }[] = [];
	const adim = (ustSinir - altSinir) / adimSayisi;
	for (let i = 0; i <= adimSayisi; i++) {
		const S = altSinir + i * adim;
		noktalar.push({ S, karZarar: toplamKarZarar(bacaklar, S) });
	}

	const degerler = noktalar.map((n) => n.karZarar);
	const maksKar = Math.max(...degerler);
	const maksZarar = Math.min(...degerler);

	// Sağ uçtaki eğim: fiyat artmaya devam ederse kâr/zarar sınırsız mı büyüyor?
	const sonEgim = noktalar[noktalar.length - 1].karZarar - noktalar[noktalar.length - 2].karZarar;
	const ustSinirsizKar = sonEgim > 0.01;
	const ustSinirsizZarar = sonEgim < -0.01;

	// Başabaş noktaları: işaret değişimlerini bul
	const basabasNoktalari: number[] = [];
	for (let i = 1; i < noktalar.length; i++) {
		const onceki = noktalar[i - 1];
		const simdiki = noktalar[i];
		if ((onceki.karZarar <= 0 && simdiki.karZarar > 0) || (onceki.karZarar >= 0 && simdiki.karZarar < 0)) {
			// doğrusal ara değerleme ile sıfır noktasını daha hassas bul
			const oran = onceki.karZarar / (onceki.karZarar - simdiki.karZarar);
			basabasNoktalari.push(onceki.S + oran * (simdiki.S - onceki.S));
		}
	}

	return { noktalar, maksKar, maksZarar, ustSinirsizKar, ustSinirsizZarar, basabasNoktalari };
}

export type HazirStrateji = {
	ad: string;
	aciklama: string;
	bacaklarUret: (baz: number) => OpsiyonBacagi[];
};

// Baz fiyata göre örnek bacaklar üretir (kullanıcı sonra düzenleyebilir).
export const HAZIR_STRATEJILER: HazirStrateji[] = [
	{
		ad: 'Uzun Call',
		aciklama: 'Fiyatın yükselmesini bekliyorsan. Risk sınırlı (ödenen prim), kâr potansiyeli sınırsız.',
		bacaklarUret: (baz) => [{ tur: 'call', yon: 'al', kullanimFiyati: round(baz), prim: round(baz * 0.04), adet: 1 }],
	},
	{
		ad: 'Uzun Put',
		aciklama: 'Fiyatın düşmesini bekliyorsan. Risk sınırlı (ödenen prim).',
		bacaklarUret: (baz) => [{ tur: 'put', yon: 'al', kullanimFiyati: round(baz), prim: round(baz * 0.04), adet: 1 }],
	},
	{
		ad: 'Boğa Call Yayılımı',
		aciklama: 'Ilımlı yükseliş beklentisi. Hem kâr hem zarar sınırlı, daha düşük maliyetli.',
		bacaklarUret: (baz) => [
			{ tur: 'call', yon: 'al', kullanimFiyati: round(baz * 0.98), prim: round(baz * 0.05), adet: 1 },
			{ tur: 'call', yon: 'sat', kullanimFiyati: round(baz * 1.08), prim: round(baz * 0.02), adet: 1 },
		],
	},
	{
		ad: 'Ayı Put Yayılımı',
		aciklama: 'Ilımlı düşüş beklentisi. Hem kâr hem zarar sınırlı.',
		bacaklarUret: (baz) => [
			{ tur: 'put', yon: 'al', kullanimFiyati: round(baz * 1.02), prim: round(baz * 0.05), adet: 1 },
			{ tur: 'put', yon: 'sat', kullanimFiyati: round(baz * 0.92), prim: round(baz * 0.02), adet: 1 },
		],
	},
	{
		ad: 'Straddle (Al)',
		aciklama: 'Büyük bir hareket bekliyorsun ama yönünden emin değilsin.',
		bacaklarUret: (baz) => [
			{ tur: 'call', yon: 'al', kullanimFiyati: round(baz), prim: round(baz * 0.04), adet: 1 },
			{ tur: 'put', yon: 'al', kullanimFiyati: round(baz), prim: round(baz * 0.04), adet: 1 },
		],
	},
	{
		ad: 'Strangle (Al)',
		aciklama: 'Straddle\'a benzer ama daha ucuz, daha büyük hareket gerektirir.',
		bacaklarUret: (baz) => [
			{ tur: 'call', yon: 'al', kullanimFiyati: round(baz * 1.05), prim: round(baz * 0.025), adet: 1 },
			{ tur: 'put', yon: 'al', kullanimFiyati: round(baz * 0.95), prim: round(baz * 0.025), adet: 1 },
		],
	},
];

function round(n: number): number {
	return Math.round(n * 100) / 100;
}
