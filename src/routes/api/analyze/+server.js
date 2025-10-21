import { json } from '@sveltejs/kit';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT = `당신은 바이브코딩(AI 기반 개발) 전문가입니다.
고객의 프로젝트 요구사항을 분석하여 견적을 제공합니다.

## 판단 기준
클로드코드 적합:
- 소~중규모 프로젝트 (~500 파일)
- 표준 기술 스택
- 명확한 요구사항
- 웹/앱/자동화 프로젝트

클로드코드 부적합:
- 대규모 프로젝트 (1000+ 파일)
- 레거시 코드베이스
- 복잡한 의존성
- 임베디드, 블록체인 등 특수 분야

## 기술 스택 및 견적 가이드
웹 자동화:
- 기술: Python, Selenium, BeautifulSoup
- 간단: 30-50만원 (10-20시간)
- 복잡: 50-100만원 (20-40시간)

데이터 처리:
- 기술: Python, pandas, openpyxl
- 간단: 20-40만원 (8-15시간)
- 복잡: 40-80만원 (15-30시간)

웹앱:
- 기술: React/Svelte, Node.js/FastAPI
- 간단: 50-100만원 (20-40시간)
- 중간: 100-200만원 (40-80시간)

모바일 앱:
- 기술: React Native, Flutter
- 간단: 80-150만원 (30-50시간)
- 중간: 150-300만원 (50-100시간)

API 통합:
- 3개 이하: 50-80만원
- 5개 이상: 80-150만원

LLM 챗봇:
- 기본: +30-50만원
- 고급: +50-100만원

시간당 단가: 3-4만원 기준으로 계산`;

function getToneDescription(tone) {
	const descriptions = {
		friendly: '친근하고 따뜻한 톤',
		professional: '전문가다운 신뢰감 있는 톤',
		business: '비즈니스 격식을 갖춘 톤',
		enthusiastic: '열정적이고 긍정적인 톤'
	};
	return descriptions[tone] || descriptions.friendly;
}

function getDiscountReason(discountRate) {
	if (discountRate >= 0.4) return '초기 포트폴리오 확보 및 테스트';
	if (discountRate >= 0.3) return '초기 고객 확보 프로모션';
	if (discountRate >= 0.1) return '빠른 계약 성사 할인';
	if (discountRate <= -0.1) return '긴급 프로젝트 프리미엄';
	return '표준 견적';
}

