<script>
	import { goto } from '$app/navigation';

	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			const data = await response.json();

			if (data.success) {
				goto('/analyze');
			} else {
				error = data.message || '로그인 실패';
			}
		} catch (e) {
			error = '로그인 중 오류가 발생했습니다';
		} finally {
			loading = false;
		}
	}

	function handleKeyPress(e) {
		if (e.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<svelte:head>
	<title>견적 분석 도구 - 로그인</title>
</svelte:head>

<div class="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
	<div class="card p-8 w-full max-w-md space-y-6">
		<div class="text-center space-y-2">
			<div class="text-6xl">🔐</div>
			<h1 class="h1">견적 분석 도구</h1>
			<p class="text-surface-600-300-token">바이브코딩 전용</p>
		</div>

		<div class="space-y-4">
			<label class="label">
				<span>비밀번호</span>
				<input
					type="password"
					class="input"
					bind:value={password}
					on:keypress={handleKeyPress}
					placeholder="비밀번호를 입력하세요"
					disabled={loading}
				/>
			</label>

			{#if error}
				<aside class="alert variant-filled-error">
					<div class="alert-message">
						<p>{error}</p>
					</div>
				</aside>
			{/if}

			<button
				type="button"
				class="btn variant-filled-primary w-full"
				on:click={handleLogin}
				disabled={loading || !password}
			>
				{loading ? '로그인 중...' : '로그인'}
			</button>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
