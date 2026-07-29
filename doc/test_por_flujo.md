# Pruebas por flujo de trabajo

Documento de referencia para verificar que la plataforma cumple el flujo operativo y las reglas de permisos, validación y seguridad. Cada caso describe **qué hacer**, **con qué rol** y **qué resultado se espera**.

Cuando un caso diga “debe fallar” o “debe bloquearse”, confirmar que aparece un mensaje claro y que **no** se guarda el cambio.

---

## Reglas de preparación (obligatorias)

Antes de comprobar ingresos, permisos o el flujo del evento, **primero crear los datos base**. No mezclar la creación de catálogos con las pruebas de operación del día del evento.

### Orden de alta de datos

1. Ingresar como **admin**.
2. Crear **regiones** (al menos dos, para pruebas multi-región).
3. Crear **categorías**.
4. Crear **rúbricas, criterios y cumplimientos** por categoría.
5. Crear **bandas** (asignadas a región y categoría).
6. Crear **eventos** (uno por región, idealmente el mismo día).
7. Crear **usuarios de prueba**, uno (o más) por cada rol de la sección 1, con correo y contraseña conocidos.
8. Asignar dirigentes/líderes a sus bandas y al equipo evaluador (mesa, fiscal, jurados, disciplina) a los eventos.

Solo cuando ese set exista, empezar a comprobar ingreso por rol, permisos y el resto del flujo. Reutilizar siempre estos mismos usuarios; no crear cuentas nuevas en cada caso salvo que la prueba lo pida (por ejemplo baja lógica o validaciones de formulario).

### Usuarios de prueba por rol

- Debe existir al menos un usuario activo por cada rol a cubrir (admin, admin temporal, secretaria, responsables, mesa, jurado, fiscal, disciplina, dirigente, líder de banda).
- Guardar o anotar correo y contraseña de cada uno.
- Toda prueba de “ingresar como X” o “X no debe poder…” usa **ese** usuario del set, no uno improvisado.
- Dirigentes y líderes deben crearse **con banda** asignada desde el alta.

### Textos Lorem ipsum

Para no inventar contenido complejo:

- Nombres descriptivos de rúbricas, criterios y cumplimientos pueden ser cortos; en **descripciones, textos largos y comentarios de evaluación** usar **Lorem ipsum**.
- Al evaluar como jurado, el comentario obligatorio se llena con Lorem ipsum (una o dos frases bastan).
- Solicitudes de revisión del fiscal y notas similares también pueden usar Lorem ipsum.
- No hace falta que el texto tenga sentido musical o técnico; solo que cumpla campos obligatorios y permita guardar.

---

## 1. Roles a cubrir

| Rol | Alcance esperado |
|-----|------------------|
| **admin** | Acceso total de operación: catálogos, usuarios, eventos, mesa, checkout, resultados. Puede operar **todos** los eventos de la federación (todas las regiones) a la vez. |
| **admin temporal** | Misma operación amplia que admin, salvo recuperar contraseña y borrar perfiles. |
| **secretaria** | Usuarios, bandas, categorías, regiones, eventos, asistencia/checkout, rankings. No gestiona rúbricas ni asigna roles privilegiados. |
| **responsable de usuarios** | Crear/editar perfiles. No gestiona bandas, eventos ni rúbricas. |
| **responsable de bandas** | Bandas, categorías, regiones, escuadras. No gestiona eventos ni usuarios. |
| **responsable de rubricas** | Rúbricas, criterios, cumplimientos, categorías, regiones. |
| **responsable de eventos** | Eventos y regiones. |
| **responsable de mesa** | Solo eventos donde está **asignado**. Opera mesa en vivo (iniciar, cancha, bloqueos, copas, revisiones). |
| **jurado** (evaluador) | Evaluar rúbrica asignada. No inicia ni finaliza evento ni cancha. |
| **fiscal** | Revisar evaluaciones, solicitar revisión, proponer lugares/copas. |
| **comite de disciplina** | Check-in / check-out de bandas y sanciones. |
| **dirigente** / **lider de banda** | Confirmar asistencia, checkout de su banda, ver resultados. Deben tener banda asignada. |

