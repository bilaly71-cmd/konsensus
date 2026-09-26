// BIST kredili menkul kıymet işlemi ve açığa satış kuralları — TİPİK/genel değerler.
// Gerçek oranlar aracı kurumdan kuruma ve BIST'in güncel duyurularına göre değişir.
// DURUM.md'de "Bilal'le teyit edilecek" olarak işaretlendi.
//
// Mantık: BIST'te paylar likidite/hacim/piyasa değerine göre gruplara ayrılır
// (yaygın uygulama: A = yüksek likidite/BIST30-50 gibi, B = orta, C = düşük
// likidite, D = kredili işleme ve açığa satışa kapalı paylar). Her grubun:
//  - "teminata kabul oranı" (haircut): bu paydan teminat gösterildiğinde
//    değerinin ne kadarı teminat gücü olarak sayılır,
//  - "başlangıç özkaynak oranı": bu paydan kredili alım yapılırken istenen
//    en düşük özkaynak oranı,
//  - "sürdürme (çağrı) oranı": bu oranın altına inince teminat tamamlama
//    çağrısı gelir,
// farklıdır. Düşük likidite = daha yüksek özkaynak istenir, daha düşük
// teminat değeri verilir.

export type HisseGrubu = 'A' | 'B' | 'C' | 'D';

export type GrupParametreleri = {
	ad: string;
	aciklama: string;
	teminataKabulOrani: number; // haircut, 0-1
	baslangicOrani: number; // %, kredili alımda istenen en düşük özkaynak oranı
	surdurmeOrani: number; // %, altına inince çağrı gelir
	krediyeKapali: boolean;
	acigaSatisaKapali: boolean;
};

export const HISSE_GRUPLARI: Record<HisseGrubu, GrupParametreleri> = {
	A: {
		ad: 'A Grubu',
		aciklama: 'Yüksek likidite (BIST30/50 ağırlıklı payların çoğu)',
		teminataKabulOrani: 0.9,
		baslangicOrani: 50,
		surdurmeOrani: 35,
		krediyeKapali: false,
		acigaSatisaKapali: false,
	},
	B: {
		ad: 'B Grubu',
		aciklama: 'Orta likidite',
		teminataKabulOrani: 0.7,
		baslangicOrani: 60,
		surdurmeOrani: 40,
		krediyeKapali: false,
		acigaSatisaKapali: false,
	},
	C: {
		ad: 'C Grubu',
		aciklama: 'Düşük likidite — kısıtlı kabul edilir',
		teminataKabulOrani: 0.5,
		baslangicOrani: 75,
		surdurmeOrani: 50,
		krediyeKapali: false,
		acigaSatisaKapali: true,
	},
	D: {
		ad: 'D Grubu',
		aciklama: 'Kredili işleme ve açığa satışa kapalı paylar',
		teminataKabulOrani: 0,
		baslangicOrani: 100,
		surdurmeOrani: 100,
		krediyeKapali: true,
		acigaSatisaKapali: true,
	},
};

export const ACIGA_SATIS = {
	baslangicOrani: 50, // %, satış tutarının bu kadarı teminat olarak bloke edilir (tipik)
	surdurmeOrani: 35, // %, altına inince çağrı gelir (tipik)
};

// --- Kredili (uzun) pozisyon hesaplamaları ---

export type UcDepoGirdi = {
	serbestDepo: number; // nakit
	teminatDeposu: number; // ek teminat gösterilen menkul kıymetin güncel piyasa değeri
	teminatGrubu: HisseGrubu;
	krediliDepo: number; // kredi ile alınan / alınacak payın güncel piyasa değeri
	krediliGrubu: HisseGrubu;
	kredi: number; // borç
};

export type UcDepoSonucu = {
	teminatDeposuHaircutli: number;
	toplamPortfoyDegeri: number; // teminatDeposu + krediliDepo (piyasa değeri, haircut'sız)
	ozkaynak: number;
	ozkaynakOrani: number; // %
	gerekliBaslangicOrani: number; // krediliGrubu'na göre
	surdurmeOrani: number;
	durum: 'guvenli' | 'uyari' | 'tehlike' | 'kapali';
};

