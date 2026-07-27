/**
 * E2E — módulo Categorías (Playwright)
 *
 * Este spec está diseñado para replicar el patrón de `tests/user.spec.ts`:
 * - Fila estable: `data-testid="card-row"`
 * - Identificador de negocio en fila: `data-codigo="<idCategoria>"`
 * - Menú por fila: `data-testid="menu-mas-opciones"` + botón accesible "Abrir menú"
 * - Acciones por menú (testids globales): `menu-mas-opciones-ver`, `menu-mas-opciones-editar`, `menu-mas-opciones-eliminar`
 * - Formularios: `form[aria-label="formulario para agregar categoria"]` y `form[aria-label="formulario para editar categoria"]`
 * - Modal ver información: `dialog` con heading "Información de la categoría"
 * - Campos clave en el modal con testids (ejemplo): `informacion-categoria-nombre`, `informacion-categoria-detalles`
 *
 * Nota: si Categorías aún no tiene estos `data-testid`/atributos, el test fallará (a propósito) para evidenciar qué falta.
 */
import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Constantes
// =============================================================================

const URL_CATEGORIAS_HOME = /.*categoriasHomePage/;
const ADD_CATEGORIA_FORM_SELECTOR = 'form[aria-label="formulario para agregar categoria"]';
const EDIT_CATEGORIA_FORM_SELECTOR = 'form[aria-label="formulario para editar categoria"]';

const newCategoriaDefaults = {
    nombreCategoria: 'Categoria E2E',
    detallesCategoria: 'Detalles E2E',
};

// =============================================================================
// Utilidades comunes (credenciales/login) — mismo contrato que user.spec.ts
// =============================================================================

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

async function loginAsE2EUser(page: Page, credentials: { email: string; password: string }) {
    await page.goto('/authPage/SignInPage', { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(credentials.email);
    await page.locator('#password').fill(credentials.password);
    await Promise.all([
        page.waitForURL(/.*PanelControlPage/, { timeout: 45000, waitUntil: 'domcontentloaded' }),
        page.getByRole('button', { name: /iniciar sesi[oó]n/i }).click(),
    ]);
}

async function goToCategoriasHome(page: Page) {
    await page.getByRole('button', { name: /categor[ií]as/i }).click();
    await expect(page).toHaveURL(URL_CATEGORIAS_HOME, { timeout: 15000 });
}

function uniqueCategoriaName(): string {
    return `${newCategoriaDefaults.nombreCategoria} ${Date.now()}`;
}

// =============================================================================
// Store (solo lectura) — contrato para obtener el id recién creado
// =============================================================================

async function readCodigoUltimaCategoriaEnStore(page: Page): Promise<string | undefined> {
    return page.evaluate(() => {
        const store = (window as unknown as { useCategoriaAgregadaStore?: { getState: () => unknown } })
            .useCategoriaAgregadaStore?.getState() as { ultimaCategoria?: { codigo?: string } } | undefined;
        return store?.ultimaCategoria?.codigo;
    });
}

// =============================================================================
// Lista: fila estable + menú (data-codigo, data-testid card-row, menu-mas-opciones)
// =============================================================================

async function esperarFilaCategoriaEstableEnLista(page: Page, codigo: string) {
    const row = page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`);
    await expect.poll(async () => await row.isVisible(), { timeout: 45000 }).toBeTruthy();
}

async function abrirMenuVerInformacionDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaCategoriaEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo="${codigo}"]`);
    const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemVer = page.getByTestId('menu-mas-opciones-ver');
    await expect(itemVer).toBeVisible({ timeout: 10000 });
    await itemVer.click({ force: true });
}

async function abrirMenuEditarDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaCategoriaEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo="${codigo}"]`);
    const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemEditar = page.getByTestId('menu-mas-opciones-editar');
    await expect(itemEditar).toBeVisible({ timeout: 10000 });
    await itemEditar.click({ force: true });
}

async function abrirMenuEliminarDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaCategoriaEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo="${codigo}"]`);
    const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemEliminar = page.getByTestId('menu-mas-opciones-eliminar');
    await expect(itemEliminar).toBeVisible({ timeout: 10000 });
    await itemEliminar.click({ force: true });
}

// =============================================================================
// Modales: información / confirmación
// =============================================================================

function locatorModalInformacionCategoria(page: Page) {
    return page
        .locator('dialog')
        .filter({ has: page.getByRole('heading', { name: /Informaci[oó]n de la categor[ií]a/i }) });
}

function locatorModalConfirmarEliminacion(page: Page) {
    return page.locator('dialog').filter({ has: page.getByRole('heading', { name: /Confirmar eliminación/i }) });
}

