// ---------------------------------------------------------------------------
// LOCAL CATALOG (stand-in for a fetched JSON file)
// ---------------------------------------------------------------------------
const CATALOG = [
  { id: "c01", name: "Yirgacheffe Washed", origin: "Ethiopia", process: "Washed", roast: "Light", price: 19.5, weight: "12oz", notes: "Jasmine, bergamot, lemon curd", badge: "New Crop", gradient: ["#E8C48A", "#C89A5C"] },
  { id: "c02", name: "Guji Natural", origin: "Ethiopia", process: "Natural", roast: "Light", price: 21.0, weight: "12oz", notes: "Blueberry, cacao nib, wine", badge: "Limited", gradient: ["#DBA6A0", "#A64B3E"] },
  { id: "c03", name: "Huila Caturra", origin: "Colombia", process: "Washed", roast: "Medium", price: 17.75, weight: "12oz", notes: "Red apple, brown sugar, almond", badge: null, gradient: ["#C68A56", "#8A5A34"] },
  { id: "c04", name: "Tolima Honey", origin: "Colombia", process: "Honey", roast: "Medium", price: 18.5, weight: "12oz", notes: "Dried fig, molasses, orange zest", badge: null, gradient: ["#B97A48", "#734B29"] },
  { id: "c05", name: "Kayon Mountain", origin: "Ethiopia", process: "Washed", roast: "Medium", price: 22.0, weight: "12oz", notes: "Peach, honeysuckle, black tea", badge: "Staff Pick", gradient: ["#CB9C6C", "#8F6438"] },
  { id: "c06", name: "Mandailing Estate", origin: "Sumatra", process: "Wet-Hulled", roast: "Dark", price: 16.5, weight: "12oz", notes: "Cedar, dark chocolate, tobacco", badge: null, gradient: ["#6E4B32", "#2E1E14"] },
  { id: "c07", name: "Toraja Sapan", origin: "Sumatra", process: "Wet-Hulled", roast: "Dark", price: 17.25, weight: "12oz", notes: "Earth, clove, dark caramel", badge: null, gradient: ["#5E4029", "#271A12"] },
  { id: "c08", name: "Cerrado Pulped Natural", origin: "Brazil", process: "Pulped Natural", roast: "Medium", price: 14.5, weight: "12oz", notes: "Hazelnut, milk chocolate, walnut", badge: "Everyday", gradient: ["#BE8752", "#7C5230"] },
  { id: "c09", name: "Mogiana Reserve", origin: "Brazil", process: "Natural", roast: "Dark", price: 15.75, weight: "12oz", notes: "Roasted almond, molasses, tobacco", badge: null, gradient: ["#5A3B24", "#241811"] },
  { id: "c10", name: "Kirinyaga Peaberry", origin: "Kenya", process: "Washed", roast: "Light", price: 23.5, weight: "12oz", notes: "Blackcurrant, grapefruit, tamarind", badge: "Limited", gradient: ["#DCAF7C", "#B06A4A"] },
  { id: "c11", name: "Nyeri AA", origin: "Kenya", process: "Washed", roast: "Medium", price: 21.75, weight: "12oz", notes: "Tomato, cassis, brown spice", badge: null, gradient: ["#C99A64", "#8C5D33"] },
  { id: "c12", name: "Marcala Reserva", origin: "Honduras", process: "Honey", roast: "Medium", price: 16.95, weight: "12oz", notes: "Plum, panela, toasted pecan", badge: "Staff Pick", gradient: ["#BD8850", "#7A502C"] },
  { id: "c13", name: "Cascabel Decaf", origin: "Mexico", process: "Sugarcane EA", roast: "Medium", price: 18.0, weight: "12oz", notes: "Cocoa, cherry, soft spice", badge: "Decaf", gradient: ["#B78654", "#6E4A2A"] },
  { id: "c14", name: "Uraga Washed", origin: "Ethiopia", process: "Washed", roast: "Light", price: 20.25, weight: "12oz", notes: "White grape, chamomile, lime", badge: null, gradient: ["#E4C088", "#BC8E58"] },
];

