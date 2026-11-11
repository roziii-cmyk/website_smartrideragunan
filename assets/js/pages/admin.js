// ===== HALAMAN ADMIN: mengisi kerangka admin.html dengan data (fitur 10, 11, 12, 14, rating) =====
function render() {
  drawStats(); drawBookings(); drawBikes(); drawAdminReviews(); updateGeofenceAlerts();
  $('events').innerHTML = eventsHTML(8); updateTelemetry(); updateGeofenceAlerts();
}
if (RSR.require('admin')) {
  render();
  window.addEventListener('storage', e => { if (['rsr_bookings', 'rsr_reviews', 'rsr_iotEvents', 'rsr_iotReadings'].includes(e.key)) render(); }); // data berubah di tab lain
  setInterval(() => { $('events').innerHTML = eventsHTML(8); updateTelemetry(); updateGeofenceAlerts(); }, 2000);
}
