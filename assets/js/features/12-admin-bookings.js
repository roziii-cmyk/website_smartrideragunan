// ===== FITUR 12: MANAJEMEN BOOKING & VERIFIKASI PEMBAYARAN =====
function act(id, to, note = '') {
  const b = RSR.findBooking(id.trim().toUpperCase());
  if (!b) return RSR.notify('Booking ' + id + ' tidak ditemukan', 'danger');
  if (to === 'berjalan' && !(b.paymentStatus === 'lunas' || ['menunggu_verifikasi','dibayar'].includes(b.status))) return RSR.notify('Pembayaran belum LUNAS. Penyewaan belum dapat dimulai.', 'danger');
  if (to === 'pembayaran_ditolak' && b.status !== 'menunggu_verifikasi') return RSR.notify('Booking tidak sedang menunggu verifikasi.', 'danger');
  if (to === 'selesai' && b.status !== 'berjalan') return RSR.notify('Sewa belum berjalan', 'danger');
  if (to === 'berjalan') Object.assign(b, { status: 'berjalan', paymentStatus: 'lunas', verifiedAt: Date.now(), confirmedAt: Date.now(), startedAt: Date.now() });
  else if (to === 'pembayaran_ditolak') Object.assign(b, { status: to, paymentStatus: 'rejected', rejectionNote: note || 'Bukti pembayaran tidak sesuai.', rejectedAt: Date.now() });
  else finishRental(b);
  RSR.saveBooking(b); RSR.notify(to === 'berjalan' ? 'Pembayaran disetujui. Timer sewa ' + b.id + ' dimulai sekarang.' : to === 'pembayaran_ditolak' ? 'Pembayaran booking ' + b.id + ' ditolak.' : 'Pengembalian ' + b.id + ' dikonfirmasi', to === 'pembayaran_ditolak' ? 'warning' : 'success'); render();
}
function actExtension(id, approve, note = '') {
  const b = RSR.findBooking(id);
  const ext = b && b.extensionRequest;
  if (!b || !ext || ext.status !== 'menunggu_verifikasi') return RSR.notify('Permintaan perpanjangan tidak ditemukan atau sudah diproses.', 'danger');
  if (approve) {
    if (ext.paymentStatus !== 'lunas') return RSR.notify('Pembayaran perpanjangan belum LUNAS.', 'danger');
    b.hours = Number(b.hours || 0) + Number(ext.hours || 1);
    b.total = Number(b.total || 0) + Number(ext.amount || 0);
    b.label = b.hours + ' Jam';
    ext.status = 'disetujui'; ext.paymentStatus = ext.paymentStatus || 'lunas';
    ext.verifiedAt = Date.now();
    ext.verifiedBy = RSR.user().email;
    ext.rejectionNote = '';
  } else {
    ext.status = 'ditolak';
    ext.verifiedAt = Date.now();
    ext.rejectionNote = note || 'Bukti pembayaran perpanjangan tidak sesuai.';
  }
  RSR.saveBooking(b);
  RSR.notify(approve ? 'Perpanjangan disetujui. Durasi sewa bertambah 1 jam.' : 'Pembayaran perpanjangan ditolak.', approve ? 'success' : 'warning');
  render();
}
function rejectExtension(id) {
  const note = prompt('Alasan penolakan perpanjangan:', 'Bukti pembayaran tidak jelas atau nominal tidak sesuai.');
  if (note === null) return;
  actExtension(id, false, note.trim());
}
function drawBookings() {
  const all = RSR.bookings().filter(b => b.status !== 'selesai' && b.status !== 'dibatalkan');
  $('bookingRows').innerHTML = all.slice().reverse().map(b => {
    const ext = b.extensionRequest;
    const payStatus = b.paymentStatus === 'lunas' || ['menunggu_verifikasi','berjalan','selesai'].includes(b.status) ? '<span class="badge text-bg-success">LUNAS</span>' : '<span class="badge text-bg-danger">BELUM</span>';
    const proof = `<div class="small">${b.method ? RSR.esc(b.method) : 'Simulasi'}${ext ? `<br>Perpanjangan: ${RSR.esc(ext.method || 'QRIS')} · ${RSR.esc(ext.paymentStatus || 'menunggu pembayaran').toUpperCase()}` : ''}</div>`;
    let actions = b.status === 'menunggu_verifikasi' ? `<button class="btn btn-sm btn-success mb-1" onclick="act('${b.id}','berjalan')">Setujui & Mulai Sewa</button> <button class="btn btn-sm btn-outline-danger mb-1" onclick="rejectPayment('${b.id}')">Tolak</button>` : b.status === 'berjalan' ? `<button class="btn btn-sm btn-outline-success" onclick="act('${b.id}','selesai')">Selesai</button>` : '';
    if (ext?.status === 'menunggu_verifikasi') actions += `<div class="border-top mt-2 pt-2"><small class="d-block">Perpanjangan +${ext.hours} jam · ${RSR.rp(ext.amount)}</small><button class="btn btn-sm btn-success mb-1" onclick="actExtension('${b.id}',true)">Setujui Perpanjangan</button> <button class="btn btn-sm btn-outline-danger mb-1" onclick="rejectExtension('${b.id}')">Tolak Perpanjangan</button></div>`;
    else if (ext?.status === 'ditolak') actions += `<div><small class="text-danger">Perpanjangan ditolak</small></div>`;
    else if (ext?.status === 'disetujui') actions += `<div><small class="text-success">Perpanjangan disetujui</small></div>`;
    const stamp=v=>v?new Date(Number(v)).toLocaleString('id-ID'):'-';
    return `<tr><td>${RSR.esc(b.id)}</td><td>${RSR.esc(b.name)}</td><td>${RSR.esc(b.code)}</td><td>${RSR.esc(b.date)} ${RSR.esc(b.time)}</td><td>${stamp(b.created||b.createdAt||b.draftSavedAt)}</td><td>${stamp(b.paidAt)}</td><td>${RSR.rp(b.total)}</td><td>${payStatus}</td><td>${RSR.esc(b.status)}</td><td>${proof}</td><td>${actions}</td></tr>`;
  }).join('');
  $('bookingEmpty').classList.toggle('d-none', all.length > 0);
}
function rejectPayment(id) {
  const note = prompt('Alasan penolakan pembayaran:','Bukti pembayaran tidak jelas atau nominal tidak sesuai.');
  if (note === null) return;
  act(id, 'pembayaran_ditolak', note.trim() || 'Bukti pembayaran tidak sesuai.');
}
$('btnVerify').onclick = () => act($('bookingId').value, 'berjalan');
$('btnReturn').onclick = () => act($('bookingId').value, 'selesai');
