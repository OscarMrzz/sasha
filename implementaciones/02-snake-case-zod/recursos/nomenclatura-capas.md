# Nomenclatura por capas

| Capa | Estilo | Ejemplo |
|---|---|---|
| Postgres | snake_case | `nombre_banda` |
| Models / Zod / UI | camelCase | `nombreBanda` |
| Services → DB | snake tras `toDb` | `{ nombre_banda: ... }` |
| Services ← DB | camel tras `fromDb` | `{ nombreBanda: ... }` |
