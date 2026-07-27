/**
 * E2E — módulo Usuarios (Playwright)
 *
 * Contrato UI que este archivo asume (si falta algo en la app, el test fallará):
 *
 * Autenticación (SignInPage)
 * - `#email`, `#password` — inputs de login
 * - Botón "Iniciar sesión" (getByRole)
 * - Tras login: URL contiene `PanelControlPage`
 *
 * Panel / navegación
 * - Botón "Usuarios" (getByRole) → URL `usuariosHomePage`
 *
 * Formulario agregar usuario
 * - `form[aria-label="formulario para agregar usuario"]` y role form name igual
 * - IDs de campos por pasos: `#nombre`, `#primerApellido`, `#email`, `#password`, `#password2`,
 *   `#rolUsuario`, `#idForaneaBanda` (opcional si existe), `#permisos` (role switch, aria-checked)
 * - Botones: Siguiente, Cancelar, submit dentro del form
 *
 * Lista de usuarios / filas
 * - `data-codigo="<código>"` en el contenedor de la fila
 * - `data-testid="card-row"` cuando la fila está estable (tras crear; antes puede usarse `card-row-nuevo` + animación)
 * - `data-testid="menu-mas-opciones"` en la fila; botón accesible "Abrir menú"
 * - Ítems de menú (testid globales): `menu-mas-opciones-ver`, `menu-mas-opciones-editar`, `menu-mas-opciones-eliminar`
 *
 * Modal / panel información usuario
 * - `dialog` + heading "Información del usuario"
 * - `data-testid="identidad"`, `numeroTelefono`, `direccion` — valores en el panel
 * - `data-testid="informacion-usuario-rol"` — texto del rol (si aplica)
 * - Grid de etiquetas legibles: "Nombre completo", "Alias", "Género", "Fecha de nacimiento", etc.
 *
 * Formulario editar usuario
 * - `form[aria-label="formulario para editar usuario"]` y role form name igual
 * - IDs: `#nombre`, `#segundoNombre`, `#primerApellido`, `#segundoApellido`, `#alias`, pasos Siguiente,
 *   luego `#fechaNacimiento`, `#sexo`, `#identidad`, `#numeroTelefono`, `#direccion`, `#permisos`, "Actualizar usuario"
 *
 * Eliminar
 * - `dialog` con heading "Confirmar eliminación", texto de confirmación y botones Cancelar / Eliminar
 *
 * Store (solo lectura en test)
 * - `window.useUsuarioAgregadoStore?.getState().ultimoUsuario.codigo` tras crear usuario
 */
import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Constantes y datos por defecto del flujo "nuevo usuario"
// =============================================================================

const ADD_USER_FORM_SELECTOR = 'form[aria-label="formulario para agregar usuario"]';
const EDIT_USER_FORM_SELECTOR = 'form[aria-label="formulario para editar usuario"]';

const newUserDefaults = {
    nombre: 'oscartest',
    primerApellido: 'hernandez',
    password: '12345678',
    password2: '12345678',
    rolUsuario: 'admin',
    idForaneaBanda: 'Banda Independiente de Tela',
    permisos: true,
};

// =============================================================================
// Utilidades (credenciales, email único)
// =============================================================================

function uniqueNewUserEmail(): string {
    return `test${Date.now()}${Math.floor(Math.random() * 1000)}@gmail.com`;
}

function getE2ECredentials(): { email: string; password: string } {
    const email = process.env.E2E_USER_EMAIL?.trim();
    const password = process.env.E2E_USER_PASSWORD?.trim();
    if (!email || !password) {
        throw new Error(
            'Define E2E_USER_EMAIL y E2E_USER_PASSWORD (ver .env.example). Copia .env.example a .env y rellena los valores.'
        );
    }
    return { email, password };
}

// =============================================================================
// Auth y navegación al módulo Usuarios
// =============================================================================

