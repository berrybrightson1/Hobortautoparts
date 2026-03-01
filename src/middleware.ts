
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
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
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired - required for Server Components
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    const host = request.headers.get("host") || "";
    const isAdminDomain = host.startsWith("admin.");
    const pathname = request.nextUrl.pathname;

    // Subdomain routing isolation
    if (isAdminDomain) {
        // If on admin subdomain, rewrite /login to internal /admin-login
        if (pathname === "/login") {
            const rewriteUrl = request.nextUrl.clone();
            rewriteUrl.pathname = "/admin-login";
            return NextResponse.rewrite(rewriteUrl);
        }
    } else {
        // If on main domain, completely hide admin routes
        if (pathname.startsWith("/admin-login") || pathname.startsWith("/portal/admin")) {
            const rewriteUrl = request.nextUrl.clone();
            // Next.js triggers standard 404 for unknown paths, this prevents access securely
            rewriteUrl.pathname = "/404";
            return NextResponse.rewrite(rewriteUrl);
        }
    }

    const isPortalRoute = pathname.startsWith('/portal');

    // 1. Strict route protection: 
    if (isPortalRoute && (!user || error)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/login';
        // Clear stale auth cookies on the redirect response
        const res = NextResponse.redirect(redirectUrl);
        res.cookies.delete('sb-access-token');
        res.cookies.delete('sb-refresh-token');
        return res;
    }

    // 2. Enforce suspension if user is logged in
    if (user?.user_metadata?.suspended === true) {
        if (isPortalRoute) {
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/suspended'
            redirectUrl.searchParams.set('auth_error', 'account_suspended')
            return NextResponse.redirect(redirectUrl)
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
