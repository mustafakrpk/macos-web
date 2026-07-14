import {
	locales,
	translate,
	type Locale,
	type TranslationKey,
} from '🍎/configs/i18n/dictionaries.ts';
import { persisted } from './persisted.svelte.ts';

function detect_locale(): Locale {
	const nav = (navigator.language ?? 'tr').toLowerCase();
	return nav.startsWith('en') ? 'en' : 'tr';
}

const store = persisted<Locale>('macos:locale', detect_locale());

export const i18n = {
	get locale(): Locale {
		return store.value;
	},
	set locale(next: Locale) {
		store.value = next;
	},
	get locales() {
		return locales;
	},
	toggle() {
		store.value = store.value === 'tr' ? 'en' : 'tr';
	},
};

/**
 * Reaktif çeviri: template içinde `{t('key')}` olarak kullan.
 * `store.value` erişimi Svelte tarafından izlendiği için dil değişince otomatik güncellenir.
 */
export function t(key: TranslationKey): string {
	return translate(store.value, key);
}

// <html lang> özniteliğini seçili dile göre güncel tut (SEO + erişilebilirlik).
$effect.root(() => {
	$effect(() => {
		document.documentElement.lang = store.value;
	});
});
