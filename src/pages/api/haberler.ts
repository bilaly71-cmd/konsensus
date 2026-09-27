import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';

export const prerender = false;

type HaberGirdi = {
	tur: string;
	hisse?: string;
	baslik: string;
	kaynak_url?: string;
};

export const GET: APIRoute = async ({ url }) => {
	const db = getDb();
	const tur = url.searchParams.get('tur');
	const { results } = tur
		? await db.prepare('SELECT * FROM haberler WHERE tur = ?1 ORDER BY olusturulma DESC LIMIT 50').bind(tur).all()
		: await db.prepare('SELECT * FROM haberler ORDER BY olusturulma DESC LIMIT 50').all();
	return Response.json({ satirlar: results });
};

export const POST: APIRoute = async ({ request }) => {
	const db = getDb();
	let govde: { satirlar?: HaberGirdi[] };
	try {
		govde = await request.json();
	} catch {
		return Response.json({ hata: 'Geçersiz JSON gövdesi.' }, { status: 400 });
	}
	const satirlar = Array.isArray(govde.satirlar) ? govde.satirlar : [];
	const gecerli = satirlar.filter((s) => s.tur?.trim() && s.baslik?.trim());
	if (gecerli.length === 0) {
		return Response.json({ hata: 'Kaydedilecek geçerli satır yok (tür ve başlık zorunlu).' }, { status: 400 });
	}
	const ifade = db.prepare(`INSERT INTO haberler (tur, hisse, baslik, kaynak_url) VALUES (?1, ?2, ?3, ?4)`);
	await db.batch(
		gecerli.map((s) =>
			ifade.bind(
				s.tur.trim(),
				s.hisse?.trim() ? s.hisse.trim().toUpperCase() : null,
				s.baslik.trim(),
				s.kaynak_url?.trim() || null,
			),
		),
	);
	return Response.json({ ok: true, eklenen: gecerli.length });
};

export const DELETE: APIRoute = async ({ url }) => {
	const db = getDb();
	const id = url.searchParams.get('id');
	if (!id) return Response.json({ hata: 'id gerekli.' }, { status: 400 });
	await db.prepare('DELETE FROM haberler WHERE id = ?1').bind(id).run();
	return Response.json({ ok: true });
};
