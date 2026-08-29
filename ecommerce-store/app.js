// NovaLuxe Storefront - Product catalog, cart and checkout state

// 24 Curated High-Definition Products Dataset
const PRODUCTS_DATA = [
    {
        id: 'p1',
        name: 'NovaPro ANC Wireless Studio Headphones',
        category: 'tech',
        categoryName: 'Tech & Audio',
        price: 189.99,
        originalPrice: 249.99,
        badge: 'SALE -24%',
        badgeType: 'sale',
        rating: 4.9,
        reviewsCount: 1240,
        inStock: true,
        stockCount: 18,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        thumbnails: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80'
        ],
        colors: ['#1E293B', '#F1F5F9', '#D97706'],
        colorNames: ['Midnight Slate', 'Arctic Silver', 'Desert Gold'],
        sizes: ['Over-Ear Studio'],
        description: 'Immerse in ultra-pure high-fidelity acoustics with custom 40mm beryllium drivers, hybrid active noise cancellation, and 45 hours of continuous wireless playback.',
        features: ['Hybrid Active Noise Cancellation (40dB depth)', '45-Hour Battery with Fast USB-C Charging', 'Multipoint Bluetooth 5.3 Connection', 'Ultra-plush protein memory foam earcups']
    },
    {
        id: 'p2',
        name: 'Apex Ultra AMOLED Smartwatch 2.0',
        category: 'wearables',
        categoryName: 'Smart Wearables',
        price: 149.99,
        originalPrice: 199.99,
        badge: 'BESTSELLER',
        badgeType: 'hot',
        rating: 4.8,
        reviewsCount: 890,
        inStock: true,
        stockCount: 12,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        thumbnails: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
            'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80'
        ],
        colors: ['#0F172A', '#E2E8F0', '#059669'],
        colorNames: ['Obsidian Black', 'Titanium Silver', 'Forest Green'],
        sizes: ['42mm Dial', '46mm Dial'],
        description: 'Engineered for athletes and creators with a vibrant 1.43-inch Always-On AMOLED screen, dual-frequency GPS, heart rate ECG sensor, and 14-day battery reserve.',
        features: ['1.43" Retina AMOLED 1000 Nits Display', 'Advanced SpO2, ECG & Sleep Quality Engine', '5ATM Water & Swim Resistant up to 50m', '100+ Professional Workout Tracking Modes']
    },
    {
        id: 'p3',
        name: 'Minimalist French Terry Cotton Hoodie',
        category: 'apparel',
        categoryName: 'Minimalist Apparel',
        price: 64.99,
        originalPrice: 85.00,
        badge: 'NEW',
        badgeType: 'new',
        rating: 4.7,
        reviewsCount: 420,
        inStock: true,
        stockCount: 30,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
        thumbnails: [
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
            'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80'
        ],
        colors: ['#334155', '#E2E8F0', '#7C2D12'],
        colorNames: ['Charcoal Gray', 'Sand Cream', 'Terracotta Rust'],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Crafted from 100% heavyweight 460GSM organic French Terry cotton with dropped shoulders, seamless cuffs, and pre-shrunk luxury tailored fit.',
        features: ['460 GSM Heavyweight Organic French Terry', 'Double-layered structured hood with no drawstrings', 'Ribbed cuffs & hem for shape retention', 'Hypoallergenic and eco-friendly dye']
    },
    {
        id: 'p4',
        name: 'Lumina Smart Ambient RGB Desk Lightbar',
        category: 'home',
        categoryName: 'Home & Living',
        price: 49.99,
        originalPrice: 69.99,
        badge: 'SALE -28%',
        badgeType: 'sale',
        rating: 4.9,
        reviewsCount: 650,
        inStock: true,
        stockCount: 22,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
        thumbnails: [
            'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'
        ],
        colors: ['#1E293B', '#FFFFFF'],
        colorNames: ['Space Gray', 'Pure White'],
        sizes: ['Standard Bar (45cm)'],
        description: 'Reduce screen glare and elevate desk aesthetics with screen-mounted asymmetric optical lighting, 16 million RGB backlighting, and touch wireless dimmer.',
        features: ['Zero-Glare Asymmetric Forward Lighting', '16 Million Dynamic RGB Ambient Backlight', 'Stepless Dimming & Color Temp 2700K-6500K', 'USB-C Powered with Smart Touch Controller']
    },
    {
        id: 'p5',
        name: 'CyberKey 75% Custom Mechanical Keyboard',
        category: 'gaming',
        categoryName: 'Gaming & Setup',
        price: 129.99,
        originalPrice: 169.99,
        badge: 'HOT',
        badgeType: 'hot',
        rating: 4.9,
        reviewsCount: 1540,
        inStock: true,
        stockCount: 8,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
        thumbnails: [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'
        ],
        colors: ['#1E1B4B', '#F8FAFC'],
        colorNames: ['Cyberpunk Violet', 'Retro Chalk'],
        sizes: ['Linear Red Switches', 'Tactile Brown Switches'],
        description: 'Gasket-mounted acoustic typing satisfaction with factory lubed hot-swappable mechanical switches, CNC aluminum volume dial, and Tri-Mode wireless connectivity.',
        features: ['Gasket Mount Structure with 5-Layer Sound Dampening', 'Hot-Swappable 3/5-Pin Switch Sockets', 'Bluetooth 5.1, 2.4GHz Dongle & Type-C Wired', 'South-Facing Per-Key RGB with 22 lighting presets']
    },
    {
        id: 'p6',
        name: 'AeroShield Urban Anti-Theft Daypack 22L',
        category: 'accessories',
        categoryName: 'EDC Accessories',
        price: 79.99,
        originalPrice: 110.00,
        badge: 'POPULAR',
        badgeType: 'hot',
        rating: 4.8,
        reviewsCount: 710,
        inStock: true,
        stockCount: 15,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
        thumbnails: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'
        ],
        colors: ['#0F172A', '#475569'],
        colorNames: ['Stealth Black', 'Gunmetal Gray'],
        sizes: ['22 Liters'],
        description: 'Weatherproof Cordura fabric with hidden security zippers, magnetic quick-access pockets, padded 16-inch laptop chamber, and luggage trolley strap.',
        features: ['Water-Resistant 840D Ballistic Cordura Fabric', 'Suspended Padded Laptop Sleeve (fits up to 16")', 'Hidden Passport & RFID-Blocking Pocket', 'Ergonomic Breathable Airflow Back Panel']
    },
    {
        id: 'p7',
        name: 'NovaBoom 360° Waterproof Bluetooth Speaker',
        category: 'tech',
        categoryName: 'Tech & Audio',
        price: 89.99,
        originalPrice: 119.99,
        badge: 'SALE -25%',
        badgeType: 'sale',
        rating: 4.7,
        reviewsCount: 530,
        inStock: true,
        stockCount: 19,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
        thumbnails: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'],
        colors: ['#0F172A', '#DC2626', '#2563EB'],
        colorNames: ['Night Black', 'Ruby Red', 'Cobalt Blue'],
        sizes: ['30W Output'],
        description: 'Room-filling 360-degree omnidirectional sound with dual passive bass radiators, IPX7 waterproof rating for beach & pool parties, and 20h battery.',
        features: ['IPX7 Submersible Waterproof & Floating Design', '30W High-Output Punchy Bass Acoustic Engine', 'TWS Pairing: Link 2 Speakers for Stereo Sound', 'Built-in Noise-Cancelling Speakerphone Mic']
    },
    {
        id: 'p8',
        name: 'Vortex Precision Ultralight Wireless Mouse',
        category: 'gaming',
        categoryName: 'Gaming & Setup',
        price: 59.99,
        originalPrice: 79.99,
        badge: 'NEW',
        badgeType: 'new',
        rating: 4.8,
        reviewsCount: 390,
        inStock: true,
        stockCount: 25,
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
        thumbnails: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80'],
        colors: ['#0F172A', '#FFFFFF'],
        colorNames: ['Matte Black', 'Ghost White'],
        sizes: ['49 Grams'],
        description: 'Featherlight 49-gram symmetrical ergonomic gaming mouse equipped with 26,000 DPI optical sensor, optical microswitches, and 1000Hz polling rate.',
        features: ['Ultralight 49g Hole-less Structural Shell', 'PAW3395 Flagship 26K DPI Optical Sensor', '100 Million Click Optical Micro Switches', '100% Virgin PTFE Glides for Frictionless Swipes']
    },
    {
        id: 'p9',
        name: 'Sculpted Ceramic Pour-Over Coffee Dripper',
        category: 'home',
        categoryName: 'Home & Living',
        price: 34.99,
        originalPrice: 45.00,
        badge: 'POPULAR',
        badgeType: 'hot',
        rating: 4.9,
        reviewsCount: 310,
        inStock: true,
        stockCount: 14,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
        thumbnails: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'],
        colors: ['#F5F5F4', '#44403C'],
        colorNames: ['Sand Glaze', 'Basalt Charcoal'],
        sizes: ['1-2 Cups Capacity'],
        description: 'Artisan handcrafted ribbed ceramic dripper engineered for optimal extraction rate and temperature stability during single-origin specialty brewing.',
        features: ['Thermal-retentive Japanese Mino porcelain', 'Spiral interior extraction channels', 'Includes solid walnut base stand', 'Dishwasher and food-grade certified safe']
    },
    {
        id: 'p10',
        name: 'MagFlow 3-in-1 Foldable Wireless Charging Station',
        category: 'accessories',
        categoryName: 'EDC Accessories',
        price: 44.99,
        originalPrice: 59.99,
        badge: 'SALE -25%',
        badgeType: 'sale',
        rating: 4.7,
        reviewsCount: 680,
        inStock: true,
        stockCount: 20,
        image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80',
        thumbnails: ['https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80'],
        colors: ['#0F172A', '#F8FAFC'],
        colorNames: ['Midnight', 'Starlight'],
        sizes: ['Foldable Travel Kit'],
        description: 'Fast charge Phone, Watch, and Wireless Earbuds simultaneously with strong neodymium magnetic alignment and compact travel folding hinge.',
        features: ['15W MagSafe Fast Wireless Qi-2 Standard', 'Charges Phone, Smartwatch & Earbuds all at once', 'Foldable 180° into pocket-sized travel puck', 'Includes 30W GaN Wall Adapter & Braided Cord']
    },
    {
        id: 'p11',
        name: 'Minimalist Titanium Slim Cardholder Wallet',
        category: 'accessories',
        categoryName: 'EDC Accessories',
        price: 39.99,
        originalPrice: 55.00,
        badge: 'BESTSELLER',
        badgeType: 'hot',
        rating: 4.9,
        reviewsCount: 920,
        inStock: true,
        stockCount: 16,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
        thumbnails: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
        colors: ['#334155', '#B45309'],
        colorNames: ['Gunmetal Titanium', 'Burnt Bronze'],
        sizes: ['Holds 1-12 Cards'],
        description: 'Aerospace Grade 5 Titanium plates with integrated cash strap and full RFID blocking to protect credit cards from electronic skimming.',
        features: ['RFID/NFC Wireless Theft Protection', 'Holds 1 to 12 cards without stretching', 'Integrated spring steel cash bill clip', 'Lifetime warranty on metal chassis']
    },
    {
        id: 'p12',
        name: 'EchoBuds Pro Noise-Cancelling Earbuds',
        category: 'tech',
        categoryName: 'Tech & Audio',
        price: 99.99,
        originalPrice: 139.99,
        badge: 'SALE -28%',
        badgeType: 'sale',
        rating: 4.8,
        reviewsCount: 810,
        inStock: true,
        stockCount: 28,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        thumbnails: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'],
        colors: ['#0F172A', '#F8FAFC'],
        colorNames: ['Piano Black', 'Ivory Pearl'],
        sizes: ['Includes 4 Eartip Sizes'],
        description: 'Ultra-compact in-ear acoustic masters with 11mm graphene drivers, transparent ambient mode, 6-mic crystal calls, and wireless charging case.',
        features: ['Adaptive Active Noise Cancellation with Transparency', '32 Hours Total Playback with Wireless Case', 'IPX5 Sweat & Rain Resistance', 'Bluetooth 5.3 with Low-Latency Gaming Mode']
    }
];

