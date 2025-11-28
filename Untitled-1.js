// Sample Products Data
const products = [
    { id: 1, name: 'Áo Sơ Mi Cao Cấp', price: 590000, category: 'men', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c', badge: 'New' },
    { id: 2, name: 'Váy Dạ Hội', price: 1290000, category: 'women', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8', badge: 'Hot' },
    { id: 3, name: 'Túi Xách Da', price: 890000, category: 'accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3' },
    { id: 4, name: 'Quần Tây Nam', price: 690000, category: 'men', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80' },
    { id: 5, name: 'Đầm Công Sở', price: 790000, category: 'women', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1', badge: 'Sale' },
    { id: 6, name: 'Thắt Lưng Da', price: 390000, category: 'accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62' },
    { id: 7, name: 'Áo Khoác Blazer', price: 990000, category: 'men', image: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac' },
    { id: 8, name: 'Váy Maxi', price: 850000, category: 'women', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446', badge: 'New' }
];

let cart = [];

// Load Products
function loadProducts(filter = 'all') {
    const productGrid = document.getElementById('productGrid');
    const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);
    
    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${product.price.toLocaleString('vi-VN')}đ</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
            </div>
        </div>
    `).join('');
}

// Filter Products
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        loadProducts(this.dataset.filter);
    });
});

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCartCount();
    alert('Đã thêm vào giỏ hàng!');
}

// Update Cart Count
function updateCartCount() {
    document.querySelector('.cart-count').textContent = cart.length;
}

// Cart Modal
const cartBtn = document.querySelector('.cart-btn');
const modal = document.getElementById('cartModal');
const closeBtn = document.querySelector('.close');

cartBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    displayCart();
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    cartItems.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
            <span>${item.name}</span>
            <span>${item.price.toLocaleString('vi-VN')}đ</span>
        </div>
    `).join('');
    
    document.getElementById('totalPrice').textContent = total.toLocaleString('vi-VN') + 'đ';
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Initialize
loadProducts();