**Regla general de permisos:** lo que el admin puede hacer en un área (usuarios, bandas, rúbricas, eventos, mesa), el **responsable correspondiente** debe poder hacerlo en su alcance. El admin además puede hacerlo en **todas las regiones / todos los eventos** de la federación.

---

## 2. Configuración inicial (antes del evento)

Esta sección es la **fase de armado del set de prueba**. Sigue las reglas de preparación: primero catálogos y usuarios; después se comprueba el resto.

### 2.1 Acceso del administrador

1. Ingresar como **admin** (cuenta base ya existente o la del set).
2. Verificar que llega al panel de control y ve menús de: usuarios, regiones, categorías, bandas, rúbricas, eventos, asistencia, checkout, copas, controladores, sanciones, alertas.
3. Más adelante, con el usuario **admin temporal** del set, comparar diferencias (sin recuperar contraseña / sin borrar perfiles, según el sistema).

### 2.2 Alta de catálogos (crear primero)

Crear en este orden, preferentemente como **admin**. Luego, en pruebas de permisos, repetir cada acción con el **responsable del área** del set de usuarios.

| Orden | Acción | Quién debe poder | Qué comprobar |
|-------|--------|------------------|---------------|
| 1 | Agregar regiones (mínimo 2) | admin, secretaria, responsable de bandas / eventos / rúbricas (según permisos) | Región visible y usable al crear bandas/eventos. |
| 2 | Agregar categorías | admin, secretaria, responsable de bandas / rúbricas | Categoría usable en bandas y rúbricas. |
| 3 | Agregar rúbricas, criterios y cumplimientos (por categoría) | admin, responsable de rubricas | Estructura completa; textos largos con **Lorem ipsum**; sin duplicados indebidos. |
| 4 | Agregar bandas | admin, secretaria, responsable de bandas | Banda con región y categoría correctas. |
| 5 | Agregar eventos por región | admin, secretaria, responsable de eventos | Evento ligado a región; fecha/datos correctos. |

### 2.3 Alta de usuarios del set (un usuario por rol)

1. Como **admin** (o secretaria / responsable de usuarios donde aplique), crear los usuarios del set: un correo conocido por cada rol de la sección 1.
2. Dirigentes y líderes: asignar banda al crearlos.
3. Comprobar que cada usuario aparece en listados con el rol correcto.
4. **Prueba de ingreso del set:** cerrar sesión e ingresar con **cada** usuario creado. Confirmar que cada uno llega a su home / área esperada.
5. Guardar esas mismas cuentas para todas las pruebas siguientes (permisos, mesa, evaluación, etc.).

| Acción adicional | Quién debe poder | Qué comprobar |
|------------------|------------------|---------------|
| Agregar / editar usuarios | admin, secretaria, responsable de usuarios | Usuario creado con rol correcto; aparece en listados. |
| Agregar dirigentes y líderes por banda | admin, secretaria, responsable de usuarios | Perfil vinculado a la banda. |

### 2.4 Asignación de equipo al evento

1. Como **admin** o **responsable de mesa** del set, asignar fiscal, disciplina, responsable de mesa y jurados (con su rúbrica) a un evento, usando los usuarios ya creados.
2. Verificar que **una misma persona no se asigne dos veces** en el mismo evento.
3. Verificar que **un jurado no tenga dos rúbricas distintas** en el mismo evento (rúbrica única por evento).
4. Caso de proceso: intentar asignar a la misma persona en **dos eventos del mismo día**. Documentar si el sistema lo bloquea o solo lo permite (el flujo operativo indica que no debería ocurrir).
5. Como **responsable de mesa**: confirmar que solo ve/opera eventos donde está asignado. Como **admin**: confirmar que ve y opera **todos** los eventos de todas las regiones.

### 2.5 Negativos de permisos (seguridad de roles)

Probar que estos roles **no** pueden hacer lo que no les corresponde:

