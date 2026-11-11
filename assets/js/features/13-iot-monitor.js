// ===== FITUR 13: MONITORING IoT =====
// Tampilan peta dipertahankan; ditambahkan identitas penyewa dan lokasi setiap unit aktif.
if (RSR.require('admin')) {
  $('limit').textContent = IOT_LIMIT;
  $('iotBike').innerHTML = BIKES.map(b => `<option value="${b.code}">${b.code} - ${b.title}</option>`).join('');
  $('btnShake').onclick = () => { scanFleet({ [$('iotBike').value]: 'shake' }); draw(); };
  $('btnGeo').onclick = () => { scanFleet({ [$('iotBike').value]: 'geofence' }); draw(); };

  const map = L.map('fleetMap').setView([-6.3125, 106.8200], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  L.circle([-6.3125, 106.8200], { radius: 850, color: '#dc3545', weight: 2, fillColor: '#dc3545', fillOpacity: .06 }).addTo(map);
  const markers = {};

  function popupFor(b, r) {
    const esc = RSR.esc;
    return `<b>${esc(b.code)} · ${esc(b.title)}</b><br>` +
      `Penyewa: ${esc(r.renterName || '—')}<br>` +
      `ID Booking: ${esc(r.bookingId || '—')}<br>` +
      `Koordinat: ${r.latitude}, ${r.longitude}<br>` +
      `Status: ${esc(r.activityStatus || 'Sedang digunakan')}`;
  }

  function draw() {
    const data = RSR.get('iotReadings', {});
    const active = BIKES.filter(b => data[b.code] && !data[b.code].dock);
    $('activeRentalCount').textContent = active.length + ' kendaraan';
    $('activeRentals').replaceChildren(...active.map(b => {
      const r = data[b.code];
      const card = document.createElement('div');
      card.className = 'col-md-6 col-xl-4';
      const mapUrl = `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=18/${r.latitude}/${r.longitude}`;
      card.innerHTML = `<div class="rental-detail h-100">
        <div class="d-flex justify-content-between gap-2 align-items-start">
          <div><div class="fw-bold text-primary">${RSR.esc(b.code)}</div><div class="small text-muted">${RSR.esc(b.title)}</div></div>
          <span class="badge text-bg-success">Sedang dipinjam</span>
        </div>
        <hr class="my-2">
        <div class="small"><b>Nama penyewa:</b> ${RSR.esc(r.renterName || 'Tidak tersedia')}</div>
        <div class="small"><b>ID booking:</b> ${RSR.esc(r.bookingId || '—')}</div>
        <div class="small"><b>Durasi sewa:</b> ${RSR.esc(String(r.rentalHours || '—'))} jam</div>
        <div class="small"><b>Status lokasi:</b> ${RSR.esc(r.activityStatus || 'Sedang digunakan')}</div>
        <div class="coord mt-2"><b>Posisi:</b> ${r.latitude}, ${r.longitude}</div>
        <div class="small text-muted">Pembaruan: ${new Date(r.locationTime || r.t).toLocaleTimeString('id-ID')}</div>
        <a class="btn btn-sm btn-outline-success mt-2" href="${mapUrl}" target="_blank" rel="noopener"><i class="bi bi-geo-alt"></i> Buka lokasi</a>
      </div>`;
      return card;
    }));

    // Marker hanya untuk kendaraan yang benar-benar memiliki booking berstatus berjalan.
    const activeCodes = new Set(active.map(b => b.code));
    Object.keys(markers).forEach(code => {
      if (!activeCodes.has(code)) { map.removeLayer(markers[code]); delete markers[code]; }
    });
    active.forEach(b => {
      const r = data[b.code], pos = [r.latitude, r.longitude];
      if (!markers[b.code]) markers[b.code] = L.marker(pos).addTo(map);
      else markers[b.code].setLatLng(pos);
      markers[b.code].bindPopup(popupFor(b, r));
      markers[b.code].bindTooltip(b.code, { direction: 'top', offset: [0, -8] });
    });
    if (!active.length) {
      $('activeRentals').innerHTML = '<div class="col-12"><div class="text-center text-muted py-4 border rounded-3">Belum ada kendaraan dengan status sewa berjalan. Pin kendaraan akan muncul setelah pembayaran diverifikasi admin.</div></div>';
    }

    // Kartu sensor seluruh unit tetap tersedia seperti fitur monitoring sebelumnya.
    $('readings').replaceChildren(...BIKES.filter(b => data[b.code]).map(b => {
      const r = data[b.code], danger = ['text-danger', 'fw-bold'];
      const card = fillTemplate('readingCard', {
        name: b.code + ' · ' + b.title,
        state: (r.dock ? 'Terparkir di dock' : 'Sedang disewa') + (r.outside ? ' · di luar perimeter' : ''),
        accelText: 'Getaran ' + r.accel + ' m/s²',
        batText: 'Baterai ' + r.battery + '%',
        renterBox: r.dock ? 'Tidak ada penyewa aktif · kendaraan di dock' :
          `Penyewa: ${r.renterName || 'Customer'}\nID Booking: ${r.bookingId || '—'}\nDurasi: ${r.rentalHours || '—'} jam\nKoordinat simulasi: ${r.latitude}, ${r.longitude}\nPembaruan: ${new Date(r.locationTime || r.t).toLocaleTimeString('id-ID')}`,
        mapLink: `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=18/${r.latitude}/${r.longitude}`
      });
      card.querySelector('[data-f=renterBox]').style.whiteSpace = 'pre-line';
      if (r.accel > IOT_LIMIT) { card.querySelector('.card').classList.add('border', 'border-2', 'border-danger'); card.querySelector('[data-f=accelText]').classList.add(...danger); }
      if (r.battery <= 20) card.querySelector('[data-f=batText]').classList.add(...danger);
      if (r.dock) card.querySelector('[data-f=mapLink]').classList.add('d-none');
      return card;
    }));
    $('log').innerHTML = eventsHTML(12);
  }
  draw();
  setTimeout(() => map.invalidateSize(), 250);
  setInterval(draw, 2000);
}
