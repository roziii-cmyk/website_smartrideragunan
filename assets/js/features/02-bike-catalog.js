// ===== FITUR 2: KATALOG SEPEDA =====
// Kerangka kartu ada di katalog.html (<template id="bikeCard">). Di sini data kendaraan disaring lalu diisikan ke kerangka itu.
let active = 'all';  // kategori yang dipilih
const chips = document.querySelectorAll('#categoryChips button');

function drawCards() {
  const q = $('searchInput').value.toLowerCase().trim(), shelter = $('shelterSelect').value, sort = $('sortSelect').value;
  const list = BIKES.filter(b => (active === 'all' || b.cat === active) && (shelter === 'all' || b.sk === shelter) && (!q || (b.title + b.desc + b.code).toLowerCase().includes(q)));
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  $('bikeGrid').replaceChildren(...list.map(b => {
    const rt = RSR.ratingOf(b.code);
    const card = fillTemplate('bikeCard', { ...b, priceText: RSR.rp(b.price), unitText: '/ ' + UNIT_LABEL[b.unit].toLowerCase(), priceNote: b.priceNote || 'Tarif Sewa',
      ratingText: rt.n ? `★ ${rt.avg.toFixed(1)} (${rt.n} ulasan)` : '', btnText: b.status === 'Tersedia' ? 'Pesan' : b.status, detailUrl: 'detail.html?code=' + b.code });
    card.querySelector('button').onclick = () => openBooking(b.code); // fitur 4
    return card;
  }));
  $('emptyMsg').classList.toggle('d-none', list.length > 0);
}
chips.forEach(c => c.onclick = () => {
  active = c.dataset.cat;
  chips.forEach(x => { x.classList.toggle('btn-primary', x === c); x.classList.toggle('btn-outline-primary', x !== c); });
  drawCards();
});
['searchInput', 'shelterSelect', 'sortSelect'].forEach(id => $(id).addEventListener(id === 'searchInput' ? 'input' : 'change', drawCards));
drawCards();
