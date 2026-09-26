import type { APIRoute } from 'astro';
import { getDb } from '../lib/db';
import { tumOneriler } from '../lib/oneriler';

export const prerender = false;

const sabitYollar = [
	'',
	'oneriler',
	'hedef-fiyatlar',
	'oneri-karnesi',
	'fon-radar',
	'takas-akd',
	'kripto-balinalar',
	'takvim',
	'halka-arz',
	'spk-bulteni',
	'teminat-simulatoru',
	'opsiyon-lab',
	'grafik-oyunu',
];

export const GET: APIRoute = async () => {
	const taban = 'https://konsensus.bilaly71.workers.dev';
	const db = getDb();
	const oneriler = await tumOneriler(db);
	const hisseler = [...new Set(oneriler.map((o) => o.hisse))];

	const yollar = [...sabitYollar, ...hisseler.map((h) => `hisse/${h}`)];

	const gövde = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${yollar.map((y) => `  <url><loc>${taban}/${y}</loc></url>`).join('\n')}
</urlset>`;

	return new Response(gövde, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
