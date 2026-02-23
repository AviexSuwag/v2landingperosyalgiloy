// // // // ============================================================
// // // //  GENE'S LECHON — app.js
// // // //  Landing page: products from Firestore, cart, inquiry → saved to Firestore
// // // //
// // // //  ⚠️  FIRESTORE COMPOSITE INDEXES REQUIRED for rate limiting.
// // // //  Go to: Firebase Console → Firestore → Indexes → Composite
// // // //  Add these 3 indexes on the "inquiries" collection:
// // // //
// // // //  1. Fields: email ASC, date ASC    (Collection scope)
// // // //  2. Fields: phone ASC, date ASC    (Collection scope)
// // // //  3. Fields: customer ASC, date ASC (Collection scope)
// // // //
// // // //  Without these, the daily limit check will fail silently.
// // // // ============================================================

// // // import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
// // // import {
// // //   getFirestore, collection, onSnapshot, addDoc,
// // //   query, where, getDocs
// // // } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// // // // ── Firebase config ──────────────────────────────────────────
// // // const firebaseConfig = {
// // //   apiKey:            "AIzaSyBvsn9hLvi4Tq9mLvoo1-YL1uzbB_ntL7s",
// // //   authDomain:        "pos-and-sales-monitoring.firebaseapp.com",
// // //   projectId:         "pos-and-sales-monitoring",
// // //   storageBucket:     "pos-and-sales-monitoring.firebasestorage.app",
// // //   messagingSenderId: "516453934117",
// // //   appId:             "1:516453934117:web:1783067b8aa6b37373cbcc",
// // //   measurementId:     "G-FT1G64DB9N"
// // // };

// // // const app = initializeApp(firebaseConfig);
// // // const db  = getFirestore(app);

// // // // ── State ────────────────────────────────────────────────────
// // // let allProducts    = [];
// // // let activeCategory = 'all';
// // // let cart           = [];

// // // // ============================================================
// // // //  FIREBASE LISTENERS
// // // // ============================================================

// // // // Categories → pulled live from Firestore "categories" collection
// // // onSnapshot(collection(db, "categories"), (snap) => {
// // //   const tabs = document.getElementById('catTabs');
// // //   tabs.innerHTML = `<button class="cat-tab ${activeCategory === 'all' ? 'active' : ''}"
// // //     onclick="filterCat('all', this)">All Products</button>`;

// // //   snap.forEach(d => {
// // //     const name = d.data().name;
// // //     tabs.innerHTML += `<button class="cat-tab ${activeCategory === name ? 'active' : ''}"
// // //       onclick="filterCat('${name}', this)">${name}</button>`;
// // //   });
// // // });

// // // // Products → pulled live from Firestore "products" collection
// // // // Any stock change in admin POS instantly reflects here
// // // onSnapshot(collection(db, "products"), (snap) => {
// // //   allProducts = [];
// // //   snap.forEach(d => {
// // //     const data = d.data();
// // //     const qty  = data.quantity !== undefined ? Number(data.quantity) : Number(data.stock || 0);
// // //     allProducts.push({ id: d.id, ...data, quantity: isNaN(qty) ? 0 : qty });
// // //   });

// // //   const search = document.getElementById('searchInput')?.value || '';
// // //   renderProducts(applyFilters(allProducts, activeCategory, search));
// // //   updateProductCount();
// // // });

// // // // ============================================================
// // // //  FILTERING
// // // // ============================================================

// // // window.filterCat = function (cat, btn) {
// // //   activeCategory = cat;
// // //   document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
// // //   if (btn) btn.classList.add('active');
// // //   renderProducts(applyFilters(allProducts, cat, document.getElementById('searchInput')?.value || ''));
// // // };

// // // window.handleSearch = function (val) {
// // //   renderProducts(applyFilters(allProducts, activeCategory, val));
// // // };

// // // function applyFilters(list, cat, search) {
// // //   return list.filter(p => {
// // //     const matchCat    = cat === 'all' || (p.category || '').toLowerCase() === cat.toLowerCase();
// // //     const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
// // //     return matchCat && matchSearch;
// // //   });
// // // }

// // // function updateProductCount() {
// // //   const el = document.getElementById('productCount');
// // //   if (el) el.textContent = `${allProducts.length} product${allProducts.length !== 1 ? 's' : ''} available`;
// // // }

// // // // ============================================================
// // // //  RENDER PRODUCTS
// // // // ============================================================

// // // window.renderProducts = function (list) {
// // //   const grid = document.getElementById('productsGrid');
// // //   if (!grid) return;
// // //   grid.innerHTML = '';

// // //   if (list.length === 0) {
// // //     grid.innerHTML = `
// // //       <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--grey);">
// // //         <i class="fas fa-search" style="font-size:40px;opacity:0.3;margin-bottom:12px;display:block;"></i>
// // //         <p style="font-weight:700;font-size:16px;">No products found</p>
// // //       </div>`;
// // //     return;
// // //   }

// // //   list.forEach(p => {
// // //     const qty      = Number(p.quantity || p.stock || 0);
// // //     const isOOS    = qty <= 0;
// // //     const price    = parseFloat(p.price || p.cost || 0);
// // //     const imgUrl   = p.imageUrl || p.image || p.img || p.photoURL || '';
// // //     const lowStock = qty > 0 && qty <= 5;

// // //     const card = document.createElement('div');
// // //     card.className = `product-card ${isOOS ? 'oos' : ''}`;
// // //     if (!isOOS) card.onclick = () => window.addToCart(p);

// // //     card.innerHTML = `
// // //       <div class="card-img-placeholder">
// // //         ${imgUrl ? `<img src="${imgUrl}" alt="${p.name}" onerror="this.parentElement.innerHTML='🐷'"/>` : '🐷'}
// // //       </div>
// // //       ${isOOS   ? '<div class="oos-tag">Out of Stock</div>'    : ''}
// // //       ${lowStock ? `<div class="stock-tag">${qty} left!</div>` : ''}
// // //       <div class="card-body">
// // //         <div class="card-name">${p.name}</div>
// // //         <div class="card-unit">${p.unit ? `Per ${p.unit}` : ''} ${!isOOS ? `· ${qty} in stock` : ''}</div>
// // //         <div class="card-footer">
// // //           <span class="card-price">₱${price.toLocaleString()}</span>
// // //           ${!isOOS ? `<button class="btn-add" title="Add to order"><i class="fas fa-plus"></i></button>` : ''}
// // //         </div>
// // //       </div>`;
// // //     grid.appendChild(card);
// // //   });
// // // };

// // // // ============================================================
// // // //  CART
// // // // ============================================================

// // // window.addToCart = function (product) {
// // //   const existing = cart.find(i => i.id === product.id);
// // //   const stock    = Number(product.quantity || product.stock || 0);
// // //   const current  = existing ? existing.qty : 0;

// // //   if (current + 1 > stock) { showToast('Not enough stock!', 'error'); return; }

// // //   if (existing) {
// // //     existing.qty++;
// // //   } else {
// // //     cart.push({
// // //       id:    product.id,
// // //       name:  product.name,
// // //       price: parseFloat(product.price || product.cost || 0),
// // //       qty:   1,
// // //       unit:  product.unit || 'pcs'
// // //     });
// // //   }

// // //   renderCart();
// // //   showToast(`${product.name} added!`, 'success');
// // //   if (!document.getElementById('cartDrawer').classList.contains('open')) animateCartBadge();
// // // };

// // // window.updateCartQty = function (id, delta) {
// // //   const item = cart.find(i => i.id === id);
// // //   if (!item) return;
// // //   item.qty += delta;
// // //   if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
// // //   renderCart();
// // // };

// // // function renderCart() {
// // //   const list    = document.getElementById('cartItemsList');
// // //   const badge   = document.getElementById('cartBadge');
// // //   const totalEl = document.getElementById('cartTotal');
// // //   const btn     = document.getElementById('inquireBtn');

// // //   const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
// // //   const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

// // //   badge.textContent   = totalQty;
// // //   totalEl.textContent = fmt(totalPrice);
// // //   btn.disabled        = cart.length === 0;

// // //   if (cart.length === 0) {
// // //     list.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>No items added yet</p></div>`;
// // //     return;
// // //   }

// // //   list.innerHTML = '';
// // //   cart.forEach(item => {
// // //     const row = document.createElement('div');
// // //     row.className = 'cart-item-row';
// // //     row.innerHTML = `
// // //       <div class="ci-icon">🐷</div>
// // //       <div class="ci-info">
// // //         <div class="ci-name">${item.name}</div>
// // //         <div class="ci-price">${fmt(item.price * item.qty)}</div>
// // //       </div>
// // //       <div class="ci-qty">
// // //         <button onclick="updateCartQty('${item.id}', -1)"><i class="fas fa-minus" style="font-size:10px;"></i></button>
// // //         <span>${item.qty}</span>
// // //         <button onclick="updateCartQty('${item.id}', 1)"><i class="fas fa-plus" style="font-size:10px;"></i></button>
// // //       </div>`;
// // //     list.appendChild(row);
// // //   });
// // // }

// // // // ============================================================
// // // //  CART DRAWER
// // // // ============================================================

// // // window.toggleCart = function () {
// // //   const drawer  = document.getElementById('cartDrawer');
// // //   const overlay = document.getElementById('cartOverlay');
// // //   drawer.classList.toggle('open');
// // //   overlay.classList.toggle('open');
// // //   document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
// // // };

// // // // ============================================================
// // // //  INQUIRY MODAL
// // // // ============================================================

// // // window.openInquiryModal = function () {
// // //   if (cart.length === 0) return;
// // //   renderInquiryForm(cart.reduce((s, i) => s + i.price * i.qty, 0));
// // //   document.getElementById('inquiryModal').classList.add('open');
// // // };

// // // window.closeInquiryModal = function () {
// // //   document.getElementById('inquiryModal').classList.remove('open');
// // // };

// // // function renderInquiryForm(total) {
// // //   const today = new Date().toISOString().split('T')[0];
// // //   document.getElementById('inquiryModalBody').innerHTML = `
// // //     <div class="order-summary">
// // //       <h4>Your Order</h4>
// // //       ${cart.map(i => `
// // //         <div class="os-item">
// // //           <span>${i.qty}× ${i.name}</span>
// // //           <span>${fmt(i.price * i.qty)}</span>
// // //         </div>`).join('')}
// // //       <div class="os-total"><span>Total</span><span>${fmt(total)}</span></div>
// // //     </div>

// // //     <div class="form-row">
// // //       <div class="form-group">
// // //         <label><i class="fas fa-user" style="color:var(--red);margin-right:5px;"></i> Full Name *</label>
// // //         <input type="text" id="inqName" placeholder="Juan dela Cruz"/>
// // //       </div>
// // //       <div class="form-group">
// // //         <label><i class="fas fa-phone" style="color:var(--red);margin-right:5px;"></i> Phone Number *</label>
// // //         <input type="tel" id="inqPhone" placeholder="+63 917 000 0000"/>
// // //       </div>
// // //     </div>

// // //     <div class="form-group">
// // //       <label><i class="fas fa-envelope" style="color:var(--red);margin-right:5px;"></i> Email Address *</label>
// // //       <input type="email" id="inqEmail" placeholder="juan@gmail.com"/>
// // //     </div>

// // //     <div class="form-row">
// // //       <div class="form-group">
// // //         <label><i class="fas fa-calendar" style="color:var(--red);margin-right:5px;"></i> Pickup / Delivery Date *</label>
// // //         <input type="date" id="inqDate" min="${today}"/>
// // //       </div>
// // //       <div class="form-group">
// // //         <label><i class="fas fa-clock" style="color:var(--red);margin-right:5px;"></i> Preferred Time *</label>
// // //         <input type="time" id="inqTime"/>
// // //       </div>
// // //     </div>

// // //     <div class="form-group">
// // //       <label><i class="fas fa-comment-alt" style="color:var(--red);margin-right:5px;"></i> Special Instructions</label>
// // //       <textarea id="inqNotes" rows="3" placeholder="Any special requests, delivery address, event details..."></textarea>
// // //     </div>

// // //     <button class="btn-submit-inquiry" id="submitInquiryBtn" onclick="submitInquiry()">
// // //       <i class="fas fa-paper-plane"></i> Send Inquiry to Gene's Lechon
// // //     </button>`;
// // // }

// // // // ============================================================
// // // //  SUBMIT INQUIRY → FIRESTORE "inquiries" COLLECTION
// // // //  Fields match exactly what inquiries.js admin page reads
// // // // ============================================================

// // // // ── Max 3 inquiries per day per unique identity ──────────────
// // // // Fails gracefully if Firestore indexes are not yet created.
// // // async function checkDailyLimit(name, email, phone) {
// // //   const MAX   = 3;
// // //   const now   = new Date();
// // //   const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
// // //   const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

// // //   try {
// // //     // Single-field range query — no composite index needed
// // //     const snap = await getDocs(
// // //       query(collection(db, "inquiries"),
// // //         where("date", ">=", start),
// // //         where("date", "<=", end)
// // //       )
// // //     );

// // //     // Filter in JS — check if any of the 3 identifiers match
// // //     const emailLow = email.toLowerCase();
// // //     let count = 0;
// // //     snap.forEach(d => {
// // //       const data = d.data();
// // //       if (
// // //         (data.email    || '').toLowerCase() === emailLow ||
// // //         (data.phone    || '')               === phone    ||
// // //         (data.customer || '')               === name
// // //       ) {
// // //         count++;
// // //       }
// // //     });

// // //     return { count, blocked: count >= MAX, remaining: Math.max(0, MAX - count) };

// // //   } catch (err) {
// // //     console.warn('Rate limit check failed, allowing submission:', err.message);
// // //     return { count: 0, blocked: false, remaining: MAX };
// // //   }
// // // }

// // // window.submitInquiry = async function () {
// // //   const name  = document.getElementById('inqName')?.value?.trim();
// // //   const phone = document.getElementById('inqPhone')?.value?.trim();
// // //   const email = document.getElementById('inqEmail')?.value?.trim();
// // //   const date  = document.getElementById('inqDate')?.value;
// // //   const time  = document.getElementById('inqTime')?.value;
// // //   const notes = document.getElementById('inqNotes')?.value?.trim() || '';

// // //   // ── Basic field validation ───────────────────────────────
// // //   if (!name || !phone || !email || !date || !time) {
// // //     showToast('Please fill in all required fields!', 'error'); return;
// // //   }
// // //   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
// // //     showToast('Please enter a valid email address!', 'error'); return;
// // //   }

// // //   const btn = document.getElementById('submitInquiryBtn');
// // //   btn.disabled  = true;
// // //   btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

// // //   try {
// // //     // ── Rate limit check: max 3 inquiries per day ────────────
// // //     const limit = await checkDailyLimit(name, email, phone);

// // //     if (limit.blocked) {
// // //       showToast('You have reached the maximum of 3 inquiries per day. Please try again tomorrow or call us directly.', 'error');
// // //       btn.disabled  = false;
// // //       btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
// // //       // Show a more prominent warning inside the form
// // //       showLimitWarning();
// // //       return;
// // //     }

// // //     btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

// // //     const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

// // //     // ── Build document — email stored lowercase for consistent matching
// // //     const inquiryDoc = {
// // //       orderId:   `#INQ-${Math.floor(100000 + Math.random() * 900000)}`,
// // //       customer:  name,
// // //       email:     email.toLowerCase(),
// // //       phone:     phone,
// // //       date:      new Date().toISOString(),
// // //       orderDate: date,
// // //       orderTime: time,
// // //       items:     cart.map(i => ({
// // //         id:    i.id,
// // //         name:  i.name,
// // //         price: i.price,
// // //         qty:   i.qty,
// // //         unit:  i.unit || 'pcs'
// // //       })),
// // //       total:     total,
// // //       notes:     notes,
// // //       status:    'pending',
// // //       source:    'landing_page'
// // //     };

// // //     // ── Save to Firestore ────────────────────────────────────
// // //     await addDoc(collection(db, "inquiries"), inquiryDoc);

