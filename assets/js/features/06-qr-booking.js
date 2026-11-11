// ===== FITUR 6: QR CODE BOOKING =====
// QR berisi kode booking; petugas mencocokkannya di halaman admin. Library: qrcodejs.
const makeQR = (el, text, size = 180) => { el.innerHTML = ''; new QRCode(el, { text, width: size, height: size }); };

// tab "QR Booking" di dashboard (kerangkanya ada di dashboard.html)
function drawQR() {
  const b = mine().filter(x => x.status === 'dibayar' || x.status === 'berjalan').pop();
  $('qrEmpty').classList.toggle('d-none', !!b); $('qrContent').classList.toggle('d-none', !b);
  if (!b) return;
  $('qrId').textContent = b.id; $('qrInfo').textContent = `${b.title} · ${b.shelter} · ${b.date} ${b.time}`;
  makeQR($('qrBox'), b.id, 160);
  $('qrWait').classList.toggle('d-none', b.status !== 'dibayar');      // belum diverifikasi petugas
  $('returnBtn').classList.toggle('d-none', b.status !== 'berjalan');  // sewa jalan -> boleh dikembalikan
  $('returnBtn').onclick = () => { finishRental(b); refreshTop(); rateBooking(b.id); RSR.notify('Sewa selesai! Silakan beri rating.', 'info'); }; // fitur 8
}
