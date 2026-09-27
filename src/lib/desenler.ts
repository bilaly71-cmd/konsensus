// Grafik tamamlama oyunu için sentetik (yapay) fiyat serisi üreticisi.
// Gerçek borsa verisi KULLANILMAZ (lisans gerektirir) — desenler algoritmik
// olarak, klasik teknik analiz formasyonlarının geometrisine göre üretilir.

export type Desen =
	| 'obo'
	| 'tobo'
	| 'cift-tepe'
	| 'cift-dip'
	| 'yukselen-ucgen'
	| 'alcalan-ucgen'
	| 'bayrak-boga'
	| 'bayrak-ayi';

export const DESEN_BILGISI: Record<Desen, { ad: string; aciklama: string }> = {
	obo: { ad: 'Omuz Baş Omuz (OBO)', aciklama: 'Tepe dönüş formasyonu — genelde düşüşle sonuçlanır.' },
	tobo: { ad: 'Ters Omuz Baş Omuz (TOBO)', aciklama: 'Dip dönüş formasyonu — genelde yükselişle sonuçlanır.' },
	'cift-tepe': { ad: 'Çift Tepe', aciklama: 'İki başarısız zirve denemesi — genelde düşüşle sonuçlanır.' },
	'cift-dip': { ad: 'Çift Dip', aciklama: 'İki başarılı destek testi — genelde yükselişle sonuçlanır.' },
	'yukselen-ucgen': { ad: 'Yükselen Üçgen', aciklama: 'Yatay direnç + yükselen destek — genelde yukarı kırılır.' },
	'alcalan-ucgen': { ad: 'Alçalan Üçgen', aciklama: 'Yatay destek + alçalan direnç — genelde aşağı kırılır.' },
	'bayrak-boga': { ad: 'Boğa Bayrağı', aciklama: 'Güçlü yükseliş sonrası kısa soluklanma — genelde yukarı devam eder.' },
	'bayrak-ayi': { ad: 'Ayı Bayrağı', aciklama: 'Güçlü düşüş sonrası kısa soluklanma — genelde aşağı devam eder.' },
};

export type UretilenDesen = {
	desen: Desen;
	seri: number[]; // tüm seri (kesme noktasından sonrası dahil)
	kesmeIndeksi: number; // bu indeksten SONRAsı gizlenir, tahmin buraya kadar görünür
	dogruYon: 'yukselir' | 'duser';
};

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

const TABAN = 100;
const GURULTU = TABAN * 0.006;

function obo(ters: boolean): number[] {
	const yon = ters ? -1 : 1; // ters=true => TOBO (aşağı doğru omuzlar)
	const taban = TABAN;
	const neckline = taban;
	const solOmuz = taban + yon * 8;
	const bas = taban + yon * 14;

	return birlestir(
		araDegerler(taban, neckline + yon * 2, 6, GURULTU), // başlangıç
		araDegerler(neckline, solOmuz, 8, GURULTU), // sol omuz yükselişi
		araDegerler(solOmuz, neckline, 8, GURULTU), // sol omuz düşüşü
		araDegerler(neckline, bas, 10, GURULTU), // baş yükselişi
		araDegerler(bas, neckline, 10, GURULTU), // baş düşüşü
		araDegerler(neckline, solOmuz, 8, GURULTU), // sağ omuz yükselişi
		araDegerler(solOmuz, neckline + yon * 1, 8, GURULTU), // sağ omuz düşüşü (kesme burada biter)
	);
}

function ciftTepeDip(ters: boolean): number[] {
	const yon = ters ? -1 : 1; // ters=true => çift dip
	const taban = TABAN;
	const zirve = taban + yon * 12;
	const cukur = taban + yon * 4;

	return birlestir(
		araDegerler(taban, zirve, 10, GURULTU),
		araDegerler(zirve, cukur, 9, GURULTU),
		araDegerler(cukur, zirve - yon * 1, 10, GURULTU),
		araDegerler(zirve - yon * 1, cukur + yon * 3, 6, GURULTU), // kesme, henüz kırılmadan
	);
}

function ucgen(yukselen: boolean): number[] {
	const taban = TABAN;
	const parcalar: number[][] = [];
	const adet = 5;
	for (let i = 0; i < adet; i++) {
		const daralma = 1 - i / (adet + 1); // genişlik giderek daralır
		const ust = yukselen ? taban + 10 : taban + 10 * daralma;
		const alt = yukselen ? taban - 10 * daralma : taban - 10;
		parcalar.push(araDegerler(i % 2 === 0 ? alt : ust, i % 2 === 0 ? ust : alt, 6, GURULTU * 0.8));
	}
	return birlestir(...parcalar);
}

function bayrak(yukselisMi: boolean): number[] {
	const taban = TABAN;
	const yon = yukselisMi ? 1 : -1;
	const direk = araDegerler(taban, taban + yon * 22, 12, GURULTU * 1.3); // güçlü hareket (direk)
	// konsolidasyon: hafif ters eğimli kanal
	const konsolidasyon: number[] = [];
	const baslangic = taban + yon * 22;
	for (let i = 0; i < 16; i++) {
		const dalga = Math.sin(i / 2) * TABAN * 0.02;
		konsolidasyon.push(baslangic - yon * (i * 0.3) + dalga + gurultu(GURULTU * 0.7));
	}
	return birlestir(direk, konsolidasyon);
}

function serilerdenUret(desen: Desen): { seri: number[]; dogruYon: 'yukselir' | 'duser' } {
	switch (desen) {
		case 'obo':
			return { seri: obo(false), dogruYon: 'duser' };
		case 'tobo':
			return { seri: obo(true), dogruYon: 'yukselir' };
		case 'cift-tepe':
			return { seri: ciftTepeDip(false), dogruYon: 'duser' };
		case 'cift-dip':
			return { seri: ciftTepeDip(true), dogruYon: 'yukselir' };
		case 'yukselen-ucgen':
			return { seri: ucgen(true), dogruYon: 'yukselir' };
		case 'alcalan-ucgen':
			return { seri: ucgen(false), dogruYon: 'duser' };
		case 'bayrak-boga':
			return { seri: bayrak(true), dogruYon: 'yukselir' };
		case 'bayrak-ayi':
			return { seri: bayrak(false), dogruYon: 'duser' };
	}
}

export function rastgeleDesen(): Desen {
	const tumDesenler = Object.keys(DESEN_BILGISI) as Desen[];
	return tumDesenler[Math.floor(Math.random() * tumDesenler.length)];
}

export function desenUret(desen?: Desen): UretilenDesen {
	const secilenDesen = desen ?? rastgeleDesen();
	const { seri, dogruYon } = serilerdenUret(secilenDesen);
	// Kesme noktası: serinin sonundan birkaç mum önce (henüz kırılım netleşmeden)
	const kesmeIndeksi = seri.length - 1;
	return { desen: secilenDesen, seri, kesmeIndeksi, dogruYon };
}

// Kesme noktasından sonrası için "çözüm" (kırılım sonrası devam) serisi üretir.
export function cozumUret(desen: UretilenDesen): number[] {
	const sonDeger = desen.seri[desen.seri.length - 1];
	const yon = desen.dogruYon === 'yukselir' ? 1 : -1;
	const devam = araDegerler(sonDeger, sonDeger + yon * TABAN * 0.16, 14, GURULTU * 1.2);
	return devam;
}
