export type MenuOge = {
	t: string;
	href: string;
	rozet?: string;
};

export type MenuGrup = {
	baslik: string;
	ogeler: MenuOge[];
};

export const menuGruplari: MenuGrup[] = [
	{
		baslik: 'PİYASA',
		ogeler: [
			{ t: 'Gösterge paneli', href: '/' },
			{ t: 'Sabah bülteni', href: '/bulten' },
			{ t: 'Öneriler', href: '/oneriler' },
			{ t: 'Hedef fiyatlar', href: '/hedef-fiyatlar' },
			{ t: 'Öneri karnesi', href: '/oneri-karnesi' },
		],
	},
	{
		baslik: 'AKILLI PARA',
		ogeler: [
			{ t: 'Fon radar', href: '/fon-radar' },
			{ t: 'Takas ve AKD', href: '/takas-akd', rozet: 'PRO' },
			{ t: 'Kripto balinalar', href: '/kripto-balinalar' },
		],
	},
	{
		baslik: 'TAKVİM',
		ogeler: [
			{ t: 'Takvim', href: '/takvim' },
			{ t: 'Halka arz', href: '/halka-arz' },
			{ t: 'SPK bülteni', href: '/spk-bulteni' },
		],
	},
	{
		baslik: 'ARAÇLAR VE ARENA',
		ogeler: [
			{ t: 'Teminat simülatörü', href: '/teminat-simulatoru' },
			{ t: 'Opsiyon lab', href: '/opsiyon-lab' },
			{ t: 'Grafik oyunu', href: '/grafik-oyunu' },
		],
	},
];

export type AltSekme = {
	t: string;
	href: string;
	ikon: 'panel' | 'oneriler' | 'akilli' | 'arena' | 'araclar';
	// Bu sekmenin aktif sayılacağı yollar (alt sayfalar dahil)
	yollar: string[];
};

export const altSekmeler: AltSekme[] = [
	{ t: 'Panel', href: '/', ikon: 'panel', yollar: ['/', '/takvim', '/halka-arz', '/spk-bulteni'] },
	{ t: 'Öneriler', href: '/oneriler', ikon: 'oneriler', yollar: ['/oneriler', '/hedef-fiyatlar', '/oneri-karnesi'] },
	{ t: 'Akıllı para', href: '/fon-radar', ikon: 'akilli', yollar: ['/fon-radar', '/takas-akd', '/kripto-balinalar'] },
	{ t: 'Arena', href: '/grafik-oyunu', ikon: 'arena', yollar: ['/grafik-oyunu'] },
	{ t: 'Araçlar', href: '/teminat-simulatoru', ikon: 'araclar', yollar: ['/teminat-simulatoru', '/opsiyon-lab'] },
];
