import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Ruta canónica de Windows: evita el bug de Turbopack al mezclar trabajos/aurora vs Trabajos/Aurora.
const projectRoot = fs.realpathSync.native(
  path.dirname(fileURLToPath(import.meta.url)),
);
const fromSupabaseUrl = supabaseStorageRemotePattern();

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      ...(fromSupabaseUrl ? [fromSupabaseUrl] : []),
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

/** Origen de Storage para `next/image`: se deriva de `NEXT_PUBLIC_SUPABASE_URL`. */
function supabaseStorageRemotePattern() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const protocol = u.protocol === "https:" ? "https" : "http";
    return {
      protocol,
      hostname: u.hostname,
      port: u.port || "",
      pathname: "/storage/v1/object/**",
    };
  } catch {
    return null;
  }
}

export default nextConfig;