const ROAST_ORDER = ["Light", "Medium", "Dark"];
const PRICE_MIN = 10;
const PRICE_MAX = 25;

// ---------------------------------------------------------------------------
// STATE
// ---------------------------------------------------------------------------
const state = {
  query: "",
  origins: [],
  processes: [],
  roasts: [],
  maxPrice: PRICE_MAX,
  sort: "relevance",
  cart: {},      // { id: qty } -- in-memory session cart
  cartOpen: false,
};

const uniq = (key) => [...new Set(CATALOG.map((c) => c[key]))].sort();
const originOptions = uniq("origin");
const processOptions = uniq("process");

// ---------------------------------------------------------------------------
// DOM REFS
// ---------------------------------------------------------------------------
const el = {
  cartToggle: document.getElementById("cart-toggle"),
  cartCount: document.getElementById("cart-count"),
  clearFilters: document.getElementById("clear-filters"),
  filterOrigin: document.getElementById("filter-origin"),
  filterProcess: document.getElementById("filter-process"),
  filterRoast: document.getElementById("filter-roast"),
  priceLabel: document.getElementById("price-label"),
  priceRange: document.getElementById("price-range"),
  searchInput: document.getElementById("search-input"),
  sortSelect: document.getElementById("sort-select"),
  resultCount: document.getElementById("result-count"),
  emptyState: document.getElementById("empty-state"),
  emptyClear: document.getElementById("empty-clear"),
  productGrid: document.getElementById("product-grid"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartBackdrop: document.getElementById("cart-backdrop"),
  cartClose: document.getElementById("cart-close"),
  cartBody: document.getElementById("cart-body"),
  cartFooter: document.getElementById("cart-footer"),
  cartTotal: document.getElementById("cart-total"),
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function toggleValue(arr, val) {
  const idx = arr.indexOf(val);
  if (idx === -1) arr.push(val);
  else arr.splice(idx, 1);
  return arr;
}

function hasActiveFilters() {
  return Boolean(
    state.query || state.origins.length || state.processes.length || state.roasts.length || state.maxPrice < PRICE_MAX
  );
}

function getFilteredList() {
  const q = state.query.trim().toLowerCase();
  let list = CATALOG.filter((item) => {
    const matchesQuery =
      !q || item.name.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q) || item.origin.toLowerCase().includes(q);
    const matchesOrigin = state.origins.length === 0 || state.origins.includes(item.origin);
    const matchesProcess = state.processes.length === 0 || state.processes.includes(item.process);
    const matchesRoast = state.roasts.length === 0 || state.roasts.includes(item.roast);
    const matchesPrice = item.price <= state.maxPrice;
    return matchesQuery && matchesOrigin && matchesProcess && matchesRoast && matchesPrice;
  });

  if (state.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (state.sort === "roast-light") list = [...list].sort((a, b) => ROAST_ORDER.indexOf(a.roast) - ROAST_ORDER.indexOf(b.roast));

  return list;
}

function getCartItems() {
  return Object.entries(state.cart)
    .map(([id, qty]) => ({ item: CATALOG.find((c) => c.id === id), qty }))
    .filter((line) => line.item); // guard against stale ids
}

// ---------------------------------------------------------------------------
// CART ACTIONS
// ---------------------------------------------------------------------------
function addToCart(id) {
  state.cart[id] = (state.cart[id] || 0) + 1;
  renderAll();
}

function removeFromCart(id) {
  if (!state.cart[id]) return;
  if (state.cart[id] <= 1) delete state.cart[id];
  else state.cart[id] -= 1;
  renderAll();
}

function deleteLine(id) {
  delete state.cart[id];
  renderAll();
}

// ---------------------------------------------------------------------------
// RENDER: FILTER GROUPS
// ---------------------------------------------------------------------------
function renderFilterGroup(container, title, options, selected, onToggle) {
  container.innerHTML = "";
  container.className = "filter-group";

  const heading = document.createElement("h4");
  heading.className = "eyebrow";
  heading.textContent = title;
  container.appendChild(heading);

  const wrap = document.createElement("div");
  wrap.className = "filter-options";

  options.forEach((opt) => {
    const label = document.createElement("label");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = selected.includes(opt);
    input.addEventListener("change", () => {
      onToggle(opt);
      renderAll();
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(opt));
    wrap.appendChild(label);
  });

  container.appendChild(wrap);
}

function renderFilters() {
  renderFilterGroup(el.filterOrigin, "Origin", originOptions, state.origins, (val) => toggleValue(state.origins, val));
  renderFilterGroup(el.filterProcess, "Process", processOptions, state.processes, (val) => toggleValue(state.processes, val));
  renderFilterGroup(el.filterRoast, "Roast Level", ROAST_ORDER, state.roasts, (val) => toggleValue(state.roasts, val));

  el.priceLabel.textContent = `$${state.maxPrice.toFixed(2)}`;
  el.priceRange.value = state.maxPrice;

  el.clearFilters.classList.toggle("hidden", !hasActiveFilters());
}

// ---------------------------------------------------------------------------
// RENDER: PRODUCT GRID
// ---------------------------------------------------------------------------
function roastGaugeHTML(roast) {
  const idx = ROAST_ORDER.indexOf(roast);
  const pct = (idx / (ROAST_ORDER.length - 1)) * 100;
  return `
    <div class="gauge">
      <div class="gauge-track">
        <div class="gauge-dot" style="left: calc(${pct}% - 6px);"></div>
      </div>
      <span class="gauge-label">${roast}</span>
    </div>
  `;
}

function coffeeIconSVG(cls) {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`;
}

function buildCard(item, qty) {
  const card = document.createElement("div");
  card.className = "card";

  const top = document.createElement("div");
  top.className = "card-top";
  top.style.background = `linear-gradient(155deg, ${item.gradient[0]}, ${item.gradient[1]})`;

  if (item.badge) {
    const badge = document.createElement("span");
    badge.className = "card-badge";
    badge.textContent = item.badge;
    top.appendChild(badge);
  }

  const coffeeIcon = document.createElement("span");
  coffeeIcon.className = "card-coffee-icon";
  coffeeIcon.innerHTML = coffeeIconSVG("");
  top.appendChild(coffeeIcon);

  const origin = document.createElement("span");
  origin.className = "card-origin";
  origin.textContent = item.origin;
  top.appendChild(origin);

  const body = document.createElement("div");
  body.className = "card-body";

  body.innerHTML = `
    <div>
      <h3 class="card-name">${item.name}</h3>
      <p class="card-notes">${item.notes}</p>
    </div>
    ${roastGaugeHTML(item.roast)}
    <div class="card-tags">
      <span>${item.process}</span>
      <span>${item.weight}</span>
    </div>
    <div class="card-footer">
      <span class="card-price">$${item.price.toFixed(2)}</span>
      <div class="footer-action"></div>
    </div>
  `;

  const footerAction = body.querySelector(".footer-action");

  if (qty > 0) {
    const stepper = document.createElement("div");
    stepper.className = "qty-stepper";

    const minusBtn = document.createElement("button");
    minusBtn.setAttribute("aria-label", `Remove one ${item.name}`);
    minusBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>`;
    minusBtn.addEventListener("click", () => removeFromCart(item.id));

    const qtyLabel = document.createElement("span");
    qtyLabel.textContent = qty;

    const plusBtn = document.createElement("button");
    plusBtn.setAttribute("aria-label", `Add one more ${item.name}`);
    plusBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;
    plusBtn.addEventListener("click", () => addToCart(item.id));

    stepper.appendChild(minusBtn);
    stepper.appendChild(qtyLabel);
    stepper.appendChild(plusBtn);
    footerAction.appendChild(stepper);
  } else {
    const addBtn = document.createElement("button");
    addBtn.className = "add-btn";
    addBtn.textContent = "Add to bag";
    addBtn.addEventListener("click", () => addToCart(item.id));
    footerAction.appendChild(addBtn);
  }

  card.appendChild(top);
  card.appendChild(body);
  return card;
}

function renderProductGrid() {
  const filtered = getFilteredList();

  el.resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "bag" : "bags"}`;

  if (filtered.length === 0) {
    el.emptyState.classList.remove("hidden");
    el.productGrid.classList.add("hidden");
    el.productGrid.innerHTML = "";
    return;
  }

  el.emptyState.classList.add("hidden");
  el.productGrid.classList.remove("hidden");
  el.productGrid.innerHTML = "";

  filtered.forEach((item) => {
    const qty = state.cart[item.id] || 0;
    el.productGrid.appendChild(buildCard(item, qty));
  });
}

// ---------------------------------------------------------------------------
// RENDER: CART DRAWER
// ---------------------------------------------------------------------------
function renderCart() {
  const cartItems = getCartItems();
  const cartCount = cartItems.reduce((sum, { qty }) => sum + qty, 0);
  const cartTotal = cartItems.reduce((sum, { item, qty }) => sum + item.price * qty, 0);

  el.cartCount.textContent = cartCount;
  el.cartCount.classList.toggle("hidden", cartCount === 0);

  el.cartBody.innerHTML = "";

  if (cartItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Your bag is empty.";
    el.cartBody.appendChild(empty);
    el.cartFooter.classList.add("hidden");
  } else {
    cartItems.forEach(({ item, qty }) => {
      const line = document.createElement("div");
      line.className = "cart-line";

      const thumb = document.createElement("div");
      thumb.className = "cart-thumb";
      thumb.style.background = `linear-gradient(155deg, ${item.gradient[0]}, ${item.gradient[1]})`;

      const info = document.createElement("div");
      info.className = "cart-line-info";
      info.innerHTML = `
        <div class="cart-line-top">
          <p>${item.name}</p>
          <button aria-label="Remove ${item.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
        <div class="cart-line-bottom">
          <div class="qty-stepper">
            <button aria-label="Remove one ${item.name}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg></button>
            <span>${qty}</span>
            <button aria-label="Add one more ${item.name}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg></button>
          </div>
          <span class="cart-line-price">$${(item.price * qty).toFixed(2)}</span>
        </div>
      `;

      info.querySelector(".cart-line-top button").addEventListener("click", () => deleteLine(item.id));
      const steppButtons = info.querySelectorAll(".qty-stepper button");
      steppButtons[0].addEventListener("click", () => removeFromCart(item.id));
      steppButtons[1].addEventListener("click", () => addToCart(item.id));

      line.appendChild(thumb);
      line.appendChild(info);
      el.cartBody.appendChild(line);
    });

    el.cartFooter.classList.remove("hidden");
    el.cartTotal.textContent = `$${cartTotal.toFixed(2)}`;
  }
}

// ---------------------------------------------------------------------------
// RENDER ALL
// ---------------------------------------------------------------------------
function renderAll() {
  renderFilters();
  renderProductGrid();
  renderCart();
}

// ---------------------------------------------------------------------------
// EVENTS
// ---------------------------------------------------------------------------
el.searchInput.addEventListener("input", (e) => {
  state.query = e.target.value;
  renderAll();
});

el.sortSelect.addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderAll();
});

el.priceRange.addEventListener("input", (e) => {
  state.maxPrice = parseFloat(e.target.value);
  renderAll();
});

function clearAllFilters() {
  state.query = "";
  state.origins = [];
  state.processes = [];
  state.roasts = [];
  state.maxPrice = PRICE_MAX;
  state.sort = "relevance";
  el.searchInput.value = "";
  el.sortSelect.value = "relevance";
  renderAll();
}

el.clearFilters.addEventListener("click", clearAllFilters);
el.emptyClear.addEventListener("click", clearAllFilters);

function openCart() {
  state.cartOpen = true;
  el.cartOverlay.classList.remove("hidden");
}
function closeCart() {
  state.cartOpen = false;
  el.cartOverlay.classList.add("hidden");
}

el.cartToggle.addEventListener("click", openCart);
el.cartClose.addEventListener("click", closeCart);
el.cartBackdrop.addEventListener("click", closeCart);

// ---------------------------------------------------------------------------
// INIT
// ---------------------------------------------------------------------------
renderAll();