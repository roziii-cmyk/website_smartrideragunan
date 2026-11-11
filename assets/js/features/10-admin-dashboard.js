// ===== FITUR 10: DASHBOARD ADMIN =====
// Kartu statistik ada di admin.html; angkanya dihitung dari data nyata.
function drawStats() {
  const all = RSR.bookings(), count = s => all.filter(b => b.status === s).length;
  $('sTotal').textContent = all.length; $('sRunning').textContent = count('berjalan'); $('sWaiting').textContent = count('dibayar');
  $('sIncome').textContent = RSR.rp(all.filter(b => b.status !== 'menunggu_bayar').reduce((t, b) => t + b.total, 0)); // pendapatan = total booking yang sudah dibayar
}
function updateTelemetry() { // bacaan sensor terakhir salah satu unit
  const r = RSR.get('iotReadings', {})['RGN-EB03']; if (!r) return;
  $('telemetryLog').textContent = JSON.stringify({ bike_id: r.code, accel_z: r.accel, vibration: r.accel > IOT_LIMIT ? 'ALERT' : 'NORMAL', dock_ir: r.dock ? 1 : 0, battery_pct: r.battery, geofence_status: r.outside ? 'OUTSIDE_DEMO_RADIUS' : 'INSIDE_DEMO_RADIUS', latitude: r.lat, longitude: r.lng, google_maps: `https://www.google.com/maps?q=${r.lat},${r.lng}` }, null, 2);
}
