const API_BASE_URL = "https://p3x7h4hbla.execute-api.ap-northeast-2.amazonaws.com";

let requestCount = 0;
let currentProducts = [];
let currentNotifications = [];

const productMeta = {
  P001: {
    brand: "브링그린",
    price: 15900,
    originalPrice: 22000,
    label: "티트리\n수딩 토너"
  },
  P002: {
    brand: "아비브",
    price: 19800,
    originalPrice: 26000,
    label: "어성초\n카밍 세럼"
  },
  P003: {
    brand: "라운드랩",
    price: 17400,
    originalPrice: 24000,
    label: "자작나무\n선크림"
  },
  P004: {
    brand: "바닐라코",
    price: 14500,
    originalPrice: 21000,
    label: "프라임\n프라이머"
  }
};

function formatPrice(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

function log(message, data = null) {
  const logBox = document.getElementById("logBox");
  const time = new Date().toLocaleTimeString("ko-KR");

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
    requestCount += 1;
    const data = await apiFetch("/cart-items/U001/stocks", { method: "GET" });

    currentProducts = data.items || [];
    renderCartItems();
    updateSummaryCards();
    calculateOrderSummary();
    log("장바구니 재고 조회 성공", data);
  } catch (error) {
    log("장바구니 재고 조회 실패: " + error.message);
    alert("장바구니 재고 조회에 실패했습니다.");
  }
}

async function checkStockAlerts() {
  try {
    requestCount += 1;
    const data = await apiFetch("/stock-alerts/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user_id: "U001" })
    });

    log("재고 확인 및 알림 생성 성공", data);

    await loadCartStocks();
    await loadNotifications();
  } catch (error) {
    log("재고 확인 및 알림 생성 실패: " + error.message);
    alert("재고 확인 및 알림 생성에 실패했습니다.");
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

function renderCartItems() {
  const cartList = document.getElementById("cartList");

  if (currentProducts.length === 0) {
    cartList.innerHTML = `<div class="empty-box">조회된 장바구니 상품이 없습니다.</div>`;
    return;
  }

  cartList.innerHTML = "";

  currentProducts.forEach((product) => {
    const meta = productMeta[product.product_id] || {
      brand: "올리브영",
      price: 15000,
      originalPrice: 20000,
      label: product.product_name
    };

    const isRisk = product.risk_status === "RISK" || Number(product.stock_qty) < 10;

    const item = document.createElement("article");
    item.className = `cart-item ${isRisk ? "risk" : ""}`;

    item.innerHTML = `
      <div class="item-check">
        <input type="checkbox" checked />
      </div>

      <div class="thumb" data-label="${meta.label}"></div>

      <div class="item-info">
        <div class="brand">${meta.brand}</div>
        <h3>${product.product_name}</h3>

        <div class="meta-row">
          <span class="badge">${product.category}</span>
          <span class="badge">${product.quantity}개 담김</span>
          <span class="badge ${isRisk ? "risk" : ""}">
            ${isRisk ? "품절 위험" : "재고 안정"}
          </span>
        </div>

        <div class="price-info">
          <strong>${formatPrice(meta.price)}</strong>
          <span>${formatPrice(meta.originalPrice)}</span>
        </div>

        <div class="alert-text">
          ${
            isRisk
              ? `재고가 ${product.stock_qty}개 남아 있어 품절 위험 알림 대상입니다.`
              : `현재 재고는 ${product.stock_qty}개이며 안정적으로 구매 가능합니다.`
          }
        </div>
      </div>

      <div class="item-side">
        <div class="stock-label">현재 재고</div>
        <div class="stock-num ${isRisk ? "risk" : ""}">${product.stock_qty}</div>
        <div class="quantity-box">관심 사용자 ${product.interested_users}명</div>
      </div>
    `;

    cartList.appendChild(item);
  });
}

function renderNotifications() {
  const notificationList = document.getElementById("notificationList");

  if (currentNotifications.length === 0) {
    notificationList.innerHTML = `<div class="empty-box small">아직 생성된 품절 위험 알림이 없습니다.</div>`;
    return;
  }

  notificationList.innerHTML = "";

  currentNotifications.forEach((item) => {
    const div = document.createElement("div");
    div.className = "notification-item";
    div.innerHTML = `
      <strong>${item.product_name}</strong>
      <div>${item.message}</div>
      <div class="time">${item.sent_at}</div>
    `;
    notificationList.appendChild(div);
  });
}

function updateSummaryCards() {
  const riskCount = currentProducts.filter(
    (product) => product.risk_status === "RISK" || Number(product.stock_qty) < 10
  ).length;

  document.getElementById("requestCount").textContent = requestCount;
  document.getElementById("riskCount").textContent = riskCount;
  document.getElementById("alertCount").textContent = currentNotifications.length;
}

function calculateOrderSummary() {
  let total = 0;
  let originalTotal = 0;

  currentProducts.forEach((product) => {
    const meta = productMeta[product.product_id];
    if (!meta) return;

    total += meta.price * Number(product.quantity || 1);
    originalTotal += meta.originalPrice * Number(product.quantity || 1);
  });

  const discount = originalTotal - total;

  document.getElementById("totalProductPrice").textContent = formatPrice(originalTotal);
  document.getElementById("discountPrice").textContent = formatPrice(discount);
  document.getElementById("finalPrice").textContent = formatPrice(total);
}

window.addEventListener("load", async () => {
  log("사용자 장바구니 화면이 로드되었습니다.");
  await loadCartStocks();
  await loadNotifications();
});
