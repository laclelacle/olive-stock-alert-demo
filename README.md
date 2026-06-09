# 올영세일 장바구니 품절 위험 알림 플랫폼

## 구현 구조
- GitHub Pages: 사용자 데모 홈페이지
- API Gateway: 외부 요청 진입점
- AWS Lambda: 재고 조회, 재고 감소 시뮬레이션, 알림 생성
- DynamoDB: Products, CartItems, Notifications 테이블 저장
- CloudWatch: Lambda 실행 로그 확인

## 시연 순서
1. 장바구니 재고 조회
2. 재고 확인 및 알림 생성
3. 10개 미만 상품 RISK 표시 확인
4. Notifications 알림 이력 확인
5. 실행 로그 JSON 확인

## 발표 포인트
- EC2/RDS 없이 요청 기반 서버리스 구조로 비용을 최소화했습니다.
- 피크 트래픽 상황에서도 Lambda와 DynamoDB를 통해 확장 가능한 구조를 설계했습니다.
- 실제 홈페이지에서 API Gateway URL을 호출해 Lambda와 DynamoDB가 동작하는 것을 검증했습니다.
