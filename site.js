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

// Final-stage placeholder if all other images fail (local asset served by server)
const PLACEHOLDER_IMG = '/uploads/placeholder.svg';

// Replace placeholder images with realistic, category-appropriate photos from curated Unsplash IDs
// Chọn ảnh đúng loại sản phẩm theo từ khoá tên để KHỚP món: áo khoác, áo polo, quần tây âu, quần jeans, balo, túi xách, giày, thắt lưng
function getImageForProduct(name, category) {
    const seedImg = (seed) => `https://picsum.photos/seed/${seed}/900/1200`;
    const n = name.toLowerCase();
    // áo khoác (jacket/coat/windbreaker/bomber)
    if (n.includes('khoác') || n.includes('jacket') || n.includes('bomber') || n.includes('coat') || n.includes('gió') || n.includes('denim')) {
        return seedImg('sgb-jacket');
    }
    // áo polo
    if (n.includes('polo')) {
        return seedImg('sgb-polo');
    }
    // quần tây âu (trousers/chinos/slacks)
    if (n.includes('quần tây') || n.includes('tây âu') || n.includes('slacks') || n.includes('chinos') || n.includes('tây')) {
        return seedImg('sgb-trousers');
    }
    // quần dài jeans / denim
    if (n.includes('jeans') || n.includes('denim') || n.includes('quần jean')) {
        return seedImg('sgb-jeans');
    }
    // balo
    if (n.includes('balo') || n.includes('backpack')) {
        return seedImg('sgb-backpack');
    }
    // túi xách / ví
    if (n.includes('túi') || n.includes('bag') || n.includes('ví')) {
        return seedImg('sgb-bag');
    }
    // giày / loafer / sneaker
    if (n.includes('giày') || n.includes('loafer') || n.includes('sneaker') || n.includes('boots')) {
        return seedImg('sgb-shoes');
    }
    // thắt lưng / belt
    if (n.includes('thắt lưng') || n.includes('belt')) {
        return seedImg('sgb-belt');
    }
    // áo sơ mi / blouse / tee fallback theo category
    if (n.includes('sơ mi') || n.includes('shirt')) {
        return seedImg('sgb-shirt');
    }
    if (n.includes('áo thun') || n.includes('tee') || n.includes('t-shirt')) {
        return seedImg('sgb-tee');
    }
    // women dresses/blouse fallback
    if (category === 'women' && (n.includes('đầm') || n.includes('dress') || n.includes('blouse'))) {
        return seedImg('sgb-dress');
    }
    // accessories fallback
    if (category === 'accessories') {
        return seedImg('sgb-accessory');
    }
    // default generic fashion
    return seedImg('sgb-fashion');
}

function shuffleArray(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
}

function getCrossSellProducts(current, count=4){
    const pool = products.filter(p => p && p.id !== current.id);
    if(!pool.length) return [];
    const cat = String(current.category||'').toLowerCase();
    let picks = [];
    if(cat === 'men' || cat === 'women'){
        const same = pool.filter(p => p.category === cat);
        const acc = pool.filter(p => p.category === 'accessories');
        picks = shuffleArray(acc).slice(0,2).concat(shuffleArray(same).slice(0,2));
    }else if(cat === 'accessories'){
        const men = pool.filter(p => p.category === 'men');
        const women = pool.filter(p => p.category === 'women');
        picks = shuffleArray(men).slice(0,2).concat(shuffleArray(women).slice(0,2));
    }
    // Fill remaining
    const remain = shuffleArray(pool);
    for(const p of remain){
        if(picks.length >= count) break;
        if(!picks.find(x=>x.id===p.id)) picks.push(p);
    }
    return picks.slice(0, count);
}

// Gán ảnh mặc định theo tên/chủng loại chỉ khi chưa có ảnh tùy chỉnh
products.forEach(p => {
    if (!p.image) {
        p.image = getImageForProduct(p.name, p.category);
    }
});

let cart = [];
let currentFilter = 'all';
let currentSearchTerm = '';

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

// Toggle: use server catalog or keep local 50 products
const ENABLE_SERVER_CATALOG = true;

