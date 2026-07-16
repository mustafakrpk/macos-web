import { randomBytes } from 'node:crypto';
import type { WSContext } from 'hono/ws';

// Canlı imleç + presence — bağlı ziyaretçileri bellekte tutar, konumları yayınlar.
// Tek PM2 süreci için yeterli (birden fazla instance'a çıkılırsa Redis gerekir).

type Client = {
	id: string;
	ws: WSContext;
	color: string;
	name: string;
	x: number;
	y: number;
};

const clients = new Map<string, Client>();
const MAX_CLIENTS = 200;

const COLORS = [
	'#ef4444',
	'#f59e0b',
	'#10b981',
	'#3b82f6',
	'#8b5cf6',
	'#ec4899',
	'#14b8a6',
	'#f97316',
];
const ADJ = ['Mavi', 'Yeşil', 'Turuncu', 'Mor', 'Kızıl', 'Altın', 'Gümüş', 'Gece'];
const ANIMALS = ['Tilki', 'Baykuş', 'Panda', 'Kaplan', 'Kartal', 'Kurt', 'Kedi', 'Balina', 'Ayı', 'Şahin'];

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function broadcast(payload: unknown, except?: string) {
	const msg = JSON.stringify(payload);
	for (const c of clients.values()) {
		if (c.id === except) continue;
		try {
			c.ws.send(msg);
		} catch {
			/* yoksay */
		}
	}
}

// upgradeWebSocket'e verilecek handler fabrikası.
export const presence_ws = () => ({
	onOpen(_evt: Event, ws: WSContext) {
		if (clients.size >= MAX_CLIENTS) {
			try {
				ws.close();
			} catch {
				/* yoksay */
			}
			return;
		}

		const id = randomBytes(6).toString('hex');
		const color = pick(COLORS);
		const name = `${pick(ADJ)} ${pick(ANIMALS)}`;
		const client: Client = { id, ws, color, name, x: 0.5, y: 0.5 };
		clients.set(id, client);
		// ws bağlantısını id ile ilişkilendir (onMessage/onClose'da lazım)
		(ws.raw as { __pid?: string }).__pid = id;

		const peers = [...clients.values()]
			.filter((c) => c.id !== id)
			.map((c) => ({ id: c.id, color: c.color, name: c.name, x: c.x, y: c.y }));

		ws.send(JSON.stringify({ t: 'welcome', id, color, name, peers, count: clients.size }));
		broadcast({ t: 'join', id, color, name }, id);
		broadcast({ t: 'count', count: clients.size });
	},

	onMessage(evt: MessageEvent, ws: WSContext) {
		const id = (ws.raw as { __pid?: string }).__pid;
		if (!id) return;
		const client = clients.get(id);
		if (!client) return;

		let data: { t?: string; x?: number; y?: number };
		try {
			data = JSON.parse(typeof evt.data === 'string' ? evt.data : '');
		} catch {
			return;
		}

		if (data.t === 'move' && typeof data.x === 'number' && typeof data.y === 'number') {
			// 0..1 aralığına sıkıştır (kötü niyetli değerleri engelle)
			const x = Math.min(1, Math.max(0, data.x));
			const y = Math.min(1, Math.max(0, data.y));
			client.x = x;
			client.y = y;
			broadcast({ t: 'move', id, x, y }, id);
		}
	},

	onClose(_evt: CloseEvent, ws: WSContext) {
		const id = (ws.raw as { __pid?: string }).__pid;
		if (!id) return;
		clients.delete(id);
		broadcast({ t: 'leave', id });
		broadcast({ t: 'count', count: clients.size });
	},
});
