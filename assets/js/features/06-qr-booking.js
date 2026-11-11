// ===== FITUR 6: QR CODE UNIK UNTUK SETIAP BOOKING =====
const makeBarcode = (el, text) => { el.innerHTML = ''; const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); el.appendChild(svg); if(window.JsBarcode) JsBarcode(svg, text, {format:'CODE128',width:2,height:70,displayValue:true,fontSize:14,margin:8}); else el.textContent=text; };
function drawQR() {
  // Tampilkan barcode hanya untuk booking yang kendaraannya sedang digunakan.
  // Booking selesai, dibatalkan, atau masih menunggu pengambilan tidak ditampilkan di daftar ini.
  const bookings = mine().filter(b => b.paymentStatus==='lunas' && b.status==='berjalan').slice().reverse();
  $('qrEmpty').classList.toggle('d-none', bookings.length > 0); $('qrContent').classList.toggle('d-none', bookings.length === 0);
  const host = $('qrBookingList'); if (!host) return;
  host.innerHTML = bookings.map(b => `<div class="col-md-6"><article class="border rounded-3 p-3 h-100 text-center"><h3 class="h6 text-primary">${RSR.esc(b.title)}</h3><div class="small text-muted mb-1">Kode booking: <b>${RSR.esc(b.id)}</b></div><div id="qr_${b.id.replace(/[^a-zA-Z0-9_-]/g,'_')}" class="d-flex justify-content-center my-3"></div><div class="small">${RSR.esc(b.code)} · ${RSR.esc(b.shelter || '-')}</div><div class="small">${RSR.esc(b.date || '')} ${RSR.esc(b.time || '')}</div><span class="badge ${b.status==='selesai'?'text-bg-secondary':'text-bg-success'} mt-2">${b.status==='siap_diambil'?'MENUNGGU PENGAMBILAN':b.status==='berjalan'?'SEWA BERJALAN':'SELESAI'}</span><p class="small text-muted mt-2 mb-0">Kendaraan sedang digunakan. Barcode ini merupakan identitas booking.</p></article></div>`).join('');
  bookings.forEach(b => makeBarcode($('qr_'+b.id.replace(/[^a-zA-Z0-9_-]/g,'_')), b.id));
  host.querySelectorAll('[data-return-booking]').forEach(btn => btn.onclick = () => {
    const b = RSR.findBooking(btn.dataset.returnBooking); if (!b || b.status !== 'berjalan') return;
    finishRental(b); refreshTop(); drawQR(); rateBooking(b.id); RSR.notify('Sewa ' + b.id + ' selesai. Silakan beri rating.', 'info');
  });
}
