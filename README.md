# Ragunan Smart Ride

Jalankan: buka folder di VS Code > klik kanan index.html > "Open with Live Server"
(atau terminal: python -m http.server 8000 lalu buka http://localhost:8000)

- Customer: daftar/login di login.html
- Admin: tombol "Admin" di kanan atas > username `admin`, password `admin123` (ubah hash di assets/js/core/ui.js)
- Logo: timpa assets/img/logo.jpg | Foto kendaraan: lihat assets/img/kendaraan/README.txt
- Penjelasan struktur & alur: PENJELASAN.md
Butuh internet (Bootstrap, font, ikon, library QR, peta).

Struktur: kerangka tampilan ada di file .html; JavaScript (assets/js) hanya mengisi data dan memproses aksi.

## Alur Pembayaran & Verifikasi (Simulasi Lokal)

1. Customer membuat booking dan diarahkan ke halaman pembayaran.
2. Customer memilih QRIS/transfer simulasi lalu mengunggah bukti pembayaran (JPG/PNG/WEBP, maksimal 2 MB).
3. Booking berubah menjadi `menunggu_verifikasi` dan bukti tersimpan di localStorage browser.
4. Admin membuka Dashboard Admin, melihat tautan bukti, lalu memilih **Setujui & Mulai Sewa** atau **Tolak**.
5. Saat disetujui, status menjadi `berjalan` dan `startedAt` dicatat. Timer sewa dimulai pada saat itu.
6. Jika ditolak, customer melihat alasan penolakan dan dapat mengirim bukti baru.

**Catatan penting:** ini simulasi frontend. Data localStorage hanya tersedia pada browser/perangkat yang sama; unggah bukti tidak dikirim ke server. Pembayaran QRIS/transfer tidak benar-benar diproses. Untuk penggunaan lintas perangkat dan transaksi sungguhan, diperlukan backend/database serta payment gateway.


## Fitur tambahan (simulasi frontend)
- Backsound ceria original dibuat khusus untuk proyek ini, tersedia pada `assets/audio/backsound-ceria-original.wav`. Klik tombol ▶ untuk memulai karena browser umumnya memblokir autoplay bersuara.
- Rating dan ulasan pelanggan ditampilkan di beranda dari data localStorage browser.
- Monitoring IoT menampilkan detail booking aktif dan koordinat lokasi simulasi; bukan GPS sungguhan.
- Tidak menggunakan Supabase/backend. Data localStorage hanya tersedia pada browser/perangkat yang sama.
