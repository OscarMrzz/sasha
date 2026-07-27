/**
 * E2E — módulo Regiones (Playwright)
 *
 * Rutas y navegación (según código actual del repo):
 * - Tras login: panel `PanelControlPage`
 * - Sidebar (lg+): botón con texto "Región" → `/PanelControlPage/regionHomePage`
 * - Página: título visible `Regiones` (h1), botón `Agregar` abre modal formulario
 *
 * Contrato UI que este archivo asume (diseñado para ser IGUAL al patrón de `tests/user.spec.ts`):
 *
 * Autenticación — igual que `user.spec.ts`
 * - `#email`, `#password` en SignIn; botón iniciar sesión; URL con `PanelControlPage`
 *
 * Panel / navegación
 * - `getByRole('button', { name: /regi[oó]n/i })` — etiqueta en sidebar es "Región"
 *
 * Lista (OBLIGATORIO para mantener consistencia entre módulos)
 * - Cada fila debe exponer `data-testid="card-row"` cuando está estable.
 * - Cada fila debe exponer `data-codigo="<idRegion>"` (atributo HTML) para ubicarla por id de negocio.
 * - La fila debe contener el wrapper `data-testid="menu-mas-opciones"` y un botón accesible \"Abrir menú\".
 * - Ítems del menú deben existir como testids globales: `menu-mas-opciones-ver`, `menu-mas-opciones-editar`, `menu-mas-opciones-eliminar`.
 *
 * Modal información (OBLIGATORIO)
 * - `dialog` con heading \"Información de la región\".
 * - Valores clave deben tener testids (si aplica): por ejemplo `informacion-region-nombre`.
 *
 * Formulario agregar (OBLIGATORIO)
 * - `form[aria-label="formulario para agregar region"]` (role form name igual) dentro del `dialog`.
 * - Campo: `#nombreRegion` + botón Siguiente/Agregar según el diseño; botón Cancelar.
 *
 * Formulario editar (OBLIGATORIO)
 * - `form[aria-label="formulario para editar region"]` (role form name igual) dentro del `dialog`.
 * - Campo: `#nombreRegion`; botón \"Actualizar\" o similar + Cancelar.
 *
 * Errores
 * - `alert()` nativo en fallos de create/update — usar `page.on('dialog', …)` donde aplique
 */
import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Constantes
// =============================================================================

const URL_REGION_HOME = /.*regionHomePage/;
const ADD_REGION_FORM_SELECTOR = 'form[aria-label=\"formulario para agregar region\"]';
const EDIT_REGION_FORM_SELECTOR = 'form[aria-label=\"formulario para editar region\"]';

// =============================================================================
// Auth (mismo contrato que user.spec.ts)
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

async function goToRegionesHome(page: Page) {
    await page.getByRole('button', { name: /regi[oó]n/i }).click();
    await expect(page).toHaveURL(URL_REGION_HOME, { timeout: 15000 });
}

function uniqueRegionName(): string {
    return `Región E2E ${Date.now()}`;
}

async function readCodigoUltimaRegionEnStore(page: Page): Promise<string | undefined> {
    // CONTRATO: si no existe este store, el test fallará y sabremos que falta exponerlo o dar otra manera estable de obtener el id.
    return page.evaluate(() => {
        const store = (window as unknown as { useRegionAgregadaStore?: { getState: () => unknown } })
            .useRegionAgregadaStore?.getState() as { ultimaRegion?: { codigo?: string } } | undefined;
        return store?.ultimaRegion?.codigo;
    });
}

async function esperarFilaRegionEstableEnLista(page: Page, codigo: string) {
    const rowEstable = page.locator(`[data-codigo=\"${codigo}\"][data-testid=\"card-row\"]`);
    const rowNuevo = page.locator(`[data-codigo=\"${codigo}\"][data-testid=\"card-row-nuevo\"]`);

    // Tras crear puede aparecer primero `card-row-nuevo` (animación) y luego `card-row`.
    await expect
        .poll(async () => (await rowEstable.isVisible()) || (await rowNuevo.isVisible()), { timeout: 45000 })
        .toBeTruthy();

    // Esperamos a la fila estable final.
    await expect(rowEstable).toBeVisible({ timeout: 45000 });
}

/** Abre el menú de más opciones de la fila del código y elige Ver. */
async function abrirMenuVerInformacionDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaRegionEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo=\"${codigo}\"]`);
    const menuEnFila = row.locator('[data-testid=\"menu-mas-opciones\"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemVer = page.getByTestId('menu-mas-opciones-ver');
    await expect(itemVer).toBeVisible({ timeout: 10000 });
    await itemVer.click({ force: true });
}

