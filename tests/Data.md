# Aurora — Roles, ventanas y acciones

> Fuentes: `supabase/seed.sql` (permisos BD), `src/proxy.ts` (protección de rutas), `src/lib/navegacion/navigationConfig.ts` (menú lateral).
>
> **Leyenda acciones:** `SELECT` = ver · `INSERT` = crear · `UPDATE` = editar · `DELETE` = eliminar
>
> **Ruta de entrada** = a dónde redirige el login (`SignInPage`).

---


| No  | rol       | page              |
| --- | --------- | ----------------- |
| 1   | developer | dev               |
| 2   | `admin`   | PanelControlPage` |


## 1. Lista de roles

| # | Rol | Usuario seed | Ruta de entrada |
|---|-----|--------------|-----------------|
| 1 | `developer` | — | `/sup` |
| 2 | `admin` | admin@feccah.com | `/PanelControlPage` |
| 3 | `admin temporal` | — | `/PanelControlPage` |
| 4 | `jurado` | — | `/EvaluarPage` |
| 5 | `fiscal` | — | `/fiscal` |
| 6 | `dirigente` | — | `/mi-banda-page/{idBanda}` |
| 7 | `lider de banda` | — | `/mi-banda-page` |
| 8 | `responsable de bandas` | — | `/responsable-bandas` |
| 9 | `responsable de rubricas` | — | `/responsable-rubricas` |
| 10 | `responsable de usuarios` | — | `/responsable-usuarios` |
| 11 | `responsable de eventos` | — | `/responsable-eventos` |
| 12 | `responsable de mesa` | — | `/responsable-mesa` |
| 13 | `secretaria` | secretaria@feccah.com | `/secretaria` |
| 14 | `comite de disciplina` | — | `/diciplina` |

**Notas:**
- Roles en código pero **no** en `seed.sql`: `presidenteJurado`, `director artistico`, `liderBanda`, `directorArtistico`. El proxy acepta variantes de mi-banda (`director artistico`, `liderBanda`, etc.).
- Todos los roles autenticados pueden acceder a `/miPerfilPage` (editar su propio perfil).

---

## 2. Ventanas por rol

### developer

**Protección proxy:** `/sup`, `/dev`, `/federacionesHomePage`

| Ventana | Ruta |
|---------|------|
| Panel developer (home) | `/sup` |
| Federaciones | `/sup/federaciones` |
| Usuarios | `/sup/usuarios` |
| Permisos | `/sup/permisos` |
| Dev — Inicio | `/dev` |
| Dev — Controladores | `/dev/controladores` |
| Federaciones (panel) | `/PanelControlPage/federacionesHomePage` |
| Mi perfil | `/miPerfilPage` |

---

### admin

**Protección proxy:** `/PanelControlPage`

| Ventana | Ruta |
|---------|------|
| Dashboard | `/PanelControlPage/dashboard` |
| Usuarios | `/PanelControlPage/usuariosHomePage` |
| Región | `/PanelControlPage/regionHomePage` |
| Categorías | `/PanelControlPage/categoriasHomePage` |
| Bandas | `/PanelControlPage/bandasHomePage` |
| Rúbrica | `/PanelControlPage/rubricaHomePage` |
| Ver rúbricas | `/PanelControlPage/ver-rubricas` |
| Evento | `/PanelControlPage/eventosHomePage` |
| Asistencia de bandas | `/PanelControlPage/asistencia-bandas` |
| Checkout | `/PanelControlPage/checkout` |
| Resultados por banda | `/PanelControlPage/resutados-detallados-banda` |
| Copas | `/PanelControlPage/copasHomePage` |
| Copas Temporada | `/PanelControlPage/copasTemporadaPage` |
| Controladores | `/PanelControlPage/controladores` |
| Sanciones | `/PanelControlPage/sanciones` |
| Sanciones aplicadas | `/PanelControlPage/aplicacion-sancion` |
| Solicitudes de sanción | `/PanelControlPage/aplicar-sancion` |
| Mi perfil | `/miPerfilPage` |

---

### admin temporal

Mismas ventanas que **admin** (mismo menú `ADMIN_NAV_LINKS`).

---

### jurado

**Protección proxy:** `/EvaluarPage`, `/mis-eventos-asignados`

| Ventana | Ruta |
|---------|------|
| Inicio | `/EvaluarPage` |
| Evaluar | `/EvaluarPage/evaluar` |
| Mis eventos | `/EvaluarPage/mis-eventos-asignados` |
| Rúbricas | `/EvaluarPage/rubricas` |
| Mis eventos (ruta alterna) | `/mis-eventos-asignados` |
| Mi perfil | `/miPerfilPage` |

---

### fiscal

**Protección proxy:** `/fiscal`

| Ventana | Ruta |
|---------|------|
| Inicio | `/fiscal` |
| Fiscalizar | `/fiscal/fiscalizar` |
| Mis eventos | `/fiscal/mis-eventos-asignados` |
| Solicitar copa | `/fiscal/solicitar-copa` |
| Mi perfil | `/miPerfilPage` |

---

### dirigente / lider de banda / director artistico

**Protección proxy:** `/mi-banda-page` (roles: `dirigente`, `lider de banda`, `director artistico`, `liderBanda`, `directorArtistico`)

| Ventana | Ruta |
|---------|------|
| Inicio (mi banda) | `/mi-banda-page/{idBanda}` |
| Notificaciones | `/mi-banda-page/notificaciones` |
| Estadísticas | `/mi-banda-page/{idBanda}/estadisticas` |
| Ranking por puntos | `/mi-banda-page/{idBanda}/ranking-por-puntos` |
| Ranking por copas | `/mi-banda-page/{idBanda}/ranking-por-copas` |
| Agenda de eventos | `/mi-banda-page/eventos` |
| Resultados | `/mi-banda-page/{idBanda}/resultados` |
| Rúbricas | `/mi-banda-page/{idBanda}/rubricas` |
| Sanciones | `/mi-banda-page/{idBanda}/sanciones` |
| Mi perfil | `/miPerfilPage` |

---

### responsable de bandas

**Protección proxy:** `/responsable-bandas`

| Ventana | Ruta |
|---------|------|
| Bandas | `/responsable-bandas` |
| Categorías | `/responsable-bandas/categorias` |
| Regiones | `/responsable-bandas/regiones` |
| Mi perfil | `/miPerfilPage` |

---

### responsable de rubricas

**Protección proxy:** `/responsable-rubricas`

| Ventana | Ruta |
|---------|------|
| Rúbricas | `/responsable-rubricas` |
| Ver rúbricas | `/responsable-rubricas/ver-rubricas` |
| Categorías | `/responsable-rubricas/categorias` |
| Regiones | `/responsable-rubricas/regiones` |
| Mi perfil | `/miPerfilPage` |

---

### responsable de usuarios

**Protección proxy:** `/responsable-usuarios`

| Ventana | Ruta |
|---------|------|
| Usuarios | `/responsable-usuarios` |
| Mi perfil | `/miPerfilPage` |

---

### responsable de eventos

**Protección proxy:** `/responsable-eventos`

| Ventana | Ruta |
|---------|------|
| Eventos | `/responsable-eventos` |
| Regiones | `/responsable-eventos/regiones` |
| Mi perfil | `/miPerfilPage` |

---

### responsable de mesa

**Protección proxy:** `/responsable-mesa`

| Ventana | Ruta |
|---------|------|
| Dashboard | `/responsable-mesa` |
| Eventos | `/responsable-mesa/eventos` |
| Asignar copas | `/responsable-mesa/asignar-copas` |
| Consultar copas | `/responsable-mesa/consultar-copas` |
| Mi perfil | `/miPerfilPage` |

---

### secretaria

**Protección proxy:** `/secretaria`

| Ventana | Ruta |
|---------|------|
| Usuarios | `/secretaria/usuarios` |
| Bandas | `/secretaria/bandas` |
| Categorías | `/secretaria/categorias` |
| Eventos | `/secretaria/eventos` |
| Regiones | `/secretaria/regiones` |
| Asistencia de bandas | `/secretaria/asistencia-bandas` |
| Checkout | `/secretaria/checkout` |
| Ranking por puntos | `/secretaria/ranking` |
| Ranking por copas | `/secretaria/ranking-por-copas` |
| Condensados | `/secretaria/condensado-por-rubrica` |
| Rubricas | `/secretaria/rubricas` |
| Sanciones | `/secretaria/sanciones` |
| Sanciones aplicadas | `/secretaria/sanciones-aplicadas` |
| Solicitar sanción | `/secretaria/solicitar-sancion-administrativa` |
| Mi perfil | `/miPerfilPage` |

---

### comite de disciplina

**Protección proxy:** `/diciplina`

| Ventana | Ruta |
|---------|------|
| Mis eventos | `/diciplina/mis-eventos` |
| Checkout llegada | `/diciplina/checkout-llegada` |
| Checkout entrada | `/diciplina/checkout-entrada` |
| Historial checkout | `/diciplina/historial-chekout` |
| Mi perfil | `/miPerfilPage` |

---

## 3. Acciones por rol (permisos en BD)

Permisos definidos en `public.permisos` (`tabla` + `accion`). RLS valida con `revisar_permisos()`.

---

### developer

| Tabla | Acciones |
|-------|----------|
| bandas | SELECT |
| categorias | SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | INSERT, SELECT |
| perfiles | INSERT, UPDATE, DELETE, SELECT |
| regiones | SELECT |
| registroComentarios | SELECT, INSERT |
| registroCumplimientoEvaluaciones | SELECT |
| registroEquipoEvaluador | SELECT |
| registroEventos | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | INSERT, UPDATE, DELETE, SELECT |
| rubricas | SELECT |
| solicitudRevicion | SELECT |
| confirmacion_asistencia | SELECT |
| copas | SELECT |

**Sin permiso explícito:** permisos, penalizaciones, roles equipo evaluador.

---

### admin

| Tabla | Acciones |
|-------|----------|
| bandas | INSERT, UPDATE, DELETE, SELECT |
| categorias | INSERT, UPDATE, DELETE, SELECT |
| criteriosEvalucion | INSERT, UPDATE, DELETE, SELECT |
| cumplimientos | INSERT, UPDATE, DELETE, SELECT |
| federaciones | SELECT |
| perfiles | INSERT, UPDATE, DELETE, SELECT |
| regiones | INSERT, UPDATE, DELETE, SELECT |
| registroComentarios | SELECT |
| registroCumplimientoEvaluaciones | UPDATE, SELECT |
| registroEquipoEvaluador | INSERT, UPDATE, DELETE, SELECT |
| registroEventos | INSERT, UPDATE, DELETE, SELECT |
| respuestaSolicitudRevicion | INSERT, SELECT |
| roles | UPDATE, SELECT |
| rubricas | INSERT, UPDATE, DELETE, SELECT |
| solicitudRevicion | UPDATE, SELECT |
| confirmacion_asistencia | INSERT, UPDATE, DELETE, SELECT |
| escuadras | INSERT, UPDATE, DELETE, SELECT |
| premios_escuadra | INSERT, UPDATE, DELETE, SELECT |
| copas | INSERT, UPDATE, DELETE, SELECT |
| checkout | SELECT |
| sanciones | INSERT, UPDATE, DELETE, SELECT |
| registro_sanciones | SELECT, INSERT |
| solicitar_sancion | INSERT, UPDATE, DELETE, SELECT |
| solicitud_copas | INSERT, UPDATE, DELETE, SELECT |

---

### admin temporal

Igual que **admin**, con estas diferencias:

| Tabla | Diferencia vs admin |
|-------|---------------------|
| perfiles | Solo UPDATE, SELECT (no crear ni eliminar) |
| registro_sanciones | Solo SELECT (no INSERT) |

---

### jurado

| Tabla | Acciones |
|-------|----------|
| bandas | SELECT |
| categorias | SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | SELECT |
| perfiles | UPDATE, SELECT |
| regiones | SELECT |
| registroComentarios | SELECT, INSERT |
| registroCumplimientoEvaluaciones | INSERT, SELECT |
| registroEquipoEvaluador | SELECT |
| registroEventos | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | SELECT |
| rubricas | SELECT |
| solicitudRevicion | SELECT |
| confirmacion_asistencia | SELECT |
| copas | SELECT |

**Acciones de negocio:** evaluar (INSERT cumplimiento), comentar en evaluaciones.

---

### fiscal

| Tabla | Acciones |
|-------|----------|
| bandas | SELECT |
| categorias | SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | SELECT |
| perfiles | UPDATE, SELECT |
| regiones | SELECT |
| registroComentarios | SELECT |
| registroCumplimientoEvaluaciones | SELECT |
| registroEquipoEvaluador | SELECT |
| registroEventos | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | SELECT |
| rubricas | SELECT |
| solicitudRevicion | INSERT, SELECT |
| confirmacion_asistencia | SELECT |
| copas | SELECT |
| solicitud_copas | INSERT, UPDATE, DELETE, SELECT |

**Acciones de negocio:** crear solicitudes de revisión, solicitar copas.

---

### dirigente / lider de banda

Misma matriz de permisos en seed (`dirigente` y `lider de banda` son idénticos).

| Tabla | Acciones |
|-------|----------|
| bandas | SELECT |
| categorias | SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | SELECT |
| perfiles | UPDATE, SELECT |
| regiones | SELECT |
| registroComentarios | SELECT |
| registroCumplimientoEvaluaciones | SELECT |
| registroEquipoEvaluador | SELECT |
| registroEventos | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | SELECT |
| rubricas | SELECT |
| solicitudRevicion | SELECT |
| confirmacion_asistencia | INSERT, UPDATE, SELECT |
| copas | SELECT |
| checkout | UPDATE, SELECT |

**Acciones de negocio:** confirmar asistencia de su banda, confirmar/denegar llegada e ingreso en checkout.

---

### responsable de bandas

| Tabla | Acciones |
|-------|----------|
| bandas | INSERT, UPDATE, DELETE, SELECT |
| categorias | INSERT, UPDATE, DELETE, SELECT |
| regiones | INSERT, UPDATE, DELETE, SELECT |
| escuadras | INSERT, UPDATE, DELETE, SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | SELECT |
| perfiles | SELECT |
| registroComentarios | SELECT |
| registroCumplimientoEvaluaciones | SELECT |
| registroEquipoEvaluador | SELECT |
| registroEventos | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | SELECT |
| rubricas | SELECT |
| solicitudRevicion | SELECT |
| confirmacion_asistencia | SELECT |
| copas | SELECT |

---

### responsable de rubricas

| Tabla | Acciones |
|-------|----------|
| categorias | INSERT, UPDATE, DELETE, SELECT |
| criteriosEvalucion | INSERT, UPDATE, DELETE, SELECT |
| cumplimientos | INSERT, UPDATE, DELETE, SELECT |
| rubricas | INSERT, UPDATE, DELETE, SELECT |
| regiones | INSERT, UPDATE, DELETE, SELECT |
| bandas | SELECT |
| federaciones | SELECT |
| perfiles | SELECT |
| registroComentarios | SELECT |
| registroCumplimientoEvaluaciones | SELECT |
| registroEquipoEvaluador | SELECT |
| registroEventos | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | SELECT |
| solicitudRevicion | SELECT |
| confirmacion_asistencia | SELECT |
| escuadras | SELECT |
| copas | SELECT |

---

### responsable de usuarios

| Tabla | Acciones |
|-------|----------|
| perfiles | INSERT, UPDATE, DELETE, SELECT |
| bandas | SELECT |
| categorias | SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | SELECT |
| regiones | SELECT |
| registroComentarios | SELECT |
| registroCumplimientoEvaluaciones | SELECT |
| registroEquipoEvaluador | SELECT |
| registroEventos | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | SELECT |
| rubricas | SELECT |
| solicitudRevicion | SELECT |
| confirmacion_asistencia | SELECT |
| copas | SELECT |

---

### responsable de eventos

| Tabla | Acciones |
|-------|----------|
| registroEventos | INSERT, UPDATE, DELETE, SELECT |
| regiones | INSERT, UPDATE, DELETE, SELECT |
| bandas | SELECT |
| categorias | SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | SELECT |
| perfiles | SELECT |
| registroComentarios | SELECT |
| registroCumplimientoEvaluaciones | SELECT |
| registroEquipoEvaluador | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | SELECT |
| rubricas | SELECT |
| solicitudRevicion | SELECT |
| confirmacion_asistencia | SELECT |
| copas | SELECT |

---

### responsable de mesa

| Tabla | Acciones |
|-------|----------|
| registroEquipoEvaluador | INSERT, UPDATE, DELETE, SELECT |
| registroEventos | UPDATE, SELECT |
| perfiles | SELECT, UPDATE |
| respuestaSolicitudRevicion | INSERT, SELECT |
| registroCumplimientoEvaluaciones | UPDATE, SELECT |
| solicitudRevicion | UPDATE, SELECT |
| premios_escuadra | INSERT, UPDATE, DELETE, SELECT |
| copas | INSERT, UPDATE, DELETE, SELECT |
| solicitud_copas | INSERT, UPDATE, DELETE, SELECT |
| bandas | SELECT |
| categorias | SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | SELECT |
| regiones | SELECT |
| registroComentarios | SELECT |
| roles | SELECT |
| rubricas | SELECT |
| confirmacion_asistencia | SELECT |

**Acciones de negocio:** gestionar equipo evaluador, copas, premios escuadra, solicitudes de copa y revisiones en mesa.

---

### secretaria

| Tabla | Acciones |
|-------|----------|
| bandas | INSERT, UPDATE, DELETE, SELECT |
| categorias | INSERT, UPDATE, DELETE, SELECT |
| regiones | INSERT, UPDATE, DELETE, SELECT |
| perfiles | INSERT, UPDATE, DELETE, SELECT |
| registroEventos | INSERT, UPDATE, DELETE, SELECT |
| registroEquipoEvaluador | DELETE, SELECT |
| confirmacion_asistencia | INSERT, UPDATE, SELECT |
| checkout | UPDATE, SELECT |
| solicitar_sancion | INSERT, UPDATE, DELETE, SELECT |
| criteriosEvalucion | SELECT |
| cumplimientos | SELECT |
| federaciones | SELECT |
| registroComentarios | SELECT |
| registroCumplimientoEvaluaciones | SELECT |
| respuestaSolicitudRevicion | SELECT |
| roles | SELECT |
| rubricas | SELECT |
| solicitudRevicion | SELECT |
| copas | SELECT |
| sanciones | SELECT |
| registro_sanciones | SELECT |

**Acciones de negocio:** gestión operativa (usuarios, bandas, categorías, regiones, eventos), asistencia, checkout, solicitar sanciones administrativas.

---

### comite de disciplina

| Tabla | Acciones |
|-------|----------|
| registro_sanciones | INSERT, UPDATE, DELETE, SELECT |
| checkout | INSERT, UPDATE, SELECT |
| bandas | SELECT |
| categorias | SELECT |
| federaciones | SELECT |
| perfiles | SELECT |
| roles | SELECT |
| regiones | SELECT |
| sanciones | SELECT |
| registroEquipoEvaluador | SELECT |
| registroEventos | SELECT |
| confirmacion_asistencia | SELECT |

**Acciones de negocio:** registrar llegada/ingreso en checkout, gestionar sanciones aplicadas.

---

## 4. Resumen rápido — quién gestiona qué

| Módulo | Roles con CRUD completo | Roles con lectura | Roles con acciones especiales |
|--------|-------------------------|-------------------|-------------------------------|
| Bandas | admin, admin temporal, secretaria, responsable bandas | casi todos | — |
| Categorías | admin, admin temporal, secretaria, responsable bandas/rubricas | resto | — |
| Regiones | admin, admin temporal, secretaria, responsable bandas/eventos/rubricas | resto | — |
| Usuarios (perfiles) | admin, secretaria, responsable usuarios | varios | developer CRUD + roles CRUD |
| Eventos | admin, admin temporal, secretaria, responsable eventos | resto | mesa: UPDATE |
| Rúbricas / criterios / cumplimientos | admin, admin temporal, responsable rubricas | resto | jurado: INSERT evaluaciones |
| Equipo evaluador | admin, admin temporal, responsable mesa | resto | secretaria: DELETE |
| Copas | admin, admin temporal, responsable mesa | resto | fiscal/mesa/admin: solicitud_copas |
| Sanciones (catálogo) | admin, admin temporal | secretaria, comité | — |
| Sanciones aplicadas | comité de disciplina | admin (INSERT), secretaria | — |
| Solicitar sanción | admin, admin temporal, secretaria | — | — |
| Checkout | comité (INSERT) | admin, dirigente, lider, secretaria | dirigente/lider/secretaria: UPDATE |
| Confirmación asistencia | admin, admin temporal | varios | dirigente/lider/secretaria: INSERT+UPDATE |