// // //     cart = [];
// // //     renderCart();

// // //     // Show remaining count if they still have submissions left
// // //     const usedAfter = limit.count + 1;
// // //     const leftAfter = 3 - usedAfter;
// // //     showSuccessState(name, inquiryDoc.orderId, leftAfter);

// // //   } catch (err) {
// // //     console.error("Inquiry submission failed:", err);
// // //     showToast('Failed to submit. Please try again or call us directly.', 'error');
// // //     btn.disabled  = false;
// // //     btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
// // //   }
// // // };

// // // function showLimitWarning() {
// // //   // Insert a warning box above the submit button if not already shown
// // //   const existing = document.getElementById('limitWarningBox');
// // //   if (existing) return;
// // //   const btn = document.getElementById('submitInquiryBtn');
// // //   if (!btn) return;
// // //   const box = document.createElement('div');
// // //   box.id = 'limitWarningBox';
// // //   box.style.cssText = `
// // //     background:#fff0e6; border:2px solid var(--red); border-radius:10px;
// // //     padding:12px 16px; margin-bottom:14px; font-size:13px; font-weight:600;
// // //     color:var(--red); display:flex; align-items:flex-start; gap:10px;
// // //   `;
// // //   box.innerHTML = `
// // //     <i class="fas fa-exclamation-triangle" style="margin-top:1px;flex-shrink:0;"></i>
// // //     <div>
// // //       <strong>Daily limit reached.</strong><br/>
// // //       You can submit a maximum of <strong>3 inquiries per day</strong>
// // //       using the same name, email, or phone number.<br/>
// // //       Please try again tomorrow or call us at <strong>(088) 123-4567</strong>.
// // //     </div>`;
// // //   btn.parentNode.insertBefore(box, btn);
// // // }

// // // function showSuccessState(name, orderId, remaining) {
// // //   const remainingMsg = remaining > 0
// // //     ? `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
// // //         You can submit <strong>${remaining} more ${remaining === 1 ? 'inquiry' : 'inquiries'}</strong> today.
// // //        </p>`
// // //     : `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
// // //         You've used all 3 inquiries for today. Need more help? Call us at <strong>(088) 123-4567</strong>.
// // //        </p>`;

// // //   document.getElementById('inquiryModalBody').innerHTML = `
// // //     <div class="success-state">
// // //       <div class="check-circle">✅</div>
// // //       <h3>Inquiry Submitted!</h3>
// // //       <p>Hi <strong>${name}</strong>! Your inquiry <strong>${orderId}</strong> has been received.</p>
// // //       <p style="margin-top:8px;color:var(--grey);font-size:13px;">
// // //         Our team will reach out via your email or phone shortly.
// // //         Thank you for choosing Gene's Lechon! 🐷
// // //       </p>
// // //       ${remainingMsg}
// // //       <button class="btn-done" onclick="closeInquiryModal()">Done</button>
// // //     </div>`;
// // // }

// // // // ============================================================
// // // //  MOBILE MENU
// // // // ============================================================

// // // window.toggleMobileMenu = function () {
// // //   const menu = document.getElementById('mobileMenu');
// // //   menu.classList.toggle('open');
// // //   document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
// // // };

// // // // ============================================================
// // // //  UTILITIES
// // // // ============================================================

// // // function fmt(n) {
// // //   return '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
// // // }

// // // function animateCartBadge() {
// // //   const badge = document.getElementById('cartBadge');
// // //   badge.style.transform  = 'scale(1.6)';
// // //   badge.style.transition = 'transform 0.2s';
// // //   setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
// // // }

// // // window.showToast = function (msg, type) {
// // //   let container = document.getElementById('toastContainer');
// // //   if (!container) {
// // //     container = document.createElement('div');
// // //     container.id = 'toastContainer';
// // //     document.body.appendChild(container);
// // //   }
// // //   const toast = document.createElement('div');
// // //   toast.className = `toast-item ${type}`;
// // //   toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
// // //   container.appendChild(toast);
// // //   setTimeout(() => toast.remove(), 3000);
// // // };

// // // // Init — skeleton cards show until Firebase loads real products
// // // window.renderProducts([]);








// // // ============================================================
// // //  GENE'S LECHON — app.js
// // //  Landing page: products from Firestore, cart, inquiry → saved to Firestore
// // //
// // //  ⚠️  FIRESTORE COMPOSITE INDEXES REQUIRED for rate limiting.
// // //  Go to: Firebase Console → Firestore → Indexes → Composite
// // //  Add these 3 indexes on the "inquiries" collection:
// // //
// // //  1. Fields: email ASC, date ASC    (Collection scope)
// // //  2. Fields: phone ASC, date ASC    (Collection scope)
// // //  3. Fields: customer ASC, date ASC (Collection scope)
// // //
// // //  Without these, the daily limit check will fail silently.
// // // ============================================================

// // import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
// // import {
// //   getFirestore, collection, onSnapshot, addDoc,
// //   query, where, getDocs
// // } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// // // ── Firebase config ──────────────────────────────────────────
// // const firebaseConfig = {
// //   apiKey:            "AIzaSyBvsn9hLvi4Tq9mLvoo1-YL1uzbB_ntL7s",
// //   authDomain:        "pos-and-sales-monitoring.firebaseapp.com",
// //   projectId:         "pos-and-sales-monitoring",
// //   storageBucket:     "pos-and-sales-monitoring.firebasestorage.app",
// //   messagingSenderId: "516453934117",
// //   appId:             "1:516453934117:web:1783067b8aa6b37373cbcc",
// //   measurementId:     "G-FT1G64DB9N"
// // };

// // const app = initializeApp(firebaseConfig);
// // const db  = getFirestore(app);

// // // ── State ────────────────────────────────────────────────────
// // let allProducts    = [];
// // let activeCategory = 'all';
// // let cart           = [];

// // // ============================================================
// // //  FIREBASE LISTENERS
// // // ============================================================

// // // Categories → pulled live from Firestore "categories" collection
// // onSnapshot(collection(db, "categories"), (snap) => {
// //   const tabs = document.getElementById('catTabs');
// //   tabs.innerHTML = `<button class="cat-tab ${activeCategory === 'all' ? 'active' : ''}"
// //     onclick="filterCat('all', this)">All Products</button>`;

// //   snap.forEach(d => {
// //     const name = d.data().name;
// //     tabs.innerHTML += `<button class="cat-tab ${activeCategory === name ? 'active' : ''}"
// //       onclick="filterCat('${name}', this)">${name}</button>`;
// //   });
// // });

// // // Products → pulled live from Firestore "products" collection
// // // Any stock change in admin POS instantly reflects here
// // onSnapshot(collection(db, "products"), (snap) => {
// //   allProducts = [];
// //   snap.forEach(d => {
// //     const data = d.data();
// //     const qty  = data.quantity !== undefined ? Number(data.quantity) : Number(data.stock || 0);
// //     allProducts.push({ id: d.id, ...data, quantity: isNaN(qty) ? 0 : qty });
// //   });

// //   const search = document.getElementById('searchInput')?.value || '';
// //   renderProducts(applyFilters(allProducts, activeCategory, search));
// //   updateProductCount();
// // });

// // // ============================================================
// // //  FILTERING
// // // ============================================================

// // window.filterCat = function (cat, btn) {
// //   activeCategory = cat;
// //   document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
// //   if (btn) btn.classList.add('active');
// //   renderProducts(applyFilters(allProducts, cat, document.getElementById('searchInput')?.value || ''));
// // };

// // window.handleSearch = function (val) {
// //   renderProducts(applyFilters(allProducts, activeCategory, val));
// // };

// // function applyFilters(list, cat, search) {
// //   return list.filter(p => {
// //     const matchCat    = cat === 'all' || (p.category || '').toLowerCase() === cat.toLowerCase();
// //     const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
// //     return matchCat && matchSearch;
// //   });
// // }

// // function updateProductCount() {
// //   const el = document.getElementById('productCount');
// //   if (el) el.textContent = `${allProducts.length} product${allProducts.length !== 1 ? 's' : ''} available`;
// // }

// // // ============================================================
// // //  RENDER PRODUCTS
// // // ============================================================

// // window.renderProducts = function (list) {
// //   const grid = document.getElementById('productsGrid');
// //   if (!grid) return;
// //   grid.innerHTML = '';

// //   if (list.length === 0) {
// //     grid.innerHTML = `
// //       <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--grey);">
// //         <i class="fas fa-search" style="font-size:40px;opacity:0.3;margin-bottom:12px;display:block;"></i>
// //         <p style="font-weight:700;font-size:16px;">No products found</p>
// //       </div>`;
// //     return;
// //   }

// //   list.forEach(p => {
// //     const qty      = Number(p.quantity || p.stock || 0);
// //     const isOOS    = qty <= 0;
// //     const price    = parseFloat(p.price || p.cost || 0);
// //     const imgUrl   = p.imageUrl || p.image || p.img || p.photoURL || '';
// //     const lowStock = qty > 0 && qty <= 5;

// //     const card = document.createElement('div');
// //     card.className = `product-card ${isOOS ? 'oos' : ''}`;
// //     if (!isOOS) card.onclick = () => window.addToCart(p);

// //     card.innerHTML = `
// //       <div class="card-img-placeholder">
// //         ${imgUrl ? `<img src="${imgUrl}" alt="${p.name}" onerror="this.parentElement.innerHTML='🐷'"/>` : '🐷'}
// //       </div>
// //       ${isOOS   ? '<div class="oos-tag">Out of Stock</div>'    : ''}
// //       ${lowStock ? `<div class="stock-tag">${qty} left!</div>` : ''}
// //       <div class="card-body">
// //         <div class="card-name">${p.name}</div>
// //         <div class="card-unit">${p.unit ? `Per ${p.unit}` : ''} ${!isOOS ? `· ${qty} in stock` : ''}</div>
// //         <div class="card-footer">
// //           <span class="card-price">₱${price.toLocaleString()}</span>
// //           ${!isOOS ? `<button class="btn-add" title="Add to order"><i class="fas fa-plus"></i></button>` : ''}
// //         </div>
// //       </div>`;
// //     grid.appendChild(card);
// //   });
// // };

// // // ============================================================
// // //  CART
// // // ============================================================

// // window.addToCart = function (product) {
// //   const existing = cart.find(i => i.id === product.id);
// //   const stock    = Number(product.quantity || product.stock || 0);
// //   const current  = existing ? existing.qty : 0;

// //   if (current + 1 > stock) { showToast('Not enough stock!', 'error'); return; }

// //   if (existing) {
// //     existing.qty++;
// //   } else {
// //     cart.push({
// //       id:    product.id,
// //       name:  product.name,
// //       price: parseFloat(product.price || product.cost || 0),
// //       qty:   1,
// //       unit:  product.unit || 'pcs'
// //     });
// //   }

// //   renderCart();
// //   showToast(`${product.name} added!`, 'success');
// //   if (!document.getElementById('cartDrawer').classList.contains('open')) animateCartBadge();
// // };

// // window.updateCartQty = function (id, delta) {
// //   const item = cart.find(i => i.id === id);
// //   if (!item) return;
// //   item.qty += delta;
// //   if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
// //   renderCart();
// // };

// // function renderCart() {
// //   const list    = document.getElementById('cartItemsList');
// //   const badge   = document.getElementById('cartBadge');
// //   const totalEl = document.getElementById('cartTotal');
// //   const btn     = document.getElementById('inquireBtn');

// //   const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
// //   const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

// //   badge.textContent   = totalQty;
// //   totalEl.textContent = fmt(totalPrice);
// //   btn.disabled        = cart.length === 0;

// //   if (cart.length === 0) {
// //     list.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>No items added yet</p></div>`;
// //     return;
// //   }

// //   list.innerHTML = '';
// //   cart.forEach(item => {
// //     const row = document.createElement('div');
// //     row.className = 'cart-item-row';
// //     row.innerHTML = `
// //       <div class="ci-icon">🐷</div>
// //       <div class="ci-info">
// //         <div class="ci-name">${item.name}</div>
// //         <div class="ci-price">${fmt(item.price * item.qty)}</div>
// //       </div>
// //       <div class="ci-qty">
// //         <button onclick="updateCartQty('${item.id}', -1)"><i class="fas fa-minus" style="font-size:10px;"></i></button>
// //         <span>${item.qty}</span>
// //         <button onclick="updateCartQty('${item.id}', 1)"><i class="fas fa-plus" style="font-size:10px;"></i></button>
// //       </div>`;
// //     list.appendChild(row);
// //   });
// // }

// // // ============================================================
// // //  CART DRAWER
// // // ============================================================

// // window.toggleCart = function () {
// //   const drawer  = document.getElementById('cartDrawer');
// //   const overlay = document.getElementById('cartOverlay');
// //   drawer.classList.toggle('open');
// //   overlay.classList.toggle('open');
// //   document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
// // };

// // // ============================================================
// // //  INQUIRY MODAL
// // // ============================================================

// // window.openInquiryModal = function () {
// //   if (cart.length === 0) return;
// //   renderInquiryForm(cart.reduce((s, i) => s + i.price * i.qty, 0));
// //   document.getElementById('inquiryModal').classList.add('open');
// // };

// // window.closeInquiryModal = function () {
// //   document.getElementById('inquiryModal').classList.remove('open');
// // };

// // function renderInquiryForm(total) {
// //   const today = new Date().toISOString().split('T')[0];
// //   document.getElementById('inquiryModalBody').innerHTML = `
// //     <div class="order-summary">
// //       <h4>Your Order</h4>
// //       ${cart.map(i => `
// //         <div class="os-item">
// //           <span>${i.qty}× ${i.name}</span>
// //           <span>${fmt(i.price * i.qty)}</span>
// //         </div>`).join('')}
// //       <div class="os-total"><span>Total</span><span>${fmt(total)}</span></div>
// //     </div>

// //     <div class="form-row">
// //       <div class="form-group">
// //         <label><i class="fas fa-user" style="color:var(--red);margin-right:5px;"></i> Full Name *</label>
// //         <input type="text" id="inqName" placeholder="Juan dela Cruz"/>
// //       </div>
// //       <div class="form-group">
// //         <label><i class="fas fa-phone" style="color:var(--red);margin-right:5px;"></i> Phone Number *</label>
// //         <input type="tel" id="inqPhone" placeholder="+63 917 000 0000"/>
// //       </div>
// //     </div>

// //     <div class="form-group">
// //       <label><i class="fas fa-envelope" style="color:var(--red);margin-right:5px;"></i> Email Address *</label>
// //       <input type="email" id="inqEmail" placeholder="juan@gmail.com"/>
// //     </div>

// //     <div class="form-row">
// //       <div class="form-group">
// //         <label><i class="fas fa-calendar" style="color:var(--red);margin-right:5px;"></i> Pickup / Delivery Date *</label>
// //         <input type="date" id="inqDate" min="${today}"/>
// //       </div>
// //       <div class="form-group">
// //         <label><i class="fas fa-clock" style="color:var(--red);margin-right:5px;"></i> Preferred Time *</label>
// //         <input type="time" id="inqTime"/>
// //       </div>
// //     </div>

// //     <div class="form-group">
// //       <label><i class="fas fa-comment-alt" style="color:var(--red);margin-right:5px;"></i> Special Instructions</label>
// //       <textarea id="inqNotes" rows="3" placeholder="Any special requests, delivery address, event details..."></textarea>
// //     </div>

// //     <button class="btn-submit-inquiry" id="submitInquiryBtn" onclick="submitInquiry()">
// //       <i class="fas fa-paper-plane"></i> Send Inquiry to Gene's Lechon
// //     </button>`;
// // }

// // // ============================================================
// // //  SUBMIT INQUIRY → FIRESTORE "inquiries" COLLECTION
// // //  Fields match exactly what inquiries.js admin page reads
// // // ============================================================

// // // ── Max 3 inquiries per day per unique identity ──────────────
// // // Fails gracefully if Firestore indexes are not yet created.
// // async function checkDailyLimit(name, email, phone) {
// //   const MAX   = 3;
// //   const now   = new Date();
// //   const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
// //   const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

