// ===== FITUR 14: DETEKSI AKTIVITAS SEPEDA =====
// Di perangkat asli: ESP32 membaca sensor (MPU6050 = getar, IR = dock) lalu mengirim hasilnya lewat MQTT.
// Di prototipe ini browser admin MENIRU ESP32: membuat bacaan sensor tiap 2 detik dan menjalankan ATURAN yang sama.
// Peringatan muncul otomatis tanpa tombol. Untuk data sungguhan, cukup ganti scan() dengan data dari server.
const IOT_LIMIT = 12;                          // getaran (m/s²) di atas ini = guncangan keras
const tabId = Math.random().toString(36).slice(2);
const cool = {};                                // cegah peringatan beruntun untuk hal yang sama
function alertOnce(key, text, type, ms = 60000) {
  if (Date.now() - (cool[key] || 0) < ms) return;
  cool[key] = Date.now(); RSR.event(text, type);
}
// 1 pembacaan sensor + aturan deteksi. force: 'shake' | 'geofence' untuk uji coba
function scan(bike, rented, force) {
  const prev = RSR.get('iotReadings', {})[bike.code];
  const outside = rented && (force === 'geofence' || Math.random() < 0.003);
  // Koordinat demo di sekitar Ragunan; untuk lokasi nyata, hubungkan ke modul GPS.
  const center = { lat: -6.3125, lng: 106.8200 };
  const angle = Math.random() * Math.PI * 2;
  const radius = outside ? 0.014 : 0.001 + Math.random() * 0.004;
  const latitude = +(center.lat + Math.cos(angle) * radius).toFixed(6);
  const longitude = +(center.lng + Math.sin(angle) * radius).toFixed(6);
  const r = {
    code: bike.code, dock: !rented,                                               // sensor IR: unit ada di slot dock?
    accel: +(9.81 + Math.random() * 0.3 + (force === 'shake' || Math.random() < 0.005 ? 3 + Math.random() * 5 : 0)).toFixed(2),
    outside,                                                                       // keluar area Ragunan?
    latitude, longitude, locationTime: Date.now(),
    activityStatus: outside ? 'Keluar dari area yang diizinkan' : (rented ? 'Sedang digunakan' : 'Terparkir'),
    battery: Math.max(5, (prev?.battery ?? 60 + Math.floor(Math.random() * 40)) - (Math.random() < 0.05 ? 1 : 0)), t: Date.now()
  };
  // --- aturan deteksi otomatis ---
  if (r.dock && r.accel > IOT_LIMIT) alertOnce('shake' + r.code, 'Getaran mencurigakan terdeteksi pada ' + r.code + ' saat terparkir di dock', 'danger');
  if (r.outside) alertOnce('geo' + r.code, r.code + ' keluar dari perimeter Ragunan (geofence). Koordinat: ' + r.latitude + ', ' + r.longitude, 'danger');
  if (r.battery <= 20) alertOnce('bat' + r.code, 'Baterai ' + r.code + ' rendah (' + r.battery + '%)', 'info', 300000);
  return r;
}
function scanFleet(force = {}) {
  const activeBookings = RSR.bookings().filter(b => b.status === 'berjalan');
  const all = RSR.get('iotReadings', {});
  BIKES.forEach(b => {
    const booking = activeBookings.find(x => x.code === b.code);
    const reading = scan(b, Boolean(booking), force[b.code]);
    reading.renterName = booking?.name || booking?.customerName || '—';
    reading.bookingId = booking?.id || '—';
    reading.bookingCode = booking?.code || b.code;
    reading.rentalStartedAt = booking?.startedAt || booking?.createdAt || null;
    reading.rentalHours = booking?.hours || null;
    all[b.code] = reading;
  });
  RSR.set('iotReadings', all);
}
if (!Object.keys(RSR.get('iotReadings', {})).length) scanFleet(); // bacaan pertama langsung dibuat agar halaman tidak kosong
// jalan otomatis tiap 2 detik; bila admin membuka 2 tab, hanya satu yang menjalankan simulasi
setInterval(() => {
  const lock = RSR.get('iotLock', {});
  if (lock.id && lock.id !== tabId && Date.now() - lock.t < 5000) return;
  RSR.set('iotLock', { id: tabId, t: Date.now() }); scanFleet();
}, 2000);

// daftar peringatan terbaru (dipakai halaman admin & IoT)
const eventsHTML = (n = 8) => RSR.events().slice(0, n).map(e => `<p class="border-top py-1 small mb-0 ${e.type === 'danger' ? 'text-danger' : ''}">${new Date(e.t).toLocaleTimeString('id-ID')} · ${RSR.esc(e.text)}</p>`).join('') || '<p class="text-muted mb-0">Belum ada peringatan.</p>';
