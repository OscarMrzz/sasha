import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | null = null;

/**
 * Cliente servidor con service role (solo en Route Handlers / Server Components).
 * Inicialización perezosa para que `next build` no falle al cargar el grafo de módulos
 * si las variables de entorno aún no están disponibles en ese momento.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. " +
        "En Vercel: Project → Settings → Environment Variables, y activa que estén disponibles en Build."
    );
  }
  if (!admin) {
    admin = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return admin;
}
