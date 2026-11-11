// ===== FITUR TAMBAHAN: ULASAN & RATING =====
// Form ada di dashboard.html (tab Ulasan). Rating hanya untuk sewa yang sudah selesai, satu kali per sewa.
const CAPTION = ['Sangat Buruk', 'Kurang', 'Cukup Baik', 'Baik', 'Sangat Baik'];
const TAG_OFF = 'btn btn-sm btn-outline-secondary rounded-pill', TAG_ON = 'btn btn-sm btn-success rounded-pill';
let rating = 5, photo = '';

function drawStars() {
  document.querySelectorAll('#stars [data-star]').forEach(s => { const on = +s.dataset.star <= rating; s.style.color = on ? '#e7c268' : '#c1c8c2'; });
  $('caption').textContent = rating + '.0 - ' + CAPTION[rating - 1];
}
function drawReview() { // isi pilihan sewa yang belum dinilai
  const keep = $('pick').value;
  const list = mine().filter(b => b.status === 'selesai' && !RSR.reviews().some(r => r.bookingId === b.id));
  $('pick').innerHTML = list.map(b => `<option value="${b.id}">${RSR.esc(b.title)} (${b.id})</option>`).join('') || '<option value="">Belum ada sewa selesai yang bisa dinilai</option>';
  if ([...$('pick').options].some(o => o.value === keep)) $('pick').value = keep; // pertahankan pilihan
  drawStars();
}
window.rateBooking = id => { showTab('review'); drawReview(); $('pick').value = id; $('pane-review').scrollIntoView({ behavior: 'smooth' }); }; // tombol "Beri Rating"

if ($('reviewForm')) {
  const boxText = $('photoBox').innerHTML;
  document.querySelectorAll('#stars [data-star]').forEach(s => s.onclick = () => { rating = +s.dataset.star; drawStars(); });
  document.querySelectorAll('[data-tag]').forEach(t => t.onclick = () => t.className = t.className === TAG_ON ? TAG_OFF : TAG_ON);
  $('photoBox').onclick = () => $('photoFile').click();
  $('photoFile').onchange = () => { // foto diperkecil lewat canvas supaya muat di localStorage
    const f = $('photoFile').files[0], img = new Image(); if (!f) return;
    if (f.size > 5 * 1024 * 1024) return RSR.notify('Foto maksimal 5MB', 'danger');
    img.onload = () => {
      const k = Math.min(1, 640 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); photo = c.toDataURL('image/jpeg', 0.7);
      $('photoBox').innerHTML = `<img src="${photo}" height="150" class="rounded" alt="Pratinjau"/>`;
    };
    img.src = URL.createObjectURL(f);
  };
  $('reviewForm').onsubmit = e => {
    e.preventDefault(); const b = RSR.findBooking($('pick').value);
    if (!b) return RSR.notify('Selesaikan sewa dulu (kembalikan kendaraan) sebelum memberi ulasan.', 'danger');
    RSR.addReview({ id: 'RV' + Date.now(), bookingId: b.id, code: b.code, title: b.title, name: RSR.user().name, rating, photo, comment: $('comment').value.trim(),
      tags: [...document.querySelectorAll('[data-tag]')].filter(t => t.className === TAG_ON).map(t => t.textContent), t: Date.now() });
    RSR.notify('Terima kasih! Rating ' + rating + '★ tersimpan.', 'success');
    rating = 5; photo = ''; $('comment').value = ''; $('photoBox').innerHTML = boxText; document.querySelectorAll('[data-tag]').forEach(t => t.className = TAG_OFF);
    refreshTop(); showTab('history');
  };
}

// daftar ulasan untuk halaman admin (kerangkanya ada di admin.html)
function drawAdminReviews() {
  const rs = RSR.reviews(), avg = rs.length ? (rs.reduce((t, r) => t + r.rating, 0) / rs.length).toFixed(1) : '-';
  $('reviewAvg').textContent = `rata-rata ${avg} dari ${rs.length}`;
  $('reviewList').innerHTML = rs.slice(0, 15).map(r => `<div class="border-top py-2"><p class="fw-semibold mb-0">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} · ${RSR.esc(r.title)} · ${RSR.esc(r.name)}</p>
    ${r.tags.length ? `<p class="small text-success mb-0">${RSR.esc(r.tags.join(', '))}</p>` : ''}<p class="small mb-0">${RSR.esc(r.comment) || '(tanpa komentar)'}</p>${r.photo ? `<img src="${r.photo}" height="90" class="rounded mt-1" alt="Foto ulasan"/>` : ''}</div>`).join('') || '<p>Belum ada ulasan.</p>';
}
