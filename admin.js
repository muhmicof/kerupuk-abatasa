/* ==========================================================================
   Kerupuk Abatasa - Admin Dashboard Script (Supabase Product CRUD)
   ========================================================================== */

const DEFAULT_PRODUCTS = [
  {
    name: 'Kerupuk Ikan',
    price: 25000,
    badge: 'Paling Laris',
    desc: 'Kerupuk gurih dengan cita rasa ikan tenggiri asli segar dan tekstur super renyah.',
    image: 'assets/images/kerupuk_ikan.png'
  },
  {
    name: 'Kerupuk Udang',
    price: 30000,
    badge: '',
    desc: 'Tekstur renyah mekar dengan paduan rasa udang olahan spesial dan rasa manis gurih alami.',
    image: 'assets/images/kerupuk_udang.png'
  },
  {
    name: 'Kerupuk Bawang',
    price: 15000,
    badge: '',
    desc: 'Aroma gurih khas bawang putih pilihan yang nikmat & pas sebagai teman makan nasi.',
    image: 'assets/images/kerupuk_bawang.png'
  },
  {
    name: 'Kerupuk Kaleng',
    price: 5000,
    badge: '',
    desc: 'Kerupuk mawar legendaris dalam kemasan kaleng ikonik khas Indonesia yang selalu fresh.',
    image: 'assets/images/kerupuk_kaleng.png'
  }
];

const DEFAULT_PASSWORD = 'admin123';

// Products state
let products = [];
let pendingImageFile = null; // File object to upload to Supabase Storage

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupSupabaseRealtimeAdmin();
});

// ==================== SUPABASE REALTIME (ADMIN) ====================

function setupSupabaseRealtimeAdmin() {
  supabaseClient
    .channel('admin:products')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
      // Silently reload products when changes come from another tab/device
      loadProductsSilently();
    })
    .subscribe();

  supabaseClient
    .channel('admin:visitor_logs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_logs' }, () => {
      loadVisitorStats();
    })
    .subscribe();
}

async function loadProductsSilently() {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    products = data || [];
    renderAdminTable();
    updateStats();
  } catch (err) {
    console.error('Silent reload failed:', err);
  }
}

// Load visitor stats from Supabase
async function loadVisitorStats() {
  const todayElem = document.getElementById('statVisitorsToday');
  const totalElem = document.getElementById('statVisitorsTotal');

  if (!todayElem || !totalElem) return;

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // Total visits count
    const { count: totalCount, error: totalErr } = await supabaseClient
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true });

    if (totalErr) throw totalErr;

    // Today's visits count
    const { count: todayCount, error: todayErr } = await supabaseClient
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })
      .eq('visit_date', todayStr);

    if (todayErr) throw todayErr;

    todayElem.textContent = todayCount !== null ? todayCount : 0;
    totalElem.textContent = totalCount !== null ? totalCount : 0;
  } catch (err) {
    console.warn('Visitor stats error (table visitor_logs may need to be initialized in Supabase):', err.message);
  }
}

// ==================== AUTHENTICATION ====================

// Check Authentication status
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('admin_logged_in');
  const loginOverlay = document.getElementById('loginOverlay');
  const adminLayout = document.getElementById('adminLayout');

  if (isLoggedIn === 'true') {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'flex';
    loadProducts();
    loadVisitorStats();
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
    loadVisitorStats();
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

// ==================== CHANGE PASSWORD ====================

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

// ==================== SUPABASE CRUD ====================

// Load products from Supabase
async function loadProducts() {
  const tbody = document.getElementById('adminProductTable');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">
          <div class="loading-spinner"></div> Memuat produk dari Supabase...
        </td>
      </tr>
    `;
  }

  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    products = data || [];
    renderAdminTable();
    updateStats();
  } catch (err) {
    console.error('Error loading products:', err);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:30px; color:#d95314;">
            ⚠️ Gagal memuat produk dari Supabase: ${err.message}
          </td>
        </tr>
      `;
    }
  }
}

// Upload image file to Supabase Storage
async function uploadImageToStorage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabaseClient.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabaseClient.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

// Delete image from Supabase Storage (cleanup)
async function deleteImageFromStorage(imageUrl) {
  if (!imageUrl || !imageUrl.includes('product-images')) return;
  try {
    // Extract path from the full URL
    const parts = imageUrl.split('/product-images/');
    if (parts.length < 2) return;
    const filePath = parts[1];
    await supabaseClient.storage.from('product-images').remove([filePath]);
  } catch (err) {
    console.warn('Could not delete old image:', err);
  }
}

