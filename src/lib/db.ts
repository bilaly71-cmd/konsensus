// Astro v6+'da Cloudflare bindinglerine erişim `cloudflare:workers`'tan `env` ile yapılır.
import { env } from 'cloudflare:workers';

export function getDb(): D1Database {
	return (env as unknown as Env).DB;
}
