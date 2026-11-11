// ===== HALAMAN DASHBOARD CUSTOMER =====
const ok = RSR.require('user');
const mine = () => RSR.myBookings();
const runningBookings = () => mine().filter(b => b.status === 'berjalan');
const running = () => runningBookings()[0] || null; // kompatibilitas fitur SOS/notifikasi lama
const jam = t => new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

function drawProfile() {
  const u = RSR.user(), all = mine();
  $('profileInitial').textContent = u.name.slice(0, 1).toUpperCase(); $('profileName').textContent = u.name; $('profileId').textContent = u.id || '-';
  $('profileJoined').textContent = new Date(u.joined || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  $('statDone').textContent = all.filter(b => b.status === 'selesai').length + 'x';
  $('statSpent').textContent = RSR.rp(all.filter(b => b.status !== 'menunggu_bayar').reduce((t, b) => t + b.total, 0));
  $('statReviews').textContent = RSR.reviews().filter(x => x.name === u.name).length;
}
const refreshTop = () => { drawProfile(); drawRental(); };
const DRAW = { history: () => drawHistory(), qr: () => drawQR(), review: () => drawReview() };
const showTab = name => bootstrap.Tab.getOrCreateInstance($('tab-' + name)).show();
if (ok) {
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('shown.bs.tab', () => DRAW[b.dataset.tab]()));
  refreshTop(); drawHistory(); setInterval(tick, 1000);
  window.addEventListener('storage', e => { if (e.key === 'rsr_bookings') refreshTop(); });
}