// //   try {
// //     // Single-field range query — no composite index needed
// //     const snap = await getDocs(
// //       query(collection(db, "inquiries"),
// //         where("date", ">=", start),
// //         where("date", "<=", end)
// //       )
// //     );

// //     // Filter in JS — check if any of the 3 identifiers match
// //     const emailLow = email.toLowerCase();
// //     let count = 0;
// //     snap.forEach(d => {
// //       const data = d.data();
// //       if (
// //         (data.email    || '').toLowerCase() === emailLow ||
// //         (data.phone    || '')               === phone    ||
// //         (data.customer || '')               === name
// //       ) {
// //         count++;
// //       }
// //     });

// //     return { count, blocked: count >= MAX, remaining: Math.max(0, MAX - count) };

// //   } catch (err) {
// //     console.warn('Rate limit check failed, allowing submission:', err.message);
// //     return { count: 0, blocked: false, remaining: MAX };
// //   }
// // }

// // window.submitInquiry = async function () {
// //   const name  = document.getElementById('inqName')?.value?.trim();
// //   const phone = document.getElementById('inqPhone')?.value?.trim();
// //   const email = document.getElementById('inqEmail')?.value?.trim();
// //   const date  = document.getElementById('inqDate')?.value;
// //   const time  = document.getElementById('inqTime')?.value;
// //   const notes = document.getElementById('inqNotes')?.value?.trim() || '';

// //   // ── Basic field validation ───────────────────────────────
// //   if (!name || !phone || !email || !date || !time) {
// //     showToast('Please fill in all required fields!', 'error'); return;
// //   }
// //   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
// //     showToast('Please enter a valid email address!', 'error'); return;
// //   }

// //   const btn = document.getElementById('submitInquiryBtn');
// //   btn.disabled  = true;
// //   btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

// //   try {
// //     // ── Rate limit check: max 3 inquiries per day ────────────
// //     const limit = await checkDailyLimit(name, email, phone);

// //     if (limit.blocked) {
// //       showToast('You have reached the maximum of 3 inquiries per day. Please try again tomorrow or call us directly.', 'error');
// //       btn.disabled  = false;
// //       btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
// //       // Show a more prominent warning inside the form
// //       showLimitWarning();
// //       return;
// //     }

// //     btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

// //     const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

// //     // ── Build document — email stored lowercase for consistent matching
// //     const inquiryDoc = {
// //       orderId:   `#INQ-${Math.floor(100000 + Math.random() * 900000)}`,
// //       customer:  name,
// //       email:     email.toLowerCase(),
// //       phone:     phone,
// //       date:      new Date().toISOString(),
// //       orderDate: date,
// //       orderTime: time,
// //       items:     cart.map(i => ({
// //         id:    i.id,
// //         name:  i.name,
// //         price: i.price,
// //         qty:   i.qty,
// //         unit:  i.unit || 'pcs'
// //       })),
// //       total:     total,
// //       notes:     notes,
// //       status:    'pending',
// //       source:    'landing_page'
// //     };

// //     // ── Save to Firestore ────────────────────────────────────
// //     await addDoc(collection(db, "inquiries"), inquiryDoc);

// //     cart = [];
// //     renderCart();

// //     // Show remaining count if they still have submissions left
// //     const usedAfter = limit.count + 1;
// //     const leftAfter = 3 - usedAfter;
// //     showSuccessState(name, inquiryDoc.orderId, leftAfter);

// //   } catch (err) {
// //     console.error("Inquiry submission failed:", err);
// //     showToast('Failed to submit. Please try again or call us directly.', 'error');
// //     btn.disabled  = false;
// //     btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
// //   }
// // };

// // function showLimitWarning() {
// //   // Insert a warning box above the submit button if not already shown
// //   const existing = document.getElementById('limitWarningBox');
// //   if (existing) return;
// //   const btn = document.getElementById('submitInquiryBtn');
// //   if (!btn) return;
// //   const box = document.createElement('div');
// //   box.id = 'limitWarningBox';
// //   box.style.cssText = `
// //     background:#fff0e6; border:2px solid var(--red); border-radius:10px;
// //     padding:12px 16px; margin-bottom:14px; font-size:13px; font-weight:600;
// //     color:var(--red); display:flex; align-items:flex-start; gap:10px;
// //   `;
// //   box.innerHTML = `
// //     <i class="fas fa-exclamation-triangle" style="margin-top:1px;flex-shrink:0;"></i>
// //     <div>
// //       <strong>Daily limit reached.</strong><br/>
// //       You can submit a maximum of <strong>3 inquiries per day</strong>
// //       using the same name, email, or phone number.<br/>
// //       Please try again tomorrow or call us at <strong>(088) 123-4567</strong>.
// //     </div>`;
// //   btn.parentNode.insertBefore(box, btn);
// // }

// // function showSuccessState(name, orderId, remaining) {
// //   const remainingMsg = remaining > 0
// //     ? `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
// //         You can submit <strong>${remaining} more ${remaining === 1 ? 'inquiry' : 'inquiries'}</strong> today.
// //        </p>`
// //     : `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
// //         You've used all 3 inquiries for today. Need more help? Call us at <strong>(088) 123-4567</strong>.
// //        </p>`;

// //   document.getElementById('inquiryModalBody').innerHTML = `
// //     <div class="success-state">
// //       <div class="check-circle">✅</div>
// //       <h3>Inquiry Submitted!</h3>
// //       <p>Hi <strong>${name}</strong>! Your inquiry <strong>${orderId}</strong> has been received.</p>
// //       <p style="margin-top:8px;color:var(--grey);font-size:13px;">
// //         Our team will reach out via your email or phone shortly.
// //         Thank you for choosing Gene's Lechon! 🐷
// //       </p>
// //       ${remainingMsg}
// //       <button class="btn-done" onclick="closeInquiryModal()">Done</button>
// //     </div>`;
// // }

// // // ============================================================
// // //  MOBILE MENU
// // // ============================================================

// // window.toggleMobileMenu = function () {
// //   const menu = document.getElementById('mobileMenu');
// //   menu.classList.toggle('open');
// //   document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
// // };

// // // ============================================================
// // //  UTILITIES
// // // ============================================================

// // function fmt(n) {
// //   return '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
// // }

// // function animateCartBadge() {
// //   const badge = document.getElementById('cartBadge');
// //   badge.style.transform  = 'scale(1.6)';
// //   badge.style.transition = 'transform 0.2s';
// //   setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
// // }

// // window.showToast = function (msg, type) {
// //   let container = document.getElementById('toastContainer');
// //   if (!container) {
// //     container = document.createElement('div');
// //     container.id = 'toastContainer';
// //     document.body.appendChild(container);
// //   }
// //   const toast = document.createElement('div');
// //   toast.className = `toast-item ${type}`;
// //   toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
// //   container.appendChild(toast);
// //   setTimeout(() => toast.remove(), 3000);
// // };

// // // Init — skeleton cards show until Firebase loads real products
// // window.renderProducts([]);

// // // ============================================================
// // //  INQUIRY TRACKER
// // //  Customers can look up their inquiry by:
// // //    - Inquiry ID (e.g. INQ-358778)
// // //    - Email address
// // //    - Phone number
// // // ============================================================

// // window.openTracker = function () {
// //   document.getElementById('trackerModal').classList.add('open');
// //   document.body.style.overflow = 'hidden';
// //   // reset each time
// //   document.getElementById('trackInput').value = '';
// //   document.getElementById('trackResult').innerHTML = '';
// //   document.getElementById('trackInput').focus();
// // };

// // window.closeTracker = function () {
// //   document.getElementById('trackerModal').classList.remove('open');
// //   document.body.style.overflow = '';
// // };

// // window.clearTrackResult = function () {
// //   document.getElementById('trackResult').innerHTML = '';
// // };

// // window.searchInquiry = async function () {
// //   const raw = (document.getElementById('trackInput').value || '').trim();
// //   if (!raw) { showToast('Please enter an Inquiry ID, email, or phone number.', 'error'); return; }

// //   const resultEl = document.getElementById('trackResult');
// //   const btn      = document.getElementById('trackBtn');
// //   btn.disabled   = true;
// //   btn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Searching…';

// //   resultEl.innerHTML = `
// //     <div class="track-loading">
// //       <div class="track-spinner"></div>
// //       <p style="color:var(--grey);font-size:13px;font-weight:600;">Looking up your inquiry…</p>
// //     </div>`;

// //   try {
// //     const inqCol = collection(db, 'inquiries');
// //     let found    = null;

// //     // ── 1. Try by Order ID (orderId field, case-insensitive via exact match)
// //     const upperRaw = raw.toUpperCase();
// //     const q1 = query(inqCol, where('orderId', '==', upperRaw));
// //     const s1 = await getDocs(q1);
// //     if (!s1.empty) { found = { id: s1.docs[0].id, ...s1.docs[0].data() }; }

// //     // ── 2. Try by email
// //     if (!found) {
// //       const q2 = query(inqCol, where('email', '==', raw.toLowerCase()));
// //       const s2  = await getDocs(q2);
// //       if (!s2.empty) {
// //         // if multiple, pick the most recent (highest orderId or latest date)
// //         const sorted = s2.docs.sort((a, b) => {
// //           const aDate = (a.data().createdAt?.seconds || 0);
// //           const bDate = (b.data().createdAt?.seconds || 0);
// //           return bDate - aDate;
// //         });
// //         found = { id: sorted[0].id, ...sorted[0].data() };
// //       }
// //     }

// //     // ── 3. Try by phone
// //     if (!found) {
// //       const cleaned = raw.replace(/\D/g, '');   // strip non-digits for comparison
// //       // Query as-is first
// //       const q3 = query(inqCol, where('phone', '==', raw));
// //       const s3  = await getDocs(q3);
// //       if (!s3.empty) {
// //         const sorted = s3.docs.sort((a, b) => ((b.data().createdAt?.seconds||0) - (a.data().createdAt?.seconds||0)));
// //         found = { id: sorted[0].id, ...sorted[0].data() };
// //       }
// //     }

// //     btn.disabled  = false;
// //     btn.innerHTML = '<i class="fas fa-search"></i> Find Inquiry';

// //     if (!found) {
// //       resultEl.innerHTML = `
// //         <div class="track-not-found">
// //           <i class="fas fa-search-minus"></i>
// //           <p>No inquiry found for "<strong>${escHtml(raw)}</strong>".<br>
// //           Double-check your ID, email, or phone number.</p>
// //         </div>`;
// //       return;
// //     }

// //     renderTrackResult(found, resultEl);

// //   } catch (err) {
// //     console.error('Tracker error:', err);
// //     btn.disabled  = false;
// //     btn.innerHTML = '<i class="fas fa-search"></i> Find Inquiry';
// //     resultEl.innerHTML = `
// //       <div class="track-not-found">
// //         <i class="fas fa-exclamation-circle"></i>
// //         <p>Something went wrong. Please try again in a moment.</p>
// //       </div>`;
// //   }
// // };

// // function renderTrackResult (inq, el) {
// //   const status    = (inq.status || 'pending').toLowerCase();
// //   const statusMap = { pending: 'Pending', confirmed: 'Confirmed', ready: 'Ready', cancelled: 'Cancelled' };
// //   const statusLabel = statusMap[status] || status;

// //   // Build items list HTML
// //   const items = Array.isArray(inq.items) ? inq.items : [];
// //   const itemsHtml = items.length
// //     ? items.map(i => `
// //         <div class="track-item-row">
// //           <span>${escHtml(i.qty || 1)}× ${escHtml(i.name)}</span>
// //           <span>₱${parseFloat(i.price * (i.qty||1)).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
// //         </div>`).join('')
// //     : '<div style="color:var(--grey);font-size:13px;">No items recorded.</div>';

// //   const total = inq.total || items.reduce((s,i)=>s+(parseFloat(i.price||0)*(i.qty||1)),0);

// //   // Dates
// //   const submittedStr = inq.createdAt
// //     ? new Date(inq.createdAt.seconds * 1000).toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})
// //     : (inq.date || '—');
// //   const pickupStr = inq.pickupDate || inq.date || '—';

// //   // Timeline steps
// //   const steps = ['pending','confirmed','ready'];
// //   const cancelledSteps = ['pending','cancelled'];
// //   const activeSteps = status === 'cancelled' ? cancelledSteps : steps;
// //   const statusOrder = ['pending','confirmed','ready','cancelled'];
// //   const currentIdx  = statusOrder.indexOf(status);

// //   const timelineSteps = [
// //     { key:'pending',   icon:'fa-clock',        label:'Submitted'  },
// //     { key:'confirmed', icon:'fa-check-circle',  label:'Confirmed'  },
// //     { key:'ready',     icon:'fa-box-open',      label:'Ready'      },
// //   ];
// //   if (status === 'cancelled') {
// //     timelineSteps.push({ key:'cancelled', icon:'fa-times-circle', label:'Cancelled' });
// //   }

// //   const timelineHtml = timelineSteps.map((step, idx) => {
// //     const stepIdx   = statusOrder.indexOf(step.key);
// //     const isDone    = stepIdx < currentIdx || (step.key === status && status !== 'pending');
// //     const isActive  = step.key === status;
// //     const cls       = isDone ? 'done' : isActive ? 'active' : '';
// //     return `
// //       <div class="track-step ${cls}">
// //         <div class="track-step-dot"><i class="fas ${step.icon}" style="font-size:11px;"></i></div>
// //         <div class="track-step-label">${step.label}</div>
// //       </div>`;
// //   }).join('');

// //   const statusNote = {
// //     pending:   '⏳ Your inquiry has been received. We\'ll confirm it shortly!',
// //     confirmed: '✅ Great news! Your order is confirmed. We\'re preparing it.',
// //     ready:     '🎉 Your order is ready for pickup / delivery!',
// //     cancelled: '❌ This inquiry was cancelled. Please contact us if this is a mistake.',
// //   }[status] || '';

// //   el.innerHTML = `
// //     <div class="track-result-card">
// //       <div class="track-result-header">
// //         <span class="track-order-id">${escHtml(inq.orderId || inq.id)}</span>
// //         <span class="track-status-pill ${status}">${statusLabel}</span>
// //       </div>
// //       <div class="track-result-body">

// //         <p style="font-size:13px;font-weight:600;color:var(--dark);background:white;border-radius:8px;padding:10px 14px;border-left:3px solid var(--red);">
// //           ${statusNote}
// //         </p>

// //         <!-- Timeline -->
// //         <div class="track-status-timeline">${timelineHtml}</div>

// //         <!-- Customer info -->
// //         <div class="track-info-row">
// //           <i class="fas fa-user"></i>
// //           <span class="track-info-label">Name</span>
// //           <span class="track-info-value">${escHtml(inq.customer || inq.name || '—')}</span>
// //         </div>
// //         <div class="track-info-row">
// //           <i class="fas fa-calendar"></i>
// //           <span class="track-info-label">Submitted</span>
// //           <span class="track-info-value">${submittedStr}</span>
// //         </div>
// //         <div class="track-info-row">
// //           <i class="fas fa-truck"></i>
// //           <span class="track-info-label">Pickup Date</span>
// //           <span class="track-info-value">${escHtml(pickupStr)}</span>
// //         </div>
// //         ${inq.time ? `
// //         <div class="track-info-row">
// //           <i class="fas fa-clock"></i>
// //           <span class="track-info-label">Time</span>
// //           <span class="track-info-value">${escHtml(inq.time)}</span>
// //         </div>` : ''}

// //         <!-- Items -->
// //         <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--grey);margin-top:6px;">Order Items</div>
// //         <div class="track-items-list">
// //           ${itemsHtml}
// //           <div class="track-total-row">
// //             <span>Total</span>
// //             <span>₱${parseFloat(total).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
// //           </div>
// //         </div>

// //         ${inq.notes ? `
// //         <div class="track-info-row" style="align-items:flex-start;">
// //           <i class="fas fa-comment-alt" style="margin-top:2px;"></i>
// //           <span class="track-info-label">Notes</span>
// //           <span class="track-info-value">${escHtml(inq.notes)}</span>
// //         </div>` : ''}