// Attempt to hydrate local catalog from server once
let __catalogHydrated = false;
async function hydrateProductsFromServer(){
    // Keep original 50 products with old images when disabled
    if(!ENABLE_SERVER_CATALOG){ __catalogHydrated = true; return; }
    if(__catalogHydrated) return;
    try{
        const resp = await fetch('/api/products');
        if(!resp.ok) return;
        const list = await resp.json();
        if(Array.isArray(list) && list.length){
            // Normalize into local schema used by UI
            const normalized = list.map(p=>{
                const img = (p.images && (p.images.cover || (p.images.gallery && p.images.gallery[0]))) || '';
                const category = String(p.category||'').toLowerCase();
                const name = p.name || `#${p.id}`;
                const price = (p.salePrice != null ? Number(p.salePrice) : Number(p.price)) || 0;
                return { id:Number(p.id)||Date.now(), name, price, category, image: img || getImageForProduct(name, category), badge: '' };
            });
            // Replace contents of local products array so existing code keeps working
            products.splice(0, products.length, ...normalized);
            __catalogHydrated = true;
            console.log('Hydrated products from server:', products.length);
        }
    }catch(err){ console.warn('hydrateProductsFromServer failed, using local catalog', err); }
}

function normalizeCategory(cat){
    const c = String(cat || '').trim().toLowerCase();
    if(!c) return '';
    if(c === 'men' || c.includes('nam')) return 'men';
    if(c === 'women' || c.includes('nữ') || c.includes('nu')) return 'women';
    if(c === 'accessories' || c.includes('phụ kiện') || c.includes('phu kien') || c.includes('phụ-kiện') || c.includes('túi') || c.includes('that lung') || c.includes('thắt lưng') || c.includes('kính') || c.includes('khăn') || c.includes('mũ') || c.includes('ví') || c.includes('giày') || c.includes('giay')) return 'accessories';
    return c;
}

// Load Products
async function loadProducts(filter = currentFilter, searchTerm = currentSearchTerm) {
    await hydrateProductsFromServer();
    const productGrid = document.getElementById('productGrid');
    currentFilter = String(filter || 'all').toLowerCase();
    currentSearchTerm = String(searchTerm || '').trim().toLowerCase();

    let filteredProducts = products.filter(p => {
        const cat = normalizeCategory(p.category);
        const name = String(p.name || '').toLowerCase();
        const desc = String(p.description || '').toLowerCase();
        const filterOk = currentFilter === 'all' || cat === currentFilter || cat.includes(currentFilter);
        const searchOk = !currentSearchTerm || name.includes(currentSearchTerm);
        const searchDescOk = !currentSearchTerm || desc.includes(currentSearchTerm);
        return filterOk && (searchOk || searchDescOk);
    });

    // If category is too restrictive for a keyword, gracefully fallback to all categories.
    let autoExpanded = false;
    if(!filteredProducts.length && currentFilter !== 'all' && currentSearchTerm){
        filteredProducts = products.filter(p => {
            const name = String(p.name || '').toLowerCase();
            const desc = String(p.description || '').toLowerCase();
            return name.includes(currentSearchTerm) || desc.includes(currentSearchTerm);
        });
        if(filteredProducts.length){
            autoExpanded = true;
            currentFilter = 'all';
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if(allBtn) allBtn.classList.add('active');
        }
    }
    
    if(!productGrid) return;

    productGrid.innerHTML = filteredProducts.map(product => {
        const fallbackImg = getImageForProduct(product.name || '', String(product.category||'').toLowerCase());
        const imgSrc = product.image && String(product.image).trim() ? product.image : fallbackImg;
        // Two-stage onerror: first switch to name-based fallback, then to generic placeholder
        const onErr = `if(!this.dataset.swap){this.dataset.swap='1';this.src='${fallbackImg}';}else{this.onerror=null;this.src='${PLACEHOLDER_IMG}';}`;
        return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <a href="product.html?id=${product.id}"><img src="${imgSrc}" alt="${product.name}" onerror="${onErr}"></a>
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
        </div>`;
    }).join('');

    if(!filteredProducts.length){
        productGrid.innerHTML = '<div class="search-empty">Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa hoặc danh mục khác.</div>';
    }else if(autoExpanded){
        productGrid.insertAdjacentHTML('afterbegin', '<div class="search-empty">Không có kết quả trong danh mục đã chọn, hệ thống đã hiển thị theo tất cả danh mục cho từ khóa của bạn.</div>');
    }
}

// Filter Products
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        loadProducts(this.dataset.filter, currentSearchTerm);
    });
});

// Handle category filter from URL query parameter
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const category = String(params.get('category') || 'all').toLowerCase();
    const keyword = String(params.get('q') || params.get('search') || '').trim();

    const filterBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`) || document.querySelector('.filter-btn[data-filter="all"]');
    if (filterBtn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        filterBtn.classList.add('active');
    }

    loadProducts(filterBtn ? filterBtn.dataset.filter : 'all', keyword);
});

