// Bülten JSON'unu doğrular, src/data/bulten/<tarih>.json olarak kaydeder, commit + push eder (Cloudflare kendiliğinden yayınlar).
// Kullanım: node scripts/bulten-yayinla.mjs <dosya.json>   (repo kökünden)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { bultenKontrol } from './bulten-kontrol.mjs';

const dosya = process.argv[2];
if (!dosya) { console.error('Kullanım: node scripts/bulten-yayinla.mjs <dosya.json>'); process.exit(2); }
const b = JSON.parse(readFileSync(dosya, 'utf8'));
const h = bultenKontrol(b);
if (h.length) { console.error('Bülten geçersiz, yayınlanmadı:\n- ' + h.join('\n- ')); process.exit(1); }
mkdirSync('src/data/bulten', { recursive: true });
const hedef = `src/data/bulten/${b.date}.json`;
writeFileSync(hedef, JSON.stringify(b, null, 2) + '\n');
const sh = (c) => execSync(c, { stdio: 'inherit' });
sh(`git add ${hedef}`);
try { sh(`git commit -m "Sabah bülteni ${b.date}"`); } catch { console.log('Değişiklik yok, commit atlanıyor.'); }
sh('git pull --rebase origin main');
sh('git push origin HEAD:main');
console.log(`Yayınlandı: ${b.date}. Site 1-2 dakikada güncellenir: /bulten`);