// //         <p style="font-size:12px;color:var(--grey);text-align:center;margin-top:6px;">
// //           Questions? Call us at <strong>(088) 123-4567</strong> or message us on Facebook.
// //         </p>
// //       </div>
// //     </div>`;
// // }

// // function escHtml (str) {
// //   return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// // }













// // ============================================================
// //  GENE'S LECHON — app.js
// //  Landing page: products from Firestore, cart, inquiry → saved to Firestore
// //
// //  ⚠️  FIRESTORE COMPOSITE INDEXES REQUIRED for rate limiting.
// //  Go to: Firebase Console → Firestore → Indexes → Composite
// //  Add these 3 indexes on the "inquiries" collection:
// //
// //  1. Fields: email ASC, date ASC    (Collection scope)
// //  2. Fields: phone ASC, date ASC    (Collection scope)
// //  3. Fields: customer ASC, date ASC (Collection scope)
// //
// //  Without these, the daily limit check will fail silently.
// // ============================================================

// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
// import {
//   getFirestore, collection, onSnapshot, addDoc,
//   query, where, getDocs
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// // ── Firebase config ──────────────────────────────────────────
// const firebaseConfig = {
//   apiKey:            "AIzaSyBvsn9hLvi4Tq9mLvoo1-YL1uzbB_ntL7s",
//   authDomain:        "pos-and-sales-monitoring.firebaseapp.com",
//   projectId:         "pos-and-sales-monitoring",
//   storageBucket:     "pos-and-sales-monitoring.firebasestorage.app",
//   messagingSenderId: "516453934117",
//   appId:             "1:516453934117:web:1783067b8aa6b37373cbcc",
//   measurementId:     "G-FT1G64DB9N"
// };

// const app = initializeApp(firebaseConfig);
// const db  = getFirestore(app);

// // ── State ────────────────────────────────────────────────────
// let allProducts    = [];
// let activeCategory = 'all';
// let cart           = [];

// // ── CDO Barangays ────────────────────────────────────────────
// const CDO_BARANGAYS = [
//   "Agusan", "Balubal", "Balulang", "Barangay 1 (Pob.)", "Barangay 2 (Pob.)",
//   "Barangay 3 (Pob.)", "Barangay 4 (Pob.)", "Barangay 5 (Pob.)", "Barangay 6 (Pob.)",
//   "Barangay 7 (Pob.)", "Barangay 8 (Pob.)", "Barangay 9 (Pob.)", "Barangay 10 (Pob.)",
//   "Barangay 11 (Pob.)", "Barangay 12 (Pob.)", "Barangay 13 (Pob.)", "Barangay 14 (Pob.)",
//   "Barangay 15 (Pob.)", "Barangay 16 (Pob.)", "Barangay 17 (Pob.)", "Barangay 18 (Pob.)",
//   "Barangay 19 (Pob.)", "Barangay 20 (Pob.)", "Barangay 21 (Pob.)", "Barangay 22 (Pob.)",
//   "Barangay 23 (Pob.)", "Barangay 24 (Pob.)", "Barangay 25 (Pob.)", "Barangay 26 (Pob.)",
//   "Barangay 27 (Pob.)", "Barangay 28 (Pob.)", "Barangay 29 (Pob.)", "Barangay 30 (Pob.)",
//   "Barangay 31 (Pob.)", "Barangay 32 (Pob.)", "Barangay 33 (Pob.)", "Barangay 34 (Pob.)",
//   "Barangay 35 (Pob.)", "Barangay 36 (Pob.)", "Barangay 37 (Pob.)", "Barangay 38 (Pob.)",
//   "Barangay 39 (Pob.)", "Barangay 40 (Pob.)", "Baikingon", "Bayabas", "Besigan",
//   "Bonbon", "Bugo", "Bulua", "Camaman-an", "Cugman", "Dansolihon",
//   "F.S. Catanico", "Gusa", "Indahag", "Iponan", "Kauswagan", "Lapasan",
//   "Lumbia", "Macabalan", "Macasandig", "Mambuaya", "Nazareth", "Pagalungan",
//   "Pagatpat", "Patag", "Pigsag-an", "Puerto", "Puntod", "San Simon",
//   "Tablon", "Taglimao", "Tagpangi", "Tignapoloan", "Tumpagon", "Urduja",
//   "Velarde", "Wao", "Zone 4 (Bulua)", "Bonbon", "Agusan Pequeño", "Barra"
// ].sort();

// // ============================================================
// //  FIREBASE LISTENERS
// // ============================================================

// // Categories → pulled live from Firestore "categories" collection
// onSnapshot(collection(db, "categories"), (snap) => {
//   const tabs = document.getElementById('catTabs');
//   tabs.innerHTML = `<button class="cat-tab ${activeCategory === 'all' ? 'active' : ''}"
//     onclick="filterCat('all', this)">All Products</button>`;

//   snap.forEach(d => {
//     const name = d.data().name;
//     tabs.innerHTML += `<button class="cat-tab ${activeCategory === name ? 'active' : ''}"
//       onclick="filterCat('${name}', this)">${name}</button>`;
//   });
// });

// // Products → pulled live from Firestore "products" collection
// // Archived products are hidden from the public page
// onSnapshot(collection(db, "products"), (snap) => {
//   allProducts = [];
//   snap.forEach(d => {
//     const data = d.data();
//     // ── Skip archived products ──────────────────────────────
//     if (data.archived === true || data.status === 'archived') return;

//     const qty  = data.quantity !== undefined ? Number(data.quantity) : Number(data.stock || 0);
//     allProducts.push({ id: d.id, ...data, quantity: isNaN(qty) ? 0 : qty });
//   });

//   const search = document.getElementById('searchInput')?.value || '';
//   renderProducts(applyFilters(allProducts, activeCategory, search));
//   updateProductCount();
// });

// // ============================================================
// //  FILTERING
// // ============================================================

// window.filterCat = function (cat, btn) {
//   activeCategory = cat;
//   document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
//   if (btn) btn.classList.add('active');
//   renderProducts(applyFilters(allProducts, cat, document.getElementById('searchInput')?.value || ''));
// };

// window.handleSearch = function (val) {
//   renderProducts(applyFilters(allProducts, activeCategory, val));
// };

// function applyFilters(list, cat, search) {
//   return list.filter(p => {
//     const matchCat    = cat === 'all' || (p.category || '').toLowerCase() === cat.toLowerCase();
//     const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
//     return matchCat && matchSearch;
//   });
// }

// function updateProductCount() {
//   const el = document.getElementById('productCount');
//   if (el) el.textContent = `${allProducts.length} product${allProducts.length !== 1 ? 's' : ''} available`;
// }

// // ============================================================
// //  RENDER PRODUCTS
// //  ✅ Stock count is NOT shown to customers
// //  ✅ Archived products are already filtered out before this runs
// // ============================================================

// window.renderProducts = function (list) {
//   const grid = document.getElementById('productsGrid');
//   if (!grid) return;
//   grid.innerHTML = '';

//   if (list.length === 0) {
//     grid.innerHTML = `
//       <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--grey);">
//         <i class="fas fa-search" style="font-size:40px;opacity:0.3;margin-bottom:12px;display:block;"></i>
//         <p style="font-weight:700;font-size:16px;">No products found</p>
//       </div>`;
//     return;
//   }

//   list.forEach(p => {
//     const qty    = Number(p.quantity || p.stock || 0);
//     const isOOS  = qty <= 0;
//     const price  = parseFloat(p.price || p.cost || 0);
//     const imgUrl = p.imageUrl || p.image || p.img || p.photoURL || '';

//     const card = document.createElement('div');
//     card.className = `product-card ${isOOS ? 'oos' : ''}`;
//     if (!isOOS) card.onclick = () => window.addToCart(p);

//     card.innerHTML = `
//       <div class="card-img-placeholder">
//         ${imgUrl ? `<img src="${imgUrl}" alt="${p.name}" onerror="this.parentElement.innerHTML='🐷'"/>` : '🐷'}
//       </div>
//       ${isOOS ? '<div class="oos-tag">Out of Stock</div>' : ''}
//       <div class="card-body">
//         <div class="card-name">${p.name}</div>
//         <div class="card-unit"></div>
//         <div class="card-footer">
//           <span class="card-price">₱${price.toLocaleString()}</span>
//           ${!isOOS ? `<button class="btn-add" title="Add to order"><i class="fas fa-plus"></i></button>` : ''}
//         </div>
//       </div>`;
//     grid.appendChild(card);
//   });
// };

// // ============================================================
// //  CART
// // ============================================================

// window.addToCart = function (product) {
//   const existing = cart.find(i => i.id === product.id);
//   const stock    = Number(product.quantity || product.stock || 0);
//   const current  = existing ? existing.qty : 0;

//   if (current + 1 > stock) { showToast('Not enough stock!', 'error'); return; }

//   if (existing) {
//     existing.qty++;
//   } else {
//     cart.push({
//       id:    product.id,
//       name:  product.name,
//       price: parseFloat(product.price || product.cost || 0),
//       qty:   1,
//       unit:  product.unit || 'pcs'
//     });
//   }

//   renderCart();
//   showToast(`${product.name} added!`, 'success');
//   if (!document.getElementById('cartDrawer').classList.contains('open')) animateCartBadge();
// };

// window.updateCartQty = function (id, delta) {
//   const item = cart.find(i => i.id === id);
//   if (!item) return;
//   item.qty += delta;
//   if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
//   renderCart();
// };

// function renderCart() {
//   const list    = document.getElementById('cartItemsList');
//   const badge   = document.getElementById('cartBadge');
//   const totalEl = document.getElementById('cartTotal');
//   const btn     = document.getElementById('inquireBtn');

//   const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
//   const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

//   badge.textContent   = totalQty;
//   totalEl.textContent = fmt(totalPrice);
//   btn.disabled        = cart.length === 0;

//   if (cart.length === 0) {
//     list.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>No items added yet</p></div>`;
//     return;
//   }

//   list.innerHTML = '';
//   cart.forEach(item => {
//     const row = document.createElement('div');
//     row.className = 'cart-item-row';
//     row.innerHTML = `
//       <div class="ci-icon">🐷</div>
//       <div class="ci-info">
//         <div class="ci-name">${item.name}</div>
//         <div class="ci-price">${fmt(item.price * item.qty)}</div>
//       </div>
//       <div class="ci-qty">
//         <button onclick="updateCartQty('${item.id}', -1)"><i class="fas fa-minus" style="font-size:10px;"></i></button>
//         <span>${item.qty}</span>
//         <button onclick="updateCartQty('${item.id}', 1)"><i class="fas fa-plus" style="font-size:10px;"></i></button>
//       </div>`;
//     list.appendChild(row);
//   });
// }

// // ============================================================
// //  CART DRAWER
// // ============================================================

// window.toggleCart = function () {
//   const drawer  = document.getElementById('cartDrawer');
//   const overlay = document.getElementById('cartOverlay');
//   drawer.classList.toggle('open');
//   overlay.classList.toggle('open');
//   document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
// };

// // ============================================================
// //  INQUIRY MODAL
// // ============================================================

// window.openInquiryModal = function () {
//   if (cart.length === 0) return;
//   renderInquiryForm(cart.reduce((s, i) => s + i.price * i.qty, 0));
//   document.getElementById('inquiryModal').classList.add('open');
// };

// window.closeInquiryModal = function () {
//   document.getElementById('inquiryModal').classList.remove('open');
// };

// // ── Build the barangay <select> options ──────────────────────
// function buildBarangayOptions() {
//   return CDO_BARANGAYS.map(b => `<option value="${b}">${b}</option>`).join('');
// }

// // ── Toggle address fields based on pickup / delivery ─────────
// window.toggleDeliveryFields = function () {
//   const type    = document.getElementById('inqType')?.value;
//   const wrapper = document.getElementById('deliveryAddressWrap');
//   if (!wrapper) return;
//   wrapper.style.display = (type === 'delivery') ? 'block' : 'none';
// };

// // ── Time validation helper ───────────────────────────────────
// // Returns true if the time string (HH:MM) falls in the no-delivery window (12 AM – 4 AM)
// function isNightTimeBlocked(timeStr) {
//   if (!timeStr) return false;
//   const [h, m] = timeStr.split(':').map(Number);
//   const minutes = h * 60 + m;
//   // Block 00:00 (0) to 03:59 (239) — i.e. midnight to 4 AM exclusive
//   return minutes >= 0 && minutes < 240;
// }

// // ── Store open hours validation (8 AM – 10 PM = 08:00 – 22:00) ──
// function isOutsideStoreHours(timeStr) {
//   if (!timeStr) return false;
//   const [h, m] = timeStr.split(':').map(Number);
//   const minutes = h * 60 + m;
//   const openMinutes  = 8 * 60;   // 08:00
//   const closeMinutes = 22 * 60;  // 22:00
//   return minutes < openMinutes || minutes > closeMinutes;
// }

// function renderInquiryForm(total) {
//   const today = new Date().toISOString().split('T')[0];
//   document.getElementById('inquiryModalBody').innerHTML = `
//     <div class="order-summary">
//       <h4>Your Order</h4>
//       ${cart.map(i => `
//         <div class="os-item">
//           <span>${i.qty}× ${i.name}</span>
//           <span>${fmt(i.price * i.qty)}</span>
//         </div>`).join('')}
//       <div class="os-total"><span>Total</span><span>${fmt(total)}</span></div>
//     </div>

//     <div class="form-row">
//       <div class="form-group">
//         <label><i class="fas fa-user" style="color:var(--red);margin-right:5px;"></i> Full Name *</label>
//         <input type="text" id="inqName" placeholder="Juan dela Cruz"/>
//       </div>
//       <div class="form-group">
//         <label><i class="fas fa-phone" style="color:var(--red);margin-right:5px;"></i> Phone Number *</label>
//         <input type="tel" id="inqPhone" placeholder="+63 917 000 0000"/>
//       </div>
//     </div>

//     <div class="form-group">
//       <label><i class="fas fa-envelope" style="color:var(--red);margin-right:5px;"></i> Email Address *</label>
//       <input type="email" id="inqEmail" placeholder="juan@gmail.com"/>
//     </div>

//     <!-- Order Type -->
//     <div class="form-group">
//       <label><i class="fas fa-truck" style="color:var(--red);margin-right:5px;"></i> Order Type *</label>
//       <select id="inqType" onchange="toggleDeliveryFields()">
//         <option value="pickup">🏪 Pickup at Store</option>
//         <option value="delivery">🚚 Delivery</option>
//       </select>
//     </div>

//     <!-- Delivery Address (hidden by default, shown when delivery is selected) -->
//     <div id="deliveryAddressWrap" style="display:none;">
//       <div class="form-group">
//         <label><i class="fas fa-map-marker-alt" style="color:var(--red);margin-right:5px;"></i> Street / House No. / Landmark *</label>
//         <input type="text" id="inqStreet" placeholder="e.g. 123 Rizal St., near 7-Eleven"/>
//       </div>
//       <div class="form-group">
//         <label><i class="fas fa-map" style="color:var(--red);margin-right:5px;"></i> Barangay *</label>
//         <select id="inqBarangay">
//           <option value="">— Select Barangay —</option>
//           ${buildBarangayOptions()}
//         </select>
//       </div>
//       <div class="form-row">
//         <div class="form-group">
//           <label>City / Municipality</label>
//           <input type="text" value="Cagayan de Oro City" readonly style="background:#f5f5f5;color:var(--grey);cursor:not-allowed;"/>
//         </div>
//         <div class="form-group">
//           <label>Province</label>
//           <input type="text" value="Misamis Oriental" readonly style="background:#f5f5f5;color:var(--grey);cursor:not-allowed;"/>
//         </div>
//       </div>
//     </div>

