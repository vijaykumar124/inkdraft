/* ============================================================
   InkDraft React Admin — API Service Layer
   All requests use Bearer JWT auth
   ============================================================ */

const BASE = '/admin/api';

function getToken() {
  return localStorage.getItem('inkdraft_admin_token');
}

async function request(method, endpoint, data = null, isFormData = false) {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };
  if (!isFormData && data) headers['Content-Type'] = 'application/json';

  const config = {
    method,
    headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  };

  const res = await fetch(`${BASE}${endpoint}`, config);
  const json = await res.json();
  if (!res.ok && res.status === 401) {
    localStorage.removeItem('inkdraft_admin_token');
    localStorage.removeItem('inkdraft_admin_user');
    window.location.href = '/admin/login';
    return;
  }
  return json;
}

export const api = {
  // Auth
  login: (email, password) =>
    fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  me: () => request('GET', '/me'),

  // Dashboard
  getDashboard: () => request('GET', '/dashboard'),

  // Artists
  getArtists: () => request('GET', '/artists'),
  createArtist: (formData) => request('POST', '/artists', formData, true),
  updateArtist: (id, formData) => request('PUT', `/artists/${id}`, formData, true),
  deleteArtist: (id) => request('DELETE', `/artists/${id}`),

  // Designs
  getDesigns: () => request('GET', '/designs'),
  createDesign: (formData) => request('POST', '/designs', formData, true),
  updateDesign: (id, formData) => request('PUT', `/designs/${id}`, formData, true),
  deleteDesign: (id) => request('DELETE', `/designs/${id}`),

  // Categories
  getCategories: () => request('GET', '/categories'),
  createCategory: (formData) => request('POST', '/categories', formData, true),
  updateCategory: (id, data) => request('PUT', `/categories/${id}`, data),
  deleteCategory: (id) => request('DELETE', `/categories/${id}`),

  // Category Gallery Images
  getCategoryImages: (categoryId) => request('GET', `/category-images/${categoryId}`),
  uploadCategoryImages: (categoryId, formData) => request('POST', `/category-images/${categoryId}`, formData, true),
  deleteCategoryImage: (id) => request('DELETE', `/category-images/${id}`),

  // Orders
  getOrders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/orders${q ? '?' + q : ''}`);
  },
  getOrder: (id) => request('GET', `/orders/${id}`),
  updateOrder: (id, data) => request('PUT', `/orders/${id}`, data),

  // Testimonials
  getTestimonials: () => request('GET', '/testimonials'),
  createTestimonial: (data) => request('POST', '/testimonials', data),
  updateTestimonial: (id, data) => request('PUT', `/testimonials/${id}`, data),
  deleteTestimonial: (id) => request('DELETE', `/testimonials/${id}`),

  // Pricing
  getPricing: () => request('GET', '/pricing'),
  createPricing: (data) => request('POST', '/pricing', data),
  updatePricing: (id, data) => request('PUT', `/pricing/${id}`, data),
  deletePricing: (id) => request('DELETE', `/pricing/${id}`),

  // Settings
  getSettings: () => request('GET', '/settings'),
  updateSettings: (data) => request('POST', '/settings', data),

  // Users
  getUsers: () => request('GET', '/users'),
  updateUser: (id, data) => request('PUT', `/users/${id}`, data),
  deleteUser: (id) => request('DELETE', `/users/${id}`),
};
