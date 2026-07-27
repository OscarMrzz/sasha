/**
 * URLs firmadas de Storage y el optimizador de Next (`/_next/image`) no siempre conviven bien
 * (p. ej. servidor sin acceso al host o query larga con token).
 * Usamos `unoptimized` cuando la imagen viene del mismo proyecto que `NEXT_PUBLIC_SUPABASE_URL`.
 */
export function shouldUseUnoptimizedImageForSupabaseStorage(src: string): boolean {
  if (!src) return false;
  if (src.includes("/storage/v1/object/sign")) return true;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!base) return false;

  try {
    const origin = new URL(base).origin;
    return src.startsWith(`${origin}/`);
  } catch {
    return false;
  }
}
