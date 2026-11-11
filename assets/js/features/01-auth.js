// ===== FITUR 1: REGISTRASI & LOGIN =====
// Customer: daftar/login lewat login.html. Admin: tombol "Admin" di header membuka form username & password.
const ADMIN_AUTH = { user: 'admin', hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' }; // password: admin123 (disimpan sebagai hash SHA-256)
const sha256 = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(x => x.toString(16).padStart(2, '0')).join('');

// --- login admin (pop-up #adminModal ada di setiap halaman) ---
const adminLogin = () => bootstrap.Modal.getOrCreateInstance($('adminModal')).show(); // pop-up Bootstrap
$('adminForm').onsubmit = async e => {
  e.preventDefault();
  if (!crypto.subtle) return $('admErr').textContent = 'Buka lewat localhost / Live Server.';
  if ($('admUser').value.trim() === ADMIN_AUTH.user && await sha256($('admPass').value) === ADMIN_AUTH.hash) { RSR.loginAdmin(); location.href = 'admin.html'; }
  else $('admErr').textContent = 'Username atau password salah.';
};

// --- form daftar / masuk customer (hanya ada di login.html) ---
if ($('authForm')) {
  let mode = 'login';
  const setMode = m => {
    mode = m; $('nameWrap').classList.toggle('d-none', m === 'login');
    $('submitBtn').textContent = m === 'login' ? 'Masuk' : 'Daftar Akun'; $('err').textContent = '';
    [['tabLogin', 'login'], ['tabReg', 'reg']].forEach(([id, k]) => $(id).className = 'btn ' + (m === k ? 'btn-primary' : 'btn-outline-primary'));
  };
  $('tabLogin').onclick = () => setMode('login'); $('tabReg').onclick = () => setMode('reg');
  $('authForm').onsubmit = e => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase(), pass = $('pass').value, name = $('name').value.trim();
    if (mode === 'reg') {
      if (!name || pass.length < 6) return $('err').textContent = 'Isi nama dan password minimal 6 karakter.';
      if (!RSR.register(name, email, pass)) return $('err').textContent = 'Email sudah terdaftar.';
    }
    if (!RSR.login(email, pass)) return $('err').textContent = 'Email atau password salah.';
    location.href = new URLSearchParams(location.search).get('next') || 'katalog.html';
  };
  setMode('login');
}
