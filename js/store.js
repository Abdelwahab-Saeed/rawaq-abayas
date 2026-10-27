/* =========================================================
   شَهد — الحالة والتخزين المحلي
   كل القراءة والكتابة محمية بـ try/catch حتى يعمل الموقع
   حتى لو كان التخزين المحلي غير متاح.
   ========================================================= */

const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('shahd.' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('shahd.' + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  },
  session(key, value) {
    try {
      if (value === undefined) return sessionStorage.getItem('shahd.' + key);
      sessionStorage.setItem('shahd.' + key, value);
    } catch (e) { return null; }
  }
};

const Store = {
  cart: Storage.get('cart', []),            // [{ key, id, size, variant, qty }]
  wishlist: Storage.get('wishlist', []),    // [id]
  user: Storage.get('user', null),          // { name, email, phone }
  users: Storage.get('users', []),          // demo accounts
  orders: Storage.get('orders', []),
  reviews: Storage.get('reviews', {}),      // { productId: [review] }
  recent: Storage.get('recent', []),        // [id]
  searches: Storage.get('searches', []),
  addresses: Storage.get('addresses', []),
  coupon: Storage.get('coupon', null),
  listeners: [],

  on(fn) { this.listeners.push(fn); },
  emit(type) { this.listeners.forEach(fn => fn(type)); },

  persist(...keys) { keys.forEach(k => Storage.set(k, this[k])); },

  /* ---------- الأصناف ---------- */
  product(id) { return PRODUCTS.find(p => p.id === Number(id)); },

  /* ---------- السلة ---------- */
  lineKey(id, size, variant) { return [id, size || '', variant || ''].join('|'); },
  addToCart(id, { size, variant, qty = 1 } = {}) {
    const p = this.product(id);
    if (!p) return null;
    size = p.sizes.includes(size) ? size : defaultSize(p);
    variant = p.variants.some(v => v.name === variant) ? variant : p.variants[0].name;
    const key = this.lineKey(id, size, variant);
    const line = this.cart.find(l => l.key === key);
    if (line) line.qty = Math.min(20, line.qty + qty);
    else this.cart.push({ key, id: p.id, size, variant, qty });
    this.persist('cart');
    this.emit('cart');
    return p;
  },
  setQty(key, qty) {
    const line = this.cart.find(l => l.key === key);
    if (!line) return;
    line.qty = Math.max(0, Math.min(20, qty));
    if (line.qty === 0) this.cart = this.cart.filter(l => l !== line);
    this.persist('cart');
    this.emit('cart');
  },
  removeLine(key) {
    this.cart = this.cart.filter(l => l.key !== key);
    this.persist('cart');
    this.emit('cart');
  },
  clearCart() {
    this.cart = [];
    this.coupon = null;
    this.persist('cart', 'coupon');
    this.emit('cart');
  },
  cartCount() { return this.cart.reduce((s, l) => s + l.qty, 0); },
  lineImage(line) {
    const p = this.product(line.id);
    const v = p.variants.find(v => v.name === line.variant) || p.variants[0];
    return v.images[0];
  },
  linePrice(line) {
    const p = this.product(line.id);
    return p ? sizePrice(p, line.size) : 0;
  },
  subtotal() {
    return this.cart.reduce((s, l) => s + this.linePrice(l) * l.qty, 0);
  },
  discount(subtotal = this.subtotal()) {
    const c = this.coupon && COUPONS[this.coupon];
    if (!c || subtotal < c.min) return 0;
    return c.type === 'percent' ? Math.round(subtotal * c.value / 100) : Math.min(c.value, subtotal);
  },
  shippingFee(subtotal = this.subtotal(), zone = 'metro') {
    if (!subtotal) return 0;
    if (subtotal >= FREE_SHIPPING_MIN) return 0;
    return SHIPPING_ZONES[zone].fee;
  },
  applyCoupon(code) {
    code = String(code || '').trim().toUpperCase();
    const c = COUPONS[code];
    if (!c) return { ok: false, msg: 'الكود غير صحيح' };
    if (this.subtotal() < c.min) return { ok: false, msg: `الكود ده للطلبات فوق ${c.min.toLocaleString('en-US')} ج.م` };
    this.coupon = code;
    this.persist('coupon');
    this.emit('cart');
    return { ok: true, msg: c.label };
  },
  removeCoupon() { this.coupon = null; this.persist('coupon'); this.emit('cart'); },

  /* ---------- المفضلة ---------- */
  isWished(id) { return this.wishlist.includes(Number(id)); },
  toggleWish(id) {
    id = Number(id);
    this.wishlist = this.isWished(id) ? this.wishlist.filter(x => x !== id) : [...this.wishlist, id];
    this.persist('wishlist');
    this.emit('wishlist');
    return this.isWished(id);
  },

  /* ---------- آخر ما شاهدته ---------- */
  pushRecent(id) {
    id = Number(id);
    this.recent = [id, ...this.recent.filter(x => x !== id)].slice(0, 8);
    this.persist('recent');
  },
  pushSearch(q) {
    q = q.trim();
    if (!q) return;
    this.searches = [q, ...this.searches.filter(s => s !== q)].slice(0, 5);
    this.persist('searches');
  },

  /* ---------- الحساب (تجريبي محليًا) ---------- */
  register({ name, email, phone, password }) {
    email = email.trim().toLowerCase();
    if (this.users.some(u => u.email === email)) return { ok: false, msg: 'البريد ده مسجّل قبل كده، سجّل دخول' };
    const user = { name: name.trim(), email, phone: phone.trim(), password };
    this.users.push(user);
    this.user = { name: user.name, email, phone: user.phone };
    this.persist('users', 'user');
    this.emit('user');
    return { ok: true };
  },
  login({ email, password }) {
    email = email.trim().toLowerCase();
    const u = this.users.find(x => x.email === email && x.password === password);
    if (!u) return { ok: false, msg: 'البريد أو كلمة المرور غير صحيحة' };
    this.user = { name: u.name, email: u.email, phone: u.phone };
    this.persist('user');
    this.emit('user');
    return { ok: true };
  },
  logout() { this.user = null; this.persist('user'); this.emit('user'); },
  updateProfile(data) {
    this.user = { ...this.user, ...data };
    const u = this.users.find(x => x.email === this.user.email);
    if (u) Object.assign(u, data);
    this.persist('user', 'users');
    this.emit('user');
  },
  saveAddress(addr) {
    const exists = this.addresses.some(a => a.address === addr.address && a.city === addr.city);
    if (!exists) { this.addresses.unshift(addr); this.addresses = this.addresses.slice(0, 4); this.persist('addresses'); }
  },
  removeAddress(i) { this.addresses.splice(i, 1); this.persist('addresses'); },

  /* ---------- الطلبات ---------- */
  placeOrder(info) {
    const subtotal = this.subtotal();
    const discount = this.discount(subtotal);
    const zone = (GOVERNORATES.find(g => g[0] === info.governorate) || [, 'metro'])[1];
    const shipping = this.shippingFee(subtotal, zone);
    const order = {
      id: 'SH-' + String(Date.now()).slice(-5) + Math.floor(Math.random() * 9),
      createdAt: Date.now(),
      items: this.cart.map(l => ({ ...l, name: this.product(l.id).name, price: this.linePrice(l), image: this.lineImage(l) })),
      subtotal, discount, shipping, total: subtotal - discount + shipping,
      coupon: this.coupon, zone, ...info
    };
    this.orders.unshift(order);
    this.persist('orders');
    this.saveAddress({ governorate: info.governorate, city: info.city, address: info.address });
    this.clearCart();
    this.emit('orders');
    return order;
  },
  findOrder(id) { return this.orders.find(o => o.id.toUpperCase() === String(id).trim().toUpperCase()); },
  /* حالة الطلب للعرض: تتقدم خطوة كل دقيقتين (محاكاة) */
  orderStep(order) {
    const minutes = (Date.now() - order.createdAt) / 60000;
    return Math.min(ORDER_STEPS.length - 1, Math.floor(minutes / 2));
  },

  /* ---------- التقييمات ---------- */
  productReviews(id) {
    const own = this.reviews[id] || [];
    const seeded = [0, 1, 2].map(i => SEED_REVIEWS[(id + i * 2) % SEED_REVIEWS.length]);
    return [...own, ...seeded];
  },
  addReview(id, review) {
    this.reviews[id] = [{ ...review, mine: true, date: Date.now() }, ...(this.reviews[id] || [])];
    this.persist('reviews');
  }
};
