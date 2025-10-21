# 바이브코딩 견적 분석 도구

외주 문의를 자동으로 분석하고 견적을 산출하는 내부 도구입니다.

## 🚀 기능

- 🔐 **간단한 인증**: 비밀번호로 보호된 접근
- 🤖 **AI 분석**: Claude Sonnet 4.5로 프로젝트 자동 분석
- 💰 **자동 견적**: 할인율에 따른 견적 산출
- 💬 **답변 생성**: 크몽/숨고용 고객 답변 자동 생성
- 🎭 **대화 지원**: claude.ai와 연동하여 무료 대화 지원

## 📦 기술 스택

- **Frontend**: SvelteKit + Skeleton UI + Tailwind CSS
- **Backend**: SvelteKit Server Routes
- **LLM**: Anthropic Claude Sonnet 4.5
- **Deployment**: Vercel

## 🛠️ 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd coding_vibe
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 관리자 비밀번호
ADMIN_PASSWORD=your_strong_password_here

# Anthropic API Key (https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**환경 변수 발급:**
- Anthropic API Key: https://console.anthropic.com/ 에서 발급

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 📤 Vercel 배포

### 1. Vercel에 프로젝트 연결

```bash
# Vercel CLI 설치 (처음 한 번만)
npm i -g vercel

# 배포
vercel
```

### 2. 환경 변수 설정

Vercel 대시보드에서 프로젝트 선택 → Settings → Environment Variables에서 다음 변수를 추가:

- `ADMIN_PASSWORD`: 로그인 비밀번호
- `ANTHROPIC_API_KEY`: Anthropic API 키

**중요**: Production, Preview, Development 모두 체크하세요.

### 3. 재배포

```bash
vercel --prod
```

## 🔒 보안

- `.env` 파일은 절대 Git에 커밋하지 마세요
- `robots.txt`와 `meta noindex`로 검색 엔진 차단
- 환경 변수는 Vercel에서 안전하게 관리

## 📝 사용 방법

### 1. 로그인
- 메인 페이지에서 비밀번호 입력
- 로그인 성공 시 분석 페이지로 이동

### 2. 프로젝트 분석
- 할인율 선택 (30% 할인 등)
- 답변 톤 선택 (친근하게, 전문가 톤 등)
- 고객 문의 내용 붙여넣기
- "분석하기" 버튼 클릭

### 3. 결과 확인
- 실현 가능성, 난이도, 견적 확인
- 고객용 답변 복사 → 크몽/숨고에 붙여넣기
- (선택) 클로드 프롬프트 복사 → claude.ai에서 대화

## 💡 팁

### 할인율 가이드
- **50% 할인**: 테스트 또는 친구
- **30-40% 할인**: 초기 고객 확보
- **10-20% 할인**: 표준 고객
- **시장가**: 일반 견적
- **프리미엄**: 긴급 프로젝트

### 답변 톤 가이드
- **친근하게**: 이모지 사용, 캐주얼
- **전문가 톤**: 신뢰감 있는 전문가 느낌
- **비즈니스 격식**: 공식적인 제안
- **열정적**: 긍정적이고 활기찬 톤

## 🐛 트러블슈팅

### 빌드 오류
```bash
rm -rf node_modules .svelte-kit
npm install
npm run dev
```

### API 오류
- `.env` 파일에 환경 변수가 제대로 설정되어 있는지 확인
- Anthropic API 키가 유효한지 확인
- API 키 잔액이 있는지 확인

### 로그인 문제
- 비밀번호를 정확히 입력했는지 확인
- 환경 변수 `ADMIN_PASSWORD`가 설정되어 있는지 확인

## 📊 예상 비용

### 월 운영 비용
```
Vercel Hosting: 0원 (Hobby 플랜)
Anthropic API:
  - 분석 1건: ~$0.03 (약 40원)
  - 월 100건: ~$3 (약 4,000원)
  - 월 500건: ~$15 (약 20,000원)
대화 (claude.ai): 0원 (무료 플랜)
───────────────────────────────
총 예상: 5,000~20,000원/월
```

## 📄 라이선스

개인 프로젝트 - 내부 도구

## 🤝 기여

개인 도구이므로 외부 기여는 받지 않습니다.
