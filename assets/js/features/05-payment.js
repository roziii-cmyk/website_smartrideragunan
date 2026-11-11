// ===== FITUR 5: PEMBAYARAN MANUAL (SIMULASI LOKAL) =====
if (RSR.require('user')) {
  let bk = RSR.findBooking(new URLSearchParams(location.search).get('id'));
  const show = id => ['payNotFound', 'payForm', 'payDone'].forEach(x => $(x).classList.toggle('d-none', x !== id));
  const done = () => {
    $('doneId').textContent = bk.id;
    const rejected = bk.status === 'pembayaran_ditolak';
    $('paymentStatusText').textContent = rejected
      ? 'Pembayaran ditolak admin: ' + (bk.rejectionNote || 'Silakan hubungi petugas.') + ' Anda dapat mengirim bukti baru.'
      : 'Status: menunggu verifikasi admin. Timer sewa baru dimulai setelah admin menyetujui.';
    show('payDone');
  };
  if (!bk || bk.user !== RSR.user().email) show('payNotFound');
  else if (['menunggu_verifikasi','berjalan','selesai'].includes(bk.status)) done();
  else {
    $('payId').textContent = bk.id; $('payTitle').textContent = bk.title + ' (' + bk.code + ')';
    $('payInfo').textContent = bk.shelter + ' · ' + bk.date + ' ' + bk.time + ' · ' + bk.label;
    $('payTotal').textContent = RSR.rp(bk.total); show('payForm');
    const makePaymentInstruction = () => {
      const method = $('method').value;
      const existing = bk.paymentInstruction;
      if (existing && existing.method === method) return existing;
      const digits = n => Array.from({length:n}, () => Math.floor(Math.random() * 10)).join('');
      let instruction;
      if (method === 'Transfer Bank') {
        instruction = {
          method,
          label: 'Virtual Account BCA (simulasi)',
          number: '8808' + digits(12),
          recipient: 'SMART RAGUNAN RIDE',
          expiresAt: Date.now() + 30 * 60 * 1000
        };
      } else if (method === 'E-Wallet') {
        instruction = {
          method,
          label: 'Kode Pembayaran E-Wallet (simulasi)',
          number: 'SRR' + digits(10),
          recipient: 'SMART RAGUNAN RIDE',
          expiresAt: Date.now() + 30 * 60 * 1000
        };
      } else {
        instruction = {
          method: 'QRIS',
          label: 'QRIS (simulasi)',
          number: 'QR' + digits(12),
          recipient: 'SMART RAGUNAN RIDE',
          expiresAt: Date.now() + 30 * 60 * 1000
        };
      }
      bk.paymentInstruction = instruction;
      RSR.saveBooking(bk);
      return instruction;
    };
    const renderPaymentInstruction = () => {
      const instruction = makePaymentInstruction();
      $('paymentDestinationTitle').textContent = instruction.label;
      const isQris = instruction.method === 'QRIS';
      $('qrisVisual').classList.toggle('d-none', !isQris);
      $('paymentDestination').classList.toggle('d-none', isQris);
      $('paymentDestination').textContent = isQris ? '' : instruction.number;
      $('paymentRecipient').textContent = instruction.recipient;
      $('paymentExpiry').textContent = new Date(instruction.expiresAt).toLocaleString('id-ID');
      $('paymentInstructionNote').textContent = instruction.method === 'Transfer Bank'
        ? 'Masukkan nomor Virtual Account di aplikasi bank. Ini hanya nomor demonstrasi, bukan VA bank yang aktif.'
        : instruction.method === 'E-Wallet'
          ? 'Masukkan kode pembayaran demonstrasi pada alur e-wallet. Kode ini bukan tagihan aktif dari penyedia e-wallet.'
          : 'QR di atas hanya ilustrasi untuk simulasi antarmuka. Ini bukan QRIS merchant dan tidak dapat digunakan untuk transaksi uang sungguhan.';
    };
    $('method').onchange = renderPaymentInstruction;
    renderPaymentInstruction();
    $('payBtn').onclick = () => {
      const file = $('proofFile').files[0];
      if (!file) return RSR.notify('Pilih gambar bukti pembayaran terlebih dahulu.', 'danger');
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) return RSR.notify('Bukti harus berupa JPG, PNG, atau WEBP maksimal 2 MB.', 'danger');
      const reader = new FileReader();
      reader.onload = () => {
        Object.assign(bk, { status: 'menunggu_verifikasi', method: $('method').value, proofData: reader.result, proofName: file.name, proofAt: Date.now() });
        RSR.saveBooking(bk); RSR.notify('Bukti pembayaran dikirim. Menunggu verifikasi admin.', 'success'); done();
      };
      reader.onerror = () => RSR.notify('Gagal membaca file bukti pembayaran.', 'danger');
      reader.readAsDataURL(file);
    };
  }
}
