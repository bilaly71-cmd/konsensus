export type FonHareketi = {
	id: number;
	donem: string;
	fon_adi: string;
	hisse: string;
	hareket: 'yeni' | 'artirdi' | 'azaltti' | 'cikti';
	agirlik: string | null;
	aciklama: string | null;
	olusturulma: string;
};

export const HAREKET_ETIKETLERI: Record<FonHareketi['hareket'], string> = {
	yeni: 'Yeni aldı',
	artirdi: 'Artırdı',
	azaltti: 'Azalttı',
	cikti: 'Tamamen çıktı',
};

export async function tumFonHareketleri(db: D1Database): Promise<FonHareketi[]> {
	const { results } = await db
		.prepare('SELECT * FROM fon_hareketleri ORDER BY donem DESC, olusturulma DESC')
		.all<FonHareketi>();
	return results;
}

export async function hisseyeGoreFonHareketleri(db: D1Database, hisse: string): Promise<FonHareketi[]> {
	const { results } = await db
		.prepare('SELECT * FROM fon_hareketleri WHERE hisse = ?1 ORDER BY donem DESC, olusturulma DESC')
		.bind(hisse.toUpperCase())
		.all<FonHareketi>();
	return results;
}

export type HisseFonOzeti = {
	hisse: string;
	fonSayisi: number;
	yeniSayisi: number;
	sonDonem: string;
};

export function hisseFonOzetiHesapla(hareketler: FonHareketi[]): HisseFonOzeti[] {
	const gruplar = new Map<string, FonHareketi[]>();
	for (const h of hareketler) {
		if (!gruplar.has(h.hisse)) gruplar.set(h.hisse, []);
		gruplar.get(h.hisse)!.push(h);
	}
	return [...gruplar.entries()]
		.map(([hisse, satirlar]) => ({
			hisse,
			fonSayisi: new Set(satirlar.filter((s) => s.hareket !== 'cikti').map((s) => s.fon_adi)).size,
			yeniSayisi: satirlar.filter((s) => s.hareket === 'yeni').length,
			sonDonem: satirlar[0]?.donem ?? '',
		}))
		.sort((a, b) => b.fonSayisi - a.fonSayisi);
}
