// ===== DATA & AKUN =====
// Tidak ada database: semua data disimpan di localStorage browser (kunci diawali "rsr_").
const RSR = (() => {
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem('rsr_' + k)) ?? d; } catch { return d; } };
  const set = (k, v) => localStorage.setItem('rsr_' + k, JSON.stringify(v));
  const page = () => location.pathname.split('/').pop() || 'index.html';
  return {
    get, set,
    rp: n => 'Rp ' + Number(n).toLocaleString('id-ID'),
    // cegah teks dari user dibaca sebagai HTML
    esc: t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),

    // --- akun & sesi ---
    user: () => get('session', null),
    register(name, email, pass) {
      const users = get('users', []);
      if (users.some(u => u.email === email)) return false;
      users.push({ name, email, pass, id: 'RGN-' + Math.floor(10000 + Math.random() * 90000), joined: Date.now() }); set('users', users);
      return true;
    },
    login(email, pass) {
      const users = get('users', []), u = users.find(x => x.email === email && x.pass === pass);
      if (!u) return null;
      u.id = u.id || 'RGN-' + Math.floor(10000 + Math.random() * 90000); u.joined = u.joined || Date.now(); set('users', users); // akun lama dilengkapi
      set('session', { name: u.name, email: u.email, role: 'user', id: u.id, joined: u.joined });
      return u;
    },
    loginAdmin: () => set('session', { name: 'Admin Ragunan', email: 'admin@ragunan.id', role: 'admin' }),
    logout() { localStorage.removeItem('rsr_session'); location.href = 'login.html'; },
    // dipanggil di awal halaman yang dibatasi: role 'user' = customer, 'admin' = admin
    require(role) {
      const u = get('session', null);
      if (!u) { location.href = 'login.html?next=' + page(); return false; }
      if (role && u.role !== role) { location.href = u.role === 'admin' ? 'admin.html' : 'index.html'; return false; }
      return true;
    },

    // --- booking: status berurutan menunggu_bayar > dibayar > berjalan > selesai ---
    bookings: () => get('bookings', []),
    myBookings() { const u = get('session', null); return u ? get('bookings', []).filter(b => b.user === u.email) : []; },
    findBooking: id => get('bookings', []).find(b => b.id === id),
    saveBooking(b) {
      const all = get('bookings', []), i = all.findIndex(x => x.id === b.id);
      if (i < 0) all.push(b); else all[i] = b;
      set('bookings', all);
    },

    // --- ulasan & rating ---
    reviews: () => get('reviews', []),
    addReview(r) { const all = get('reviews', []); all.unshift(r); set('reviews', all); },
    ratingOf(code) {
      const a = get('reviews', []).filter(r => r.code === code);
      return { n: a.length, avg: a.length ? a.reduce((t, r) => t + r.rating, 0) / a.length : 0 };
    },

    // --- kejadian IoT / SOS (dibaca halaman admin) ---
    events: () => get('iotEvents', []),
    addEvent(text, type) { const all = get('iotEvents', []); all.unshift({ text, type, t: Date.now() }); set('iotEvents', all.slice(0, 30)); }
  };
})();
