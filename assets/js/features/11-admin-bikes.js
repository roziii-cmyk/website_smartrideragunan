// ===== FITUR 11: MANAJEMEN SEPEDA =====
// Admin mengubah tarif & status (Tersedia/Perawatan). Disimpan ke localStorage dan berlaku di katalog.
function drawBikes() {
  $('bikeRows').innerHTML = BIKES.map((b, i) => `<tr><td>${b.code}</td><td>${b.title}</td>
    <td><input id="price${i}" type="number" step="1000" value="${b.price}" class="form-control form-control-sm d-inline-block" style="width:110px"/> /${UNIT_LABEL[b.unit].toLowerCase()}</td>
    <td><select id="status${i}" class="form-select form-select-sm d-inline-block" style="width:130px">${['Tersedia', 'Perawatan'].map(s => `<option ${s === b.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td><button class="btn btn-sm btn-primary" onclick="saveBike(${i})">Simpan</button></td></tr>`).join('');
}
function saveBike(i) {
  BIKES[i].price = Number($('price' + i).value) || BIKES[i].price; BIKES[i].status = $('status' + i).value;
  RSR.set('bikes_v2', BIKES); RSR.notify('Data ' + BIKES[i].code + ' disimpan', 'success');
}
