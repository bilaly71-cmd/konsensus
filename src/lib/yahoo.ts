// Yahoo Finance grafik yanıtından fiyat çıkarır.
export type FiyatSonuc = { f: number; onceki: number | null; zaman: number | null };

// Yahoo yanıtından fiyat çıkarır (birim testte de kullanılır).
export function yahooAyristir(j: any): FiyatSonuc | null {
	const m = j?.chart?.result?.[0]?.meta;
	if (!m) return null;
	const f = Number(m.regularMarketPrice);
	if (!isFinite(f) || f <= 0) return null;
	const onceki = Number(m.chartPreviousClose ?? m.previousClose);
	return { f, onceki: isFinite(onceki) && onceki > 0 ? onceki : null, zaman: Number(m.regularMarketTime) || null };
}

