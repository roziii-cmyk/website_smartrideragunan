// ===== FITUR 15: NOTIFIKASI OTOMATIS =====
// Pakai: RSR.notify('pesan', 'info' | 'success' | 'danger'). Wadahnya (#toasts) ada di tiap halaman.
RSR.notify = (msg, type = 'info') => {
  const t = document.createElement('div');
  t.className = `toast show align-items-center border-0 text-bg-${{ info: 'primary', success: 'success', danger: 'danger' }[type]}`; // komponen Toast Bootstrap
  t.innerHTML = '<div class="d-flex"><div class="toast-body"></div></div>';
  t.querySelector('.toast-body').textContent = msg; $('toasts').appendChild(t); setTimeout(() => t.remove(), 4500);
};
RSR.event = (text, type) => { RSR.addEvent(text, type); RSR.notify(text, type); }; // simpan kejadian + tampilkan

// peringatan otomatis: sisa waktu sewa < 10 menit
setInterval(() => {
  RSR.myBookings().filter(b => b.status === 'berjalan').forEach(r => {
  const left = (Number(r.startedAt || r.confirmedAt) + Number(r.hours || 1) * 3600000 - Date.now()) / 60000;
  if (left > 0 && left <= 10 && !sessionStorage['warn' + r.id]) { sessionStorage['warn' + r.id] = 1; RSR.notify('Sisa waktu booking ' + r.id + ' kurang dari 10 menit!', 'danger'); }
  });
}, 15000);

// admin menerima peringatan IoT / SOS yang dikirim dari tab lain
window.addEventListener('storage', e => {
  if (e.key === 'rsr_iotEvents' && RSR.user()?.role === 'admin') { const ev = RSR.events()[0]; if (ev) RSR.notify(ev.text, ev.type); }
});
