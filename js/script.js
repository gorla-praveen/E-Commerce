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
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s';
  }, 2500);
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
  { id: 8, name: "Kids Denim Overalls", category: "kids", price: 34.99, oldPrice: null, badge: "new", stars: 4, img: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=400&h=400&fit=crop" }
];

// ---- Product Card ----
function buildProductCard(p) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<i class="fa${i < p.stars ? 's' : 'r'} fa-star"></i>`
  ).join('');

  const badge = p.badge
    ? `<span class="product-badge badge-${p.badge}">${p.badge === 'new' ? 'New' : 'Sale'}</span>`
    : '';

  const oldPrice = p.oldPrice
    ? `<span class="price-old">$${p.oldPrice.toFixed(2)}</span>`
    : '';

  return `
    <div class="col-6 col-md-4 col-lg-3 mb-4 product-item">
      <div class="product-card">
        <div class="product-img-wrap">
          ${badge}
          <img src="${p.img}" alt="${p.name}">
        </div>

        <div class="product-body">
          <div class="stars">${stars}</div>
          <h5>${p.name}</h5>

          <div class="price-wrap">
            <span class="price-now">$${p.price.toFixed(2)}</span>
            ${oldPrice}
          </div>

          <button class="btn-cart"
            onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.img}')">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

// ---- CLEAN HOMEPAGE FILTER SYSTEM (FIXED) ----
function filterHomepageProducts() {
  const searchValue =
    document.getElementById('searchInput')?.value.toLowerCase() || '';

  const category =
    document.getElementById('categoryFilter')?.value || 'all';

  const activeTab =
    document.querySelector('#productTabs .nav-link.active')?.dataset.filter || 'all';

  let filtered = [...products];

  if (searchValue) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchValue)
    );
  }

  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (activeTab === 'new') {
    filtered = filtered.filter(p => p.badge === 'new');
  } else if (activeTab === 'offer') {
    filtered = filtered.filter(p => p.badge === 'offer');
  } else if (activeTab === 'featured') {
    filtered = filtered.filter(p => p.stars === 5);
  }

  const container = document.getElementById('productGrid');
  if (!container) return;

  container.innerHTML = filtered.map(buildProductCard).join('');
}

// ---- Products Page ----
function renderProductsPage() {
  const container = document.getElementById('allProducts');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';

  let filtered = products;

  if (q) {
    filtered = products.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase())
    );
  }

  container.innerHTML = filtered.map(buildProductCard).join('');
}

// ---- Cart Page ----
function renderCartPage() {
  const tbody = document.getElementById('cartItems');
  if (!tbody) return;

  tbody.innerHTML = cart.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>$${item.price}</td>
      <td>
        <button onclick="updateQty(${item.id}, -1)">-</button>
        ${item.qty}
        <button onclick="updateQty(${item.id}, 1)">+</button>
      </td>
      <td>$${(item.price * item.qty).toFixed(2)}</td>
      <td><button onclick="removeFromCart(${item.id})">X</button></td>
    </tr>
  `).join('');

  const total = getCartTotal();
  const totalEl = document.getElementById('totalAmount');
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  filterHomepageProducts();
  renderProductsPage();
  renderCartPage();

  // Events
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();

      document.querySelectorAll('[data-filter]')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      filterHomepageProducts();
    });
  });

  document.getElementById('searchInput')
    ?.addEventListener('keyup', filterHomepageProducts);

  document.getElementById('categoryFilter')
    ?.addEventListener('change', filterHomepageProducts);
});