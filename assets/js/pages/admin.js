// ===== HALAMAN ADMIN: mengisi kerangka admin.html dengan data (fitur 10, 11, 12, 14, rating) =====
function render() {
  drawStats(); drawBookings(); drawBikes(); drawAdminReviews();
  $('events').innerHTML = eventsHTML(8); updateTelemetry();
}
if (RSR.require('admin')) {
  render();
  window.addEventListener('storage', e => { if (['rsr_bookings', 'rsr_reviews', 'rsr_iotEvents'].includes(e.key)) render(); }); // data berubah di tab lain
  setInterval(() => { $('events').innerHTML = eventsHTML(8); updateTelemetry(); }, 2000);
}
