/**
 * E2E — módulo Bandas (Playwright)
 *
 * Contrato UI que este archivo asume (mismo patrón que `tests/user.spec.ts`, `tests/categorias.spec.ts`, `tests/regiones.spec.ts`):
 *
 * - Navegación: botón sidebar "Bandas" → `/PanelControlPage/bandasHomePage`
 * - Lista:
 *   - Fila estable: `data-testid="card-row"`
 *   - Identificador de negocio en fila: `data-codigo="<idBanda>"`
 *   - Menú por fila: wrapper `data-testid="menu-mas-opciones"` + botón accesible "Abrir menú"
 *   - Acciones del menú (testids globales): `menu-mas-opciones-ver`, `menu-mas-opciones-editar`, `menu-mas-opciones-eliminar`
 * - Modal Ver información: `dialog` con heading "Información de la banda"
 * - Formularios:
 *   - `form[aria-label="formulario para agregar banda"]`
 *   - `form[aria-label="formulario para editar banda"]`
 * - Store (solo lectura para id recién creado):
 *   - `window.useBandaAgregadaStore.getState().ultimaBanda.codigo`
 */

import { test, expect, type Page } from "@playwright/test";

// =============================================================================
// Constantes
// =============================================================================

const URL_BANDAS_HOME = /.*bandasHomePage/;
const ADD_BANDA_FORM_SELECTOR = 'form[aria-label="formulario para agregar banda"]';
const EDIT_BANDA_FORM_SELECTOR = 'form[aria-label="formulario para editar banda"]';

// =============================================================================
// Auth (mismo contrato que user.spec.ts)
// =============================================================================

function getE2ECredentials(): { email: string; password: string } {
  const email = process.env.E2E_USER_EMAIL?.trim();
  const password = process.env.E2E_USER_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error(
      "Define E2E_USER_EMAIL y E2E_USER_PASSWORD (ver .env.example). Copia .env.example a .env y rellena los valores."
    );
  }
  return { email, password };
}

async function loginAsE2EUser(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/authPage/SignInPage", { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(credentials.email);
  await page.locator("#password").fill(credentials.password);
  await Promise.all([
    page.waitForURL(/.*PanelControlPage/, { timeout: 45000, waitUntil: "domcontentloaded" }),
    page.getByRole("button", { name: /iniciar sesi[oó]n/i }).click(),
  ]);
}

async function goToBandasHome(page: Page) {
  await page.getByRole("button", { name: /bandas/i }).click();
  await expect(page).toHaveURL(URL_BANDAS_HOME, { timeout: 15000 });
}

function uniqueBandaName(): string {
  return `Banda E2E ${Date.now()}`;
}

async function readCodigoUltimaBandaEnStore(page: Page): Promise<string | undefined> {
  return page.evaluate(() => {
    const store = (window as unknown as { useBandaAgregadaStore?: { getState: () => unknown } })
      .useBandaAgregadaStore?.getState() as { ultimaBanda?: { codigo?: string } } | undefined;
    return store?.ultimaBanda?.codigo;
  });
}

// =============================================================================
// Helpers UI
// =============================================================================

