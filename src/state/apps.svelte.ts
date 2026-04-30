import type { apps_config } from '🍎/configs/apps/apps-config';

export type AppID = keyof typeof apps_config;

const initial_open: Record<AppID, boolean> = {
	finder: false,
	'purus-twitter': true,
	appstore: false,
	notes: false,
	mail: false,
	safari: false,
	vscode: false,
	calendar: false,
	calculator: false,
	wallpapers: false,
	'view-source': false,
	vercel: false,
};

const initial_z: Record<AppID, number> = {
	finder: 0,
	'purus-twitter': 0,
	appstore: 0,
	notes: 0,
	mail: 0,
	safari: 0,
	vscode: 0,
	calendar: 0,
	calculator: 0,
	wallpapers: 0,
	'view-source': 0,
	vercel: 0,
};

const initial_fullscreen: Record<AppID, boolean> = {
	finder: false,
	'purus-twitter': false,
	appstore: false,
	notes: false,
	mail: false,
	safari: false,
	vscode: false,
	calendar: false,
	calculator: false,
	wallpapers: false,
	'view-source': false,
	vercel: false,
};

export const apps = $state({
	open: initial_open,

	active: 'purus-twitter' satisfies AppID,

	/**
	 * Maximum zIndex for the active app
	 * Initialize with -2, so that it becomes 0 when initialised
	 */
	active_z_index: -2,

	z_indices: initial_z,

	is_being_dragged: false as boolean,

	fullscreen: initial_fullscreen,
});
