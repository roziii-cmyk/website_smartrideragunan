// ===== FITUR 10: DASHBOARD ADMIN =====
// Kartu statistik ada di admin.html; angkanya dihitung dari data nyata.
function drawStats() {
  const all = RSR.bookings(), count = s => all.filter(b => b.status === s).length;
  $('sTotal').textContent = all.length; $('sRunning').textContent = count('berjalan'); $('sWaiting').textContent = count('menunggu_verifikasi');
  $('sIncome').textContent = RSR.rp(all.filter(b => ['berjalan','selesai'].includes(b.status)).reduce((t, b) => t + b.total, 0)); // pendapatan = total booking yang sudah dibayar
}
function updateTelemetry() { // bacaan sensor terakhir salah satu unit
  const r = RSR.get('iotReadings', {})['RGN-EB03']; if (!r) return;
  $('telemetryLog').textContent = JSON.stringify({ bike_id: r.code, accel_z: r.accel, vibration: r.accel > IOT_LIMIT ? 'ALERT' : 'NORMAL', dock_ir: r.dock ? 1 : 0, battery_pct: r.battery, geofence_status: r.outside ? 'OUTSIDE_PARK' : 'INSIDE_PARK' }, null, 2);
}


// Menampilkan detail kendaraan yang terdeteksi keluar area.
function updateGeofenceAlerts() {
  const container = $('geofenceAlerts');
  if (!container) return;
  const readings = RSR.get('iotReadings', {});
  const alerts = BIKES
    .filter(bike => readings[bike.code] && readings[bike.code].outside)
    .map(bike => ({ bike, reading: readings[bike.code] }));

  if (!alerts.length) {
    container.innerHTML = '<p class="small text-muted mb-0">Belum ada kendaraan yang terdeteksi keluar area.</p>';
    return;
  }

  container.innerHTML = alerts.map(({ bike, reading }) => {
    const lat = Number(reading.latitude);
    const lng = Number(reading.longitude);
    const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);
    const detectedAt = reading.locationTime
      ? new Date(reading.locationTime).toLocaleString('id-ID')
      : '-';
    const status = reading.activityStatus || 'Keluar dari area yang diizinkan';
    const mapsUrl = hasLocation
      ? 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(lat + ',' + lng)
      : '';

    return `
      <div class="border border-danger rounded-3 p-3 mb-2">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <strong class="text-danger">${RSR.esc(bike.code)} · ${RSR.esc(bike.title)}</strong>
          <span class="badge text-bg-danger">Keluar area</span>
        </div>
        <div class="row g-2 small">
          <div class="col-md-6">
            <span class="text-muted">Lokasi terakhir</span><br>
            <strong>${hasLocation ? lat + ', ' + lng : 'Koordinat belum tersedia'}</strong>
          </div>
          <div class="col-md-6">
            <span class="text-muted">Waktu terakhir terdeteksi</span><br>
            <strong>${RSR.esc(detectedAt)}</strong>
          </div>
          <div class="col-md-6">
            <span class="text-muted">Kode kendaraan</span><br>
            <strong>${RSR.esc(bike.code)}</strong>
          </div>
          <div class="col-md-6">
            <span class="text-muted">Status aktivitas</span><br>
            <strong>${RSR.esc(status)}</strong>
          </div>
        </div>
        ${hasLocation ? `<a class="btn btn-sm btn-danger mt-3" href="${mapsUrl}" target="_blank" rel="noopener"><i class="bi bi-geo-alt-fill me-1"></i>Navigasi ke lokasi kendaraan</a>` : ''}
      </div>`;
  }).join('');
}
