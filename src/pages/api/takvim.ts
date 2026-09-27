import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';

export const prerender = false;

type TakvimGirdi = {
	tarih: string;
	tur: string;
	hisse?: string;
	baslik: string;
	aciklama?: string;
	kaynak_url?: string;
};

export const GET: APIRoute = async () => {
	const db = getDb();
	const { results } = await db.prepare('SELECT * FROM takvim_etkinlikleri ORDER BY tarih DESC LIMIT 200').all();
	return Response.json({ satirlar: results });
};

export const POST: APIRoute = async ({ request }) => {
	const db = getDb();
	let govde: { satirlar?: TakvimGirdi[] };
	try {
		govde = await request.json();
	} catch {
		return Response.json({ hata: 'Geçersiz JSON gövdesi.' }, { status: 400 });
	}
	const satirlar = Array.isArray(govde.satirlar) ? govde.satirlar : [];
	const gecerli = satirlar.filter((s) => s.tarih?.trim() && s.tur?.trim() && s.baslik?.trim());
	if (gecerli.length === 0) {
		return Response.json({ hata: 'Kaydedilecek geçerli satır yok (tarih, tür ve başlık zorunlu).' }, { status: 400 });
	}
	const ifade = db.prepare(
		`INSERT INTO takvim_etkinlikleri (tarih, tur, hisse, baslik, aciklama, kaynak_url) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
	);
	await db.batch(
		gecerli.map((s) =>
			ifade.bind(
				s.tarih.trim(),
				s.tur.trim(),
				s.hisse?.trim() ? s.hisse.trim().toUpperCase() : null,
				s.baslik.trim(),
				s.aciklama?.trim() || null,
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
	await db.prepare('DELETE FROM takvim_etkinlikleri WHERE id = ?1').bind(id).run();
	return Response.json({ ok: true });
};
