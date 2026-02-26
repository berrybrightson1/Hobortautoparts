
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
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    const isPortalRoute = request.nextUrl.pathname.startsWith('/portal');

    // 1. Strict route protection: 
    // If trying to access portal but no valid user (e.g. logged out or deleted from DB)
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
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
