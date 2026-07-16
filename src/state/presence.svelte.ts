// Canlı imleç + presence — sunucuyla WebSocket üzerinden konuşur.
// Fare hareketi throttle'lanarak gönderilir; gelen imleçler yumuşak (lerp) çizilir.

type Peer = {
	id: string;
	color: string;
	name: string;
	x: number; // görüntülenen (interpolasyonlu) 0..1
	y: number;
	tx: number; // hedef (sunucudan gelen)
	ty: number;
};

export const presence = $state({
	count: 0,
	connected: false,
	me_color: '#3b82f6',
	peers: [] as Peer[],
});

let socket: WebSocket | null = null;
let raf = 0;
let started = false;

function peer_index(id: string): number {
	return presence.peers.findIndex((p) => p.id === id);
}

export function connect_presence() {
	if (started || typeof window === 'undefined' || typeof WebSocket === 'undefined') return;
	started = true;

	const open = () => {
		const proto = location.protocol === 'https:' ? 'wss' : 'ws';
		socket = new WebSocket(`${proto}://${location.host}/api/ws`);

		socket.onopen = () => {
			presence.connected = true;
		};

		socket.onclose = () => {
			presence.connected = false;
			presence.peers = [];
			presence.count = 0;
			socket = null;
			// bağlantı koparsa 5 sn sonra tekrar dene
			setTimeout(open, 5000);
		};

		socket.onerror = () => {
			try {
				socket?.close();
			} catch {
				/* yoksay */
			}
		};

		socket.onmessage = (e) => {
			let m: {
				t: string;
				id?: string;
				color?: string;
				name?: string;
				x?: number;
				y?: number;
				count?: number;
				peers?: Array<{ id: string; color: string; name: string; x: number; y: number }>;
			};
			try {
				m = JSON.parse(e.data);
			} catch {
				return;
			}

			switch (m.t) {
				case 'welcome':
					presence.count = m.count ?? 1;
					presence.me_color = m.color ?? presence.me_color;
					presence.peers = (m.peers ?? []).map((p) => ({ ...p, tx: p.x, ty: p.y }));
					break;
				case 'count':
					presence.count = m.count ?? presence.count;
					break;
				case 'join':
					if (m.id && peer_index(m.id) === -1) {
						presence.peers.push({
							id: m.id,
							color: m.color ?? '#3b82f6',
							name: m.name ?? '?',
							x: 0.5,
							y: 0.5,
							tx: 0.5,
							ty: 0.5,
						});
					}
					break;
				case 'move': {
					if (!m.id) break;
					const i = peer_index(m.id);
					if (i !== -1) {
						presence.peers[i].tx = m.x ?? presence.peers[i].tx;
						presence.peers[i].ty = m.y ?? presence.peers[i].ty;
					}
					break;
				}
				case 'leave': {
					if (!m.id) break;
					const i = peer_index(m.id);
					if (i !== -1) presence.peers.splice(i, 1);
					break;
				}
			}
		};
	};

	// fare konumunu throttle'la gönder (~20/sn)
	let last = 0;
	window.addEventListener('mousemove', (ev) => {
		const now = performance.now();
		if (now - last < 50) return;
		last = now;
		if (socket?.readyState === WebSocket.OPEN) {
			socket.send(
				JSON.stringify({
					t: 'move',
					x: ev.clientX / window.innerWidth,
					y: ev.clientY / window.innerHeight,
				}),
			);
		}
	});

	// yumuşak interpolasyon döngüsü
	const tick = () => {
		for (const p of presence.peers) {
			p.x += (p.tx - p.x) * 0.2;
			p.y += (p.ty - p.y) * 0.2;
		}
		raf = requestAnimationFrame(tick);
	};
	raf = requestAnimationFrame(tick);

	open();
}