// Save Product (Create or Update) — via Supabase
async function saveProduct(event) {
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

  const btnSave = document.getElementById('btnSaveProduct');
  const originalText = btnSave.textContent;
  btnSave.textContent = 'Mengupload...';
  btnSave.disabled = true;

  try {
    // Upload image to Supabase Storage if a new file was selected
    if (pendingImageFile) {
      btnSave.textContent = 'Mengupload gambar...';
      image = await uploadImageToStorage(pendingImageFile);
      pendingImageFile = null;
    }

    btnSave.textContent = 'Menyimpan...';

    if (idInput) {
      // If editing, delete old image from storage if it changed
      const oldProduct = products.find(p => String(p.id) === String(idInput));
      if (oldProduct && oldProduct.image !== image && oldProduct.image.includes('product-images')) {
        await deleteImageFromStorage(oldProduct.image);
      }

      // Update existing product
      const { error } = await supabaseClient
        .from('products')
        .update({ name, price, badge, desc, image })
        .eq('id', Number(idInput));

      if (error) throw error;
    } else {
      // Insert new product
      const { error } = await supabaseClient
        .from('products')
        .insert([{ name, price, badge, desc, image }]);

      if (error) throw error;
    }

    await loadProducts();
    closeProductModal();
  } catch (err) {
    console.error('Error saving product:', err);
    alert('Gagal menyimpan produk: ' + err.message);
  } finally {
    btnSave.textContent = originalText;
    btnSave.disabled = false;
  }
}

// Delete Product — via Supabase
let deleteTargetId = null;

function deleteProduct(id) {
  const item = products.find(p => String(p.id) === String(id));
  if (!item) return;

  deleteTargetId = id;
  const nameElement = document.getElementById('deleteProductName');
  if (nameElement) nameElement.textContent = item.name;

  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.classList.add('active');
}

async function confirmDeleteProduct() {
  if (deleteTargetId !== null) {
    try {
      // Delete image from Storage first
      const item = products.find(p => String(p.id) === String(deleteTargetId));
      if (item && item.image) {
        await deleteImageFromStorage(item.image);
      }

      const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', Number(deleteTargetId));

      if (error) throw error;

      await loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Gagal menghapus produk: ' + err.message);
    }
    deleteTargetId = null;
  }
  closeDeleteModal();
}

function closeDeleteModal() {
  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// Reset to Default Products — via Supabase
async function resetDefaultProducts() {
  if (confirm('Apakah Anda yakin ingin mengembalikan daftar produk ke awal (default)? Semua produk saat ini akan dihapus.')) {
    try {
      // Delete all images from Storage
      for (const p of products) {
        if (p.image && p.image.includes('product-images')) {
          await deleteImageFromStorage(p.image);
        }
      }

      // Delete all existing products
      const { error: deleteError } = await supabaseClient
        .from('products')
        .delete()
        .neq('id', 0); // Delete all rows

      if (deleteError) throw deleteError;

      // Insert default products
      const { error: insertError } = await supabaseClient
        .from('products')
        .insert(DEFAULT_PRODUCTS);

      if (insertError) throw insertError;

      await loadProducts();
      alert('Daftar produk telah direset ke default.');
    } catch (err) {
      console.error('Error resetting products:', err);
      alert('Gagal mereset produk: ' + err.message);
    }
  }
}

// ==================== UI RENDERING ====================

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

// ==================== PRODUCT MODAL ====================

// Open Modal for Add
function openProductModal() {
  pendingImageFile = null;
  document.getElementById('modalTitle').textContent = 'Tambah Produk Baru';
  document.getElementById('productId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productBadge').value = '';
  document.getElementById('productDesc').value = '';
  document.getElementById('productImageUrl').value = 'assets/images/kerupuk_ikan.png';
  document.getElementById('productImageUrl').placeholder = 'Masukkan URL / Path Gambar (misal: assets/images/kerupuk_ikan.png)';
  document.getElementById('productImageFile').value = '';
  document.getElementById('imagePreview').src = 'assets/images/kerupuk_ikan.png';

  document.getElementById('productModalOverlay').classList.add('active');
}

// Open Modal for Edit
function editProduct(id) {
  pendingImageFile = null;
  const item = products.find(p => String(p.id) === String(id));
  if (!item) return;

  document.getElementById('modalTitle').textContent = 'Edit Produk';
  document.getElementById('productId').value = item.id;
  document.getElementById('productName').value = item.name;
  document.getElementById('productPrice').value = item.price;
  document.getElementById('productBadge').value = item.badge || '';
  document.getElementById('productDesc').value = item.desc;
  document.getElementById('productImageUrl').value = item.image;
  document.getElementById('productImageUrl').placeholder = 'Masukkan URL / Path Gambar';
  document.getElementById('productImageFile').value = '';
  document.getElementById('imagePreview').src = item.image;

  document.getElementById('productModalOverlay').classList.add('active');
}

// Close Modal
function closeProductModal() {
  document.getElementById('productModalOverlay').classList.remove('active');
}

// Preview Uploaded Image File & store for Supabase Storage upload
function previewImageFile(event) {
  const file = event.target.files[0];
  if (file) {
    // Store file reference for upload on save
    pendingImageFile = file;

    // Show local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('imagePreview').src = e.target.result;
      // Clear the URL input since we'll use the uploaded file
      document.getElementById('productImageUrl').value = '';
      document.getElementById('productImageUrl').placeholder = `📎 ${file.name} (akan diupload saat simpan)`;
    };
    reader.readAsDataURL(file);
  }
}
