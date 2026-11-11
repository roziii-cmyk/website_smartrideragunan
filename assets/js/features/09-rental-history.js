// ===== FITUR 9: RIWAYAT PENYEWAAN =====
// Tabelnya ada di dashboard.html (#historyRows); baris diisi dari booking milik akun yang login.
const STATUS = { menunggu_bayar: 'Menunggu bayar', menunggu_verifikasi: 'Menunggu verifikasi admin', dibayar: 'Dibayar', berjalan: 'Berjalan', selesai: 'Selesai', pembayaran_ditolak: 'Pembayaran ditolak' };
function fmtDateTime(value) {
  const n=Number(value||0); return n ? new Date(n).toLocaleString('id-ID') : '-';
}
function drawHistory() {
  const rated = new Set(RSR.reviews().map(r => r.bookingId));
  const from=$('historyFrom')?.value||'', to=$('historyTo')?.value||'';
  const sort=$('historySort')?.value||'newest';
  let all=mine().slice().filter(b=>{
    const stamp=Number(b.created||b.createdAt||b.draftSavedAt||0);
    const day=stamp?new Date(stamp).toISOString().slice(0,10):(b.date||'');
    return (!from||day>=from)&&(!to||day<=to);
  });
  all.sort((a,b)=>{
    const x=Number(a.created||a.createdAt||a.draftSavedAt||0), y=Number(b.created||b.createdAt||b.draftSavedAt||0);
    return sort==='oldest'?x-y:y-x;
  });
  $('historyRows').innerHTML = all.map(b => {
    const action = b.status === 'menunggu_bayar'
      ? `<a class="btn btn-sm btn-primary me-1" href="pembayaran.html?id=${encodeURIComponent(b.id)}">Lanjutkan Pembayaran</a><button class="btn btn-sm btn-outline-danger" onclick="cancelPendingBooking('${b.id}')">Batalkan</button>`
      : b.status === 'selesai' ? (rated.has(b.id) ? '★ Sudah dinilai' : `<button class="btn btn-sm btn-outline-success" onclick="rateBooking('${b.id}')">Beri Rating</button>`) : '';
    const created=Number(b.created||b.createdAt||b.draftSavedAt||0);
    const schedule=(b.date||'-')+' '+(b.time||'');
    return `<tr><td>${RSR.esc(b.id)}</td><td>${RSR.esc(b.title)}</td><td>${fmtDateTime(created)}</td><td>${fmtDateTime(b.paidAt)}</td><td>${RSR.esc(schedule)}</td><td>${RSR.rp(b.total)}</td><td>${STATUS[b.status] || RSR.esc(b.status)}</td><td>${action}</td></tr>`;
  }).join('');
  $('historyEmpty').classList.toggle('d-none', all.length > 0);
}
['historyFrom','historyTo','historySort'].forEach(id=>$(id)?.addEventListener('change',drawHistory));
$('historyReset')?.addEventListener('click',()=>{['historyFrom','historyTo'].forEach(id=>$(id).value='');$('historySort').value='newest';drawHistory();});
function cancelPendingBooking(id) {
  const b=RSR.findBooking(id); if(!b || b.user!==RSR.user().email || b.status!=='menunggu_bayar') return RSR.notify('Booking tidak dapat dibatalkan.', 'danger');
  if(!confirm('Batalkan pesanan '+id+'?')) return;
  b.status='dibatalkan'; b.cancelledAt=Date.now(); RSR.saveBooking(b); drawHistory(); drawProfile(); RSR.notify('Pesanan berhasil dibatalkan.','success');
}
