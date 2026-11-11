// Pemindai barcode CODE128 untuk konfirmasi pengambilan kendaraan.
(() => {
  const $ = id => document.getElementById(id);
  const video = $('pickupVideo'); if (!video) return;
  let stream = null, scanning = false;
  const result = $('pickupResult');
  function check(code) {
    code = String(code || '').trim().toUpperCase(); if (!code) return;
    const b = RSR.findBooking(code);
    if (!b) { result.innerHTML = '<span class="text-danger">Booking tidak ditemukan.</span>'; return; }
    if (b.paymentStatus !== 'lunas' || !['siap_diambil','berjalan'].includes(b.status)) { result.innerHTML = '<span class="text-danger">Booking belum lunas atau tidak dalam status siap diambil.</span>'; return; }
    if (b.status === 'berjalan' || b.pickupStatus === 'sudah_diambil') { result.innerHTML = '<span class="text-warning">Barcode sudah pernah dipindai. Kendaraan: '+RSR.esc(b.title)+' · '+RSR.esc(b.name)+'.</span>'; return; }
    b.pickupStatus='sudah_diambil'; b.pickedUpAt=Date.now(); b.status='berjalan'; b.startedAt=Date.now(); b.confirmedAt=Date.now(); RSR.saveBooking(b);
    result.innerHTML = '<div class="alert alert-success mb-0"><b>Barcode valid — pengambilan terkonfirmasi.</b><br>Customer: '+RSR.esc(b.name)+'<br>Kendaraan: '+RSR.esc(b.title)+' ('+RSR.esc(b.code)+')<br>Kode booking: '+RSR.esc(b.id)+'</div>';
    $('pickupCode').value=b.id;
  }
  $('confirmPickup').onclick=()=>check($('pickupCode').value);
  $('startPickupScan').onclick=async()=>{
    if (!('BarcodeDetector' in window)) { result.innerHTML='<span class="text-danger">Browser ini belum mendukung pemindaian barcode kamera. Gunakan kolom kode booking manual atau Chrome terbaru.</span>'; return; }
    try {
      const detector = new BarcodeDetector({formats:['code_128','qr_code']});
      stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); video.srcObject=stream; video.classList.remove('d-none'); await video.play(); scanning=true;
      const loop=async()=>{ if(!scanning)return; try{const codes=await detector.detect(video); if(codes.length){check(codes[0].rawValue); stop(); return;}}catch(e){} requestAnimationFrame(loop); }; loop();
    } catch(e) { result.innerHTML='<span class="text-danger">Kamera tidak dapat dibuka. Pastikan izin kamera diberikan dan halaman dibuka melalui HTTPS atau localhost.</span>'; }
  };
  function stop(){scanning=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}video.pause();video.srcObject=null;video.classList.add('d-none');}
  $('stopPickupScan').onclick=stop;
})();
