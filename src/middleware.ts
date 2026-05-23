import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Buat response dasar Next.js
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Cek keamanan variabel lingkungan sebelum inisialisasi
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // 2. Inisialisasi Supabase Server Client di tingkat Middleware
  // Mengikuti standar @supabase/ssr untuk sinkronisasi cookie antara Next.js dan Supabase
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options })
        );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options })
        );
      },
    },
  });

  // 3. Otomatis merefresh session token jika sudah expired melalui getUser()
  // Panggilan getUser() sangat penting karena melakukan verifikasi token langsung ke server auth Supabase
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 4. LOGIKA PROTEKSI ROUTE DASHBOARD (Hanya memeriksa rute yang diawali /dashboard)
  if (pathname.startsWith("/dashboard")) {
    
    // KONDISI 1: User belum login sama sekali
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // KONDISI 2 & 3: User sudah login, periksa hak akses (role) di tabel profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Jika data profil tidak ditemukan atau role-nya BUKAN 'manager', blokir akses
    if (!profile || profile.role !== "manager") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // KONDISI 4: Jika mengakses public route (/login, /unauthorized) atau role sudah sesuai ('manager')
  return response;
}

// 5. CONFIG MATCHER (Memastikan middleware hanya berjalan pada route aplikasi, bukan aset statis)
export const config = {
  matcher: [
    /*
     * Cocokkan semua request paths kecuali yang diawali dengan:
     * - _next/static (file statis hasil kompilasi)
     * - _next/image (fitur optimasi gambar Next.js)
     * - favicon.ico (ikon tab browser)
     * - Semua file dengan ekstensi gambar/media (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};