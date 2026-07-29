/* ==========================================================================
   Kerupuk Abatasa - Admin Dashboard Script (localStorage Product CRUD)
   ========================================================================== */

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Kerupuk Ikan',
    price: 25000,
    badge: 'Paling Laris',
    desc: 'Kerupuk gurih dengan cita rasa ikan tenggiri asli segar dan tekstur super renyah.',
    image: 'assets/images/kerupuk_ikan.png'
  },
  {
    id: 2,
    name: 'Kerupuk Udang',
    price: 30000,
    badge: '',
    desc: 'Tekstur renyah mekar dengan paduan rasa udang olahan spesial dan rasa manis gurih alami.',
    image: 'assets/images/kerupuk_udang.png'
  },
  {
    id: 3,
    name: 'Kerupuk Bawang',
    price: 15000,
    badge: '',
    desc: 'Aroma gurih khas bawang putih pilihan yang nikmat & pas sebagai teman makan nasi.',
    image: 'assets/images/kerupuk_bawang.png'
  },
  {
    id: 4,
    name: 'Kerupuk Kaleng',
    price: 5000,
    badge: '',
    desc: 'Kerupuk mawar legendaris dalam kemasan kaleng ikonik khas Indonesia yang selalu fresh.',
    image: 'assets/images/kerupuk_kaleng.png'
  }
];

const DEFAULT_PASSWORD = 'admin123';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

// Check Authentication status
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('admin_logged_in');
  const loginOverlay = document.getElementById('loginOverlay');
  const adminLayout = document.getElementById('adminLayout');

  if (isLoggedIn === 'true') {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'flex';
    loadProducts();
  } else {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (adminLayout) adminLayout.style.display = 'none';
  }
}

// Get saved password or default
function getAdminPassword() {
  return localStorage.getItem('admin_password') || DEFAULT_PASSWORD;
}

// Handle Login Form Submit
function handleLogin(event) {
  event.preventDefault();
  const passwordInput = document.getElementById('loginPassword');
  const errorMsg = document.getElementById('loginErrorMsg');
  const enteredPassword = passwordInput.value.trim();

  if (enteredPassword === getAdminPassword()) {
    sessionStorage.setItem('admin_logged_in', 'true');
    errorMsg.style.display = 'none';
    passwordInput.value = '';
    
    const loginOverlay = document.getElementById('loginOverlay');
    const adminLayout = document.getElementById('adminLayout');
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'flex';
    
    loadProducts();
  } else {
    errorMsg.textContent = 'Password salah! Silakan coba lagi.';
    errorMsg.style.display = 'block';
    
    const card = document.querySelector('.admin-login-card');
    if (card) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 400);
    }
  }
}

// Logout Admin
function logoutAdmin() {
  if (confirm('Apakah Anda yakin ingin keluar dari dashboard admin?')) {
    sessionStorage.removeItem('admin_logged_in');
    checkAuth();
  }
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;

  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
  } else {
    input.type = 'password';
    icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  }
}

// Change Password Modal functions
function openChangePasswordModal() {
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  document.getElementById('changePwdError').style.display = 'none';
  document.getElementById('changePwdSuccess').style.display = 'none';
  document.getElementById('changePasswordModalOverlay').classList.add('active');
}

function closeChangePasswordModal() {
  document.getElementById('changePasswordModalOverlay').classList.remove('active');
}

function saveNewPassword(event) {
  event.preventDefault();
  const currentPwd = document.getElementById('currentPassword').value;
  const newPwd = document.getElementById('newPassword').value;
  const confirmPwd = document.getElementById('confirmPassword').value;
  const errorMsg = document.getElementById('changePwdError');
  const successMsg = document.getElementById('changePwdSuccess');

  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  if (currentPwd !== getAdminPassword()) {
    errorMsg.textContent = 'Password saat ini tidak sesuai!';
    errorMsg.style.display = 'block';
    return;
  }

  if (newPwd.length < 4) {
    errorMsg.textContent = 'Password baru minimal 4 karakter!';
    errorMsg.style.display = 'block';
    return;
  }

  if (newPwd !== confirmPwd) {
    errorMsg.textContent = 'Konfirmasi password baru tidak cocok!';
    errorMsg.style.display = 'block';
    return;
  }

  localStorage.setItem('admin_password', newPwd);
  successMsg.textContent = 'Password berhasil diperbarui!';
  successMsg.style.display = 'block';

  setTimeout(() => {
    closeChangePasswordModal();
  }, 1200);
}

// Load products from localStorage or initialize defaults
function loadProducts() {
  const saved = localStorage.getItem('kerupuk_products');
  if (saved) {
    try {
      products = JSON.parse(saved);
    } catch (e) {
      products = [...DEFAULT_PRODUCTS];
      saveToLocalStorage();
    }
  } else {
    products = [...DEFAULT_PRODUCTS];
    saveToLocalStorage();
  }

  renderAdminTable();
  updateStats();
}

