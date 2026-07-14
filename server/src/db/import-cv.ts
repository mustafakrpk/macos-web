// Özgeçmiş (CV) verisini DB'ye işler: deneyim, eğitim, yetenek, dil + hakkımda/cv_meta.
// Çalıştırma: pnpm db:import-cv   (server/ içinde)
// Not: Sadece CV ile ilgili tabloları günceller; projects tablosuna DOKUNMAZ.

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../lib/env.js';
import {
	about,
	cv_meta,
	education,
	experiences,
	languages,
	skill_categories,
} from './schema.js';

// PDF, /uploads altında sunulacak (backend serveStatic + nginx proxy).
const CV_PDF_URL = '/uploads/mustafa-kirpik-cv.pdf';

const INTRO_MD = `Web geliştirme ekosisteminde 3 yılı aşkın deneyime sahip, **Laravel**, **React** ve **Next.js** teknolojilerinde uzmanlaşmaya çalışan bir Bilgisayar Mühendisi ve Yüksek Lisans öğrencisiyim. Kariyerim boyunca yalnızca kod üretmeye değil; **e-Afet** gibi kritik kriz yönetim platformlarının canlı veri takibi ve operasyonel süreçlerinin geliştirilmesinde ve mimarisinin kurulmasında kritik bir emek harcadım. **Allturko Yeraltı Veri Merkezi** gibi makro ölçekli altyapı projelerinin stratejik planlama, yatırım ve teşvik süreçlerinde görev aldım.

Multi-tenant yapılar, güvenli onay mekanizmaları (approval flows) ve yüksek ölçekli veritabanı optimizasyonları konularında yetkinlik sahibiyim. Teknik becerilerimi hem akademik düzeyde hem de pratikte geliştirmeye devam ediyorum.`;

async function main() {
	const connection = await mysql.createConnection(env.DATABASE_URL);
	const db = drizzle(connection);

	console.log('→ CV tabloları temizleniyor (projects hariç)...');
	await db.delete(experiences);
	await db.delete(education);
	await db.delete(skill_categories);
	await db.delete(languages);
	await db.delete(cv_meta);
	await db.delete(about);

	console.log('→ Hakkımda güncelleniyor...');
	await db.insert(about).values({
		id: 1,
		full_name: 'Mustafa Kırpık',
		title: 'Backend Geliştirici',
		intro_md: INTRO_MD,
		avatar_url: null,
		email: 'kirpik.mustafaa@gmail.com',
		github_url: 'https://github.com/mustafakrpk',
		linkedin_url: 'https://www.linkedin.com/in/krpkmustafa/',
		location: 'Konya, Türkiye',
		current_status: 'Erkpa Gıda Lojistik A.Ş. — Full-Stack Developer',
	});

	console.log('→ Deneyimler ekleniyor...');
	await db.insert(experiences).values([
		{
			title: 'Full-Stack Developer (+1 yıl)',
			company: 'Erkpa Gıda Lojistik A.Ş.',
			period_start: '25.12.2024',
			period_end: null,
			description:
				'Ticaret alanına yönelik web uygulamaları geliştiriyorum. e-Afet kriz yönetim platformunun arka yüz (backend) geliştirmesinde aktif rol aldım ve süreçlere liderlik ettim. Allemtia projesinde sistem mimarisini kurup backend süreçlerinin tümünde sorumluluk aldım. React-Laravel ile geliştirilen diğer projelerde yer aldım.',
			display_order: 0,
		},
		{
			title: 'Full-Stack Developer (7 ay)',
			company: 'CND Studio',
			period_start: '2024',
			period_end: '2024',
			description:
				'Farklı sektörlerden birçok müşteri için özel admin panelli web uygulamaları geliştirip yayına aldım (CodeIgniter4, WordPress). Mail kurulumları ve müşteri iletişimi, bakım ve geri bildirim revizyonlarını yürüttüm.',
			display_order: 1,
		},
		{
			title: 'Mühendis Stajyer (4 ay)',
			company: 'Bilecik Şeyh Edebali Üniversitesi — Bilgi İşlem Daire Başkanlığı',
			period_start: '2023',
			period_end: '2023',
			description:
				'Teknik servis ekibinde bilgisayar arıza tespiti, parça değişimi ve bakım. Fakülte sunucu odalarında aktifleme/pasifleme işlemleri, RJ-45 konnektör çakma, yedekleme ve kurtarma. PHP ile imaj yönetim sistemi için basit bir web arayüzü geliştirdim.',
			display_order: 2,
		},
		{
			title: 'Mühendis Stajyer (1 ay)',
			company: 'Ayyıldızsoft Yazılım',
			period_start: '2023',
			period_end: '2023',
			description:
				'Şirketin projelerinde ön yüz geliştirme alanında çeşitli görevler aldım. Laravel ile yeni projelerin template’lerini hazır hale getirdim.',
			display_order: 3,
		},
		{
			title: 'Mühendis Stajyer (1 ay)',
			company: 'MEPAS',
			period_start: '2023',
			period_end: '2023',
			description:
				'Laravel temel yapısıyla template parçalama ve site tamamlama. Laravel Voyager ile veritabanı yönetimi. Laravel ile admin panelli blog sitesi geliştirdim.',
			display_order: 4,
		},
	]);

	console.log('→ Eğitim ekleniyor...');
	await db.insert(education).values([
		{
			degree: 'Yüksek Lisans — Bilgisayar Mühendisliği',
			school: 'Selçuk Üniversitesi',
			period_start: '2025',
			period_end: null,
			display_order: 0,
		},
		{
			degree: 'Lisans — Bilgisayar Mühendisliği (GNO 2.94/4)',
			school: 'Bilecik Şeyh Edebali Üniversitesi',
			period_start: '2019',
			period_end: '2024',
			display_order: 1,
		},
	]);

	console.log('→ Yetenekler ekleniyor...');
	await db.insert(skill_categories).values([
		{
			name: 'Sunucu Tarafı (Backend)',
			items: ['Laravel', 'CodeIgniter4', 'PHP', 'RESTful API', 'Multi-tenant Mimari'],
			display_order: 0,
		},
		{
			name: 'Ön Yüz (Frontend)',
			items: [
				'React.js',
				'Next.js',
				'TypeScript',
				'Vue.js',
				'JavaScript (ES6+)',
				'HTML5',
				'CSS3 (Sass/Tailwind)',
			],
			display_order: 1,
		},
		{
			name: 'Veritabanı & Depolama',
			items: ['MySQL', 'MongoDB', 'PostgreSQL'],
			display_order: 2,
		},
		{
			name: 'Araçlar & Diğer',
			items: ['Git', 'GitHub', 'Python'],
			display_order: 3,
		},
	]);

	console.log('→ Diller ekleniyor...');
	await db.insert(languages).values([
		{ name: 'Türkçe', level: 'Ana Dil', display_order: 0 },
		{ name: 'İngilizce', level: 'B1 (Okuma)', display_order: 1 },
	]);

	console.log('→ CV PDF bağlanıyor...');
	await db.insert(cv_meta).values({ id: 1, pdf_url: CV_PDF_URL });

	console.log('✓ CV içeri aktarıldı. PDF yolu:', CV_PDF_URL);
	await connection.end();
}

main().catch((err) => {
	console.error('CV import hatası:', err);
	process.exit(1);
});