/** Abre el menú y elige Editar. */
async function abrirMenuEditarDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaRegionEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo=\"${codigo}\"]`);
    const menuEnFila = row.locator('[data-testid=\"menu-mas-opciones\"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemEditar = page.getByTestId('menu-mas-opciones-editar');
    await expect(itemEditar).toBeVisible({ timeout: 10000 });
    await itemEditar.click({ force: true });
}

/** Abre el menú y elige Eliminar (abre modal de confirmación). */
async function abrirMenuEliminarDeFilaPorCodigo(page: Page, codigo: string) {
    await esperarFilaRegionEstableEnLista(page, codigo);
    const row = page.locator(`[data-codigo=\"${codigo}\"]`);
    const menuEnFila = row.locator('[data-testid=\"menu-mas-opciones\"]');
    await menuEnFila.getByRole('button', { name: /abrir menú/i }).click();
    const itemEliminar = page.getByTestId('menu-mas-opciones-eliminar');
    await expect(itemEliminar).toBeVisible({ timeout: 10000 });
    await itemEliminar.click({ force: true });
}

function locatorModalInformacionRegion(page: Page) {
    return page.locator('dialog').filter({ has: page.getByRole('heading', { name: /Informaci[oó]n de la regi[oó]n/i }) });
}

function locatorModalConfirmarEliminacion(page: Page) {
    return page.locator('dialog').filter({ has: page.getByRole('heading', { name: /Confirmar eliminación/i }) });
}

async function eliminarRegionDesdeMenu(page: Page, codigo: string) {
    await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
    const modal = locatorModalConfirmarEliminacion(page);
    await expect(modal).toBeVisible({ timeout: 10000 });
    await modal.getByRole('button', { name: /^eliminar$/i }).click();
    await expect(page.locator(`[data-codigo=\"${codigo}\"]`)).toHaveCount(0, { timeout: 30000 });
}

async function openAddRegionForm(page: Page) {
    await page.getByRole('button', { name: /^Agregar$/i }).click();
    await page.waitForSelector(ADD_REGION_FORM_SELECTOR, { timeout: 15000 });
    await expect(page.getByRole('form', { name: 'formulario para agregar region' })).toBeVisible({ timeout: 10000 });
}

async function crearRegionDesdeFormulario(page: Page, nombreRegion: string) {
    await openAddRegionForm(page);
    const form = page.locator(ADD_REGION_FORM_SELECTOR);
    await form.locator('#nombreRegion').fill(nombreRegion);

    const guardarBtn = page.locator(`${ADD_REGION_FORM_SELECTOR} button[type=\"submit\"]`);
    await expect(guardarBtn).toBeEnabled({ timeout: 15000 });
    await guardarBtn.click();

    await expect.poll(async () => await readCodigoUltimaRegionEnStore(page), { timeout: 30000 }).toBeTruthy();
    const codigo = (await readCodigoUltimaRegionEnStore(page)) as string;
    await esperarFilaRegionEstableEnLista(page, codigo);
    return codigo;
}

async function cerrarModalInformacionRegion(page: Page) {
    const dialog = locatorModalInformacionRegion(page);
    await dialog.getByRole('button', { name: /^cerrar$/i }).click();
    await expect(dialog).toBeHidden({ timeout: 10000 });
}

type EditFormValues = { nombreRegion: string };

async function fillEditRegionFormAndSubmit(page: Page, v: EditFormValues) {
    await page.waitForSelector(EDIT_REGION_FORM_SELECTOR, { timeout: 15000 });
    await page.locator('#nombreRegion').fill(v.nombreRegion);
    const submitBtn = page.locator(`${EDIT_REGION_FORM_SELECTOR} button[type=\"submit\"]`);
    await expect(submitBtn).toBeEnabled({ timeout: 15000 });
    await submitBtn.click();
}

// =============================================================================
// Tests
// =============================================================================

