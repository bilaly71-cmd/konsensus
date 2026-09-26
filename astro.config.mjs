// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	// Site çoğunlukla statik üretiliyor; sadece /panel ve API rotaları
	// (export const prerender = false ile işaretlenenler) sunucuda çalışıp
	// D1 veritabanına erişiyor.
	output: 'static',
	adapter: cloudflare({
		platformProxy: { enabled: true },
	}),
});
