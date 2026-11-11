// ===== FITUR 4: BOOKING SEPEDA =====
// Pop-up booking (Bootstrap modal) ada di katalog.html. Pilih jumlah, hitung harga, simpan pesanan (status menunggu_bayar), lanjut ke pembayaran.
let cur = null, qty = 1;  // kendaraan yang sedang di-booking & jumlah (jam/orang/trip)

function openBooking(code) {
  cur = BIKES.find(b => b.code === code);
  if (cur.status !== 'Tersedia') return RSR.notify(cur.title + ' sedang ' + cur.status.toLowerCase() + ', belum bisa dipesan.', 'danger');
  qty = 1;
  $('modalBikeCode').textContent = cur.code; $('modalBikeTitle').textContent = cur.title; $('modalBikeShelter').textContent = cur.shelter;
  $('modalBikeImg').onerror = () => { $('modalBikeImg').onerror = null; $('modalBikeImg').src = cur.fb; }; $('modalBikeImg').src = cur.img;
  $('rentalDate').value = $('rentalDate').min = new Date().toISOString().slice(0, 10);
  if (RSR.user() && !$('custName').value) $('custName').value = RSR.user().name;
  document.querySelectorAll('.duration-pill').forEach(p => p.onclick = () => { qty = +p.dataset.hours; showTotal(); });
  showTotal();
  bootstrap.Modal.getOrCreateInstance($('bookingModal')).show();
}

// hitung harga: tarif x jumlah + jaminan (jika ada)
const priceOf = () => ({ sub: cur.price * qty, total: cur.price * qty, label: qty + ' ' + UNIT_LABEL[cur.unit] });
function showTotal() {
  const t = priceOf();
  document.querySelectorAll('.duration-pill').forEach(p => {
    const on = +p.dataset.hours === qty;
    p.classList.toggle('btn-primary', on); p.classList.toggle('btn-outline-primary', !on);
    p.textContent = p.dataset.hours + ' ' + UNIT_LABEL[cur.unit];
  });
  $('calcHoursLabel').textContent = t.label; $('calcBasePrice').textContent = RSR.rp(cur.price);
  $('calcSubtotal').textContent = RSR.rp(t.sub); $('calcTotalPayment').textContent = RSR.rp(t.total);
  if ($('depositRow')) $('depositRow').classList.add('d-none');
}
// simpan pesanan lalu lanjut ke halaman pembayaran
function confirmBooking() {
  if (!RSR.require('user')) return;
  const t = priceOf(), id = 'BK' + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
  RSR.saveBooking({
    id, user: RSR.user().email, name: $('custName').value || RSR.user().name, phone: $('custPhone').value,
    code: cur.code, title: cur.title, shelter: cur.shelter, qty, label: t.label, hours: cur.unit === 'jam' ? qty : 1,
    date: $('rentalDate').value, time: $('rentalStartTime').value || '09:00', total: t.total, status: 'menunggu_bayar', paymentStatus: 'belum', isPaymentDraft: true, draftSavedAt: Date.now(), created: Date.now()
  });
  location.href = 'pembayaran.html?id=' + id;
}
$('btnConfirmPay').onclick = confirmBooking;

const want = new URLSearchParams(location.search).get('book'); // dari tombol "Booking Sekarang" di halaman detail
if (want && BIKES.some(b => b.code === want)) openBooking(want);
