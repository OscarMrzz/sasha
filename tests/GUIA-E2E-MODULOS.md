# Guía: tests E2E Playwright por módulo (Usuarios, Bandas, Eventos, …)

Esta guía resume el patrón usado en `user.spec.ts` para que puedas replicar tests en **cualquier módulo** con pasos claros, datos reproducibles y un contrato mínimo de UI (`data-testid`, `aria-label`, roles, etc.).

---

## 1. Requisitos previos

- Variables de entorno para login E2E (según tu proyecto, p. ej. `E2E_USER_EMAIL` y `E2E_USER_PASSWORD` en `.env`; ver `.env.example`).
- Playwright configurado (`playwright.config` con `baseURL`, timeouts razonables).
- Un usuario de prueba con permisos para entrar al panel y al módulo que vas a testear.

---

## 2. Estructura recomendada de un archivo `*.spec.ts`

Ordena el archivo en bloques fijos (así cualquier módulo se lee igual):

1. **Comentario de cabecera** — Inventario de todo lo que el test asume de la UI: `data-testid`, `data-*`, `aria-label`, IDs, textos de botones, URLs. Si falta algo en la app, el fallo se entiende al instante.
2. **Constantes** — Selectores largos repetidos, rutas, nombres de formularios.
3. **Datos de prueba** — Objeto `defaults` + funciones `unique*()` (emails, nombres con `Date.now()`, etc.) para evitar colisiones entre ejecuciones.
4. **Helpers de auth y navegación** — `login`, `irAModuloX`.
5. **Helpers del dominio** — Abrir formularios, rellenar pasos, localizar filas, menús, modales.
6. **`test.describe`** — Agrupa por área: navegación, formulario crear, editar, eliminar, flujo completo.

Referencia viva: `tests/user.spec.ts` (cabecera + secciones con `// =========`).

### 2.1 Regla obligatoria (importante)

Para **cualquier módulo nuevo** (Regiones, Bandas, Eventos, etc.) el spec debe **copiar el patrón de Usuarios**:

