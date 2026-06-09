const API_BASE_URL = "https://p3x7h4hbla.execute-api.ap-northeast-2.amazonaws.com";

let requestCount = 0;
let currentProducts = [];
let currentNotifications = [];
let isLoading = false;

function setLoading(state) {
  isLoading = state;
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = state;
  });
  document.getElementById("serviceStatus").textContent = state ? "LOADING" : "LIVE";
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
    setLoading(true);
    requestCount += 1;

    const data = await apiFetch("/cart-items/U001/stocks", {
      method: "GET"
    });

    currentProducts = data.items || [];
    renderProducts();
    updateSummary();
    log("장바구니 재고 조회 성공", data);
  } catch (error) {
    document.getElementById("serviceStatus").textContent = "ERROR";
    log("장바구니 재고 조회 실패: " + error.message);
    alert("장바구니 재고 조회에 실패했습니다. API Gateway와 CORS 설정을 확인해 주세요.");
  } finally {
    setLoading(false);
  }
}

async function checkStockAlerts() {
  try {
    setLoading(true);
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
    document.getElementById("serviceStatus").textContent = "ERROR";
    log("재고 확인 및 알림 생성 실패: " + error.message);
    alert("재고 확인 및 알림 생성에 실패했습니다. API Gateway와 Lambda 로그를 확인해 주세요.");
  } finally {
    setLoading(false);
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
    document.getElementById("serviceStatus").textContent = "ERROR";
    log("알림 이력 조회 실패: " + error.message);
  }
}

function renderProducts() {
  const productList = document.getElementById("productList");

  if (currentProducts.length === 0) {
    productList.innerHTML = `
      <div class="empty-state">
        <strong>조회된 장바구니 상품이 없습니다.</strong>
        <p>초기 데이터가 없다면 PowerShell에서 /seed API를 한 번 실행해 주세요.</p>
      </div>
    `;
    return;
  }

  productList.innerHTML = "";

  currentProducts.forEach((product) => {
    const isRisk = product.risk_status === "RISK" || Number(product.stock_qty) < 10;
    const card = document.createElement("article");

    card.className = `product-card ${isRisk ? "risk" : ""}`;
    card.innerHTML = `
      <div>
        <div class="product-name">${product.product_name}</div>
        <div class="product-meta">
          상품 ID: ${product.product_id} · 카테고리: ${product.category}<br>
          장바구니 수량 ${product.quantity}개 · 관심 사용자 ${product.interested_users}명
        </div>
        <div class="product-footer">
          <span class="pill ${isRisk ? "warning" : ""}">
            ${isRisk ? "품절 위험 RISK" : "재고 안정 NORMAL"}
          </span>
          <span class="pill">DynamoDB 조회 완료</span>
        </div>
      </div>
      <div class="stock-box">
        <span>현재 재고</span>
        <div class="stock ${isRisk ? "risk-text" : ""}">${product.stock_qty}</div>
      </div>
    `;

    productList.appendChild(card);
  });
}

function renderNotifications() {
  const notificationList = document.getElementById("notificationList");

  if (currentNotifications.length === 0) {
    notificationList.innerHTML = `
      <div class="empty-state small">
        <strong>알림 없음</strong>
        <p>재고 확인 후 알림 이력이 표시됩니다.</p>
      </div>
    `;
    return;
  }

  notificationList.innerHTML = "";

  currentNotifications.forEach((item) => {
    const div = document.createElement("div");
    div.className = "notification";
    div.innerHTML = `
      <strong>${item.status} · 품절 위험 알림</strong>
      ${item.product_name}<br>
      현재 재고 ${item.stock_qty}개<br>
      <small>${item.sent_at}</small><br>
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

window.addEventListener("load", () => {
  document.getElementById("serviceStatus").textContent = "READY";
  log("데모 홈페이지가 로드되었습니다. 장바구니 재고 조회 버튼을 눌러 주세요.");
});
