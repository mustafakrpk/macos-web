export type ApiError = {
	error: string;
	message?: string;
	issues?: unknown;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const res = await fetch(path, {
		credentials: 'include',
		...init,
		headers: {
			...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
			...init.headers,
		},
	});

	if (!res.ok) {
		let payload: ApiError = { error: `http_${res.status}` };
		try {
			payload = (await res.json()) as ApiError;
		} catch {
			// no json
		}
		throw Object.assign(new Error(payload.message ?? payload.error), {
			status: res.status,
			data: payload,
		});
	}

	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body?: unknown) =>
		request<T>(path, {
			method: 'POST',
			body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
		}),
	put: <T>(path: string, body?: unknown) =>
		request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
	patch: <T>(path: string, body?: unknown) =>
		request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
	delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/**
 * MySQL JSON kolonu bazı durumlarda string olarak gelir; tutarlı olarak array'e çevir.
 */
export function parse_string_array(v: unknown): string[] {
	if (Array.isArray(v)) return v.filter((x) => typeof x === 'string');
	if (typeof v === 'string' && v.length > 0) {
		try {
			const parsed = JSON.parse(v);
			if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
		} catch {
			return [];
		}
	}
	return [];
}

// ─── Public API tipleri ────────────────────────────────────────
export type PublicAbout = {
	id: number;
	full_name: string;
	title: string;
	intro_md: string;
	avatar_url: string | null;
	email: string | null;
	github_url: string | null;
	linkedin_url: string | null;
	location: string | null;
	updated_at: string;
};

export type PublicProject = {
	id: number;
	title: string;
	description: string;
	stack: string[];
	github_url: string | null;
	live_url: string | null;
	image_url: string | null;
	gradient: string;
	emoji: string;
	display_order: number;
};

export type PublicExperience = {
	id: number;
	title: string;
	company: string;
	period_start: string;
	period_end: string | null;
	description: string | null;
	display_order: number;
};

export type PublicEducation = {
	id: number;
	degree: string;
	school: string;
	period_start: string;
	period_end: string | null;
	display_order: number;
};

export type PublicSkillCategory = {
	id: number;
	name: string;
	items: string[];
	display_order: number;
};

export type PublicLanguage = {
	id: number;
	name: string;
	level: string;
	display_order: number;
};

export type PublicCV = {
	experiences: PublicExperience[];
	education: PublicEducation[];
	skill_categories: PublicSkillCategory[];
	languages: PublicLanguage[];
	cv_meta: { id: number; pdf_url: string | null } | null;
};