//     <div class="form-row">
//       <div class="form-group">
//         <label><i class="fas fa-calendar" style="color:var(--red);margin-right:5px;"></i> Pickup / Delivery Date *</label>
//         <input type="date" id="inqDate" min="${today}"/>
//       </div>
//       <div class="form-group">
//         <label><i class="fas fa-clock" style="color:var(--red);margin-right:5px;"></i> Preferred Time *</label>
//         <input type="time" id="inqTime" min="08:00" max="22:00"
//           onchange="validateInqTime(this.value)"/>
//         <small id="inqTimeHint" style="color:var(--grey);font-size:11px;margin-top:4px;display:block;">
//           Store hours: 8:00 AM – 10:00 PM · No delivery from 12:00 AM – 4:00 AM
//         </small>
//       </div>
//     </div>

//     <div class="form-group">
//       <label><i class="fas fa-comment-alt" style="color:var(--red);margin-right:5px;"></i> Special Instructions</label>
//       <textarea id="inqNotes" rows="3" placeholder="Any special requests, event details, etc..."></textarea>
//     </div>

//     <button class="btn-submit-inquiry" id="submitInquiryBtn" onclick="submitInquiry()">
//       <i class="fas fa-paper-plane"></i> Send Inquiry to Gene's Lechon
//     </button>`;
// }

// // Show a hint below the time input if the selected time is blocked or outside hours
// window.validateInqTime = function (val) {
//   const hint = document.getElementById('inqTimeHint');
//   const type = document.getElementById('inqType')?.value;
//   if (!hint) return;

//   if (isNightTimeBlocked(val) && type === 'delivery') {
//     hint.textContent = '⛔ No deliveries from 12:00 AM to 4:00 AM. Please choose a different time.';
//     hint.style.color = 'var(--red)';
//     hint.style.fontWeight = '700';
//   } else if (isOutsideStoreHours(val)) {
//     hint.textContent = '⛔ Outside store hours (8:00 AM – 10:00 PM). Please pick a valid time.';
//     hint.style.color = 'var(--red)';
//     hint.style.fontWeight = '700';
//   } else {
//     hint.textContent = 'Store hours: 8:00 AM – 10:00 PM · No delivery from 12:00 AM – 4:00 AM';
//     hint.style.color = 'var(--grey)';
//     hint.style.fontWeight = '';
//   }
// };

// // ============================================================
// //  SUBMIT INQUIRY → FIRESTORE "inquiries" COLLECTION
// // ============================================================

// async function checkDailyLimit(name, email, phone) {
//   const MAX   = 3;
//   const now   = new Date();
//   const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
//   const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

//   try {
//     const snap = await getDocs(
//       query(collection(db, "inquiries"),
//         where("date", ">=", start),
//         where("date", "<=", end)
//       )
//     );
//     const emailLow = email.toLowerCase();
//     let count = 0;
//     snap.forEach(d => {
//       const data = d.data();
//       if (
//         (data.email    || '').toLowerCase() === emailLow ||
//         (data.phone    || '')               === phone    ||
//         (data.customer || '')               === name
//       ) count++;
//     });
//     return { count, blocked: count >= MAX, remaining: Math.max(0, MAX - count) };
//   } catch (err) {
//     console.warn('Rate limit check failed, allowing submission:', err.message);
//     return { count: 0, blocked: false, remaining: MAX };
//   }
// }

// window.submitInquiry = async function () {
//   const name    = document.getElementById('inqName')?.value?.trim();
//   const phone   = document.getElementById('inqPhone')?.value?.trim();
//   const email   = document.getElementById('inqEmail')?.value?.trim();
//   const date    = document.getElementById('inqDate')?.value;
//   const time    = document.getElementById('inqTime')?.value;
//   const notes   = document.getElementById('inqNotes')?.value?.trim() || '';
//   const type    = document.getElementById('inqType')?.value || 'pickup';
//   const street  = document.getElementById('inqStreet')?.value?.trim() || '';
//   const barangay= document.getElementById('inqBarangay')?.value || '';

//   // ── Basic field validation ───────────────────────────────
//   if (!name || !phone || !email || !date || !time) {
//     showToast('Please fill in all required fields!', 'error'); return;
//   }
//   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//     showToast('Please enter a valid email address!', 'error'); return;
//   }

//   // ── Time validation ──────────────────────────────────────
//   if (isOutsideStoreHours(time)) {
//     showToast('Please choose a time within store hours (8:00 AM – 10:00 PM).', 'error'); return;
//   }
//   if (type === 'delivery' && isNightTimeBlocked(time)) {
//     showToast('No deliveries from 12:00 AM to 4:00 AM. Please choose a later time.', 'error'); return;
//   }

//   // ── Delivery address validation ──────────────────────────
//   if (type === 'delivery') {
//     if (!street) {
//       showToast('Please enter your street / house address.', 'error'); return;
//     }
//     if (!barangay) {
//       showToast('Please select your barangay.', 'error'); return;
//     }
//   }

//   const btn = document.getElementById('submitInquiryBtn');
//   btn.disabled  = true;
//   btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

//   try {
//     const limit = await checkDailyLimit(name, email, phone);

//     if (limit.blocked) {
//       showToast('You have reached the maximum of 3 inquiries per day. Please try again tomorrow or call us directly.', 'error');
//       btn.disabled  = false;
//       btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
//       showLimitWarning();
//       return;
//     }

//     btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

//     const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

//     // ── Build delivery address string ─────────────────────
//     const deliveryAddress = type === 'delivery'
//       ? `${street}, ${barangay}, Cagayan de Oro City, Misamis Oriental`
//       : '';

//     // ── Build document ────────────────────────────────────
//     const inquiryDoc = {
//       orderId:         `#INQ-${Math.floor(100000 + Math.random() * 900000)}`,
//       customer:        name,
//       email:           email.toLowerCase(),
//       phone:           phone,
//       date:            new Date().toISOString(),
//       orderDate:       date,
//       orderTime:       time,
//       orderType:       type,                     // 'pickup' or 'delivery'
//       deliveryAddress: deliveryAddress,           // full address string
//       deliveryStreet:  street,
//       deliveryBarangay:barangay,
//       deliveryCity:    'Cagayan de Oro City',
//       deliveryProvince:'Misamis Oriental',
//       items:           cart.map(i => ({
//         id:    i.id,
//         name:  i.name,
//         price: i.price,
//         qty:   i.qty,
//         unit:  i.unit || 'pcs'
//       })),
//       total:           total,
//       notes:           notes,
//       status:          'pending',
//       source:          'landing_page'
//     };

//     await addDoc(collection(db, "inquiries"), inquiryDoc);

//     cart = [];
//     renderCart();

//     const usedAfter = limit.count + 1;
//     const leftAfter = 3 - usedAfter;
//     showSuccessState(name, inquiryDoc.orderId, leftAfter);

//   } catch (err) {
//     console.error("Inquiry submission failed:", err);
//     showToast('Failed to submit. Please try again or call us directly.', 'error');
//     btn.disabled  = false;
//     btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
//   }
// };

// function showLimitWarning() {
//   const existing = document.getElementById('limitWarningBox');
//   if (existing) return;
//   const btn = document.getElementById('submitInquiryBtn');
//   if (!btn) return;
//   const box = document.createElement('div');
//   box.id = 'limitWarningBox';
//   box.style.cssText = `
//     background:#fff0e6; border:2px solid var(--red); border-radius:10px;
//     padding:12px 16px; margin-bottom:14px; font-size:13px; font-weight:600;
//     color:var(--red); display:flex; align-items:flex-start; gap:10px;
//   `;
//   box.innerHTML = `
//     <i class="fas fa-exclamation-triangle" style="margin-top:1px;flex-shrink:0;"></i>
//     <div>
//       <strong>Daily limit reached.</strong><br/>
//       You can submit a maximum of <strong>3 inquiries per day</strong>
//       using the same name, email, or phone number.<br/>
//       Please try again tomorrow or call us at <strong>(088) 123-4567</strong>.
//     </div>`;
//   btn.parentNode.insertBefore(box, btn);
// }

// function showSuccessState(name, orderId, remaining) {
//   const remainingMsg = remaining > 0
//     ? `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
//         You can submit <strong>${remaining} more ${remaining === 1 ? 'inquiry' : 'inquiries'}</strong> today.
//        </p>`
//     : `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
//         You've used all 3 inquiries for today. Need more help? Call us at <strong>(088) 123-4567</strong>.
//        </p>`;

//   document.getElementById('inquiryModalBody').innerHTML = `
//     <div class="success-state">
//       <div class="check-circle">✅</div>
//       <h3>Inquiry Submitted!</h3>
//       <p>Hi <strong>${name}</strong>! Your inquiry <strong>${orderId}</strong> has been received.</p>
//       <p style="margin-top:8px;color:var(--grey);font-size:13px;">
//         Our team will reach out via your email or phone shortly.
//         Thank you for choosing Gene's Lechon! 🐷
//       </p>
//       ${remainingMsg}
//       <button class="btn-done" onclick="closeInquiryModal()">Done</button>
//     </div>`;
// }

// // ============================================================
// //  MOBILE MENU
// // ============================================================

// window.toggleMobileMenu = function () {
//   const menu = document.getElementById('mobileMenu');
//   menu.classList.toggle('open');
//   document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
// };

// // ============================================================
// //  UTILITIES
// // ============================================================

// function fmt(n) {
//   return '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
// }

// function animateCartBadge() {
//   const badge = document.getElementById('cartBadge');
//   badge.style.transform  = 'scale(1.6)';
//   badge.style.transition = 'transform 0.2s';
//   setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
// }

// window.showToast = function (msg, type) {
//   let container = document.getElementById('toastContainer');
//   if (!container) {
//     container = document.createElement('div');
//     container.id = 'toastContainer';
//     document.body.appendChild(container);
//   }
//   const toast = document.createElement('div');
//   toast.className = `toast-item ${type}`;
//   toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
//   container.appendChild(toast);
//   setTimeout(() => toast.remove(), 3000);
// };

// // Init — skeleton cards show until Firebase loads real products
// window.renderProducts([]);

// // ============================================================
// //  INQUIRY TRACKER
// // ============================================================

// window.openTracker = function () {
//   document.getElementById('trackerModal').classList.add('open');
//   document.body.style.overflow = 'hidden';
//   document.getElementById('trackInput').value = '';
//   document.getElementById('trackResult').innerHTML = '';
//   document.getElementById('trackInput').focus();
// };

// window.closeTracker = function () {
//   document.getElementById('trackerModal').classList.remove('open');
//   document.body.style.overflow = '';
// };

// window.clearTrackResult = function () {
//   document.getElementById('trackResult').innerHTML = '';
// };

// window.searchInquiry = async function () {
//   const raw = (document.getElementById('trackInput').value || '').trim();
//   if (!raw) { showToast('Please enter an Inquiry ID, email, or phone number.', 'error'); return; }

//   const resultEl = document.getElementById('trackResult');
//   const btn      = document.getElementById('trackBtn');
//   btn.disabled   = true;
//   btn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Searching…';

//   resultEl.innerHTML = `
//     <div class="track-loading">
//       <div class="track-spinner"></div>
//       <p style="color:var(--grey);font-size:13px;font-weight:600;">Looking up your inquiry…</p>
//     </div>`;

//   try {
//     const inqCol = collection(db, 'inquiries');
//     let found    = null;

//     // ── 1. Try by Order ID
//     const upperRaw = raw.toUpperCase();
//     const q1 = query(inqCol, where('orderId', '==', upperRaw));
//     const s1 = await getDocs(q1);
//     if (!s1.empty) { found = { id: s1.docs[0].id, ...s1.docs[0].data() }; }

//     // ── 2. Try by email
//     if (!found) {
//       const q2 = query(inqCol, where('email', '==', raw.toLowerCase()));
//       const s2  = await getDocs(q2);
//       if (!s2.empty) {
//         const sorted = s2.docs.sort((a, b) =>
//           (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
//         found = { id: sorted[0].id, ...sorted[0].data() };
//       }
//     }

//     // ── 3. Try by phone
//     if (!found) {
//       const q3 = query(inqCol, where('phone', '==', raw));
//       const s3  = await getDocs(q3);
//       if (!s3.empty) {
//         const sorted = s3.docs.sort((a, b) =>
//           (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
//         found = { id: sorted[0].id, ...sorted[0].data() };
//       }
//     }

//     btn.disabled  = false;
//     btn.innerHTML = '<i class="fas fa-search"></i> Find Inquiry';

//     if (!found) {
//       resultEl.innerHTML = `
//         <div class="track-not-found">
//           <i class="fas fa-search-minus"></i>
//           <p>No inquiry found for "<strong>${escHtml(raw)}</strong>".<br>
//           Double-check your ID, email, or phone number.</p>
//         </div>`;
//       return;
//     }

//     renderTrackResult(found, resultEl);

//   } catch (err) {
//     console.error('Tracker error:', err);
//     btn.disabled  = false;
//     btn.innerHTML = '<i class="fas fa-search"></i> Find Inquiry';
//     resultEl.innerHTML = `
//       <div class="track-not-found">
//         <i class="fas fa-exclamation-circle"></i>
//         <p>Something went wrong. Please try again in a moment.</p>
//       </div>`;
//   }
// };

// function renderTrackResult (inq, el) {
//   const status      = (inq.status || 'pending').toLowerCase();
//   const statusMap   = { pending: 'Pending', confirmed: 'Confirmed', ready: 'Ready', cancelled: 'Cancelled' };
//   const statusLabel = statusMap[status] || status;

//   const items = Array.isArray(inq.items) ? inq.items : [];
//   const itemsHtml = items.length
//     ? items.map(i => `
//         <div class="track-item-row">
//           <span>${escHtml(i.qty || 1)}× ${escHtml(i.name)}</span>
//           <span>₱${parseFloat(i.price * (i.qty||1)).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
//         </div>`).join('')
//     : '<div style="color:var(--grey);font-size:13px;">No items recorded.</div>';

//   const total = inq.total || items.reduce((s,i) => s + (parseFloat(i.price||0) * (i.qty||1)), 0);

//   const submittedStr = inq.createdAt
//     ? new Date(inq.createdAt.seconds * 1000).toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})
//     : (inq.date || '—');
//   const pickupStr = inq.pickupDate || inq.orderDate || inq.date || '—';

//   const steps = ['pending','confirmed','ready'];
//   const statusOrder = ['pending','confirmed','ready','cancelled'];
//   const currentIdx  = statusOrder.indexOf(status);

//   const timelineSteps = [
//     { key:'pending',   icon:'fa-clock',        label:'Submitted'  },
//     { key:'confirmed', icon:'fa-check-circle',  label:'Confirmed'  },
//     { key:'ready',     icon:'fa-box-open',      label:'Ready'      },
//   ];
//   if (status === 'cancelled') {
//     timelineSteps.push({ key:'cancelled', icon:'fa-times-circle', label:'Cancelled' });
//   }

//   const timelineHtml = timelineSteps.map((step) => {
//     const stepIdx  = statusOrder.indexOf(step.key);
//     const isDone   = stepIdx < currentIdx || (step.key === status && status !== 'pending');
//     const isActive = step.key === status;
//     const cls      = isDone ? 'done' : isActive ? 'active' : '';
//     return `
//       <div class="track-step ${cls}">
//         <div class="track-step-dot"><i class="fas ${step.icon}" style="font-size:11px;"></i></div>
//         <div class="track-step-label">${step.label}</div>
//       </div>`;
//   }).join('');

//   const statusNote = {
//     pending:   '⏳ Your inquiry has been received. We\'ll confirm it shortly!',
//     confirmed: '✅ Great news! Your order is confirmed. We\'re preparing it.',
//     ready:     '🎉 Your order is ready for pickup / delivery!',
//     cancelled: '❌ This inquiry was cancelled. Please contact us if this is a mistake.',
//   }[status] || '';

//   // Show delivery address in tracker if present
//   const addressRow = inq.deliveryAddress
//     ? `<div class="track-info-row">
//          <i class="fas fa-map-marker-alt"></i>
//          <span class="track-info-label">Delivery Address</span>
//          <span class="track-info-value">${escHtml(inq.deliveryAddress)}</span>
//        </div>`
//     : '';

