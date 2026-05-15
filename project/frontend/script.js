/* ================================================================
   AURELIA — Main Script
   Manages: Cart (localStorage), Product Grid, Chat, Contact,
   Checkout, Scroll Animations, Header State
   ================================================================ */

const API = '';

/* ---------- CART STATE ---------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem('aurelia_cart')) || []; }
  catch { return []; }
}
function saveCart(cart) { localStorage.setItem('aurelia_cart', JSON.stringify(cart)); }

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) { existing.qty += 1; }
  else { cart.push({ ...product, qty: 1 }); }
  saveCart(cart);
  renderCart();
  showToast(`${product.name} added to your selection`);
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
  renderCart();
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCart();
}

function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

/* ---------- RENDER CART ---------- */
function renderCart() {
  const cart = getCart();
  const countEl = document.getElementById('cart-count');
  const itemsEl = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-total-price');

  if (countEl) {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    countEl.textContent = total > 0 ? total : '';
  }

  if (!itemsEl) return;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
        </svg>
        <p>Your selection is empty</p>
      </div>`;
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__img"><img src="${item.image}" alt="${item.name}" /></div>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">$${item.price.toLocaleString()}</div>
        <div class="cart-item__qty">
          <button onclick="updateQty(${item.id}, -1)" aria-label="Decrease quantity">&minus;</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${item.id}, 1)" aria-label="Increase quantity">&plus;</button>
        </div>
        <button class="cart-item__remove" onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    </div>`).join('');

  if (footerEl) footerEl.style.display = 'block';
  if (totalEl) totalEl.textContent = `$${cartTotal().toLocaleString()}`;

  // Checkout page summary
  renderCheckoutSummary();
}

/* ---------- CHECKOUT SUMMARY ---------- */
function renderCheckoutSummary() {
  const summaryItems = document.getElementById('summary-items');
  const summaryTotal = document.getElementById('summary-total');
  if (!summaryItems) return;

  const cart = getCart();
  if (cart.length === 0) {
    summaryItems.innerHTML = '<p style="color:var(--grey-400);padding:1rem 0;">Your cart is empty.</p>';
    if (summaryTotal) summaryTotal.textContent = '$0';
    return;
  }

  summaryItems.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span>${item.name} × ${item.qty}</span>
      <span>$${(item.price * item.qty).toLocaleString()}</span>
    </div>`).join('');

  if (summaryTotal) summaryTotal.textContent = `$${cartTotal().toLocaleString()}`;
}

/* ---------- PRODUCTS GRID ---------- */
// Fallback products if API unreachable
const FALLBACK_PRODUCTS = [
  { id:1, name:"Notte Evening Gown", price:4200, image:"images/product_gown.png" },
  { id:2, name:"Dorata Leather Bag", price:2850, image:"images/product_handbag.png" },
  { id:3, name:"Milano Cashmere Overcoat", price:3600, image:"images/product_overcoat.png" },
  { id:4, name:"Luce Statement Necklace", price:5400, image:"images/product_necklace.png" },
  { id:5, name:"Firenze Oxford Shoes", price:1800, image:"images/product_shoes.png" },
  { id:6, name:"Seta Silk Scarf", price:780, image:"images/product_scarf.png" }
];

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let products;
  try {
    const res = await fetch(`${API}/products`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    products = await res.json();
  } catch {
    products = FALLBACK_PRODUCTS;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card fade-target">
      <div class="product-card__img"><img src="${p.image}" alt="${p.name}" loading="lazy" /></div>
      <div class="product-card__body">
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__price">$${p.price.toLocaleString()}</div>
        <button class="product-card__btn" onclick='addToCart(${JSON.stringify(p)})'>Add to Selection</button>
      </div>
    </div>`).join('');

  // Re-observe new fade targets
  observeFadeTargets();
}

/* ---------- CART DRAWER TOGGLE ---------- */
function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
}
function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}

/* ---------- CHAT WIDGET ---------- */
function toggleChat() {
  document.getElementById('chat-window')?.classList.toggle('open');
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  if (!input || !messages) return;

  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  // User message
  messages.innerHTML += `<div class="chat-msg user">${escapeHTML(text)}</div>`;

  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'typing-dots';
  typing.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  let reply;
  try {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();
    reply = data.reply;
  } catch {
    reply = fallbackConcierge(text);
  }

  typing.remove();
  messages.innerHTML += `<div class="chat-msg bot">${escapeHTML(reply)}</div>`;
  messages.scrollTop = messages.scrollHeight;
}

