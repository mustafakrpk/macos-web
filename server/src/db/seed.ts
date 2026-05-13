import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../lib/env.js';
import {
	about,
	cv_meta,
	education,
	experiences,
	languages,
	projects,
	skill_categories,
} from './schema.js';

const connection = await mysql.createConnection(env.DATABASE_URL);
const db = drizzle(connection);

console.log('→ Seeding database...');

await db.delete(projects);
await db.delete(experiences);
await db.delete(education);
await db.delete(skill_categories);
await db.delete(languages);
await db.delete(cv_meta);
await db.delete(about);

await db.insert(about).values({
	id: 1,
	full_name: 'Mustafa Kırpık',
	title: 'Yazılım Geliştirici',
	intro_md:
		"Modern web teknolojileriyle kullanıcı dostu, performanslı ve estetik arayüzler geliştiriyorum. Frontend tarafında **Svelte**, **React** ve **TypeScript** ile çalışmayı seviyorum.\n\nBackend tarafında **Node.js** ile API'ler yazıyor, veritabanı tasarımı ve DevOps süreçleriyle ilgileniyorum.",
	avatar_url: null,
	email: 'muskirp42@gmail.com',
	github_url: 'https://github.com/mustafakrpk',
	linkedin_url: 'https://www.linkedin.com/in/krpkmustafa/',
	location: 'Türkiye',
});

await db.insert(projects).values([
	{
		title: 'Kişisel Portfolyo',
		description:
			'İşletim sistemi tarzında masaüstü deneyimi sunan kişisel portfolyo sitesi. Svelte 5 runes, TypeScript ve Vite kullanılarak geliştirildi.',
		stack: ['Svelte 5', 'TypeScript', 'Vite', 'PWA'],
		github_url: 'https://github.com/mustafakrpk/macos-web',
		live_url: null,
		image_url: null,
		gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		emoji: '🍎',
		display_order: 0,
		is_published: true,
	},
	{
		title: 'Digital Garden',
		description:
			'Açıklama buraya gelecek. Bu kart için kendi proje bilgilerini doldurabilirsin.',
		stack: ['TypeScript', 'CSS', 'PLpgSQL', 'JavaScript'],
		github_url: 'https://github.com/mustafakrpk/old-blog',
		live_url: null,
		image_url: null,
		gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		emoji: '🚀',
		display_order: 1,
		is_published: true,
	},
]);

await db.insert(experiences).values([
	{
		title: 'Yazılım Geliştirici',
		company: 'Şirket Adı',
		period_start: '2023',
		period_end: null,
		description:
			'Modern web uygulamaları geliştirme, frontend mimarisi tasarımı ve performans optimizasyonu üzerine çalışmalar.',
		display_order: 0,
	},
	{
		title: 'Junior Developer',
		company: 'Önceki Şirket',
		period_start: '2021',
		period_end: '2023',
		description:
			'React ve Node.js tabanlı projelerde aktif rol aldım. REST API tasarımı ve uygulaması.',
		display_order: 1,
	},
]);

await db.insert(education).values([
	{
		degree: 'Lisans — Bilgisayar Mühendisliği',
		school: 'Üniversite Adı',
		period_start: '2017',
		period_end: '2021',
		display_order: 0,
	},
]);

await db.insert(skill_categories).values([
	{
		name: 'Frontend',
		items: ['Svelte', 'React', 'Vue', 'TypeScript', 'HTML/CSS', 'Tailwind'],
		display_order: 0,
	},
	{
		name: 'Backend',
		items: ['Node.js', 'Express', 'REST API', 'PostgreSQL', 'MongoDB'],
		display_order: 1,
	},
	{
		name: 'Araçlar',
		items: ['Git', 'Docker', 'Vite', 'Webpack', 'Linux', 'CI/CD'],
		display_order: 2,
	},
]);

await db.insert(languages).values([
	{ name: 'Türkçe', level: 'Anadil', display_order: 0 },
	{ name: 'İngilizce', level: 'İleri Düzey', display_order: 1 },
]);

await db.insert(cv_meta).values({ id: 1, pdf_url: null });

console.log('✓ Seed complete.');
await connection.end();
