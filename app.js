// ---------- CART STORAGE HELPERS ----------
function getCart() {
    try {
        const raw = localStorage.getItem('anydrinks_cart');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('anydrinks_cart', JSON.stringify(cart));
}

function formatPrice(num) {
    return '€' + num.toFixed(2).replace('.', ',');
}

// ---------- CART LOGIC ----------
function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            qty: 1
        });
    }

    saveCart(cart);
    updateCartCount();
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    updateCartCount();
    renderCartPage();
}

function updateQuantity(id, newQty) {
    let cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    } else {
        item.qty = qty;
    }

    saveCart(cart);
    updateCartCount();
    renderCartPage();
}

function updateCartCount() {
    const cartCountSpan = document.getElementById('cart-count');
    if (!cartCountSpan) return;
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountSpan.textContent = totalQty;
}

// ---------- RENDER CART PAGE ----------
function renderCartPage() {
    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const emptyEl = document.getElementById('cart-empty');
    const contentEl = document.getElementById('cart-content');

    // Niet op cart.html → niks doen
    if (!itemsContainer || !totalEl || !emptyEl || !contentEl) return;

    const cart = getCart();

    if (cart.length === 0) {
        emptyEl.style.display = 'block';
        contentEl.style.display = 'none';
        return;
    }

    emptyEl.style.display = 'none';
    contentEl.style.display = 'block';

    itemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.brand}</td>
      <td>${formatPrice(item.price)}</td>
      <td>
        <input type="number" class="cart-qty-input" min="1" value="${item.qty}">
      </td>
      <td>${formatPrice(subtotal)}</td>
      <td><button class="cart-remove">x</button></td>
    `;

        const qtyInput = tr.querySelector('.cart-qty-input');
        qtyInput.addEventListener('change', () => {
            updateQuantity(item.id, qtyInput.value);
        });

        const removeBtn = tr.querySelector('.cart-remove');
        removeBtn.addEventListener('click', () => {
            removeFromCart(item.id);
        });

        itemsContainer.appendChild(tr);
    });

    totalEl.textContent = formatPrice(total);
}

// ---------- FILTER / SEARCH OP PRODUCTEN ----------
function applyFilters() {
    const searchInput = document.getElementById('product-search');
    const brandFilter = document.getElementById('brand-filter');
    const productCards = document.querySelectorAll('.product-card');

    if (!productCards.length) return;

    const q = searchInput ? searchInput.value.toLowerCase() : '';
    const brand = brandFilter ? brandFilter.value.toLowerCase() : 'alle';

    productCards.forEach(card => {
        const merk = (card.dataset.merk || '').toLowerCase();
        const naam = (card.dataset.naam || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const haystack = `${merk} ${naam} ${tags}`;

        const matchSearch = haystack.includes(q);
        const matchBrand = brand === 'alle' || merk === brand;

        card.style.display = (matchSearch && matchBrand) ? '' : 'none';
    });
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    // Teller in header bijwerken
    updateCartCount();

    // Zoek + filter
    const searchInput = document.getElementById('product-search');
    const brandFilter = document.getElementById('brand-filter');

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (brandFilter) {
        brandFilter.addEventListener('change', applyFilters);
    }

    // Add-to-cart knoppen
    const addButtons = document.querySelectorAll('.add-to-cart');
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                brand: btn.dataset.brand,
                price: parseFloat(btn.dataset.price)
            };

            addToCart(product);

            // ANIMATIE
            btn.classList.add("added");

            setTimeout(() => {
                btn.classList.remove("added");
                btn.classList.add("added-end");
            }, 150);

            setTimeout(() => {
                btn.classList.remove("added-end");
            }, 350);
        });
    });

    // Cart-pagina renderen
    renderCartPage();
});
