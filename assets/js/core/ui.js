// ===== PERILAKU UMUM semua halaman =====
// Navbar, footer, dan form login admin sudah ditulis langsung di tiap file HTML (Bootstrap). Di sini hanya perilakunya.
const $ = id => document.getElementById(id); // singkatan getElementById, dipakai semua file JS
const me = RSR.user(), isAdmin = me?.role === 'admin';

// 1. Menu sesuai peran: data-only="customer" disembunyikan dari admin, data-only="admin" dari non-admin
document.querySelectorAll('[data-only]').forEach(el => el.classList.toggle('d-none', (el.dataset.only === 'admin') !== isAdmin));

// 2. Tombol Customer / Admin di navbar (Admin meminta username & password, lihat 01-auth.js)
document.querySelectorAll('[data-role]').forEach(b => {
  b.classList.toggle('active', (b.dataset.role === 'admin') === isAdmin);
  b.onclick = () => {
    if (b.dataset.role === 'customer') { if (isAdmin) sessionStorage.removeItem('rsr_session_tab'); location.href = 'index.html'; }
    else if (isAdmin) location.href = 'admin.html'; else adminLogin();
  };
});

// 3. Chip akun di pojok kiri bawah
if (me) { $('chipName').textContent = me.name; $('chipName').classList.remove('d-none'); $('logoutBtn').classList.remove('d-none'); $('logoutBtn').onclick = RSR.logout; }
else $('chipLogin').classList.remove('d-none');

// 4. Pengisi <template>: salin kerangka HTML lalu isi datanya.
//    data-f="nama"            -> isi teks elemen dengan obj.nama
//    data-attr="src:img,..."  -> isi atribut (src, href, alt) dari obj
//    data-fb                  -> gambar cadangan (obj.fb) bila foto belum ada
function fillTemplate(tplId, obj) {
  const node = $(tplId).content.firstElementChild.cloneNode(true);
  node.querySelectorAll('[data-f]').forEach(el => el.textContent = obj[el.dataset.f] ?? '');
  node.querySelectorAll('[data-attr]').forEach(el => el.dataset.attr.split(',').forEach(p => { const [a, f] = p.split(':'); el.setAttribute(a, obj[f] ?? ''); }));
  node.querySelectorAll('img[data-fb]').forEach(img => img.onerror = () => { img.onerror = null; img.src = obj.fb; });
  return node;
}
