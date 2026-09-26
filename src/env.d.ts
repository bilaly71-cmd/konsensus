/// <reference path="../.astro/types.d.ts" />
/// <reference path="../worker-configuration.d.ts" />
/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}
