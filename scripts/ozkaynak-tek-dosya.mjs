// Özkaynak planlayıcıyı tek bir .html dosyasına paketler (internet/sunucu gerektirmez, veriler tarayıcıda kalır).
// Kullanım: npm run tek-dosya  →  dagitim/ozkaynak-planlayici.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const kaynak = readFileSync('src/pages/ozkaynak.astro', 'utf8');
const tasarim = readFileSync('src/styles/tasarim.css', 'utf8');
const oranlar = readFileSync('public/veri/oranlar.json', 'utf8');

const govde = kaynak.slice(kaynak.indexOf('\t<div class="oz">'), kaynak.indexOf('</AnaLayout>'));
const betik = kaynak.slice(kaynak.indexOf('<script is:inline>') + '<script is:inline>'.length, kaynak.indexOf('</script>', kaynak.indexOf('<script is:inline>')));
const stil = kaynak.slice(kaynak.indexOf('<style is:global>') + '<style is:global>'.length, kaynak.indexOf('</style>', kaynak.indexOf('<style is:global>')));
if (!govde.includes('class="oz"') || !betik.includes('function komut') || !stil.includes('.oz')) throw new Error('Kaynak ayrıştırılamadı');

const bugun = new Date().toISOString().slice(0, 10).split('-').reverse().join('.');
const betikTek = betik.split("fetch('/veri/oranlar.json').then(function (r) { return r.json(); })").join('Promise.resolve(window.OZ_ORANLAR)');
if (betikTek.includes("fetch('/veri/oranlar.json')")) throw new Error('Oran listesi çağrısı değiştirilemedi');

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Özkaynak planlayıcı</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
${tasarim}
.tek-ust { max-width: 1180px; margin: 0 auto; padding: 20px 16px 0; }
.tek-ust h1 { font-size: 30px; letter-spacing: -0.4px; margin: 0 0 4px; }
.tek-ust p { margin: 0; color: var(--metin-ikincil); font-size: 13px; }
.tek-kap { max-width: 1180px; margin: 0 auto; padding: 0 16px 48px; }
${stil}
</style>
</head>
<body>
<header class="tek-ust"><h1>Özkaynak planlayıcı</h1><p>Simülasyon aracı · sürüm ${bugun} · veriler yalnızca bu tarayıcıda kalır, hiçbir yere gönderilmez · yatırım danışmanlığı değildir.</p></header>
<div class="tek-kap">
${govde}
</div>
<script>window.OZ_FIYAT_API = null; window.OZ_ORANLAR = ${oranlar};</script>
<script>
${betikTek}
</script>
</body>
</html>
`;
mkdirSync('dagitim', { recursive: true });
writeFileSync('dagitim/ozkaynak-planlayici.html', html);
console.log('Yazıldı: dagitim/ozkaynak-planlayici.html (' + Math.round(html.length / 1024) + ' KB)');
