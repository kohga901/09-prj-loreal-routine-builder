/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const rtlToggle = document.getElementById("rtlToggle");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineButton = document.getElementById("generateRoutine");
const clearSelectedButton = document.getElementById("clearSelected");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const userInput = document.getElementById("userInput");

const STORAGE_KEY = "routineBuilderSelected";
const RTL_STORAGE_KEY = "routineBuilderRtl";
const WORKER_ENDPOINT = "https://my-worker.khongor0901.workers.dev";

let allProducts = [];
let selectedProductIds = new Set();
let chatHistory = [];
let isRtl = false;

/* Show initial placeholder until user selects a category */
function showProductPlaceholder(message = "Choose a category or search products to begin.") {
  productsContainer.innerHTML = `
    <div class="placeholder-message">
      ${message}
    </div>
  `;
}

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

function getFilteredProducts() {
  const selectedCategory = categoryFilter.value;
  const query = productSearch.value.trim().toLowerCase();
  let filtered = allProducts;

  if (selectedCategory) {
    filtered = filtered.filter((product) => product.category === selectedCategory);
  }

  if (query) {
    filtered = filtered.filter((product) => {
      const searchableText = `${product.name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
      return searchableText.includes(query);
    });
  }

  return selectedCategory || query ? filtered : null;
}

function updateDirection() {
  document.documentElement.dir = isRtl ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", isRtl);
  rtlToggle.textContent = isRtl ? "Switch to LTR" : "Switch to RTL";
  localStorage.setItem(RTL_STORAGE_KEY, isRtl ? "true" : "false");
}

function restoreRtl() {
  const storedRtl = localStorage.getItem(RTL_STORAGE_KEY);
  isRtl = storedRtl === "true";
  updateDirection();
}

function createProductCard(product) {
  const selectedClass = selectedProductIds.has(product.id) ? "selected" : "";

  return `
    <article class="product-card ${selectedClass}" data-product-id="${product.id}" tabindex="0">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <span class="brand-name">${product.brand}</span>
        <h3>${product.name}</h3>
        <span class="category-name">${product.category}</span>
        <div class="product-description-wrap">
          <p class="product-description">${product.description}</p>
          <button type="button" class="desc-toggle" data-product-id="${product.id}" aria-expanded="false">
            Read more
          </button>
        </div>
        <p class="select-note">Click card to ${selectedClass ? "remove" : "add"} from selection.</p>
      </div>
    </article>
  `;
}

function renderProducts(products) {
  if (!products || products.length === 0) {
    const selectedCategory = categoryFilter.value;
    const query = productSearch.value.trim();
    if (query) {
      showProductPlaceholder(`No matching products found for "${query}".`);
    } else if (selectedCategory) {
      showProductPlaceholder(`No products found for ${selectedCategory}.`);
    } else {
      showProductPlaceholder();
    }
    return;
  }

  productsContainer.innerHTML = products.map(createProductCard).join("");
}

function renderSelectedProducts() {
  const selectedProducts = allProducts.filter((product) => selectedProductIds.has(product.id));

  if (selectedProducts.length === 0) {
    selectedProductsList.classList.add("empty");
    selectedProductsList.innerHTML = "";
    return;
  }

  selectedProductsList.classList.remove("empty");
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
        <div class="selected-chip">
          <span>${product.name}</span>
          <button type="button" class="remove-selected" data-product-id="${product.id}" aria-label="Remove ${product.name}">
            &times;
          </button>
        </div>
      `
    )
    .join("");
}

function saveSelectedProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedProductIds]));
}

function restoreSelectedProducts() {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) return;

  try {
    const parsedIds = JSON.parse(storedValue);
    if (Array.isArray(parsedIds)) {
      selectedProductIds = new Set(parsedIds);
    }
  } catch (error) {
    console.warn("Failed to restore selected products:", error);
  }
}

function updateProductSelection(productId) {
  if (selectedProductIds.has(productId)) {
    selectedProductIds.delete(productId);
  } else {
    selectedProductIds.add(productId);
  }

  saveSelectedProducts();
  renderSelectedProducts();
  refreshVisibleProducts();
}

