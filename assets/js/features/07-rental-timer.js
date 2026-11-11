// ===== FITUR 7: TIMER PENYEWAAN =====
// Kartu "sewa aktif" ada di dashboard.html. Sisa waktu = waktu mulai + durasi - waktu sekarang (dihitung ulang tiap detik).
function drawRental() {
  const r = running(), wait = mine().find(b => b.status === 'dibayar');
  $('rentalActive').classList.toggle('d-none', !r); $('rentalEmpty').classList.toggle('d-none', !!r);
  if (!r) return $('rentalEmptyMsg').textContent = wait ? 'Booking ' + wait.id + ' sudah dibayar. Tunjukkan QR ke petugas untuk memulai sewa.' : 'Pilih kendaraan di katalog untuk mulai menyewa.';
  $('rentalOrder').textContent = r.id; $('rentalBike').textContent = r.title + ' #' + r.code; $('rentalShelter').textContent = r.shelter;
  $('rentalStart').textContent = jam(r.startedAt); $('rentalEnd').textContent = jam(r.startedAt + r.hours * 3600000);
  tick();
}
function tick() {
  const r = running(); if (!r || !$('timer')) return;
  const total = r.hours * 3600, s = Math.max(0, Math.floor((r.startedAt + total * 1000 - Date.now()) / 1000));
  $('timer').innerText = [s / 3600, (s % 3600) / 60, s % 60].map(x => String(Math.floor(x)).padStart(2, '0')).join(':');
  $('bar').style.width = Math.min(100, 100 - (s / total) * 100) + '%';
}

if ($('extendBtn')) {
  const modal = id => bootstrap.Modal.getOrCreateInstance($(id)); // pop-up Bootstrap (ada di dashboard.html)
  // perpanjang 1 jam
  $('extendBtn').onclick = () => { const k = BIKES.find(b => b.code === running().code); $('extendPrice').textContent = k.unit === 'jam' ? RSR.rp(k.price) : 'Rp 0'; modal('extendModal').show(); };
  $('extendOk').onclick = () => {
    const r = running(), k = BIKES.find(b => b.code === r.code);
    r.hours += 1; if (k.unit === 'jam') { r.total += k.price; r.label = r.hours + ' Jam'; }
    RSR.saveBooking(r); modal('extendModal').hide(); refreshTop(); RSR.notify('Durasi sewa ditambah 1 jam.', 'success');
  };
  // SOS darurat: kejadian disimpan dan dikirim ke admin
  $('sosBtn').onclick = () => modal('sosModal').show();
  document.querySelectorAll('[data-sos]').forEach(b => b.onclick = () => {
    RSR.event('SOS dari ' + RSR.user().name + ': ' + b.dataset.sos + ' (' + running().code + ')', 'danger'); modal('sosModal').hide();
  });
}
