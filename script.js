const API_BASE_URL = "https://p3x7h4hbla.execute-api.ap-northeast-2.amazonaws.com";

let requestCount = 0;
let currentProducts = [];
let currentNotifications = [];

const productMeta = {
  P001: {
    brand: "브링그린",
    name: "브링그린 티트리 시카 수딩 토너",
    category: "스킨케어",
    price: 15900,
    originalPrice: 22000,
    discount: "28%",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=640&q=80",
    desc: "민감한 피부를 위한 수딩 토너로, 세일 기간 장바구니 등록이 많은 상품입니다."
  },
  P002: {
    brand: "아비브",
    name: "아비브 어성초 카밍 세럼",
    category: "세럼",
    price: 19800,
    originalPrice: 26000,
    discount: "24%",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=640&q=80",
    desc: "진정 케어용 세럼 상품입니다. 품절 위험 알림 데모의 핵심 상품으로 사용됩니다."
  },
  P003: {
    brand: "라운드랩",
    name: "라운드랩 자작나무 수분 선크림",
    category: "선케어",
    price: 17400,
    originalPrice: 24000,
    discount: "28%",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=640&q=80",
    desc: "데일리 선케어 상품으로 장바구니에서 재고를 확인할 수 있습니다."
  },
  P004: {
    brand: "바닐라코",
    name: "바닐라코 프라임 프라이머",
    category: "메이크업",
    price: 14500,
    originalPrice: 21000,
    discount: "31%",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=640&q=80",
    desc: "메이크업 전 피부결을 정돈하는 프라이머입니다. 현재 품절 위험 감지 대상입니다."
  },
  P005: {
    brand: "토리든",
    name: "다이브인 저분자 히알루론산 세럼",
    category: "세럼",
    price: 18900,
    originalPrice: 24500,
    discount: "23%",
    stock_qty: 16,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=640&q=80",
    desc: "수분 케어 추천 상품입니다. 데모 화면용 추천 상품입니다."
  },
  P006: {
    brand: "어노브",
    name: "딥 데미지 트리트먼트 EX",
    category: "헤어케어",
    price: 17900,
    originalPrice: 23900,
    discount: "25%",
    stock_qty: 22,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=640&q=80",
    desc: "세일 기간 함께 많이 담는 헤어케어 추천 상품입니다."
  },
  P007: {
    brand: "메디힐",
    name: "마데카소사이드 흔적 패드",
    category: "패드",
    price: 21500,
    originalPrice: 28000,
    discount: "23%",
    stock_qty: 8,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=640&q=80",
    desc: "재고가 적은 추천 상품 예시입니다."
  },
  P008: {
    brand: "롬앤",
    name: "쥬시 래스팅 틴트",
    category: "립메이크업",
    price: 9900,
    originalPrice: 13000,
    discount: "24%",
    stock_qty: 31,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=640&q=80",
    desc: "메이크업 카테고리 추천 상품입니다."
  }
};

const catalogIds = ["P001", "P002", "P003", "P004", "P005", "P006", "P007", "P008"];

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function setStatus(value) {
  document.getElementById("serviceStatus").textContent = value;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2400);
}

function log(message, data = null) {
  const logBox = document.getElementById("logBox");
  const lastUpdated = document.getElementById("lastUpdated");
  const time = new Date().toLocaleTimeString("ko-KR");

  lastUpdated.textContent = `최근 실행 ${time}`;

  if (data) {
    logBox.textContent = `[${time}] ${message}\n` + JSON.stringify(data, null, 2);
  } else {
    logBox.textContent = `[${time}] ${message}`;
  }
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`API 오류: ${response.status}`);
  }

  return await response.json();
}

async function loadCartStocks() {
  try {
    setStatus("LOADING");
    requestCount += 1;

    const data = await apiFetch("/cart-items/U001/stocks", { method: "GET" });
    currentProducts = data.items || [];

    renderCartItems();
    renderCatalog();
    updateSummaryCards();
    calculateOrderSummary();
    log("장바구니 재고 조회 성공", data);
    setStatus("LIVE");
  } catch (error) {
    setStatus("ERROR");
    log("장바구니 재고 조회 실패: " + error.message);
    showToast("장바구니 재고 조회에 실패했습니다.");
  }
}

async function checkStockAlerts() {
  try {
    setStatus("CHECKING");
    requestCount += 1;

    const data = await apiFetch("/stock-alerts/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "U001" })
    });

    log("재고 확인 및 품절 위험 알림 생성 성공", data);
    showToast("재고 확인과 알림 생성이 완료되었습니다.");

    await loadCartStocks();
    await loadNotifications();
  } catch (error) {
    setStatus("ERROR");
    log("재고 확인 및 알림 생성 실패: " + error.message);
    showToast("재고 확인 및 알림 생성에 실패했습니다.");
  }
}

