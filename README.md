# 올영세일 장바구니 품절 알림 - 인라인 수정 버전

## 왜 이 버전을 쓰나요?
이전 화면이 깨진 이유는 GitHub Pages에서 style.css가 적용되지 않은 상태였기 때문입니다.
이 버전은 CSS와 JavaScript를 index.html 내부에 넣어 화면 깨짐을 방지했습니다.

## 업로드 파일
- index.html
- checkout.html
- lambda_stock_alert_api.py

## 적용 순서
1. Lambda에서 lambda_stock_alert_api.py 내용으로 코드 전체 교체 후 배포
2. GitHub에 index.html, checkout.html 업로드
3. Pages 새로고침
4. 장바구니 새로고침 → 재고 확인 → 재입고 → 결제하기 순서로 시연
