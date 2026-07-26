import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
      global: {
        fetch: (url: RequestInfo | URL, options?: RequestInit) =>
          fetch(url, { ...options, cache: "no-store" }),
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAccountRoute = request.nextUrl.pathname.startsWith("/account");
  const isPartnersRoute = request.nextUrl.pathname.startsWith("/partners");

  if (!user && (isDashboardRoute || isAccountRoute || isPartnersRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // One login, but deliberately two separate experiences. /account is the room-seeker
  // side (messages, saved listings, enquiries, settings). /dashboard is the investor
  // side (suburb/market data, provider marketplace) — gated on investor_access='active',
  // or role in ('provider','admin') who need it for their own listing/compliance work.
  // Enforced both directions: an investor never sees the tenant nav, and vice versa.
  if (user && (isDashboardRoute || isAccountRoute || isPartnersRoute)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, investor_access")
      .eq("id", user.id)
      .maybeSingle();

    const hasDashboardAccess =
      profile?.investor_access === "active" ||
      profile?.role === "provider" ||
      profile?.role === "admin";

    const hasPartnersAccess =
      profile?.role === "provider" ||
      profile?.role === "property_manager" ||
      profile?.role === "admin";

    if (isDashboardRoute && !hasDashboardAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/account/upgrade";
      return NextResponse.redirect(url);
    }

    if (isAccountRoute && profile?.investor_access === "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isPartnersRoute && !hasPartnersAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/account";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
