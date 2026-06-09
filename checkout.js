function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

const items = JSON.parse(sessionStorage.getItem("checkoutItems") || "[]");
const riskCount = Number(sessionStorage.getItem("checkoutRiskCount") || "0");
const soldoutCount = Number(sessionStorage.getItem("checkoutSoldoutCount") || "0");

const checkoutItems = document.getElementById("checkoutItems");

let total = 0;
let originalTotal = 0;

if (!items.length) {
  checkoutItems.innerHTML = `<div class="empty">결제할 상품이 없습니다. 장바구니에서 다시 이동해 주세요.</div>`;
} else {
  checkoutItems.innerHTML = "";

  items.forEach((item) => {
    const isSoldout = Number(item.stock_qty) <= 0;

    if (!isSoldout) {
      total += Number(item.price || 0) * Number(item.quantity || 1);
      originalTotal += Number(item.originalPrice || 0) * Number(item.quantity || 1);
    }

    const div = document.createElement("div");
    div.className = "checkout-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <div class="brand">${item.brand}</div>
        <strong>${item.product_name || item.name}</strong>
        <div class="badges">
          <span class="badge">${item.category}</span>
          <span class="badge ${isSoldout ? "soldout" : Number(item.stock_qty) < 10 ? "risk" : ""}">
            ${isSoldout ? "품절 제외" : Number(item.stock_qty) < 10 ? "품절 위험" : "구매 가능"}
          </span>
        </div>
      </div>
      <strong>${isSoldout ? "품절" : formatPrice(item.price)}</strong>
    `;
    checkoutItems.appendChild(div);
  });
}

const discount = originalTotal - total;

document.getElementById("checkoutOriginal").textContent = formatPrice(originalTotal);
document.getElementById("checkoutDiscount").textContent = formatPrice(discount);
document.getElementById("checkoutFinal").textContent = formatPrice(total);

const warning = document.getElementById("riskWarning");
if (soldoutCount > 0) {
  warning.textContent = `품절 상품 ${soldoutCount}개는 결제 금액에서 제외되었습니다.`;
} else if (riskCount > 0) {
  warning.textContent = `품절 위험 상품 ${riskCount}개가 포함되어 있습니다. 결제 전 재고 확인을 권장합니다.`;
} else {
  warning.textContent = "모든 상품이 구매 가능한 상태입니다.";
}

function completePayment() {
  document.getElementById("paymentModal").classList.remove("hidden");
}
