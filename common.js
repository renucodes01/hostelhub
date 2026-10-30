const API = '/api';
const token = () => localStorage.getItem('hms_token');
const me = () => { try { return JSON.parse(localStorage.getItem('hms_user')); } catch (e) { return null; } };

function api(method, url, data) {
  return $.ajax({
    url: API + url, method, contentType: 'application/json',
    data: data ? JSON.stringify(data) : undefined,
    headers: token() ? { Authorization: 'Bearer ' + token() } : {}
  }).fail((x) => { if (x.status === 401 && token()) logout(); });
}
const errMsg = (x) => (x.responseJSON && x.responseJSON.message) || 'Something went wrong';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fdate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

function logout() { localStorage.removeItem('hms_token'); localStorage.removeItem('hms_user'); location.href = 'login.html'; }
function guard(role) {
  const u = me();
  if (!token() || !u || u.role !== role) { location.href = 'login.html'; return false; }
  return true;
}
function toast(msg, type) {
  type = type || 'success';
  if (!$('#toastBox').length) $('body').append('<div id="toastBox" class="toast-container position-fixed top-0 end-0 p-3" style="z-index:2000"></div>');
  const el = $(`<div class="toast align-items-center text-bg-${type} border-0" role="alert"><div class="d-flex"><div class="toast-body">${esc(msg)}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>`);
  $('#toastBox').append(el);
  const t = new bootstrap.Toast(el[0], { delay: 3000 });
  t.show();
  el.on('hidden.bs.toast', () => el.remove());
}
const statusBadge = (s) => {
  const map = { Paid: 'success', Pending: 'warning text-dark', Open: 'danger', 'In Progress': 'warning text-dark', Resolved: 'success' };
  return `<span class="badge badge-soft bg-${map[s] || 'secondary'}">${esc(s)}</span>`;
};
$(document).on('click', '.menu-btn', () => $('.sidebar').toggleClass('open'));
