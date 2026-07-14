import { describe, expect, it } from 'vitest';
import { dictionaries, locales, translate } from './dictionaries';

describe('i18n dictionaries', () => {
	it('tüm diller aynı anahtar kümesine sahip', () => {
		const tr_keys = Object.keys(dictionaries.tr).sort();
		for (const locale of locales) {
			expect(Object.keys(dictionaries[locale]).sort()).toEqual(tr_keys);
		}
	});

	it('seçili dilin çevirisini döndürür', () => {
		expect(translate('tr', 'action.dark_mode')).toBe('Karanlık mod');
		expect(translate('en', 'action.dark_mode')).toBe('Dark mode');
	});

	it('boş çeviri yoksa değer döner (fallback zinciri sağlam)', () => {
		// Her anahtar her dilde dolu olmalı
		for (const locale of locales) {
			for (const key of Object.keys(dictionaries.tr) as Array<keyof typeof dictionaries.tr>) {
				expect(translate(locale, key).length).toBeGreaterThan(0);
			}
		}
	});
});
