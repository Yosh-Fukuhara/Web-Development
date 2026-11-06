/* ===========================================================
   One Piece TCG Card Library - Logic
   Implements pagination, button-based filters, and official styling.
   =========================================================== */

// --- Config -----------------------------------------------------------------
const API_URL = "https://optcgapi.com/api/allSetCards/";
const FALLBACK_URL = "cards.json";
const PAGE_SIZE = 50;

// --- Element references -----------------------------------------------------
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const noResultsEl = document.getElementById("noResults");
const gridEl = document.getElementById("cardGrid");
const searchInput = document.getElementById("searchInput");
const setFilter = document.getElementById("setFilter");
const searchBtn = document.getElementById("searchBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsCountEl = document.getElementById("resultsCount");
const paginationTop = document.getElementById("paginationTop");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

// Button groups
const colorFilterGroup = document.getElementById("colorFilterGroup");
const typeFilterGroup = document.getElementById("typeFilterGroup");
const hideReprintsCheckbox = document.getElementById("hideReprints");

// --- State ------------------------------------------------------------------
let allCards = [];
let filteredCards = [];
let currentPage = 1;
let selectedColor = "";
let selectedType = "";

// --- Data loading -----------------------------------------------------------

async function loadCards() {
  try {
    const cards = await fetchCardsFromApi();
    allCards = prepareCards(cards);
  } catch (apiError) {
    console.warn("API failed, trying local fallback...", apiError);
    try {
      const cards = await fetchCardsFromFallback();
      allCards = prepareCards(cards);
      showStatus("Could not reach the API - showing sample cards instead.", "error");
    } catch (fallbackError) {
      console.error("Fallback failed too.", fallbackError);
      showStatus("Sorry, we couldn't load any cards right now.", "error");
      loadingEl.hidden = true;
      return;
    }
  }

  loadingEl.hidden = true;
  populateSetFilter();
  applyFilters();
}

async function fetchCardsFromApi() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("API error: " + response.status);
  return response.json();
}

async function fetchCardsFromFallback() {
  const response = await fetch(FALLBACK_URL);
  if (!response.ok) throw new Error("Could not load cards.json");
  return response.json();
}

function prepareCards(rawCards) {
  if (!Array.isArray(rawCards)) return [];
  return rawCards
    .filter((card) => card && card.card_name)
    .map((card) => ({
      name: card.card_name || "Unknown card",
      setId: card.set_id || "—",
      cardId: card.card_set_id || "—",
      setName: card.set_name || "",
      color: card.card_color || "—",
      type: card.card_type || "—",
      rarity: card.rarity || "—",
      cost: card.card_cost ?? "—",
      power: card.card_power ?? "—",
      life: card.life ?? "—",
      counter: card.counter_amount ?? "—",
      attribute: card.attribute || "—",
      subTypes: card.sub_types || "—",
      effect: card.card_text || "No effect text.",
      image: card.card_image || "",
    }));
}

// --- Filtering --------------------------------------------------------------

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const set = setFilter.value;
  const hideReprints = hideReprintsCheckbox.checked;

  filteredCards = allCards.filter((card) => {
    const matchesName = card.name.toLowerCase().includes(query);
    const matchesColor = !selectedColor || card.color === selectedColor || (selectedColor === "Multicolor" && card.color.includes("/"));
    const matchesType = !selectedType || card.type === selectedType;
    const matchesSet = !set || card.setName === set || card.setId === set;
    
    // Simple logic for reprints: usually cards with _p in ID or different set IDs
    const isReprint = card.cardId.includes("_p") || card.cardId.includes("-");
    const matchesReprint = !hideReprints || !isReprint;

    return matchesName && matchesColor && matchesType && matchesSet && matchesReprint;
  });

  currentPage = 1;
  updateUI();
}

function updateUI() {
  resultsCountEl.textContent = `${filteredCards.length} results`;
  renderCards();
  renderPagination();
}

