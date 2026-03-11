import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createServerClient<any>>;

// Shared helper: create authenticated Supabase client from request context
export async function createAuthClient() {
  const cookieStore = await cookies();

  const supabase: SupabaseClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component context
          }
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  return { supabase, user, error };
}

// Shared helper: require auth, return 401 if not authenticated
export async function requireAuth() {
  const { supabase, user, error } = await createAuthClient();

  if (error || !user) {
    return { supabase, user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { supabase, user, response: null };
}

// Standard error response
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Standard success response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Validate required fields
export function validateRequired(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}
