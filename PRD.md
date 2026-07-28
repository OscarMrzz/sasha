# PRD — Sasha

| Campo | Valor |
|---|---|
| Producto | **Sasha** |
| Tipo | Plataforma web de gestión de competencias de bandas (federaciones) |
| Versión documento | 1.0 |
| Fecha | 2026-07-28 |
| Estado | Activo (producto en desarrollo / producción incremental) |
| Stack | Next.js 16, React 19, Supabase (Auth + Postgres + RLS), Tailwind, Redux / React Query / Zustand |

---

## 1. Resumen ejecutivo

Sasha es una aplicación web que digitaliza el ciclo completo de una competencia de bandas bajo una federación: catálogo (bandas, categorías, regiones, rúbricas), operación del evento (asistencia, checkout, evaluación, fiscalización, disciplina), resultados (puntos, copas, rankings, condensados) y gobernanza (usuarios, roles, sanciones, auditoría).

Cada usuario entra con un **rol** y solo ve el panel y las acciones que le corresponden. La autenticación y el control de acceso se apoyan en Supabase Auth, perfiles vinculados y políticas RLS / `revisar_permisos`.

---

## 2. Problema

Hoy las federaciones de bandas gestionan eventos, jurados, sanciones y resultados con procesos dispersos (hojas de cálculo, papel, WhatsApp). Eso genera:

- Errores de captura y pérdida de trazabilidad.
- Demoras en publicar resultados y rankings.
- Dificultad para asignar jurados/fiscales y controlar quién evalúa qué rúbrica.
- Falta de visibilidad para dirigentes de banda sobre su desempeño y sanciones.
- Riesgo de inconsistencias entre asistencia, evaluación y premios (copas).

---

## 3. Objetivos del producto

1. **Centralizar** la operación de eventos de una federación en un solo sistema.
2. **Garantizar** que cada rol solo ejecute las acciones permitidas.
3. **Agilizar** evaluación en campo (jurado, fiscal, disciplina) con flujos claros.
4. **Publicar** resultados, rankings y estadísticas de forma consistente.
5. **Auditar** acciones críticas (inicio de evento, evaluaciones, sanciones, cambios de catálogo).
6. **Empoderar** a bandas (dirigentes / líderes / directores) con consulta de resultados, rúbricas, sanciones y rankings.

### Métricas de éxito (sugeridas)

| Métrica | Indicador |
|---|---|
| Operación de evento | Tiempo desde fin de evaluación hasta resultados publicados |
| Calidad de datos | % evaluaciones completas vs. rúbricas asignadas |
| Adopción | Usuarios activos por rol por evento |
| Confiabilidad | Incidentes de permisos / datos cruzados por sprint |
| Satisfacción banda | Consultas a “Mi banda” sin soporte manual |

---

## 4. Usuarios y roles

| Rol | Propósito principal |
|---|---|
| **admin** / **admin temporal** | Panel de control: catálogo, eventos, resultados, sanciones, usuarios, alertas, controladores |
| **secretaria** | Operación amplia de federación: eventos, bandas, categorías, regiones, rubricas, copas, rankings, sanciones, asistencia, usuarios |
| **jurado** | Evaluar según rúbricas asignadas en eventos del equipo evaluador |
| **fiscal** | Fiscalizar evento, solicitar copas, consultar eventos asignados |
| **comite de disciplina** | Checkout de llegada/entrada, historial, eventos asignados |
| **responsable de bandas** | Gestión de bandas, regiones, categorías |
| **responsable de rubricas** | Gestión y consulta de rúbricas / categorías |
| **responsable de eventos** | Gestión de eventos y regiones |
| **responsable de usuarios** | Gestión de usuarios (con restricción de roles privilegiados) |
| **responsable de mesa** | Consulta de copas, alertas, eventos |
| **lider de banda** / **dirigente** / **director artistico** | Portal “Mi banda”: resultados, rankings, rúbricas, sanciones, estadísticas, notificaciones |
| **developer** | Superpanel (`/sup`, `/dev`): federaciones, permisos, auditoría, controladores, alertas |

Roles privilegiados (`admin`, `admin temporal`, `developer`) no deben poder crearse/asignarse desde gestores de federación.

Roles de banda deben vincularse a una banda (`idForaneaBanda`).

---

## 5. Alcance funcional

### 5.1 Autenticación y sesión

