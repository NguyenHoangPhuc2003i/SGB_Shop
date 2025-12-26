// Sample Products Data
// Product catalog
const products = [
    { id: 1, name: 'Áo Sơ Mi Cao Cấp', price: 590000, category: 'men', image: 'https://cache.maysoichivang.com/wp-content/uploads/2021/12/ao-so-mi-nam-thoi-trang-cao-cap-1.jpg', badge: 'New' },
    { id: 2, name: 'Váy Dạ Hội', price: 1290000, category: 'women', image: 'https://tse2.mm.bing.net/th/id/OIP.uYXq_TaT0aHwib77OwdGEQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', badge: 'Hot' },
    { id: 3, name: 'Túi Xách Da', price: 890000, category: 'accessories', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3' },
    { id: 4, name: 'Quần Tây Nam', price: 690000, category: 'men', image: 'https://tse1.mm.bing.net/th/id/OIP.SIqbKyU1RrI4x-RbM6OVLgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 5, name: 'Đầm Công Sở', price: 790000, category: 'women', image: 'https://tse4.mm.bing.net/th/id/OIP.itV7qDqvo0rPqmuG3HjE0gHaLH?rs=1&pid=ImgDetMain&o=7&rm=3', badge: 'Sale' },
    { id: 6, name: 'Thắt Lưng Da', price: 390000, category: 'accessories', image: 'https://tse4.mm.bing.net/th/id/OIP.1DqxdWoJ4uz1wRwYMWZEzwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 7, name: 'Áo Khoác Blazer', price: 990000, category: 'men', image: 'https://tse2.mm.bing.net/th/id/OIP._VNPZj_8d2g8Wg1pvrcdcgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 8, name: 'Váy Maxi', price: 850000, category: 'women', image: 'https://tse4.mm.bing.net/th/id/OIP.axcj29yRRCO-CGT2wKjamAHaG1?rs=1&pid=ImgDetMain&o=7&rm=3', badge: 'New' },
    // symbolic additional items
    { id: 9, name: 'Áo Thun Logo', price: 290000, category: 'men', image: 'https://tse4.mm.bing.net/th/id/OIP.a9Uoz_mcrcVW1zSEwlE48wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 10, name: 'Quần Jeans Slim', price: 650000, category: 'men', image: 'https://tse1.mm.bing.net/th/id/OIP.y1FY4oviOrp9ljKC3uw2iwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 11, name: 'Áo Len Dệt Kim', price: 740000, category: 'women', image: 'https://sakurafashion.vn/upload/sanpham/large/63425-ao-len-nu-phong-cach-retro-det-kim-1.jpg' },
    { id: 12, name: 'Chân Váy Plisse', price: 560000, category: 'women', image: 'https://cdn.vuahanghieu.com/unsafe/0x0/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/news/content/2023/02/chan-vay-adidas-adicolor-plisse-skirt-hg1091-mau-den-01-jpg-1675674090-06022023160130.jpg' },
    { id: 13, name: 'Mũ Lưỡi Trai', price: 180000, category: 'accessories', image: 'https://down-vn.img.susercontent.com/file/4e0a5a5edcc8077e2b5a74708f183c8b' },
    { id: 14, name: 'Khăn Choàng', price: 220000, category: 'accessories', image: 'https://tse1.mm.bing.net/th/id/OIP.Rv3VjGXY_GnicD_tbmeq4gHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 15, name: 'Áo Khoác Dạ', price: 1250000, category: 'women', image: 'https://tse1.mm.bing.net/th/id/OIP.1b2ShVsl5ORVEx2wJQ6CcgHaLH?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 16, name: 'Giày Sneaker Trắng', price: 980000, category: 'men', image: 'https://th.bing.com/th/id/R.8d5cd186604fb93560c96eed5cce7231?rik=ehK%2brzhsKnzSYw&pid=ImgRaw&r=0', badge: 'Hot' },
    { id: 17, name: 'Túi Tote Vải', price: 250000, category: 'accessories', image: 'https://tse4.explicit.bing.net/th/id/OIP.vWohggf5_p3v7tBOB4G91wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 18, name: 'Áo Sơ Mi Satin', price: 820000, category: 'women', image: 'https://tse3.mm.bing.net/th/id/OIP.5BusXJBCsFAZN0VoceLB6AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    // more symbolic items to reach ~50
    { id: 19, name: 'Áo Hoodie Basic', price: 520000, category: 'men', image: 'https://tse2.mm.bing.net/th/id/OIP._ZDUwNj_d7eJxFWPjdUYGwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 20, name: 'Áo Khoác Gió', price: 760000, category: 'men', image: 'https://tse2.mm.bing.net/th/id/OIP.GEAdtF3Hng40dyT4T9Fd5wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 21, name: 'Đầm Xòe Vintage', price: 910000, category: 'women', image: 'https://tse3.mm.bing.net/th/id/OIP.HbuzN7s7LHwO-OzIOsyP1QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 22, name: 'Jumpsuit Thanh Lịch', price: 1050000, category: 'women', image: 'https://images2.thanhnien.vn/528068263637045248/2025/6/25/8-17508378860831077468632.jpg' },
    { id: 23, name: 'Thắt Lưng Vải', price: 160000, category: 'accessories', image: 'https://tse1.mm.bing.net/th/id/OIP.rCwuTnemw70z7ZLWy_0c1AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 24, name: 'Ví Da Mini', price: 340000, category: 'accessories', image: 'https://shop.r10s.jp/freespirits/cabinet/thumbnail-m/moneyclip00166-01-r.jpg' },
    { id: 25, name: 'Áo Polo', price: 430000, category: 'men', image: 'https://tse4.mm.bing.net/th/id/OIP.WT8FlayibXi7iwLp7iHm9wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 26, name: 'Quần Jogger', price: 540000, category: 'men', image: 'https://tse3.mm.bing.net/th/id/OIP.9HJ4nlm3vI5agZMcavPduAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 27, name: 'Áo Khoác Bomber', price: 880000, category: 'men', image: 'https://th.bing.com/th/id/R.2a5944f38c676091a06ad2003e9855d7?rik=KHHpf5r7AXYl%2fA&pid=ImgRaw&r=0' },
    { id: 28, name: 'Đầm Bodycon', price: 990000, category: 'women', image: 'https://tse4.explicit.bing.net/th/id/OIP.sNk7Yol0V1kXkfPaGlfiWAHaLG?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 29, name: 'Áo Cardigan Mềm', price: 620000, category: 'women', image: 'https://tse3.explicit.bing.net/th/id/OIP.ERDRXgcBo757sfo7iINkPAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 30, name: 'Khuyên Tai Vàng', price: 210000, category: 'accessories', image: 'https://th.bing.com/th/id/R.d063cd7cfcfc65d0c4a39a0a167121ec?rik=DJe5P3jEhEXdYQ&pid=ImgRaw&r=0' },
    { id: 31, name: 'Vòng Cổ Ngọc Trai', price: 450000, category: 'accessories', image: 'https://tse4.mm.bing.net/th/id/OIP.E3_kS54nAJx1RxAzxRTxgQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 32, name: 'Áo Khoác Denim', price: 890000, category: 'men', image: 'https://i.pinimg.com/736x/1a/77/aa/1a77aad55858b06151b68b4c87f4a103.jpg' },
    { id: 33, name: 'Áo Sơ Mi Kẻ', price: 650000, category: 'men', image: 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lspjouo9l76h9c' },
    { id: 34, name: 'Quần Short Linen', price: 380000, category: 'men', image: 'https://tse2.explicit.bing.net/th/id/OIP.A3gfSyESdaCAGx3TTyz24gHaKY?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 35, name: 'Áo Blouse Tay Phồng', price: 770000, category: 'women', image: 'https://cdn-i.vtcnews.vn/resize/th/upload/2024/07/17/2-16425620.jpg' },
    { id: 36, name: 'Đầm Slip Dress', price: 840000, category: 'women', image: 'https://tse4.mm.bing.net/th/id/OIP.P4VC8g2g06CLBWaJOtyUvAHaJP?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 37, name: 'Kính Mát Retro', price: 320000, category: 'accessories', image: 'https://cf.shopee.vn/file/0c39776c90c940bf8ba6d3c32511acbb' },
    { id: 38, name: 'Mũ Len Beanie', price: 190000, category: 'accessories', image: 'https://www.elleman.vn/app/uploads/2023/11/05/227249/@p_a_c_s__-beanie-elleman.jpg' },
    { id: 39, name: 'Áo Khoác Dù', price: 760000, category: 'men', image: 'https://tse2.mm.bing.net/th/id/OIP.0RaBW_O3LaWXiZnxu32isgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 40, name: 'Áo Vest Nữ', price: 930000, category: 'women', image: 'https://tse4.mm.bing.net/th/id/OIP.CpDHT8IbkUp4dc970IwIUQHaLH?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 41, name: 'Tất Cổ Cao', price: 90000, category: 'accessories', image: 'https://tse1.mm.bing.net/th/id/OIP.twa4kGNbYgnvy1InMnudtwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 42, name: 'Thắt Lưng Vải Ken', price: 140000, category: 'accessories', image: 'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-ljofi3aop14y6a' },
    { id: 43, name: 'Áo Thun Oversize', price: 350000, category: 'men', image: 'https://tse2.mm.bing.net/th/id/OIP.fw5_B22tTZWX19uU3sXAJgHaLH?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 44, name: 'Quần Ống Rộng', price: 610000, category: 'women', image: 'https://th.bing.com/th/id/R.69084d152c3f5dc90ca8222fa3f00a28?rik=Zsi02Fu3AgnIDQ&pid=ImgRaw&r=0' },
    { id: 45, name: 'Đầm Midi Chấm Bi', price: 870000, category: 'women', image: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m4g7kmsz9e9c43' },
    { id: 46, name: 'Balo Vải Canvas', price: 420000, category: 'accessories', image: 'https://tse3.mm.bing.net/th/id/OIP.MoGgsrgDkWTJuwKC45jS-wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 47, name: 'Áo Khoác Lông Vũ', price: 1390000, category: 'men', image: 'https://tse4.mm.bing.net/th/id/OIP.OVDCK1-Z6abq2mnxYGVSogHaHa?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 48, name: 'Áo Len Cổ Lọ', price: 680000, category: 'women', image: 'https://tse3.mm.bing.net/th/id/OIP.OVryxCfXOBBRpFB0fFsalQHaLH?rs=1&pid=ImgDetMain&o=7&rm=3' },
    { id: 49, name: 'Khăn Bandana', price: 110000, category: 'accessories', image: 'https://canifa.com/blog/wp-content/uploads/2025/08/cac-loai-khan-bandana.jpg' },
        { id: 50, name: 'Giày Loafer Da', price: 1150000, category: 'men', image: 'https://th.bing.com/th/id/R.ad9fbcf2bd4f147136867e9b95d9112f?rik=xI76M5zP4M%2fmfA&pid=ImgRaw&r=0' }
];

// Replace placeholder images with realistic, category-appropriate photos from curated Unsplash IDs
// Chọn ảnh đúng loại sản phẩm theo từ khoá tên để KHỚP món: áo khoác, áo polo, quần tây âu, quần jeans, balo, túi xách, giày, thắt lưng
function getImageForProduct(name, category) {
    const n = name.toLowerCase();
    // áo khoác (jacket/coat/windbreaker/bomber)
    if (n.includes('khoác') || n.includes('jacket') || n.includes('bomber') || n.includes('coat') || n.includes('gió') || n.includes('denim')) {
        return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d';
    }
    // áo polo
    if (n.includes('polo')) {
        return 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126';
    }
    // quần tây âu (trousers/chinos/slacks)
    if (n.includes('quần tây') || n.includes('tây âu') || n.includes('slacks') || n.includes('chinos') || n.includes('tây')) {
        return 'https://images.unsplash.com/photo-1537202108838-e7072bad1927';
    }
    // quần dài jeans / denim
    if (n.includes('jeans') || n.includes('denim') || n.includes('quần jean')) {
        return 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb';
    }
    // balo
    if (n.includes('balo') || n.includes('backpack')) {
        return 'https://images.unsplash.com/photo-1562158070-1b6b8c6c08b9';
    }
    // túi xách / ví
    if (n.includes('túi') || n.includes('bag') || n.includes('ví')) {
        return 'https://images.unsplash.com/photo-1520975731261-3c590569ae2b';
    }
    // giày / loafer / sneaker
    if (n.includes('giày') || n.includes('loafer') || n.includes('sneaker') || n.includes('boots')) {
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
    }
    // thắt lưng / belt
    if (n.includes('thắt lưng') || n.includes('belt')) {
        return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62';
    }
    // áo sơ mi / blouse / tee fallback theo category
    if (n.includes('sơ mi') || n.includes('shirt')) {
        return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f';
    }
    if (n.includes('áo thun') || n.includes('tee') || n.includes('t-shirt')) {
        return 'https://images.unsplash.com/photo-1520974692088-5cb9130b7003';
    }
    // women dresses/blouse fallback
    if (category === 'women' && (n.includes('đầm') || n.includes('dress') || n.includes('blouse'))) {
        return 'https://images.unsplash.com/photo-1469334031218-e6bfb79f6df4';
    }
    // accessories fallback
    if (category === 'accessories') {
        return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc0';
    }
    // default generic fashion
    return 'https://images.unsplash.com/photo-1520974692088-5cb9130b7003';
}

// Gán ảnh mặc định theo tên/chủng loại chỉ khi chưa có ảnh tùy chỉnh
products.forEach(p => {
    if (!p.image) {
        p.image = getImageForProduct(p.name, p.category);
    }
});

let cart = [];

// Persist cart to localStorage so it survives page navigation
const CART_KEY = 'sgb_cart';
function saveCart(){
    try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }catch(e){ console.warn('saveCart failed', e); }
}
function loadCart(){
    try{
        const raw = localStorage.getItem(CART_KEY)||'[]';
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) cart = parsed; else cart = [];
        // Migrate legacy flat items (no qty) to consolidated qty model
        if(cart.length && cart[0] && cart[0].qty === undefined){
            const map = new Map();
            cart.forEach(item => {
                const key = item.name ? `${item.id}|${item.name}` : String(item.id);
                const ex = map.get(key);
                if(ex){ ex.qty += 1; }
                else { map.set(key, { id:item.id, name:item.name||'', price:item.price, image:item.image, qty:1 }); }
            });
            cart = Array.from(map.values());
            saveCart();
        }
    }catch(e){ cart = []; }
}

// Load Products
function loadProducts(filter = 'all') {
    const productGrid = document.getElementById('productGrid');
    const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);
    
    productGrid && (productGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <a href="product.html?id=${product.id}"><img src="${product.image}" alt="${product.name}"></a>
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name"><a href="product.html?id=${product.id}" style="text-decoration:none;color:inherit">${product.name}</a></h3>
                <p class="product-price">${product.price.toLocaleString('vi-VN')}đ</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
                <button class="buy-now" data-id="${product.id}" onclick="buyNow(${product.id})" style="width:100%;background:var(--accent-color);color:#fff;border:none;padding:12px;cursor:pointer;font-weight:600;margin-top:8px">Thanh toán</button>
                <div style="margin-top:8px;text-align:center"><a href="product.html?id=${product.id}" style="font-size:.85rem;color:#555;text-decoration:underline">Xem chi tiết</a></div>
            </div>
        </div>
    `).join(''));
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
    if(!product){
        console.error('addToCart: product not found', productId);
        try{ showToast('Sản phẩm không tồn tại. Vui lòng thử lại.','error'); }catch(_){ }
        return;
    }
    // consolidate by id/name and increment qty
    const idx = cart.findIndex(it => it.id === product.id && (!it.name || it.name === product.name));
    if(idx >= 0){ cart[idx].qty = (cart[idx].qty||1) + 1; }
    else { cart.push({ id:product.id, name:product.name, price:product.price, image:product.image, qty:1 }); }
    saveCart();
    updateCartCount();
    console.log('addToCart: added', product);
    try{ showToast && showToast('Đã thêm vào giỏ hàng!','success'); }catch(e){ toastAlert('Đã thêm vào giỏ hàng!'); }
}

// Buy now: chuyển tới trang chi tiết sản phẩm
function buyNow(productId){
    try{
        const product = products.find(p => p.id === Number(productId));
        if(!product){ showToast('Sản phẩm không tồn tại.','error'); return; }
        try{ showToast('Mở trang sản phẩm…','info',{duration:800}); }catch(e){}
        window.location.href = `product.html?id=${product.id}`;
    }catch(err){
        console.warn('buyNow failed', err);
        // Fallback: quay về danh sách sản phẩm
        window.location.href = 'products.html';
    }
}

// Update Cart Count
function updateCartCount() {
    try{
        const totalQty = cart.reduce((s,it)=>s+(it.qty||1),0);
        document.querySelectorAll('.cart-count').forEach(el=>{ el.textContent = totalQty; });
    }catch(e){ /* ignore */ }
}

// Cart Modal / Cart button behaviour (works across all pages)
const modal = document.getElementById('cartModal');
const closeBtn = document.querySelector('.close');

function onCartClick(e){
    try{ e.preventDefault(); }catch(_){ }
    // If cart modal exists on this page -> open it; otherwise, navigate to checkout
    if(modal){
        // Điều chỉnh theo yêu cầu: thay vì mở modal, điều hướng tới trang giỏ hàng
        try{ saveCart(); }catch(_){ }
        try{ showToast('Mở trang giỏ hàng…','info',{duration:800}); }catch(_){ }
        window.location.href = 'cart.html';
    } else {
        // Trên các trang khác, luôn đi tới trang giỏ hàng trước khi thanh toán
        try{ saveCart(); }catch(_){ }
        try{ showToast('Mở trang giỏ hàng…','info',{duration:800}); }catch(_){ }
        window.location.href = 'cart.html';
    }
}

try{
    function bindCartButtons(){
        const cartBtns = document.querySelectorAll('.cart-btn');
        if(cartBtns && cartBtns.length){
            cartBtns.forEach(btn => {
                // avoid duplicate binding
                if(!btn.__cartBound){ btn.addEventListener('click', onCartClick); btn.__cartBound = true; }
            });
            console.log('Bound cart buttons:', cartBtns.length);
        } else {
            console.warn('No .cart-btn found on this page');
        }
    }
    bindCartButtons();
    document.addEventListener('DOMContentLoaded', bindCartButtons);
}catch(err){ console.warn('Attach cart button failed', err); }

// Expose a global inline handler for reliability in static HTML
try{ window.onCartIconClick = function(ev){
    try{ showToast('Đang mở giỏ hàng…','info',{duration:800}); }catch(_){ /* ignore */ }
    console.log('[onCartIconClick] click fired');
    onCartClick(ev);
    return false;
}; }catch(e){ /* ignore */ }

// Fallback delegated handler for dynamically inserted cart buttons
document.addEventListener('click', function(ev){
    const cb = ev.target.closest && ev.target.closest('.cart-btn');
    if(!cb) return;
    onCartClick(ev);
});

if(closeBtn){
    closeBtn.addEventListener('click', () => {
        if(modal) modal.style.display = 'none';
    });
} else {
    // fine on pages without modal
}

function displayCart() {
    const cartItems = document.getElementById('cartItems');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    console.log('displayCart: items', cart.length);
    if(!cartItems){ console.warn('displayCart: cartItems element not found'); return; }

    cartItems.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
            <span>${item.name}</span>
            <span>${item.price.toLocaleString('vi-VN')}đ</span>
        </div>
    `).join('');
    
    const totalEl = document.getElementById('totalPrice');
    if(totalEl) totalEl.textContent = total.toLocaleString('vi-VN') + 'đ';
    else console.warn('displayCart: totalPrice element not found');
}

// Ensure cart is loaded from storage when script runs on any page
try{ loadCart(); }catch(e){ /* ignore */ }
// update visible count on load
try{ updateCartCount(); }catch(e){ /* ignore */ }

console.log('SGB script loaded. current cart length=', cart.length);

// If we're on checkout page, populate items immediately and log cart contents
try{
    const pathname = window.location.pathname || '';
    if(pathname.endsWith('/checkout.html') || pathname.endsWith('checkout.html')){
        console.log('On checkout page - populating checkout items', cart);
        displayCheckoutItems();
    } else if(pathname.endsWith('/cart.html') || pathname.endsWith('cart.html')){
        console.log('On cart page - rendering cart items', cart);
        renderCartPage();
    }
    if(pathname.endsWith('/product.html') || pathname.endsWith('product.html')){
        renderProductDetail();
    }
}catch(e){ console.warn('page auto-init failed', e); }

// Also auto-render cart page if the container exists, regardless of pathname differences
document.addEventListener('DOMContentLoaded', () => {
    try{
        if(document.getElementById('cartPageItems')){
            console.log('DOMContentLoaded: cart page container detected, rendering now');
            renderCartPage();
        }
        // Ensure checkout items render if container exists
        if(document.getElementById('checkoutItems')){
            displayCheckoutItems();
        }
        // Mobile menu toggle
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        if(menuBtn && navMenu){
            menuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('open');
            });
            // Close menu when clicking a link
            navMenu.addEventListener('click', (e) => {
                const a = e.target.closest('a');
                if(a){ navMenu.classList.remove('open'); }
            });
        }
    }catch(err){ console.warn('DOMContentLoaded init failed', err); }
});

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

// ===== Checkout / Payment Logic =====
const checkoutModal = document.getElementById('checkoutModal');
const checkoutCloseBtn = document.querySelector('.checkout-close');
const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
const successModal = document.getElementById('successModal');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');

function openCheckout() {
    // populate checkout modal with current cart
    displayCheckoutItems();
    if(!checkoutModal){ console.warn('openCheckout: checkoutModal not found'); return; }
    checkoutModal.style.display = 'block';
}

// ===== Product Detail Rendering =====
function getQueryParam(name){
    try{ return new URLSearchParams(window.location.search).get(name); }catch(e){ return null; }
}

function addConfiguredToCart(productId, {size='F', qty=1}={}){
    const product = products.find(p => p.id === Number(productId));
    if(!product){ showToast('Sản phẩm không tồn tại.','error'); return; }
    qty = Math.max(1, Number(qty)||1);
    for(let i=0;i<qty;i++){
        // keep price and add size into name for display
        cart.push({ ...product, name: `${product.name} - Size ${size}` });
    }
    updateCartCount();
    saveCart();
    showToast('Đã thêm vào giỏ hàng!','success');
}

function renderProductDetail(){
    const id = getQueryParam('id');
    const root = document.getElementById('productDetailRoot');
    const product = products.find(p => p.id === Number(id));
    if(!root) return;
    if(!product){ root.innerHTML = '<p>Không tìm thấy sản phẩm. <a href="products.html">Quay lại danh sách</a></p>'; return; }
    const now = product.price;
    const old = Math.round(now * 1.2);
    const off = Math.round((1 - now/old) * 100);
    const thumbs = [product.image, product.image, product.image];
    root.innerHTML = `
        <div class="pd-gallery">
            <img id="pdHero" class="pd-hero" src="${product.image}" alt="${product.name}">
            <div class="pd-thumbs">
                ${thumbs.map((t,i)=>`<img class="pd-thumb" data-src="${t}" src="${t}" alt="thumb ${i+1}">`).join('')}
            </div>
        </div>
        <div class="pd-info">
            <div class="pd-brand">Thương hiệu: <strong>StyleGlamour</strong></div>
            <div class="pd-name">${product.name}</div>
            <div class="pd-price"><span class="now">${now.toLocaleString('vi-VN')}đ</span><span class="old">${old.toLocaleString('vi-VN')}đ</span><span class="off">-${off}%</span></div>
            <div class="pd-section">
                <div style="font-weight:700;margin-bottom:8px">Kích cỡ</div>
                <div class="size-group" id="sizeGroup">
                    ${['S','M','L','XL'].map(s=>`<button type="button" class="size-btn" data-size="${s}">${s}</button>`).join('')}
                </div>
            </div>
            <div class="pd-section">
                <div style="font-weight:700;margin-bottom:8px">Số lượng</div>
                <div class="qty">
                    <button type="button" id="qtyMinus">-</button>
                    <input id="qtyInput" value="1" inputmode="numeric" />
                    <button type="button" id="qtyPlus">+</button>
                </div>
            </div>
            <div class="pd-actions">
                <button id="addToCartDetail" class="btn-add"><i class="fas fa-cart-plus"></i> Thêm vào giỏ</button>
                <button id="buyNowDetail" class="btn-buy">Mua ngay</button>
            </div>
        </div>
    `;
    // thumbs behavior
    try{
        const hero = document.getElementById('pdHero');
        document.querySelectorAll('.pd-thumb').forEach(img=>{
            img.addEventListener('click', ()=>{ hero.src = img.dataset.src; });
        });
    }catch(e){ /* ignore */ }

    // size selection
    let selectedSize = 'M';
    try{
        const group = document.getElementById('sizeGroup');
        const setActive = (s)=>{
            group.querySelectorAll('.size-btn').forEach(b=>b.classList.toggle('active', b.dataset.size===s));
        };
        setActive(selectedSize);
        group.addEventListener('click', e=>{
            const btn = e.target.closest('.size-btn');
            if(!btn) return;
            selectedSize = btn.dataset.size;
            setActive(selectedSize);
        });
    }catch(e){ /* ignore */ }

    // qty controls
    try{
        const input = document.getElementById('qtyInput');
        document.getElementById('qtyMinus').addEventListener('click', ()=>{ input.value = Math.max(1, (parseInt(input.value)||1)-1); });
        document.getElementById('qtyPlus').addEventListener('click', ()=>{ input.value = Math.max(1, (parseInt(input.value)||1)+1); });
    }catch(e){ /* ignore */ }

    // actions
    try{
        document.getElementById('addToCartDetail').addEventListener('click', ()=>{
            const qty = parseInt(document.getElementById('qtyInput').value)||1;
            addConfiguredToCart(product.id, {size:selectedSize, qty});
        });
        document.getElementById('buyNowDetail').addEventListener('click', ()=>{
            const qty = parseInt(document.getElementById('qtyInput').value)||1;
            addConfiguredToCart(product.id, {size:selectedSize, qty});
            window.location.href = 'checkout.html';
        });
    }catch(e){ /* ignore */ }
}

if(cartCheckoutBtn){
    console.log('Found direct cartCheckoutBtn:', cartCheckoutBtn);
    cartCheckoutBtn.addEventListener('click', () => {
        // if cart empty, alert
        if(cart.length === 0){
            showToast('Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.','error');
            return;
        }
        // save cart and navigate to standalone checkout page
        try{ saveCart(); }catch(e){ console.warn('saveCart failed before navigate', e); }
        try{ showToast('Đang chuyển tới trang thanh toán…','info',{duration:1500}); }catch(e){ /* ignore */ }
        window.location.href = 'checkout.html';
    });
}

// Fallback delegated click handler in case the button is rendered dynamically or listener didn't attach
document.addEventListener('click', function(e){
    try{
        const btn = e.target.closest && e.target.closest('#cartCheckoutBtn');
        if(!btn) return;
        console.log('Delegated cartCheckoutBtn click (via document) - element:', btn);
        if(cart.length === 0){ showToast('Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.','error'); return; }
        try{ saveCart(); }catch(err){ console.warn('saveCart failed in delegated handler', err); }
        try{ showToast('Đang chuyển tới trang thanh toán…','info',{duration:1500}); }catch(e){ /* ignore */ }
        window.location.href = 'checkout.html';
    }catch(err){ /* ignore */ }
});

// Delegated handler for dynamically rendered buy-now buttons (redundant safety)
document.addEventListener('click', function(e){
    const bn = e.target.closest && e.target.closest('.buy-now');
    if(!bn) return;
    e.preventDefault();
    const id = Number(bn.dataset.id || 0);
    if(id) buyNow(id);
});

// Debug: how many elements with the id exist?
try{ const matches = document.querySelectorAll('#cartCheckoutBtn'); console.log('cartCheckoutBtn count on page:', matches.length); }catch(e){/*ignore*/}

if(checkoutCloseBtn){
    checkoutCloseBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });
}

function formatVND(amount){
    return amount.toLocaleString('vi-VN') + 'đ';
}

function displayCheckoutItems(){
    const container = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('subtotalPrice');
    const shippingEl = document.getElementById('shippingFee');
    const discountEl = document.getElementById('discount');
    const finalEl = document.getElementById('finalTotal');

    const shippingFee = 30000;
    const subtotal = cart.reduce((s, it) => s + it.price * (it.qty||1), 0);
    let discount = 0;
    if(!container){ console.warn('displayCheckoutItems: #checkoutItems not found'); }
    if(container){
        if(cart.length === 0){
            container.classList.add('items-empty');
            container.innerHTML = 'Chưa có sản phẩm';
        } else {
            container.classList.remove('items-empty');
            container.innerHTML = cart.map((item,idx) => `
                <div class="summary-item" data-id="${item.id}">
                    <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
                        <img src="${item.image}" alt="${item.name}" style="width:42px;height:42px;object-fit:cover;border-radius:8px;border:1px solid #e2e2e2" />
                        <div style="display:flex;flex-direction:column;gap:2px;min-width:0">
                            <span style="font-size:.68rem;opacity:.6;font-weight:600">#${idx+1}</span>
                            <span style="font-size:.75rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${item.name} × ${item.qty||1}</span>
                        </div>
                    </div>
                    <span style="font-weight:600;color:#222;font-size:.8rem">${(item.price*(item.qty||1)).toLocaleString('vi-VN')}đ</span>
                </div>
            `).join('');
            // sanity log
            console.log('displayCheckoutItems: rendered', cart.length, 'items');
            if(container.children.length !== cart.length){
                console.warn('Mismatch visible items vs cart length', container.children.length, cart.length);
            }
        }
    }

    if(subtotalEl) subtotalEl.textContent = formatVND(subtotal);
    if(shippingEl) shippingEl.textContent = formatVND(shippingFee);
    if(discountEl) discountEl.textContent = `-0đ`;
    if(finalEl) finalEl.textContent = formatVND(subtotal + shippingFee - discount);
}

// ===== Cart Page Rendering =====
function renderCartPage(){
    const listEl = document.getElementById('cartPageItems');
    const subtotalEl = document.getElementById('cartPageSubtotal');
    const shippingEl = document.getElementById('cartPageShipping');
    const totalEl = document.getElementById('cartPageTotal');

    // Always reload from localStorage on cart page to ensure latest state
    try{ loadCart(); }catch(e){ /* ignore */ }

    if(!listEl){ console.warn('renderCartPage: #cartPageItems not found'); return; }

    if(cart.length === 0){
        listEl.innerHTML = '<div class="cart-empty"><div class="illustration">🛍️</div><div>Giỏ hàng trống.</div><div style="margin-top:8px"><a href="products.html">Tiếp tục mua sắm</a></div></div>';
        if(subtotalEl) subtotalEl.textContent = formatVND(0);
        // Khi không có sản phẩm, hiển thị phí vận chuyển là 0 để tổng thể hiện đúng 0đ
        if(shippingEl) shippingEl.textContent = formatVND(0);
        if(totalEl) totalEl.textContent = formatVND(0);
        return;
    }

    listEl.innerHTML = cart.map((item, idx)=>`
        <div class="cart-item" data-idx="${idx}">
            <div class="cart-left">
                <img src="${item.image}" alt="${item.name}" class="cart-thumb" />
                <div class="cart-info">
                    <div class="name">${item.name}</div>
                    <div class="meta">Mã #${item.id}</div>
                </div>
            </div>
            <div class="cart-row-actions">
                <div class="qty-controls" style="display:flex;align-items:center;gap:8px">
                    <button class="btn-secondary" data-action="dec" data-idx="${idx}" style="padding:6px 10px">-</button>
                    <span style="min-width:24px;text-align:center;font-weight:700">${item.qty||1}</span>
                    <button class="btn-secondary" data-action="inc" data-idx="${idx}" style="padding:6px 10px">+</button>
                </div>
                <div class="cart-price" style="min-width:100px;text-align:right">${(item.price*(item.qty||1)).toLocaleString('vi-VN')}đ</div>
                <button class="btn-link remove-item" data-idx="${idx}"><i class="fas fa-trash"></i> Xóa</button>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((s,it)=>s+it.price*(it.qty||1),0);
    const shipping = 30000;
    const total = subtotal + shipping;
    if(subtotalEl) subtotalEl.textContent = formatVND(subtotal);
    if(shippingEl) shippingEl.textContent = formatVND(shipping);
    if(totalEl) totalEl.textContent = formatVND(total);

    // bind remove buttons
    listEl.querySelectorAll('.remove-item').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
            const i = Number(btn.dataset.idx||-1);
            if(i>=0){
                cart.splice(i,1);
                saveCart();
                updateCartCount();
                renderCartPage();
                showToast('Đã xóa sản phẩm khỏi giỏ','info');
            }
        });
    });
    // Bind qty +/- controls
    listEl.querySelectorAll('.btn-secondary[data-action]').forEach(btn=>{
        btn.addEventListener('click', ()=>{
            const i = Number(btn.dataset.idx||-1);
            const action = btn.dataset.action;
            if(i>=0){
                const it = cart[i];
                if(action==='inc'){ it.qty = (it.qty||1)+1; }
                else if(action==='dec'){ it.qty = Math.max(1, (it.qty||1)-1); }
                saveCart();
                updateCartCount();
                renderCartPage();
            }
        });
    });
}

// Enhance payment method UI active state
function initPaymentMethods(){
    // Match markup in checkout.html (label.payment-option > input)
    const pmOptions = document.querySelectorAll('.payment-option input');
    pmOptions.forEach(inp => {
        inp.addEventListener('change', () => {
            pmOptions.forEach(o => o.closest('.payment-option').classList.remove('pm-active'));
            inp.closest('.payment-option').classList.add('pm-active');
        });
        if(inp.checked){ inp.closest('.payment-option').classList.add('pm-active'); }
    });
}
try{ initPaymentMethods(); }catch(e){ /* ignore */ }

// Promo code handling
const applyPromoBtn = document.getElementById('applyPromo');
const promoInput = document.getElementById('promoCode');
if(applyPromoBtn){
    applyPromoBtn.addEventListener('click', () => {
        const code = (promoInput.value||'').trim().toUpperCase();
        const subtotal = cart.reduce((s, it) => s + it.price, 0);
        let discount = 0;
        let shippingFee = 30000;
        if(!code){ showToast('Nhập mã giảm giá trước khi áp dụng.','info'); return; }
        // Simple promo rules
        if(code === 'SGB10'){
            discount = Math.round(subtotal * 0.10);
            showToast('Áp dụng mã SGB10: giảm 10%','success');
        } else if(code === 'FREESHIP'){
            discount = 0;
            shippingFee = 0;
            showToast('Áp dụng mã FREESHIP: Miễn phí vận chuyển','success');
        } else {
            showToast('Mã giảm giá không hợp lệ.','error');
        }

        // update displayed values
        const subtotalEl = document.getElementById('subtotalPrice');
        const shippingEl = document.getElementById('shippingFee');
        const discountEl = document.getElementById('discount');
        const finalEl = document.getElementById('finalTotal');

        if(subtotalEl) subtotalEl.textContent = formatVND(subtotal);
        if(shippingEl) shippingEl.textContent = formatVND(shippingFee);
        if(discountEl) discountEl.textContent = '-' + formatVND(discount);
        if(finalEl) finalEl.textContent = formatVND(subtotal + shippingFee - discount);
    });
}

// ===== Toast Notification Helper =====
function ensureToastContainer(){
    let c = document.querySelector('.toast-container');
    if(!c){
        c = document.createElement('div');
        c.className='toast-container';
        document.body.appendChild(c);
    }
    return c;
}
function showToast(message, type='info', opts={}){
    const {duration=3000} = opts;
    const container = ensureToastContainer();
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<span>${message}</span><button class="close-toast" aria-label="Đóng">×</button>`;
    container.appendChild(el);
    const close = () => {
        el.style.animation='toast-out .3s ease forwards';
        setTimeout(()=>{ el.remove(); },300);
    };
    el.querySelector('.close-toast').addEventListener('click', close);
    setTimeout(close, duration);
}

// Replace alert usages with showToast wrappers (light override)
function toastAlert(msg){ try{ showToast(msg,'info'); }catch(e){ alert(msg); } }

// Handle checkout submit
const checkoutForm = document.getElementById('checkoutForm');
if(checkoutForm){
    checkoutForm.addEventListener('submit', function(e){
        e.preventDefault();
        // Validate required fields
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const city = document.getElementById('city').value;
        const district = document.getElementById('district').value;
        const payment = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

        if(!fullName || !phone || !address || !city || !district){
            showToast('Vui lòng điền đầy đủ thông tin giao hàng (tên, điện thoại, địa chỉ, tỉnh/thành, quận/huyện).','error');
            return;
        }

        // Build order
        const subtotal = cart.reduce((s, it) => s + it.price, 0);
        const shippingFee = document.getElementById('shippingFee')?.textContent ? parseInt(document.getElementById('shippingFee').textContent.replace(/\D/g,'')) : 30000;
        const discountRaw = document.getElementById('discount')?.textContent ? parseInt(document.getElementById('discount').textContent.replace(/\D/g,'')) : 0;
        const discount = Math.abs(discountRaw);
        const total = subtotal + (isNaN(shippingFee)?30000:shippingFee) - (isNaN(discount)?0:discount);

        const orderNumber = Date.now().toString().slice(-6) + Math.floor(Math.random()*90+10).toString();

        const order = {
            id: `FS${orderNumber}`,
            name: fullName,
            phone, address, city, district,
            items: cart.slice(),
            subtotal, shippingFee, discount, total, payment,
            createdAt: new Date().toISOString()
        };

        // save to localStorage (simple persistence)
        try{
            const orders = JSON.parse(localStorage.getItem('sgb_orders')||'[]');
            orders.push(order);
            localStorage.setItem('sgb_orders', JSON.stringify(orders));
        }catch(e){ /* ignore */ }

        // Clear cart
        cart = [];
        updateCartCount();
        const cartItemsEl = document.getElementById('cartItems');
        if(cartItemsEl) cartItemsEl.innerHTML = '';
        const totalPriceEl = document.getElementById('totalPrice');
        if(totalPriceEl) totalPriceEl.textContent = '0đ';
    try{ localStorage.removeItem(CART_KEY); }catch(e){ /* ignore */ }

        // Close checkout, show success
        if(checkoutModal) checkoutModal.style.display = 'none';
        const orderNumSpan = document.querySelectorAll('#orderNumber');
        orderNumSpan.forEach(sp => sp.textContent = order.id.replace(/^FS/,''));
        if(successModal) successModal.style.display = 'block';

        // Progress steps: mark completed & activate step 3 when on checkout.html
        try{
            const steps = document.querySelectorAll('.progress-steps .step');
            if(steps.length === 3){
                steps.forEach(s => s.classList.remove('active'));
                steps[0].classList.add('completed');
                steps[1].classList.add('completed');
                steps[2].classList.add('active');
            }
        }catch(err){ console.warn('Update steps failed', err); }

        // Show inline success card and hide form/summary cards (checkout page scenario)
        try{
            const isCheckoutPage = /checkout\.html$/.test(window.location.pathname);
            if(isCheckoutPage){
                const formCard = document.querySelector('.checkout-form-card');
                const summaryCard = document.querySelector('.order-summary-card');
                formCard && formCard.classList.add('hide-on-complete');
                summaryCard && summaryCard.classList.add('hide-on-complete');
                const result = document.getElementById('orderResult');
                if(result){
                    result.classList.add('order-success');
                    result.style.display='block';
                    result.innerHTML = `
                        <h3><i class="fas fa-check-circle"></i> Đặt hàng thành công</h3>
                        <p>Mã đơn hàng: <strong>${order.id}</strong></p>
                        <p>Cảm ơn bạn đã mua sắm tại STYLE GLAMOUR BEATS.</p>
                        <div class="actions">
                            <button class="btn-secondary" id="backHomeBtn">Về trang chủ</button>
                            <button class="btn-accent" id="viewProductsBtn">Xem thêm sản phẩm</button>
                        </div>
                    `;
                    const backBtn = document.getElementById('backHomeBtn');
                    const viewBtn = document.getElementById('viewProductsBtn');
                    backBtn && backBtn.addEventListener('click', ()=>{ window.location.href='SGBweb.html'; });
                    viewBtn && viewBtn.addEventListener('click', ()=>{ window.location.href='products.html'; });
                }
                showToast('Đơn hàng đã được tạo thành công!','success');
            }
        }catch(err){ console.warn('Inline success display failed', err); }
    });
}

if(continueShoppingBtn){
    continueShoppingBtn.addEventListener('click', ()=>{
        successModal.style.display = 'none';
    });
}

// Close modals when clicking outside modal-content
window.addEventListener('click', (e) => {
    const cartModal = document.getElementById('cartModal');
    if(e.target === cartModal) cartModal.style.display = 'none';
    if(e.target === checkoutModal) checkoutModal.style.display = 'none';
    if(e.target === successModal) successModal.style.display = 'none';
});