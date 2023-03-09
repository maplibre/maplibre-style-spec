export const SITE = {
	title: 'MapLibre GL Style Spec',
	description: 'Your website description.',
	defaultLanguage: 'en-us',
} as const;

export const OPEN_GRAPH = {
	image: {
		src: 'https://github.com/withastro/astro/blob/main/assets/social/banner-minimal.png?raw=true',
		alt:
			'astro logo on a starry expanse of space,' +
			' with a purple saturn-like planet floating in the right foreground',
	},
	twitter: 'astrodotbuild',
};

export const KNOWN_LANGUAGES = {
	English: 'en',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://github.com/maplibre/maplibre-gl-style-spec/tree/main/docs`;

export const COMMUNITY_INVITE_URL = `https://maplibre.org/about/`;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
	indexName: 'XXXXXXXXXX',
	appId: 'XXXXXXXXXX',
	apiKey: 'XXXXXXXXXX',
};

export type Sidebar = Record<
	(typeof KNOWN_LANGUAGE_CODES)[number],
	Record<string, { text: string; link: string }[]>
>;
export const SIDEBAR: Sidebar = {
	en: {
		'': [
			{ text: 'Introduction', link: 'en/introduction' },
			{ text: 'Root', link: 'en/root' },
			{ text: 'Sources', link: 'en/sources' },
			{ text: 'Sprite', link: 'en/sprite' },
			{ text: 'Glyphs', link: 'en/glyphs' },
			{ text: 'Transition', link: 'en/transition' },
			{ text: 'Layers', link: 'en/layers' },
			{ text: 'Types', link: 'en/types' },
			{ text: 'Expressions', link: 'en/expressions' },
			{ text: 'Other', link: 'en/other' },
		],
	},
};
