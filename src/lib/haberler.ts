export type Haber = {
	id: number;
	tur: 'sirket' | 'piyasa';
	hisse: string | null;
	baslik: string;
	kaynak_url: string | null;
	olusturulma: string;
};

export async function sonHaberler(db: D1Database, tur: 'sirket' | 'piyasa', limit = 3): Promise<Haber[]> {
	const { results } = await db
		.prepare('SELECT * FROM haberler WHERE tur = ?1 ORDER BY olusturulma DESC LIMIT ?2')
		.bind(tur, limit)
		.all<Haber>();
	return results;
}
