/* ==========================================================================
   Kerupuk Abatasa - Interactive Application Script
   ========================================================================== */

// State
let cart = [];

// DOM Elements
const cartToggle = document.getElementById('cartToggle');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

// Store Locations Data
const storeLocations = [
  {
    name: 'Toko Pusat',
    address: 'Jl. Cempaka Putih No. 28, Jakarta Pusat',
    hours: 'Senin - Sabtu: 08:00 - 20:00\nMinggu: 09:00 - 17:00',
    phone: '+62 858-0206-0908'
  },
  {
    name: 'Cabang Jakarta Selatan',
    address: 'Jl. Kemang Raya No. 14, Jakarta Selatan',
    hours: 'Senin - Minggu: 09:00 - 21:00',
    phone: '+62 812-9876-5432'
  },
  {
    name: 'Cabang Jakarta Timur',
    address: 'Jl. Pemuda No. 45, Rawamangun, Jakarta Timur',
    hours: 'Senin - Sabtu: 08:30 - 20:30',
    phone: '+62 813-1122-3344'
  },
  {
    name: 'Cabang Jakarta Barat',
    address: 'Jl. Puri Indah Raya No. 10, Jakarta Barat',
    hours: 'Senin - Minggu: 09:00 - 20:00',
    phone: '+62 815-5566-7788'
  }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderFrontendProducts();
});

// Render Products from LocalStorage
function renderFrontendProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  const defaultProducts = [
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

  const saved = localStorage.getItem('kerupuk_products');
  let products = defaultProducts;
  if (saved) {
    try {
      products = JSON.parse(saved);
    } catch(e) {
      products = defaultProducts;
    }
  } else {
    localStorage.setItem('kerupuk_products', JSON.stringify(defaultProducts));
  }

  if (products.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">Belum ada produk yang ditampilkan.</p>`;
    return;
  }

  let html = '';
  products.forEach(p => {
    const escapedName = p.name.replace(/'/g, "\\'");
    html += `
      <div class="product-card">
        <div class="product-img-wrapper">
          ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
          <img src="${p.image}" alt="${p.name}" onerror="this.src='assets/images/kerupuk_ikan.png'">
        </div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          <div class="product-footer">
            <span class="product-price"><span class="currency">Rp</span><span class="price-val">${Number(p.price).toLocaleString('id-ID')}</span></span>
            <button class="btn btn-buy" onclick="addToCart('${escapedName}', ${p.price}, '${p.image}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function setupEventListeners() {
  // Cart Toggle
  cartToggle.addEventListener('click', () => toggleCart(true));
  
  // Mobile Nav Toggle
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when a nav item is clicked
  const navLinks = document.querySelectorAll('.nav-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });

  // Reset mobile nav on window resize to avoid stale open state
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navMenu.classList.remove('active');
    }
  });

  // Smooth Active Nav Link Update on Scroll
  window.addEventListener('scroll', highlightActiveNav);
}

// Toggle Cart Slide-over
function toggleCart(open) {
  if (open) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  } else {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  }
}

// Add Item to Cart
function addToCart(title, price, image) {
  const existingIndex = cart.findIndex(item => item.title === title);
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ title, price, image, qty: 1 });
  }

  updateCartUI();
  showToast(`🛒 ${title} berhasil ditambahkan ke keranjang!`);
}

// Show Toast Message
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Update Cart Quantity
function updateQty(index, change) {
  if (cart[index]) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
  }
  updateCartUI();
}

// Update Cart DOM
function updateCartUI() {
  // Update Count Badge
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;

  // Render Items
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <p>Keranjang Anda masih kosong</p>
      </div>
    `;
    cartTotal.innerHTML = '<span class="currency">Rp</span><span class="price-val">0</span>';
    return;
  }

  let html = '';
  let grandTotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    grandTotal += itemTotal;

    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}">
        <div class="cart-item-details">
          <h4>${item.title}</h4>
          <p class="cart-item-price"><span class="currency">Rp</span><span class="price-val" style="font-size: 0.9rem;">${itemTotal.toLocaleString('id-ID')}</span></p>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
  });

  cartItems.innerHTML = html;
  cartTotal.innerHTML = `<span class="currency">Rp</span><span class="price-val">${grandTotal.toLocaleString('id-ID')}</span>`;
}

// Store Location Marker Selection
function selectStore(index) {
  const pins = document.querySelectorAll('.map-pin');
  pins.forEach((pin, idx) => {
    if (idx === index) {
      pin.classList.add('active');
    } else {
      pin.classList.remove('active');
    }
  });

  const store = storeLocations[index];
  if (store) {
    document.querySelector('#storeInfoCard h5').textContent = store.name;
    document.getElementById('storeAddress').textContent = store.address;
    document.getElementById('storeHours').innerHTML = store.hours.replace('\n', '<br>');
    document.getElementById('storePhone').textContent = store.phone;
  }
}

// Open Google Maps Directions
function openDirections() {
  const address = document.getElementById('storeAddress').textContent;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  window.open(mapsUrl, '_blank');
}

// Checkout Action (Direct to WhatsApp +62 812-3456-7890)
function checkout() {
  if (cart.length === 0) {
    alert('Keranjang belanja Anda masih kosong. Silakan pilih produk terlebih dahulu.');
    return;
  }

  const phone = '6285802060908';
  let message = 'Halo Kerupuk Abatasa! Saya ingin memesan produk berikut:\n\n';
  
  let grandTotal = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    grandTotal += itemTotal;
    message += `${index + 1}. *${item.title}* (${item.qty}x) = Rp ${itemTotal.toLocaleString('id-ID')}\n`;
  });

  message += `\n*Total Pembayaran: Rp ${grandTotal.toLocaleString('id-ID')}*\n\nMohon informasi petunjuk pembayaran & konfirmasi pengiriman. Terima kasih!`;

  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  
  // Open WhatsApp in new tab
  window.open(waUrl, '_blank');
  
  // Clear cart after checkout trigger
  cart = [];
  updateCartUI();
  toggleCart(false);
}

// Highlight active navbar items based on scroll position
function highlightActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 120;
    const sectionId = current.getAttribute('id');
    const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

    if (navLink) {
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    }
  });
}