function initHeaderSearch(){
    const searchButtons = document.querySelectorAll('.search-btn');
    if(!searchButtons.length) return;

    let modal = document.getElementById('headerSearchModal');
    if(!modal){
        modal = document.createElement('div');
        modal.id = 'headerSearchModal';
        modal.className = 'search-modal';
        modal.innerHTML = `
            <div class="search-modal-backdrop" data-close="1"></div>
            <div class="search-modal-dialog" role="dialog" aria-modal="true" aria-label="Tìm kiếm sản phẩm">
                <button class="search-modal-close" type="button" data-close="1" aria-label="Đóng">&times;</button>
                <h3>Tìm sản phẩm nhanh</h3>
                <p>Chọn danh mục và nhập tên sản phẩm bạn muốn tìm.</p>
                <div class="search-modal-form">
                    <label for="headerSearchCategory">Danh mục</label>
                    <select id="headerSearchCategory">
                        <option value="all">Tất cả</option>
                        <option value="women">Nữ</option>
                        <option value="men">Nam</option>
                        <option value="accessories">Phụ kiện</option>
                    </select>
                    <label for="headerSearchInput">Tên sản phẩm</label>
                    <input id="headerSearchInput" type="text" placeholder="Ví dụ: áo khoác, váy, túi..." maxlength="80">
                    <button id="headerSearchSubmit" type="button" class="btn-search-submit"><i class="fas fa-search"></i> Tìm kiếm</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const openModal = () => {
        try{
            const params = new URLSearchParams(window.location.search);
            const category = String(params.get('category') || currentFilter || 'all').toLowerCase();
            const q = String(params.get('q') || params.get('search') || currentSearchTerm || '');
            const categoryEl = document.getElementById('headerSearchCategory');
            const inputEl = document.getElementById('headerSearchInput');
            if(categoryEl) categoryEl.value = ['all','women','men','accessories'].includes(category) ? category : 'all';
            if(inputEl) inputEl.value = q;
        }catch(_){ }
        modal.classList.add('open');
        document.body.classList.add('search-modal-open');
        const inputEl = document.getElementById('headerSearchInput');
        inputEl && setTimeout(()=>inputEl.focus(), 20);
    };

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.classList.remove('search-modal-open');
    };

    const submitSearch = () => {
        const category = (document.getElementById('headerSearchCategory')?.value || 'all').trim();
        const keyword = (document.getElementById('headerSearchInput')?.value || '').trim();
        const q = new URLSearchParams();
        if(category && category !== 'all') q.set('category', category);
        if(keyword) q.set('q', keyword);
        window.location.href = `products.html${q.toString() ? `?${q.toString()}` : ''}`;
    };

    searchButtons.forEach(btn => {
        if(btn.__searchBound) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
        btn.__searchBound = true;
    });

    modal.addEventListener('click', (e) => {
        if(e.target?.dataset?.close === '1') closeModal();
    });

    document.getElementById('headerSearchSubmit')?.addEventListener('click', submitSearch);
    document.getElementById('headerSearchInput')?.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') submitSearch();
    });

    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
}

function initSupportRequestWidget(){
    try{
        if(document.getElementById('supportWidget')) return;
        const path = String(window.location.pathname || '').toLowerCase();
        if(path.includes('/admin')) return;
        const SUPPORT_IDS_KEY = 'sgb_support_request_ids';
        const SUPPORT_CODES_KEY = 'sgb_support_tracking_codes';
        let refreshTimer = null;

        const readSupportIds = ()=>{
            try{
                const raw = JSON.parse(localStorage.getItem(SUPPORT_IDS_KEY) || '[]');
                if(!Array.isArray(raw)) return [];
                return raw.map((x)=> Number(x)).filter((x)=> Number.isFinite(x) && x > 0).slice(0, 40);
            }catch(_){ return []; }
        };
        const writeSupportIds = (ids)=>{
            try{ localStorage.setItem(SUPPORT_IDS_KEY, JSON.stringify(ids.slice(0, 40))); }catch(_){ }
        };
        const readSupportCodes = ()=>{
            try{
                const raw = JSON.parse(localStorage.getItem(SUPPORT_CODES_KEY) || '[]');
                if(!Array.isArray(raw)) return [];
                return raw.map((x)=> String(x || '').trim().toUpperCase()).filter(Boolean).slice(0, 40);
            }catch(_){ return []; }
        };
        const writeSupportCodes = (codes)=>{
            try{ localStorage.setItem(SUPPORT_CODES_KEY, JSON.stringify(codes.slice(0, 40))); }catch(_){ }
        };
        const escapeHtml = (s)=> String(s || '').replace(/[&<>"']/g, (c)=> ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

        const wrap = document.createElement('div');
        wrap.id = 'supportWidget';
        wrap.className = 'support-widget';
        wrap.innerHTML = `
            <button class="support-btn" id="supportOpenBtn" type="button" aria-label="Yêu cầu hỗ trợ">
                <i class="fas fa-headset"></i>
                <span>Cần nhân viên hỗ trợ</span>
            </button>
            <div class="support-panel" id="supportPanel" aria-hidden="true">
                <div class="support-head">
                    <strong>Yêu cầu hỗ trợ</strong>
                    <button type="button" id="supportCloseBtn" aria-label="Đóng">&times;</button>
                </div>
                <p>Mô tả ngắn để nhân viên hỗ trợ bạn nhanh hơn.</p>
                <textarea id="supportMessage" maxlength="500" placeholder="Ví dụ: Mình cần tư vấn size áo sơ mi nam, cao 1m72 nặng 68kg."></textarea>
                <div class="support-actions">
                    <button type="button" class="support-send" id="supportSendBtn">Gửi yêu cầu</button>
                </div>
                <div id="supportCodeBox" class="support-code-box" style="display:none">
                    <span>Mã hỗ trợ của bạn:</span>
                    <strong id="supportCodeText"></strong>
                    <button type="button" id="supportCopyCodeBtn">Copy</button>
                </div>
                <div class="support-lookup">
                    <input id="supportTrackingCode" type="text" maxlength="20" placeholder="Nhập mã hỗ trợ (vd: HT-AB12CD)">
                    <button type="button" class="support-lookup-btn" id="supportLookupBtn">Tra cứu mã</button>
                </div>
                <div class="support-history">
                    <div class="support-history-title">Phản hồi gần đây</div>
                    <div id="supportHistoryList" class="support-history-list">Bạn chưa gửi yêu cầu hỗ trợ nào.</div>
                </div>
            </div>
        `;
        document.body.appendChild(wrap);

        const openBtn = document.getElementById('supportOpenBtn');
        const closeBtn = document.getElementById('supportCloseBtn');
        const panel = document.getElementById('supportPanel');
        const sendBtn = document.getElementById('supportSendBtn');
        const lookupBtn = document.getElementById('supportLookupBtn');
        const codeInput = document.getElementById('supportTrackingCode');
        const codeBox = document.getElementById('supportCodeBox');
        const codeText = document.getElementById('supportCodeText');
        const copyCodeBtn = document.getElementById('supportCopyCodeBtn');
        const msgEl = document.getElementById('supportMessage');
        const historyEl = document.getElementById('supportHistoryList');

        const showCode = (code)=>{
            const c = String(code || '').trim().toUpperCase();
            if(!c || !codeBox || !codeText) return;
            codeText.textContent = c;
            codeBox.style.display = '';
        };

        const renderHistory = (items)=>{
            if(!historyEl) return;
            if(!items || !items.length){
                historyEl.textContent = 'Bạn chưa gửi yêu cầu hỗ trợ nào.';
                return;
            }
            historyEl.innerHTML = items.map((x)=>{
                const statusLabel = x.status === 'handled' ? 'Da xu ly' : 'Dang cho';
                const statusClass = x.status === 'handled' ? 'done' : 'pending';
                const replyText = x.note ? escapeHtml(x.note) : (x.status === 'handled' ? 'Nhan vien da xu ly yeu cau cua ban.' : 'Nhan vien chua phan hoi.');
                const timeText = x.handledAt ? `Cap nhat: ${escapeHtml(new Date(x.handledAt).toLocaleString('vi-VN'))}` : `Gui luc: ${escapeHtml(new Date(x.createdAt).toLocaleString('vi-VN'))}`;
                return `
                    <div class="support-history-item">
                        <div class="support-history-line"><span class="support-tag ${statusClass}">${statusLabel}</span> <small>${timeText}</small></div>
                        ${x.trackingCode ? `<div class="support-history-code">Mã: ${escapeHtml(x.trackingCode)}</div>` : ''}
                        <div class="support-history-message">${escapeHtml(x.message || '')}</div>
                        <div class="support-history-reply">${replyText}</div>
                    </div>
                `;
            }).join('');
        };

        const loadHistory = async ()=>{
            if(!historyEl) return;
            const ids = readSupportIds();
            const codes = readSupportCodes();
            let logged = null;
            try{ logged = JSON.parse(localStorage.getItem('sgb_logged_in') || 'null'); }catch(_){ logged = null; }
            const customerEmail = String(logged?.email || '').trim().toLowerCase();
            if(!ids.length && !codes.length && !customerEmail){ renderHistory([]); return; }
            historyEl.textContent = 'Dang tai phan hoi...';
            try{
                const res = await fetch('/api/support-requests/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids, codes, customerEmail })
                });
                if(!res.ok) throw new Error('Khong tai duoc phan hoi');
                const data = await res.json();
                const items = Array.isArray(data.items) ? data.items : [];
                renderHistory(items);
            }catch(_){
                historyEl.textContent = 'Tam thoi khong tai duoc phan hoi tu nhan vien.';
            }
        };

        const setOpen = (open)=>{
            panel.classList.toggle('open', !!open);
            panel.setAttribute('aria-hidden', open ? 'false' : 'true');
            if(open){
                setTimeout(()=> msgEl && msgEl.focus(), 30);
                const storedCodes = readSupportCodes();
                if(storedCodes.length){
                    showCode(storedCodes[0]);
                    if(codeInput && !codeInput.value) codeInput.value = storedCodes[0];
                }
                loadHistory();
                if(refreshTimer) clearInterval(refreshTimer);
                refreshTimer = setInterval(loadHistory, 20000);
            }else if(refreshTimer){
                clearInterval(refreshTimer);
                refreshTimer = null;
            }
        };

        openBtn && openBtn.addEventListener('click', ()=> setOpen(true));
        closeBtn && closeBtn.addEventListener('click', ()=> setOpen(false));

        sendBtn && sendBtn.addEventListener('click', async ()=>{
            const message = String(msgEl && msgEl.value || '').trim();
            if(message.length < 3){
                showToast('Vui lòng nhập nội dung hỗ trợ chi tiết hơn.','info');
                return;
            }

            let logged = null;
            try{ logged = JSON.parse(localStorage.getItem('sgb_logged_in') || 'null'); }catch(_){ logged = null; }

            sendBtn.disabled = true;
            sendBtn.textContent = 'Đang gửi...';
            try{
                const res = await fetch('/api/support-requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message,
                        page: `${window.location.pathname || ''}${window.location.search || ''}`,
                        customerName: logged?.name || '',
                        customerEmail: logged?.email || ''
                    })
                });
                const data = await res.json().catch(()=>({}));
                if(!res.ok) throw new Error(data.error || 'Không gửi được yêu cầu');

                const ids = readSupportIds();
                const newId = Number(data.id || 0);
                if(newId && !ids.includes(newId)){
                    ids.unshift(newId);
                    writeSupportIds(ids);
                }

                const newCode = String(data.trackingCode || '').trim().toUpperCase();
                if(newCode){
                    const codes = readSupportCodes();
                    if(!codes.includes(newCode)){
                        codes.unshift(newCode);
                        writeSupportCodes(codes);
                    }
                    if(codeInput) codeInput.value = newCode;
                    showCode(newCode);
                }

                showToast('Đã gửi yêu cầu hỗ trợ. Nhân viên sẽ phản hồi sớm.','success');
                if(data.trackingCode){
                    showToast(`Mã hỗ trợ của bạn: ${data.trackingCode}`,'info',{duration:4500});
                }
                if(msgEl) msgEl.value = '';
                await loadHistory();
            }catch(err){
                showToast(`Gửi yêu cầu thất bại: ${err.message || 'Lỗi hệ thống'}`,'error');
            }finally{
                sendBtn.disabled = false;
                sendBtn.textContent = 'Gửi yêu cầu';
            }
        });

        copyCodeBtn && copyCodeBtn.addEventListener('click', async ()=>{
            const code = String(codeText && codeText.textContent || '').trim();
            if(!code) return;
            try{
                if(navigator.clipboard && navigator.clipboard.writeText){
                    await navigator.clipboard.writeText(code);
                }
                showToast('Đã copy mã hỗ trợ.','success');
            }catch(_){
                showToast('Không copy được tự động, bạn hãy sao chép thủ công.','info');
            }
        });

        lookupBtn && lookupBtn.addEventListener('click', async ()=>{
            const code = String(codeInput && codeInput.value || '').trim().toUpperCase();
            if(!code){
                showToast('Vui lòng nhập mã hỗ trợ để tra cứu.','info');
                return;
            }
            const valid = /^HT-[A-Z0-9]{4,10}$/.test(code);
            if(!valid){
                showToast('Mã hỗ trợ chưa đúng định dạng.','error');
                return;
            }
            const codes = readSupportCodes();
            if(!codes.includes(code)){
                codes.unshift(code);
                writeSupportCodes(codes);
            }
            if(historyEl) historyEl.textContent = 'Dang tra cuu ma ho tro...';
            try{
                const res = await fetch(`/api/support-requests/code/${encodeURIComponent(code)}`);
                if(!res.ok){
                    if(res.status === 404){
                        historyEl && (historyEl.textContent = 'Khong tim thay ma ho tro. Vui long kiem tra lai.');
                        return;
                    }
                    throw new Error('Khong ket noi duoc he thong tra cuu');
                }
                const item = await res.json();
                renderHistory(item ? [item] : []);
                showCode(code);
            }catch(err){
                historyEl && (historyEl.textContent = 'Tam thoi khong tai duoc phan hoi. Thu lai sau it phut.');
                showToast(err.message || 'Tra cuu that bai','error');
            }
        });
    }catch(err){
        console.warn('initSupportRequestWidget failed', err);
    }
}

async function applyHeroMediaFromServer(){
    const heroSection = document.querySelector('.hero');
    if(!heroSection) return;
    try{
        const res = await fetch('/api/hero-media');
        if(!res.ok) return;
        const hero = await res.json();
        const src = String(hero && hero.src || '').trim();
        if(!src) return;

        const video = heroSection.querySelector('.hero-video');
        if(hero.type === 'image'){
            if(video) video.style.display = 'none';
            heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,.38), rgba(0,0,0,.38)), url('${src.replace(/'/g, "\\'")}')`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
            return;
        }

        if(video){
            let source = video.querySelector('source');
            if(!source){
                source = document.createElement('source');
                source.type = 'video/mp4';
                video.appendChild(source);
            }
            source.src = src;
            video.style.display = '';
            video.load();
            try{ await video.play(); }catch(_){ }
        }
    }catch(err){
        console.warn('applyHeroMediaFromServer failed', err);
    }
}