async function restockProducts() {
  try {
    setStatus("RESTOCK");
    requestCount += 1;

    const data = await apiFetch("/stock-alerts/restock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "U001", force": false })
    });

    log("재입고 처리 성공", data);
    showToast("품절/품절위험 상품의 재입고가 반영되었습니다.");

    await loadCartStocks();
    await loadNotifications();
  } catch (error) {
    setStatus("ERROR");
    log("재입고 처리 실패: " + error.message);
    showToast("재입고 API가 아직 Lambda에 반영되지 않았습니다.");
  }
}

async function resetDemoData() {
  try {
    setStatus("RESET");
    requestCount += 1;

    const data = await apiFetch("/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    });

    log("초기 데이터 재생성 성공", data);
    showToast("상품 재고가 초기 상태로 재설정되었습니다.");

    await loadCartStocks();
    await loadNotifications();
  } catch (error) {
    setStatus("ERROR");
    log("초기화 실패: " + error.message);
    showToast("초기화에 실패했습니다.");
  }
}

async function loadNotifications() {
  try {
    requestCount += 1;

    const data = await apiFetch("/notifications/U001", { method: "GET" });
    currentNotifications = data.notifications || [];

    renderNotifications();
    updateSummaryCards();
    log("알림 이력 조회 성공", data);
  } catch (error) {
    log("알림 이력 조회 실패: " + error.message);
  }
}

function getCartProduct(productId) {
  return currentProducts.find((item) => item.product_id === productId);
}

function getProductStatus(productId) {
  const cartProduct = getCartProduct(productId);
  const meta = productMeta[productId] || {};

  const stock = cartProduct ? Number(cartProduct.stock_qty) : Number(meta.stock_qty || 0);
  const risk = stock > 0 && stock < 10;
  const soldout = stock <= 0;

  return { stock, risk, soldout, source: cartProduct ? "AWS" : "DEMO" };
}

function renderCartItems() {
  const cartList = document.getElementById("cartList");

  if (currentProducts.length === 0) {
    cartList.innerHTML = `<div class="empty">조회된 장바구니 상품이 없습니다. 초기화 버튼을 누르거나 /seed API를 실행해 주세요.</div>`;
    return;
  }

  cartList.innerHTML = "";

  currentProducts.forEach((product) => {
    const meta = productMeta[product.product_id] || {
      brand: "올영세일",
      name: product.product_name,
      category: product.category,
      price: 15000,
      originalPrice: 20000,
      discount: "20%",
      image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=640&q=80",
      desc: "데모 상품입니다."
    };

    const stock = Number(product.stock_qty);
    const isRisk = stock > 0 && stock < 10;
    const isSoldout = stock <= 0;

    const item = document.createElement("article");
    item.className = `cart-item ${isRisk ? "risk" : ""} ${isSoldout ? "soldout" : ""}`;

    item.innerHTML = `
      <div><input type="checkbox" ${isSoldout ? "" : "checked"} /></div>
      <img class="item-image" src="${meta.image}" alt="${meta.name}" />
      <div class="item-info">
        <div class="brand">${meta.brand}</div>
        <h3>${product.product_name}</h3>
        <div class="badges">
          <span class="badge">${product.category}</span>
          <span class="badge">오늘드림 가능</span>
          <span class="badge ${isSoldout ? "soldout" : isRisk ? "risk" : ""}">
            ${isSoldout ? "품절" : isRisk ? "품절 위험" : "재고 안정"}
          </span>
        </div>
        <div class="price-row">
          <strong>${formatPrice(meta.price)}</strong>
          <del>${formatPrice(meta.originalPrice)}</del>
          <span class="discount">${meta.discount}</span>
        </div>
      </div>
      <div class="item-side">
        <div class="stock-label">현재 재고</div>
        <div class="stock-num ${isSoldout ? "soldout" : isRisk ? "risk" : ""}">${stock}</div>
        <button class="detail-btn" onclick="openProductDetail('${product.product_id}')">상세보기</button>
      </div>
    `;

    cartList.appendChild(item);
  });
}

function renderCatalog() {
  const catalogGrid = document.getElementById("catalogGrid");
  catalogGrid.innerHTML = "";

  catalogIds.forEach((id) => {
    const meta = productMeta[id];
    const status = getProductStatus(id);

    const card = document.createElement("button");
    card.className = "catalog-card";
    card.onclick = () => openProductDetail(id);

    card.innerHTML = `
      <div class="catalog-image-wrap">
        <img src="${meta.image}" alt="${meta.name}" />
      </div>
      <div class="catalog-info">
        <div class="brand">${meta.brand}</div>
        <h3>${meta.name}</h3>
        <div class="badges">
          <span class="badge">${meta.category}</span>
          <span class="badge ${status.soldout ? "soldout" : status.risk ? "risk" : ""}">
            ${status.soldout ? "품절" : status.risk ? `재고 ${status.stock}개` : "재고 안정"}
          </span>
        </div>
        <div class="price-row">
          <strong>${formatPrice(meta.price)}</strong>
          <span class="discount">${meta.discount}</span>
        </div>
      </div>
    `;

    catalogGrid.appendChild(card);
  });
}

function renderNotifications() {
  const notificationList = document.getElementById("notificationList");

  if (currentNotifications.length === 0) {
    notificationList.innerHTML = `<div class="empty small">아직 생성된 품절 위험 알림이 없습니다.</div>`;
    return;
  }

  notificationList.innerHTML = "";

  currentNotifications.forEach((item) => {
    const div = document.createElement("div");
    const isRestock = item.status === "RESTOCKED";

    div.className = `notification-item ${isRestock ? "restock" : ""}`;
    div.innerHTML = `
      <strong>${isRestock ? "재입고 알림" : "품절 위험 알림"} · ${item.status}</strong>
      <div>${item.message}</div>
      <div class="time">${item.sent_at}</div>
    `;

    notificationList.appendChild(div);
  });
}

function updateSummaryCards() {
  const riskCount = currentProducts.filter((product) => {
    const stock = Number(product.stock_qty);
    return stock > 0 && stock < 10;
  }).length;

  document.getElementById("requestCount").textContent = requestCount;
  document.getElementById("riskCount").textContent = riskCount;
  document.getElementById("alertCount").textContent = currentNotifications.length;
}

function calculateOrderSummary() {
  let total = 0;
  let originalTotal = 0;

  currentProducts.forEach((product) => {
    const stock = Number(product.stock_qty);
    if (stock <= 0) return;

    const meta = productMeta[product.product_id];
    if (!meta) return;

    const quantity = Number(product.quantity || 1);

    total += meta.price * quantity;
    originalTotal += meta.originalPrice * quantity;
  });

  const discount = originalTotal - total;

  document.getElementById("totalProductPrice").textContent = formatPrice(originalTotal);
  document.getElementById("discountPrice").textContent = formatPrice(discount);
  document.getElementById("finalPrice").textContent = formatPrice(total);
}

function openProductDetail(productId) {
  const meta = productMeta[productId];
  const cartProduct = getCartProduct(productId);
  const status = getProductStatus(productId);

  const modal = document.getElementById("productModal");
  const modalContent = document.getElementById("modalContent");

  modalContent.innerHTML = `
    <div class="detail-grid">
      <img src="${meta.image}" alt="${meta.name}" />
      <div class="detail-info">
        <p class="kicker">${meta.brand}</p>
        <h2>${meta.name}</h2>
        <div class="badges">
          <span class="badge">${meta.category}</span>
          <span class="badge">${status.source === "AWS" ? "실시간 재고 조회" : "추천 상품"}</span>
          <span class="badge ${status.soldout ? "soldout" : status.risk ? "risk" : ""}">
            ${status.soldout ? "품절" : status.risk ? "품절 위험" : "구매 가능"}
          </span>
        </div>
        <div class="price-row">
          <strong>${formatPrice(meta.price)}</strong>
          <del>${formatPrice(meta.originalPrice)}</del>
          <span class="discount">${meta.discount}</span>
        </div>
        <p class="detail-desc">${meta.desc}</p>
        <div class="price-line">
          <span>현재 재고</span>
          <strong>${status.stock}개</strong>
        </div>
        <div class="price-line">
          <span>데이터 출처</span>
          <strong>${status.source === "AWS" ? "DynamoDB" : "화면 데모"}</strong>
        </div>
        <div class="detail-actions">
          <button class="light-btn" onclick="closeProductDetail()">닫기</button>
          <button class="dark-btn" onclick="showToast('${meta.name} 상세 확인 완료')">알림 받기</button>
          <button class="primary" onclick="goCheckout()">결제하기</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function closeProductDetail() {
  document.getElementById("productModal").classList.add("hidden");
}

function goCheckout() {
  if (!currentProducts.length) {
    showToast("장바구니 재고를 먼저 조회해 주세요.");
    return;
  }

  const checkoutItems = currentProducts.map((product) => {
    const meta = productMeta[product.product_id] || {};
    return {
      ...product,
      ...meta,
      stock_qty: Number(product.stock_qty),
      quantity: Number(product.quantity || 1)
    };
  });

  const riskCount = checkoutItems.filter((item) => item.stock_qty > 0 && item.stock_qty < 10).length;
  const soldoutCount = checkoutItems.filter((item) => item.stock_qty <= 0).length;

  sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
  sessionStorage.setItem("checkoutRiskCount", String(riskCount));
  sessionStorage.setItem("checkoutSoldoutCount", String(soldoutCount));

  location.href = "checkout.html";
}

window.addEventListener("load", async () => {
  renderCatalog();
  log("사용자 장바구니 화면이 로드되었습니다.");
  await loadCartStocks();
  await loadNotifications();
});
