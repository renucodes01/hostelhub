if (!guard('student')) throw new Error('not authorised');
$('#who').text(me().name);
const titles = { home: 'My Room', fees: 'My Fees', complaints: 'Complaints', profile: 'Profile' };

$('.sidebar .nav-item[data-sec]').on('click', function () {
  const s = $(this).data('sec');
  $('.sidebar .nav-item').removeClass('active'); $(this).addClass('active');
  $('.section').removeClass('show'); $('#' + s).addClass('show');
  $('#title').text(titles[s]); $('.sidebar').removeClass('open');
});

function loadProfile() {
  api('GET', '/auth/me').done((u) => {
    $('#pName').text(u.name); $('#pEmail').text(u.email);
    $('#pPhone').val(u.phone); $('#pCourse').val(u.course); $('#pYear').val(u.year || '1st Year');
    $('#pGName').val(u.guardianName); $('#pGPhone').val(u.guardianPhone);
    if (u.room) {
      $('#hRoom').text(u.room.number);
      $('#roomInfo').html(`<div class="row g-3">
        <div class="col-6 col-md-3"><small>Block</small><div class="fw-semibold">${esc(u.room.block)}</div></div>
        <div class="col-6 col-md-3"><small>Floor</small><div class="fw-semibold">${u.room.floor}</div></div>
        <div class="col-6 col-md-3"><small>Type</small><div class="fw-semibold">${esc(u.room.type)}</div></div>
        <div class="col-6 col-md-3"><small>Room fee</small><div class="fw-semibold">${money(u.room.fee)}</div></div></div>`);
    } else {
      $('#roomInfo').html('<i class="bi bi-info-circle me-1"></i>No room allotted yet. Please contact the warden.');
    }
  });
}
$('#profForm').on('submit', function (e) {
  e.preventDefault();
  api('PUT', '/students/me', { phone: $('#pPhone').val(), course: $('#pCourse').val(), year: $('#pYear').val(), guardianName: $('#pGName').val(), guardianPhone: $('#pGPhone').val() })
    .done(() => toast('Profile updated')).fail((x) => toast(errMsg(x), 'danger'));
});

function loadFees() {
  api('GET', '/fees').done((list) => {
    $('#hPending').text(money(list.filter((f) => f.status === 'Pending').reduce((s, f) => s + f.amount, 0)));
    $('#feeBody').html(list.length ? list.map((f) => `<tr><td>${esc(f.title)}</td><td class="fw-semibold">${money(f.amount)}</td><td>${fdate(f.dueDate)}</td>
      <td>${statusBadge(f.status)}</td><td>${fdate(f.paidOn)}</td><td>${esc(f.method || '-')}</td></tr>`).join('')
      : '<tr><td colspan="6" class="text-center text-muted">No fee records yet</td></tr>');
  });
}
function loadComps() {
  api('GET', '/complaints').done((list) => {
    $('#hComp').text(list.filter((c) => c.status !== 'Resolved').length);
    $('#compBody').html(list.length ? list.map((c) => `<tr><td><b>${esc(c.title)}</b><br><small class="text-muted">${esc(c.category)} · ${esc(c.description)}</small></td>
      <td>${fdate(c.createdAt)}</td><td>${statusBadge(c.status)}</td><td><small>${esc(c.remark || '-')}</small></td></tr>`).join('')
      : '<tr><td colspan="4" class="text-center text-muted">No complaints raised</td></tr>');
  });
}
$('#compForm').on('submit', function (e) {
  e.preventDefault();
  api('POST', '/complaints', { category: $('#cCat').val(), title: $('#cTitle').val(), description: $('#cDesc').val() })
    .done(() => { toast('Complaint submitted'); this.reset(); loadComps(); })
    .fail((x) => toast(errMsg(x), 'danger'));
});

loadProfile(); loadFees(); loadComps();
