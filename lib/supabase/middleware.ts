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

  // Tenants get their own area (/account) — no investor suburb/market data. Everyone
  // else (investor/provider/admin) uses /dashboard. Enforced both directions here so
  // an old bookmark or a typed URL can't cross into the wrong area.
  //
  // Deliberately NOT redirecting logged-in users away from /login or /signup: this app
  // supports one browser holding separate investor and tenant accounts (they're treated
  // as different platforms), so someone can be logged in as an investor and still need
  // to reach /signup to create a tenant account (e.g. via Enquire on a listing), or vice
  // versa. Auto-redirecting away from auth routes broke exactly that flow.
  if (user && (isDashboardRoute || isAccountRoute)) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = profile?.role ?? null;

    if (isDashboardRoute && role === "tenant") {
      const url = request.nextUrl.clone();
      url.pathname = "/account";
      return NextResponse.redirect(url);
    }

    if (isAccountRoute && role !== null && role !== "tenant") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
