import type { APIRoute } from 'astro';
import { bugunIstanbul } from '../../lib/tarih';
import { getDb } from '../../lib/db';

export const prerender = false;

type OneriGirdi = {
	kurum: string;
	hisse: string;
	tur: string;
	giris?: string;
	hedef: string;
	stop?: string;
	potansiyel?: string;
	kaynak_url?: string;
};

export const GET: APIRoute = async ({ locals, url }) => {
	const db = getDb();

	if (url.searchParams.get('durum') === 'bekleyen') {
		const { results } = await db
			.prepare('SELECT * FROM oneriler WHERE sonuc IS NULL ORDER BY tarih ASC LIMIT 200')
			.all();
		return Response.json({ satirlar: results });
	}

	const tarih = url.searchParams.get('tarih') ?? bugunIstanbul();
	const { results } = await db
		.prepare('SELECT * FROM oneriler WHERE tarih = ?1 ORDER BY olusturulma DESC')
		.bind(tarih)
		.all();
	return Response.json({ tarih, satirlar: results });
};

export const POST: APIRoute = async ({ locals, request }) => {
	const db = getDb();
	let gövde: { tarih?: string; satirlar?: OneriGirdi[] };
	try {
		gövde = await request.json();
	} catch {
		return Response.json({ hata: 'Geçersiz JSON gövdesi.' }, { status: 400 });
	}

	const tarih = gövde.tarih || bugunIstanbul();
	const satirlar = Array.isArray(gövde.satirlar) ? gövde.satirlar : [];

	const gecerli = satirlar.filter((s) => s.kurum?.trim() && s.hisse?.trim() && s.hedef?.trim());
	if (gecerli.length === 0) {
		return Response.json({ hata: 'Kaydedilecek geçerli satır yok (kurum, hisse ve hedef zorunlu).' }, { status: 400 });
	}

	const ifade = db.prepare(
		`INSERT INTO oneriler (tarih, kurum, hisse, tur, giris, hedef, stop, potansiyel, kaynak_url)
		 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
	);

	await db.batch(
		gecerli.map((s) =>
			ifade.bind(
				tarih,
				s.kurum.trim(),
				s.hisse.trim().toUpperCase(),
				s.tur?.trim() || 'Günlük',
				s.giris?.trim() || null,
				s.hedef.trim(),
				s.stop?.trim() || null,
				s.potansiyel?.trim() || null,
				s.kaynak_url?.trim() || null,
			),
		),
	);

	return Response.json({ ok: true, eklenen: gecerli.length, tarih });
};

export const DELETE: APIRoute = async ({ locals, url }) => {
	const db = getDb();
	const id = url.searchParams.get('id');
	if (!id) return Response.json({ hata: 'id gerekli.' }, { status: 400 });
	await db.prepare('DELETE FROM oneriler WHERE id = ?1').bind(id).run();
	return Response.json({ ok: true });
};

const GECERLI_SONUCLAR = new Set(['hedef', 'stop', 'sure_doldu', null]);

// Öneri karnesi: bir önerinin sonucunu işaretler (gerçek fiyat verisi yok,
// Bilal panelden elle işaretler — bkz. DURUM.md).
export const PATCH: APIRoute = async ({ request }) => {
	const db = getDb();
	let govde: { id?: number; sonuc?: string | null };
	try {
		govde = await request.json();
	} catch {
		return Response.json({ hata: 'Geçersiz JSON gövdesi.' }, { status: 400 });
	}
	if (!govde.id || !GECERLI_SONUCLAR.has(govde.sonuc ?? null)) {
		return Response.json({ hata: 'id zorunlu, sonuc: hedef | stop | sure_doldu | null olmalı.' }, { status: 400 });
	}
	const sonucTarihi = govde.sonuc ? bugunIstanbul() : null;
	await db
		.prepare('UPDATE oneriler SET sonuc = ?1, sonuc_tarihi = ?2 WHERE id = ?3')
		.bind(govde.sonuc ?? null, sonucTarihi, govde.id)
		.run();
	return Response.json({ ok: true });
};
