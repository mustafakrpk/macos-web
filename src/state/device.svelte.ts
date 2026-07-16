// Reaktif cihaz durumu — mobil/masaüstü ayrımı için tek kaynak.
// Sadece CSS değil, bileşen davranışını da (springboard, sürükleme kapatma) yönetir.

const QUERY = '(max-width: 768px)';

function initial(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia(QUERY).matches;
}

export const device = $state({
	is_mobile: initial(),
});

if (typeof window !== 'undefined') {
	const mq = window.matchMedia(QUERY);
	mq.addEventListener('change', (e) => {
		device.is_mobile = e.matches;
	});
}
