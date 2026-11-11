// ===== FITUR 5: PEMBAYARAN QRIS / VA (SIMULASI FRONTEND, SINGLE / CART) =====
if (RSR.require('user')) {
  const params=new URLSearchParams(location.search);
  const ids=(params.get('ids')||params.get('id')||'').split(',').filter(Boolean);
  let bookings=ids.map(id=>RSR.findBooking(id)).filter(b=>b&&b.user===RSR.user().email);
  const multi=bookings.length>1;
  const show=id=>['payNotFound','payForm','payDone'].forEach(x=>$(x).classList.toggle('d-none',x!==id));
  const paid=b=>b.paymentStatus==='lunas'||['menunggu_verifikasi','berjalan','selesai'].includes(b.status);
  const done=()=>{ $('doneId').textContent=bookings.map(b=>b.id).join(', '); $('paymentStatusText').textContent='Status pembayaran LUNAS. Tunjukkan barcode kepada petugas; waktu sewa baru dimulai setelah barcode dipindai saat pengambilan.'; const host=$('doneBarcodes'); if(host){host.innerHTML='';bookings.forEach(b=>{const wrap=document.createElement('div');wrap.className='border rounded-3 p-2 text-center';wrap.innerHTML='<div class="small fw-semibold mb-1"></div><svg></svg>';wrap.querySelector('div').textContent=b.title+' · '+b.id;host.appendChild(wrap);if(window.JsBarcode)JsBarcode(wrap.querySelector('svg'),b.id,{format:'CODE128',width:2,height:65,displayValue:true,fontSize:13,margin:6});else wrap.querySelector('svg').outerHTML='<p>'+b.id+'</p>';});} show('payDone'); };
  if(!bookings.length||bookings.length!==ids.length||bookings.some(b=>b.status==='dibatalkan'||b.status==='selesai')) show('payNotFound');
  else if(bookings.every(paid)) done();
  else {
    $('payId').textContent=multi?bookings.length+' Booking':bookings[0].id;
    $('payTitle').textContent=bookings.map(b=>b.title+' ('+b.code+')').join(' · ');
    $('payInfo').textContent=bookings.map(b=>b.shelter+' · '+b.date+' '+b.time+' · '+b.label).join(' | ');
    $('payTotal').textContent=RSR.rp(bookings.reduce((n,b)=>n+Number(b.total||0),0)); show('payForm');
    const digits=n=>Array.from({length:n},()=>Math.floor(Math.random()*10)).join('');
    const makeInstruction=()=>{const method=$('method').value; let x=bookings[0].paymentInstruction; if(!x||x.method!==method){x=method==='Transfer Bank'?{method,label:'Virtual Account BCA (simulasi)',number:'8808'+digits(12),recipient:'SMART RAGUNAN RIDE',expiresAt:Date.now()+30*60*1000}:{method:'QRIS',label:'QRIS (simulasi)',number:'QR'+digits(12),recipient:'SMART RAGUNAN RIDE',expiresAt:Date.now()+30*60*1000}; bookings.forEach(b=>{b.paymentInstruction=x;RSR.saveBooking(b)});} return x;};
    const renderInstruction=()=>{const x=makeInstruction(),q=x.method==='QRIS'; $('paymentDestinationTitle').textContent=x.label; $('qrisVisual').classList.toggle('d-none',!q); $('paymentDestination').classList.toggle('d-none',q); $('paymentDestination').textContent=q?'':x.number; $('paymentRecipient').textContent=x.recipient; $('paymentExpiry').textContent=new Date(x.expiresAt).toLocaleString('id-ID'); $('paymentInstructionNote').textContent=q?'QR ini hanya ilustrasi. Tekan tombol simulasi untuk menandai pembayaran sebagai LUNAS.':'Nomor VA ini hanya contoh dan tidak terhubung ke bank sungguhan.';};
    $('method').innerHTML='<option value="QRIS">QRIS</option><option value="Transfer Bank">Virtual Account</option>'; $('method').onchange=renderInstruction; renderInstruction();
    const note=document.querySelector('#payForm .alert-info'); if(note)note.textContent='Draf pembayaran tersimpan otomatis. Jika Anda berpindah halaman atau menutup tab sebelum membayar, pesanan tetap berstatus BELUM BAYAR dan dapat dilanjutkan dari Dashboard / Riwayat Peminjaman. Untuk checkout keranjang, satu simulasi pembayaran melunasi seluruh booking di daftar ini.';
    const proof=$('proofFile'); if(proof)proof.closest('label')?.remove(); if(proof)proof.remove(); $('payBtn').textContent='Simulasikan Pembayaran Berhasil';
    $('payBtn').onclick=()=>{const method=$('method').value; bookings.forEach(b=>{Object.assign(b,{status:'berjalan',paymentStatus:'lunas',isPaymentDraft:false,paidAt:Date.now(),verifiedAt:Date.now(),confirmedAt:Date.now(),startedAt:Date.now(),method, pickupStatus:'menunggu_diambil'});RSR.saveBooking(b)}); RSR.notify('Pembayaran berhasil. Barcode pengambilan sudah tersedia.','success'); done();};
  }
}