async function cerrarModalInformacionCategoria(page: Page) {
    const dialog = locatorModalInformacionCategoria(page);
    await dialog.getByRole('button', { name: /^cerrar$/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
}

async function eliminarCategoriaDesdeMenu(page: Page, codigo: string) {
    await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
    const modal = locatorModalConfirmarEliminacion(page);
    await expect(modal).toBeVisible({ timeout: 10000 });
    await modal.getByRole('button', { name: /^eliminar$/i }).click();
    await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
}

// =============================================================================
// Formulario: agregar/editar
// =============================================================================

async function openAddCategoriaForm(page: Page) {
    await page.getByRole('button', { name: /^agregar$/i }).click();
    await page.waitForSelector(ADD_CATEGORIA_FORM_SELECTOR, { timeout: 15000 });
    await expect(page.getByRole('form', { name: 'formulario para agregar categoria' })).toBeVisible({
        timeout: 10000,
    });
}

async function fillNewCategoriaFormFields(page: Page, v: { nombreCategoria: string; detallesCategoria: string }) {
    const form = page.locator(ADD_CATEGORIA_FORM_SELECTOR);
    await form.locator('#nombreCategoria').fill(v.nombreCategoria);
    await form.locator('#detallesCategoria').fill(v.detallesCategoria);
}

type EditFormValues = { nombreCategoria: string; detallesCategoria: string };

async function fillEditCategoriaFormAndSubmit(page: Page, v: EditFormValues) {
    await page.waitForSelector(EDIT_CATEGORIA_FORM_SELECTOR, { timeout: 15000 });
    const form = page.locator(EDIT_CATEGORIA_FORM_SELECTOR);
    await form.locator('#nombreCategoria').fill(v.nombreCategoria);
    await form.locator('#detallesCategoria').fill(v.detallesCategoria);
    const submitBtn = page.locator(`${EDIT_CATEGORIA_FORM_SELECTOR} button[type="submit"]`);
    await expect(submitBtn).toBeEnabled({ timeout: 15000 });
    await submitBtn.click();
}

async function crearCategoriaParaTests(page: Page): Promise<string> {
    await openAddCategoriaForm(page);
    const nombre = uniqueCategoriaName();
    await fillNewCategoriaFormFields(page, { nombreCategoria: nombre, detallesCategoria: newCategoriaDefaults.detallesCategoria });
    const guardarBtn = page.locator(`${ADD_CATEGORIA_FORM_SELECTOR} button[type="submit"]`);
    await expect(guardarBtn).toBeEnabled({ timeout: 15000 });
    await guardarBtn.click();

    // El modal de éxito puede ser muy fugaz dependiendo del navegador;
    // sincronizamos por store y por fila estable en la lista.
    await expect.poll(async () => await readCodigoUltimaCategoriaEnStore(page), { timeout: 30000 }).toBeTruthy();
    const codigoStr = (await readCodigoUltimaCategoriaEnStore(page)) as string;
    await esperarFilaCategoriaEstableEnLista(page, codigoStr);
    return codigoStr;
}

// =============================================================================
// Tests
// =============================================================================

test.describe('categorias', () => {
    // Con 3 navegadores + webServer, a veces 60s se queda corto en máquinas lentas.
    test.describe.configure({ timeout: 120000 });

    test.beforeAll(() => {
        getE2ECredentials();
    });

    test.beforeEach(async ({ page }) => {
        await loginAsE2EUser(page, getE2ECredentials());
    });

    test('navegación correcta hacia categorías', async ({ page }) => {
        await expect(page).toHaveURL(/.*PanelControlPage/);
        await goToCategoriasHome(page);
        await expect(page.getByRole('heading', { name: /Categor[ií]as/i })).toBeVisible({ timeout: 15000 });
    });

    test.describe('Categorías / formulario agregar', () => {
        test.beforeEach(async ({ page }) => {
            await goToCategoriasHome(page);
        });

        test('muestra el formulario para agregar categoría al hacer clic en agregar', async ({ page }) => {
            await openAddCategoriaForm(page);
            await expect(page.locator(ADD_CATEGORIA_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
        });

        test('debería ocultar el formulario al hacer clic en cancelar', async ({ page }) => {
            await openAddCategoriaForm(page);
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(page.locator(ADD_CATEGORIA_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });
        });

        test('debería crear una categoría y aparecer en la lista', async ({ page }) => {
            test.setTimeout(120000);
            page.on('dialog', async (d) => {
                await d.accept();
            });
            const codigo = await crearCategoriaParaTests(page);
            await expect(page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`)).toHaveCount(1);
            await eliminarCategoriaDesdeMenu(page, codigo);
        });

        test('no debería enviar el formulario de agregar si faltan campos obligatorios (validación HTML5)', async ({
            page,
        }) => {
            await openAddCategoriaForm(page);
            await page.locator(`${ADD_CATEGORIA_FORM_SELECTOR} #nombreCategoria`).fill('');
            await page.locator(`${ADD_CATEGORIA_FORM_SELECTOR} #detallesCategoria`).fill('');
            const guardarBtn = page.locator(`${ADD_CATEGORIA_FORM_SELECTOR} button[type="submit"]`);
            await guardarBtn.click();
            await expect(page.locator(ADD_CATEGORIA_FORM_SELECTOR)).toBeVisible({ timeout: 5000 });
            await expect(page.getByRole('heading', { name: /[EÉ]xito/i })).not.toBeVisible({ timeout: 3000 });
        });

        test('debería mostrar éxito al crear y permitir abrir Ver información desde el menú', async ({ page }) => {
            test.setTimeout(120000);
            page.on('dialog', async (d) => {
                await d.accept();
            });
            const codigo = await crearCategoriaParaTests(page);
            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(locatorModalInformacionCategoria(page)).toBeVisible({ timeout: 15000 });
            await cerrarModalInformacionCategoria(page);
            await eliminarCategoriaDesdeMenu(page, codigo);
        });
    });

    test.describe('Categorías / formulario editar', () => {
        test.beforeEach(async ({ page }) => {
            page.on('dialog', async (d) => {
                await d.accept();
            });
            await goToCategoriasHome(page);
        });

        test('debería cerrar el formulario de editar al hacer clic en Cancelar', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearCategoriaParaTests(page);
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await expect(page.getByRole('form', { name: 'formulario para editar categoria' })).toBeVisible({
                timeout: 10000,
            });
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(page.getByRole('form', { name: 'formulario para editar categoria' })).not.toBeVisible({
                timeout: 10000,
            });
            await eliminarCategoriaDesdeMenu(page, codigo);
        });
    });

    test.describe('Categorías / ver, editar y eliminar', () => {
        test.beforeEach(async ({ page }) => {
            page.on('dialog', async (d) => {
                await d.accept();
            });
            await goToCategoriasHome(page);
        });

        test('debería abrir el modal de ver información desde el menú de la fila', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearCategoriaParaTests(page);
            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(locatorModalInformacionCategoria(page)).toBeVisible({ timeout: 15000 });
            await cerrarModalInformacionCategoria(page);
            await eliminarCategoriaDesdeMenu(page, codigo);
        });

        test('debería abrir el modal de ver información al hacer doble clic en la fila', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearCategoriaParaTests(page);
            const row = page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`);
            await row.dblclick();
            await expect(locatorModalInformacionCategoria(page)).toBeVisible({ timeout: 15000 });
            await cerrarModalInformacionCategoria(page);
            await eliminarCategoriaDesdeMenu(page, codigo);
        });

        test('debería abrir el formulario de editar desde el menú de la fila', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearCategoriaParaTests(page);
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await expect(page.getByRole('form', { name: 'formulario para editar categoria' })).toBeVisible({
                timeout: 10000,
            });
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(page.getByRole('form', { name: 'formulario para editar categoria' })).not.toBeVisible({
                timeout: 10000,
            });
            await eliminarCategoriaDesdeMenu(page, codigo);
        });

        test('debería guardar edición, mostrar éxito y reflejar los datos en Ver información', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearCategoriaParaTests(page);
            const editValues: EditFormValues = {
                nombreCategoria: `Categoria editada ${Date.now()}`,
                detallesCategoria: `Detalles editados ${Date.now()}`,
            };
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await fillEditCategoriaFormAndSubmit(page, editValues);

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(locatorModalInformacionCategoria(page)).toBeVisible({ timeout: 15000 });
            await expect(page.getByTestId('informacion-categoria-nombre')).toHaveText(editValues.nombreCategoria);
            await expect(page.getByTestId('informacion-categoria-detalles')).toHaveText(editValues.detallesCategoria);
            await cerrarModalInformacionCategoria(page);
            await eliminarCategoriaDesdeMenu(page, codigo);
        });

        test('debería abrir el modal de confirmación al elegir Eliminar en el menú', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearCategoriaParaTests(page);
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await expect(modal.getByRole('heading', { name: /Confirmar eliminación/i })).toBeVisible({
                timeout: 10000,
            });
            await expect(modal.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
            await modal.getByRole('button', { name: /^cancelar$/i }).click();
            await expect(modal).toBeHidden({ timeout: 10000 });
            await eliminarCategoriaDesdeMenu(page, codigo);
        });

        test('debería cerrar el modal de confirmación al cancelar y conservar la fila', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearCategoriaParaTests(page);
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^cancelar$/i }).click();
            await expect(modal).toBeHidden({ timeout: 10000 });
            await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(1);
            await eliminarCategoriaDesdeMenu(page, codigo);
        });

        test('debería eliminar al confirmar y quitar la fila de la lista', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearCategoriaParaTests(page);
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^eliminar$/i }).click();
            await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
        });

        test('flujo completo: crear, ver información, editar, verificar y eliminar', async ({ page }) => {
            test.setTimeout(240000);
            const codigo = await crearCategoriaParaTests(page);

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(locatorModalInformacionCategoria(page)).toBeVisible({ timeout: 15000 });
            await cerrarModalInformacionCategoria(page);

            const editValues: EditFormValues = {
                nombreCategoria: `Categoria flujo ${Date.now()}`,
                detallesCategoria: `Detalles flujo ${Date.now()}`,
            };
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await fillEditCategoriaFormAndSubmit(page, editValues);

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(page.getByTestId('informacion-categoria-nombre')).toHaveText(editValues.nombreCategoria);
            await expect(page.getByTestId('informacion-categoria-detalles')).toHaveText(editValues.detallesCategoria);
            await cerrarModalInformacionCategoria(page);

            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^eliminar$/i }).click();
            await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
        });
    });
});

