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
function scan(bike, rented, force, readingKey = bike.code) {
  const readings = RSR.get('iotReadings', {});
  const prev = readings[readingKey] || readings[bike.code];
  const outside = rented && (force === 'geofence' || Math.random() < 0.003);
  // Koordinat demo di sekitar Ragunan; untuk lokasi nyata, hubungkan ke modul GPS.
  const center = { lat: -6.3125, lng: 106.8200 };
  const angle = Math.random() * Math.PI * 2;
  const radius = outside ? 0.014 : 0.001 + Math.random() * 0.004;
  const latitude = +(center.lat + Math.cos(angle) * radius).toFixed(6);
  const longitude = +(center.lng + Math.sin(angle) * radius).toFixed(6);
  const r = {
    code: bike.code, dock: !rented,
    accel: +(9.81 + Math.random() * 0.3 + (force === 'shake' || Math.random() < 0.005 ? 3 + Math.random() * 5 : 0)).toFixed(2),
    outside, latitude, longitude, locationTime: Date.now(),
    activityStatus: outside ? 'Keluar dari area yang diizinkan' : (rented ? 'Sedang digunakan' : 'Terparkir'),
    battery: Math.max(5, (prev?.battery ?? 60 + Math.floor(Math.random() * 40)) - (Math.random() < 0.05 ? 1 : 0)), t: Date.now()
  };
  if (r.dock && r.accel > IOT_LIMIT) alertOnce('shake' + readingKey, 'Getaran mencurigakan terdeteksi pada ' + bike.code + ' saat terparkir di dock', 'danger');
  if (r.outside) alertOnce('geo' + readingKey, bike.code + ' keluar dari perimeter Ragunan. Koordinat: ' + r.latitude + ', ' + r.longitude, 'danger');
  if (r.battery <= 20) alertOnce('bat' + readingKey, 'Baterai ' + bike.code + ' rendah (' + r.battery + '%)', 'info', 300000);
  return r;
}
function scanFleet(force = {}) {
  // Satu record sensor per booking aktif, sehingga kendaraan sejenis yang disewa
  // oleh customer berbeda tetap memiliki lokasi dan marker masing-masing.
  const activeBookings = RSR.bookings().filter(b => b.status === 'berjalan' && (b.paymentStatus === 'lunas' || b.offline === true));
  const previous = RSR.get('iotReadings', {});
  const all = {};
  activeBookings.forEach(booking => {
    const bike = BIKES.find(item => item.code === booking.code) || {
      code: booking.code || 'KENDARAAN', title: booking.vehicleName || booking.bikeName || 'Kendaraan'
    };
    const key = String(booking.id);
    const reading = scan(bike, true, force[key], key);
    reading.bookingId = key;
    reading.renterName = booking.name || booking.customerName || 'Customer';
    reading.bookingSource = booking.offline ? 'Offline / Manual' : 'Online';
    reading.bookingCode = booking.code || bike.code;
    reading.rentalStartedAt = booking.startedAt || booking.created || booking.createdAt || null;
    reading.rentalHours = booking.hours || booking.duration || null;
    all[key] = reading;
  });
  // Simpan record legacy per kode kendaraan agar widget telemetri dashboard lama
  // tetap bekerja, tanpa menjadikannya sumber marker peta.
  BIKES.forEach(bike => {
    const booking = activeBookings.find(item => item.code === bike.code);
    if (booking && all[String(booking.id)]) all[bike.code] = { ...all[String(booking.id)] };
    else if (previous[bike.code]) all[bike.code] = { ...previous[bike.code], dock: true, activityStatus: 'Terparkir', bookingId: null, renterName: null };
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