// Add to Cart
async function addToCart(productId) {
    await hydrateProductsFromServer();
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
async function buyNow(productId){
    try{
        await hydrateProductsFromServer();
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
    const total = cart.reduce((sum, item) => sum + item.price * (item.qty||1), 0);
    
    console.log('displayCart: items', cart.length);
    if(!cartItems){ console.warn('displayCart: cartItems element not found'); return; }

    cartItems.innerHTML = cart.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
            <span>${item.name} × ${item.qty||1}</span>
            <span>${(item.price*(item.qty||1)).toLocaleString('vi-VN')}đ</span>
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
        initHeaderSearch();
        initSupportRequestWidget();
        applyHeroMediaFromServer();
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

async function addConfiguredToCart(productId, {size='F', qty=1}={}){
    await hydrateProductsFromServer();
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

async function renderProductDetail(){
    const id = getQueryParam('id');
    const root = document.getElementById('productDetailRoot');
    await hydrateProductsFromServer();
    const product = products.find(p => p.id === Number(id));
    if(!root) return;
    if(!product){ root.innerHTML = '<p>Không tìm thấy sản phẩm. <a href="products.html">Quay lại danh sách</a></p>'; return; }
    const now = product.price;
    const old = Math.round(now * 1.2);
    const off = Math.round((1 - now/old) * 100);
    const heroImg = (product.image && String(product.image).trim()) ? product.image : getImageForProduct(product.name||'', String(product.category||'').toLowerCase());
    const thumbs = [heroImg, heroImg, heroImg];
    const cross = getCrossSellProducts(product, 4);
    root.innerHTML = `
        <div class="pd-gallery">
            <img id="pdHero" class="pd-hero" src="${heroImg}" alt="${product.name}" onerror="if(!this.dataset.swap){this.dataset.swap='1';this.src='${heroImg}';}else{this.onerror=null;this.src='${PLACEHOLDER_IMG}';}">
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
        <div class="pd-recommend">
            <div class="pd-recommend-title">Sản phẩm phối cùng</div>
            <div class="pd-recommend-grid">
                ${cross.map(p=>{
                    const img = (p.image && String(p.image).trim()) ? p.image : getImageForProduct(p.name||'', String(p.category||'').toLowerCase());
                    return `
                        <div class="pd-reco-card" data-id="${p.id}">
                            <a href="product.html?id=${p.id}"><img src="${img}" alt="${p.name}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'"></a>
                            <div class="pd-reco-info">
                                <div class="pd-reco-name">${p.name}</div>
                                <div class="pd-reco-price">${Number(p.price||0).toLocaleString('vi-VN')}đ</div>
                                <button class="pd-reco-add" data-id="${p.id}">Thêm vào giỏ</button>
                            </div>
                        </div>
                    `;
                }).join('')}
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

    // cross-sell add to cart buttons
    try{
        root.querySelectorAll('.pd-reco-add').forEach(btn => {
            btn.addEventListener('click', async ()=>{
                const pid = Number(btn.dataset.id||0);
                if(pid) await addToCart(pid);
            });
        });
    }catch(_){ /* ignore */ }
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
    applyPromoBtn.addEventListener('click', async () => {
        const code = (promoInput.value||'').trim().toUpperCase();
        const subtotal = cart.reduce((s, it) => s + it.price * (it.qty||1), 0);
        let discount = 0;
        let shippingFee = 30000;
        if(!code){ showToast('Nhập mã giảm giá trước khi áp dụng.','info'); return; }

        let applied = false;
        // Try server-side validation first
        try{
            const resp = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`);
            if(resp.ok){
                const data = await resp.json();
                if(data && data.valid){
                    if(data.type === 'percent'){
                        discount = Math.round(subtotal * (Number(data.value)||0) / 100);
                        showToast(`Áp dụng mã ${data.code}: giảm ${data.value}%`,'success');
                    }else if(data.type === 'amount'){
                        discount = Math.min(subtotal, Number(data.value)||0);
                        showToast(`Áp dụng mã ${data.code}: giảm ${discount.toLocaleString('vi-VN')}đ`,'success');
                    }else if(data.type === 'freeship'){
                        shippingFee = 0;
                        showToast(`Áp dụng mã ${data.code}: Miễn phí vận chuyển`,'success');
                    }
                    applied = true;
                }
            }
        }catch(err){ /* offline/local fallback below */ }

        // Fallback to local rules if not applied via API
        if(!applied){
            if(code === 'SGB10'){
                discount = Math.round(subtotal * 0.10);
                showToast('Áp dụng mã SGB10: giảm 10%','success');
                applied = true;
            } else if(code === 'FREESHIP'){
                discount = 0;
                shippingFee = 0;
                showToast('Áp dụng mã FREESHIP: Miễn phí vận chuyển','success');
                applied = true;
            } else {
                showToast('Mã giảm giá không hợp lệ.','error');
            }
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
        const subtotal = cart.reduce((s, it) => s + it.price * (it.qty||1), 0);
        const shippingFee = document.getElementById('shippingFee')?.textContent ? parseInt(document.getElementById('shippingFee').textContent.replace(/\D/g,'')) : 30000;
        const discountRaw = document.getElementById('discount')?.textContent ? parseInt(document.getElementById('discount').textContent.replace(/\D/g,'')) : 0;
        const discount = Math.abs(discountRaw);
        const total = subtotal + (isNaN(shippingFee)?30000:shippingFee) - (isNaN(discount)?0:discount);

        const orderNumber = Date.now().toString().slice(-6) + Math.floor(Math.random()*90+10).toString();

        let logged = null;
        try{ logged = JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ logged = null; }
        const order = {
            id: `FS${orderNumber}`,
            name: fullName,
            email: logged?.email || '',
            userId: logged?.id || null,
            phone, address, city, district,
            items: cart.slice(),
            subtotal, shippingFee, discount, total, payment,
            createdAt: new Date().toISOString()
        };

        // Try to persist order to server when available
        (async ()=>{
            try{
                const resp = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });
                if(!resp.ok){ console.warn('Server order save failed:', await resp.text()); }
            }catch(err){ console.warn('Skip server order save (offline/local mode):', err); }
        })();

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
                            <button class="btn-secondary" id="viewProfileBtn">Hồ sơ của tôi</button>
                            <button class="btn-accent" id="viewProductsBtn">Xem thêm sản phẩm</button>
                        </div>
                    `;
                    const backBtn = document.getElementById('backHomeBtn');
                    const profileBtn = document.getElementById('viewProfileBtn');
                    const viewBtn = document.getElementById('viewProductsBtn');
                    backBtn && backBtn.addEventListener('click', ()=>{ window.location.href='SGBweb.html'; });
                    profileBtn && profileBtn.addEventListener('click', ()=>{ window.location.href='profile.html'; });
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

// ===== Mobile Orientation Tip =====
(function(){
    try{
        const DISMISS_KEY = 'sgb_orient_tip_dismissed';
        let tip = null;
        function ensureTip(){
            if(tip && document.body.contains(tip)) return tip;
            tip = document.createElement('div');
            tip.className = 'orientation-tip';
            tip.innerHTML = `
                <div class="msg"><i class="fas fa-mobile-alt"></i><span>Vui lòng xoay ngang (landscape) để trải nghiệm tốt hơn.</span></div>
                <div class="actions"><button class="btn-close" type="button">Đã hiểu</button></div>
            `;
            tip.querySelector('.btn-close').addEventListener('click', ()=>{
                tip.style.display='none';
                try{ localStorage.setItem(DISMISS_KEY, '1'); }catch(_){ }
            });
            document.body.appendChild(tip);
            return tip;
        }
        function shouldShow(){
            const dismissed = localStorage.getItem(DISMISS_KEY) === '1';
            const isPortrait = (window.matchMedia && window.matchMedia('(orientation: portrait)').matches) || (window.innerHeight > window.innerWidth);
            return !dismissed && isPortrait && window.innerWidth < 820;
        }
        function update(){
            try{
                const el = ensureTip();
                el.style.display = shouldShow() ? 'flex' : 'none';
            }catch(_){ }
        }
        const mq = window.matchMedia ? window.matchMedia('(orientation: portrait)') : null;
        if(mq){
            if(mq.addEventListener) mq.addEventListener('change', update);
            else if(mq.addListener) mq.addListener(update);
        }
        window.addEventListener('resize', update);
        document.addEventListener('DOMContentLoaded', update);
        // initial
        update();
    }catch(e){ /* ignore */ }
})();

// ===== Global AI Access (Nav item + Floating button) =====
(function(){
    try{
        const isAIPage = /style-advisor\.html$/i.test(window.location.pathname);

        function ensureOffersInNav(){
            try{
                const nav = document.querySelector('.nav-menu') || document.querySelector('nav .menu') || document.querySelector('header nav');
                if(!nav) return;
                if(nav.querySelector('.nav-offers')) return;

                const li = document.createElement('li');
                li.className = 'nav-offers';
                li.innerHTML = `
                    <a href="products.html?q=sale">Ưu đãi <i class="fas fa-chevron-down" aria-hidden="true"></i></a>
                    <div class="offer-dropdown" aria-label="Danh sách ưu đãi">
                        <a href="products.html?q=sơ mi">Sơ Mi Ưu Đãi</a>
                        <a href="products.html?q=polo">Polo Sale Sốc</a>
                        <a href="products.html?q=quần">Quần Giá Tốt</a>
                    </div>
                `;

                const aiItem = Array.from(nav.querySelectorAll('a')).find(a => /style-advisor\.html$/i.test(a.getAttribute('href') || ''));
                if(aiItem && aiItem.parentElement){
                    nav.insertBefore(li, aiItem.parentElement);
                }else{
                    nav.appendChild(li);
                }
            }catch(_){ /* ignore */ }
        }

        function ensureAIInNav(){
            try{
                // Try common nav containers
                const nav = document.querySelector('.nav-menu') || document.querySelector('nav .menu') || document.querySelector('header nav');
                if(!nav) return;
                // Check if a link to style-advisor.html already exists
                const has = nav.querySelector('a[href$="style-advisor.html"]');
                if(has) return;
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = 'style-advisor.html';
                a.textContent = 'Tư vấn phong cách (AI)';
                a.style.fontWeight = '600';
                li.appendChild(a);
                // Prefer UL children if present
                const ul = nav.querySelector('ul');
                if(ul) ul.appendChild(li); else nav.appendChild(li);
            }catch(_){ /* ignore */ }
        }

        function ensureAIFab(){
            if(isAIPage) return; // don't show on AI page itself
            // Avoid duplicate
            if(document.querySelector('.ai-fab')) return;
            const fab = document.createElement('a');
            fab.className = 'ai-fab';
            fab.href = 'style-advisor.html';
            fab.setAttribute('aria-label','Mở Trợ lý phong cách (AI)');
            fab.innerHTML = 'AI';
            fab.style.cssText = [
                'position:fixed','right:18px','bottom:18px','z-index:9999',
                'background:#111','color:#fff','width:44px','height:44px','border-radius:50%',
                'display:flex','align-items:center','justify-content:center','font-weight:700','box-shadow:0 6px 20px rgba(0,0,0,.2)',
                'text-decoration:none','letter-spacing:.5px'
            ].join(';');
            document.body.appendChild(fab);
        }

        function init(){
            ensureOffersInNav();
            ensureAIInNav();
            ensureAIFab();
        }

        if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }catch(_){ /* ignore */ }
})();

// ===== Profile navigation (user icon/name) =====
(function(){
    function getLogged(){
        try{ return JSON.parse(localStorage.getItem('sgb_logged_in')||'null'); }catch(e){ return null; }
    }
    function goProfile(){
        const logged = getLogged();
        if(logged && logged.email){
            window.location.href = 'profile.html';
        }else{
            window.location.href = 'auth.html';
        }
    }
    function init(){
        const btns = [];
        const nameBtn = document.getElementById('userNameBtn');
        if(nameBtn) btns.push(nameBtn);
        document.querySelectorAll('.user-btn').forEach(b=>btns.push(b));
        if(btns.length === 0) return;
        btns.forEach(btn=>{
            btn.addEventListener('click', (e)=>{ e.preventDefault(); goProfile(); });
        });
    }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();