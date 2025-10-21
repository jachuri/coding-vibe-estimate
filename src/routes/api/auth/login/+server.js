import { json } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';

export async function POST({ request, cookies }) {
	try {
		const { password } = await request.json();

		if (password === ADMIN_PASSWORD) {
			// 인증 성공 - 쿠키 설정
			cookies.set('auth_token', 'authenticated', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 // 24시간
			});

			return json({
				success: true,
				message: '로그인 성공'
			});
		} else {
			return json(
				{
					success: false,
					message: '비밀번호가 올바르지 않습니다'
				},
				{ status: 401 }
			);
		}
	} catch (error) {
		return json(
			{
				success: false,
				message: '로그인 처리 중 오류가 발생했습니다'
			},
			{ status: 500 }
		);
	}
}