/* Offline concierge fallback */
function fallbackConcierge(msg) {
  const m = msg.toLowerCase();
  if (m.includes('material') || m.includes('fabric') || m.includes('silk') || m.includes('cashmere'))
    return "Our pieces are crafted from the finest Italian silk sourced from century-old mills in Como, and hand-selected cashmere from the highlands of Inner Mongolia. Each fabric undergoes a meticulous quality assessment before it ever reaches our atelier.";
  if (m.includes('price') || m.includes('cost') || m.includes('expensive') || m.includes('afford'))
    return "AURELIA pieces are an investment in enduring elegance. Our pricing reflects the exceptional quality of materials and the hundreds of hours of artisan craftsmanship in every garment. I'd be delighted to discuss our collection within your preferred range.";
  if (m.includes('shipping') || m.includes('deliver'))
    return "We offer complimentary worldwide shipping via private courier. Each order is carefully wrapped in our signature black-and-gold packaging and typically arrives within 5–7 business days, or 2–3 days for express service.";
  if (m.includes('return') || m.includes('exchange'))
    return "We offer a gracious 30-day return policy. Items must be in their original condition with tags attached. Our client care team will arrange complimentary return shipping for you.";
  if (m.includes('size') || m.includes('fit'))
    return "Our size guide is available on each product page. For a truly perfect fit, I recommend our complimentary virtual fitting consultation — our stylists can guide you through measurements for an impeccable result.";
  if (m.includes('hello') || m.includes('hi') || m.includes('hey'))
    return "Good day. It's a pleasure to have you here at AURELIA. How may I assist you with your style journey today?";
  if (m.includes('recommend') || m.includes('suggest'))
    return "I'd be delighted to offer a recommendation. Our Milano Cashmere Overcoat is a perennial favorite — a masterwork of restraint and warmth. The Notte Evening Gown is also exquisite for those seeking something truly memorable.";
  return "Thank you for your inquiry. I'd be happy to help you explore our collection, discuss materials and craftsmanship, or assist with sizing and availability. What would you like to know?";
}

/* ---------- CONTACT FORM ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit');
    const origText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const payload = {
      name: document.getElementById('contact-name').value,
      email: document.getElementById('contact-email').value,
      subject: document.getElementById('contact-subject').value,
      message: document.getElementById('contact-message').value
    };

    try {
      const res = await fetch(`${API}/contact-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        showToast('Your inquiry has been received. We will be in touch shortly.');
        form.reset();
      } else {
        showToast('Something went wrong. Please try again.');
      }
    } catch {
      showToast('Your inquiry has been noted. We will respond within 24 hours.');
      form.reset();
    }

    btn.textContent = origText;
    btn.disabled = false;
  });
}

/* ---------- CHECKOUT FORM ---------- */
function initCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('pay-btn');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    const cart = getCart();
    const payload = {
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: cartTotal(),
      email: document.getElementById('ship-email').value
    };

    try {
      const res = await fetch(`${API}/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json();
      if (data.status === 'Payment Successful') {
        localStorage.removeItem('aurelia_cart');
        document.getElementById('success-overlay')?.classList.add('show');
      }
    } catch {
      // Simulate success for demo
      localStorage.removeItem('aurelia_cart');
      document.getElementById('success-overlay')?.classList.add('show');
    }

    btn.textContent = 'Place Order';
    btn.disabled = false;
  });
}

/* ---------- HEADER SCROLL ---------- */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ---------- MOBILE NAV ---------- */
function initMobileNav() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ---------- INTERSECTION OBSERVER (Fade-in) ---------- */
function observeFadeTargets() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.fade-target:not(.visible)');
  if (prefersReduced) { targets.forEach(t => t.classList.add('visible')); return; }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(t => observer.observe(t));
}

/* ---------- TOAST ---------- */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---------- UTILS ---------- */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  renderCart();
  loadProducts();
  initContactForm();
  initCheckoutForm();
  observeFadeTargets();

  // Cart drawer
  document.getElementById('cart-toggle')?.addEventListener('click', openCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  // Chat
  document.getElementById('chat-fab')?.addEventListener('click', toggleChat);
  document.getElementById('chat-close')?.addEventListener('click', toggleChat);
  document.getElementById('chat-send')?.addEventListener('click', sendChat);
  document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat();
  });
});
