// ===== FITUR 3: DETAIL SEPEDA (foto, spesifikasi, tarif, status, ulasan) =====
// Kerangka halaman ada di detail.html; kode kendaraan dibaca dari alamat (?code=RGN-SG02).
const bk = BIKES.find(b => b.code === new URLSearchParams(location.search).get('code')) || BIKES[0];
const st = RSR.ratingOf(bk.code), rv = RSR.reviews().filter(r => r.code === bk.code);
$('bikeImg').onerror = () => { $('bikeImg').onerror = null; $('bikeImg').src = bk.fb; };
$('bikeImg').src = bk.img; $('bikeImg').alt = bk.title;
$('bikeStatus').textContent = bk.status;
$('bikeTitle').textContent = bk.title;
$('bikeInfo').textContent = bk.code + ' · ' + bk.shelter;
$('bikeDesc').textContent = bk.desc;
$('bikeSpecs').innerHTML = bk.specs.map(s => `<li class="list-group-item">${s}</li>`).join('');
$('bikePrice').textContent = (bk.priceNote ? bk.priceNote + ' ' : '') + RSR.rp(bk.price) + ' / ' + UNIT_LABEL[bk.unit].toLowerCase();
$('bookLink').href = 'katalog.html?book=' + bk.code;
$('ratingText').textContent = st.n ? `(★ ${st.avg.toFixed(1)} dari ${st.n})` : '';
$('reviewList').innerHTML = rv.map(r => `<div class="border rounded bg-white p-3"><p class="fw-semibold mb-1">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} · ${RSR.esc(r.name)}</p><p>${RSR.esc(r.comment)}</p>${r.photo ? `<img src="${r.photo}" height="110" class="rounded mt-1" alt="Foto ulasan"/>` : ''}</div>`).join('') || '<p class="text-muted">Belum ada ulasan untuk kendaraan ini.</p>';
