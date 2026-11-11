// ===== FITUR 13: MONITORING IoT =====
if (RSR.require('admin')) {
  $('limit').textContent=IOT_LIMIT;
  $('iotBike').innerHTML=BIKES.map(b=>`<option value="${b.code}">${b.code} - ${b.title}</option>`).join('');
  $('btnShake').onclick=()=>{scanFleet({[$('iotBike').value]:'shake'});draw();};
  $('btnGeo').onclick=()=>{scanFleet({[$('iotBike').value]:'geofence'});draw();};
  let map, markers={};
  function initMap(){
    if(!window.L || map)return;
    map=L.map('iotMap').setView([-6.3125,106.8200],15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
    L.circle([-6.3125,106.8200],{radius:1000,color:'#dc3545',fillOpacity:.05}).addTo(map).bindPopup('Radius geofence demo 1 km');
  }
  function draw(){
    const data=RSR.get('iotReadings',{});
    $('readings').replaceChildren(...BIKES.filter(b=>data[b.code]).map(b=>{
      const r=data[b.code],card=fillTemplate('readingCard',{
        name:b.code+' · '+b.title,
        state:(r.dock?'Terparkir di dock':'Sedang disewa')+(r.outside?' · di luar perimeter':''),
        accelText:'Getaran '+r.accel+' m/s²',
        batText:'Baterai '+r.battery+'%'
      });
      const body=card.querySelector('.card');
      if(r.accel>IOT_LIMIT)body.classList.add('border','border-2','border-danger');
      if(r.battery<=20)card.querySelector('[data-f=batText]').classList.add('text-danger','fw-bold');
      return card;
    }));
    const rows=BIKES.filter(b=>data[b.code]).map(b=>{
      const r=data[b.code];
      return `<div class="col-md-6"><div class="border rounded p-2 small h-100"><b>${RSR.esc(b.code)}</b> · ${r.lat}, ${r.lng}<br>Jarak dari titik pusat demo: ${r.distance_m} m · Akurasi simulasi: ±${r.accuracy_m} m<br><a target="_blank" rel="noopener" href="https://www.google.com/maps?q=${r.lat},${r.lng}">Buka titik di Google Maps</a></div></div>`;
    }).join('');
    $('locationList').innerHTML=rows;
    initMap();
    if(map)BIKES.filter(b=>data[b.code]).forEach(b=>{
      const r=data[b.code],pos=[r.lat,r.lng],label=`${b.code}<br>${r.lat}, ${r.lng}<br>${r.outside?'DI LUAR AREA':'Dalam radius demo'}`;
      if(markers[b.code])markers[b.code].setLatLng(pos).setPopupContent(label);
      else markers[b.code]=L.marker(pos).addTo(map).bindPopup(label);
    });
    $('log').innerHTML=eventsHTML(12);
  }
  draw();setInterval(draw,2000);
}
