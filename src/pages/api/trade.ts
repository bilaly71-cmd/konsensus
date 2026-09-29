import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';

export const prerender = false;

let hazir = false;
async function sema(db: D1Database) {
	if (hazir) return;
	await db.batch([
		db.prepare(
			`CREATE TABLE IF NOT EXISTS trade_kayitlari (id TEXT PRIMARY KEY, tarih TEXT NOT NULL, doc TEXT NOT NULL, guncelleme TEXT NOT NULL DEFAULT (datetime('now')))`,
		),
		db.prepare(
			`CREATE TABLE IF NOT EXISTS trade_gorseller (id TEXT PRIMARY KEY, veri TEXT NOT NULL, olusturulma TEXT NOT NULL DEFAULT (datetime('now')))`,
		),
	]);
	hazir = true;
}

const ID = /^[A-Za-z0-9_-]{3,40}$/;
const MAX_GORSEL = 1_500_000; // karakter (~1,1 MB); D1 satır sınırı 2 MB

export const GET: APIRoute = async ({ url }) => {
	const db = getDb();
	await sema(db);
	const gorsel = url.searchParams.get('gorsel');
	if (gorsel) {
		const satir = await db.prepare('SELECT veri FROM trade_gorseller WHERE id = ?1').bind(gorsel).first<{ veri: string }>();
		if (!satir) return new Response('Yok', { status: 404 });
		const m = /^data:(image\/[a-z+]+);base64,(.+)$/.exec(satir.veri);
		if (!m) return new Response('Bozuk', { status: 500 });
		const bin = Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0));
		return new Response(bin, { headers: { 'Content-Type': m[1], 'Cache-Control': 'private, max-age=31536000, immutable' } });
	}
	const { results } = await db.prepare('SELECT doc FROM trade_kayitlari ORDER BY tarih DESC, guncelleme DESC LIMIT 1000').all<{ doc: string }>();
	const trades = results.map((r) => {
		try {
			return JSON.parse(r.doc);
		} catch {
			return null;
		}
	}).filter(Boolean);
	return Response.json({ trades });
};

// Trade kaydını oluştur/güncelle (tam doküman) veya görsel yükle (?gorsel=1)
export const POST: APIRoute = async ({ request, url }) => {
	const db = getDb();
	await sema(db);
	let g: any;
	try {
		g = await request.json();
	} catch {
		return Response.json({ hata: 'Geçersiz JSON.' }, { status: 400 });
	}
	if (url.searchParams.get('gorsel')) {
		const id = String(g?.id ?? '');
		const veri = String(g?.veri ?? '');
		if (!ID.test(id) || !/^data:image\/(jpeg|png|webp);base64,/.test(veri)) {
			return Response.json({ hata: 'Geçersiz görsel.' }, { status: 400 });
		}
		if (veri.length > MAX_GORSEL) return Response.json({ hata: 'Görsel çok büyük.' }, { status: 413 });
		await db.prepare('INSERT OR REPLACE INTO trade_gorseller (id, veri) VALUES (?1, ?2)').bind(id, veri).run();
		return Response.json({ tamam: true, id });
	}
	if (!g || !ID.test(String(g.id ?? '')) || !/^\d{4}-\d{2}-\d{2}$/.test(String(g.date ?? '')) || !String(g.tk ?? '').trim()) {
		return Response.json({ hata: 'id, date (YYYY-AA-GG) ve tk zorunlu.' }, { status: 400 });
	}
	const doc = JSON.stringify(g);
	if (doc.length > 900_000) return Response.json({ hata: 'Kayıt çok büyük.' }, { status: 413 });
	await db
		.prepare(`INSERT INTO trade_kayitlari (id, tarih, doc, guncelleme) VALUES (?1, ?2, ?3, datetime('now'))
		 ON CONFLICT(id) DO UPDATE SET tarih = ?2, doc = ?3, guncelleme = datetime('now')`)
		.bind(g.id, g.date, doc)
		.run();
	return Response.json({ tamam: true });
};

export const DELETE: APIRoute = async ({ url }) => {
	const db = getDb();
	await sema(db);
	const id = url.searchParams.get('id') ?? '';
	if (!ID.test(id)) return Response.json({ hata: 'Geçersiz id.' }, { status: 400 });
	const satir = await db.prepare('SELECT doc FROM trade_kayitlari WHERE id = ?1').bind(id).first<{ doc: string }>();
	const gorselIdleri: string[] = [];
	try {
		const t = JSON.parse(satir?.doc ?? '{}');
		for (const u of t.updates ?? []) for (const im of u.images ?? []) if (im?.id) gorselIdleri.push(im.id);
		for (const im of t.images ?? []) if (im?.id) gorselIdleri.push(im.id);
	} catch {}
	const ifadeler = [db.prepare('DELETE FROM trade_kayitlari WHERE id = ?1').bind(id)];
	for (const gid of gorselIdleri) if (ID.test(gid)) ifadeler.push(db.prepare('DELETE FROM trade_gorseller WHERE id = ?1').bind(gid));
	await db.batch(ifadeler);
	return Response.json({ tamam: true });
};