//   const orderTypeRow = inq.orderType
//     ? `<div class="track-info-row">
//          <i class="fas fa-${inq.orderType === 'delivery' ? 'truck' : 'store'}"></i>
//          <span class="track-info-label">Order Type</span>
//          <span class="track-info-value">${inq.orderType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</span>
//        </div>`
//     : '';

//   el.innerHTML = `
//     <div class="track-result-card">
//       <div class="track-result-header">
//         <span class="track-order-id">${escHtml(inq.orderId || inq.id)}</span>
//         <span class="track-status-pill ${status}">${statusLabel}</span>
//       </div>
//       <div class="track-result-body">
//         <p style="font-size:13px;font-weight:600;color:var(--dark);background:white;border-radius:8px;padding:10px 14px;border-left:3px solid var(--red);">
//           ${statusNote}
//         </p>
//         <div class="track-status-timeline">${timelineHtml}</div>
//         <div class="track-info-row">
//           <i class="fas fa-user"></i>
//           <span class="track-info-label">Name</span>
//           <span class="track-info-value">${escHtml(inq.customer || inq.name || '—')}</span>
//         </div>
//         <div class="track-info-row">
//           <i class="fas fa-calendar"></i>
//           <span class="track-info-label">Submitted</span>
//           <span class="track-info-value">${submittedStr}</span>
//         </div>
//         <div class="track-info-row">
//           <i class="fas fa-calendar-check"></i>
//           <span class="track-info-label">Order Date</span>
//           <span class="track-info-value">${escHtml(pickupStr)}</span>
//         </div>
//         ${inq.orderTime ? `
//         <div class="track-info-row">
//           <i class="fas fa-clock"></i>
//           <span class="track-info-label">Time</span>
//           <span class="track-info-value">${escHtml(inq.orderTime)}</span>
//         </div>` : ''}
//         ${orderTypeRow}
//         ${addressRow}
//         <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--grey);margin-top:6px;">Order Items</div>
//         <div class="track-items-list">
//           ${itemsHtml}
//           <div class="track-total-row">
//             <span>Total</span>
//             <span>₱${parseFloat(total).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
//           </div>
//         </div>
//         ${inq.notes ? `
//         <div class="track-info-row" style="align-items:flex-start;">
//           <i class="fas fa-comment-alt" style="margin-top:2px;"></i>
//           <span class="track-info-label">Notes</span>
//           <span class="track-info-value">${escHtml(inq.notes)}</span>
//         </div>` : ''}
//         <p style="font-size:12px;color:var(--grey);text-align:center;margin-top:6px;">
//           Questions? Call us at <strong>(088) 123-4567</strong> or message us on Facebook.
//         </p>
//       </div>
//     </div>`;
// }

// function escHtml (str) {
//   return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// }















// // ============================================================
// //  GENE'S LECHON — app.js
// //  Landing page: products from Firestore, cart, inquiry → saved to Firestore
// //
// //  ⚠️  FIRESTORE COMPOSITE INDEXES REQUIRED for rate limiting.
// //  Go to: Firebase Console → Firestore → Indexes → Composite
// //  Add these 3 indexes on the "inquiries" collection:
// //
// //  1. Fields: email ASC, date ASC    (Collection scope)
// //  2. Fields: phone ASC, date ASC    (Collection scope)
// //  3. Fields: customer ASC, date ASC (Collection scope)
// //
// //  Without these, the daily limit check will fail silently.
// // ============================================================

// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
// import {
//   getFirestore, collection, onSnapshot, addDoc,
//   query, where, getDocs
// } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// // ── Firebase config ──────────────────────────────────────────
// const firebaseConfig = {
//   apiKey:            "AIzaSyBvsn9hLvi4Tq9mLvoo1-YL1uzbB_ntL7s",
//   authDomain:        "pos-and-sales-monitoring.firebaseapp.com",
//   projectId:         "pos-and-sales-monitoring",
//   storageBucket:     "pos-and-sales-monitoring.firebasestorage.app",
//   messagingSenderId: "516453934117",
//   appId:             "1:516453934117:web:1783067b8aa6b37373cbcc",
//   measurementId:     "G-FT1G64DB9N"
// };

// const app = initializeApp(firebaseConfig);
// const db  = getFirestore(app);

// // ── State ────────────────────────────────────────────────────
// let allProducts    = [];
// let activeCategory = 'all';
// let cart           = [];

// // ============================================================
// //  FIREBASE LISTENERS
// // ============================================================

// // Categories → pulled live from Firestore "categories" collection
// onSnapshot(collection(db, "categories"), (snap) => {
//   const tabs = document.getElementById('catTabs');
//   tabs.innerHTML = `<button class="cat-tab ${activeCategory === 'all' ? 'active' : ''}"
//     onclick="filterCat('all', this)">All Products</button>`;

//   snap.forEach(d => {
//     const name = d.data().name;
//     tabs.innerHTML += `<button class="cat-tab ${activeCategory === name ? 'active' : ''}"
//       onclick="filterCat('${name}', this)">${name}</button>`;
//   });
// });

// // Products → pulled live from Firestore "products" collection
// // Any stock change in admin POS instantly reflects here
// onSnapshot(collection(db, "products"), (snap) => {
//   allProducts = [];
//   snap.forEach(d => {
//     const data = d.data();
//     const qty  = data.quantity !== undefined ? Number(data.quantity) : Number(data.stock || 0);
//     allProducts.push({ id: d.id, ...data, quantity: isNaN(qty) ? 0 : qty });
//   });

//   const search = document.getElementById('searchInput')?.value || '';
//   renderProducts(applyFilters(allProducts, activeCategory, search));
//   updateProductCount();
// });

// // ============================================================
// //  FILTERING
// // ============================================================

// window.filterCat = function (cat, btn) {
//   activeCategory = cat;
//   document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
//   if (btn) btn.classList.add('active');
//   renderProducts(applyFilters(allProducts, cat, document.getElementById('searchInput')?.value || ''));
// };

// window.handleSearch = function (val) {
//   renderProducts(applyFilters(allProducts, activeCategory, val));
// };

// function applyFilters(list, cat, search) {
//   return list.filter(p => {
//     const matchCat    = cat === 'all' || (p.category || '').toLowerCase() === cat.toLowerCase();
//     const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
//     return matchCat && matchSearch;
//   });
// }

// function updateProductCount() {
//   const el = document.getElementById('productCount');
//   if (el) el.textContent = `${allProducts.length} product${allProducts.length !== 1 ? 's' : ''} available`;
// }

// // ============================================================
// //  RENDER PRODUCTS
// // ============================================================

// window.renderProducts = function (list) {
//   const grid = document.getElementById('productsGrid');
//   if (!grid) return;
//   grid.innerHTML = '';

//   if (list.length === 0) {
//     grid.innerHTML = `
//       <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--grey);">
//         <i class="fas fa-search" style="font-size:40px;opacity:0.3;margin-bottom:12px;display:block;"></i>
//         <p style="font-weight:700;font-size:16px;">No products found</p>
//       </div>`;
//     return;
//   }

//   list.forEach(p => {
//     const qty      = Number(p.quantity || p.stock || 0);
//     const isOOS    = qty <= 0;
//     const price    = parseFloat(p.price || p.cost || 0);
//     const imgUrl   = p.imageUrl || p.image || p.img || p.photoURL || '';
//     const lowStock = qty > 0 && qty <= 5;

//     const card = document.createElement('div');
//     card.className = `product-card ${isOOS ? 'oos' : ''}`;
//     if (!isOOS) card.onclick = () => window.addToCart(p);

//     card.innerHTML = `
//       <div class="card-img-placeholder">
//         ${imgUrl ? `<img src="${imgUrl}" alt="${p.name}" onerror="this.parentElement.innerHTML='🐷'"/>` : '🐷'}
//       </div>
//       ${isOOS   ? '<div class="oos-tag">Out of Stock</div>'    : ''}
//       ${lowStock ? `<div class="stock-tag">${qty} left!</div>` : ''}
//       <div class="card-body">
//         <div class="card-name">${p.name}</div>
//         <div class="card-unit">${p.unit ? `Per ${p.unit}` : ''} ${!isOOS ? `· ${qty} in stock` : ''}</div>
//         <div class="card-footer">
//           <span class="card-price">₱${price.toLocaleString()}</span>
//           ${!isOOS ? `<button class="btn-add" title="Add to order"><i class="fas fa-plus"></i></button>` : ''}
//         </div>
//       </div>`;
//     grid.appendChild(card);
//   });
// };

// // ============================================================
// //  CART
// // ============================================================

// window.addToCart = function (product) {
//   const existing = cart.find(i => i.id === product.id);
//   const stock    = Number(product.quantity || product.stock || 0);
//   const current  = existing ? existing.qty : 0;

//   if (current + 1 > stock) { showToast('Not enough stock!', 'error'); return; }

//   if (existing) {
//     existing.qty++;
//   } else {
//     cart.push({
//       id:    product.id,
//       name:  product.name,
//       price: parseFloat(product.price || product.cost || 0),
//       qty:   1,
//       unit:  product.unit || 'pcs'
//     });
//   }

//   renderCart();
//   showToast(`${product.name} added!`, 'success');
//   if (!document.getElementById('cartDrawer').classList.contains('open')) animateCartBadge();
// };

// window.updateCartQty = function (id, delta) {
//   const item = cart.find(i => i.id === id);
//   if (!item) return;
//   item.qty += delta;
//   if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
//   renderCart();
// };

// function renderCart() {
//   const list    = document.getElementById('cartItemsList');
//   const badge   = document.getElementById('cartBadge');
//   const totalEl = document.getElementById('cartTotal');
//   const btn     = document.getElementById('inquireBtn');

//   const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
//   const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

//   badge.textContent   = totalQty;
//   totalEl.textContent = fmt(totalPrice);
//   btn.disabled        = cart.length === 0;

//   if (cart.length === 0) {
//     list.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>No items added yet</p></div>`;
//     return;
//   }

//   list.innerHTML = '';
//   cart.forEach(item => {
//     const row = document.createElement('div');
//     row.className = 'cart-item-row';
//     row.innerHTML = `
//       <div class="ci-icon">🐷</div>
//       <div class="ci-info">
//         <div class="ci-name">${item.name}</div>
//         <div class="ci-price">${fmt(item.price * item.qty)}</div>
//       </div>
//       <div class="ci-qty">
//         <button onclick="updateCartQty('${item.id}', -1)"><i class="fas fa-minus" style="font-size:10px;"></i></button>
//         <span>${item.qty}</span>
//         <button onclick="updateCartQty('${item.id}', 1)"><i class="fas fa-plus" style="font-size:10px;"></i></button>
//       </div>`;
//     list.appendChild(row);
//   });
// }

// // ============================================================
// //  CART DRAWER
// // ============================================================

// window.toggleCart = function () {
//   const drawer  = document.getElementById('cartDrawer');
//   const overlay = document.getElementById('cartOverlay');
//   drawer.classList.toggle('open');
//   overlay.classList.toggle('open');
//   document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
// };

// // ============================================================
// //  INQUIRY MODAL
// // ============================================================

// window.openInquiryModal = function () {
//   if (cart.length === 0) return;
//   renderInquiryForm(cart.reduce((s, i) => s + i.price * i.qty, 0));
//   document.getElementById('inquiryModal').classList.add('open');
// };

// window.closeInquiryModal = function () {
//   document.getElementById('inquiryModal').classList.remove('open');
// };

// function renderInquiryForm(total) {
//   const today = new Date().toISOString().split('T')[0];
//   document.getElementById('inquiryModalBody').innerHTML = `
//     <div class="order-summary">
//       <h4>Your Order</h4>
//       ${cart.map(i => `
//         <div class="os-item">
//           <span>${i.qty}× ${i.name}</span>
//           <span>${fmt(i.price * i.qty)}</span>
//         </div>`).join('')}
//       <div class="os-total"><span>Total</span><span>${fmt(total)}</span></div>
//     </div>

//     <div class="form-row">
//       <div class="form-group">
//         <label><i class="fas fa-user" style="color:var(--red);margin-right:5px;"></i> Full Name *</label>
//         <input type="text" id="inqName" placeholder="Juan dela Cruz"/>
//       </div>
//       <div class="form-group">
//         <label><i class="fas fa-phone" style="color:var(--red);margin-right:5px;"></i> Phone Number *</label>
//         <input type="tel" id="inqPhone" placeholder="+63 917 000 0000"/>
//       </div>
//     </div>

//     <div class="form-group">
//       <label><i class="fas fa-envelope" style="color:var(--red);margin-right:5px;"></i> Email Address *</label>
//       <input type="email" id="inqEmail" placeholder="juan@gmail.com"/>
//     </div>

//     <div class="form-row">
//       <div class="form-group">
//         <label><i class="fas fa-calendar" style="color:var(--red);margin-right:5px;"></i> Pickup / Delivery Date *</label>
//         <input type="date" id="inqDate" min="${today}"/>
//       </div>
//       <div class="form-group">
//         <label><i class="fas fa-clock" style="color:var(--red);margin-right:5px;"></i> Preferred Time *</label>
//         <input type="time" id="inqTime"/>
//       </div>
//     </div>

//     <div class="form-group">
//       <label><i class="fas fa-comment-alt" style="color:var(--red);margin-right:5px;"></i> Special Instructions</label>
//       <textarea id="inqNotes" rows="3" placeholder="Any special requests, delivery address, event details..."></textarea>
//     </div>

//     <button class="btn-submit-inquiry" id="submitInquiryBtn" onclick="submitInquiry()">
//       <i class="fas fa-paper-plane"></i> Send Inquiry to Gene's Lechon
//     </button>`;
// }

// // ============================================================
// //  SUBMIT INQUIRY → FIRESTORE "inquiries" COLLECTION
// //  Fields match exactly what inquiries.js admin page reads
// // ============================================================

// // ── Max 3 inquiries per day per unique identity ──────────────
// // Fails gracefully if Firestore indexes are not yet created.
// async function checkDailyLimit(name, email, phone) {
//   const MAX   = 3;
//   const now   = new Date();
//   const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
//   const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

//   try {
//     // Single-field range query — no composite index needed
//     const snap = await getDocs(
//       query(collection(db, "inquiries"),
//         where("date", ">=", start),
//         where("date", "<=", end)
//       )
//     );

//     // Filter in JS — check if any of the 3 identifiers match
//     const emailLow = email.toLowerCase();
//     let count = 0;
//     snap.forEach(d => {
//       const data = d.data();
//       if (
//         (data.email    || '').toLowerCase() === emailLow ||
//         (data.phone    || '')               === phone    ||
//         (data.customer || '')               === name
//       ) {
//         count++;
//       }
//     });

//     return { count, blocked: count >= MAX, remaining: Math.max(0, MAX - count) };

//   } catch (err) {
//     console.warn('Rate limit check failed, allowing submission:', err.message);
//     return { count: 0, blocked: false, remaining: MAX };
//   }
// }

// window.submitInquiry = async function () {
//   const name  = document.getElementById('inqName')?.value?.trim();
//   const phone = document.getElementById('inqPhone')?.value?.trim();
//   const email = document.getElementById('inqEmail')?.value?.trim();
//   const date  = document.getElementById('inqDate')?.value;
//   const time  = document.getElementById('inqTime')?.value;
//   const notes = document.getElementById('inqNotes')?.value?.trim() || '';

//   // ── Basic field validation ───────────────────────────────
//   if (!name || !phone || !email || !date || !time) {
//     showToast('Please fill in all required fields!', 'error'); return;
//   }
//   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//     showToast('Please enter a valid email address!', 'error'); return;
//   }

//   const btn = document.getElementById('submitInquiryBtn');
//   btn.disabled  = true;
//   btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

//   try {
//     // ── Rate limit check: max 3 inquiries per day ────────────
//     const limit = await checkDailyLimit(name, email, phone);

//     if (limit.blocked) {
//       showToast('You have reached the maximum of 3 inquiries per day. Please try again tomorrow or call us directly.', 'error');
//       btn.disabled  = false;
//       btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
//       // Show a more prominent warning inside the form
//       showLimitWarning();
//       return;
//     }