export function ucDepoHesapla(girdi: UcDepoGirdi): UcDepoSonucu {
	const teminatParam = HISSE_GRUPLARI[girdi.teminatGrubu];
	const krediliParam = HISSE_GRUPLARI[girdi.krediliGrubu];

	const teminatDeposuHaircutli = girdi.teminatDeposu * teminatParam.teminataKabulOrani;
	const toplamPortfoyDegeri = girdi.teminatDeposu + girdi.krediliDepo;
	const toplamTeminatGucu = girdi.serbestDepo + teminatDeposuHaircutli + girdi.krediliDepo;
	const ozkaynak = toplamTeminatGucu - girdi.kredi;
	const ozkaynakOrani = toplamPortfoyDegeri + girdi.serbestDepo > 0 ? (ozkaynak / (toplamPortfoyDegeri + girdi.serbestDepo)) * 100 : 0;

	let durum: UcDepoSonucu['durum'] = 'guvenli';
	if (krediliParam.krediyeKapali && girdi.kredi > 0) {
		durum = 'kapali';
	} else if (girdi.kredi > 0) {
		if (ozkaynakOrani < krediliParam.surdurmeOrani) durum = 'tehlike';
		else if (ozkaynakOrani < krediliParam.baslangicOrani) durum = 'uyari';
	}

	return {
		teminatDeposuHaircutli,
		toplamPortfoyDegeri,
		ozkaynak,
		ozkaynakOrani,
		gerekliBaslangicOrani: krediliParam.baslangicOrani,
		surdurmeOrani: krediliParam.surdurmeOrani,
		durum,
	};
}

// Fiyat %X değişirse yeni özkaynak oranı (basit model: sadece kredili depo fiyat
// hareketinden etkilenir, teminat deposu ve serbest depo sabit varsayılır).
export function ucDepoSenaryo(girdi: UcDepoGirdi, yuzdeDegisim: number): UcDepoSonucu {
	const yeniKrediliDepo = girdi.krediliDepo * (1 + yuzdeDegisim / 100);
	return ucDepoHesapla({ ...girdi, krediliDepo: yeniKrediliDepo });
}

// Kaç % düşüş/yükseliş ile sürdürme oranına inilir (ikili arama, basit ve sağlam)
export function esikDegisimBul(girdi: UcDepoGirdi): number | null {
	if (girdi.kredi <= 0 || girdi.krediliDepo <= 0) return null;
	let alt = -95;
	let ust = 0;
	const hedefOran = HISSE_GRUPLARI[girdi.krediliGrubu].surdurmeOrani;
	if (ucDepoSenaryo(girdi, alt).ozkaynakOrani > hedefOran) return null; // %95 düşüşte bile çağrı gelmiyor
	for (let i = 0; i < 40; i++) {
		const orta = (alt + ust) / 2;
		const sonuc = ucDepoSenaryo(girdi, orta);
		if (sonuc.ozkaynakOrani > hedefOran) ust = orta;
		else alt = orta;
	}
	return ust;
}

// --- Açığa satış hesaplamaları ---

export type AcikPozisyonGirdi = {
	satisTutari: number; // açığa satış anındaki toplam değer
	blokeTeminat: number; // satış anında bloke edilen nakit/teminat
};

export function acikPozisyonHesapla(girdi: AcikPozisyonGirdi, yuzdeDegisim: number) {
	const guncelDeger = girdi.satisTutari * (1 + yuzdeDegisim / 100);
	const zarar = guncelDeger - girdi.satisTutari; // fiyat yükselirse pozitif (zarar)
	const kalanTeminat = girdi.blokeTeminat - zarar;
	const ozkaynakOrani = guncelDeger > 0 ? (kalanTeminat / guncelDeger) * 100 : 0;
	let durum: 'guvenli' | 'uyari' | 'tehlike' = 'guvenli';
	if (ozkaynakOrani < ACIGA_SATIS.surdurmeOrani) durum = 'tehlike';
	else if (ozkaynakOrani < ACIGA_SATIS.baslangicOrani) durum = 'uyari';
	return { guncelDeger, zarar, kalanTeminat, ozkaynakOrani, durum };
}

export function acikPozisyonEsikBul(girdi: AcikPozisyonGirdi): number | null {
	let alt = 0;
	let ust = 300;
	if (acikPozisyonHesapla(girdi, ust).ozkaynakOrani > ACIGA_SATIS.surdurmeOrani) return null;
	for (let i = 0; i < 40; i++) {
		const orta = (alt + ust) / 2;
		const sonuc = acikPozisyonHesapla(girdi, orta);
		if (sonuc.ozkaynakOrani > ACIGA_SATIS.surdurmeOrani) alt = orta;
		else ust = orta;
	}
	return alt;
}