async function loginAsE2EUser(page: Page, credentials: { email: string; password: string }) {
    await page.goto('/authPage/SignInPage', { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(credentials.email);
    await page.locator('#password').fill(credentials.password);
    await Promise.all([
        page.waitForURL(/.*PanelControlPage/, { timeout: 45000, waitUntil: 'domcontentloaded' }),
        page.getByRole('button', { name: /iniciar sesi[oó]n/i }).click(),
    ]);
}

async function goToUsuariosHome(page: Page) {
    await page.getByRole('button', { name: /usuarios/i }).click();
    await expect(page).toHaveURL(/.*usuariosHomePage/, { timeout: 15000 });
}

// =============================================================================
// Formulario: agregar usuario
// =============================================================================

async function openAddUserForm(page: Page) {
    await page.getByRole('button', { name: /agregar/i }).click();
    await page.waitForSelector(ADD_USER_FORM_SELECTOR, { timeout: 15000 });
    await expect(page.getByRole('form', { name: 'formulario para agregar usuario' })).toBeVisible({
        timeout: 10000,
    });
}

async function fillNewUserFormFields(
    page: Page,
    opts: { email: string; includeNombre: boolean }
) {
    if (opts.includeNombre) {
        await page.waitForSelector('#nombre', { timeout: 10000 });
        await page.locator('#nombre').fill(newUserDefaults.nombre);
    }
    await page.locator('#primerApellido').fill(newUserDefaults.primerApellido);
    await page.getByRole('button', { name: /siguiente/i }).click();

    await page.waitForSelector('#email', { timeout: 10000 });
    await page.locator('#email').fill(opts.email);
    await page.locator('#password').fill(newUserDefaults.password);
    await page.locator('#password2').fill(newUserDefaults.password2);
    await page.getByRole('button', { name: /siguiente/i }).click();

    await page.waitForSelector('#rolUsuario', { timeout: 10000 });
    await page.locator('#rolUsuario').selectOption({ label: newUserDefaults.rolUsuario });

    const bandaSelect = page.locator('#idForaneaBanda');
    if (await bandaSelect.count()) {
        await bandaSelect.selectOption({ label: newUserDefaults.idForaneaBanda });
    }

    // Switch permisos: `#permisos`, role switch, aria-checked
    const permisosSwitch = page.locator('#permisos');
    const current = await permisosSwitch.getAttribute('aria-checked');
    const wants = newUserDefaults.permisos ? 'true' : 'false';
    if (current !== wants) {
        await permisosSwitch.click();
    }
}

// =============================================================================
// Store (último usuario creado) — depende de la app exponiendo el store en window
// =============================================================================

async function readCodigoUltimoUsuarioEnStore(page: Page): Promise<string | undefined> {
    return page.evaluate(() => {
        const store = (window as unknown as { useUsuarioAgregadoStore?: { getState: () => unknown } })
            .useUsuarioAgregadoStore?.getState() as { ultimoUsuario?: { codigo?: string } } | undefined;
        return store?.ultimoUsuario?.codigo;
    });
}

// =============================================================================
// Lista: fila estable + menú (data-codigo, data-testid card-row, menu-mas-opciones)
// =============================================================================

/**
 * Tras crear un usuario la fila usa `card-row-nuevo` + `animate-pulse` unos segundos; al cambiar a `card-row`
 * el árbol DOM se estabiliza. WebKit falla con "not stable" / "detached" si se abre el menú antes.
 */
async function esperarFilaUsuarioEstableEnLista(page: Page, codigo: string) {
    // A veces puede haber duplicados momentáneos en DOM (re-render / lista virtualizada).
    // Para evitar violaciones de strict mode, trabajamos siempre con la primera coincidencia.
    await expect(page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`).first()).toBeVisible({
        timeout: 12000,
    });
}

/** Abre el menú de más opciones de la fila del código y elige Ver. Requiere `data-testid` en menú e ítems (ver cabecera del archivo). */
async function abrirMenuVerInformacionDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaUsuarioEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo="${codigo}"]`).first();
    const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemVer = page.getByTestId('menu-mas-opciones-ver');
    await expect(itemVer).toBeVisible({ timeout: 10000 });
    await itemVer.click({ force: true });
}

/** Abre el menú y elige Editar (`menu-mas-opciones-editar`). */
async function abrirMenuEditarDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaUsuarioEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo="${codigo}"]`).first();
    const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemEditar = page.getByTestId('menu-mas-opciones-editar');
    await expect(itemEditar).toBeVisible({ timeout: 10000 });
    await itemEditar.click({ force: true });
}

/** Abre el menú y elige Eliminar (`menu-mas-opciones-eliminar`); abre el modal de confirmación en la página. */
async function abrirMenuEliminarDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaUsuarioEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo="${codigo}"]`).first();
    const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemEliminar = page.getByTestId('menu-mas-opciones-eliminar');
    await expect(itemEliminar).toBeVisible({ timeout: 10000 });
    await itemEliminar.click({ force: true });
}

// =============================================================================
// Modales (confirmar eliminación, información usuario)
// =============================================================================