//     btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

//     const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

//     // ── Build document — email stored lowercase for consistent matching
//     const inquiryDoc = {
//       orderId:   `#INQ-${Math.floor(100000 + Math.random() * 900000)}`,
//       customer:  name,
//       email:     email.toLowerCase(),
//       phone:     phone,
//       date:      new Date().toISOString(),
//       orderDate: date,
//       orderTime: time,
//       items:     cart.map(i => ({
//         id:    i.id,
//         name:  i.name,
//         price: i.price,
//         qty:   i.qty,
//         unit:  i.unit || 'pcs'
//       })),
//       total:     total,
//       notes:     notes,
//       status:    'pending',
//       source:    'landing_page'
//     };

//     // ── Save to Firestore ────────────────────────────────────
//     await addDoc(collection(db, "inquiries"), inquiryDoc);

//     cart = [];
//     renderCart();

//     // Show remaining count if they still have submissions left
//     const usedAfter = limit.count + 1;
//     const leftAfter = 3 - usedAfter;
//     showSuccessState(name, inquiryDoc.orderId, leftAfter);

//   } catch (err) {
//     console.error("Inquiry submission failed:", err);
//     showToast('Failed to submit. Please try again or call us directly.', 'error');
//     btn.disabled  = false;
//     btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
//   }
// };

// function showLimitWarning() {
//   // Insert a warning box above the submit button if not already shown
//   const existing = document.getElementById('limitWarningBox');
//   if (existing) return;
//   const btn = document.getElementById('submitInquiryBtn');
//   if (!btn) return;
//   const box = document.createElement('div');
//   box.id = 'limitWarningBox';
//   box.style.cssText = `
//     background:#fff0e6; border:2px solid var(--red); border-radius:10px;
//     padding:12px 16px; margin-bottom:14px; font-size:13px; font-weight:600;
//     color:var(--red); display:flex; align-items:flex-start; gap:10px;
//   `;
//   box.innerHTML = `
//     <i class="fas fa-exclamation-triangle" style="margin-top:1px;flex-shrink:0;"></i>
//     <div>
//       <strong>Daily limit reached.</strong><br/>
//       You can submit a maximum of <strong>3 inquiries per day</strong>
//       using the same name, email, or phone number.<br/>
//       Please try again tomorrow or call us at <strong>(088) 123-4567</strong>.
//     </div>`;
//   btn.parentNode.insertBefore(box, btn);
// }

// function showSuccessState(name, orderId, remaining) {
//   const remainingMsg = remaining > 0
//     ? `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
//         You can submit <strong>${remaining} more ${remaining === 1 ? 'inquiry' : 'inquiries'}</strong> today.
//        </p>`
//     : `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
//         You've used all 3 inquiries for today. Need more help? Call us at <strong>(088) 123-4567</strong>.
//        </p>`;

//   document.getElementById('inquiryModalBody').innerHTML = `
//     <div class="success-state">
//       <div class="check-circle">✅</div>
//       <h3>Inquiry Submitted!</h3>
//       <p>Hi <strong>${name}</strong>! Your inquiry <strong>${orderId}</strong> has been received.</p>
//       <p style="margin-top:8px;color:var(--grey);font-size:13px;">
//         Our team will reach out via your email or phone shortly.
//         Thank you for choosing Gene's Lechon! 🐷
//       </p>
//       ${remainingMsg}
//       <button class="btn-done" onclick="closeInquiryModal()">Done</button>
//     </div>`;
// }

// // ============================================================
// //  MOBILE MENU
// // ============================================================

// window.toggleMobileMenu = function () {
//   const menu = document.getElementById('mobileMenu');
//   menu.classList.toggle('open');
//   document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
// };

// // ============================================================
// //  UTILITIES
// // ============================================================

// function fmt(n) {
//   return '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
// }

// function animateCartBadge() {
//   const badge = document.getElementById('cartBadge');
//   badge.style.transform  = 'scale(1.6)';
//   badge.style.transition = 'transform 0.2s';
//   setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
// }

// window.showToast = function (msg, type) {
//   let container = document.getElementById('toastContainer');
//   if (!container) {
//     container = document.createElement('div');
//     container.id = 'toastContainer';
//     document.body.appendChild(container);
//   }
//   const toast = document.createElement('div');
//   toast.className = `toast-item ${type}`;
//   toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
//   container.appendChild(toast);
//   setTimeout(() => toast.remove(), 3000);
// };

// // Init — skeleton cards show until Firebase loads real products
// window.renderProducts([]);








// ============================================================
//  GENE'S LECHON — app.js
//  Landing page: products from Firestore, cart, inquiry → saved to Firestore
//
//  ⚠️  FIRESTORE COMPOSITE INDEXES REQUIRED for rate limiting.
//  Go to: Firebase Console → Firestore → Indexes → Composite
//  Add these 3 indexes on the "inquiries" collection:
//
//  1. Fields: email ASC, date ASC    (Collection scope)
//  2. Fields: phone ASC, date ASC    (Collection scope)
//  3. Fields: customer ASC, date ASC (Collection scope)
//
//  Without these, the daily limit check will fail silently.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getFirestore, collection, onSnapshot, addDoc,
  query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// ── Firebase config ──────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBvsn9hLvi4Tq9mLvoo1-YL1uzbB_ntL7s",
  authDomain:        "pos-and-sales-monitoring.firebaseapp.com",
  projectId:         "pos-and-sales-monitoring",
  storageBucket:     "pos-and-sales-monitoring.firebasestorage.app",
  messagingSenderId: "516453934117",
  appId:             "1:516453934117:web:1783067b8aa6b37373cbcc",
  measurementId:     "G-FT1G64DB9N"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── State ────────────────────────────────────────────────────
let allProducts    = [];
let activeCategory = 'all';
let cart           = [];

// ============================================================
//  FIREBASE LISTENERS
// ============================================================

// Categories → pulled live from Firestore "categories" collection
onSnapshot(collection(db, "categories"), (snap) => {
  const tabs = document.getElementById('catTabs');
  tabs.innerHTML = `<button class="cat-tab ${activeCategory === 'all' ? 'active' : ''}"
    onclick="filterCat('all', this)">All Products</button>`;

  snap.forEach(d => {
    const name = d.data().name;
    tabs.innerHTML += `<button class="cat-tab ${activeCategory === name ? 'active' : ''}"
      onclick="filterCat('${name}', this)">${name}</button>`;
  });
});

// Products → pulled live from Firestore "products" collection
// Any stock change in admin POS instantly reflects here
onSnapshot(collection(db, "products"), (snap) => {
  allProducts = [];
  snap.forEach(d => {
    const data = d.data();
    // Hide archived products from the public landing page
    if (data.status === 'archived' || data.archived === true) return;
    const qty  = data.quantity !== undefined ? Number(data.quantity) : Number(data.stock || 0);
    allProducts.push({ id: d.id, ...data, quantity: isNaN(qty) ? 0 : qty });
  });

  const search = document.getElementById('searchInput')?.value || '';
  renderProducts(applyFilters(allProducts, activeCategory, search));
  updateProductCount();
});

// ============================================================
//  FILTERING
// ============================================================

window.filterCat = function (cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProducts(applyFilters(allProducts, cat, document.getElementById('searchInput')?.value || ''));
};

window.handleSearch = function (val) {
  renderProducts(applyFilters(allProducts, activeCategory, val));
};

function applyFilters(list, cat, search) {
  return list.filter(p => {
    const matchCat    = cat === 'all' || (p.category || '').toLowerCase() === cat.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
}

function updateProductCount() {
  const el = document.getElementById('productCount');
  if (el) el.textContent = `${allProducts.length} product${allProducts.length !== 1 ? 's' : ''} available`;
}

// ============================================================
//  RENDER PRODUCTS
// ============================================================

window.renderProducts = function (list) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--grey);">
        <i class="fas fa-search" style="font-size:40px;opacity:0.3;margin-bottom:12px;display:block;"></i>
        <p style="font-weight:700;font-size:16px;">No products found</p>
      </div>`;
    return;
  }

  list.forEach(p => {
    const qty      = Number(p.quantity || p.stock || 0);
    const isOOS    = qty <= 0;
    const price    = parseFloat(p.price || p.cost || 0);
    const imgUrl   = p.imageUrl || p.image || p.img || p.photoURL || '';
    const lowStock = qty > 0 && qty <= 5;

    const card = document.createElement('div');
    card.className = `product-card ${isOOS ? 'oos' : ''}`;
    if (!isOOS) card.onclick = () => window.addToCart(p);

    card.innerHTML = `
      <div class="card-img-placeholder">
        ${imgUrl ? `<img src="${imgUrl}" alt="${p.name}" onerror="this.parentElement.innerHTML='🐷'"/>` : '🐷'}
      </div>
      ${isOOS ? '<div class="oos-tag">Out of Stock</div>' : ''}
      <div class="card-body">
        <div class="card-name">${p.name}</div>
        <div class="card-unit"></div>
        <div class="card-footer">
          <span class="card-price">₱${price.toLocaleString()}</span>
          ${!isOOS ? `<button class="btn-add" title="Add to order"><i class="fas fa-plus"></i></button>` : ''}
        </div>
      </div>`;
    grid.appendChild(card);
  });
};

// ============================================================
//  CART
// ============================================================

window.addToCart = function (product) {
  const existing = cart.find(i => i.id === product.id);
  const stock    = Number(product.quantity || product.stock || 0);
  const current  = existing ? existing.qty : 0;

  if (current + 1 > stock) { showToast('Not enough stock!', 'error'); return; }

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id:    product.id,
      name:  product.name,
      price: parseFloat(product.price || product.cost || 0),
      qty:   1,
      unit:  product.unit || 'pcs'
    });
  }

  renderCart();
  showToast(`${product.name} added!`, 'success');
  if (!document.getElementById('cartDrawer').classList.contains('open')) animateCartBadge();
};

window.updateCartQty = function (id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  renderCart();
};

function renderCart() {
  const list    = document.getElementById('cartItemsList');
  const badge   = document.getElementById('cartBadge');
  const totalEl = document.getElementById('cartTotal');
  const btn     = document.getElementById('inquireBtn');

  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  badge.textContent   = totalQty;
  totalEl.textContent = fmt(totalPrice);
  btn.disabled        = cart.length === 0;

  if (cart.length === 0) {
    list.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>No items added yet</p></div>`;
    return;
  }

  list.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <div class="ci-icon">🐷</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">${fmt(item.price * item.qty)}</div>
      </div>
      <div class="ci-qty">
        <button onclick="updateCartQty('${item.id}', -1)"><i class="fas fa-minus" style="font-size:10px;"></i></button>
        <span>${item.qty}</span>
        <button onclick="updateCartQty('${item.id}', 1)"><i class="fas fa-plus" style="font-size:10px;"></i></button>
      </div>`;
    list.appendChild(row);
  });
}

// ============================================================
//  CART DRAWER
// ============================================================

window.toggleCart = function () {
  const drawer  = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  drawer.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
};

// ============================================================
//  INQUIRY MODAL
// ============================================================

window.openInquiryModal = function () {
  if (cart.length === 0) return;
  renderInquiryForm(cart.reduce((s, i) => s + i.price * i.qty, 0));
  document.getElementById('inquiryModal').classList.add('open');
};

window.closeInquiryModal = function () {
  document.getElementById('inquiryModal').classList.remove('open');
};

// ── Time validation helpers ───────────────────────────────────
function isNightTimeBlocked(timeStr) {
  if (!timeStr) return false;
  const [h] = timeStr.split(':').map(Number);
  // Block 12 AM (00:xx) to 3:59 AM (03:xx)
  return h >= 0 && h < 4;
}
function isOutsideStoreHours(timeStr) {
  if (!timeStr) return false;
  const [h, m] = timeStr.split(':').map(Number);
  const mins = h * 60 + m;
  return mins < 8 * 60 || mins > 22 * 60; // before 8 AM or after 10 PM
}

window.toggleDeliveryFields = function () {
  const type    = document.getElementById('inqType')?.value;
  const wrapper = document.getElementById('deliveryAddressWrap');
  if (wrapper) wrapper.style.display = (type === 'delivery') ? 'block' : 'none';
};

window.validateInqTime = function (val) {
  const hint = document.getElementById('inqTimeHint');
  const type = document.getElementById('inqType')?.value;
  if (!hint) return;
  if (type === 'delivery' && isNightTimeBlocked(val)) {
    hint.textContent = '⛔ No deliveries from 12:00 AM to 4:00 AM.';
    hint.style.color = 'var(--red)'; hint.style.fontWeight = '700';
  } else if (isOutsideStoreHours(val)) {
    hint.textContent = '⛔ Outside store hours (8:00 AM – 10:00 PM).';
    hint.style.color = 'var(--red)'; hint.style.fontWeight = '700';
  } else {
    hint.textContent = 'Store hours: 8:00 AM – 10:00 PM · No delivery 12:00 AM – 4:00 AM';
    hint.style.color = 'var(--grey)'; hint.style.fontWeight = '';
  }
};

function renderInquiryForm(total) {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('inquiryModalBody').innerHTML = `
    <div class="order-summary">
      <h4>Your Order</h4>
      ${cart.map(i => `
        <div class="os-item">
          <span>${i.qty}× ${i.name}</span>
          <span>${fmt(i.price * i.qty)}</span>
        </div>`).join('')}
      <div class="os-total"><span>Total</span><span>${fmt(total)}</span></div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label><i class="fas fa-user" style="color:var(--red);margin-right:5px;"></i> Full Name *</label>
        <input type="text" id="inqName" placeholder="Juan dela Cruz"/>
      </div>
      <div class="form-group">
        <label><i class="fas fa-phone" style="color:var(--red);margin-right:5px;"></i> Phone Number *</label>
        <input type="tel" id="inqPhone" placeholder="+63 917 000 0000"/>
      </div>
    </div>

    <div class="form-group">
      <label><i class="fas fa-envelope" style="color:var(--red);margin-right:5px;"></i> Email Address *</label>
      <input type="email" id="inqEmail" placeholder="juan@gmail.com"/>
    </div>

    <div class="form-group">
      <label><i class="fas fa-truck" style="color:var(--red);margin-right:5px;"></i> Order Type *</label>
      <select id="inqType" onchange="toggleDeliveryFields()">
        <option value="pickup">🏪 Pickup at Store</option>
        <option value="delivery">🚚 Delivery</option>
      </select>
    </div>

    <div id="deliveryAddressWrap" style="display:none;">
      <div class="form-group">
        <label><i class="fas fa-map-marker-alt" style="color:var(--red);margin-right:5px;"></i> Street / House No. / Landmark *</label>
        <input type="text" id="inqStreet" placeholder="e.g. 123 Rizal St., near 7-Eleven"/>
      </div>
      <div class="form-group">
        <label><i class="fas fa-map" style="color:var(--red);margin-right:5px;"></i> Barangay *</label>
        <input type="text" id="inqBarangay" placeholder="e.g. Bulua, Lapasan, Nazareth..."/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>City / Municipality</label>
          <input type="text" value="Cagayan de Oro City" readonly style="background:#f5f5f5;color:var(--grey);cursor:not-allowed;"/>
        </div>
        <div class="form-group">
          <label>Province</label>
          <input type="text" value="Misamis Oriental" readonly style="background:#f5f5f5;color:var(--grey);cursor:not-allowed;"/>
        </div>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label><i class="fas fa-calendar" style="color:var(--red);margin-right:5px;"></i> Pickup / Delivery Date *</label>
        <input type="date" id="inqDate" min="${today}"/>
      </div>
      <div class="form-group">
        <label><i class="fas fa-clock" style="color:var(--red);margin-right:5px;"></i> Preferred Time *</label>
        <input type="time" id="inqTime" onchange="validateInqTime(this.value)"/>
        <small id="inqTimeHint" style="color:var(--grey);font-size:11px;margin-top:4px;display:block;">
          Store hours: 8:00 AM – 10:00 PM · No delivery 12:00 AM – 4:00 AM
        </small>
      </div>
    </div>

    <div class="form-group">
      <label><i class="fas fa-comment-alt" style="color:var(--red);margin-right:5px;"></i> Special Instructions</label>
      <textarea id="inqNotes" rows="3" placeholder="Any special requests, event details..."></textarea>
    </div>

    <button class="btn-submit-inquiry" id="submitInquiryBtn" onclick="submitInquiry()">
      <i class="fas fa-paper-plane"></i> Send Inquiry to Gene's Lechon
    </button>`;
}

// ============================================================
//  SUBMIT INQUIRY → FIRESTORE "inquiries" COLLECTION
//  Fields match exactly what inquiries.js admin page reads
// ============================================================

// ── Max 3 inquiries per day per unique identity ──────────────
// Fails gracefully if Firestore indexes are not yet created.
async function checkDailyLimit(name, email, phone) {
  const MAX   = 3;
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

  try {
    // Single-field range query — no composite index needed
    const snap = await getDocs(
      query(collection(db, "inquiries"),
        where("date", ">=", start),
        where("date", "<=", end)
      )
    );

    // Filter in JS — check if any of the 3 identifiers match
    const emailLow = email.toLowerCase();
    let count = 0;
    snap.forEach(d => {
      const data = d.data();
      if (
        (data.email    || '').toLowerCase() === emailLow ||
        (data.phone    || '')               === phone    ||
        (data.customer || '')               === name
      ) {
        count++;
      }
    });

    return { count, blocked: count >= MAX, remaining: Math.max(0, MAX - count) };

  } catch (err) {
    console.warn('Rate limit check failed, allowing submission:', err.message);
    return { count: 0, blocked: false, remaining: MAX };
  }
}

window.submitInquiry = async function () {
  const name    = document.getElementById('inqName')?.value?.trim();
  const phone   = document.getElementById('inqPhone')?.value?.trim();
  const email   = document.getElementById('inqEmail')?.value?.trim();
  const date    = document.getElementById('inqDate')?.value;
  const time    = document.getElementById('inqTime')?.value;
  const notes   = document.getElementById('inqNotes')?.value?.trim() || '';
  const type    = document.getElementById('inqType')?.value || 'pickup';
  const street  = document.getElementById('inqStreet')?.value?.trim() || '';
  const barangay= document.getElementById('inqBarangay')?.value?.trim() || '';

  // ── Basic field validation ───────────────────────────────
  if (!name || !phone || !email || !date || !time) {
    showToast('Please fill in all required fields!', 'error'); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address!', 'error'); return;
  }

  // ── Time validation ──────────────────────────────────────
  if (isOutsideStoreHours(time)) {
    showToast('Please choose a time within store hours (8:00 AM – 10:00 PM).', 'error'); return;
  }
  if (type === 'delivery' && isNightTimeBlocked(time)) {
    showToast('No deliveries from 12:00 AM to 4:00 AM. Please choose a later time.', 'error'); return;
  }

  // ── Delivery address validation ──────────────────────────
  if (type === 'delivery') {
    if (!street)   { showToast('Please enter your street / house address.', 'error'); return; }
    if (!barangay) { showToast('Please enter your barangay.', 'error'); return; }
  }

  const btn = document.getElementById('submitInquiryBtn');
  btn.disabled  = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';

  try {
    // ── Rate limit check: max 3 inquiries per day ────────────
    const limit = await checkDailyLimit(name, email, phone);

    if (limit.blocked) {
      showToast('You have reached the maximum of 3 inquiries per day. Please try again tomorrow or call us directly.', 'error');
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
      // Show a more prominent warning inside the form
      showLimitWarning();
      return;
    }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const deliveryAddress = type === 'delivery'
      ? `${street}, ${barangay}, Cagayan de Oro City, Misamis Oriental`
      : '';

    // ── Build document — email stored lowercase for consistent matching
    const inquiryDoc = {
      orderId:          `#INQ-${Math.floor(100000 + Math.random() * 900000)}`,
      customer:         name,
      email:            email.toLowerCase(),
      phone:            phone,
      date:             new Date().toISOString(),
      orderDate:        date,
      orderTime:        time,
      orderType:        type,
      deliveryAddress:  deliveryAddress,
      deliveryStreet:   street,
      deliveryBarangay: barangay,
      deliveryCity:     type === 'delivery' ? 'Cagayan de Oro City' : '',
      deliveryProvince: type === 'delivery' ? 'Misamis Oriental' : '',
      items:     cart.map(i => ({
        id:    i.id,
        name:  i.name,
        price: i.price,
        qty:   i.qty,
        unit:  i.unit || 'pcs'
      })),
      total:     total,
      notes:     notes,
      status:    'pending',
      source:    'landing_page'
    };

    // ── Save to Firestore ────────────────────────────────────
    await addDoc(collection(db, "inquiries"), inquiryDoc);

    cart = [];
    renderCart();

    // Show remaining count if they still have submissions left
    const usedAfter = limit.count + 1;
    const leftAfter = 3 - usedAfter;
    showSuccessState(name, inquiryDoc.orderId, leftAfter);

  } catch (err) {
    console.error("Inquiry submission failed:", err);
    showToast('Failed to submit. Please try again or call us directly.', 'error');
    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Inquiry to Gene\'s Lechon';
  }
};

