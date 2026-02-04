import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