function renderCards() {
  gridEl.innerHTML = "";
  
  if (filteredCards.length === 0) {
    noResultsEl.hidden = false;
    paginationTop.innerHTML = "";
    return;
  }
  noResultsEl.hidden = true;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageCards = filteredCards.slice(start, end);

  gridEl.innerHTML = pageCards
    .map((card, index) => `
      <article class="card" tabindex="0" data-index="${start + index}" role="button">
        <img src="${card.image}" alt="${escapeHtml(card.name)}" loading="lazy" />
        <div class="card-info">
          <h3>${escapeHtml(card.name)}</h3>
        </div>
      </article>`)
    .join("");

  gridEl._currentPageCards = pageCards;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Pagination -------------------------------------------------------------

function renderPagination() {
  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  if (totalPages <= 1) {
    paginationTop.innerHTML = "";
    return;
  }

  const html = createPaginationHtml(totalPages);
  paginationTop.innerHTML = html;
}

function createPaginationHtml(totalPages) {
  let html = `<button class="page-link nav-btn ${currentPage > 1 ? 'enabled' : ''}" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>PREV</button>`;

  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="page-link ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="page-dots">...</span>`;
    html += `<button class="page-link" onclick="changePage(${totalPages})">${totalPages}</button>`;
  }

  html += `<button class="page-link nav-btn ${currentPage < totalPages ? 'enabled' : ''}" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>NEXT</button>`;
  
  return html;
}

window.changePage = (page) => {
  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  updateUI();
};

// --- Helpers ----------------------------------------------------------------

function populateSetFilter() {
  const sets = [...new Set(allCards.map((card) => card.setName))]
    .filter(Boolean)
    .sort();

  sets.forEach((setName) => {
    const option = document.createElement("option");
    option.value = setName;
    option.textContent = setName;
    setFilter.appendChild(option);
  });
}

function showStatus(message, type) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  if (type === "error") errorEl.classList.add("error");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// --- Modal ------------------------------------------------------------------

function openModal(card) {
  modalBody.innerHTML = `
    <img src="${card.image}" alt="${escapeHtml(card.name)}" />
    <div class="modal-details">
      <h2 id="modalTitle">${escapeHtml(card.name)}</h2>
      <p class="set-name">${escapeHtml(card.setName)} &middot; ${escapeHtml(card.setId)}</p>
      <ul class="detail-list">
        <li><span class="label">Type</span>${escapeHtml(card.type)}</li>
        <li><span class="label">Color</span>${escapeHtml(card.color)}</li>
        <li><span class="label">Cost</span>${escapeHtml(String(card.cost))}</li>
        <li><span class="label">Power</span>${escapeHtml(String(card.power))}</li>
        <li><span class="label">Life</span>${escapeHtml(String(card.life))}</li>
        <li><span class="label">Counter</span>${escapeHtml(String(card.counter))}</li>
        <li><span class="label">Attribute</span>${escapeHtml(card.attribute)}</li>
        <li><span class="label">Rarity</span>${escapeHtml(card.rarity)}</li>
      </ul>
      <div class="effect-box">
        <span class="label">Effect</span>
        ${escapeHtml(card.effect)}
      </div>
    </div>`;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

// --- Event Listeners --------------------------------------------------------

function setupButtonGroups() {
  [colorFilterGroup, typeFilterGroup].forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      
      group.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      if (group === colorFilterGroup) selectedColor = btn.dataset.value;
      else selectedType = btn.dataset.value;
    });
  });
}

searchBtn.addEventListener("click", applyFilters);

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  setFilter.value = "";
  hideReprintsCheckbox.checked = false;
  selectedColor = "";
  selectedType = "";
  
  [colorFilterGroup, typeFilterGroup].forEach(group => {
    group.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    group.querySelector('[data-value=""]').classList.add("active");
  });
  
  applyFilters();
});

gridEl.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".card");
  if (!cardEl) return;
  const card = filteredCards[Number(cardEl.dataset.index)];
  if (card) openModal(card);
});

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target.dataset.close === "true") closeModal();
});

// Init
setupButtonGroups();
loadCards();
