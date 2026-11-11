// ===== HALAMAN DASHBOARD CUSTOMER: menghubungkan fitur 6, 7, 8, 9 dan rating =====
// Seluruh kerangka tampilan ada di dashboard.html. Di sini data akun & booking diisikan ke kerangka itu.
const ok = RSR.require('user');
const mine = () => RSR.myBookings();
const running = () => mine().find(b => b.status === 'berjalan');   // sewa yang sedang jalan
const jam = t => new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');

function drawProfile() { // profil & statistik dari akun yang login
  const u = RSR.user(), all = mine();
  $('profileInitial').textContent = u.name.slice(0, 1).toUpperCase(); $('profileName').textContent = u.name; $('profileId').textContent = u.id || '-';
  $('profileJoined').textContent = new Date(u.joined || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  $('statDone').textContent = all.filter(b => b.status === 'selesai').length + 'x';
  $('statSpent').textContent = RSR.rp(all.filter(b => b.status !== 'menunggu_bayar').reduce((t, b) => t + b.total, 0));
  $('statReviews').textContent = RSR.reviews().filter(x => x.name === u.name).length;
}
const refreshTop = () => { drawProfile(); drawRental(); };   // dipanggil setelah status sewa berubah

// tab (komponen Tab Bootstrap): riwayat (fitur 9), QR (fitur 6 & 8), ulasan (rating). Isi tiap tab digambar saat tab dibuka.
const DRAW = { history: () => drawHistory(), qr: () => drawQR(), review: () => drawReview() };
const showTab = name => bootstrap.Tab.getOrCreateInstance($('tab-' + name)).show();

if (ok) {
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('shown.bs.tab', () => DRAW[b.dataset.tab]()));
  refreshTop(); drawHistory(); setInterval(tick, 1000);
}
