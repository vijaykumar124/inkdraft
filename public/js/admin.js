/* ============================================================
   InkDraft Admin Panel — JavaScript
   CRUD operations, modals, file uploads, toasts
   ============================================================ */

'use strict';

// ── Sidebar Mobile Toggle ─────────────────────────────────
const sidebar = document.querySelector('.admin-sidebar');
const mobileToggle = document.querySelector('.sidebar-mobile-toggle');
mobileToggle?.addEventListener('click', () => {
  sidebar?.classList.toggle('open');
});

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.querySelector('.admin-toasts');
  if (!container) {
    container = document.createElement('div');
    container.className = 'admin-toasts';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✗', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `<span style="font-size:1rem">${icons[type] || '●'}</span><span class="toast-text">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Modal ─────────────────────────────────────────────────
function openModal(id) {
  const backdrop = document.getElementById(id);
  if (backdrop) {
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeModal(id) {
  const backdrop = document.getElementById(id);
  if (backdrop) {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal(backdrop.id);
  });
});
document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal-backdrop');
    if (modal) closeModal(modal.id);
  });
});
document.querySelectorAll('[data-open-modal]').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.openModal));
});

// ── Image Preview ─────────────────────────────────────────
document.querySelectorAll('input[type="file"]').forEach(input => {
  input.addEventListener('change', (e) => {
    const preview = input.closest('.file-drop')?.querySelector('.file-preview');
    if (!preview) return;
    preview.innerHTML = '';
    Array.from(e.target.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
});

// ── AJAX Form Submit ──────────────────────────────────────
async function submitForm(form, url, method = 'POST') {
  const btn = form.querySelector('[type="submit"]');
  const original = btn?.innerHTML;
  if (btn) { btn.innerHTML = '<span>Saving...</span>'; btn.disabled = true; }

  try {
    const formData = new FormData(form);
    const res = await fetch(url, { method, body: formData });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      return { success: true, data };
    } else {
      showToast(data.message || 'Error occurred', 'error');
      return { success: false };
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
    return { success: false };
  } finally {
    if (btn) { btn.innerHTML = original; btn.disabled = false; }
  }
}

// ── Delete Confirm ────────────────────────────────────────
async function confirmDelete(url, onSuccess) {
  if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
  try {
    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Deleted successfully', 'success');
      onSuccess?.();
    } else {
      showToast(data.message || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

// ── Table Search ──────────────────────────────────────────
document.querySelectorAll('[data-search]').forEach(input => {
  const tableId = input.dataset.search;
  const table = document.getElementById(tableId);
  if (!table) return;
  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    table.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
  });
});

// ── Status Color Mapping ──────────────────────────────────
function getStatusBadge(status) {
  const map = {
    pending: 'badge-warning',
    reviewing: 'badge-blue',
    quoted: 'badge-gold',
    confirmed: 'badge-green',
    'in-progress': 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-red'
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

// ── Settings Form ─────────────────────────────────────────
const settingsForm = document.getElementById('settings-form');
settingsForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = settingsForm.querySelector('[type="submit"]');
  const original = btn?.innerHTML;
  if (btn) { btn.innerHTML = 'Saving...'; btn.disabled = true; }

  const formData = new FormData(settingsForm);
  const data = {};
  for (const [key, value] of formData.entries()) data[key] = value;

  try {
    const res = await fetch('/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) showToast(result.message, 'success');
    else showToast(result.message, 'error');
  } catch {
    showToast('Network error', 'error');
  } finally {
    if (btn) { btn.innerHTML = original; btn.disabled = false; }
  }
});

// ── Sidebar Active Link ───────────────────────────────────
const currentPath = window.location.pathname;
document.querySelectorAll('.sidebar-link').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  }
});

// ── Chart Animation ───────────────────────────────────────
function animateCharts() {
  document.querySelectorAll('.chart-bar-item').forEach((bar, i) => {
    const height = bar.dataset.height || '30';
    setTimeout(() => {
      bar.style.height = height + '%';
    }, i * 60);
  });
}
animateCharts();

// ── Order Detail Modal ────────────────────────────────────
document.querySelectorAll('[data-view-order]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.viewOrder;
    try {
      const res = await fetch(`/admin/orders/${id}`);
      const order = await res.json();
      const detail = document.getElementById('order-detail-content');
      if (detail && order) {
        detail.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
            <div><div class="form-label">Order #</div><div>${order.orderNumber}</div></div>
            <div><div class="form-label">Status</div><div>${getStatusBadge(order.status)}</div></div>
            <div><div class="form-label">Client</div><div>${order.clientName}</div></div>
            <div><div class="form-label">Email</div><div>${order.clientEmail}</div></div>
            <div><div class="form-label">Phone</div><div>${order.clientPhone || 'N/A'}</div></div>
            <div><div class="form-label">Budget</div><div>${order.budget || 'N/A'}</div></div>
            <div><div class="form-label">Style</div><div>${order.tattooStyle}</div></div>
            <div><div class="form-label">Placement</div><div>${order.placement}</div></div>
            <div><div class="form-label">Size</div><div>${order.size}</div></div>
            <div><div class="form-label">Date</div><div>${new Date(order.createdAt).toLocaleDateString()}</div></div>
            <div style="grid-column:1/-1"><div class="form-label">Description</div><div>${order.description}</div></div>
            ${order.adminNotes ? `<div style="grid-column:1/-1"><div class="form-label">Admin Notes</div><div>${order.adminNotes}</div></div>` : ''}
          </div>
        `;
        openModal('order-detail-modal');
      }
    } catch (err) {
      showToast('Failed to load order details', 'error');
    }
  });
});

// ── Update Order Status ───────────────────────────────────
const orderUpdateForm = document.getElementById('order-update-form');
orderUpdateForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const result = await submitForm(orderUpdateForm, `/admin/orders/${orderUpdateForm.dataset.orderId}`, 'PUT');
  if (result.success) setTimeout(() => location.reload(), 1000);
});
