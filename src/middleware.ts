import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validation sécurisée de la session Supabase via getUser() avec gestion automatique des cookies segmentés
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Routes protégées côté serveur
  const isProtected =
    pathname.startsWith('/mon-compte') ||
    pathname.startsWith('/mes-lecons') ||
    pathname.startsWith('/formateur') ||
    pathname.startsWith('/abonnement');

  if (isProtected) {
    // 1. Redirection vers /connexion si l'utilisateur n'est pas authentifié dans Supabase
    if (!user) {
      const redirectUrl = new URL('/connexion', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Vérification du rôle pour les espaces réservés
    if (pathname.startsWith('/formateur') || pathname.startsWith('/abonnement')) {
      const userRole =
        user.user_metadata?.role ||
        request.cookies.get('skillup_user_role')?.value ||
        'student';

      if (userRole === 'student') {
        return NextResponse.redirect(new URL('/mon-compte', request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/mon-compte/:path*',
    '/mes-lecons/:path*',
    '/formateur/:path*',
    '/abonnement/:path*',
  ],
};