| Rol | No debe poder |
|-----|---------------|
| responsable de usuarios | Crear eventos, bandas o rúbricas |
| responsable de bandas | Crear usuarios o eventos |
| responsable de rubricas | Crear bandas o usuarios |
| responsable de eventos | Crear usuarios o bandas; no operar mesa de un evento sin asignación si el sistema lo restringe |
| responsable de mesa | Crear regiones; ver/editar eventos de otras regiones donde **no** está asignado |
| jurado / fiscal / disciplina | Entrar al panel admin o CRUD de catálogos |
| dirigente | Gestionar eventos ajenos o evaluar rúbricas |

Además:

- Secretaria / responsable de usuarios **no** deben poder crear ni editar perfiles con rol `admin`, `admin temporal` o `developer`.
- Usuario con `estado` inactivo, `permisos = false` o rol inactivo **no** debe poder entrar.

---

## 3. Previo al evento

1. Ingresar como **dirigente** o **líder de banda**.
2. Confirmar asistencia al evento asignado.
3. Verificar que no puede confirmar asistencia a eventos de otras bandas/regiones.
4. Como admin/secretaria: ver que la asistencia queda registrada.

---

## 4. Día del evento — check-in / check-out

1. Ingresar como **comite de disciplina** (y también como **admin**, que debe poder hacerlo en todos los eventos).
2. Registrar llegada (check-in) de una banda.
3. Como dirigente/líder: confirmar datos de llegada.
4. Como disciplina: completar datos adicionales de entrada.
5. Como banda: confirmar datos de entrada.
6. Negativos:
   - Intentar check-in sin banda/evento válido → debe fallar.
   - Un dirigente de otra banda no debe confirmar el checkout ajeno.
   - Un jurado no debe poder registrar check-in de disciplina.

---

## 5. Operación de mesa (día del evento)

Cubrir con **responsable de mesa** en su evento y con **admin** en uno o varios eventos (idealmente dos regiones/eventos a la vez).

### 5.1 Bloqueo de categoría e inicio

1. Bloquear la categoría que va a participar.
2. Verificar que dirigentes/líderes de esa categoría pierden acceso operativo según la regla del sistema.
3. Iniciar el evento (estado: pendiente → iniciado).
4. Como **jurado**: ver que el evento ya inició y que aún **no** hay banda en cancha.
5. Negativo: intentar iniciar un evento ya iniciado o finalizado → no debe permitir un estado inválido.

### 5.2 Banda en cancha y evaluación

1. Como mesa/admin: definir qué banda está en cancha.
2. Como **jurado**: verificar que aparece la banda y puede evaluar su rúbrica.
3. Completar todos los criterios con cumplimiento y agregar comentario (**Lorem ipsum**).
4. Finalizar/guardar la evaluación.
5. Negativos de evaluación (seguridad de datos):
   - Guardar evaluación **sin llenar todos los criterios** → debe bloquearse.
   - Guardar evaluación **sin comentario** (vacío) → debe bloquearse.
   - Re-evaluar la misma rúbrica/banda/evento ya evaluada → debe bloquearse.
6. Como **fiscal**: verificar que llegan las evaluaciones y que no hay errores visibles.
7. Si hay error: fiscal solicita revisión de un ítem específico.
8. Como mesa/admin: confirmar o denegar la solicitud del fiscal.
9. Negativo: un jurado no debe aprobar/denegar solicitudes del fiscal; un fiscal no debe escribir evaluaciones.

### 5.3 Finalizar participación de banda

1. Cuando los jurados terminaron: mesa/admin finaliza la participación de la banda en cancha.
2. Definir la siguiente banda en cancha y repetir hasta terminar la categoría.
3. Casos críticos a probar:
   - **Finalizar banda mientras un jurado aún no terminó** → documentar el comportamiento real. El flujo indica que es un error operativo; si ocurre, la remediación es volver a poner la banda en cancha. Comprobar que esa remediación funciona.
   - Intentar poner en cancha una banda ya finalizada sin reabrir el flujo → comportamiento coherente.

### 5.4 Lugares / copas

1. Al terminar la última banda de la categoría, el **fiscal** propone el lugar de cada banda.
2. Mesa/admin confirma o deniega.
3. Si deniega: fiscal rectifica y reenvía; mesa confirma.
4. Negativo: no editar copas/lugares si el evento ya está **finalizado** o **cancelado**.