// Main store controller and event handling

class NovaStoreApp {
    constructor() {
        this.products = PRODUCTS_DATA;
        this.filteredProducts = [...PRODUCTS_DATA];
        
        // Persisted State
        this.cart = this.loadState('novaluxe_cart', []);
        this.wishlist = this.loadState('novaluxe_wishlist', []);
        this.orders = this.loadState('novaluxe_orders', []);
        this.currency = this.loadState('novaluxe_currency', 'USD'); // 'USD' or 'INR'
        this.theme = this.loadState('novaluxe_theme', 'light');
        
        // Active Filters
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.maxPrice = 500;
        this.sortBy = 'featured';
        
        // Coupon Code State
        this.appliedCoupon = null; // { code: 'NOVA25', discountPercent: 25, freeShip: false }
        
        // Currency Conversion Rate (1 USD = 83.5 INR)
        this.usdToInr = 83.5;
        this.freeShippingThresholdUSD = 75.00;

        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.renderCatalog();
        this.renderCart();
        this.updateWishlistBadge();
        this.updateOrdersBadge();
        this.bindEvents();
        this.startCountdown();
    }

    loadState(key, fallback) {
        try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : fallback;
        } catch(e) {
            return fallback;
        }
    }

    saveState(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch(e) {}
    }

    formatPrice(amountUSD) {
        if (this.currency === 'INR') {
            const inr = Math.round(amountUSD * this.usdToInr);
            return '₹' + inr.toLocaleString('en-IN');
        }
        return '$' + amountUSD.toFixed(2);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.getElementById('theme-icon');
        if (icon) icon.innerText = theme === 'dark' ? '☀️' : '🌙';
        this.theme = theme;
        this.saveState('novaluxe_theme', theme);
    }

    showToast(message, icon = '🛍️') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.2s ease';
            setTimeout(() => toast.remove(), 200);
        }, 2600);
    }

    // ------------------------------------------------------------------------
    // CATALOG FILTERING & RENDERING
    // ------------------------------------------------------------------------

    applyFilters() {
        let result = [...this.products];

        // 1. Category
        if (this.selectedCategory !== 'all') {
            result = result.filter(p => p.category === this.selectedCategory);
        }

        // 2. Search
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase().trim();
            result = result.filter(p => 
                p.name.toLowerCase().includes(q) || 
                p.description.toLowerCase().includes(q) ||
                p.categoryName.toLowerCase().includes(q)
            );
        }

        // 3. Price Slider
        result = result.filter(p => p.price <= this.maxPrice);

        // 4. Sorting
        if (this.sortBy === 'price-asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (this.sortBy === 'price-desc') {
            result.sort((a, b) => b.price - a.price);
        } else if (this.sortBy === 'rating-desc') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (this.sortBy === 'name-asc') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.filteredProducts = result;
        this.renderCatalog();
    }

    renderCatalog() {
        const grid = document.getElementById('products-grid');
        const emptyState = document.getElementById('empty-state');
        const countBadge = document.getElementById('results-count-badge');
        if (!grid) return;

        if (countBadge) {
            countBadge.innerText = `Showing ${this.filteredProducts.length} of ${this.products.length} Products`;
        }

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = this.filteredProducts.map(product => {
            const isFav = this.wishlist.includes(product.id);
            return `
                <div class="product-card" data-product-id="${product.id}">
                    <div class="card-img-wrap" onclick="window.novaApp.openProductModal('${product.id}')">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <span class="product-badge-tag badge-${product.badgeType}">${product.badge}</span>
                        
                        <div class="card-action-btn-group" onclick="event.stopPropagation()">
                            <button type="button" class="quick-action-btn ${isFav ? 'favorited' : ''}" onclick="window.novaApp.toggleWishlist('${product.id}')" title="Save to Wishlist">
                                ${isFav ? '❤️' : '🤍'}
                            </button>
                            <button type="button" class="quick-action-btn" onclick="window.novaApp.openProductModal('${product.id}')" title="Quick View">
                                👁️
                            </button>
                        </div>
                    </div>

                    <div class="card-body">
                        <span class="card-cat">${product.categoryName}</span>
                        <h3 class="card-title" onclick="window.novaApp.openProductModal('${product.id}')">${product.name}</h3>
                        
                        <div class="card-rating">
                            <span class="stars">⭐⭐⭐⭐⭐</span>
                            <span>${product.rating} (${product.reviewsCount})</span>
                        </div>

                        <div class="card-footer">
                            <div class="price-box">
                                <span class="current-price">${this.formatPrice(product.price)}</span>
                                ${product.originalPrice ? `<span class="orig-price">${this.formatPrice(product.originalPrice)}</span>` : ''}
                            </div>
                            <button type="button" class="btn-add-cart-sm" onclick="window.novaApp.addToCart('${product.id}', 1)">
                                + Add
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ------------------------------------------------------------------------
    // CART OPERATIONS
    // ------------------------------------------------------------------------

    addToCart(productId, qty = 1, selectedColor = null, selectedSize = null) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const color = selectedColor || product.colorNames[0];
        const size = selectedSize || product.sizes[0];
        const variantKey = `${productId}_${color}_${size}`;

        const existingItem = this.cart.find(item => item.variantKey === variantKey);

        if (existingItem) {
            existingItem.qty += qty;
        } else {
            this.cart.push({
                variantKey,
                id: product.id,
                name: product.name,
                price: product.price,
                color,
                size,
                qty,
                image: product.image
            });
        }

        this.saveState('novaluxe_cart', this.cart);
        this.renderCart();
        this.showToast(`Added ${qty}x "${product.name}" to cart!`, '🛒');
    }

    updateCartQty(variantKey, delta) {
        const item = this.cart.find(i => i.variantKey === variantKey);
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) {
            this.cart = this.cart.filter(i => i.variantKey !== variantKey);
        }

        this.saveState('novaluxe_cart', this.cart);
        this.renderCart();
    }

    removeFromCart(variantKey) {
        this.cart = this.cart.filter(i => i.variantKey !== variantKey);
        this.saveState('novaluxe_cart', this.cart);
        this.renderCart();
        this.showToast('Item removed from cart', '🗑️');
    }

    clearCart() {
        this.cart = [];
        this.appliedCoupon = null;
        this.saveState('novaluxe_cart', this.cart);
        this.renderCart();
        this.showToast('Cart cleared', '🧹');
    }

    calculateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        let discount = 0;
        if (this.appliedCoupon) {
            discount = subtotal * (this.appliedCoupon.discountPercent / 100);
        }

        const isFreeShip = this.appliedCoupon?.freeShip || subtotal >= this.freeShippingThresholdUSD || subtotal === 0;
        const shipping = isFreeShip ? 0 : 9.99;
        const tax = (subtotal - discount) * 0.08;
        const grandTotal = Math.max(0, subtotal - discount + shipping + tax);

        return { subtotal, discount, shipping, tax, grandTotal, isFreeShip };
    }

    renderCart() {
        const count = this.cart.reduce((sum, item) => sum + item.qty, 0);
        
        // Update Badges
        const cartBadge = document.getElementById('cart-badge');
        const itemsCount = document.getElementById('cart-items-count');
        if (cartBadge) cartBadge.innerText = count;
        if (itemsCount) itemsCount.innerText = count;

        const container = document.getElementById('cart-drawer-items');
        const footer = document.getElementById('cart-drawer-footer');
        const progressMsg = document.getElementById('shipping-progress-msg');
        const progressBar = document.getElementById('shipping-progress-bar');
        if (!container) return;

        const { subtotal, discount, shipping, tax, grandTotal, isFreeShip } = this.calculateCartTotals();

        // Update Shipping Tracker Bar
        if (progressBar && progressMsg) {
            const percent = Math.min(100, Math.round((subtotal / this.freeShippingThresholdUSD) * 100));
            progressBar.style.width = `${percent}%`;
            
            if (subtotal >= this.freeShippingThresholdUSD || this.appliedCoupon?.freeShip) {
                progressMsg.innerHTML = '🎉 <strong>FREE Express Shipping</strong> unlocked!';
            } else {
                const diff = this.freeShippingThresholdUSD - subtotal;
                progressMsg.innerHTML = `Add <strong>${this.formatPrice(diff)}</strong> more for <strong>FREE Express Shipping!</strong>`;
            }
        }

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="border:none; padding: 2.5rem 1rem;">
                    <div class="empty-icon">🛒</div>
                    <h4>Your Cart is Empty</h4>
                    <p style="font-size:0.85rem;">Discover our latest tech and lifestyle arrivals to get started.</p>
                </div>
            `;
            if (footer) footer.style.display = 'none';
            return;
        }

        if (footer) footer.style.display = 'block';

        // Render Cart Items
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item-card">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-variant">${item.color} • ${item.size}</div>
                    <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
                    <button type="button" class="btn-remove-item" onclick="window.novaApp.removeFromCart('${item.variantKey}')" title="Delete">🗑️</button>
                    <div class="cart-qty-ctrls">
                        <button type="button" onclick="window.novaApp.updateCartQty('${item.variantKey}', -1)">-</button>
                        <span>${item.qty}</span>
                        <button type="button" onclick="window.novaApp.updateCartQty('${item.variantKey}', 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Update Summary Figures
        const subtotalEl = document.getElementById('cart-subtotal');
        const discountRow = document.getElementById('cart-discount-row');
        const discountAmount = document.getElementById('cart-discount-amount');
        const couponName = document.getElementById('applied-coupon-name');
        const shippingEl = document.getElementById('cart-shipping');
        const taxEl = document.getElementById('cart-tax');
        const totalEl = document.getElementById('cart-total');

        if (subtotalEl) subtotalEl.innerText = this.formatPrice(subtotal);
        if (shippingEl) shippingEl.innerText = shipping === 0 ? 'FREE' : this.formatPrice(shipping);
        if (taxEl) taxEl.innerText = this.formatPrice(tax);
        if (totalEl) totalEl.innerText = this.formatPrice(grandTotal);

        if (discount > 0 && discountRow) {
            discountRow.style.display = 'flex';
            if (discountAmount) discountAmount.innerText = '-' + this.formatPrice(discount);
            if (couponName) couponName.innerText = this.appliedCoupon.code;
        } else if (discountRow) {
            discountRow.style.display = 'none';
        }
    }

    applyCoupon(code) {
        const clean = code.toUpperCase().trim();
        const msgBox = document.getElementById('coupon-status-msg');

        if (clean === 'NOVA25') {
            this.appliedCoupon = { code: 'NOVA25', discountPercent: 25, freeShip: false };
            if (msgBox) {
                msgBox.className = 'coupon-status-msg coupon-success';
                msgBox.innerText = '✅ Coupon NOVA25 Applied (25% OFF)!';
            }
            this.showToast('25% Discount Applied!', '🎉');
        } else if (clean === 'WELCOME10') {
            this.appliedCoupon = { code: 'WELCOME10', discountPercent: 10, freeShip: false };
            if (msgBox) {
                msgBox.className = 'coupon-status-msg coupon-success';
                msgBox.innerText = '✅ Coupon WELCOME10 Applied (10% OFF)!';
            }
            this.showToast('10% Welcome Discount Applied!', '🎉');
        } else if (clean === 'FREESHIP') {
            this.appliedCoupon = { code: 'FREESHIP', discountPercent: 0, freeShip: true };
            if (msgBox) {
                msgBox.className = 'coupon-status-msg coupon-success';
                msgBox.innerText = '✅ Coupon FREESHIP Applied (Free Shipping)!';
            }
            this.showToast('Free Shipping Unlocked!', '🚀');
        } else {
            if (msgBox) {
                msgBox.className = 'coupon-status-msg coupon-error';
                msgBox.innerText = '❌ Invalid or expired coupon code. Try NOVA25';
            }
            return;
        }

        this.renderCart();
    }

    // ------------------------------------------------------------------------
    // WISHLIST OPERATIONS
    // ------------------------------------------------------------------------

    toggleWishlist(productId) {
        if (this.wishlist.includes(productId)) {
            this.wishlist = this.wishlist.filter(id => id !== productId);
            this.showToast('Removed from Wishlist', '🤍');
        } else {
            this.wishlist.push(productId);
            this.showToast('Saved to Wishlist ❤️', '❤️');
        }
        this.saveState('novaluxe_wishlist', this.wishlist);
        this.updateWishlistBadge();
        this.renderCatalog();
        this.renderWishlistModal();
    }

    updateWishlistBadge() {
        const badge = document.getElementById('wishlist-badge');
        if (badge) badge.innerText = this.wishlist.length;
    }

    renderWishlistModal() {
        const grid = document.getElementById('wishlist-items-grid');
        if (!grid) return;

        const favProducts = this.products.filter(p => this.wishlist.includes(p.id));

        if (favProducts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="border:none; grid-column: 1 / -1;">
                    <div class="empty-icon">❤️</div>
                    <h4>Your Wishlist is Empty</h4>
                    <p style="font-size:0.85rem;">Click the heart icon on any product to save it here for later.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = favProducts.map(p => `
            <div class="product-card" style="box-shadow:none;">
                <div class="card-img-wrap" style="height:180px;">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="card-body">
                    <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:0.4rem;">${p.name}</h4>
                    <div class="current-price" style="font-size:1rem; margin-bottom:0.75rem;">${this.formatPrice(p.price)}</div>
                    <div style="display:flex; gap:0.4rem;">
                        <button type="button" class="btn btn-primary btn-add-cart-sm" style="flex:1;" onclick="window.novaApp.addToCart('${p.id}', 1)">+ Cart</button>
                        <button type="button" class="btn btn-secondary btn-add-cart-sm" onclick="window.novaApp.toggleWishlist('${p.id}')">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ------------------------------------------------------------------------
    // PRODUCT DETAIL & QUICK VIEW MODAL
    // ------------------------------------------------------------------------

    openProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const backdrop = document.getElementById('product-modal-backdrop');
        const img = document.getElementById('modal-product-img');
        const tag = document.getElementById('modal-badge-tag');
        const cat = document.getElementById('modal-cat-tag');
        const title = document.getElementById('modal-product-title');
        const ratingStars = document.getElementById('modal-rating-stars');
        const ratingText = document.getElementById('modal-rating-text');
        const price = document.getElementById('modal-price');
        const origPrice = document.getElementById('modal-orig-price');
        const desc = document.getElementById('modal-desc');
        const thumbRow = document.getElementById('modal-thumbnails-row');
        const colorSwatches = document.getElementById('modal-color-swatches');
        const colorLabel = document.getElementById('selected-color-label');
        const sizeButtons = document.getElementById('modal-size-buttons');
        const sizeLabel = document.getElementById('selected-size-label');
        const featuresList = document.getElementById('modal-features-list');
        const qtyInput = document.getElementById('modal-qty-input');
        const addBtn = document.getElementById('btn-modal-add-cart');

        if (img) img.src = product.image;
        if (tag) tag.innerText = product.badge;
        if (cat) cat.innerText = product.categoryName;
        if (title) title.innerText = product.name;
        if (ratingStars) ratingStars.innerText = '⭐'.repeat(Math.round(product.rating));
        if (ratingText) ratingText.innerText = `${product.rating} (${product.reviewsCount} customer reviews)`;
        if (price) price.innerText = this.formatPrice(product.price);
        if (origPrice) origPrice.innerText = product.originalPrice ? this.formatPrice(product.originalPrice) : '';
        if (desc) desc.innerText = product.description;
        if (qtyInput) qtyInput.value = '1';

        // Thumbnails
        if (thumbRow) {
            thumbRow.innerHTML = product.thumbnails.map((t, idx) => `
                <img src="${t}" class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="document.getElementById('modal-product-img').src='${t}'; document.querySelectorAll('.modal-thumb').forEach(e=>e.classList.remove('active')); this.classList.add('active');">
            `).join('');
        }

        // Color Swatches
        let currentColor = product.colorNames[0];
        if (colorLabel) colorLabel.innerText = currentColor;
        if (colorSwatches) {
            colorSwatches.innerHTML = product.colors.map((c, idx) => `
                <div class="color-swatch ${idx === 0 ? 'active' : ''}" style="background-color: ${c};" title="${product.colorNames[idx]}" onclick="document.getElementById('selected-color-label').innerText='${product.colorNames[idx]}'; document.querySelectorAll('.color-swatch').forEach(e=>e.classList.remove('active')); this.classList.add('active');"></div>
            `).join('');
        }

        // Sizes
        let currentSize = product.sizes[0];
        if (sizeLabel) sizeLabel.innerText = currentSize;
        if (sizeButtons) {
            sizeButtons.innerHTML = product.sizes.map((s, idx) => `
                <button type="button" class="size-btn ${idx === 0 ? 'active' : ''}" onclick="document.getElementById('selected-size-label').innerText='${s}'; document.querySelectorAll('.size-btn').forEach(e=>e.classList.remove('active')); this.classList.add('active');">${s}</button>
            `).join('');
        }

        // Features List
        if (featuresList) {
            featuresList.innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
        }

        // Hook Add to Cart Button
        if (addBtn) {
            addBtn.onclick = () => {
                const qty = parseInt(document.getElementById('modal-qty-input')?.value) || 1;
                const c = document.getElementById('selected-color-label')?.innerText || product.colorNames[0];
                const s = document.getElementById('selected-size-label')?.innerText || product.sizes[0];
                this.addToCart(product.id, qty, c, s);
                this.closeAllModals();
            };
        }

        if (backdrop) backdrop.classList.add('active');
    }

    // ------------------------------------------------------------------------
    // CHECKOUT & ORDER PIPELINE
    // ------------------------------------------------------------------------

    openCheckoutModal() {
        if (this.cart.length === 0) {
            this.showToast('Your cart is empty!', '⚠️');
            return;
        }

        const backdrop = document.getElementById('checkout-modal-backdrop');
        const miniList = document.getElementById('checkout-mini-list');
        const subtotalEl = document.getElementById('chk-subtotal');
        const discountRow = document.getElementById('chk-discount-row');
        const discountEl = document.getElementById('chk-discount');
        const shippingEl = document.getElementById('chk-shipping');
        const taxEl = document.getElementById('chk-tax');
        const totalEl = document.getElementById('chk-total');

        const { subtotal, discount, shipping, tax, grandTotal } = this.calculateCartTotals();

        if (miniList) {
            miniList.innerHTML = this.cart.map(item => `
                <div class="checkout-mini-item">
                    <span>${item.name} (${item.qty}x)</span>
                    <strong>${this.formatPrice(item.price * item.qty)}</strong>
                </div>
            `).join('');
        }

        if (subtotalEl) subtotalEl.innerText = this.formatPrice(subtotal);
        if (shippingEl) shippingEl.innerText = shipping === 0 ? 'FREE' : this.formatPrice(shipping);
        if (taxEl) taxEl.innerText = this.formatPrice(tax);
        if (totalEl) totalEl.innerText = this.formatPrice(grandTotal);

        if (discount > 0 && discountRow) {
            discountRow.style.display = 'flex';
            if (discountEl) discountEl.innerText = '-' + this.formatPrice(discount);
        } else if (discountRow) {
            discountRow.style.display = 'none';
        }

        this.closeAllModals();
        if (backdrop) backdrop.classList.add('active');
    }

    processOrder(formData) {
        const { subtotal, discount, shipping, tax, grandTotal } = this.calculateCartTotals();
        const orderId = 'NOVA-' + Math.floor(100000 + Math.random() * 900000);
        const orderDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newOrder = {
            id: orderId,
            date: orderDate,
            customer: {
                name: formData.customerName,
                email: formData.customerEmail,
                phone: formData.customerPhone,
                address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`
            },
            items: [...this.cart],
            pricing: { subtotal, discount, shipping, tax, grandTotal },
            status: 'Processing',
            paymentMethod: formData.paymentMethod || 'Credit Card'
        };

        // Save order
        this.orders.unshift(newOrder);
        this.saveState('novaluxe_orders', this.orders);
        this.updateOrdersBadge();

        // Clear cart
        this.cart = [];
        this.appliedCoupon = null;
        this.saveState('novaluxe_cart', this.cart);
        this.renderCart();

        // Render Confirmation Modal
        this.renderOrderSuccess(newOrder);
    }

    renderOrderSuccess(order) {
        const backdrop = document.getElementById('order-success-backdrop');
        const idBadge = document.getElementById('success-order-id');
        const receiptDate = document.getElementById('receipt-date');
        const custDetails = document.getElementById('receipt-customer-details');
        const itemsList = document.getElementById('receipt-items-list');
        const totalsBox = document.getElementById('receipt-totals');

        if (idBadge) idBadge.innerText = `Order ID: #${order.id}`;
        if (receiptDate) receiptDate.innerText = order.date;

        if (custDetails) {
            custDetails.innerHTML = `
                <div><strong>Recipient:</strong> ${order.customer.name} (${order.customer.email})</div>
                <div><strong>Ship To:</strong> ${order.customer.address}</div>
                <div><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()} (Paid)</div>
            `;
        }

        if (itemsList) {
            itemsList.innerHTML = order.items.map(i => `
                <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                    <span>${i.name} (x${i.qty}) - ${i.color}</span>
                    <strong>${this.formatPrice(i.price * i.qty)}</strong>
                </div>
            `).join('');
        }

        if (totalsBox) {
            totalsBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.05rem; padding-top:0.5rem;">
                    <span>Total Amount Paid:</span>
                    <span style="color:var(--primary);">${this.formatPrice(order.pricing.grandTotal)}</span>
                </div>
            `;
        }

        this.closeAllModals();
        if (backdrop) backdrop.classList.add('active');
        this.showToast('Order confirmed successfully!', '🎉');
    }

    updateOrdersBadge() {
        const badge = document.getElementById('orders-badge');
        if (badge) badge.innerText = this.orders.length;
    }

    renderOrdersHistory() {
        const container = document.getElementById('orders-history-list');
        if (!container) return;

        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="border:none;">
                    <div class="empty-icon">📦</div>
                    <h4>No Orders Placed Yet</h4>
                    <p style="font-size:0.85rem;">When you place an order, live tracking updates will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.orders.map(order => `
            <div class="order-history-card">
                <div class="order-history-header">
                    <div>
                        <strong>#${order.id}</strong> • <small style="color:var(--text-muted);">${order.date}</small>
                    </div>
                    <span class="order-status-pill status-${order.status.toLowerCase()}">● ${order.status}</span>
                </div>
                <div style="font-size:0.85rem; margin-bottom:0.75rem;">
                    ${order.items.map(i => `<div>• ${i.name} (x${i.qty})</div>`).join('')}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:0.5rem; font-size:0.88rem;">
                    <span>Deliver to: ${order.customer.name}</span>
                    <strong style="color:var(--primary);">${this.formatPrice(order.pricing.grandTotal)}</strong>
                </div>
            </div>
        `).join('');
    }

    closeAllModals() {
        document.querySelectorAll('.drawer-backdrop, .modal-backdrop').forEach(el => {
            el.classList.remove('active');
        });
    }

    // ------------------------------------------------------------------------
    // COUNTDOWN & EVENT BINDINGS
    // ------------------------------------------------------------------------

    startCountdown() {
        let totalSeconds = 8 * 3600 + 45 * 60 + 30; // 8h 45m 30s
        const hoursEl = document.getElementById('cd-hours');
        const minsEl = document.getElementById('cd-mins');
        const secsEl = document.getElementById('cd-secs');

        setInterval(() => {
            if (totalSeconds > 0) totalSeconds--;
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;

            if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
            if (minsEl) minsEl.innerText = String(m).padStart(2, '0');
            if (secsEl) secsEl.innerText = String(s).padStart(2, '0');
        }, 1000);
    }

    bindEvents() {
        // 1. Currency Toggle
        const currBtn = document.getElementById('currency-toggle-btn');
        const currLabel = document.getElementById('currency-label');
        if (currBtn) {
            currBtn.addEventListener('click', () => {
                this.currency = this.currency === 'USD' ? 'INR' : 'USD';
                this.saveState('novaluxe_currency', this.currency);
                if (currLabel) currLabel.innerText = this.currency === 'USD' ? '$ USD' : '₹ INR';
                this.renderCatalog();
                this.renderCart();
                this.showToast(`Currency changed to ${this.currency}`, '💱');
            });
        }

        // 2. Theme Toggle
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
                this.applyTheme(nextTheme);
                this.showToast(`Switched to ${nextTheme} mode`, nextTheme === 'dark' ? '🌙' : '☀️');
            });
        }

        // 3. Cart Drawer Toggles
        const cartToggle = document.getElementById('cart-toggle-btn');
        const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
        const closeCartBtn = document.getElementById('btn-close-cart');
        if (cartToggle && cartDrawerBackdrop) {
            cartToggle.addEventListener('click', () => {
                cartDrawerBackdrop.classList.add('active');
            });
        }
        if (closeCartBtn && cartDrawerBackdrop) {
            closeCartBtn.addEventListener('click', () => {
                cartDrawerBackdrop.classList.remove('active');
            });
        }
        if (cartDrawerBackdrop) {
            cartDrawerBackdrop.addEventListener('click', (e) => {
                if (e.target === cartDrawerBackdrop) cartDrawerBackdrop.classList.remove('active');
            });
        }

        // 4. Search & Clear Controls
        const searchInput = document.getElementById('global-search-input');
        const clearSearchBtn = document.getElementById('btn-clear-search');
        const searchTriggerBtn = document.getElementById('btn-search-trigger');

        const updateClearBtn = () => {
            if (clearSearchBtn) {
                clearSearchBtn.style.display = searchInput && searchInput.value.trim() ? 'block' : 'none';
            }
        };

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                updateClearBtn();
                this.applyFilters();
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchQuery = searchInput.value;
                    this.applyFilters();
                }
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                this.searchQuery = '';
                updateClearBtn();
                this.applyFilters();
            });
        }

        if (searchTriggerBtn) {
            searchTriggerBtn.addEventListener('click', () => {
                this.searchQuery = searchInput ? searchInput.value : '';
                this.applyFilters();
            });
        }

        // 5. Category Pills
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.selectedCategory = pill.getAttribute('data-filter');
                this.applyFilters();
            });
        });

        // 6. Category Cards (Quick Click)
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const cat = card.getAttribute('data-cat');
                const targetPill = document.querySelector(`.filter-pill[data-filter="${cat}"]`);
                if (targetPill) targetPill.click();
                const catalogEl = document.getElementById('catalog');
                if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // 7. Price Slider
        const priceSlider = document.getElementById('price-range');
        const priceValLabel = document.getElementById('price-slider-val');
        if (priceSlider) {
            priceSlider.addEventListener('input', (e) => {
                this.maxPrice = parseFloat(e.target.value);
                if (priceValLabel) priceValLabel.innerText = this.formatPrice(this.maxPrice);
                this.applyFilters();
            });
        }

        // 8. Sorting Select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // 9. Reset Filters
        const resetBtn = document.getElementById('btn-reset-filters');
        const clearAllBtn = document.getElementById('btn-clear-all-filters');
        const resetAction = () => {
            this.selectedCategory = 'all';
            this.searchQuery = '';
            this.maxPrice = 500;
            this.sortBy = 'featured';
            if (searchInput) searchInput.value = '';
            if (priceSlider) priceSlider.value = '500';
            if (priceValLabel) priceValLabel.innerText = this.formatPrice(500);
            if (sortSelect) sortSelect.value = 'featured';
            document.querySelectorAll('.filter-pill').forEach(p => {
                p.classList.toggle('active', p.getAttribute('data-filter') === 'all');
            });
            updateClearBtn();
            this.applyFilters();
        };

        if (resetBtn) resetBtn.addEventListener('click', resetAction);
        if (clearAllBtn) clearAllBtn.addEventListener('click', resetAction);

        // 10. Coupon Apply Button
        const couponBtn = document.getElementById('btn-apply-coupon');
        const couponInput = document.getElementById('coupon-input');
        if (couponBtn && couponInput) {
            couponBtn.addEventListener('click', () => {
                this.applyCoupon(couponInput.value);
            });
            couponInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyCoupon(couponInput.value);
                }
            });
        }

        // 11. Clear Cart Button
        const clearCartBtn = document.getElementById('btn-clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear your shopping cart?')) {
                    this.clearCart();
                }
            });
        }

        // 12. Checkout Button
        const checkoutProceedBtn = document.getElementById('btn-checkout-proceed');
        if (checkoutProceedBtn) {
            checkoutProceedBtn.addEventListener('click', () => {
                this.openCheckoutModal();
            });
        }

        // 13. Checkout Form Submit
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = {
                    customerName: document.getElementById('chk-name')?.value,
                    customerEmail: document.getElementById('chk-email')?.value,
                    customerPhone: document.getElementById('chk-phone')?.value,
                    street: document.getElementById('chk-street')?.value,
                    city: document.getElementById('chk-city')?.value,
                    state: document.getElementById('chk-state')?.value,
                    zip: document.getElementById('chk-zip')?.value,
                    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value
                };
                this.processOrder(formData);
            });
        }

        // 14. Wishlist Modal Toggles
        const wishlistBtn = document.getElementById('wishlist-toggle-btn');
        const wishlistBackdrop = document.getElementById('wishlist-modal-backdrop');
        const closeWishlistBtn = document.getElementById('btn-close-wishlist-modal');
        const moveAllWishlistBtn = document.getElementById('btn-move-wishlist-all');

        if (wishlistBtn && wishlistBackdrop) {
            wishlistBtn.addEventListener('click', () => {
                this.renderWishlistModal();
                wishlistBackdrop.classList.add('active');
            });
        }
        if (closeWishlistBtn && wishlistBackdrop) {
            closeWishlistBtn.addEventListener('click', () => {
                wishlistBackdrop.classList.remove('active');
            });
        }
        if (moveAllWishlistBtn) {
            moveAllWishlistBtn.addEventListener('click', () => {
                this.wishlist.forEach(id => this.addToCart(id, 1));
                this.wishlist = [];
                this.saveState('novaluxe_wishlist', this.wishlist);
                this.updateWishlistBadge();
                this.renderWishlistModal();
                this.showToast('All favorites moved to cart!', '🛒');
            });
        }

        // 15. Orders Modal Toggles
        const ordersBtn = document.getElementById('orders-toggle-btn');
        const ordersBackdrop = document.getElementById('orders-modal-backdrop');
        const closeOrdersBtn = document.getElementById('btn-close-orders-modal');
        const linkOrders = document.getElementById('link-my-orders');

        const openOrdersAction = () => {
            this.renderOrdersHistory();
            if (ordersBackdrop) ordersBackdrop.classList.add('active');
        };

        if (ordersBtn) ordersBtn.addEventListener('click', openOrdersAction);
        if (linkOrders) linkOrders.addEventListener('click', openOrdersAction);
        if (closeOrdersBtn && ordersBackdrop) {
            closeOrdersBtn.addEventListener('click', () => {
                ordersBackdrop.classList.remove('active');
            });
        }

        // 16. Modal Backdrop Clicks to Close
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) this.closeAllModals();
            });
        });

        // 17. Close Product Modal & Quantity Controls
        const closeProductModalBtn = document.getElementById('btn-close-product-modal');
        if (closeProductModalBtn) {
            closeProductModalBtn.addEventListener('click', () => this.closeAllModals());
        }

        const qtyInc = document.getElementById('btn-modal-qty-inc');
        const qtyDec = document.getElementById('btn-modal-qty-dec');
        const qtyInput = document.getElementById('modal-qty-input');
        if (qtyInc && qtyInput) {
            qtyInc.addEventListener('click', () => {
                qtyInput.value = Math.min(10, parseInt(qtyInput.value || 1) + 1);
            });
        }
        if (qtyDec && qtyInput) {
            qtyDec.addEventListener('click', () => {
                qtyInput.value = Math.max(1, parseInt(qtyInput.value || 1) - 1);
            });
        }

        // 18. Order Success Modal Actions
        const contShopBtn = document.getElementById('btn-continue-shopping');
        const printReceiptBtn = document.getElementById('btn-print-receipt');
        if (contShopBtn) {
            contShopBtn.addEventListener('click', () => this.closeAllModals());
        }
        if (printReceiptBtn) {
            printReceiptBtn.addEventListener('click', () => window.print());
        }

        // 19. Hero Deal Button
        const heroDealBtn = document.getElementById('btn-hero-deal');
        if (heroDealBtn) {
            heroDealBtn.addEventListener('click', () => {
                this.openProductModal('p1');
            });
        }

        // 20. Newsletter Form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showToast('Coupon code NOVA25 unlocked! Check your cart.', '🎉');
                this.applyCoupon('NOVA25');
                newsletterForm.reset();
            });
        }
    }
}

// Global App Instance
document.addEventListener('DOMContentLoaded', () => {
    window.novaApp = new NovaStoreApp();
});
