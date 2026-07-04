import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Kullanıcının Vercel domain'lerini görmemesi için kanonik domain'e (sinezon.com) yönlendir
const NON_CANONICAL_HOSTS = new Set([
  'sinema-platform.vercel.app',
  'sinema-platform-mustafaorskirans-projects.vercel.app',
  'sinema-platform-mustafaorskiran-mustafaorskirans-projects.vercel.app',
  'www.sinezon.com',
])

export async function middleware(request: NextRequest) {
  const host = request.nextUrl.hostname
  if (NON_CANONICAL_HOSTS.has(host)) {
    const canonicalUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://sinezon.com')
    return NextResponse.redirect(canonicalUrl, 308)
  }

  let response = NextResponse.next({ request })

  // Refresh Supabase auth session (keeps cookie alive)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() is required to trigger session refresh — do not remove
  const { data: { user } } = await supabase.auth.getUser()

  // Admin route protection (secondary layer — AdminLayout already calls requireAdmin())
  if (request.nextUrl.pathname.startsWith('/Mustafa')) {
    if (!user) {
      const loginUrl = new URL('/auth/giris', request.url)
      loginUrl.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