function showLimitWarning() {
  // Insert a warning box above the submit button if not already shown
  const existing = document.getElementById('limitWarningBox');
  if (existing) return;
  const btn = document.getElementById('submitInquiryBtn');
  if (!btn) return;
  const box = document.createElement('div');
  box.id = 'limitWarningBox';
  box.style.cssText = `
    background:#fff0e6; border:2px solid var(--red); border-radius:10px;
    padding:12px 16px; margin-bottom:14px; font-size:13px; font-weight:600;
    color:var(--red); display:flex; align-items:flex-start; gap:10px;
  `;
  box.innerHTML = `
    <i class="fas fa-exclamation-triangle" style="margin-top:1px;flex-shrink:0;"></i>
    <div>
      <strong>Daily limit reached.</strong><br/>
      You can submit a maximum of <strong>3 inquiries per day</strong>
      using the same name, email, or phone number.<br/>
      Please try again tomorrow or call us at <strong>(088) 123-4567</strong>.
    </div>`;
  btn.parentNode.insertBefore(box, btn);
}

function showSuccessState(name, orderId, remaining) {
  const remainingMsg = remaining > 0
    ? `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
        You can submit <strong>${remaining} more ${remaining === 1 ? 'inquiry' : 'inquiries'}</strong> today.
       </p>`
    : `<p style="margin-top:10px;font-size:12px;color:var(--grey);">
        You've used all 3 inquiries for today. Need more help? Call us at <strong>(088) 123-4567</strong>.
       </p>`;

  document.getElementById('inquiryModalBody').innerHTML = `
    <div class="success-state">
      <div class="check-circle">✅</div>
      <h3>Inquiry Submitted!</h3>
      <p>Hi <strong>${name}</strong>! Your inquiry <strong>${orderId}</strong> has been received.</p>
      <p style="margin-top:8px;color:var(--grey);font-size:13px;">
        Our team will reach out via your email or phone shortly.
        Thank you for choosing Gene's Lechon! 🐷
      </p>
      ${remainingMsg}
      <button class="btn-done" onclick="closeInquiryModal()">Done</button>
    </div>`;
}

// ============================================================
//  MOBILE MENU
// ============================================================

window.toggleMobileMenu = function () {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
};

// ============================================================
//  UTILITIES
// ============================================================

function fmt(n) {
  return '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function animateCartBadge() {
  const badge = document.getElementById('cartBadge');
  badge.style.transform  = 'scale(1.6)';
  badge.style.transition = 'transform 0.2s';
  setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
}

window.showToast = function (msg, type) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

// Init — skeleton cards show until Firebase loads real products
window.renderProducts([]);

// ============================================================
//  INQUIRY TRACKER
//  Customers can look up their inquiry by:
//    - Inquiry ID (e.g. INQ-358778)
//    - Email address
//    - Phone number
// ============================================================

window.openTracker = function () {
  document.getElementById('trackerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  // reset each time
  document.getElementById('trackInput').value = '';
  document.getElementById('trackResult').innerHTML = '';
  document.getElementById('trackInput').focus();
};

window.closeTracker = function () {
  document.getElementById('trackerModal').classList.remove('open');
  document.body.style.overflow = '';
};

window.clearTrackResult = function () {
  document.getElementById('trackResult').innerHTML = '';
};

window.searchInquiry = async function () {
  const raw = (document.getElementById('trackInput').value || '').trim();
  if (!raw) { showToast('Please enter an Inquiry ID, email, or phone number.', 'error'); return; }

  const resultEl = document.getElementById('trackResult');
  const btn      = document.getElementById('trackBtn');
  btn.disabled   = true;
  btn.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Searching…';

  resultEl.innerHTML = `
    <div class="track-loading">
      <div class="track-spinner"></div>
      <p style="color:var(--grey);font-size:13px;font-weight:600;">Looking up your inquiry…</p>
    </div>`;

  try {
    const inqCol = collection(db, 'inquiries');
    let found    = null;

    // ── 1. Try by Order ID (orderId field, case-insensitive via exact match)
    const upperRaw = raw.toUpperCase();
    const q1 = query(inqCol, where('orderId', '==', upperRaw));
    const s1 = await getDocs(q1);
    if (!s1.empty) { found = { id: s1.docs[0].id, ...s1.docs[0].data() }; }

    // ── 2. Try by email
    if (!found) {
      const q2 = query(inqCol, where('email', '==', raw.toLowerCase()));
      const s2  = await getDocs(q2);
      if (!s2.empty) {
        // if multiple, pick the most recent (highest orderId or latest date)
        const sorted = s2.docs.sort((a, b) => {
          const aDate = (a.data().createdAt?.seconds || 0);
          const bDate = (b.data().createdAt?.seconds || 0);
          return bDate - aDate;
        });
        found = { id: sorted[0].id, ...sorted[0].data() };
      }
    }

    // ── 3. Try by phone
    if (!found) {
      const cleaned = raw.replace(/\D/g, '');   // strip non-digits for comparison
      // Query as-is first
      const q3 = query(inqCol, where('phone', '==', raw));
      const s3  = await getDocs(q3);
      if (!s3.empty) {
        const sorted = s3.docs.sort((a, b) => ((b.data().createdAt?.seconds||0) - (a.data().createdAt?.seconds||0)));
        found = { id: sorted[0].id, ...sorted[0].data() };
      }
    }

    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-search"></i> Find Inquiry';

    if (!found) {
      resultEl.innerHTML = `
        <div class="track-not-found">
          <i class="fas fa-search-minus"></i>
          <p>No inquiry found for "<strong>${escHtml(raw)}</strong>".<br>
          Double-check your ID, email, or phone number.</p>
        </div>`;
      return;
    }

    renderTrackResult(found, resultEl);

  } catch (err) {
    console.error('Tracker error:', err);
    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-search"></i> Find Inquiry';
    resultEl.innerHTML = `
      <div class="track-not-found">
        <i class="fas fa-exclamation-circle"></i>
        <p>Something went wrong. Please try again in a moment.</p>
      </div>`;
  }
};

function renderTrackResult (inq, el) {
  const status    = (inq.status || 'pending').toLowerCase();
  const statusMap = { pending: 'Pending', confirmed: 'Confirmed', ready: 'Ready', cancelled: 'Cancelled' };
  const statusLabel = statusMap[status] || status;

  // Build items list HTML
  const items = Array.isArray(inq.items) ? inq.items : [];
  const itemsHtml = items.length
    ? items.map(i => `
        <div class="track-item-row">
          <span>${escHtml(i.qty || 1)}× ${escHtml(i.name)}</span>
          <span>₱${parseFloat(i.price * (i.qty||1)).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
        </div>`).join('')
    : '<div style="color:var(--grey);font-size:13px;">No items recorded.</div>';

  const total = inq.total || items.reduce((s,i)=>s+(parseFloat(i.price||0)*(i.qty||1)),0);

  // Dates
  const submittedStr = inq.createdAt
    ? new Date(inq.createdAt.seconds * 1000).toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})
    : (inq.date || '—');
  const pickupStr = inq.pickupDate || inq.date || '—';

  // Timeline steps
  const steps = ['pending','confirmed','ready'];
  const cancelledSteps = ['pending','cancelled'];
  const activeSteps = status === 'cancelled' ? cancelledSteps : steps;
  const statusOrder = ['pending','confirmed','ready','cancelled'];
  const currentIdx  = statusOrder.indexOf(status);

  const timelineSteps = [
    { key:'pending',   icon:'fa-clock',        label:'Submitted'  },
    { key:'confirmed', icon:'fa-check-circle',  label:'Confirmed'  },
    { key:'ready',     icon:'fa-box-open',      label:'Ready'      },
  ];
  if (status === 'cancelled') {
    timelineSteps.push({ key:'cancelled', icon:'fa-times-circle', label:'Cancelled' });
  }

  const timelineHtml = timelineSteps.map((step, idx) => {
    const stepIdx   = statusOrder.indexOf(step.key);
    const isDone    = stepIdx < currentIdx || (step.key === status && status !== 'pending');
    const isActive  = step.key === status;
    const cls       = isDone ? 'done' : isActive ? 'active' : '';
    return `
      <div class="track-step ${cls}">
        <div class="track-step-dot"><i class="fas ${step.icon}" style="font-size:11px;"></i></div>
        <div class="track-step-label">${step.label}</div>
      </div>`;
  }).join('');

  const statusNote = {
    pending:   '⏳ Your inquiry has been received. We\'ll confirm it shortly!',
    confirmed: '✅ Great news! Your order is confirmed. We\'re preparing it.',
    ready:     '🎉 Your order is ready for pickup / delivery!',
    cancelled: '❌ This inquiry was cancelled. Please contact us if this is a mistake.',
  }[status] || '';

  el.innerHTML = `
    <div class="track-result-card">
      <div class="track-result-header">
        <span class="track-order-id">${escHtml(inq.orderId || inq.id)}</span>
        <span class="track-status-pill ${status}">${statusLabel}</span>
      </div>
      <div class="track-result-body">

        <p style="font-size:13px;font-weight:600;color:var(--dark);background:white;border-radius:8px;padding:10px 14px;border-left:3px solid var(--red);">
          ${statusNote}
        </p>

        <!-- Timeline -->
        <div class="track-status-timeline">${timelineHtml}</div>

        <!-- Customer info -->
        <div class="track-info-row">
          <i class="fas fa-user"></i>
          <span class="track-info-label">Name</span>
          <span class="track-info-value">${escHtml(inq.customer || inq.name || '—')}</span>
        </div>
        <div class="track-info-row">
          <i class="fas fa-calendar"></i>
          <span class="track-info-label">Submitted</span>
          <span class="track-info-value">${submittedStr}</span>
        </div>
        <div class="track-info-row">
          <i class="fas fa-truck"></i>
          <span class="track-info-label">Pickup Date</span>
          <span class="track-info-value">${escHtml(pickupStr)}</span>
        </div>
        ${inq.time ? `
        <div class="track-info-row">
          <i class="fas fa-clock"></i>
          <span class="track-info-label">Time</span>
          <span class="track-info-value">${escHtml(inq.time)}</span>
        </div>` : ''}

        <!-- Items -->
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--grey);margin-top:6px;">Order Items</div>
        <div class="track-items-list">
          ${itemsHtml}
          <div class="track-total-row">
            <span>Total</span>
            <span>₱${parseFloat(total).toLocaleString(undefined,{minimumFractionDigits:2})}</span>
          </div>
        </div>

        ${inq.notes ? `
        <div class="track-info-row" style="align-items:flex-start;">
          <i class="fas fa-comment-alt" style="margin-top:2px;"></i>
          <span class="track-info-label">Notes</span>
          <span class="track-info-value">${escHtml(inq.notes)}</span>
        </div>` : ''}

        <p style="font-size:12px;color:var(--grey);text-align:center;margin-top:6px;">
          Questions? Call us at <strong>(088) 123-4567</strong> or message us on Facebook.
        </p>
      </div>
    </div>`;
}

function escHtml (str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}