- Inicio de sesión con correo/contraseña (Supabase Auth).
- Perfil extendido en tabla `perfiles` ligado al usuario Auth.
- Validación de sesión: usuario existente, no eliminado, rol activo, permisos.
- Recuperación de contraseña (flujos admin / developer).
- Páginas de error: sin permisos, rol inactivo, usuario no encontrado / eliminado.

### 5.2 Catálogo de federación

- **Federaciones** (developer).
- **Regiones**, **categorías**, **bandas**.
- **Rúbricas**, criterios / cumplimientos / paquetes de evaluación.
- **Usuarios y roles** con filtros por permisos del gestor.
- **Controladores** de sistema (flags / switches operativos).

### 5.3 Eventos

- CRUD de eventos (lugar, fecha, región, estado).
- Asignación de **equipo evaluador** (jurados por rúbrica, fiscal, disciplina, etc.).
- Inicio / seguimiento de eventos en curso.
- Confirmación y consulta de **asistencia de bandas**.
- Menú de opciones por evento (jurados, fiscal, disciplina, etc.).

### 5.4 Evaluación (jurado)

- Listado de eventos asignados.
- Captura de evaluación por rúbrica / criterios / cumplimientos.
- Comentarios asociados a la evaluación.
- Restricción: una rúbrica no puede asignarse a dos jurados del mismo evento.

### 5.5 Fiscalización

- Panel fiscal y flujo de fiscalizar.
- Eventos asignados.
- Solicitud de **copas** (y gestión de solicitudes activas).

### 5.6 Disciplina

- Checkout de llegada y de entrada.
- Historial de checkouts.
- Eventos asignados al comité.

### 5.7 Resultados y rankings

- Resultados por evento, preliminares, detallados por banda.
- Condensado por rúbrica / pivote de condensado.
- Rankings por puntos y por copas (temporada / global).
- Estadísticas y reportes (incl. exportación PDF / Excel donde aplique).
- Premios / escuadras asociados a resultados.

### 5.8 Sanciones y penalizaciones

- Catálogo de sanciones.
- Solicitudes de sanción administrativa.
- Aplicación de sanciones y registro de penalizaciones.
- Visibilidad de sanciones para “Mi banda”.

### 5.9 Portal Mi banda

- Home de banda por `id`.
- Resultados, rúbricas, sanciones, estadísticas.
- Ranking por puntos y por copas.
- Eventos y notificaciones.
- Página de servicio no disponible cuando el backend de banda no responde.

### 5.10 Gobernanza y auditoría

- Auditoría de acciones (eventos en curso, bandas en cancha, historial).
- Alertas operativas (evaluación, mesa, admin).
- Permisos a nivel federación / rutas protegidas por rol (proxy/middleware).

---

## 6. Fuera de alcance (actual)

- App nativa móvil (iOS/Android); el producto es web responsive.
- Multi-tenant self-service completo para muchas federaciones sin rol developer (hoy federaciones se gestionan desde `/sup`).
- Pagos / facturación de inscripción.
- Chat en tiempo real entre roles.
- Offline-first robusto para evaluación en campo sin conectividad (salvo lo que el navegador ya permita).
- Internacionalización multi-idioma (la UI está en español).

---

## 7. Requisitos no funcionales

| Área | Requisito |
|---|---|
| Seguridad | Auth Supabase + validación de sesión + RLS / `revisar_permisos`; rutas por rol en proxy |
| Rendimiento | Evitar waterfalls en server/client; cargas paralelas donde no haya dependencia; lazy de módulos pesados (PDF, charts) |
| Disponibilidad | Dependencia de Supabase; degradación clara en “servicio no disponible” para Mi banda |
| Usabilidad | Flujos por rol con navegación dedicada; feedback de errores en español |
| Observabilidad | Auditoría de acciones críticas; logs de error en flujos clave |
| Calidad | Vitest (unitarias helpers/mappers + integración mockeada de servicios); Playwright para E2E selectos |
| Datos | DB en `snake_case`; app en `camelCase` vía mappers; validación Zod en forms/services |
| Privacidad | No exponer roles privilegiados a gestores de federación; no filtrar datos de otras bandas/federaciones |

---

## 8. Arquitectura (vista de producto)

```text
[Browser]
   │
   ▼
Next.js App Router (páginas por rol)
   │  Auth session + proxy por pathname/rol
   ▼
Services / helpers / mappers  ←→  Supabase Client (SSR + browser)
   │
   ▼
Postgres + RLS + funciones (permisos, vistas de resultados, asistencia, etc.)
```

### Capas de código (referencia)

