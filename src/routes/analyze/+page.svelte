<script>
	import { goto } from '$app/navigation';

	let discountRate = 0.3;
	let tone = 'friendly';
	let description = '';
	let loading = false;
	let result = null;
	let copied = { response: false, prompt: false };

	const discountOptions = [
		{ value: 0.5, label: '50% 할인 (테스트/친구)' },
		{ value: 0.4, label: '40% 할인 (포트폴리오용)' },
		{ value: 0.3, label: '30% 할인 (초기 고객 확보)' },
		{ value: 0.2, label: '20% 할인' },
		{ value: 0.1, label: '10% 할인' },
		{ value: 0, label: '시장가 (0%)' },
		{ value: -0.1, label: '+10% 프리미엄' },
		{ value: -0.2, label: '+20% 프리미엄' },
		{ value: -0.3, label: '+30% 프리미엄' }
	];

	const toneOptions = [
		{ value: 'friendly', label: '친근하게 ("좋은 선택이에요! 👍")' },
		{ value: 'professional', label: '전문가 톤 ("검토 결과 가능합니다.")' },
		{ value: 'business', label: '비즈니스 격식 ("제안드립니다.")' },
		{ value: 'enthusiastic', label: '열정적 ("완전 가능합니다!! 😄")' }
	];

	async function handleAnalyze() {
		if (!description.trim()) {
			alert('고객 문의 내용을 입력해주세요');
			return;
		}

		loading = true;
		result = null;

		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					description: description.trim(),
					discount_rate: discountRate,
					tone
				})
			});

			const data = await response.json();

			if (response.ok) {
				result = data;
			} else {
				alert(data.message || '분석 중 오류가 발생했습니다');
			}
		} catch (e) {
			alert('분석 요청 중 오류가 발생했습니다');
		} finally {
			loading = false;
		}
	}

	async function copyToClipboard(text, type) {
		try {
			await navigator.clipboard.writeText(text);
			copied[type] = true;
			setTimeout(() => {
				copied[type] = false;
			}, 2000);
		} catch (e) {
			alert('복사에 실패했습니다');
		}
	}

	function handleLogout() {
		goto('/');
	}

	function resetForm() {
		description = '';
		result = null;
	}

	function getStars(difficulty) {
		return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
	}
</script>

<svelte:head>
	<title>견적 분석 도구 - 분석</title>
</svelte:head>

