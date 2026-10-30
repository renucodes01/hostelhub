if (!guard('warden')) throw new Error('not authorised');
$('#who').text(me().name);

let ROOMS = [], STUDENTS = [], FEES = [], COMPS = [], charts = {}, curRoom = null, curComp = null;
const modal = (id) => bootstrap.Modal.getOrCreateInstance(document.getElementById(id));
const titles = { overview: 'Dashboard', rooms: 'Rooms', students: 'Students', fees: 'Fee Tracking', complaints: 'Complaints' };

$('.sidebar .nav-item[data-sec]').on('click', function () {
  const s = $(this).data('sec');
  $('.sidebar .nav-item').removeClass('active'); $(this).addClass('active');
  $('.section').removeClass('show'); $('#' + s).addClass('show');
  $('#title').text(titles[s]); $('.sidebar').removeClass('open');
  if (s === 'overview') loadStats(); if (s === 'rooms') loadRooms();
  if (s === 'students') loadStudents(); if (s === 'fees') loadFees(); if (s === 'complaints') loadComps();
});

/* ---------- OVERVIEW ---------- */
function drawChart(id, type, labels, data, colors) {
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(document.getElementById(id), {
    type, data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}
function loadStats() {
  api('GET', '/stats').done((s) => {
    $('#stStudents').text(s.students);
    $('#stBeds').text(s.occupied + ' / ' + s.capacity);
    $('#stCollected').text(money(s.feeCollected));
    $('#stPending').text(money(s.feePending));
    drawChart('chOcc', 'doughnut', ['Occupied', 'Vacant'], [s.occupied, s.vacant], ['#6366f1', '#10b981']);
    drawChart('chComp', 'bar', ['Open', 'In Progress', 'Resolved'], [s.complaints.Open, s.complaints['In Progress'], s.complaints.Resolved], ['#ef4444', '#f59e0b', '#10b981']);
    charts.chComp.options.plugins.legend.display = false; charts.chComp.update();
  });
}

/* ---------- ROOMS ---------- */
function loadRooms() { return api('GET', '/rooms').done((r) => { ROOMS = r; renderRooms(); }); }
function renderRooms() {
  const f = $('#roomFilter').val();
  const list = ROOMS.filter((r) => !f || (f === 'full' ? r.occupants.length >= r.capacity : r.occupants.length < r.capacity));
  if (!list.length) return $('#roomGrid').html('<p class="text-muted">No rooms found.</p>');
  $('#roomGrid').html(list.map((r) => {
    const occ = r.occupants.length, pct = Math.round((occ / r.capacity) * 100), full = occ >= r.capacity;
    return `<div class="col-sm-6 col-lg-4 col-xxl-3"><div class="room-card ${full ? 'full' : 'free'}">
      <div class="d-flex justify-content-between"><h5 class="mb-0">${esc(r.number)}</h5><span class="badge bg-light text-dark">Block ${esc(r.block)}</span></div>
      <small class="text-muted">Floor ${r.floor} · ${esc(r.type)} · ${money(r.fee)}</small>
      <div class="progress my-2" style="height:8px"><div class="progress-bar ${full ? 'bg-danger' : 'bg-success'}" style="width:${pct}%"></div></div>
      <small>${occ}/${r.capacity} beds filled</small>
      <div class="mt-2 d-flex gap-2"><button class="btn btn-sm btn-grad flex-grow-1" onclick="openRoom('${r._id}')">Manage</button>
      <button class="btn btn-sm btn-outline-danger" onclick="delRoom('${r._id}')"><i class="bi bi-trash"></i></button></div></div></div>`;
  }).join(''));
}
$('#roomFilter').on('change', renderRooms);
$('#roomForm').on('submit', function (e) {
  e.preventDefault();
  api('POST', '/rooms', { number: $('#rmNo').val(), block: $('#rmBlock').val(), floor: +$('#rmFloor').val(), type: $('#rmType').val(), capacity: +$('#rmCap').val(), fee: +$('#rmFee').val() })
    .done(() => { toast('Room added'); modal('mRoom').hide(); this.reset(); loadRooms(); })
    .fail((x) => toast(errMsg(x), 'danger'));
});
function delRoom(id) {
  if (!confirm('Delete this room?')) return;
  api('DELETE', '/rooms/' + id).done(() => { toast('Room deleted'); loadRooms(); }).fail((x) => toast(errMsg(x), 'danger'));
}
function openRoom(id) {
  curRoom = id;
  $.when(loadRooms(), api('GET', '/students').done((s) => (STUDENTS = s))).done(() => {
    const r = ROOMS.find((x) => x._id === id); if (!r) return;
    $('#alTitle').text(`Room ${r.number} (Block ${r.block})`);
    $('#alOcc').html(r.occupants.length ? r.occupants.map((o) => `<li class="list-group-item d-flex justify-content-between align-items-center">
      <span>${esc(o.name)}<br><small class="text-muted">${esc(o.course || '')}</small></span>
      <button class="btn btn-sm btn-outline-danger" onclick="vacate('${o._id}')">Vacate</button></li>`).join('') : '<li class="list-group-item text-muted">No occupants</li>');
    const free = STUDENTS.filter((s) => !s.room);
    const full = r.occupants.length >= r.capacity;
    $('#alForm').toggle(!full);
    $('#alStudent').html(free.length ? free.map((s) => `<option value="${s._id}">${esc(s.name)}</option>`).join('') : '<option value="">No unassigned students</option>');
    modal('mAlloc').show();
  });
}
$('#alBtn').on('click', function () {
  const sid = $('#alStudent').val(); if (!sid) return toast('Select a student', 'warning');
  api('POST', `/rooms/${curRoom}/allocate`, { studentId: sid }).done(() => { toast('Room allocated'); openRoom(curRoom); }).fail((x) => toast(errMsg(x), 'danger'));
});
function vacate(sid) {
  api('POST', `/rooms/${curRoom}/vacate`, { studentId: sid }).done(() => { toast('Student vacated'); openRoom(curRoom); }).fail((x) => toast(errMsg(x), 'danger'));
}

/* ---------- STUDENTS ---------- */
function loadStudents() { return api('GET', '/students').done((s) => { STUDENTS = s; renderStudents(); }); }
function renderStudents() {
  const q = $('#stuSearch').val().toLowerCase();
  const list = STUDENTS.filter((s) => [s.name, s.email, s.course].join(' ').toLowerCase().includes(q));
  $('#stuBody').html(list.length ? list.map((s) => `<tr><td class="fw-medium">${esc(s.name)}<br><small class="text-muted">${esc(s.year || '')}</small></td>
    <td>${esc(s.email)}</td><td>${esc(s.course || '-')}</td><td>${esc(s.phone || '-')}</td>
    <td>${esc(s.guardianName || '-')}<br><small class="text-muted">${esc(s.guardianPhone || '')}</small></td>
    <td>${s.room ? `<span class="badge bg-primary badge-soft">${esc(s.room.number)}</span>` : '<span class="badge bg-secondary badge-soft">Not allotted</span>'}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="delStudent('${s._id}')"><i class="bi bi-trash"></i></button></td></tr>`).join('')
    : '<tr><td colspan="7" class="text-center text-muted">No students found</td></tr>');
}
$('#stuSearch').on('input', renderStudents);
function delStudent(id) {
  if (!confirm('Remove this student and all their fee/complaint records?')) return;
  api('DELETE', '/students/' + id).done(() => { toast('Student removed'); loadStudents(); }).fail((x) => toast(errMsg(x), 'danger'));
}

/* ---------- FEES ---------- */
function loadFees() { return api('GET', '/fees').done((f) => { FEES = f; renderFees(); }); }
function renderFees() {
  const f = $('#feeFilter').val();
  const list = FEES.filter((x) => !f || x.status === f);
  $('#feeBody').html(list.length ? list.map((x) => `<tr><td>${esc(x.student ? x.student.name : 'Deleted')}</td><td>${esc(x.title)}</td>
    <td class="fw-semibold">${money(x.amount)}</td><td>${fdate(x.dueDate)}</td><td>${statusBadge(x.status)}</td><td>${fdate(x.paidOn)}</td>
    <td class="text-nowrap">${x.status === 'Pending' ? `<button class="btn btn-sm btn-success me-1" onclick="payFee('${x._id}')">Mark paid</button>` : ''}
    <button class="btn btn-sm btn-outline-danger" onclick="delFee('${x._id}')"><i class="bi bi-trash"></i></button></td></tr>`).join('')
    : '<tr><td colspan="7" class="text-center text-muted">No fee records</td></tr>');
}
$('#feeFilter').on('change', renderFees);
$('#mFee').on('show.bs.modal', function () {
  api('GET', '/students').done((s) => {
    STUDENTS = s;
    $('#feStudent').html('<option value="all">All students</option>' + s.map((x) => `<option value="${x._id}">${esc(x.name)}</option>`).join(''));
  });
});
$('#feeForm').on('submit', function (e) {
  e.preventDefault();
  api('POST', '/fees', { studentId: $('#feStudent').val(), title: $('#feTitle').val(), amount: +$('#feAmt').val(), dueDate: $('#feDue').val() })
    .done((r) => { toast(r.message); modal('mFee').hide(); this.reset(); loadFees(); })
    .fail((x) => toast(errMsg(x), 'danger'));
});
function payFee(id) {
  const m = prompt('Payment method (Cash / UPI / Card / Bank)', 'Cash'); if (m === null) return;
  api('PUT', `/fees/${id}/pay`, { method: m }).done(() => { toast('Marked as paid'); loadFees(); }).fail((x) => toast(errMsg(x), 'danger'));
}
function delFee(id) {
  if (!confirm('Delete this fee record?')) return;
  api('DELETE', '/fees/' + id).done(() => { toast('Deleted'); loadFees(); });
}

/* ---------- COMPLAINTS ---------- */
function loadComps() { return api('GET', '/complaints').done((c) => { COMPS = c; renderComps(); }); }
function renderComps() {
  $('#compBody').html(COMPS.length ? COMPS.map((c) => `<tr><td>${esc(c.student ? c.student.name : 'Deleted')}</td><td>${esc(c.category)}</td>
    <td><b>${esc(c.title)}</b><br><small class="text-muted">${esc(c.description)}</small></td><td>${fdate(c.createdAt)}</td>
    <td>${statusBadge(c.status)}</td><td><small>${esc(c.remark || '-')}</small></td>
    <td><button class="btn btn-sm btn-grad" onclick="openComp('${c._id}')">Update</button></td></tr>`).join('')
    : '<tr><td colspan="7" class="text-center text-muted">No complaints 🎉</td></tr>');
}
function openComp(id) {
  curComp = COMPS.find((c) => c._id === id);
  $('#cpText').text(curComp.title); $('#cpStatus').val(curComp.status); $('#cpRemark').val(curComp.remark || '');
  modal('mComp').show();
}
$('#compForm').on('submit', function (e) {
  e.preventDefault();
  api('PUT', '/complaints/' + curComp._id, { status: $('#cpStatus').val(), remark: $('#cpRemark').val() })
    .done(() => { toast('Complaint updated'); modal('mComp').hide(); loadComps(); })
    .fail((x) => toast(errMsg(x), 'danger'));
});

loadStats();
