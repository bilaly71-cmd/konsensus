export type OneriKaydi = {
	id: number;
	tarih: string;
	kurum: string;
	hisse: string;
	tur: string;
	giris: string | null;
	hedef: string;
	stop: string | null;
	potansiyel: string | null;
	kaynak_url: string | null;
	olusturulma: string;
};

export async function tariheGoreOneriler(db: D1Database, tarih: string): Promise<OneriKaydi[]> {
	const { results } = await db
		.prepare('SELECT * FROM oneriler WHERE tarih = ?1 ORDER BY olusturulma DESC')
		.bind(tarih)
		.all<OneriKaydi>();
	return results;
}

export async function tumOneriler(db: D1Database): Promise<OneriKaydi[]> {
	const { results } = await db.prepare('SELECT * FROM oneriler ORDER BY tarih DESC, olusturulma DESC').all<OneriKaydi>();
	return results;
}

export async function hisseyeGoreOneriler(db: D1Database, hisse: string): Promise<OneriKaydi[]> {
	const { results } = await db
		.prepare('SELECT * FROM oneriler WHERE hisse = ?1 ORDER BY tarih DESC, olusturulma DESC')
		.bind(hisse.toUpperCase())
		.all<OneriKaydi>();
	return results;
}

// "145,50", "145.50", "1.234,56", "145" gibi Türkçe/İngilizce yazımları sayıya çevirir.
// Çeviremezse null döner (ör. "[hedef]" gibi örnek/placeholder metinler).
export function sayiyaCevir(deger: string | null | undefined): number | null {
	if (!deger) return null;
	let temiz = deger.trim().replace(/[^\d.,-]/g, '');
	if (!temiz) return null;
	if (temiz.includes(',') && temiz.includes('.')) {
		temiz = temiz.replace(/\./g, '').replace(',', '.');
	} else if (temiz.includes(',')) {
		temiz = temiz.replace(',', '.');
	}
	const sayi = parseFloat(temiz);
	return Number.isFinite(sayi) ? sayi : null;
}

export type HisseOzeti = {
	hisse: string;
	kurumSayisi: number;
	oneriSayisi: number;
	enDusukHedef: number | null;
	ortalamaHedef: number | null;
	enYuksekHedef: number | null;
	sonTarih: string;
};

export function hisseleriOzetle(oneriler: OneriKaydi[]): HisseOzeti[] {
	const grup = new Map<string, OneriKaydi[]>();
	for (const o of oneriler) {
		if (!grup.has(o.hisse)) grup.set(o.hisse, []);
		grup.get(o.hisse)!.push(o);
	}
	return [...grup.entries()]
		.map(([hisse, satirlar]) => {
			const hedefler = satirlar.map((s) => sayiyaCevir(s.hedef)).filter((n): n is number => n !== null);
			return {
				hisse,
				kurumSayisi: new Set(satirlar.map((s) => s.kurum)).size,
				oneriSayisi: satirlar.length,
				enDusukHedef: hedefler.length ? Math.min(...hedefler) : null,
				ortalamaHedef: hedefler.length ? hedefler.reduce((a, b) => a + b, 0) / hedefler.length : null,
				enYuksekHedef: hedefler.length ? Math.max(...hedefler) : null,
				sonTarih: satirlar[0].tarih,
			};
		})
		.sort((a, b) => b.kurumSayisi - a.kurumSayisi || b.oneriSayisi - a.oneriSayisi);
}

export type HedefRevizyonu = {
	hisse: string;
	kurum: string;
	eskiHedef: string;
	yeniHedef: string;
	yon: 'yukselir' | 'duser';
};

// Aynı kurum + aynı hisse için önceki bir tarihte verilen hedefle, bugün
// verilen hedefi karşılaştırır (hedef fiyat revizyonu). "Bugün" parametresi
// dışarıdan verilir (İstanbul tarihiyle tutarlı olsun diye).
export function hedefRevizyonlariHesapla(tumOneriler: OneriKaydi[], bugun: string): HedefRevizyonu[] {
	const gruplar = new Map<string, OneriKaydi[]>();
	for (const o of tumOneriler) {
		const anahtar = `${o.kurum}__${o.hisse}`;
		if (!gruplar.has(anahtar)) gruplar.set(anahtar, []);
		gruplar.get(anahtar)!.push(o);
	}

	const revizyonlar: HedefRevizyonu[] = [];
	for (const kayitlar of gruplar.values()) {
		// Tarihe göre azalan sırala, tekrar eden tarihlerden en son eklenmiş olanı al
		const tariheGoreTekil = new Map<string, OneriKaydi>();
		for (const k of kayitlar) tariheGoreTekil.set(k.tarih, k); // son yazan kazanır (olusturulma DESC sıralı geldiği için ilk görülen kalır)
		const tarihler = [...tariheGoreTekil.keys()].sort((a, b) => (a < b ? 1 : -1));
		if (tarihler.length < 2 || tarihler[0] !== bugun) continue;

		const yeni = sayiyaCevir(tariheGoreTekil.get(tarihler[0])!.hedef);
		const eski = sayiyaCevir(tariheGoreTekil.get(tarihler[1])!.hedef);
		if (yeni === null || eski === null || yeni === eski) continue;

		revizyonlar.push({
			hisse: tariheGoreTekil.get(tarihler[0])!.hisse,
			kurum: tariheGoreTekil.get(tarihler[0])!.kurum,
			eskiHedef: tariheGoreTekil.get(tarihler[1])!.hedef,
			yeniHedef: tariheGoreTekil.get(tarihler[0])!.hedef,
			yon: yeni > eski ? 'yukselir' : 'duser',
		});
	}
	return revizyonlar;
}

export type KonsensusOgesi = { hisse: string; kurumlar: string[]; n: number };

export function konsensusHesapla(oneriler: OneriKaydi[], minKurum = 2): KonsensusOgesi[] {
	const kurumlarHisseBazinda = new Map<string, Set<string>>();
	for (const o of oneriler) {
		if (!kurumlarHisseBazinda.has(o.hisse)) kurumlarHisseBazinda.set(o.hisse, new Set());
		kurumlarHisseBazinda.get(o.hisse)!.add(o.kurum);
	}
	return [...kurumlarHisseBazinda.entries()]
		.map(([hisse, kurumlar]) => ({ hisse, kurumlar: [...kurumlar], n: kurumlar.size }))
		.filter((k) => k.n >= minKurum)
		.sort((a, b) => b.n - a.n);
}
