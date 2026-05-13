import { create_app_config } from '🍎/helpers/create-app-config.ts';

const finder = create_app_config({
	title: 'Finder',
	resizable: true,

	should_open_window: false,
});

const about = create_app_config({
	title: 'Hakkımda',
	resizable: true,

	height: 600,
	width: 850,
});

const projects = create_app_config({
	title: 'Projelerim',
	resizable: true,

	height: 600,
	width: 900,
});

const cv = create_app_config({
	title: 'Özgeçmiş',
	resizable: true,

	height: 650,
	width: 800,
});

const contact = create_app_config({
	title: 'İletişim',
	resizable: true,

	height: 500,
	width: 700,
});

const social = create_app_config({
	title: 'Sosyal Medya',
	resizable: true,

	height: 500,
	width: 700,
});

const vscode = create_app_config({
	title: 'Kod & Yetenekler',
	resizable: true,

	height: 600,
	width: 900,
});

const terminal = create_app_config({
	title: 'Terminal',
	resizable: true,

	height: 500,
	width: 750,
});

const blog = create_app_config({
	title: 'Blog & Notlar',
	resizable: true,

	height: 600,
	width: 950,
});

const calendar = create_app_config({
	title: 'Takvim',
	resizable: true,
});

const calculator = create_app_config({
	title: 'Hesap Makinesi',

	expandable: true,
	resizable: false,

	height: 250 * 1.414,
	width: 250,
});

const wallpapers = create_app_config({
	title: 'Duvar Kağıtları',
	resizable: true,

	height: 600,
	width: 800,

	dock_breaks_before: true,
});

const github = create_app_config({
	title: 'GitHub',
	resizable: true,

	should_open_window: false,
	external_action: () => window.open('https://github.com/mustafakrpk', '_blank'),

	dock_breaks_before: true,
});

const linkedin = create_app_config({
	title: 'LinkedIn',
	resizable: true,

	should_open_window: false,
	external_action: () => window.open('https://www.linkedin.com/in/krpkmustafa/', '_blank'),
});

export const apps_config = {
	finder,
	'purus-twitter': about,
	appstore: projects,
	notes: cv,
	mail: contact,
	safari: social,
	vscode,
	terminal,
	messages: blog,
	calendar,
	calculator,
	wallpapers,
	'view-source': github,
	vercel: linkedin,
};