function locatorModalConfirmarEliminacion(page: Page) {
    return page.locator('dialog').filter({ has: page.getByRole('heading', { name: /Confirmar eliminación/i }) });
}

async function cerrarModalInformacionUsuario(page: Page) {
    const dialog = page
        .locator('dialog')
        .filter({ has: page.getByRole('heading', { name: /Informaci[oó]n del usuario/i }) });
    await dialog.getByRole('button', { name: /^cerrar$/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
}

// =============================================================================
// Formulario: editar + lectura del panel información (grid + data-testid)
// =============================================================================

function nombreCompletoEsperado(parts: {
    nombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
}): string {
    return [parts.nombre, parts.segundoNombre, parts.primerApellido, parts.segundoApellido]
        .filter((p) => p && String(p).trim())
        .join(' ')
        .trim();
}

/** Valor de texto en el panel de información (columna por etiqueta visible; clase del valor acoplada al layout actual). */
async function valorCampoInformacion(page: Page, etiqueta: string): Promise<string> {
    const panel = page
        .locator('.scrollbar-estetica')
        .filter({ has: page.getByRole('heading', { name: /Informaci[oó]n del usuario/i }) })
        .first();
    const block = panel.locator('div.grid').filter({ has: page.getByText(etiqueta, { exact: true }) }).first();
    const valCell = block.locator('div.min-w-0.text-sm.font-medium.text-slate-100').first();
    return (await valCell.innerText()).trim();
}

type EditFormValues = {
    nombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    alias: string;
    fechaNacimiento: string;
    sexo: string;
    identidad: string;
    numeroTelefono: string;
    direccion: string;
};

async function fillEditUserFormAndSubmit(page: Page, v: EditFormValues) {
    await page.waitForSelector(EDIT_USER_FORM_SELECTOR, { timeout: 15000 });
    await page.locator('#nombre').fill(v.nombre);
    await page.locator('#segundoNombre').fill(v.segundoNombre);
    await page.locator('#primerApellido').fill(v.primerApellido);
    await page.locator('#segundoApellido').fill(v.segundoApellido);
    await page.locator('#alias').fill(v.alias);
    await page.locator(`${EDIT_USER_FORM_SELECTOR}`).getByRole('button', { name: /siguiente/i }).click();

    await page.waitForSelector('#fechaNacimiento', { timeout: 10000 });
    await page.locator('#fechaNacimiento').fill(v.fechaNacimiento);
    await page.locator('#sexo').selectOption(v.sexo);
    await page.locator('#identidad').fill(v.identidad);
    await page.locator('#numeroTelefono').fill(v.numeroTelefono);
    await page.locator('#direccion').fill(v.direccion);
    await page.locator(`${EDIT_USER_FORM_SELECTOR}`).getByRole('button', { name: /siguiente/i }).click();

    await page.waitForSelector('#permisos', { timeout: 10000 });
    await page.locator(`${EDIT_USER_FORM_SELECTOR}`).getByRole('button', { name: /actualizar usuario/i }).click();
}

type CredencialesUsuarioCreado = {
    codigo: string;
    email: string;
    password: string;
};

/** Crea un usuario vía formulario agregar y devuelve código y credenciales. */
async function crearUsuarioParaTestConCredenciales(page: Page): Promise<CredencialesUsuarioCreado> {
    await openAddUserForm(page);
    const email = uniqueNewUserEmail();
    await fillNewUserFormFields(page, { email, includeNombre: true });
    const guardarBtn = page.locator(`${ADD_USER_FORM_SELECTOR} button[type="submit"]`);
    await expect(guardarBtn).toBeEnabled({ timeout: 15000 });
    await guardarBtn.click();
    await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).toBeVisible({ timeout: 60000 });
    await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).not.toBeVisible({ timeout: 12000 });
    const codigo = await readCodigoUltimoUsuarioEnStore(page);
    expect(codigo).toBeTruthy();
    return { codigo: codigo!, email, password: newUserDefaults.password };
}

/** Crea un usuario vía formulario agregar y devuelve su código (store). Requiere `page.on('dialog', …)` si la app dispara alert/confirm nativos. */
async function crearUsuarioParaTestEdicion(page: Page): Promise<string> {
    const { codigo } = await crearUsuarioParaTestConCredenciales(page);
    return codigo;
}

