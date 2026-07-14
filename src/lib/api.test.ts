import { describe, expect, it } from 'vitest';
import { parse_string_array } from './api';

describe('parse_string_array', () => {
	it('bir diziyi olduğu gibi döndürür', () => {
		expect(parse_string_array(['a', 'b'])).toEqual(['a', 'b']);
	});

	it('dizideki string olmayan öğeleri ayıklar', () => {
		expect(parse_string_array(['a', 1, null, 'b', undefined])).toEqual(['a', 'b']);
	});

	it('JSON string dizisini parse eder (MySQL JSON kolonu senaryosu)', () => {
		expect(parse_string_array('["Svelte","TypeScript"]')).toEqual(['Svelte', 'TypeScript']);
	});

	it('geçersiz JSON string için boş dizi döndürür', () => {
		expect(parse_string_array('not-json')).toEqual([]);
	});

	it('boş string için boş dizi döndürür', () => {
		expect(parse_string_array('')).toEqual([]);
	});

	it('null / undefined / sayı için boş dizi döndürür', () => {
		expect(parse_string_array(null)).toEqual([]);
		expect(parse_string_array(undefined)).toEqual([]);
		expect(parse_string_array(42)).toEqual([]);
	});

	it('JSON bir dizi değilse boş dizi döndürür', () => {
		expect(parse_string_array('{"a":1}')).toEqual([]);
	});
});