- **Fila estable**: `data-testid="card-row"` en cada fila.
- **Identificador de negocio**: atributo HTML `data-codigo="<id>"` en cada fila (no solo texto visible).
- **Menú por fila**: wrapper `data-testid="menu-mas-opciones"` + botón accesible **\"Abrir menú\"**.
- **Acciones del menú** (testids globales): `menu-mas-opciones-ver`, `menu-mas-opciones-editar`, `menu-mas-opciones-eliminar`.
- **Modal Ver información**: `dialog` con heading estable (p. ej. \"Información del …\") y **valores** con `data-testid` donde sea necesario.
- **Formularios**: `<form aria-label="formulario para agregar <modulo>">` y `<form aria-label="formulario para editar <modulo>">`.

Si el módulo aún no tiene esos `data-testid`/atributos, **el test debe intentar usarlos igual** (y fallar). Eso convierte el spec en un **contrato**: el fallo te dice exactamente qué falta implementar en UI.

---

## 3. Contrato UI: qué conviene exponer en la app para que los tests sean estables

### 3.1 Prioridad: accesibilidad y roles

- **`aria-label` en `<form>`** — Permite `getByRole('form', { name: '…' })` sin acoplarse a clases CSS.
- **Botones y enlaces con nombre accesible** — Texto visible o `aria-label` coherente (`Iniciar sesión`, `Agregar`, `Cancelar`, `Abrir menú`, etc.).
- **Encabezados en modales** — `dialog` + `heading` con texto estable para filtrar el modal correcto cuando hay varios.

### 3.2 `data-testid` (o `data-test`) — cuándo usarlos

Úsalos cuando:

- El elemento no tiene un rol/nombre único estable (listas, íconos, menús de tres puntos).
- Necesitas enlazar **acciones por fila** (ver / editar / eliminar) sin depender del orden del DOM.
- Vas a asertar **valores concretos** en un panel de detalle (como `identidad`, `numeroTelefono`, `direccion`, `informacion-usuario-rol` en usuarios).

**Convención obligatoria (replica por módulo):**

| Área | Ejemplo de `data-testid` | Uso en test |
|------|---------------------------|-------------|
| Fila estable en lista | `card-row` | Esperar a que la fila deje de estar en estado “nuevo”/animado (evita flakes en WebKit). |
| Fila recién creada (si aplica) | `card-row-nuevo` | Opcional: saber que aún no debes abrir menús. |
| Atributo de negocio en fila | `data-codigo` (atributo HTML, no solo testid) | Localizar la fila por id de negocio. |
| Menú contextual | `menu-mas-opciones` dentro de la fila | `row.locator('[data-testid="menu-mas-opciones"]')`. |
| Ítems del menú | `menu-mas-opciones-ver`, `…-editar`, `…-eliminar` | `page.getByTestId('…')` tras abrir el menú. |
| Campos de solo lectura en modal | nombres cortos y únicos por pantalla | `getByTestId('identidad')`, etc. |

Si tu equipo prefiere `data-test` en lugar de `data-testid`, Playwright puede localizar con `page.locator('[data-test="…"]')`; lo importante es **documentar el nombre en la cabecera del spec** y usarlo de forma consistente.

### 3.3 IDs en formularios (`#email`, `#nombre`, …)

Son prácticos en formularios largos o por pasos. Si cambian, actualiza el spec; por eso los **formularios críticos** también deberían tener `aria-label` en el `<form>`.

### 3.4 Store o APIs en `window` (solo si no hay alternativa)

En usuarios se lee `ultimoUsuario.codigo` desde un store en `window` tras crear. Para otros módulos, preferible: **respuesta de red** (`page.waitForResponse`), **URL**, o **texto visible** con código. Si usas `window`, documenta la forma exacta en la cabecera del spec.

---

## 4. Serie de datos para replicar tests en cualquier módulo

Copia este esquema y sustituye nombres:

```ts
// Valores fijos que cumplen reglas de negocio (longitud mínima, formato, etc.)
const nuevoRecursoDefaults = {
  nombre: '…',
  // …
};

function uniqueEmail() {
  return `test${Date.now()}${Math.floor(Math.random() * 1000)}@…`;
}

function suffix() {
  return `${Date.now()}`;
}

// Para ediciones: un objeto con TODOS los campos que vas a verificar en el modal o lista
const editValues = {
  nombre: `Nom${suffix()}`,
  // …
};
```

Reglas:

- **Un identificador único por ejecución** (`Date.now()`, random corto) en campos que deben ser únicos.
- **Un solo objeto `editValues`** alineado con lo que el modal/lista muestra, para asserts al final.
- **Datos válidos** según validadores del front (fechas, selects con labels existentes).

---

## 5. Pasos para crear un spec nuevo (p. ej. `bandas.spec.ts`, `eventos.spec.ts`)

1. **Navegación** — Un test mínimo: login → botón o ruta al módulo → URL esperada.
2. **Listado / vacío** (opcional) — Si aplica, comprobar estado inicial.
3. **Crear** — Abrir formulario → rellenar → guardar → mensaje de éxito (y dónde obtener el id: red, lista, store).
4. **Detalle / Ver** — Desde la fila o tarjeta, abrir información; asserts con `getByRole` / `getByTestId` / etiquetas.
5. **Editar** — Abrir formulario editar, cambiar `editValues`, guardar, comprobar en detalle y en lista.
6. **Eliminar o baja lógica** — Confirmación en `dialog`, texto de éxito, estado final de la fila (borrada o actualizada como en usuarios).
7. **Flujo completo** (opcional, timeout mayor) — Un solo test que encadene crear → ver → editar → verificar → eliminar.

En cada bloque, usa **`test.describe`** con `beforeEach` que deje la página en la misma pantalla (por ejemplo ya en `bandasHomePage`), para que cada test sea corto y fácil de depurar.

---

## 6. Detalles que evitan fallos intermitentes (flakiness)

- Tras crear un ítem, **espera a que la fila esté “estable”** antes de abrir menús (en usuarios: `data-testid="card-row"` en el elemento con `data-codigo`).
- Usa **`expect(...).toBeVisible({ timeout: … })`** en pasos lentos (red, animaciones).
- Si la app usa `alert`/`confirm` nativos: **`page.on('dialog', d => d.accept())`** en el test o `beforeEach` que lo necesite.
- Regex en textos con tildes opcionales: `/[EÉ]xito/i`, `/Informaci[oó]n/`.

---

## 7. Checklist al terminar un spec (o un bloque nuevo de tests)

Marca cada ítem antes de dar por cerrada la tarea:

- [ ] Cabecera del archivo lista **todos** los selectores imprescindibles (`data-testid`, `data-codigo`, `aria-label`, IDs, textos clave).
- [ ] **`.env` / credenciales** documentadas o alineadas con `beforeAll` que falle con mensaje claro si faltan.
- [ ] **Navegación** al módulo cubierta (login + ir al home del módulo).
- [ ] **Crear** con datos únicos y assert de éxito (o estado visible equivalente).
- [ ] **Fila o tarjeta** localizable de forma estable (atributo de negocio + testid si hace falta).
- [ ] **Menú / acciones** (ver, editar, eliminar) implementadas con el **contrato obligatorio**: `menu-mas-opciones` + `menu-mas-opciones-{ver,editar,eliminar}`.
- [ ] **Modales** localizados por `dialog` + `heading` (o testid en el contenedor del modal).
- [ ] **Editar** con objeto de datos único y verificación en UI (no solo “no hubo error”).
- [ ] **Eliminar o baja** con confirmación y estado final esperado (fila ausente, texto “—”, mensaje, etc.).
- [ ] **Timeouts** ajustados en tests largos (`test.setTimeout` o `describe.configure`).
- [ ] Sin dependencia oculta del **orden de ejecución** entre tests (cada test debe poder vivir solo o documentar datos compartidos).
- [ ] Ejecutar **`npx playwright test path/al/spec.ts`** en local y revisar al menos Chromium (y WebKit si usáis animaciones/DOM sensible).

---

## 8. Dónde mirar el ejemplo completo

- Implementación de referencia: **`tests/user.spec.ts`**
- Esta guía: **`tests/GUIA-E2E-MODULOS.md`**

Cuando añadas Bandas o Eventos, enlaza desde tu PR o ticket a la cabecera del nuevo spec (contrato UI) y actualiza esta guía solo si aparece un **patrón nuevo** (p. ej. subida de archivos, mapas, calendarios) que quieras estandarizar para todo el equipo.
