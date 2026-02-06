import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  // GCLB ヘルスチェック（パスは / 固定のため、User-Agent で判定して 200 を返す）
  if (nextUrl.pathname === '/' && /GoogleHC/i.test(req.headers.get('user-agent') ?? '')) {
    return new NextResponse('OK', { status: 200 });
  }

  const isLoggedIn = !!session?.user;

  const isAuthPage = nextUrl.pathname.startsWith('/login');
  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isPublicRoute = nextUrl.pathname === '/';

  // API ルートはスキップ
  if (isApiRoute) {
    return NextResponse.next();
  }

  // ログイン済みでログインページにアクセス → ダッシュボードへリダイレクト
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // 未ログインで保護されたページにアクセス → ログインページへリダイレクト
  if (!isLoggedIn && !isAuthPage && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.png$).*)'],
};