### 5.5 Cambio de categoría

1. Desbloquear la categoría terminada y bloquear la siguiente.
2. Reasignar rúbricas de jurados para la nueva categoría.
3. Definir nueva banda en cancha y repetir el ciclo.
4. Como **admin**: poder hacer este proceso en **varios eventos/regiones** el mismo día.

### 5.6 Finalizar evento

1. Cuando todas las categorías terminaron: marcar el evento como finalizado.
2. Casos críticos:
   - **Finalizar evento con bandas aún en cancha o sin finalizar** → documentar si el sistema lo bloquea o lo permite. Debe quedar claro el resultado y el mensaje (si existe).
   - Tras finalizar: no deben poder editarse copas ni reiniciarse evaluaciones como si el evento estuviera abierto.
3. Como dirigente: revisar resultados de su banda.

---

## 6. Matriz rápida: admin vs responsable

Usar esta tabla como checklist de paridad.

| Capacidad | Admin | Responsable esperado |
|-----------|-------|----------------------|
| CRUD usuarios | Sí (toda la federación) | responsable de usuarios / secretaria |
| CRUD bandas / categorías / regiones | Sí | responsable de bandas (+ secretaria según caso) |
| CRUD rúbricas / criterios / cumplimientos | Sí | responsable de rubricas |
| CRUD eventos | Sí (todas las regiones) | responsable de eventos |
| Asignar equipo evaluador | Sí (todos los eventos) | responsable de mesa (solo asignados) |
| Iniciar / finalizar evento, cancha, bloqueos | Sí (todos) | responsable de mesa (solo asignados) |
| Check-in / checkout | Sí | comite de disciplina (+ secretaria según caso) |
| Evaluar rúbrica | No (salvo que también sea jurado) | jurado |
| Solicitar revisión / proponer lugares | No (salvo que sea fiscal) | fiscal |
| Confirmar asistencia / ver resultados banda | No (salvo rol de banda) | dirigente / líder |

**Prueba explícita multi-región:** crear dos eventos en regiones distintas el mismo día. Con **admin**, operar ambos (iniciar, cancha, finalizar). Con **responsable de mesa** asignado solo a uno, confirmar que **no** opera el otro.

---

## 7. Casos de seguridad y validación (obligatorios)

Estos casos deben ejecutarse aunque el flujo “feliz” ya haya pasado.

### 7.1 Usuarios y perfiles

1. Crear dirigente/líder/director artístico **sin seleccionar banda** → debe fallar con mensaje de seleccionar banda.
2. Crear usuario sin email, email inválido, sin nombre, sin rol o sin federación → debe fallar.
3. Contraseña menor a 6 caracteres o contraseñas que no coinciden → debe fallar.
4. Secretaria/responsable de usuarios intenta crear un **admin** → debe bloquearse.
5. Ingresar con usuario inactivo o sin permisos → acceso denegado.

### 7.2 Equipo y asignaciones

1. Asignar dos veces la misma persona al mismo evento → no debe permitirse.
2. Asignar dos rúbricas distintas al mismo jurado en el mismo evento → no debe permitirse.
3. Jurado/fiscal/disciplina sin asignación no deben ver ni operar ese evento.

### 7.3 Evaluación

1. Guardar rúbrica incompleta → bloqueado.
2. Guardar sin comentario → bloqueado.
3. Intentar evaluar dos veces la misma combinación rúbrica/banda/evento → bloqueado.

### 7.4 Estados del evento y cancha

1. Finalizar banda con evaluaciones pendientes → registrar comportamiento y remediación (volver a cancha).
2. Finalizar evento con categorías/bandas sin terminar → registrar si bloquea o permite.
3. Editar copas con evento finalizado/cancelado → bloqueado.
4. Bloqueo/desbloqueo de categoría solo por admin, admin temporal o responsable de mesa autorizado.

### 7.5 Aislamiento entre roles y datos

1. Dirigente de banda A no ve ni confirma datos de banda B.
2. Responsable de mesa del evento X no opera el evento Y.
3. Rutas de panel admin no deben abrirse con sesión de jurado/fiscal/dirigente (redirección o error de acceso).