function clearSelectedProducts() {
  selectedProductIds.clear();
  saveSelectedProducts();
  renderSelectedProducts();
  refreshVisibleProducts();
}

function refreshVisibleProducts() {
  const filteredProducts = getFilteredProducts();
  if (!filteredProducts) {
    showProductPlaceholder();
    return;
  }

  renderProducts(filteredProducts);
}

function formatMessageText(text) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />")
    .replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

function displayChatMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = formatMessageText(text);

  message.appendChild(bubble);
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "message assistant typing-indicator-wrap";
  indicator.id = "typingIndicator";
  indicator.innerHTML = `
    <div class="bubble typing-indicator">
      <span></span><span></span><span></span>
    </div>
  `;
  chatWindow.appendChild(indicator);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function hideTypingIndicator() {
  document.getElementById("typingIndicator")?.remove();
}

async function sendChatRequest(messages) {
  try {
    const response = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Worker error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    displayChatMessage("assistant", "Sorry, I could not reach the AI service. Please check your Cloudflare Worker endpoint.");
    return null;
  }
}

async function generateRoutine() {
  const selectedProducts = allProducts.filter((product) => selectedProductIds.has(product.id));
  if (selectedProducts.length === 0) {
    displayChatMessage("assistant", "Please select at least one product before generating your personalized routine.");
    return;
  }

  const productDetails = selectedProducts
    .map(
      (product) => `• ${product.name} (${product.brand}, ${product.category}) — ${product.description}`
    )
    .join("\n");

  const prompt = `You are a personal beauty advisor. Create a step-by-step personalized routine using only the selected L'Oréal family products listed below. Include when to use each product, which skin/hair concern it addresses, and how it fits into morning or evening care. Use friendly, confident guidance and keep the routine practical for a user with a mix of skincare, haircare, or makeup items.\n\nSelected products:\n${productDetails}`;

  chatHistory.push({ role: "user", content: prompt });
  displayChatMessage("user", "Generate a personalized routine for the selected products.");
  showTypingIndicator();

  const result = await sendChatRequest(chatHistory);
  hideTypingIndicator();
  if (!result) return;

  const assistantResponse = result.assistant || result.text || "I couldn't get a response from the AI worker.";
  chatHistory.push({ role: "assistant", content: assistantResponse });
  displayChatMessage("assistant", assistantResponse);
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  userInput.value = "";
  displayChatMessage("user", message);
  chatHistory.push({ role: "user", content: message });
  showTypingIndicator();

  const result = await sendChatRequest(chatHistory);
  hideTypingIndicator();
  if (!result) return;

  const assistantResponse = result.assistant || result.text || "I couldn't get a response from the AI worker.";
  chatHistory.push({ role: "assistant", content: assistantResponse });
  displayChatMessage("assistant", assistantResponse);
}

productsContainer.addEventListener("click", (event) => {
  const toggleBtn = event.target.closest(".desc-toggle");
  if (toggleBtn) {
    event.stopPropagation();
    const wrap = toggleBtn.closest(".product-description-wrap");
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    wrap.classList.toggle("expanded", !expanded);
    toggleBtn.setAttribute("aria-expanded", String(!expanded));
    toggleBtn.textContent = expanded ? "Read more" : "Show less";
    return;
  }

  const card = event.target.closest(".product-card");
  if (!card) return;

  const productId = Number(card.dataset.productId);
  if (Number.isNaN(productId)) return;
  updateProductSelection(productId);
});

selectedProductsList.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-selected");
  if (!button) return;

  const productId = Number(button.dataset.productId);
  if (Number.isNaN(productId)) return;
  updateProductSelection(productId);
});

categoryFilter.addEventListener("change", refreshVisibleProducts);
productSearch.addEventListener("input", refreshVisibleProducts);
rtlToggle.addEventListener("click", () => {
  isRtl = !isRtl;
  updateDirection();
});

generateRoutineButton.addEventListener("click", generateRoutine);
clearSelectedButton.addEventListener("click", clearSelectedProducts);
chatForm.addEventListener("submit", handleChatSubmit);

async function initializeApp() {
  allProducts = await loadProducts();
  restoreSelectedProducts();
  restoreRtl();
  renderSelectedProducts();
  refreshVisibleProducts();
}

initializeApp();