test.describe('regiones', () => {
    test.describe.configure({ timeout: 120000 });

    test.beforeAll(() => {
        getE2ECredentials();
    });

    test.beforeEach(async ({ page }) => {
        await loginAsE2EUser(page, getE2ECredentials());
    });

    test('navegación correcta hacia regiones', async ({ page }) => {
        await expect(page).toHaveURL(/.*PanelControlPage/);
        await goToRegionesHome(page);
        await expect(page.getByRole('heading', { name: /^Regiones$/i })).toBeVisible({ timeout: 15000 });
    });

    test.describe('Regiones / formulario agregar', () => {
        test.beforeEach(async ({ page }) => {
            await goToRegionesHome(page);
        });

        test('muestra el formulario para agregar region al hacer clic en agregar', async ({ page }) => {
            await openAddRegionForm(page);
            await expect(page.locator(ADD_REGION_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
        });

        test('debería cerrar el formulario al hacer clic en Cancelar', async ({ page }) => {
            await openAddRegionForm(page);
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(page.locator(ADD_REGION_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });
        });

        test('debería crear una región y mostrarla en la lista', async ({ page }) => {
            test.setTimeout(120000);
            page.on('dialog', async (d) => {
                await d.accept();
            });
            const nombre = uniqueRegionName();
            const codigo = await crearRegionDesdeFormulario(page, nombre);
            await expect(page.locator(`[data-codigo=\"${codigo}\"][data-testid=\"card-row\"]`)).toHaveCount(1);
            await eliminarRegionDesdeMenu(page, codigo);
        });
    });

    test.describe('Regiones / información, editar y eliminar', () => {
        test.beforeEach(async ({ page }) => {
            page.on('dialog', async (d) => {
                await d.accept();
            });
            await goToRegionesHome(page);
        });

        test('debería abrir el modal de ver información desde el menú de la fila', async ({ page }) => {
            test.setTimeout(120000);
            const nombre = uniqueRegionName();
            const codigo = await crearRegionDesdeFormulario(page, nombre);
            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(locatorModalInformacionRegion(page)).toBeVisible({ timeout: 15000 });
            await cerrarModalInformacionRegion(page);
            await eliminarRegionDesdeMenu(page, codigo);
        });

        test('debería abrir el formulario de editar desde el menú de la fila', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearRegionDesdeFormulario(page, uniqueRegionName());
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await expect(page.getByRole('form', { name: 'formulario para editar region' })).toBeVisible({ timeout: 10000 });
            await page.getByRole('button', { name: /cancelar/i }).click();
            await expect(page.getByRole('form', { name: 'formulario para editar region' })).not.toBeVisible({ timeout: 10000 });
            await eliminarRegionDesdeMenu(page, codigo);
        });

        test('debería guardar edición, mostrar éxito y reflejar los datos en Ver información', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearRegionDesdeFormulario(page, uniqueRegionName());
            const editValues: EditFormValues = { nombreRegion: `Región editada ${Date.now()}` };
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await fillEditRegionFormAndSubmit(page, editValues);

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(locatorModalInformacionRegion(page)).toBeVisible({ timeout: 15000 });
            await expect(page.getByTestId('informacion-region-nombre')).toHaveText(editValues.nombreRegion);
            await cerrarModalInformacionRegion(page);
            await eliminarRegionDesdeMenu(page, codigo);
        });

        test('debería abrir el modal de confirmación al elegir Eliminar en el menú', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearRegionDesdeFormulario(page, uniqueRegionName());
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal.getByRole('heading', { name: /Confirmar eliminación/i })).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^cancelar$/i }).click();
            await expect(modal).toBeHidden({ timeout: 10000 });
            await eliminarRegionDesdeMenu(page, codigo);
        });

        test('debería cerrar el modal de confirmación al cancelar y conservar la fila', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearRegionDesdeFormulario(page, uniqueRegionName());
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^cancelar$/i }).click();
            await expect(modal).toBeHidden({ timeout: 10000 });
            await expect(page.locator(`[data-codigo=\"${codigo}\"]`)).toHaveCount(1);
            await eliminarRegionDesdeMenu(page, codigo);
        });

        test('debería eliminar al confirmar y quitar la fila de la lista', async ({ page }) => {
            test.setTimeout(120000);
            const codigo = await crearRegionDesdeFormulario(page, uniqueRegionName());
            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^eliminar$/i }).click();
            await expect(page.locator(`[data-codigo=\"${codigo}\"]`)).toHaveCount(0, { timeout: 30000 });
        });

        test('flujo completo: crear, ver información, editar, verificar lista y eliminar', async ({ page }) => {
            test.setTimeout(240000);
            const codigo = await crearRegionDesdeFormulario(page, uniqueRegionName());

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(locatorModalInformacionRegion(page)).toBeVisible({ timeout: 15000 });
            await cerrarModalInformacionRegion(page);

            const editValues: EditFormValues = { nombreRegion: `Región flujo ${Date.now()}` };
            await abrirMenuEditarDeFilaPorCodigo(page, codigo);
            await fillEditRegionFormAndSubmit(page, editValues);

            await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
            await expect(page.getByTestId('informacion-region-nombre')).toHaveText(editValues.nombreRegion);
            await cerrarModalInformacionRegion(page);

            await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
            const modal = locatorModalConfirmarEliminacion(page);
            await expect(modal).toBeVisible({ timeout: 10000 });
            await modal.getByRole('button', { name: /^eliminar$/i }).click();
            await expect(page.locator(`[data-codigo=\"${codigo}\"]`)).toHaveCount(0, { timeout: 30000 });
        });
    });
});