export async function POST({ request }) {
	try {
		const { description, discount_rate, tone } = await request.json();

		if (!description || description.trim().length === 0) {
			return json(
				{
					success: false,
					message: '프로젝트 설명을 입력해주세요'
				},
				{ status: 400 }
			);
		}

		// 1단계: 프로젝트 분석
		const analysisPrompt = `다음 프로젝트를 분석하고 JSON 형식으로만 답변하세요.

## 고객 문의
${description}

## 할인율
${discount_rate > 0 ? `${discount_rate * 100}% 할인 적용` : discount_rate < 0 ? `${Math.abs(discount_rate) * 100}% 프리미엄` : '시장가'}

## 출력 형식 (JSON만, 다른 텍스트 포함 금지)
{
  "feasibility": 0-100 사이 숫자,
  "estimated_hours": 숫자 (개발 시간),
  "difficulty": 1-5 사이 숫자,
  "claude_code_suitable": true 또는 false,
  "tech_stack": ["기술1", "기술2"],
  "warnings": ["주의사항1", "주의사항2"],
  "market_price_min": 숫자 (만원),
  "market_price_max": 숫자 (만원),
  "reasoning": "판단 근거 (150자 이내)"
}

견적은 위의 가이드를 참고하되, 프로젝트의 복잡도를 정확히 반영하세요.`;

		const analysisResponse = await anthropic.messages.create({
			model: 'claude-sonnet-4-5-20250929',
			max_tokens: 2048,
			system: SYSTEM_PROMPT,
			messages: [{ role: 'user', content: analysisPrompt }]
		});

		const analysisText = analysisResponse.content[0].text;
		let analysisData;

		try {
			// JSON 파싱
			const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				analysisData = JSON.parse(jsonMatch[0]);
			} else {
				throw new Error('JSON 형식을 찾을 수 없습니다');
			}
		} catch (parseError) {
			console.error('JSON 파싱 오류:', parseError);
			return json(
				{
					success: false,
					message: 'AI 응답 파싱 중 오류가 발생했습니다'
				},
				{ status: 500 }
			);
		}

		// 견적 계산
		const marketAverage = (analysisData.market_price_min + analysisData.market_price_max) / 2;
		const myPrice = Math.round(marketAverage * (1 - discount_rate));
		const estimatedDays = Math.ceil(analysisData.estimated_hours / 8);

		const analysis = {
			feasibility: analysisData.feasibility,
			estimated_hours: analysisData.estimated_hours,
			estimated_days: estimatedDays,
			difficulty: analysisData.difficulty,
			claude_code_suitable: analysisData.claude_code_suitable,
			tech_stack: analysisData.tech_stack,
			warnings: analysisData.warnings || [],
			market_price: {
				min: analysisData.market_price_min,
				max: analysisData.market_price_max,
				average: marketAverage
			},
			my_price: myPrice,
			discount_rate: discount_rate,
			reasoning: analysisData.reasoning
		};

		// 2단계: 고객 답변 생성
		const responsePrompt = `다음 분석 결과를 바탕으로 고객에게 보낼 답변을 생성하세요.

## 분석 결과
- 견적: ${myPrice}만원
- 기간: ${estimatedDays}일
- 기술: ${analysisData.tech_stack.join(', ')}

## 답변 톤
${getToneDescription(tone)}

## 답변 가이드
- 길이: 100자 이내
- 포함 내용: 견적, 기간, 핵심 기술
- 친근하고 전문적인 톤
- 이모지 사용 (톤이 friendly인 경우)
- 질문으로 마무리 ("어떠신가요?" 등)

답변만 생성하고, 다른 설명은 하지 마세요.`;

		const responseMessage = await anthropic.messages.create({
			model: 'claude-sonnet-4-5-20250929',
			max_tokens: 512,
			messages: [{ role: 'user', content: responsePrompt }]
		});

		const customerResponse = responseMessage.content[0].text.trim();

		// 3단계: 클로드 대화용 프롬프트 생성
		const claudePrompt = `당신은 바이브코딩 전문 외주 개발자입니다.
저는 고객 역할을 하겠습니다. 계약 성사를 목표로 대화를 이어가세요.

## 프로젝트 정보
- 요구사항: ${description}
- 난이도: ${'⭐'.repeat(analysisData.difficulty)} (${analysisData.difficulty}/5)
- 예상 기간: ${estimatedDays}일
- 필요 기술: ${analysisData.tech_stack.join(', ')}
- 시장 견적: ${analysisData.market_price_min}~${analysisData.market_price_max}만원 (평균 ${marketAverage}만원)
- 내 견적: ${myPrice}만원 (${discount_rate > 0 ? `${discount_rate * 100}% 할인` : discount_rate < 0 ? `${Math.abs(discount_rate) * 100}% 프리미엄` : '시장가'})

## 주의사항
${analysisData.warnings.map((w) => `- ${w}`).join('\n')}

## 협상 가이드
- 최저 가능 가격: ${Math.round(myPrice * 0.9)}만원 (추가 10% 할인까지 가능)
- 할인 이유: ${getDiscountReason(discount_rate)}
- 빠른 시작 가능 (내일 또는 당일부터)
- 유사 프로젝트 경험 있음
- 포트폴리오: Wowther(5개 API 통합), 출장관리 앱 등

## 답변 가이드
- 톤: ${getToneDescription(tone)}
- 길이: 100자 이내 권장 (간결하게)
- 가격 협상:
  * 10% 추가 할인까지 가능 (최저가 명시)
  * 할인 이유 설명 (초기 고객, 포트폴리오, 빠른 성사 등)
  * 마감 임박 등으로 긴박감 조성 가능
- 기술 질문: 전문 용어 피하고 쉽게 설명
- 결제/진행: 크몽/숨고 시스템 안내, 안전 거래 강조
- 구매 유도: 자연스럽게, 부담스럽지 않게

## 이전 대화
고객: "${description}"
나: "${customerResponse}"

이제 고객의 다음 질문에 답변해주세요.
답변은 100자 이내로 짧고 자연스럽게 작성하세요.`;

		return json({
			success: true,
			analysis,
			customer_response: customerResponse,
			claude_prompt: claudePrompt
		});
	} catch (error) {
		console.error('분석 오류:', error);
		return json(
			{
				success: false,
				message: 'AI 분석 중 오류가 발생했습니다'
			},
			{ status: 500 }
		);
	}
}
