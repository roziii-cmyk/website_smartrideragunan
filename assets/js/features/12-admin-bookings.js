// ===== FITUR 12: MANAJEMEN BOOKING =====
// Admin memverifikasi pengambilan (dibayar -> berjalan) dan pengembalian (berjalan -> selesai).
// Urutan status dicek supaya tidak bisa melompat.
function act(id, to) {
  const b = RSR.findBooking(id.trim().toUpperCase());
  if (!b) return RSR.notify('Booking ' + id + ' tidak ditemukan', 'danger');
  if (to === 'berjalan' && b.status !== 'dibayar') return RSR.notify('Booking harus berstatus Dibayar (sekarang: ' + b.status + ')', 'danger');
  if (to === 'selesai' && b.status !== 'berjalan') return RSR.notify('Sewa belum berjalan', 'danger');
  if (to === 'berjalan') Object.assign(b, { status: 'berjalan', startedAt: Date.now() }); else finishRental(b); // fitur 8
  RSR.saveBooking(b); RSR.notify(to === 'berjalan' ? 'Pengambilan ' + b.id + ' diverifikasi' : 'Pengembalian ' + b.id + ' dikonfirmasi', 'success'); render();
}

function drawBookings() {
  const all = RSR.bookings();
  $('bookingRows').innerHTML = all.slice().reverse().map(b => `<tr><td>${b.id}</td><td>${RSR.esc(b.name)}</td><td>${b.code}</td><td>${b.date} ${b.time}</td><td>${RSR.rp(b.total)}</td><td>${b.status}</td>
    <td>${b.status === 'dibayar' ? `<button class="btn btn-sm btn-outline-primary" onclick="act('${b.id}','berjalan')">Verifikasi</button>` : b.status === 'berjalan' ? `<button class="btn btn-sm btn-outline-success" onclick="act('${b.id}','selesai')">Selesai</button>` : ''}</td></tr>`).join('');
  $('bookingEmpty').classList.toggle('d-none', all.length > 0);
}
$('btnVerify').onclick = () => act($('bookingId').value, 'berjalan');
$('btnReturn').onclick = () => act($('bookingId').value, 'selesai');