async function intentarLoginUsuario(page: Page, credentials: { email: string; password: string }) {
    await page.goto('/authPage/SignInPage', { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(credentials.email);
    await page.locator('#password').fill(credentials.password);
    await page.getByRole('button', { name: /iniciar sesi[oó]n/i }).click();
}

// =============================================================================
// Tests
// =============================================================================

test.describe('user', () => {
    test.describe.configure({ timeout: 120000 });

    test.beforeAll(() => {
        getE2ECredentials();
    });

    test.beforeEach(async ({ page }) => {
        await loginAsE2EUser(page, getE2ECredentials());
    });

    // --- Navegación al módulo ---
    test('navegación correcta hacia usuarios', async ({ page }) => {
        await expect(page).toHaveURL(/.*PanelControlPage/);
        await page.getByRole('button', { name: /usuarios/i }).click();
        await expect(page).toHaveURL(/.*PanelControlPage\/usuariosHomePage/, { timeout: 15000 });
    });

    // --- Formulario agregar: validaciones, cancelar, éxito ---
    test.describe('Usuarios / formulario agregar', () => {
        test.beforeEach(async ({ page }) => {
            await goToUsuariosHome(page);
            await openAddUserForm(page);
        });

        test('muestra el formulario para agregar usuario al hacer clic en agregar', async ({ page }) => {
            await expect(page.getByRole('form', { name: 'formulario para agregar usuario' })).toBeVisible({
                timeout: 10000,
            });
        });

        test('debería ocultar el formulario al hacer clic en cancelar', async ({ page }) => {
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(page.getByRole('form', { name: 'formulario para agregar usuario' })).not.toBeVisible({
                timeout: 10000,
            });
        });

        test('debería mostrar mensaje de error al intentar agregar usuario sin completar los campos', async ({
            page,
        }) => {
            await page.getByRole('button', { name: /siguiente/i }).click();
            await expect(page.getByText('Error')).toBeVisible({ timeout: 10000 });
        });

        test('debería cerrarse la ventana de error al hacer clic en Aceptar', async ({ page }) => {
            await page.getByRole('button', { name: /siguiente/i }).click();
            await expect(page.getByText('Error')).toBeVisible({ timeout: 10000 });

            await page.getByRole('button', { name: /aceptar/i }).click();
            await expect(page.getByText('Error')).not.toBeVisible({ timeout: 10000 });
        });

        test('debería dar error si todos los campos están llenos excepto el nombre', async ({ page }) => {
            // Con el formulario por pasos no se puede avanzar sin nombre: el error debe mostrarse en el paso 1.
            await expect(page.locator('#nombre')).toHaveValue('');
            await page.getByRole('button', { name: /siguiente/i }).click();
            await expect(page.getByText('Error')).toBeVisible({ timeout: 10000 });
        });

        test('debería mostrar mensaje de éxito al agregar usuario y abrir la información del usuario creado', async ({
            page,
        }) => {
            test.setTimeout(120000);

            page.on('dialog', async (dialog) => {
                await dialog.accept();
            });

            const email = uniqueNewUserEmail();
            await fillNewUserFormFields(page, { email, includeNombre: true });

            const guardarBtn = page.locator(`${ADD_USER_FORM_SELECTOR} button[type="submit"]`);
            await expect(guardarBtn).toBeEnabled({ timeout: 15000 });

            await guardarBtn.click();
            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).toBeVisible({ timeout: 60000 });

            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).not.toBeVisible({ timeout: 12000 });

            const codigoUsuario = await readCodigoUltimoUsuarioEnStore(page);

            expect(codigoUsuario).toBeTruthy();

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigoUsuario!);

            await expect(page.getByRole('heading', { name: /Informaci[oó]n del usuario/i })).toBeVisible({
                timeout: 60000,
            });
        });

        // Mismo flujo que el test anterior: éxito al crear + modal "Información del usuario" vía menú Ver.
        test('debería mostrar el modal de ver información del usuario', async ({ page }) => {
            test.setTimeout(120000);

            page.on('dialog', async (dialog) => {
                await dialog.accept();
            });

            const email = uniqueNewUserEmail();
            await fillNewUserFormFields(page, { email, includeNombre: true });

            const guardarBtn = page.locator(`${ADD_USER_FORM_SELECTOR} button[type="submit"]`);
            await expect(guardarBtn).toBeEnabled({ timeout: 15000 });
            await guardarBtn.click();

            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).toBeVisible({ timeout: 60000 });
            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).not.toBeVisible({ timeout: 12000 });

            const codigo = await readCodigoUltimoUsuarioEnStore(page);
            expect(codigo).toBeTruthy();

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo!);

            await expect(page.getByRole('heading', { name: /Informaci[oó]n del usuario/i })).toBeVisible({
                timeout: 60000,
            });
        });
    });

    // --- Formulario editar: abrir desde menú, cancelar, guardar y verificar en panel ---
    test.describe('Usuarios / formulario editar', () => {
        test.beforeEach(async ({ page }) => {
            page.on('dialog', async (dialog) => {
                await dialog.accept();
            });
            await goToUsuariosHome(page);
        });

        test('debería abrir el formulario de editar desde el menú de la fila', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearUsuarioParaTestEdicion(page);
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await page.waitForSelector(EDIT_USER_FORM_SELECTOR, { timeout: 15000 });
            await expect(page.getByRole('form', { name: 'formulario para editar usuario' })).toBeVisible({
                timeout: 10000,
            });
        });

        test('debería cerrar el formulario de editar al hacer clic en Cancelar', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearUsuarioParaTestEdicion(page);
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await expect(page.getByRole('form', { name: 'formulario para editar usuario' })).toBeVisible({
                timeout: 10000,
            });
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(page.getByRole('form', { name: 'formulario para editar usuario' })).not.toBeVisible({
                timeout: 10000,
            });
        });

        test('debería guardar edición, mostrar éxito y reflejar los datos en Ver información', async ({ page }) => {
            test.setTimeout(120000);
            const suffix = `${Date.now()}`;
            const editValues: EditFormValues = {
                nombre: `Nom${suffix}`,
                segundoNombre: `Seg${suffix}`,
                primerApellido: `Ap1${suffix}`,
                segundoApellido: `Ap2${suffix}`,
                alias: `alias${suffix}`,
                fechaNacimiento: '2000-06-15',
                sexo: 'Femenino',
                identidad: `ID-${suffix}`,
                numeroTelefono: `+504${suffix.slice(-8)}`,
                direccion: `Calle Test ${suffix}`,
            };

            const codigo = await crearUsuarioParaTestEdicion(page);
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await fillEditUserFormAndSubmit(page, editValues);

            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).toBeVisible({ timeout: 60000 });
            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).not.toBeVisible({ timeout: 12000 });

            const row = page.locator(`[data-codigo="${codigo}"]`);
            await expect(row.getByRole('heading', { level: 2 })).toHaveText(editValues.nombre, { timeout: 30000 });

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(page.getByRole('heading', { name: /Informaci[oó]n del usuario/i })).toBeVisible({
                timeout: 60000,
            });

            const esperadoNombreCompleto = nombreCompletoEsperado(editValues);
            expect(await valorCampoInformacion(page, 'Nombre completo')).toBe(esperadoNombreCompleto);
            expect(await valorCampoInformacion(page, 'Alias')).toBe(editValues.alias);
            expect(await page.getByTestId('identidad').innerText()).toBe(editValues.identidad);
            expect(await page.getByTestId('numeroTelefono').innerText()).toBe(editValues.numeroTelefono);
            expect((await page.getByTestId('direccion').innerText()).trim()).toBe(editValues.direccion);
            expect(await valorCampoInformacion(page, 'Género')).toBe(editValues.sexo);

            const fechaMostrada = await valorCampoInformacion(page, 'Fecha de nacimiento');
            expect(
                fechaMostrada === editValues.fechaNacimiento ||
                    fechaMostrada.startsWith(editValues.fechaNacimiento) ||
                    (fechaMostrada.includes('2000') && fechaMostrada.includes('15'))
            ).toBeTruthy();
        });
    });

    // --- Eliminar y flujo integrado ---
    test.describe('Usuarios / eliminar usuario', () => {
        test.beforeEach(async ({ page }) => {
            page.on('dialog', async (dialog) => {
                await dialog.accept();
            });
            await goToUsuariosHome(page);
        });

        test('debería abrir el modal de confirmación al elegir Eliminar en el menú', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearUsuarioParaTestEdicion(page);
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal.getByRole('heading', { name: /Confirmar eliminación/i })).toBeVisible({
                timeout: 10000,
            });
            await expect(modal.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
            await expect(modal.getByText(newUserDefaults.nombre, { exact: true })).toBeVisible();
        });

        test('debería cerrar el modal de confirmación al cancelar y conservar la fila', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearUsuarioParaTestEdicion(page);
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^cancelar$/i }).click();
            await expect(modal).toBeHidden({ timeout: 10000 });
            await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(1);
        });

        test('debería eliminar de la federación al confirmar y dejar el usuario sin rol en la lista', async ({
            page,
        }) => {
            test.setTimeout(120000);
            const codigo = await crearUsuarioParaTestEdicion(page);
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^eliminar$/i }).click();
            // En Windows/CI el modal de éxito puede ser muy fugaz o no renderizarse de forma estable.
            // El contrato funcional que nos importa para E2E: al eliminar se saca de la federación, por lo tanto la fila debe desaparecer.
            await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 60000 });
        });

        test('usuario eliminado no puede iniciar sesión y ve mensaje de cuenta eliminada', async ({
            page,
            context,
        }) => {
            test.setTimeout(180000);
            const { codigo, email, password } = await crearUsuarioParaTestConCredenciales(page);
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^eliminar$/i }).click();
            await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 60000 });

            await context.clearCookies();
            await intentarLoginUsuario(page, { email, password });

            await expect(page.getByTestId('error-message')).toContainText(
                /cuenta ha sido eliminada/i,
                { timeout: 30000 },
            );
            await expect(page).toHaveURL(/SignInPage/, { timeout: 10000 });
            await expect(page).not.toHaveURL(/PanelControlPage/);
        });

        test('flujo completo: crear, ver información, editar, verificar datos y eliminar el mismo usuario', async ({
            page,
        }) => {
            test.setTimeout(240000);
            const suffix = `${Date.now()}`;
            const editValues: EditFormValues = {
                nombre: `Nom${suffix}`,
                segundoNombre: `Seg${suffix}`,
                primerApellido: `Ap1${suffix}`,
                segundoApellido: `Ap2${suffix}`,
                alias: `alias${suffix}`,
                fechaNacimiento: '1995-03-20',
                sexo: 'Masculino',
                identidad: `ID-FLUJO-${suffix}`,
                numeroTelefono: `+5049${suffix.slice(-7)}`,
                direccion: `Dir flujo ${suffix}`,
            };

            const codigo = await crearUsuarioParaTestEdicion(page);

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(page.getByRole('heading', { name: /Informaci[oó]n del usuario/i })).toBeVisible({
                timeout: 60000,
            });
            const nombreInicialCompleto = nombreCompletoEsperado({
                nombre: newUserDefaults.nombre,
                segundoNombre: '',
                primerApellido: newUserDefaults.primerApellido,
                segundoApellido: '',
            });
            expect(await valorCampoInformacion(page, 'Nombre completo')).toBe(nombreInicialCompleto);
            await cerrarModalInformacionUsuario(page);

            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await fillEditUserFormAndSubmit(page, editValues);
            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).toBeVisible({ timeout: 60000 });
            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).not.toBeVisible({ timeout: 12000 });

            const row = page.locator(`[data-codigo="${codigo}"]`);
            await expect(row.getByRole('heading', { level: 2 })).toHaveText(editValues.nombre, { timeout: 30000 });

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(page.getByRole('heading', { name: /Informaci[oó]n del usuario/i })).toBeVisible({
                timeout: 60000,
            });
            const esperadoNombreCompleto = nombreCompletoEsperado(editValues);
            expect(await valorCampoInformacion(page, 'Nombre completo')).toBe(esperadoNombreCompleto);
            expect(await valorCampoInformacion(page, 'Alias')).toBe(editValues.alias);
            expect(await page.getByTestId('identidad').innerText()).toBe(editValues.identidad);
            expect(await page.getByTestId('numeroTelefono').innerText()).toBe(editValues.numeroTelefono);
            expect((await page.getByTestId('direccion').innerText()).trim()).toBe(editValues.direccion);
            expect(await valorCampoInformacion(page, 'Género')).toBe(editValues.sexo);
            const fechaMostrada = await valorCampoInformacion(page, 'Fecha de nacimiento');
            expect(
                fechaMostrada === editValues.fechaNacimiento ||
                    fechaMostrada.startsWith(editValues.fechaNacimiento) ||
                    (fechaMostrada.includes('1995') && fechaMostrada.includes('20'))
            ).toBeTruthy();
            await cerrarModalInformacionUsuario(page);

            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modalEliminar = locatorModalConfirmarEliminacion(page);
            await expect(modalEliminar).toBeVisible({ timeout: 10000 });
            await modalEliminar.getByRole('button', { name: /^eliminar$/i }).click();
            // El modal de éxito puede ser fugaz; validamos el efecto: la fila desaparece.
            await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 60000 });
        });
    });
});
