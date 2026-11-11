// ===== FITUR 13: MONITORING IoT =====
// Tampilan peta dipertahankan; ditambahkan identitas penyewa dan lokasi setiap unit aktif.
if (RSR.require('admin')) {
  $('limit').textContent = IOT_LIMIT;
  // Dropdown menggunakan ID booking aktif, bukan jenis/kode kendaraan.
  // Dengan begitu admin memilih satu penyewaan/customer yang sedang berjalan.
  function refreshBookingOptions() {
    const select = $('iotBike');
    const previous = select.value;
    const activeBookings = RSR.bookings().filter(b => b.status === 'berjalan');
    select.innerHTML = '<option value="">Pilih ID booking / penyewa aktif</option>' +
      activeBookings.map(b => {
        const bike = BIKES.find(item => item.code === b.code);
        const vehicle = bike ? `${bike.code} - ${bike.title}` : (b.code || 'Kendaraan');
        const renter = b.name || b.customerName || 'Customer';
        const source = b.offline ? 'Offline / Manual' : 'Online';
        return `<option value="${RSR.esc(b.id)}">${RSR.esc(b.id)} · ${RSR.esc(renter)} · ${RSR.esc(vehicle)} · ${source}</option>`;
      }).join('');
    if (activeBookings.some(b => String(b.id) === previous)) select.value = previous;
    $('btnShake').disabled = !select.value;
    $('btnGeo').disabled = !select.value;
  }
  function triggerForSelectedBooking(type) {
    const bookingId = $('iotBike').value;
    const booking = RSR.bookings().find(b => String(b.id) === bookingId && b.status === 'berjalan');
    if (!booking) {
      RSR.notify('Pilih ID booking yang sedang berjalan terlebih dahulu.', 'warning');
      refreshBookingOptions();
      return;
    }
    // Data sensor disimpan per unit kendaraan; ID booking dipakai untuk
    // menentukan unit spesifik yang akan menerima simulasi sensor.
    scanFleet({ [String(booking.id)]: type });
    draw();
  }
  $('iotBike').onchange = refreshBookingOptions;
  $('btnShake').onclick = () => triggerForSelectedBooking('shake');
  $('btnGeo').onclick = () => triggerForSelectedBooking('geofence');
  refreshBookingOptions();

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
    refreshBookingOptions();
    const data = RSR.get('iotReadings', {});
    const activeBookings = RSR.bookings().filter(b => b.status === 'berjalan' && (b.paymentStatus === 'lunas' || b.offline === true));
    const active = activeBookings.map(booking => {
      const bike = BIKES.find(item => item.code === booking.code) || { code: booking.code || 'KENDARAAN', title: booking.vehicleName || booking.bikeName || 'Kendaraan' };
      return { booking, bike, reading: data[String(booking.id)] };
    }).filter(item => item.reading && !item.reading.dock);
    $('activeRentalCount').textContent = active.length + ' penyewaan aktif';
    $('activeRentals').replaceChildren(...active.map(({ booking, bike, reading: r }) => {
      const card = document.createElement('div');
      card.className = 'col-md-6 col-xl-4';
      const mapUrl = `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=18/${r.latitude}/${r.longitude}`;
      card.innerHTML = `<div class="rental-detail h-100">
        <div class="d-flex justify-content-between gap-2 align-items-start">
          <div><div class="fw-bold text-primary">${RSR.esc(bike.code)} · ${RSR.esc(bike.title)}</div><div class="small text-muted">${RSR.esc(booking.id)}</div></div>
          <span class="badge text-bg-success">Sedang dipinjam</span>
        </div>
        <hr class="my-2">
        <div class="small"><b>Nama penyewa:</b> ${RSR.esc(r.renterName || 'Tidak tersedia')}</div>
        <div class="small"><b>ID booking:</b> ${RSR.esc(r.bookingId || '—')}</div>
        <div class="small"><b>Jenis booking:</b> ${RSR.esc(r.bookingSource || 'Online')}</div>
        <div class="small"><b>Durasi sewa:</b> ${RSR.esc(String(r.rentalHours || '—'))} jam</div>
        <div class="small"><b>Status lokasi:</b> ${RSR.esc(r.activityStatus || 'Sedang digunakan')}</div>
        <div class="coord mt-2"><b>Posisi:</b> ${r.latitude}, ${r.longitude}</div>
        <div class="small text-muted">Pembaruan: ${new Date(r.locationTime || r.t).toLocaleTimeString('id-ID')}</div>
        <a class="btn btn-sm btn-outline-success mt-2" href="${mapUrl}" target="_blank" rel="noopener"><i class="bi bi-geo-alt"></i> Buka lokasi</a>
      </div>`;
      return card;
    }));

    // Satu marker biru per booking, bukan per kode/jenis kendaraan.
    const activeIds = new Set(active.map(item => String(item.booking.id)));
    Object.keys(markers).forEach(id => {
      if (!activeIds.has(id)) { map.removeLayer(markers[id]); delete markers[id]; }
    });
    active.forEach(({ booking, bike, reading: r }) => {
      const id = String(booking.id), pos = [r.latitude, r.longitude];
      if (!markers[id]) markers[id] = L.marker(pos).addTo(map);
      else markers[id].setLatLng(pos);
      markers[id].bindPopup(popupFor({ ...bike, code: bike.code }, r));
      markers[id].bindTooltip(`${booking.id}`, { direction: 'top', offset: [0, -8] });
    });
    if (!active.length) {
      $('activeRentals').innerHTML = '<div class="col-12"><div class="text-center text-muted py-4 border rounded-3">Belum ada kendaraan dengan status sewa berjalan. Booking online yang sudah lunas dan booking offline/manual yang aktif akan muncul di sini.</div></div>';
    }

    // Kartu sensor per booking aktif; unit sejenis tidak saling menimpa.
    $('readings').replaceChildren(...active.map(({ booking, bike, reading: r }) => {
      const card = fillTemplate('readingCard', {
        name: `${bike.code} · ${bike.title} · ${booking.id}`,
        state: 'Sedang disewa' + (r.outside ? ' · di luar perimeter' : ''),
        accelText: 'Getaran ' + r.accel + ' m/s²',
        batText: 'Baterai ' + r.battery + '%',
        renterBox: `Penyewa: ${r.renterName || 'Customer'}\nID Booking: ${r.bookingId || '—'}\nJenis booking: ${r.bookingSource || 'Online'}\nDurasi: ${r.rentalHours || '—'} jam\nKoordinat simulasi: ${r.latitude}, ${r.longitude}\nPembaruan: ${new Date(r.locationTime || r.t).toLocaleTimeString('id-ID')}`,
        mapLink: `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=18/${r.latitude}/${r.longitude}`
      });
      card.querySelector('[data-f=renterBox]').style.whiteSpace = 'pre-line';
      if (r.accel > IOT_LIMIT) { card.querySelector('.card').classList.add('border', 'border-2', 'border-danger'); card.querySelector('[data-f=accelText]').classList.add('text-danger', 'fw-bold'); }
      if (r.battery <= 20) card.querySelector('[data-f=batText]').classList.add('text-danger', 'fw-bold');
      return card;
    }));
    $('log').innerHTML = eventsHTML(12);
  }
  draw();
  setTimeout(() => map.invalidateSize(), 250);
  setInterval(draw, 2000);
}
