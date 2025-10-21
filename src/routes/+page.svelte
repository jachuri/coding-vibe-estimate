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

<div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
	<div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md space-y-6">
		<div class="text-center space-y-2">
			<div class="text-6xl">🔐</div>
			<h1 class="text-3xl font-bold text-gray-900">견적 분석 도구</h1>
			<p class="text-gray-600">바이브코딩 전용</p>
		</div>

		<div class="space-y-4">
			<label class="block">
				<span class="block text-sm font-medium text-gray-700 mb-1">비밀번호</span>
				<input
					type="password"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					bind:value={password}
					on:keypress={handleKeyPress}
					placeholder="비밀번호를 입력하세요"
					disabled={loading}
				/>
			</label>

			{#if error}
				<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					<p>{error}</p>
				</div>
			{/if}

			<button
				type="button"
				class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
				on:click={handleLogin}
				disabled={loading || !password}
			>
				{loading ? '로그인 중...' : '로그인'}
			</button>
		</div>
	</div>
</div>
