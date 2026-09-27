import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	const db = getDb();
	let govde: { desen?: string; tahmin?: string; dogruMu?: boolean };
	try {
		govde = await request.json();
	} catch {
		return Response.json({ hata: 'Geçersiz JSON gövdesi.' }, { status: 400 });
	}
	if (!govde.desen || !govde.tahmin || typeof govde.dogruMu !== 'boolean') {
		return Response.json({ hata: 'desen, tahmin ve dogruMu zorunlu.' }, { status: 400 });
	}
	await db
		.prepare('INSERT INTO oyun_sonuclari (desen, tahmin, dogru_mu) VALUES (?1, ?2, ?3)')
		.bind(govde.desen, govde.tahmin, govde.dogruMu ? 1 : 0)
		.run();
	return Response.json({ ok: true });
};

export const GET: APIRoute = async () => {
	const db = getDb();
	const { results } = await db
		.prepare(
			`SELECT desen,
			        COUNT(*) AS toplam,
			        SUM(dogru_mu) AS dogruSayisi
			 FROM oyun_sonuclari
			 GROUP BY desen`,
		)
		.all<{ desen: string; toplam: number; dogruSayisi: number }>();

	const { results: genelSonuc } = await db
		.prepare(`SELECT COUNT(*) AS toplam, SUM(dogru_mu) AS dogruSayisi FROM oyun_sonuclari`)
		.all<{ toplam: number; dogruSayisi: number }>();

	return Response.json({ desenBazinda: results, genel: genelSonuc[0] ?? { toplam: 0, dogruSayisi: 0 } });
};
