// ===== FITUR 11: MANAJEMEN KENDARAAN =====
function drawBikes() {
  const chosen = $('offlineBike')?.value || '';
  if ($('offlineBike')) $('offlineBike').innerHTML = '<option value="">Pilih kendaraan katalog</option>' + BIKES.map(b => `<option value="${RSR.esc(b.code)}">${RSR.esc(b.title)} · ${RSR.esc(b.code)} (${RSR.rp(b.price)}/${UNIT_LABEL[b.unit].toLowerCase()})</option>`).join('');
  if ($('offlineBike')) $('offlineBike').value = chosen;
  $('bikeRows').innerHTML = BIKES.map((b, i) => `<tr><td>${RSR.esc(b.code)}</td><td>${RSR.esc(b.title)}</td>
    <td><input id="price${i}" type="number" step="1000" value="${b.price}" class="form-control form-control-sm d-inline-block" style="width:110px"/> /${UNIT_LABEL[b.unit].toLowerCase()}</td>
    <td><select id="status${i}" class="form-select form-select-sm d-inline-block" style="width:130px">${['Tersedia', 'Perawatan'].map(x => `<option ${x === b.status ? 'selected' : ''}>${x}</option>`).join('')}</select></td>
    <td class="text-nowrap"><button class="btn btn-sm btn-primary" onclick="saveBike(${i})">Simpan</button> <button class="btn btn-sm btn-outline-danger" onclick="deleteBike(${i})">Hapus</button></td></tr>`).join('');
}
function deleteBike(i) {
  const bike=BIKES[i]; if(!bike)return;
  if(!confirm('Hapus '+bike.title+' dari daftar kendaraan tersedia? Riwayat booking lama tetap tersimpan.'))return;
  BIKES.splice(i,1); RSR.set('bikes_v2',BIKES); drawBikes(); RSR.notify('Kendaraan berhasil dihapus dari katalog. Riwayat booking tidak dihapus.','success');
}
function saveBike(i) {
  BIKES[i].price = Number($('price' + i).value) || BIKES[i].price;
  BIKES[i].status = $('status' + i).value;
  RSR.set('bikes_v2', BIKES); RSR.notify('Data ' + BIKES[i].code + ' disimpan', 'success');
}
const customerForm = $('manualCustomerForm');
if (customerForm) {
  const bikeSelect = $('offlineBike');
  if (bikeSelect) bikeSelect.innerHTML = '<option value="">Pilih kendaraan katalog</option>' + BIKES.map(b => `<option value="${RSR.esc(b.code)}">${RSR.esc(b.title)} · ${RSR.esc(b.code)} (${RSR.rp(b.price)}/${UNIT_LABEL[b.unit].toLowerCase()})</option>`).join('');
  const drawCustomers = () => {
    const a=RSR.get('offlineCustomers',[]);
    $('offlineCustomerList').innerHTML=a.length ? a.slice().reverse().map(c=>`<div class="border-bottom py-1">${RSR.esc(c.name)} · ${RSR.esc(c.phone)} ${c.email?'· '+RSR.esc(c.email):''} · Kendaraan: <b>${RSR.esc(c.vehicleTitle || '-')}</b> · Booking: ${RSR.esc(c.bookingId || '-')} <span class="text-muted">(${RSR.esc(c.id)})</span></div>`).join('') : '<span class="text-muted">Belum ada customer offline.</span>';
  };
  customerForm.onsubmit=e=>{
    e.preventDefault();
    const name=$('offlineName').value.trim(), phone=$('offlinePhone').value.trim(), email=$('offlineEmail').value.trim();
    const bike=BIKES.find(b=>b.code===$('offlineBike').value), qty=Math.max(1,Number($('offlineDuration').value)||1);
    if(!bike) return RSR.notify('Pilih kendaraan dari katalog terlebih dahulu.','warning');
    if(bike.status!=='Tersedia') return RSR.notify('Kendaraan sedang tidak tersedia.','warning');
    const customers=RSR.get('offlineCustomers',[]);
    const existingCustomer=customers.find(c=>c.phone===phone);
    const customerId=existingCustomer?.id || 'OFF'+Date.now().toString().slice(-8), bookingId='BKOFF'+Date.now().toString().slice(-8)+Math.floor(10+Math.random()*90);
    const hours=bike.unit==='jam'?qty:1, total=bike.price*qty, now=Date.now();
    const booking={id:bookingId,user:email||('offline:'+phone),name,phone,code:bike.code,title:bike.title,shelter:bike.shelter,qty,label:qty+' '+UNIT_LABEL[bike.unit],hours,date:new Date(now).toISOString().slice(0,10),time:new Date(now).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),total,status:'berjalan',paymentStatus:'lunas',method:'Offline / Manual',created:now,paidAt:now,verifiedAt:now,confirmedAt:now,startedAt:now,offline:true,customerId};
    RSR.saveBooking(booking);
    if(existingCustomer) Object.assign(existingCustomer,{name,email:email||existingCustomer.email,vehicleCode:bike.code,vehicleTitle:bike.title,bookingId,updatedAt:now});
    else customers.push({id:customerId,name,phone,email,vehicleCode:bike.code,vehicleTitle:bike.title,bookingId,createdAt:now});
    RSR.set('offlineCustomers',customers); customerForm.reset(); if(bikeSelect) bikeSelect.value=''; $('offlineDuration').value=1;
    drawCustomers(); RSR.notify('Customer offline dan booking '+bookingId+' berhasil ditambahkan. Timer langsung berjalan di monitoring admin.','success');
    if(typeof render==='function') render();
  };
  drawCustomers();
}
const bikeForm=$('manualBikeForm');
if(bikeForm) bikeForm.onsubmit=e=>{
  e.preventDefault();
  const file=$('newBikeImage').files[0];
  if(file && (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size>2*1024*1024)) return RSR.notify('Gambar harus JPG/PNG/WEBP maksimal 2 MB.','danger');
  const add=data=>{
    const code='RGN-NEW'+Date.now().toString().slice(-5);
    const sk=$('newBikeShelter').value, type=$('newBikeType').value;
    const obj={code,title:$('newBikeName').value.trim(),cat:type,price:Number($('newBikePrice').value),unit:'jam',sk,
      shelter:sk==='utara'?'Shelter Pintu Utara (Utama)':'Shelter Pintu Barat',status:'Tersedia',deposit:0,
      desc:'Kendaraan baru yang ditambahkan oleh admin.',specs:[],img:data||'assets/img/modern_eco_bicycles.png',fb:data||'assets/img/modern_eco_bicycles.png'};
    BIKES.push(obj); RSR.set('bikes_v2',BIKES); drawBikes(); bikeForm.reset();
    RSR.notify('Kendaraan '+code+' berhasil ditambahkan. Refresh katalog untuk melihatnya.','success');
  };
  if(file){const r=new FileReader();r.onload=()=>add(r.result);r.onerror=()=>RSR.notify('Gagal membaca gambar.','danger');r.readAsDataURL(file);} else add('');
};
