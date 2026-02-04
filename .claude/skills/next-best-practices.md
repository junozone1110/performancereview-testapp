---
name: next-best-practices
description: Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling
---

# Next.js Best Practices

Apply these rules when writing or reviewing Next.js code.

## File Conventions

### Project Structure
- `app/` - App Router (recommended)
- `page.tsx` - Route page
- `layout.tsx` - Shared layout
- `loading.tsx` - Loading UI
- `error.tsx` - Error UI
- `not-found.tsx` - 404 UI

### Route Segments
- `[param]` - Dynamic segment
- `[...slug]` - Catch-all segment
- `[[...slug]]` - Optional catch-all
- `(group)` - Route group (no URL impact)
- `@slot` - Parallel route
- `(.)segment` - Intercepting route

## RSC Boundaries

Detect invalid React Server Component patterns.

### Invalid Patterns
- Async client components (client components cannot be async)
- Non-serializable props passed to client components
- Using hooks in server components

### Valid Exceptions
- Server Actions can be async
- Server components can be async

## Async Patterns (Next.js 15+)

### Async APIs
```tsx
// params and searchParams are now async
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query: string }>;
}) {
  const { id } = await params;
  const { query } = await searchParams;
}

// cookies() and headers() are async
import { cookies, headers } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
}
```

## Directives

### React Directives
- `'use client'` - Mark component as client component
- `'use server'` - Mark function as server action

### Next.js Directives
- `'use cache'` - Enable caching for component/function

## Error Handling

### Error Boundaries
```tsx
// error.tsx - Catches errors in route segment
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Navigation Functions
- `redirect(path)` - Redirect to path
- `permanentRedirect(path)` - 308 redirect
- `notFound()` - Trigger 404
- `forbidden()` - Trigger 403 (auth errors)
- `unauthorized()` - Trigger 401 (auth errors)

## Data Patterns

### Server Components vs Server Actions vs Route Handlers

| Use Case | Solution |
|----------|----------|
| Fetching data for render | Server Component |
| Form submission | Server Action |
| External API webhook | Route Handler |
| Client-side mutation | Server Action |

### Avoiding Data Waterfalls
```tsx
// Bad - sequential fetches
const user = await getUser();
const posts = await getPosts(user.id);

// Good - parallel fetches
const [user, posts] = await Promise.all([
  getUser(),
  getPosts(userId),
]);

// Better - with Suspense
<Suspense fallback={<Loading />}>
  <UserProfile />
</Suspense>
<Suspense fallback={<Loading />}>
  <UserPosts />
</Suspense>
```

## Route Handlers

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ users: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ created: body }, { status: 201 });
}
```

**Note:** GET handlers in `route.ts` conflict with `page.tsx` in same folder.

## Image Optimization

```tsx
import Image from 'next/image';

// Always use next/image over <img>
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For LCP images
  sizes="(max-width: 768px) 100vw, 50vw"
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

## Font Optimization

```tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Metadata

```tsx
// Static metadata
export const metadata = {
  title: 'My App',
  description: 'Description',
};

// Dynamic metadata
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return {
    title: product.name,
    openGraph: {
      images: [product.image],
    },
  };
}
```

## Hydration Errors

### Common Causes
- Using `Date.now()` or `Math.random()` during render
- Browser-only APIs (`window`, `localStorage`)
- Invalid HTML nesting (`<p><div>`)
- Browser extensions modifying DOM

### Fixes
```tsx
// Use useEffect for browser-only code
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;

// Or use dynamic import with ssr: false
const Component = dynamic(() => import('./Component'), { ssr: false });
```

## Suspense Boundaries

Hooks that require Suspense boundaries:
- `useSearchParams()` - Wrap in Suspense
- `usePathname()` - May cause CSR bailout

```tsx
<Suspense fallback={<div>Loading...</div>}>
  <SearchParamsComponent />
</Suspense>
```

## Self-Hosting

```js
// next.config.js
module.exports = {
  output: 'standalone', // For Docker deployments
};
```

For multi-instance deployments, configure custom cache handlers for ISR.
