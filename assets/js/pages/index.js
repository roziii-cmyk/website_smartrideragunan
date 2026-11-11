// Hitung kategori kendaraan yang masih tersedia secara dinamis.
const availableTypes = new Set(BIKES.filter(b => b.status === 'Tersedia').map(b => b.cat));
const typeCountEl = $('homeVehicleTypeCount');
if (typeCountEl) typeCountEl.textContent = availableTypes.size + ' Jenis';

// ===== BERANDA: 3 kendaraan populer + testimoni dari ulasan asli =====
// Kerangka kartu ada di index.html (<template id="homeCard"> dan <template id="testiCard">).
const POPULAR = ['RGN-EB03', 'RGN-SG02', 'RGN-BG06'];
$('homeGrid').replaceChildren(...POPULAR.map(c => BIKES.find(b => b.code === c)).map(b =>
  fillTemplate('homeCard', { ...b, priceText: 'Rp ' + b.price / 1000 + 'rb/' + UNIT_LABEL[b.unit].toLowerCase(), detailUrl: 'detail.html?code=' + b.code })));

// Rating & ulasan publik: tampilkan nama customer, bintang, kendaraan, dan komentar.
const reviews = RSR.reviews().slice(0, 12);
const reviewGrid = $('testiGrid');
if (reviews.length) {
  const avg = (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1);
  const summary = document.createElement('div');
  summary.className = 'col-12';
  summary.innerHTML = `<div class="rounded-4 p-3 mb-2" style="background:#f1f7ef"><div class="d-flex flex-wrap align-items-center gap-3"><strong class="display-6 text-success">${avg}</strong><div><div style="color:#e7c268;font-size:1.25rem">${'★'.repeat(Math.round(Number(avg)))}${'☆'.repeat(5-Math.round(Number(avg)))}</div><div class="small text-muted">Rata-rata dari ${RSR.reviews().length} rating pelanggan</div></div></div></div>`;
  reviewGrid.replaceChildren(summary, ...reviews.map(r => {
    const card = fillTemplate('testiCard', { stars: '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating), quote: '“' + (r.comment || 'Pengalaman yang menyenangkan!') + '”', photo: r.photo || '', name: r.name, rent: 'Menyewa ' + r.title });
    if (r.photo) card.querySelector('img').classList.remove('d-none');
    return card;
  }));
} else {
  $('testiEmpty').textContent = 'Belum ada rating. Setelah menyelesaikan penyewaan, customer dapat memberikan rating dan ulasan di Dashboard.';
}
