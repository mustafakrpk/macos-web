const apple_menu = {
	title: 'apple',
	menu: {
		'about-me': {
			title: 'Hakkımda',
			breakAfter: true,
		},
		preferences: {
			title: 'Tercihler...',
			breakAfter: true,
		},
		github: {
			title: 'GitHub',
		},
		linkedin: {
			title: 'LinkedIn',
			breakAfter: true,
		},
		'lock-screen': {
			title: 'Ekranı Kilitle',
		},
		logout: {
			title: 'Çıkış Yap...',
		},
	},
};

export const create_menu_config = <T extends {}>(et: T) => ({ apple: apple_menu, ...et });
