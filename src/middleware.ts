import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for HMR and Next.js internal endpoints
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/__nextjs_") ||
    pathname.includes("webpack-hmr")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define route types
  const isAuthRoute = pathname.startsWith("/login");
  const isProtectedRoute =
    pathname.startsWith("/inbox") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/archive") ||
    pathname.startsWith("/items") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/share");
  const isRootRoute = pathname === "/";
  
  // Legacy routes - redirect to new locations
  const isLegacyRoute = 
    pathname.startsWith("/everything") ||
    pathname.startsWith("/later") ||
    pathname.startsWith("/favorites");

  // Redirect legacy routes to new locations
  if (isLegacyRoute) {
    const url = request.nextUrl.clone();
    if (pathname.startsWith("/everything")) {
      url.pathname = "/inbox";
    } else if (pathname.startsWith("/later") || pathname.startsWith("/favorites")) {
      url.pathname = "/library";
    }
    return NextResponse.redirect(url);
  }

  // Authenticated user on root → redirect to /inbox
  if (user && isRootRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/inbox";
    return NextResponse.redirect(url);
  }

  // Authenticated user on auth routes → redirect to /inbox
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/inbox";
    return NextResponse.redirect(url);
  }

  // Unauthenticated user on protected routes → redirect to /login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/* (all Next.js internal paths including HMR)
     * - __nextjs_* (Next.js internal paths)
     * - favicon.ico (favicon file)
     * - static assets (images, etc.)
     */
    "/((?!_next|__nextjs|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
