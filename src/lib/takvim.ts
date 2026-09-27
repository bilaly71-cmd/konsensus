export type TakvimTuru = 'temettu' | 'bedelsiz' | 'genel_kurul' | 'halka_arz' | 'spk_bulten' | 'diger';

export type TakvimEtkinligi = {
	id: number;
	tarih: string;
	tur: TakvimTuru;
	hisse: string | null;
	baslik: string;
	aciklama: string | null;
	kaynak_url: string | null;
	olusturulma: string;
};

export const TUR_ETIKETLERI: Record<TakvimTuru, string> = {
	temettu: 'Temettü',
	bedelsiz: 'Bedelsiz',
	genel_kurul: 'Genel kurul',
	halka_arz: 'Halka arz',
	spk_bulten: 'SPK bülteni',
	diger: 'Diğer',
};

export const TUR_RENKLERI: Record<TakvimTuru, string> = {
	temettu: 'yukselis',
	bedelsiz: 'marka',
	genel_kurul: 'notr',
	halka_arz: 'marka',
	spk_bulten: 'notr',
	diger: 'notr',
};

export async function tumTakvimEtkinlikleri(db: D1Database): Promise<TakvimEtkinligi[]> {
	const { results } = await db
		.prepare('SELECT * FROM takvim_etkinlikleri ORDER BY tarih ASC')
		.all<TakvimEtkinligi>();
	return results;
}

export async function tureGoreTakvimEtkinlikleri(db: D1Database, tur: TakvimTuru): Promise<TakvimEtkinligi[]> {
	const { results } = await db
		.prepare('SELECT * FROM takvim_etkinlikleri WHERE tur = ?1 ORDER BY tarih ASC')
		.bind(tur)
		.all<TakvimEtkinligi>();
	return results;
}
