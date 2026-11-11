// ===== HALAMAN ADMIN: mengisi kerangka admin.html dengan data (fitur 10, 11, 12, 14, rating) =====
function render() {
  drawStats(); drawBookings(); drawBikes(); drawAdminReviews(); updateGeofenceAlerts(); drawRentalMonitor();
  $('events').innerHTML = eventsHTML(8); updateTelemetry(); updateGeofenceAlerts();
}
function drawRentalMonitor() {
  const el=$('rentalMonitorRows'); if(!el) return;
  const rows=RSR.bookings().filter(b=>b.status==='berjalan');
  el.innerHTML=rows.length?rows.map(b=>{
    const start=Number(b.startedAt||b.confirmedAt||0), end=start+Number(b.hours||1)*3600000;
    const remain=end-Date.now(), label=b.status==='selesai'?'SELESAI':remain<=0?'WAKTU HABIS':remain<=10*60000?'HAMPIR HABIS':'AKTIF';
    const time=remain<=0?'00:00:00':[Math.floor(remain/3600000),Math.floor(remain%3600000/60000),Math.floor(remain%60000/1000)].map(v=>String(v).padStart(2,'0')).join(':');
    const totalMs=Math.max(1,Number(b.hours||1)*3600000), progress=label==='SELESAI'?100:Math.min(100,Math.max(0,((Date.now()-start)/totalMs)*100));
    return `<tr><td>${RSR.esc(b.id)}</td><td>${RSR.esc(b.name)}</td><td>${RSR.esc(b.code)}</td><td>${start?new Date(start).toLocaleString('id-ID'):'-'}</td><td>${start?new Date(end).toLocaleString('id-ID'):'-'}</td><td style="min-width:150px"><div class="small mb-1">${time}</div><div class="progress" style="height:9px"><div class="progress-bar bg-success" role="progressbar" style="width:${progress.toFixed(1)}%" aria-valuenow="${progress.toFixed(1)}" aria-valuemin="0" aria-valuemax="100"></div></div><small class="text-muted">${Math.floor(progress)}% terpakai</small></td><td><span class="badge ${label==='WAKTU HABIS'?'text-bg-danger':label==='HAMPIR HABIS'?'text-bg-warning':label==='SELESAI'?'text-bg-secondary':'text-bg-success'}">${label}</span></td></tr>`;
  }).join(''):'<tr><td colspan="7" class="text-muted">Belum ada penyewaan aktif atau selesai.</td></tr>';
}
if (RSR.require('admin')) {
  render();
  window.addEventListener('storage', e => { if (['rsr_bookings', 'rsr_reviews', 'rsr_iotEvents', 'rsr_iotReadings', 'rsr_bikes_v2', 'rsr_offlineCustomers'].includes(e.key)) render(); }); // data berubah di tab lain
  setInterval(() => { $('events').innerHTML = eventsHTML(8); updateTelemetry(); updateGeofenceAlerts(); drawRentalMonitor(); drawStats(); }, 1000);
}
