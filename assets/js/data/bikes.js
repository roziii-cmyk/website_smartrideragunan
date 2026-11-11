// Data kendaraan sewa Ragunan (dipakai katalog, detail, beranda, admin, IoT).
const SHELTERS = {
  utara: { name: 'Shelter Pintu Utara (Utama)', info: '±200 m setelah pintu masuk/loket' },
  barat: { name: 'Shelter Pintu Barat', info: 'Area kandang jerapah' }
};
const CATS = { sepeda: 'Sepeda Biasa', ebike: 'Sepeda Listrik', skuter: 'Skuter', buggy: 'Buggy Car (E-Car)', shuttle: 'Kereta & Shuttle', stroller: 'Stroller' };
const UNIT_LABEL = { jam: 'Jam', orang: 'Orang', trip: 'Trip' };
const ph = e => 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#c1ecd4"/><text x="50%" y="58%" font-size="130" text-anchor="middle">' + e + '</text></svg>');
const mk = (code, title, cat, price, unit, sk, o = {}) => ({ code, title, cat, price, unit, sk, shelter: SHELTERS[sk].name, status: 'Tersedia', deposit: o.deposit ?? 0, priceNote: o.priceNote, img: 'assets/img/kendaraan/' + code + '.jpg', fb: o.img || ph(o.emoji), desc: o.desc, specs: o.specs || [] });
const BIKES_DEFAULT = [
  mk('RGN-SB01', 'Sepeda Tunggal', 'sepeda', 15000, 'jam', 'utara', { deposit: 5000, img: 'assets/img/modern_eco_bicycles.png', desc: 'Sepeda satu orang untuk keliling area Ragunan.', specs: ['1 penumpang', 'Bel & lampu'] }),
  mk('RGN-SG02', 'Sepeda Ganda', 'sepeda', 20000, 'jam', 'utara', { deposit: 5000, img: 'assets/img/tandem_bicycle_two.png', desc: 'Sepeda dua kursi, cocok untuk pasangan atau orang tua dan anak.', specs: ['2 penumpang', 'Rangka alloy'] }),
  mk('RGN-EB03', 'Sepeda Listrik', 'ebike', 50000, 'jam', 'barat', { deposit: 5000, img: 'assets/img/modern_electric_assist.png', desc: 'Sepeda listrik bantuan pedal, hemat tenaga di jalur yang panjang.', specs: ['Motor assist', 'Layar GPS'] }),
  mk('RGN-SK04', 'Skuter Anak', 'skuter', 35000, 'jam', 'barat', { deposit: 5000, emoji: '🛴', desc: 'Skuter ukuran anak untuk jalur datar di sekitar shelter.', specs: ['Untuk anak', 'Perlu pendampingan'] }),
  mk('RGN-SD05', 'Skuter Dewasa', 'skuter', 50000, 'jam', 'utara', { deposit: 5000, emoji: '🛴', desc: 'Skuter ukuran dewasa, praktis dan lincah.', specs: ['Untuk dewasa'] }),
  mk('RGN-BG06', 'Buggy Car (E-Car)', 'buggy', 250000, 'jam', 'utara', { deposit: 5000, emoji: '🚗', desc: 'Mobil golf listrik kapasitas sekitar 5 orang. Bisa juga dipesan lewat situs resmi Ragunan Zoo.', specs: ['±5 penumpang', 'Listrik'] }),
  mk('RGN-KK07', 'Kereta Keliling', 'shuttle', 20000, 'orang', 'utara', { priceNote: 'Tarif per orang', emoji: '🚂', desc: 'Kereta wisata keliling area kebun binatang.', specs: ['Per orang'] }),
  mk('RGN-SH08', 'Shuttle Bus Keliling', 'shuttle', 10000, 'trip', 'barat', { priceNote: 'Tarif per trip', emoji: '🚌', desc: 'Shuttle bus keliling Ragunan.', specs: ['Per trip'] }),
  mk('RGN-ST09', 'Stroller (Kereta Dorong Anak)', 'stroller', 25000, 'jam', 'utara', { priceNote: 'Mulai dari', emoji: '👶', desc: 'Kereta dorong anak. Tarif sekitar Rp25.000 - Rp40.000 per jam atau seharian, tergantung penyedia.', specs: ['Per jam / seharian'] })
];
// Admin bisa mengubah tarif/status (fitur 11); disimpan di localStorage.
const BIKES = RSR.get('bikes_v2', null) || BIKES_DEFAULT;
