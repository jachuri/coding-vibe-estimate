export async function handle({ event, resolve }) {
	const url = new URL(event.request.url);

	// 로그인 페이지와 API는 인증 체크 제외
	if (url.pathname === '/' || url.pathname.startsWith('/api/')) {
		return await resolve(event);
	}

	// 나머지 페이지는 인증 확인
	const authToken = event.cookies.get('auth_token');
	if (!authToken || authToken !== 'authenticated') {
		return new Response('Redirect', {
			status: 303,
			headers: { Location: '/' }
		});
	}

	return await resolve(event);
}
