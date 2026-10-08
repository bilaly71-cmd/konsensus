// Uygulama portal (Kokpit) içinde /konsensus altında sunulur (astro.config.mjs base). Kök-mutlak yollar buradan geçer.
export const BASE: string = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (p: string): string => (p.startsWith('/') && !p.startsWith('//') ? BASE + p : p);
