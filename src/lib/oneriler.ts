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