- `src/app` — rutas UI por rol
- `src/components` — UI reutilizable
- `src/services` — acceso a datos / reglas de negocio
- `src/helpers` — lógica pura
- `src/models` — tipos + schemas Zod
- `src/mappers` — snake ↔ camel
- `supabase/` — migraciones, políticas, seeds, snippets

---

## 9. Flujos principales

### 9.1 Operar un evento

1. Admin/secretaria crea o configura el evento.
2. Se asigna equipo evaluador (jurados por rúbrica, fiscal, disciplina).
3. Bandas confirman asistencia.
4. Se inicia el evento.
5. Disciplina registra checkouts; jurados evalúan; fiscal fiscaliza / solicita copas.
6. Se consolidan resultados, sanciones y premios.
7. Bandas consultan resultados y rankings en Mi banda.

### 9.2 Evaluar (jurado)

1. Login → panel jurado.
2. Selecciona evento asignado.
3. Evalúa rúbricas asignadas (cumplimientos / comentarios).
4. Guarda; el sistema valida duplicados y permisos.

### 9.3 Alta de usuario (gestor federación)

1. Secretaria / responsable de usuarios crea perfil.
2. Sistema filtra roles privilegiados.
3. Si el rol es de banda, exige vínculo a banda.
4. Usuario inicia sesión y entra a su panel.

---

## 10. Criterios de aceptación globales

- [ ] Un usuario autenticado solo accede a rutas de su rol (proxy + RLS).
- [ ] No se puede asignar la misma rúbrica a dos jurados en el mismo evento.
- [ ] Resultados y rankings reflejan evaluaciones, copas y sanciones aplicadas.
- [ ] Roles de banda siempre tienen `idForaneaBanda` válido.
- [ ] Gestores de federación no pueden crear/asignar `admin`, `admin temporal` ni `developer`.
- [ ] Acciones críticas quedan registradas en auditoría cuando el flujo lo requiera.
- [ ] Seeds de desarrollo (`SASHA-DEV`) permiten probar los roles principales con datos coherentes.
- [ ] Tests unitarios/integración de helpers, mappers y servicios pasan en CI.

---

## 11. Dependencias y supuestos

- Existe al menos una federación configurada.
- Políticas SQL (`politicas.sql` / migraciones) están aplicadas; sin ellas la app puede ocultar o bloquear datos por `revisar_permisos`.
- Variables de entorno Supabase configuradas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Los nombres de rol en BD y en proxy deben mantenerse alineados (incluyendo variantes legacy como `liderBanda`).

---

## 12. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Desalineación snake_case vs. nombres legacy en permisos | Datos “desaparecen” en UI | Migraciones + tests de `revisar_permisos` |
| Complejidad de roles y rutas | Fugas o bloqueos de acceso | Matriz rol↔ruta; tests de proxy |
| Evaluación concurrente en campo | Conflictos / datos incompletos | Validaciones de servicio + alertas |
| Exportes PDF/Excel pesados | Degradación UX | Carga diferida / límites de dataset |
| Cambios de schema sin mappers | Regresiones silenciosas | Convención Zod + tests de mappers |

---

## 13. Roadmap orientativo

| Fase | Enfoque |
|---|---|
| **Ahora** | Estabilizar catálogo, eventos, evaluación, resultados, permisos; cobertura de pruebas |
| **Siguiente** | UX de operación en campo, alertas, condensados/reportes, hardening RLS |
| **Después** | Multi-federación más self-service, notificaciones push/email, mejoras offline, analytics de temporada |

Detalle de cambios estructurales grandes: carpeta `implementaciones/`.

---

## 14. Glosario

| Término | Definición |
|---|---|
| Federación | Organización que agrupa bandas, eventos y usuarios |
| Banda | Agrupación participante, asociada a categoría/región |
| Evento | Competencia en fecha/lugar concretos |
| Rúbrica | Instrumento de evaluación con criterios/cumplimientos |
| Copa | Premio solicitado/asignado en el marco del evento o temporada |
| Equipo evaluador | Personas (jurado, fiscal, disciplina, etc.) asignadas a un evento |
| Condensado | Vista agregada de resultados por rúbrica/criterios |
| Checkout | Registro de llegada/entrada de disciplina en el evento |

---

## 15. Referencias del repositorio

- `README.md` — setup Supabase / entorno
- `implementaciones/` — bitácora de implementaciones
- `supabase/` — schema, políticas, seeds
- `src/proxy.ts` — matriz de rutas por rol
- `src/config/navegacion/` — links por panel
`)