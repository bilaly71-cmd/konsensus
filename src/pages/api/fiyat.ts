import type { APIRoute } from 'astro';
import { yahooAyristir, type FiyatSonuc } from '../../lib/yahoo';

export const prerender = false;

// Yahoo Finance (resmi olmayan) grafik uç noktasından yakın fiyat. BIST kodları "KOD.IS" olarak sorgulanır; veri gecikmelidir.
// Tarayıcı Yahoo'ya doğrudan (CORS) erişemediği için sunucu tarafında çekilir.
const HOSTLAR = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com'];
const KOD = /^[A-Z][A-Z0-9]{1,5}$/;

async function tek(kod: string): Promise<FiyatSonuc | null> {
	for (const host of HOSTLAR) {
		try {
			const ctl = new AbortController();
			const t = setTimeout(() => ctl.abort(), 6000);
			const r = await fetch(`https://${host}/v8/finance/chart/${kod}.IS?range=1d&interval=1d`, {
				signal: ctl.signal,
				headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Konsensus/1.0)', Accept: 'application/json' },
				// @ts-expect-error Cloudflare'e özgü önbellek ayarı
				cf: { cacheTtl: 60, cacheEverything: true },
			});
			clearTimeout(t);
			if (!r.ok) continue;
			const s = yahooAyristir(await r.json());
			if (s) return s;
		} catch {
			/* sıradaki host */
		}
	}
	return null;
}

export const GET: APIRoute = async ({ url }) => {
	const kodlar = [...new Set((url.searchParams.get('k') ?? '').toUpperCase().split(',').map((x) => x.trim()).filter((x) => KOD.test(x)))].slice(0, 40);
	if (!kodlar.length) return Response.json({ hata: 'k parametresine hisse kodları yaz (örn. ?k=THYAO,EREGL).' }, { status: 400 });
	const sonuclar = await Promise.all(kodlar.map(async (k) => [k, await tek(k)] as const));
	const fiyatlar: Record<string, FiyatSonuc> = {};
	const hatalar: string[] = [];
	for (const [k, s] of sonuclar) (s ? (fiyatlar[k] = s) : hatalar.push(k));
	return Response.json({ fiyatlar, hatalar, kaynak: 'Yahoo Finance (gecikmeli)', an: Date.now() }, { headers: { 'Cache-Control': 'public, max-age=60' } });
};
