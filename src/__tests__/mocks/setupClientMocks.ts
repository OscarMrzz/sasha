import { beforeEach, vi } from "vitest";
import { supabaseMock, resetSupabaseMock } from "./supabaseMock";

vi.mock("@/lib/supabase", () => ({
  dataBaseSupabase: supabaseMock.client,
}));

vi.mock("@/services/servidor/supabaseAdmin", () => ({
  getSupabaseAdmin: () => supabaseMock.client,
}));

vi.mock("@/services/servidor/supabaseServidor", () => ({
  createClientServidor: async () => supabaseMock.client,
}));

export function useSupabaseMock() {
  beforeEach(() => {
    resetSupabaseMock({ data: [], error: null });
  });
  return supabaseMock;
}

export { supabaseMock, resetSupabaseMock };
