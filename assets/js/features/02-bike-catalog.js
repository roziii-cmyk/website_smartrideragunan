// ===== FITUR 2: KATALOG SEPEDA =====
// Kerangka kartu ada di katalog.html (<template id="bikeCard">). Di sini data kendaraan disaring lalu diisikan ke kerangka itu.
let active = 'all';  // kategori yang dipilih
let cart = RSR.get('cart', []);
function drawCart(){ const host=$('cartItems'); if(!host)return; const total=cart.reduce((n,x)=>n+x.price*(Number(x.qty)||1),0); $('cartCount').textContent=cart.length+' item'; $('cartTotal').textContent=RSR.rp(total); $('cartCheckout').disabled=!cart.length; host.innerHTML=cart.length?cart.map((x,i)=>`<div class="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom py-2"><div class="flex-grow-1"><b>${RSR.esc(x.title)}</b> <span class="text-muted">(${RSR.esc(x.code)})</span><br><span class="text-muted">${RSR.rp(x.price)} / ${RSR.esc(x.unitLabel)}</span><div class="d-flex align-items-center gap-2 mt-1"><label class="small" for="cartQty${i}">Durasi / jumlah:</label><input id="cartQty${i}" data-cart-qty="${i}" type="number" min="1" max="24" value="${Number(x.qty)||1}" class="form-control form-control-sm" style="width:85px"><span class="small text-muted">${RSR.esc(x.unitLabel)}</span></div><b class="small">Subtotal: ${RSR.rp(x.price*(Number(x.qty)||1))}</b></div><button class="btn btn-sm btn-outline-danger" data-cart-remove="${i}">Hapus</button></div>`).join(''):'Keranjang masih kosong.'; host.querySelectorAll('[data-cart-remove]').forEach(b=>b.onclick=()=>{cart.splice(Number(b.dataset.cartRemove),1);RSR.set('cart',cart);drawCart()}); host.querySelectorAll('[data-cart-qty]').forEach(inp=>inp.onchange=()=>{cart[Number(inp.dataset.cartQty)].qty=Math.max(1,Math.min(24,Number(inp.value)||1));RSR.set('cart',cart);drawCart()}); }
function checkoutCart(){ if(!RSR.require('user'))return; if(!cart.length)return; const ids=[]; cart.forEach(x=>{const id='BK'+Date.now().toString().slice(-7)+Math.floor(100+Math.random()*900)+ids.length, qty=Math.max(1,Number(x.qty)||1), now=Date.now(); RSR.saveBooking({id,user:RSR.user().email,name:RSR.user().name,phone:'',code:x.code,title:x.title,shelter:x.shelter,qty,label:qty+' '+x.unitLabel,hours:x.unit==='jam'?qty:1,date:new Date().toISOString().slice(0,10),time:'09:00',total:x.price*qty,status:'menunggu_bayar',paymentStatus:'belum',isPaymentDraft:true,draftSavedAt:now,created:now});ids.push(id)}); cart=[]; RSR.set('cart',cart); location.href='pembayaran.html?ids='+encodeURIComponent(ids.join(',')); }
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
    card.querySelector('button').onclick = () => openBooking(b.code); // booking langsung
    const add=card.querySelector('[data-cart-add]'); add.disabled=b.status!=='Tersedia'; add.onclick=()=>{if(b.status!=='Tersedia')return RSR.notify('Kendaraan sedang tidak tersedia.','warning'); if(!RSR.require('user'))return; if(cart.some(x=>x.code===b.code))return RSR.notify('Kendaraan ini sudah ada di keranjang.','warning'); cart.push({code:b.code,title:b.title,shelter:b.shelter,price:b.price,unit:b.unit,unitLabel:UNIT_LABEL[b.unit],qty:1}); RSR.set('cart',cart);drawCart();RSR.notify(b.title+' ditambahkan ke keranjang.','success')};
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
drawCart();
if ($('cartCheckout')) $('cartCheckout').onclick = checkoutCart;
