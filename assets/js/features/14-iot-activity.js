// ===== FITUR 14: DETEKSI AKTIVITAS & LOKASI IoT =====
// DEMO: GPS dan sensor dibuat simulasi. Untuk perangkat nyata, ganti sumber data
// dengan payload ESP32 + GPS melalui backend/MQTT. Jangan gunakan koordinat demo
// untuk pencarian kendaraan sungguhan.
const IOT_LIMIT = 12;
const tabId = Math.random().toString(36).slice(2);
const cool = {};
const GEO_CENTER = { lat: -6.3125, lng: 106.8200 }; // titik referensi demo sekitar Ragunan
const GEOFENCE_RADIUS_M = 1000; // radius demo, bukan batas resmi taman
const VIBRATION_DURATION_MS = 1200;

function alertOnce(key, text, type, ms = 60000) {
  if (Date.now() - (cool[key] || 0) < ms) return;
  cool[key] = Date.now(); RSR.event(text, type);
}
function distanceMeters(a, b) {
  const rad = x => x * Math.PI / 180, R = 6371000;
  const dLat = rad(b.lat-a.lat), dLng = rad(b.lng-a.lng);
  const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function demoCoordinate(index, outside=false) {
  const angle = index * 2.399, radius = outside ? 0.014 : 0.001 + (index % 5) * 0.0012;
  return { lat: GEO_CENTER.lat + Math.cos(angle)*radius, lng: GEO_CENTER.lng + Math.sin(angle)*radius };
}
function requestVibration(code, reason) {
  // Placeholder integrasi aktuator. Backend nantinya meneruskan perintah ke ESP32
  // untuk mengaktifkan motor getar/buzzer selama VIBRATION_DURATION_MS.
  const commands = RSR.get('iotActuatorCommands', []);
  commands.unshift({ code, action:'VIBRATE', reason, duration_ms:VIBRATION_DURATION_MS, status:'SIMULATED_ONLY', t:Date.now() });
  RSR.set('iotActuatorCommands', commands.slice(0,30));
  alertOnce('actuator'+code, `Perintah getar dikirim (simulasi) untuk ${code}: ${reason}`, 'danger');
}
function scan(bike, rented, force, index) {
  const all = RSR.get('iotReadings', {}), prev = all[bike.code];
  const outside = rented && (force === 'geofence' || Math.random() < 0.003);
  const coord = demoCoordinate(index, outside);
  const accel = +(9.81 + Math.random()*0.3 + (force === 'shake' || Math.random()<0.005 ? 3+Math.random()*5 : 0)).toFixed(2);
  const r = {
    code:bike.code, dock:!rented, accel, outside,
    battery:Math.max(5,(prev?.battery ?? 60+Math.floor(Math.random()*40))-(Math.random()<0.05?1:0)),
    lat:+coord.lat.toFixed(6), lng:+coord.lng.toFixed(6),
    accuracy_m: 5, distance_m: Math.round(distanceMeters(GEO_CENTER,coord)),
    vibration_command:false, t:Date.now()
  };
  if (r.accel > IOT_LIMIT && (r.dock || rented)) {
    alertOnce('shake'+r.code, `Guncangan mencurigakan pada ${r.code} (${r.accel} m/s²). Lokasi: ${r.lat}, ${r.lng}`, 'danger');
    requestVibration(r.code, 'Guncangan mencurigakan');
    r.vibration_command = true;
  }
  if (r.distance_m > GEOFENCE_RADIUS_M) {
    alertOnce('geo'+r.code, `${r.code} melewati radius geofence demo. Lokasi: ${r.lat}, ${r.lng}`, 'danger');
    if (rented) requestVibration(r.code, 'Melewati batas area');
  }
  if (r.battery <= 20) alertOnce('bat'+r.code,`Baterai ${r.code} rendah (${r.battery}%)`,'info',300000);
  return r;
}
function scanFleet(force={}) {
  const rented = RSR.bookings().filter(b=>b.status==='berjalan').map(b=>b.code);
  const all = RSR.get('iotReadings',{});
  BIKES.forEach((b,i)=>all[b.code]=scan(b,rented.includes(b.code),force[b.code],i));
  RSR.set('iotReadings',all);
}
if (!Object.keys(RSR.get('iotReadings',{})).length) scanFleet();
setInterval(()=>{
  const lock=RSR.get('iotLock',{});
  if(lock.id && lock.id!==tabId && Date.now()-lock.t<5000)return;
  RSR.set('iotLock',{id:tabId,t:Date.now()}); scanFleet();
},2000);
const eventsHTML=(n=8)=>RSR.events().slice(0,n).map(e=>`<p class="border-top py-1 small mb-0 ${e.type==='danger'?'text-danger':''}">${new Date(e.t).toLocaleTimeString('id-ID')} · ${RSR.esc(e.text)}</p>`).join('')||'<p class="text-muted mb-0">Belum ada peringatan.</p>';
