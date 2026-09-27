import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';

export const prerender = false;

type FonGirdi = {
	donem: string;
	fon_adi: string;
	hisse: string;
	hareket: string;
	agirlik?: string;
	aciklama?: string;
};

export const GET: APIRoute = async () => {
	const db = getDb();
	const { results } = await db
		.prepare('SELECT * FROM fon_hareketleri ORDER BY donem DESC, olusturulma DESC LIMIT 200')
		.all();
	return Response.json({ satirlar: results });
};

export const POST: APIRoute = async ({ request }) => {
	const db = getDb();
	let govde: { satirlar?: FonGirdi[] };
	try {
		govde = await request.json();
	} catch {
		return Response.json({ hata: 'Geçersiz JSON gövdesi.' }, { status: 400 });
	}
	const satirlar = Array.isArray(govde.satirlar) ? govde.satirlar : [];
	const gecerli = satirlar.filter((s) => s.donem?.trim() && s.fon_adi?.trim() && s.hisse?.trim() && s.hareket?.trim());
	if (gecerli.length === 0) {
		return Response.json({ hata: 'Kaydedilecek geçerli satır yok (dönem, fon adı, hisse ve hareket zorunlu).' }, { status: 400 });
	}
	const ifade = db.prepare(
		`INSERT INTO fon_hareketleri (donem, fon_adi, hisse, hareket, agirlik, aciklama) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
	);
	await db.batch(
		gecerli.map((s) =>
			ifade.bind(
				s.donem.trim(),
				s.fon_adi.trim(),
				s.hisse.trim().toUpperCase(),
				s.hareket.trim(),
				s.agirlik?.trim() || null,
				s.aciklama?.trim() || null,
			),
		),
	);
	return Response.json({ ok: true, eklenen: gecerli.length });
};

export const DELETE: APIRoute = async ({ url }) => {
	const db = getDb();
	const id = url.searchParams.get('id');
	if (!id) return Response.json({ hata: 'id gerekli.' }, { status: 400 });
	await db.prepare('DELETE FROM fon_hareketleri WHERE id = ?1').bind(id).run();
	return Response.json({ ok: true });
};
