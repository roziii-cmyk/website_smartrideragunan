// ===== FITUR 5: PEMBAYARAN (simulasi) =====
// Tiga tampilan sudah ada di pembayaran.html (#payNotFound, #payForm, #payDone); JS hanya memilih mana yang ditampilkan.
if (RSR.require('user')) {
  const bk = RSR.findBooking(new URLSearchParams(location.search).get('id'));
  const show = id => ['payNotFound', 'payForm', 'payDone'].forEach(x => $(x).classList.toggle('d-none', x !== id));
  const done = () => { $('doneId').textContent = bk.id; show('payDone'); makeQR($('qr'), bk.id); }; // QR berisi kode booking (fitur 6)
  if (!bk) show('payNotFound');
  else if (bk.status !== 'menunggu_bayar') done();
  else {
    $('payId').textContent = bk.id; $('payTitle').textContent = bk.title + ' (' + bk.code + ')';
    $('payInfo').textContent = bk.shelter + ' · ' + bk.date + ' ' + bk.time + ' · ' + bk.label; $('payTotal').textContent = RSR.rp(bk.total);
    show('payForm');
    $('payBtn').onclick = () => {
      Object.assign(bk, { status: 'dibayar', method: $('method').value, paidAt: Date.now() });
      RSR.saveBooking(bk); RSR.notify('Pembayaran berhasil. Booking ' + bk.id + ' aktif.', 'success'); done();
    };
  }
}
