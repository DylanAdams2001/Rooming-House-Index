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

  if (!user && (isDashboardRoute || isAccountRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // One login for the whole site. /account is every account's home (messages,
  // application, settings, and the investor upsell). /dashboard is the investor add-on —
  // gated on investor_access='active', or role in ('provider','admin') who need it for
  // their own listing/compliance work. Anyone else hitting /dashboard gets sent to the
  // upsell instead of a hard block, since unlocking it is one click away.
  if (user && isDashboardRoute) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, investor_access")
      .eq("id", user.id)
      .maybeSingle();

    const hasDashboardAccess =
      profile?.investor_access === "active" ||
      profile?.role === "provider" ||
      profile?.role === "admin";

    if (!hasDashboardAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/account/upgrade";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
