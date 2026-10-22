export const studio = {
	name: "ja",
	descriptor: "A small studio making tools for learning Japanese by hand.",
	github: "https://github.com/fikryfahrezy",
	founder: "Fikry Fahrezy",
};

export type Product = {
	slug: string;
	index: string;
	name: string;
	japanese: string;
	reading: string;
	mark: string;
	stage: string;
	tagline: string;
	description: string;
	features: string[];
	platforms: string[];
	image: string;
	imageAlt: string;
	links: { label: string; href: string }[];
};

export const products: Product[] = [
	{
		slug: "genkouyoushi",
		index: "01",
		name: "Genkou Youshi",
		japanese: "原稿用紙",
		reading: "genkō yōshi · manuscript paper",
		mark: "原",
		stage: "字 — the character",
		tagline: "Write Japanese one square at a time.",
		description:
			"The squared manuscript paper Japanese students grow up with, rebuilt for pen and pencil on iPad and the web. Pick a kanji, follow its stroke order, and fill the page.",
		features: [
			"Progressive stroke-order guides from KanjiVG",
			"Recognize a kanji from a photo",
			"20 × 20 or 10 × 20 sheets, exported as PDF",
			"A practice library saved in your browser",
		],
		platforms: ["iPad", "Web PWA", "Kanji API"],
		image: "/products/genkouyoushi.png",
		imageAlt:
			"Genkou Youshi writing practice: a 400-square sheet with the kanji 永 traced along the right columns.",
		links: [
			{
				label: "Source",
				href: "https://github.com/fikryfahrezy/GenkouYoushi",
			},
			{ label: "Kanji API", href: "https://kanji-api.fahrezy.work/docs" },
		],
	},
	{
		slug: "kaku",
		index: "02",
		name: "Kaku",
		japanese: "書く",
		reading: "kaku · to write",
		mark: "書",
		stage: "語 — the word",
		tagline: "Write Japanese on one device. Use it anywhere.",
		description:
			"Handwrite on a tablet, confirm the recognized text, and it lands in the focused field of your paired browser. Recognition runs on the device, and raw strokes never leave it.",
		features: [
			"On-device recognition with the DaKanji ONNX model",
			"Receivers for Chromium and Firefox",
			"One-time pairing codes, no accounts",
			"Self-host the relay on your own server",
		],
		platforms: ["Web app", "Browser extension", "Bun server"],
		image: "/products/kaku.png",
		imageAlt:
			"Kaku writing app: 永 handwritten three times, with recognized candidates confirmed and sent to a paired browser.",
		links: [
			{ label: "Open Kaku", href: "https://kaku.fahrezy.work" },
			{ label: "Source", href: "https://github.com/fikryfahrezy/kaku" },
		],
	},
	{
		slug: "tsuzuru",
		index: "03",
		name: "Tsuzuru",
		japanese: "綴る",
		reading: "tsuzuru · to compose",
		mark: "綴",
		stage: "文 — the sentence",
		tagline: "Japanese, one sentence at a time.",
		description:
			"Turn English prompts into Japanese, compare your answer with a reference, and keep a journal of your practice. Choose your level from N5 to N1. No account needed.",
		features: [
			"N5–N1 prompts, short to long",
			"Kana-only, mixed, or exact writing modes",
			"Grammar lookup beside your draft",
			"An offline journal of your last 100 entries",
		],
		platforms: ["Web", "Installable PWA"],
		image: "/products/tsuzuru.webp",
		imageAlt:
			"Tsuzuru sentence practice: the prompt “This book is very interesting.” answered in Japanese and matching the reference.",
		links: [
			{ label: "Source", href: "https://github.com/fikryfahrezy/tsuzuru" },
		],
	},
];

export const principles = [
	{
		index: "01",
		title: "Hand first.",
		body: "Characters stick when your hand learns them, so every tool starts from a stroke instead of a multiple-choice button.",
	},
	{
		index: "02",
		title: "Yours, locally.",
		body: "Sheets, journals, and settings stay in your browser. Kaku's raw strokes never leave the device you write on.",
	},
	{
		index: "03",
		title: "No account wall.",
		body: "Open the page and start practicing. There's nothing to sign up for or subscribe to.",
	},
	{
		index: "04",
		title: "Open by default.",
		body: "Every tool is MIT-licensed on GitHub, and its sources are credited: KanjiVG, JMdict, Tatoeba, DaKanji.",
	},
];

export const vocabulary = [
	{ jp: "書く", romaji: "kaku", en: "to write" },
	{ jp: "綴る", romaji: "tsuzuru", en: "to compose" },
	{ jp: "練習", romaji: "renshū", en: "practice" },
	{ jp: "漢字", romaji: "kanji", en: "characters" },
	{ jp: "毎日", romaji: "mainichi", en: "every day" },
	{ jp: "一画", romaji: "ikkaku", en: "one stroke" },
	{ jp: "覚える", romaji: "oboeru", en: "to remember" },
];
