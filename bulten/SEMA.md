# Bülten JSON şeması

Dosya: `src/data/bulten/YYYY-MM-DD.json`. Örnek: `2026-09-29.json` (tüm alanlar dolu).
Metin alanlarında `**kalın**` ve `[[ESKİ 28.09 kaynak]]` etiketi kullanılır. Sayfa: `src/pages/bulten.astro`.

Üst düzey alanlar: date, weekday, asOf, windowText, note, sources[{n,k}], top5[{h,p,chain,src}], story, strip[{l,v,c,d(u/d/n),n}], stripNote,
dom[], glob[], regime[[ilişki, ekran, etki]], regimeNote, usiran{timeline[[saat,metin]], verdict(VAR/YOK), why, peace[], esc[], impact},
news[{h,ts,src,chain,who,priced}], kap[{t,c(soz/pay/devir/not/fon/temettu),w(Çok yüksek/Yüksek/Orta/Küçük),s,h,b,y}],
buybacks[[hisse,tutar,süre,not,kaynak]], earnings, rumors[{st,sc(s-no/s-wait/s-idle),h,b,s}], sectors[[sektör,katalizör,risk,yön]],
hidden3[{h,b}], sniperNote, watch[{t,conf,why,bad}], strat{glob,globExp,dom,domExp,scen[{k(up-h/dn-h/bz-h),h,d,lv}],levelNote,avoid},
reads[{who,url,date,txt}], opening{band(0-4),bandText,basis[],pos[],neg[]}, calendar[[saat,metin]], blind.

### Sosyal medya nabzı (v4, isteğe bağlı ama v4 prompt'ta zorunlu)
`sosyal`: { hava (etiketlerin genel havası, 2-3 cümle; aşırı tek yönlülükte kontrarian uyarı), tarama (kaç X sorgusu / YouTube videosu tarandı, hangisi başarısız — tek satır),
konular[{k (konu/hisse), ton, hacim (hacim/etkileşim), dogrulama (doğrulandı/doğrulanamadı/söylenti), piyasa (piyasa karşılığı)}],
youtube[{kanal, saat, arguman}], anormal[{kod, not}] }
