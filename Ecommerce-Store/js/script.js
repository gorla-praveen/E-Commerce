// =============================================
//   ESTORE - Main Script
//   Features: Cart, Search, Filter, Validation
// =============================================

"use strict";

// ---- Cart State ----
let cart = JSON.parse(localStorage.getItem('estore_cart')) || [];

function saveCart() {
  localStorage.setItem('estore_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price: parseFloat(price), img, qty: 1 });
  }
  saveCart();
  showToast(`<i class="fas fa-check-circle toast-icon"></i><p>${name} added to cart!</p>`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  if (typeof renderCartPage === 'function') renderCartPage();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  if (typeof renderCartPage === 'function') renderCartPage();
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

// ---- Toast Notification ----
function showToast(html) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'custom-toast';
  toast.innerHTML = html;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; }, 2500);
  setTimeout(() => toast.remove(), 3000);
}

// ---- Product Data ----
const products = [
  { id: 1, name: "Floral Summer Dress", category: "women", price: 49.99, oldPrice: 79.99, badge: "new", stars: 5, img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop" },
  { id: 2, name: "Classic White Blouse", category: "women", price: 34.99, oldPrice: null, badge: null, stars: 4, img: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=400&fit=crop" },
  { id: 3, name: "Men's Casual Jacket", category: "men", price: 89.99, oldPrice: 129.99, badge: "offer", stars: 5, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop" },
  { id: 4, name: "Slim Fit Chinos", category: "men", price: 54.99, oldPrice: null, badge: "new", stars: 4, img: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop" },
  { id: 5, name: "Kids Rainbow Tee", category: "kids", price: 19.99, oldPrice: 29.99, badge: "offer", stars: 5, img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop" },
  { id: 6, name: "Boho Maxi Dress", category: "women", price: 65.99, oldPrice: null, badge: "new", stars: 4, img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop" },
  { id: 7, name: "Winter Wool Coat", category: "men", price: 149.99, oldPrice: 199.99, badge: null, stars: 5, img: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=400&h=400&fit=crop" },
  { id: 8, name: "Kids Denim Overalls", category: "kids", price: 34.99, oldPrice: null, badge: "new", stars: 4, img: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=400&h=400&fit=crop" },
];

function buildProductCard(p) {
  const stars = Array.from({length: 5}, (_, i) => `<i class="fa${i < p.stars ? 's' : 'r'} fa-star"></i>`).join('');
  const badge = p.badge ? `<span class="product-badge badge-${p.badge}">${p.badge === 'new' ? 'New' : 'Sale'}</span>` : '';
  const oldPrice = p.oldPrice ? `<span class="price-old">$${p.oldPrice.toFixed(2)}</span>` : '';
  return `
    <div class="col-6 col-md-4 col-lg-3 mb-4">
      <div class="product-card">
        <div class="product-img-wrap">
          ${badge}
          <img src="${p.img}" alt="${p.name}" loading="lazy">
          <div class="product-actions">
            <a href="#" title="Wishlist"><i class="far fa-heart"></i></a>
            <a href="products.html" title="Quick View"><i class="far fa-eye"></i></a>
          </div>
        </div>
        <div class="product-body">
          <div class="stars">${stars}</div>
          <h5><a href="products.html">${p.name}</a></h5>
          <div class="price-wrap">
            <span class="price-now">$${p.price.toFixed(2)}</span>
            ${oldPrice}
          </div>
          <button class="btn-cart" onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.img}')">
            <i class="fas fa-shopping-cart me-1"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>`;
}

// ---- Render Product Tabs (index.html) ----
function renderProductTabs(filter = 'all') {
  const container = document.getElementById('productGrid');
  if (!container) return;
  let filtered = products;
  if (filter === 'new') filtered = products.filter(p => p.badge === 'new');
  else if (filter === 'featured') filtered = products.filter(p => p.stars === 5);
  else if (filter === 'offer') filtered = products.filter(p => p.badge === 'offer');
  container.innerHTML = filtered.map(buildProductCard).join('');
}

// ---- Products Page ----
function renderProductsPage() {
  const container = document.getElementById('allProducts');
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  let filtered = products;
  if (q) filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  container.innerHTML = filtered.length
    ? filtered.map(buildProductCard).join('')
    : `<div class="col-12 text-center py-5"><p class="text-muted">No products found for "<strong>${q}</strong>".</p></div>`;
  document.getElementById('resultCount') && (document.getElementById('resultCount').textContent = `Showing ${filtered.length} products`);
}

function applyFilters() {
  const container = document.getElementById('allProducts');
  if (!container) return;
  const checked = [...document.querySelectorAll('.cat-filter:checked')].map(el => el.value);
  const maxPrice = parseFloat(document.getElementById('priceRange')?.value || 999);
  const sortVal = document.getElementById('sortSelect')?.value || 'default';

  let filtered = checked.length ? products.filter(p => checked.includes(p.category)) : [...products];
  filtered = filtered.filter(p => p.price <= maxPrice);

  if (sortVal === 'low') filtered.sort((a,b) => a.price - b.price);
  else if (sortVal === 'high') filtered.sort((a,b) => b.price - a.price);
  else if (sortVal === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));

  container.innerHTML = filtered.length
    ? filtered.map(buildProductCard).join('')
    : `<div class="col-12 text-center py-5"><p class="text-muted">No products match your filters.</p></div>`;
  document.getElementById('resultCount') && (document.getElementById('resultCount').textContent = `Showing ${filtered.length} products`);
}

// ---- Cart Page ----
function renderCartPage() {
  const tbody = document.getElementById('cartItems');
  const emptyMsg = document.getElementById('cartEmpty');
  const cartTable = document.getElementById('cartTableWrap');
  const summaryWrap = document.getElementById('cartSummaryWrap');
  if (!tbody) return;

  if (cart.length === 0) {
    emptyMsg && (emptyMsg.style.display = 'block');
    cartTable && (cartTable.style.display = 'none');
    summaryWrap && (summaryWrap.style.display = 'none');
    return;
  }
  emptyMsg && (emptyMsg.style.display = 'none');
  cartTable && (cartTable.style.display = 'block');
  summaryWrap && (summaryWrap.style.display = 'block');

  tbody.innerHTML = cart.map(item => `
    <tr>
      <td><img src="${item.img}" class="cart-product-img" alt="${item.name}"></td>
      <td><span class="cart-product-name">${item.name}</span></td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <div class="qty-control">
          <button onclick="updateQty(${item.id}, -1)">−</button>
          <input type="number" value="${item.qty}" min="1" onchange="setQty(${item.id}, this.value)">
          <button onclick="updateQty(${item.id}, 1)">+</button>
        </div>
      </td>
      <td>$${(item.price * item.qty).toFixed(2)}</td>
      <td><button class="cart-remove" onclick="removeFromCart(${item.id})" title="Remove"><i class="fas fa-trash-alt"></i></button></td>
    </tr>`).join('');

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 9.99) : 0;
  const total = subtotal + shipping;

  document.getElementById('subtotal') && (document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`);
  document.getElementById('shipping') && (document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`);
  document.getElementById('totalAmount') && (document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`);
}

function setQty(id, val) {
  const item = cart.find(i => i.id === id);
  if (item) { item.qty = Math.max(1, parseInt(val) || 1); saveCart(); renderCartPage(); }
}

// ---- Search ----
function handleSearch(e) {
  e.preventDefault();
  const q = document.getElementById('searchInput')?.value.trim();
  if (q) window.location.href = `products.html?q=${encodeURIComponent(q)}`;
}

// ---- Scroll to Top ----
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- Price Range Label ----
function initPriceRange() {
  const range = document.getElementById('priceRange');
  const label = document.getElementById('priceLabel');
  if (!range || !label) return;
  range.addEventListener('input', () => {
    label.textContent = `$0 – $${range.value}`;
    applyFilters();
  });
}

// ---- Newsletter Validation ----
function validateNewsletter(e) {
  e.preventDefault();
  const input = document.getElementById('newsletterEmail');
  if (!input) return;
  const email = input.value.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
  input.value = '';
  showToast('<i class="fas fa-check-circle toast-icon"></i><p>Thank you for subscribing!</p>');
}

// ---- Coupon ----
function applyCoupon(e) {
  e.preventDefault();
  const code = document.getElementById('couponCode')?.value.trim().toUpperCase();
  const valid = { 'SAVE10': 10, 'WELCOME20': 20 };
  if (valid[code]) {
    showToast(`<i class="fas fa-tag toast-icon"></i><p>${valid[code]}% discount applied!</p>`);
  } else {
    showToast('<i class="fas fa-times-circle toast-icon" style="color:#e63946"></i><p>Invalid coupon code.</p>');
  }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderProductTabs('all');
  renderProductsPage();
  renderCartPage();
  initScrollTop();
  initPriceRange();

  // Tab filter
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderProductTabs(this.dataset.filter);
    });
  });

  // Filter checkboxes & sort
  document.querySelectorAll('.cat-filter').forEach(cb => cb.addEventListener('change', applyFilters));
  document.getElementById('sortSelect')?.addEventListener('change', applyFilters);

  // Search
  document.getElementById('searchForm')?.addEventListener('submit', handleSearch);

  // Newsletter
  document.getElementById('newsletterForm')?.addEventListener('submit', validateNewsletter);

  // Coupon
  document.getElementById('couponForm')?.addEventListener('submit', applyCoupon);
});
