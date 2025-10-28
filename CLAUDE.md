# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

바이브코딩 견적 분석 도구 - Claude Sonnet 4.5를 활용한 외주 프로젝트 견적 자동 산출 시스템입니다.

**핵심 목적**: 크몽/숨고 문의 → AI 분석 → 자동 견적 + 고객 답변 생성 (3초 내)

## Development Commands

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 타입 체크 (jsconfig 기반)
npm run check

# 타입 체크 (watch 모드)
npm run check:watch

# Vercel 배포
vercel --prod
```

## Architecture

### SvelteKit Routing Structure

```
src/routes/
├── +page.svelte              # 로그인 페이지 (/)
├── +layout.svelte            # 전역 레이아웃
├── analyze/
│   └── +page.svelte          # 분석 페이지 (/analyze)
└── api/
    ├── auth/login/
    │   └── +server.js        # 로그인 API
    └── analyze/
        └── +server.js        # AI 분석 API (핵심)
```

### Authentication Flow

`src/hooks.server.js`에서 전역 인증 처리:
- `/` (로그인) + `/api/*` → 인증 불필요
- 나머지 모든 경로 → 쿠키 `auth_token` 검증 필수
- 인증 실패 시 `/`로 리다이렉트

### AI Analysis Pipeline

`src/routes/api/analyze/+server.js`의 3단계 처리:

1. **프로젝트 분석**: Claude가 JSON으로 견적 데이터 반환
   - feasibility (0-100)
   - estimated_hours, difficulty (1-5)
   - claude_code_suitable (boolean) - **2주 기준 적용**
   - tech_stack, warnings
   - market_price_min/max

2. **고객 답변 생성**: 100자 내외, 선택한 톤으로 크몽/숨고용 답변

3. **대화 프롬프트 생성**: claude.ai에서 무료로 대화 이어가기용

### Critical System Prompt

`SYSTEM_PROMPT` 상수의 핵심 기준:
```
🔴 핵심 기준: 개발 기간
- 숙련된 1인 개발자가 바이브 코딩 없이 2주 이내 완성 가능 → 적합
- 2주 초과 예상 → 부적합
```

**중요**: `claude_code_suitable` 판단은 이 2주 기준이 최우선입니다. 파일 수, 기술 스택은 보조 지표일 뿐입니다.

## Environment Variables

`.env` 파일 필수 (Git 추적 안 됨):
```env
ADMIN_PASSWORD=your_password
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

Vercel 배포 시 Environment Variables에서 동일하게 설정 필요.

## Key Implementation Details

### Discount Rate Logic
할인율은 음수도 가능 (프리미엄):
- `discount_rate: 0.3` → 30% 할인
- `discount_rate: -0.1` → 10% 프리미엄

최종 견적 = `marketAverage * (1 - discount_rate)`

### Tone Options
4가지 답변 톤 (`getToneDescription` 함수):
- `friendly`: 친근하고 따뜻한 (이모지 포함)
- `professional`: 전문가 신뢰감
- `business`: 비즈니스 격식
- `enthusiastic`: 열정적 긍정

### JSON Parsing Safety
AI 응답에서 JSON 추출 시 정규식 매칭:
```javascript
const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
```
이유: Claude가 가끔 설명 텍스트를 JSON 앞뒤에 추가하기 때문

## Important Constraints

1. **No Database**: 히스토리 저장 없음. 모든 분석은 stateless.
2. **No Session Persistence**: 로그인 상태 유지 안 함. 매번 로그인.
3. **SEO Blocking**: `robots.txt` + `<meta name="robots" content="noindex, nofollow">`로 검색 차단.
4. **Single User**: 다중 사용자 고려 불필요. 나만 사용.

## Modifying AI Behavior

프롬프트 수정 시 주의사항:

1. **System Prompt**: `SYSTEM_PROMPT` 상수 수정 시 PRD.md 섹션 6.1도 함께 업데이트
2. **2주 기준 유지**: `claude_code_suitable` 판단 기준 절대 완화 금지
3. **JSON 형식 강제**: 분석 프롬프트에 "JSON만, 다른 텍스트 포함 금지" 문구 유지
4. **견적 가이드**: 시간당 단가 3-4만원 기준, 기술 스택별 견적 범위 참고

## Styling

- **Framework**: Tailwind CSS (순수 CSS, Skeleton UI 제거됨)
- **반응형**: 모바일 우선 (min-width 768px 브레이크포인트)
- **디자인 철학**: 미니멀, 기능 중심, 불필요한 장식 배제

## Testing Strategy

프로덕션 전 필수 테스트:
1. 실제 크몽/숨고 문의로 5건 이상 분석
2. 모든 할인율 옵션 테스트
3. 4가지 톤 모두 확인
4. 모바일 반응형 확인
5. 복사 버튼 동작 확인

## Deployment

Vercel 자동 배포 설정:
- `main` 브랜치 푸시 → Production 배포
- 기타 브랜치 → Preview 배포
- `@sveltejs/adapter-vercel` 사용 (서버리스)

## Known Limitations

1. AI 분석 속도: 평균 3-5초 (Claude API 호출 3회)
2. 견적 정확도: AI 판단이므로 ±20% 오차 가능
3. 대화 기능: API가 아닌 claude.ai 무료 플랜 활용 (비용 절약)
4. 히스토리 없음: 과거 분석 기록 조회 불가

## Cost Monitoring

API 비용 추적:
- Claude Sonnet 4.5: 분석 1건당 약 $0.03
- 월 100건 기준: 약 $3 (4,000원)
- Vercel Hobby: 무료

## References

- PRD.md: 전체 프로젝트 요구사항 및 명세
- README.md: 설치/배포 가이드
- Anthropic API: https://docs.anthropic.com/