// Save current products to localStorage
function saveToLocalStorage() {
  localStorage.setItem('kerupuk_products', JSON.stringify(products));
}

// Render Table Rows
function renderAdminTable() {
  const tbody = document.getElementById('adminProductTable');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">
          Belum ada produk. Klik <strong>"Tambah Produk Baru"</strong> untuk menambahkan produk.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  products.forEach(item => {
    html += `
      <tr>
        <td>
          <img src="${item.image}" alt="${item.name}" class="table-product-img" onerror="this.src='assets/images/kerupuk_ikan.png'">
        </td>
        <td><strong>${item.name}</strong></td>
        <td style="max-width:280px;">${item.desc}</td>
        <td><strong><span class="currency">Rp</span><span class="price-val">${Number(item.price).toLocaleString('id-ID')}</span></strong></td>
        <td>
          ${item.badge ? `<span class="product-badge">${item.badge}</span>` : '<span class="text-muted">-</span>'}
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon btn-edit" onclick="editProduct('${item.id}')">Edit</button>
            <button class="btn-icon btn-delete" onclick="deleteProduct('${item.id}')">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Update Admin Stats
function updateStats() {
  document.getElementById('statTotalProducts').textContent = products.length;
  document.getElementById('productCountBadge').textContent = products.length;

  const featured = products.filter(p => p.badge && p.badge.trim() !== '').length;
  document.getElementById('statFeaturedProducts').textContent = featured;
}

// Open Modal for Add
function openProductModal() {
  document.getElementById('modalTitle').textContent = 'Tambah Produk Baru';
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productBadge').value = '';
  document.getElementById('productDesc').value = '';
  document.getElementById('productImageUrl').value = 'assets/images/kerupuk_ikan.png';
  document.getElementById('productImageFile').value = '';
  document.getElementById('imagePreview').src = 'assets/images/kerupuk_ikan.png';

  document.getElementById('productModalOverlay').classList.add('active');
}

// Open Modal for Edit
function editProduct(id) {
  const item = products.find(p => String(p.id) === String(id));
  if (!item) return;

  document.getElementById('modalTitle').textContent = 'Edit Produk';
  document.getElementById('productId').value = item.id;
  document.getElementById('productName').value = item.name;
  document.getElementById('productPrice').value = item.price;
  document.getElementById('productBadge').value = item.badge || '';
  document.getElementById('productDesc').value = item.desc;
  document.getElementById('productImageUrl').value = item.image;
  document.getElementById('imagePreview').src = item.image;

  document.getElementById('productModalOverlay').classList.add('active');
}

// Close Modal
function closeProductModal() {
  document.getElementById('productModalOverlay').classList.remove('active');
}

// Preview Uploaded Image File
function previewImageFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('imagePreview').src = e.target.result;
      document.getElementById('productImageUrl').value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Save Product (Create or Update)
function saveProduct(event) {
  event.preventDefault();

  const idInput = document.getElementById('productId').value;
  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const badge = document.getElementById('productBadge').value.trim();
  const desc = document.getElementById('productDesc').value.trim();
  let image = document.getElementById('productImageUrl').value.trim();

  if (!image) {
    image = 'assets/images/kerupuk_ikan.png';
  }

  if (idInput) {
    // Update
    const index = products.findIndex(p => String(p.id) === String(idInput));
    if (index > -1) {
      const existingId = products[index].id;
      products[index] = { id: existingId, name, price, badge, desc, image };
    }
  } else {
    // Create new
    const newId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;
    products.push({ id: newId, name, price, badge, desc, image });
  }

  saveToLocalStorage();
  renderAdminTable();
  updateStats();
  closeProductModal();
}

let deleteTargetId = null;

// Delete Product Modal Trigger
function deleteProduct(id) {
  const item = products.find(p => String(p.id) === String(id));
  if (!item) return;

  deleteTargetId = id;
  const nameElement = document.getElementById('deleteProductName');
  if (nameElement) nameElement.textContent = item.name;

  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.classList.add('active');
}

// Confirm Delete Action
function confirmDeleteProduct() {
  if (deleteTargetId !== null) {
    products = products.filter(p => String(p.id) !== String(deleteTargetId));
    saveToLocalStorage();
    renderAdminTable();
    updateStats();
    deleteTargetId = null;
  }
  closeDeleteModal();
}

// Close Delete Modal
function closeDeleteModal() {
  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// Reset to Default Products
function resetDefaultProducts() {
  if (confirm('Apakah Anda yakin ingin mengembalikan daftar produk ke awal (default)?')) {
    products = [...DEFAULT_PRODUCTS];
    saveToLocalStorage();
    renderAdminTable();
    updateStats();
    alert('Daftar produk telah direset ke default.');
  }
}
