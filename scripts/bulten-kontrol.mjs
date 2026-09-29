// Günlük bülten JSON'unu siteye göndermeden önce doğrular (şema: bulten/SEMA.md).
// Kullanım: node scripts/bulten-kontrol.mjs <dosya.json>   (çıkış kodu 1 = hata var)
import { readFileSync } from 'node:fs';

export function bultenKontrol(b) {
	const h = [];
	const str = (a, ad) => { if (typeof b[a] !== 'string' || !b[a].trim()) h.push(`${ad || a}: metin olmalı ve boş olmamalı`); };
	const dizi = (a, min = 0) => { if (!Array.isArray(b[a])) h.push(`${a}: liste olmalı`); else if (b[a].length < min) h.push(`${a}: en az ${min} öğe olmalı`); return Array.isArray(b[a]) ? b[a] : []; };
	const nesne = (a) => { if (!b[a] || typeof b[a] !== 'object' || Array.isArray(b[a])) { h.push(`${a}: nesne olmalı`); return {}; } return b[a]; };
	if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) h.push('date: YYYY-AA-GG olmalı');
	['weekday', 'asOf', 'windowText', 'story', 'stripNote', 'regimeNote', 'earnings', 'sniperNote', 'blind'].forEach((a) => str(a));
	for (const t of dizi('top5', 3)) if (!t.h || !t.p || !t.chain) h.push('top5: her öğede h, p, chain olmalı');
	dizi('sources', 1).forEach((t) => { if (!t.n) h.push('sources: her öğede n olmalı'); });
	dizi('strip', 5).forEach((t) => { if (!t.l || t.v == null) h.push('strip: her öğede l ve v olmalı'); if (t.d && !['u', 'd', 'n'].includes(t.d)) h.push(`strip ${t.l}: d yalnız u/d/n olabilir`); });
	['dom', 'glob'].forEach((a) => dizi(a, 1));
	dizi('regime', 3).forEach((r) => { if (!Array.isArray(r) || r.length < 3) h.push('regime: her öğe [ilişki, ekran, etki] olmalı'); });
	const u = nesne('usiran'); if (!Array.isArray(u.timeline) || !['VAR', 'YOK'].includes(u.verdict) || !u.why || !Array.isArray(u.peace) || !Array.isArray(u.esc) || !u.impact) h.push('usiran: timeline[], verdict(VAR/YOK), why, peace[], esc[], impact gerekli');
	dizi('news').forEach((n) => { if (!n.h || !n.chain) h.push('news: her öğede h ve chain olmalı'); });
	dizi('kap', 1).forEach((k) => { if (!k.t || !k.h || !['soz', 'pay', 'devir', 'not', 'fon', 'temettu', 'sermaye'].includes(k.c)) h.push(`kap ${k.t || '?'}: t, h ve c (soz/pay/devir/not/fon/temettu/sermaye) gerekli`); });
	dizi('buybacks'); dizi('rumors'); dizi('sectors'); dizi('hidden3'); dizi('watch'); dizi('reads'); dizi('calendar');
	dizi('rumors').forEach((r) => { if (!['s-no', 's-wait', 's-idle'].includes(r.sc)) h.push('rumors: sc yalnız s-no / s-wait / s-idle olabilir'); });
	const s = nesne('strat'); if (!s.glob || !s.dom || !Array.isArray(s.scen)) h.push('strat: glob, dom, scen[] gerekli'); (s.scen || []).forEach((c) => { if (!['up-h', 'dn-h', 'bz-h'].includes(c.k)) h.push('strat.scen: k yalnız up-h / dn-h / bz-h olabilir'); });
	if (b.sosyal != null) { const x = b.sosyal; if (typeof x !== 'object' || Array.isArray(x)) h.push('sosyal: nesne olmalı'); else { if (!x.hava) h.push('sosyal.hava: metin gerekli'); if (!Array.isArray(x.konular) || !x.konular.length) h.push('sosyal.konular: [{k,ton,hacim,dogrulama,piyasa}] gerekli'); ['youtube', 'anormal'].forEach((a) => { if (x[a] != null && !Array.isArray(x[a])) h.push('sosyal.' + a + ': liste olmalı'); }); (x.konular || []).forEach((k) => { if (!k.k || !k.ton) h.push('sosyal.konular: her öğede k ve ton gerekli'); }); } }
	const o = nesne('opening'); if (!(o.band >= 0 && o.band <= 4) || !o.bandText || !Array.isArray(o.basis) || !Array.isArray(o.pos) || !Array.isArray(o.neg)) h.push('opening: band(0-4), bandText, basis[], pos[], neg[] gerekli');
	return h;
}

if (process.argv[1] && process.argv[1].endsWith('bulten-kontrol.mjs')) {
	const dosya = process.argv[2];
	if (!dosya) { console.error('Kullanım: node scripts/bulten-kontrol.mjs <dosya.json>'); process.exit(2); }
	let b; try { b = JSON.parse(readFileSync(dosya, 'utf8')); } catch (e) { console.error('JSON okunamadı: ' + e.message); process.exit(1); }
	const h = bultenKontrol(b);
	if (h.length) { console.error('HATALAR:\n- ' + h.join('\n- ')); process.exit(1); }
	console.log('Bülten geçerli: ' + b.date);
}