<div class="h-screen overflow-y-auto bg-surface-50-900-token">
	<div class="container mx-auto p-4 max-w-4xl space-y-6">
		<!-- 헤더 -->
		<div class="card p-4 flex justify-between items-center">
			<h1 class="h2">💼 견적 분석 도구</h1>
			<button type="button" class="btn variant-ghost-surface" on:click={handleLogout}>
				로그아웃
			</button>
		</div>

		<!-- 입력 폼 -->
		<div class="card p-6 space-y-4">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<label class="label">
					<span>할인율</span>
					<select class="select" bind:value={discountRate}>
						{#each discountOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</label>

				<label class="label">
					<span>답변 톤</span>
					<select class="select" bind:value={tone}>
						{#each toneOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</label>
			</div>

			<label class="label">
				<span>고객 문의 내용</span>
				<textarea
					class="textarea"
					rows="8"
					bind:value={description}
					placeholder="크몽/숨고 문의 내용을 여기에 붙여넣으세요..."
				/>
			</label>

			<button
				type="button"
				class="btn variant-filled-primary w-full"
				on:click={handleAnalyze}
				disabled={loading || !description.trim()}
			>
				{loading ? '🔍 분석 중...' : '🔍 분석하기'}
			</button>
		</div>

		<!-- 분석 결과 -->
		{#if result}
			<div class="card p-6 space-y-6">
				<h2 class="h3">📊 분석 결과</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="space-y-2">
						<p><strong>✅ 실현 가능성:</strong> {result.analysis.feasibility}%</p>
						<p><strong>⏱️ 예상 시간:</strong> {result.analysis.estimated_hours}시간 (약 {result.analysis.estimated_days}일)</p>
						<p><strong>⭐ 난이도:</strong> {getStars(result.analysis.difficulty)} ({result.analysis.difficulty}/5)</p>
					</div>
					<div class="space-y-2">
						<p>
							<strong>🎯 클로드코드 적합도:</strong>
							{result.analysis.claude_code_suitable ? '✅ 매우 적합' : '❌ 부적합'}
						</p>
					</div>
				</div>

				<hr class="opacity-50" />

				<div class="space-y-2">
					<h3 class="h4">🔧 필요 기술 스택</h3>
					<ul class="list-disc list-inside space-y-1">
						{#each result.analysis.tech_stack as tech}
							<li>{tech}</li>
						{/each}
					</ul>
				</div>

				{#if result.analysis.warnings && result.analysis.warnings.length > 0}
					<div class="space-y-2">
						<h3 class="h4">⚠️ 주의사항</h3>
						<ul class="list-disc list-inside space-y-1">
							{#each result.analysis.warnings as warning}
								<li>{warning}</li>
							{/each}
						</ul>
					</div>
				{/if}

				<hr class="opacity-50" />

				<div class="space-y-2">
					<h3 class="h4">💰 견적 정보</h3>
					<p>
						<strong>시장 예상:</strong>
						{result.analysis.market_price.min}~{result.analysis.market_price.max}만원
						(평균 {result.analysis.market_price.average}만원)
					</p>
					<p>
						<strong>할인 적용:</strong>
						{result.analysis.discount_rate > 0
							? `${result.analysis.discount_rate * 100}% 할인`
							: result.analysis.discount_rate < 0
							? `${Math.abs(result.analysis.discount_rate) * 100}% 프리미엄`
							: '시장가'}
					</p>
					<div class="variant-soft-primary p-4 rounded-lg">
						<p class="text-2xl font-bold">💵 최종 견적: {result.analysis.my_price}만원</p>
					</div>
				</div>

				{#if result.analysis.reasoning}
					<div class="space-y-2">
						<h3 class="h4">💡 AI 판단 근거</h3>
						<p class="text-surface-600-300-token">{result.analysis.reasoning}</p>
					</div>
				{/if}
			</div>

			<!-- 고객용 답변 -->
			<div class="card p-6 space-y-4">
				<h2 class="h3">💬 고객용 답변</h2>
				<div class="variant-soft-surface p-4 rounded-lg whitespace-pre-wrap">
					{result.customer_response}
				</div>
				<button
					type="button"
					class="btn variant-filled-secondary w-full"
					on:click={() => copyToClipboard(result.customer_response, 'response')}
				>
					{copied.response ? '✓ 복사됨!' : '📋 답변 복사하기'}
				</button>
			</div>

			<!-- 클로드 대화용 프롬프트 -->
			<div class="card p-6 space-y-4">
				<h2 class="h3">🎭 대화 계속하기 (클로드 웹 활용)</h2>
				<p class="text-surface-600-300-token">
					아래 프롬프트를 claude.ai에 붙여넣으면 고객과의 대화를 이어갈 수 있어요! (무료)
				</p>

				<div class="variant-soft-surface p-4 rounded-lg max-h-80 overflow-y-auto">
					<pre class="text-sm whitespace-pre-wrap">{result.claude_prompt}</pre>
				</div>

				<button
					type="button"
					class="btn variant-filled-tertiary w-full"
					on:click={() => copyToClipboard(result.claude_prompt, 'prompt')}
				>
					{copied.prompt ? '✓ 복사됨!' : '📋 프롬프트 복사하기'}
				</button>

				<div class="variant-soft-warning p-4 rounded-lg space-y-2">
					<p class="font-bold">💡 사용 방법</p>
					<ol class="list-decimal list-inside space-y-1 text-sm">
						<li>위 프롬프트를 복사</li>
						<li>claude.ai에서 새 대화 시작</li>
						<li>프롬프트 붙여넣기</li>
						<li>고객 답변 복붙하면서 대화</li>
						<li>AI가 답변 생성 (무료!)</li>
					</ol>
				</div>
			</div>

			<!-- 새로운 분석 시작 -->
			<button type="button" class="btn variant-ghost-surface w-full" on:click={resetForm}>
				🔄 새로운 분석 시작
			</button>
		{/if}
	</div>
</div>
