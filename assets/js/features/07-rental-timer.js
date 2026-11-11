// ===== FITUR 7: TIMER PER BOOKING =====
function drawRental() {
  const active = mine().filter(b => b.status === 'berjalan');
  const waiting = mine().filter(b => b.status === 'menunggu_verifikasi');
  $('rentalEmpty').classList.toggle('d-none', active.length > 0);
  if (!active.length) $('rentalEmptyMsg').textContent = waiting.length
    ? waiting.length + ' booking sedang menunggu admin memverifikasi dan memulai penyewaan.'
    : 'Pilih kendaraan di katalog untuk mulai menyewa.';
  const host = $('rentalCards');
  if (!host) return;
  host.innerHTML = active.map(b => {
    const start = Number(b.startedAt || b.confirmedAt || 0), end = start + Number(b.hours || 1) * 3600000;
    const timerId = 'timer_' + b.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const barId = 'bar_' + b.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `<article class="border rounded-3 p-3"><div class="d-flex flex-wrap justify-content-between gap-2"><div><span class="badge text-bg-success">SEWA BERJALAN</span><h3 class="h6 text-primary mt-2 mb-1">${RSR.esc(b.title)} · ${RSR.esc(b.code)}</h3><div class="small text-muted">Booking: ${RSR.esc(b.id)} · ${RSR.esc(b.shelter || '-')}</div><div class="small">Mulai: ${jam(start)} · Batas: <b>${jam(end)}</b></div></div><div class="text-end"><div class="small text-muted">Sisa waktu</div><div id="${timerId}" class="timer fs-3">00:00:00</div></div></div><div class="progress mt-2"><div id="${barId}" class="progress-bar bg-success" style="width:0%"></div></div><div class="d-flex gap-2 mt-3"><button class="btn btn-sm btn-success" data-extend-booking="${RSR.esc(b.id)}">Perpanjang 1 Jam</button><button class="btn btn-sm btn-outline-danger" data-sos-booking="${RSR.esc(b.id)}">SOS Darurat</button></div></article>`;
  }).join('');
  host.querySelectorAll('[data-extend-booking]').forEach(btn => btn.onclick = () => openExtension(btn.dataset.extendBooking));
  host.querySelectorAll('[data-sos-booking]').forEach(btn => btn.onclick = () => { window.currentSosBooking = btn.dataset.sosBooking; bootstrap.Modal.getOrCreateInstance($('sosModal')).show(); });
  tick();
}
function tick() {
  mine().filter(b => b.status === 'berjalan').forEach(b => {
    const safe = b.id.replace(/[^a-zA-Z0-9_-]/g, '_'), timer = $('timer_' + safe), bar = $('bar_' + safe);
    if (!timer || !bar) return;
    const total = Math.max(1, Number(b.hours || 1) * 3600), end = Number(b.startedAt || b.confirmedAt || Date.now()) + total * 1000;
    const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
    timer.textContent = [Math.floor(left/3600), Math.floor(left%3600/60), left%60].map(x => String(x).padStart(2,'0')).join(':');
    bar.style.width = Math.min(100, Math.max(0, 100 - left / total * 100)) + '%';
    if (left === 0) { timer.classList.add('text-danger'); }
  });
}

// Pembayaran perpanjangan memakai tampilan QRIS/VA simulasi seperti halaman pembayaran utama.
let extensionBookingId = '', extensionCode = '';
function makeExtensionInstruction() {
  const method = $('extendMethod').value, digits = n => Array.from({length:n}, () => Math.floor(Math.random()*10)).join('');
  const isQris = method === 'QRIS';
  $('extendPayTitle').textContent = isQris ? 'QRIS (simulasi)' : 'Virtual Account BCA (simulasi)';
  $('extendQrisVisual').classList.toggle('d-none', !isQris);
  extensionCode = isQris ? 'QR' + digits(12) : '8808' + digits(12);
  $('extendPayNumber').textContent = isQris ? 'Scan QRIS simulasi di atas' : extensionCode;
  $('extendPayNote').textContent = isQris ? 'QRIS ilustrasi, tidak memproses transaksi sungguhan.' : 'Nomor VA contoh, tidak terhubung ke bank sungguhan.';
}
function openExtension(id) {
  const b = RSR.findBooking(id), bike = b && BIKES.find(x => x.code === b.code);
  if (!b || b.status !== 'berjalan' || !bike) return RSR.notify('Booking tidak aktif atau kendaraan tidak ditemukan.', 'danger');
  if (b.extensionRequest?.status === 'menunggu_verifikasi') return RSR.notify('Permintaan perpanjangan sebelumnya masih menunggu persetujuan admin.', 'warning');
  extensionBookingId = id; $('extendPrice').textContent = RSR.rp(bike.unit === 'jam' ? bike.price : 0);
  makeExtensionInstruction(); bootstrap.Modal.getOrCreateInstance($('extendModal')).show();
}
if ($('extendBtn')) $('extendBtn').onclick = () => { const b = running(); if (b) openExtension(b.id); };
if ($('extendMethod')) $('extendMethod').onchange = makeExtensionInstruction;
if ($('extendOk')) $('extendOk').onclick = () => {
  const b = RSR.findBooking(extensionBookingId), bike = b && BIKES.find(x => x.code === b.code);
  if (!b || !bike || b.status !== 'berjalan') return RSR.notify('Booking tidak lagi aktif.', 'danger');
  if (b.extensionRequest?.status === 'menunggu_verifikasi') return RSR.notify('Masih ada permintaan perpanjangan yang menunggu persetujuan.', 'warning');
  b.extensionRequest = { id:'EXT'+Date.now().toString().slice(-8), hours:1, amount:bike.unit==='jam'?bike.price:0, method:$('extendMethod').value, paymentCode:extensionCode, paidAt:Date.now(), paymentStatus:'lunas', submittedAt:Date.now(), status:'menunggu_verifikasi' };
  RSR.saveBooking(b); bootstrap.Modal.getOrCreateInstance($('extendModal')).hide();
  RSR.notify('Simulasi pembayaran perpanjangan berhasil. Status LUNAS, menunggu persetujuan admin.', 'success');
};
if ($('sosBtn')) $('sosBtn').onclick = () => bootstrap.Modal.getOrCreateInstance($('sosModal')).show();
document.querySelectorAll('[data-sos]').forEach(btn => btn.onclick = () => {
  const b = RSR.findBooking(window.currentSosBooking) || running();
  if (b) RSR.event('SOS dari ' + RSR.user().name + ': ' + btn.dataset.sos + ' (' + b.code + ')', 'danger');
  bootstrap.Modal.getOrCreateInstance($('sosModal')).hide();
});
