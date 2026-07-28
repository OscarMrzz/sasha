# Plan

Seguir `implementaciones/README.md`.

## Pasos

1. Instalar Vitest, `@vitejs/plugin-react`, `jsdom`, `@vitest/coverage-v8`.
2. Añadir `vitest.config.ts`, scripts `test` / `test:watch` / `test:coverage`, y `src/__tests__/setupEnv.ts`.
3. Crear mocks compartidos (`supabaseMock`, `perfilFixture`, `setupClientMocks`).
4. Escribir unitarias de helpers y mappers (`caseMapper`, `parseCamel`).
5. Escribir integración mockeada de todos los servicios activos (cliente + `servidor/`).
6. Evaluar componentes: sin RTL masivo; sí lógica pura (`estadoSolicitudPill`).
7. Verificar `pnpm test` en verde y documentar recursos.

## Alcance

- Helpers en `src/helpers/`
- Mappers en `src/services/mappers/`
- Servicios no vacíos en `src/services/` y `src/services/servidor/`
- Util puro de componente: `estadoSolicitudPill`

## Fuera de alcance

Ver [recursos/fuera-de-alcance.md](./recursos/fuera-de-alcance.md).

## Recursos

- [matriz-cobertura.md](./recursos/matriz-cobertura.md)
- [convencion-mocks-supabase.md](./recursos/convencion-mocks-supabase.md)
- [fuera-de-alcance.md](./recursos/fuera-de-alcance.md)