async function esperarFilaBandaEstableEnLista(page: Page, codigo: string) {
  const row = page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`);
  await expect.poll(async () => await row.isVisible(), { timeout: 45000 }).toBeTruthy();
}

async function abrirMenuVerInformacionDeFilaPorCodigo(page: Page, codigo: string) {
  await esperarFilaBandaEstableEnLista(page, codigo);
  const row = page.locator(`[data-codigo="${codigo}"]`);
  const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
  await menuEnFila.getByRole("button", { name: /abrir menú/i }).click();
  const itemVer = page.getByTestId("menu-mas-opciones-ver");
  await expect(itemVer).toBeVisible({ timeout: 10000 });
  await itemVer.click({ force: true });
}

async function abrirMenuEditarDeFilaPorCodigo(page: Page, codigo: string) {
  await esperarFilaBandaEstableEnLista(page, codigo);
  const row = page.locator(`[data-codigo="${codigo}"]`);
  const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
  await menuEnFila.getByRole("button", { name: /abrir menú/i }).click();
  const itemEditar = page.getByTestId("menu-mas-opciones-editar");
  await expect(itemEditar).toBeVisible({ timeout: 10000 });
  await itemEditar.click({ force: true });
}

async function abrirMenuEliminarDeFilaPorCodigo(page: Page, codigo: string) {
  await esperarFilaBandaEstableEnLista(page, codigo);
  const row = page.locator(`[data-codigo="${codigo}"]`);
  const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
  await menuEnFila.getByRole("button", { name: /abrir menú/i }).click();
  const itemEliminar = page.getByTestId("menu-mas-opciones-eliminar");
  await expect(itemEliminar).toBeVisible({ timeout: 10000 });
  await itemEliminar.click({ force: true });
}

function locatorModalInformacionBanda(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Informaci[oó]n de la banda/i }) });
}

function locatorModalConfirmarEliminacion(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Confirmar eliminación/i }) });
}

async function openAddBandaForm(page: Page) {
  await page.getByRole("button", { name: /^agregar$/i }).click();
  await page.waitForSelector(ADD_BANDA_FORM_SELECTOR, { timeout: 15000 });
  await expect(page.getByRole("form", { name: "formulario para agregar banda" })).toBeVisible({ timeout: 10000 });
}

async function selectFirstNonEmptyOptionValue(select: ReturnType<Page["locator"]>) {
  const value = await select.locator('option:not([value=""])').first().getAttribute("value");
  expect(value, "El select debería tener al menos una opción no vacía").toBeTruthy();
  await select.selectOption(value as string);
}

async function crearBandaParaTests(page: Page): Promise<string> {
  await openAddBandaForm(page);
  const form = page.locator(ADD_BANDA_FORM_SELECTOR);
  const nombre = uniqueBandaName();

  await form.locator("#nombreBanda").fill(nombre);
  await form.locator("#AliasBanda").fill(`Alias ${Date.now()}`);

  await selectFirstNonEmptyOptionValue(form.locator("select#idForaneaCategoria"));
  await selectFirstNonEmptyOptionValue(form.locator("select#idForaneaRegion"));

  const guardarBtn = page.locator(`${ADD_BANDA_FORM_SELECTOR} button[type="submit"]`);
  await expect(guardarBtn).toBeEnabled({ timeout: 15000 });
  await guardarBtn.click();

  await expect.poll(async () => await readCodigoUltimaBandaEnStore(page), { timeout: 45000 }).toBeTruthy();
  const codigo = (await readCodigoUltimaBandaEnStore(page)) as string;
  await esperarFilaBandaEstableEnLista(page, codigo);
  return codigo;
}

type EditFormValues = { nombreBanda: string; AliasBanda: string };

async function fillEditBandaFormAndSubmit(page: Page, v: EditFormValues) {
  await page.waitForSelector(EDIT_BANDA_FORM_SELECTOR, { timeout: 15000 });
  const form = page.locator(EDIT_BANDA_FORM_SELECTOR);
  await form.locator("#nombreBanda").fill(v.nombreBanda);
  await form.locator("#AliasBanda").fill(v.AliasBanda);
  const submitBtn = page.locator(`${EDIT_BANDA_FORM_SELECTOR} button[type="submit"]`);
  await expect(submitBtn).toBeEnabled({ timeout: 15000 });
  await submitBtn.click();
}

async function eliminarBandaDesdeMenu(page: Page, codigo: string) {
  await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
  const modal = locatorModalConfirmarEliminacion(page);
  await expect(modal).toBeVisible({ timeout: 10000 });
  await modal.getByRole("button", { name: /^eliminar$/i }).click();
  await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
}

async function cerrarModalInformacionBanda(page: Page) {
  const dialog = locatorModalInformacionBanda(page);
  await dialog.getByRole("button", { name: /^cerrar$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 10000 });
}

// =============================================================================
// Tests
// =============================================================================

test.describe("bandas", () => {
  test.describe.configure({ timeout: 120000 });

  test.beforeAll(() => {
    getE2ECredentials();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, getE2ECredentials());
  });

  test("navegación correcta hacia bandas", async ({ page }) => {
    await expect(page).toHaveURL(/.*PanelControlPage/);
    await goToBandasHome(page);
    await expect(page.getByRole("heading", { name: /^Bandas$/i })).toBeVisible({ timeout: 15000 });
  });

  test.describe("Bandas / formulario agregar", () => {
    test.beforeEach(async ({ page }) => {
      await goToBandasHome(page);
    });

    test("muestra el formulario para agregar banda al hacer clic en agregar", async ({ page }) => {
      await openAddBandaForm(page);
      await expect(page.locator(ADD_BANDA_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
    });

    test("debería cerrar el formulario al hacer clic en Cancelar", async ({ page }) => {
      await openAddBandaForm(page);
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(ADD_BANDA_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });
    });

    test("debería crear una banda y aparecer en la lista", async ({ page }) => {
      test.setTimeout(180000);
      page.on("dialog", async (d) => {
        await d.accept();
      });
      const codigo = await crearBandaParaTests(page);
      await expect(page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`)).toHaveCount(1);
      await eliminarBandaDesdeMenu(page, codigo);
    });
  });

  test.describe("Bandas / ver, editar y eliminar", () => {
    test.beforeEach(async ({ page }) => {
      page.on("dialog", async (d) => {
        await d.accept();
      });
      await goToBandasHome(page);
    });

    test("debería abrir el modal de ver información desde el menú de la fila", async ({ page }) => {
      test.setTimeout(180000);
      const codigo = await crearBandaParaTests(page);
      await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
      await expect(locatorModalInformacionBanda(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionBanda(page);
      await eliminarBandaDesdeMenu(page, codigo);
    });

    test("debería abrir el modal de ver información al hacer doble clic en la fila", async ({ page }) => {
      test.setTimeout(180000);
      const codigo = await crearBandaParaTests(page);
      await page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`).dblclick();
      await expect(locatorModalInformacionBanda(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionBanda(page);
      await eliminarBandaDesdeMenu(page, codigo);
    });

    test("debería abrir el formulario de editar desde el menú de la fila", async ({ page }) => {
      test.setTimeout(180000);
      const codigo = await crearBandaParaTests(page);
      await abrirMenuEditarDeFilaPorCodigo(page, codigo);
      await expect(page.getByRole("form", { name: "formulario para editar banda" })).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.getByRole("form", { name: "formulario para editar banda" })).not.toBeVisible({ timeout: 10000 });
      await eliminarBandaDesdeMenu(page, codigo);
    });

    test("debería guardar edición y reflejar los datos en Ver información", async ({ page }) => {
      test.setTimeout(180000);
      const codigo = await crearBandaParaTests(page);
      const editValues: EditFormValues = {
        nombreBanda: `Banda editada ${Date.now()}`,
        AliasBanda: `Alias editado ${Date.now()}`,
      };
      await abrirMenuEditarDeFilaPorCodigo(page, codigo);
      await fillEditBandaFormAndSubmit(page, editValues);

      await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
      await expect(locatorModalInformacionBanda(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("informacion-banda-nombre")).toHaveText(editValues.nombreBanda);
      await expect(page.getByTestId("informacion-banda-alias")).toContainText(editValues.AliasBanda);
      await cerrarModalInformacionBanda(page);
      await eliminarBandaDesdeMenu(page, codigo);
    });

    test("debería abrir el modal de confirmación al elegir Eliminar en el menú", async ({ page }) => {
      test.setTimeout(180000);
      const codigo = await crearBandaParaTests(page);
      await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal).toBeVisible({ timeout: 10000 });
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });
      await eliminarBandaDesdeMenu(page, codigo);
    });

    test("flujo completo: crear, ver información, editar, verificar y eliminar", async ({ page }) => {
      test.setTimeout(240000);
      const codigo = await crearBandaParaTests(page);

      await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
      await expect(locatorModalInformacionBanda(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionBanda(page);

      const editValues: EditFormValues = {
        nombreBanda: `Banda flujo ${Date.now()}`,
        AliasBanda: `Alias flujo ${Date.now()}`,
      };
      await abrirMenuEditarDeFilaPorCodigo(page, codigo);
      await fillEditBandaFormAndSubmit(page, editValues);

      await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
      await expect(page.getByTestId("informacion-banda-nombre")).toHaveText(editValues.nombreBanda);
      await cerrarModalInformacionBanda(page);

      await eliminarBandaDesdeMenu(page, codigo);
    });
  });
});

