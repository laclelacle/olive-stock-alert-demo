# 올영세일 장바구니 품절 알림 서비스 데모

## 프로젝트 구조
- GitHub Pages: 사용자 데모 홈페이지
- API Gateway: 외부 요청 진입점
- Lambda: 재고 확인 및 품절 위험 알림 생성
- DynamoDB: 상품, 장바구니, 알림 이력 저장
- CloudWatch: Lambda 실행 로그 확인

## 사용 방법
1. GitHub 저장소를 생성합니다.
2. index.html, style.css, script.js 파일을 업로드합니다.
3. Settings → Pages에서 main 브랜치 / root를 선택합니다.
4. 배포된 URL에 접속해 버튼을 클릭합니다.

## 시연 순서
1. 장바구니 재고 조회
2. 재고 확인 및 알림 생성
3. 품절 위험 상품 확인
4. 알림 이력 확인
