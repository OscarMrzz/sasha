# Convención de mocks Supabase

## Archivos

| Archivo | Rol |
|---|---|
| `src/__tests__/mocks/supabaseMock.ts` | Cliente fluent (`.from().select().eq()…`) thenable con `{ data, error }` |
| `src/__tests__/mocks/perfilFixture.ts` | Perfil con `idForaneaFederacion` + `assignPerfil(service)` |
| `src/__tests__/mocks/setupClientMocks.ts` | `vi.mock` de `@/lib/supabase`, `getSupabaseAdmin`, `createClientServidor` |
| `src/__tests__/setupEnv.ts` | URL/keys dummy para evitar crash si algún módulo instancia el cliente real |

## Uso en tests de servicio

```ts
import { useSupabaseMock } from "../mocks/setupClientMocks"; // primero
import { assignPerfil, perfilFixture } from "../mocks/perfilFixture";
import MiService from "@/services/miService";

describe("MiService", () => {
  const mock = useSupabaseMock();

  it("get", async () => {
    mock.setResult({
      data: [{ id_categoria: "c1", nombre: "A" }],
      error: null,
    });
    const svc = assignPerfil(new MiService());
    const rows = await svc.get();
    expect(rows[0].idCategoria).toBe("c1");
  });
});
```

## APIs del mock

- `setResult({ data, error })` — resultado por defecto
- `setTableResult(table, result)` — override por tabla
- `enqueueResults(...results)` — cola para varias awaits consecutivas (p. ej. check duplicado + insert)
- `fromCalls` / `rpcCalls` — inspección de llamadas
- `auth.admin.*` — createUser / listUsers / updateUserById
- `storage.from().upload|getPublicUrl|remove`

## Notas

- Filas mock en **snake_case**; asserts de dominio en **camelCase** cuando el servicio usa `fromDb`.
- Importar `setupClientMocks` **antes** del módulo de servicio.
- Helpers que importan `fechaHoyLocalISO` deben `vi.mock("@/hooks/dashboard/useDashboardData")` para no arrastrar Supabase real.
