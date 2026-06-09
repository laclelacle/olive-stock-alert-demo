# 올영세일 사용자 장바구니 품절 알림 데모

## 주요 기능
- 실제 쇼핑몰 사용자 장바구니처럼 상품 이미지, 가격, 재고, 품절 위험 상태 표시
- 상단 배너 상품 클릭 시 상품 상세 모달 표시
- 장바구니 재고 새로고침
- 재고 확인 및 품절 위험 알림 생성
- 품절/품절 위험 상품 재입고 시뮬레이션
- 결제하기 클릭 시 checkout.html 결제 화면으로 이동
- 결제 화면은 발표용 Mock 화면이며 실제 결제는 발생하지 않음

## AWS 연동
- API Gateway
- Lambda
- DynamoDB Products / CartItems / Notifications
- CloudWatch Logs

## 적용 순서
1. Lambda 콘솔에서 lambda_stock_alert_api.py 내용을 기존 코드 전체와 교체 후 배포
2. GitHub 저장소에 index.html, checkout.html, style.css, script.js, checkout.js 업로드
3. GitHub Pages 새로고침
4. 장바구니 새로고침 → 재고 확인 → 재입고 → 결제하기 순서로 시연
