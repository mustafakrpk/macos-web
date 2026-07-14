// Basit, kütüphanesiz i18n sözlüğü. Yeni bir anahtar eklerken hem `tr` hem `en`'e
// eklemen gerekir; aksi halde TypeScript `en` tanımında hata verir (anahtarlar eşleşmeli).

export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

const tr = {
	// Kontrol merkezi (ActionCenter)
	'action.dark_mode': 'Karanlık mod',
	'action.animations': 'Animasyonlar',
	'action.system_color': 'Sistem Rengi',
	'action.wallpaper': 'Duvar Kağıdı',
	'action.wallpaper_subtitle': 'Gradyan duvar kağıdı',
	'action.current_wallpaper': 'Mevcut duvar kağıdı',
	'action.notch': 'Çentik',
	'action.language': 'Dil',

	// Menü / genel
	'menu.about': 'Hakkımda',
	'menu.projects': 'Projelerim',
	'menu.cv': 'Özgeçmiş',
	'menu.contact': 'İletişim',
	'menu.github': 'GitHub',
	'common.close': 'Kapat',
	'common.loading': 'Yükleniyor…',
} as const;

export type TranslationKey = keyof typeof tr;

const en: Record<TranslationKey, string> = {
	'action.dark_mode': 'Dark mode',
	'action.animations': 'Animations',
	'action.system_color': 'System Color',
	'action.wallpaper': 'Wallpaper',
	'action.wallpaper_subtitle': 'Gradient wallpaper',
	'action.current_wallpaper': 'Current wallpaper',
	'action.notch': 'Notch',
	'action.language': 'Language',

	'menu.about': 'About',
	'menu.projects': 'Projects',
	'menu.cv': 'Résumé',
	'menu.contact': 'Contact',
	'menu.github': 'GitHub',
	'common.close': 'Close',
	'common.loading': 'Loading…',
};

export const dictionaries: Record<Locale, Record<TranslationKey, string>> = { tr, en };

/**
 * Saf çeviri fonksiyonu (DOM/reaktivite bağımsız — bu yüzden kolay test edilir).
 * Anahtar bulunamazsa TR'ye, o da yoksa anahtarın kendisine düşer.
 */
export function translate(locale: Locale, key: TranslationKey): string {
	return dictionaries[locale]?.[key] ?? dictionaries.tr[key] ?? key;
}
