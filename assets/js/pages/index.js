// ===== BERANDA: 3 kendaraan populer + testimoni dari ulasan asli =====
// Kerangka kartu ada di index.html (<template id="homeCard"> dan <template id="testiCard">).
const POPULAR = ['RGN-EB03', 'RGN-SG02', 'RGN-BG06'];
$('homeGrid').replaceChildren(...POPULAR.map(c => BIKES.find(b => b.code === c)).map(b =>
  fillTemplate('homeCard', { ...b, priceText: 'Rp ' + b.price / 1000 + 'rb/' + UNIT_LABEL[b.unit].toLowerCase(), detailUrl: 'detail.html?code=' + b.code })));

// Testimoni: pakai 3 ulasan terbaru; kalau belum ada ulasan, contoh bawaan di HTML tetap tampil
const reviews = RSR.reviews().filter(r => r.comment || r.photo).slice(0, 3);
if (reviews.length) $('testiGrid').replaceChildren(...reviews.map(r => {
  const card = fillTemplate('testiCard', { stars: '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating), quote: '"' + (r.comment || 'Pengalaman yang menyenangkan!') + '"', photo: r.photo || '', name: r.name, rent: 'Menyewa ' + r.title });
  if (r.photo) card.querySelector('img').classList.remove('d-none');
  return card;
}));
