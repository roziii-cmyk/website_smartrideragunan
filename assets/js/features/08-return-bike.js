// ===== FITUR 8: PENGEMBALIAN SEPEDA =====
// Dipakai customer (tombol Kembalikan) dan admin (Konfirmasi Pengembalian): status -> selesai.
function finishRental(b) { Object.assign(b, { status: 'selesai', endedAt: Date.now(), completedAt: Date.now() }); RSR.saveBooking(b); }
