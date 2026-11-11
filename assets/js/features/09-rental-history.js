// ===== FITUR 9: RIWAYAT PENYEWAAN =====
// Tabelnya ada di dashboard.html (#historyRows); baris diisi dari booking milik akun yang login.
const STATUS = { menunggu_bayar: 'Menunggu bayar', dibayar: 'Dibayar', berjalan: 'Berjalan', selesai: 'Selesai' };
function drawHistory() {
  const rated = new Set(RSR.reviews().map(r => r.bookingId)), all = mine().slice().reverse();
  $('historyRows').innerHTML = all.map(b => `<tr><td>${b.id}</td><td>${RSR.esc(b.title)}</td><td>${b.date}</td><td>${RSR.rp(b.total)}</td><td>${STATUS[b.status]}</td>
    <td>${b.status !== 'selesai' ? '' : rated.has(b.id) ? '★ Sudah dinilai' : `<button class="btn btn-sm btn-outline-success" onclick="rateBooking('${b.id}')">Beri Rating</button>`}</td></tr>`).join('');
  $('historyEmpty').classList.toggle('d-none', all.length > 0);
}
