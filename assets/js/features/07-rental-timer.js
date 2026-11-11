// ===== FITUR 7: TIMER PENYEWAAN =====
// Kartu "sewa aktif" ada di dashboard.html. Sisa waktu = waktu mulai + durasi - waktu sekarang (dihitung ulang tiap detik).
function drawRental() {
  const r = running(), wait = mine().find(b => b.status === 'menunggu_verifikasi');
  $('rentalActive').classList.toggle('d-none', !r); $('rentalEmpty').classList.toggle('d-none', !!r);
  if (!r) return $('rentalEmptyMsg').textContent = wait ? 'Booking ' + wait.id + ' sudah dikirim. Menunggu admin memverifikasi pembayaran sebelum timer dimulai.' : 'Pilih kendaraan di katalog untuk mulai menyewa.';
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
  const modal = id => bootstrap.Modal.getOrCreateInstance($(id));
  let extensionCode = '';
  const makeExtensionInstruction = () => {
    const method = $('extendMethod').value;
    const digits = n => Array.from({length:n}, () => Math.floor(Math.random() * 10)).join('');
    const instruction = method === 'Transfer Bank'
      ? { title: 'Virtual Account BCA (simulasi)', number: '8808' + digits(12), note: 'Nomor VA demonstrasi, bukan VA bank aktif.' }
      : method === 'E-Wallet'
        ? { title: 'Kode E-Wallet (simulasi)', number: 'SRR' + digits(10), note: 'Kode demonstrasi, tidak terhubung ke penyedia e-wallet.' }
        : { title: 'Kode QRIS (simulasi)', number: 'QR' + digits(12), note: 'Kode demonstrasi, bukan QRIS merchant aktif.' };
    $('extendPayTitle').textContent = instruction.title;
    $('extendPayNumber').textContent = instruction.number;
    $('extendPayNote').textContent = instruction.note;
    extensionCode = instruction.number;
  };
  $('extendBtn').onclick = () => {
    const r = running(), k = r && BIKES.find(b => b.code === r.code);
    if (!r || !k) return;
    if (r.extensionRequest && r.extensionRequest.status === 'menunggu_verifikasi') return RSR.notify('Permintaan perpanjangan sebelumnya masih menunggu verifikasi admin.', 'warning');
    $('extendPrice').textContent = k.unit === 'jam' ? RSR.rp(k.price) : 'Rp 0';
    $('extendProof').value = '';
    makeExtensionInstruction();
    modal('extendModal').show();
  };
  $('extendMethod').onchange = makeExtensionInstruction;
  $('extendOk').onclick = () => {
    const r = running(), k = r && BIKES.find(b => b.code === r.code), file = $('extendProof').files[0];
    if (!r || !k) return RSR.notify('Tidak ada sewa aktif yang dapat diperpanjang.', 'danger');
    if (r.extensionRequest && r.extensionRequest.status === 'menunggu_verifikasi') return RSR.notify('Masih ada permintaan perpanjangan yang menunggu verifikasi.', 'warning');
    if (!file) return RSR.notify('Unggah bukti pembayaran terlebih dahulu.', 'danger');
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) return RSR.notify('Bukti harus JPG, PNG, atau WEBP maksimal 2 MB.', 'danger');
    const reader = new FileReader();
    reader.onload = () => {
      const amount = k.unit === 'jam' ? k.price : 0;
      r.extensionRequest = {
        id: 'EXT' + Date.now().toString().slice(-8), hours: 1, amount,
        method: $('extendMethod').value, paymentCode: extensionCode,
        proofData: reader.result, proofName: file.name, submittedAt: Date.now(),
        status: 'menunggu_verifikasi'
      };
      RSR.saveBooking(r); modal('extendModal').hide(); refreshTop();
      RSR.notify('Bukti perpanjangan dikirim. Durasi belum bertambah sampai admin menyetujui.', 'success');
    };
    reader.onerror = () => RSR.notify('Gagal membaca bukti pembayaran.', 'danger');
    reader.readAsDataURL(file);
  };
  // SOS darurat: kejadian disimpan dan dikirim ke admin
  $('sosBtn').onclick = () => modal('sosModal').show();
  document.querySelectorAll('[data-sos]').forEach(b => b.onclick = () => {
    RSR.event('SOS dari ' + RSR.user().name + ': ' + b.dataset.sos + ' (' + running().code + ')', 'danger'); modal('sosModal').hide();
  });
}