### 7.6 Seguridad administrativa (baja, roles y datos de dirigentes)

1. **Baja de un integrante de la federación**
   - Como **admin** (o quien gestione usuarios), dar de baja a un usuario que abandona la federación mediante **eliminación lógica** (no borrar el historial operativo de forma destructiva).
   - Intentar iniciar sesión con ese usuario → **no debe poder ingresar** a la plataforma.
   - Verificar que el perfil queda marcado como inactivo / sin acceso y que ya no aparece como usuario operativo activo en listados de asignación.

2. **Bloqueo de roles**
   - Como **admin**, bloquear un rol desde controladores / gestión de roles (por ejemplo desactivar el estado del rol).
   - Intentar iniciar sesión o usar la plataforma con un usuario cuyo rol quedó bloqueado → **acceso denegado**.
   - Verificar que ese rol bloqueado **no** se ofrece al crear o editar usuarios.
   - Reactivar el rol y confirmar que los usuarios activos con ese rol vuelven a poder operar (si su perfil sigue activo y con permisos).

3. **Actualización de datos de dirigentes**
   - Escenario: un dirigente no confirmó o no actualizó sus datos de un evento (asistencia, checkout u otros datos del evento).
   - Como **admin**, actualizar esos datos desde el panel (asistencia de bandas / checkout / gestión del evento, según corresponda).
   - Verificar que el cambio queda guardado y visible para mesa, disciplina y el propio dirigente.
   - Negativo: un rol sin permiso de administración (jurado, fiscal, dirigente de otra banda) **no** debe poder corregir esos datos ajenos.

---

## 8. Errores operativos documentados

| Situación | Qué probar |
|-----------|------------|
| Sesión cerrada por token vencido | Cerrar sesión por completo y volver a entrar; debe recuperar acceso normal. |
| Finalización prematura de banda | Volver a colocar la banda en cancha; el jurado debe poder continuar/corregir según el diseño actual. |
| Registros duplicados | Ir a alertas y usar la acción “Solucionar”; verificar que el duplicado queda resuelto. |

---

## 9. Orden sugerido de ejecución

1. **Preparación:** regiones → categorías → rúbricas (textos Lorem ipsum) → bandas → eventos → usuarios del set (un correo por rol) → asignación de equipo.
2. **Ingreso por rol:** entrar con cada usuario del set y confirmar su área de inicio.
3. Permisos de catálogo (admin + cada responsable del set) y negativos de permisos.
4. Validaciones de creación de usuarios (con y sin banda) — aquí sí se pueden crear usuarios extra solo para el caso negativo.
5. Pre-evento (asistencia) con dirigentes del set.
6. Checkout (disciplina + banda del set).
7. Mesa en vivo completa en **un** evento (bloqueo → inicio → cancha → evaluación con comentarios Lorem ipsum → fiscal → lugares → cambio de categoría → fin).
8. Misma operación de mesa como **admin** en **dos** eventos/regiones.
9. Casos de seguridad de evaluación y de finalización prematura.
10. Seguridad administrativa: baja lógica de usuario, bloqueo de rol y actualización de datos de dirigentes por admin.
11. Post-evento: resultados visibles para dirigentes; copas bloqueadas tras finalizar.

---

## 10. Criterio de aceptación

Una pasada se considera correcta cuando:

- Existe un set de datos previo (regiones, categorías, rúbricas, bandas, eventos) y un usuario de prueba por cada rol, reutilizado en todo el recorrido.
- Cada rol del set puede ingresar y hacer **solo** lo que le corresponde (y el admin lo que corresponde a todos los responsables, en todas las regiones/eventos).
- Las validaciones de formularios y estados **impiden** guardados incompletos o inválidos.
- Los textos de rúbricas/comentarios con Lorem ipsum permiten completar y guardar evaluaciones sin fricción.
- El flujo de un evento completo (de pendiente a finalizado) funciona de punta a punta.
- Los casos negativos de seguridad quedan documentados con resultado observado (bloqueado / permitido / remediación).
- La baja lógica, el bloqueo de roles y la corrección de datos de dirigentes por el administrador funcionan como se describe en la sección 7.6.
)
