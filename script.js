const API_BASE_URL = "https://p3x7h4hbla.execute-api.ap-northeast-2.amazonaws.com";

let requestCount = 0;
let currentProducts = [];
let currentNotifications = [];

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

    const data = await apiFetch("/cart-items/U001/stocks", {
      method: "GET"
    });

    currentProducts = data.items || [];
    renderProducts();
    updateSummary();
    log("장바구니 재고 조회 성공", data);
  } catch (error) {
    log("장바구니 재고 조회 실패: " + error.message);
    alert("장바구니 재고 조회에 실패했습니다. API Gateway와 CORS 설정을 확인해 주세요.");
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

    log("재고 확인 및 품절 위험 알림 생성 성공", data);

    await loadCartStocks();
    await loadNotifications();
  } catch (error) {
    log("재고 확인 및 알림 생성 실패: " + error.message);
    alert("재고 확인 및 알림 생성에 실패했습니다. API Gateway와 Lambda 로그를 확인해 주세요.");
  }
}

async function loadNotifications() {
  try {
    requestCount += 1;

    const data = await apiFetch("/notifications/U001", {
      method: "GET"
    });

    currentNotifications = data.notifications || [];
    renderNotifications();
    updateSummary();
    log("알림 이력 조회 성공", data);
  } catch (error) {
    log("알림 이력 조회 실패: " + error.message);
  }
}

function renderProducts() {
  const productList = document.getElementById("productList");

  if (currentProducts.length === 0) {
    productList.innerHTML = `<div class="empty">조회된 장바구니 상품이 없습니다.</div>`;
    return;
  }

  productList.innerHTML = "";

  currentProducts.forEach((product) => {
    const isRisk = product.risk_status === "RISK" || Number(product.stock_qty) < 10;

    const card = document.createElement("div");
    card.className = `product-card ${isRisk ? "risk" : ""}`;

    card.innerHTML = `
      <div>
        <div class="product-name">${product.product_name}</div>
        <div class="product-meta">
          상품 ID: ${product.product_id}<br>
          카테고리: ${product.category}<br>
          장바구니 수량: ${product.quantity}개<br>
          관심 사용자: ${product.interested_users}명
        </div>
        <span class="status ${isRisk ? "warning" : ""}">
          ${isRisk ? "품절 위험 알림 대상" : "재고 안정"}
        </span>
      </div>
      <div>
        <div class="stock ${isRisk ? "risk-text" : ""}">${product.stock_qty}개</div>
      </div>
    `;

    productList.appendChild(card);
  });
}

function renderNotifications() {
  const notificationList = document.getElementById("notificationList");

  if (currentNotifications.length === 0) {
    notificationList.innerHTML = `<div class="empty">아직 발송된 알림이 없습니다.</div>`;
    return;
  }

  notificationList.innerHTML = "";

  currentNotifications.forEach((item) => {
    const div = document.createElement("div");
    div.className = "notification";
    div.innerHTML = `
      <strong>${item.status} · 품절 위험 알림</strong><br>
      ${item.product_name}<br>
      현재 재고: ${item.stock_qty}개<br>
      발송 시간: ${item.sent_at}<br>
      ${item.message}
    `;
    notificationList.appendChild(div);
  });
}

function updateSummary() {
  const riskCount = currentProducts.filter(
    (product) => product.risk_status === "RISK" || Number(product.stock_qty) < 10
  ).length;

  document.getElementById("requestCount").textContent = requestCount;
  document.getElementById("riskCount").textContent = riskCount;
  document.getElementById("alertCount").textContent = currentNotifications.length;
}

window.addEventListener("load", async () => {
  log("데모 홈페이지가 로드되었습니다. 장바구니 재고 조회 버튼을 눌러 주세요.");
});
