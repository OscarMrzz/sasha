/**
 * E2E — módulo Eventos (Playwright)
 *
 * Patrón igual a `tests/categorias.spec.ts` / `tests/regiones.spec.ts` / `tests/bandas.spec.ts`:
 * - Fila estable: `data-testid="card-row"`
 * - Identificador de negocio en fila: `data-codigo="<idEvento>"`
 * - Menú por fila: wrapper `data-testid="menu-mas-opciones"` + botón accesible "Abrir menú"
 * - Acciones del menú (testids globales): `menu-mas-opciones-ver`, `menu-mas-opciones-editar`, `menu-mas-opciones-eliminar`
 * - Formularios:
 *   - `form[aria-label="formulario para agregar evento"]`
 *   - `form[aria-label="formulario para editar evento"]`
 * - Modal ver información: `dialog` con heading "Información del evento"
 * - Confirmación eliminación: `dialog` con heading "Confirmar eliminación"
 */

import { test, expect, type Page } from "@playwright/test";

const URL_EVENTOS_HOME = /.*eventosHomePage/;
const ADD_EVENTO_FORM_SELECTOR = 'form[aria-label="formulario para agregar evento"]';
const EDIT_EVENTO_FORM_SELECTOR = 'form[aria-label="formulario para editar evento"]';

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

async function goToEventosHome(page: Page) {
  await page.getByRole("button", { name: /^evento$/i }).click();
  await expect(page).toHaveURL(URL_EVENTOS_HOME, { timeout: 15000 });
}

function uniqueLugarEvento(): string {
  return `Evento E2E ${Date.now()}`;
}

function locatorModalInformacionEvento(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Información del evento/i }) });
}

function locatorModalConfirmarEliminacion(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Confirmar eliminación/i }) });
}

async function esperarFilaEventoEstableEnLista(page: Page, codigo: string) {
  const row = page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`);
  await expect.poll(async () => await row.isVisible(), { timeout: 45000 }).toBeTruthy();
}

async function abrirMenuAccionDeFilaPorCodigo(page: Page, codigo: string, accion: "ver" | "editar" | "eliminar") {
  await esperarFilaEventoEstableEnLista(page, codigo);
  const row = page.locator(`[data-codigo="${codigo}"]`);
  const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
  await menuEnFila.getByRole("button", { name: /abrir menú/i }).click();
  await page.getByTestId(`menu-mas-opciones-${accion}`).click({ force: true });
}

async function openAddEventoForm(page: Page) {
  await page.getByRole("button", { name: /^agregar$/i }).click();
  await page.waitForSelector(ADD_EVENTO_FORM_SELECTOR, { timeout: 15000 });
  await expect(page.getByRole("form", { name: "formulario para agregar evento" })).toBeVisible({ timeout: 10000 });
}

async function selectFirstNonEmptyOptionValue(select: ReturnType<Page["locator"]>) {
  const value = await select.locator('option:not([value=""])').first().getAttribute("value");
  expect(value, "El select debería tener al menos una opción no vacía").toBeTruthy();
  await select.selectOption(value as string);
}

async function crearEventoParaTests(page: Page): Promise<{ codigo: string; lugar: string; fecha: string }> {
  await openAddEventoForm(page);
  const form = page.locator(ADD_EVENTO_FORM_SELECTOR);

  const lugar = uniqueLugarEvento();
  const fecha = "2031-10-10";

  await form.locator("#lugarEvento").fill(lugar);
  await form.locator("#fechaEvento").fill(fecha);
  await selectFirstNonEmptyOptionValue(form.locator("select#idForaneaRegion"));

  const guardarBtn = page.locator(`${ADD_EVENTO_FORM_SELECTOR} button[type="submit"]`);
  await expect(guardarBtn).toBeEnabled({ timeout: 15000 });
  await guardarBtn.click();

  const row = page.locator(`[data-testid="card-row"]`).filter({ has: page.getByRole("heading", { name: lugar }) });
  await expect(row).toBeVisible({ timeout: 45000 });
  const codigo = (await row.getAttribute("data-codigo")) as string;
  expect(codigo).toBeTruthy();

  return { codigo, lugar, fecha };
}

type EditEventoValues = { lugarEvento: string; fechaEvento: string };

async function fillEditEventoFormAndSubmit(page: Page, v: EditEventoValues) {
  await page.waitForSelector(EDIT_EVENTO_FORM_SELECTOR, { timeout: 15000 });
  const form = page.locator(EDIT_EVENTO_FORM_SELECTOR);
  await form.locator("#lugarEvento").fill(v.lugarEvento);
  await form.locator("#fechaEvento").fill(v.fechaEvento);
  const submitBtn = page.locator(`${EDIT_EVENTO_FORM_SELECTOR} button[type="submit"]`);
  await expect(submitBtn).toBeEnabled({ timeout: 15000 });
  await submitBtn.click();
}

async function eliminarEventoDesdeMenu(page: Page, codigo: string) {
  await abrirMenuAccionDeFilaPorCodigo(page, codigo, "eliminar");
  const modal = locatorModalConfirmarEliminacion(page);
  await expect(modal).toBeVisible({ timeout: 10000 });
  await modal.getByRole("button", { name: /^eliminar$/i }).click();
  await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
}

async function cerrarModalInformacionEvento(page: Page) {
  const dialog = locatorModalInformacionEvento(page);
  await expect(dialog).toBeVisible({ timeout: 15000 });
  await dialog.getByRole("button", { name: /^cerrar$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 15000 });
}

test.describe("eventos", () => {
  test.describe.configure({ timeout: 180000 });

  test.beforeAll(() => {
    getE2ECredentials();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, getE2ECredentials());
  });

  test("navegación correcta hacia eventos", async ({ page }) => {
    await expect(page).toHaveURL(/.*PanelControlPage/);
    await goToEventosHome(page);
    await expect(page.getByRole("heading", { name: /^Eventos$/i })).toBeVisible({ timeout: 15000 });
  });

  test.describe("Eventos / formulario agregar", () => {
    test.beforeEach(async ({ page }) => {
      await goToEventosHome(page);
    });

    test("muestra el formulario para agregar evento al hacer clic en agregar", async ({ page }) => {
      await openAddEventoForm(page);
      await expect(page.locator(ADD_EVENTO_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
    });

    test("debería cerrar el formulario al hacer clic en Cancelar", async ({ page }) => {
      await openAddEventoForm(page);
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(ADD_EVENTO_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });
    });

    test("debería crear un evento y aparecer en la lista", async ({ page }) => {
      test.setTimeout(240000);
      page.on("dialog", async (d) => {
        await d.accept();
      });
      const { codigo } = await crearEventoParaTests(page);
      await expect(page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`)).toHaveCount(1);
      await eliminarEventoDesdeMenu(page, codigo);
    });

    test("no debería enviar el formulario de agregar si faltan campos obligatorios (validación HTML5)", async ({ page }) => {
      await openAddEventoForm(page);
      await page.locator(`${ADD_EVENTO_FORM_SELECTOR} #lugarEvento`).fill("");
      await page.locator(`${ADD_EVENTO_FORM_SELECTOR} #fechaEvento`).fill("");
      const guardarBtn = page.locator(`${ADD_EVENTO_FORM_SELECTOR} button[type="submit"]`);
      await guardarBtn.click();
      await expect(page.locator(ADD_EVENTO_FORM_SELECTOR)).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("heading", { name: /[EÉ]xito/i })).not.toBeVisible({ timeout: 3000 });
    });
  });

  test.describe("Eventos / ver, editar y eliminar", () => {
    test.beforeEach(async ({ page }) => {
      page.on("dialog", async (d) => {
        await d.accept();
      });
      await goToEventosHome(page);
    });

    test("debería abrir el modal de ver información desde el menú de la fila", async ({ page }) => {
      test.setTimeout(240000);
      const { codigo, lugar, fecha } = await crearEventoParaTests(page);
      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "ver");
      await expect(locatorModalInformacionEvento(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("informacion-evento-lugar")).toHaveText(lugar);
      await expect(page.getByTestId("informacion-evento-fecha")).toHaveText(fecha);
      await cerrarModalInformacionEvento(page);
      await eliminarEventoDesdeMenu(page, codigo);
    });

    test("debería abrir el modal de ver información al hacer doble clic en la fila", async ({ page }) => {
      test.setTimeout(240000);
      const { codigo } = await crearEventoParaTests(page);
      await page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`).dblclick();
      await expect(locatorModalInformacionEvento(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionEvento(page);
      await eliminarEventoDesdeMenu(page, codigo);
    });

    test("debería abrir el formulario de editar desde el menú de la fila", async ({ page }) => {
      test.setTimeout(240000);
      const { codigo } = await crearEventoParaTests(page);
      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "editar");
      await expect(page.getByRole("form", { name: "formulario para editar evento" })).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.getByRole("form", { name: "formulario para editar evento" })).not.toBeVisible({ timeout: 10000 });
      await eliminarEventoDesdeMenu(page, codigo);
    });

    test("debería guardar edición y reflejar los datos en Ver información", async ({ page }) => {
      test.setTimeout(240000);
      const { codigo } = await crearEventoParaTests(page);
      const editValues: EditEventoValues = {
        lugarEvento: `Evento editado ${Date.now()}`,
        fechaEvento: "2032-11-11",
      };
      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "editar");
      await fillEditEventoFormAndSubmit(page, editValues);

      // La pantalla de Eventos usa React Query + estado local; tras editar, la lista/modal puede quedar con datos viejos.
      // Forzamos recarga para rehidratar desde servidor y evitar flakes.
      await page.reload({ waitUntil: "domcontentloaded" });
      await goToEventosHome(page);

      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "ver");
      await expect(locatorModalInformacionEvento(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("informacion-evento-lugar")).toHaveText(editValues.lugarEvento, { timeout: 15000 });
      await expect(page.getByTestId("informacion-evento-fecha")).toHaveText(editValues.fechaEvento, { timeout: 15000 });
      await cerrarModalInformacionEvento(page);

      await eliminarEventoDesdeMenu(page, codigo);
    });

    test("debería abrir el modal de confirmación al elegir Eliminar en el menú", async ({ page }) => {
      test.setTimeout(240000);
      const { codigo } = await crearEventoParaTests(page);
      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "eliminar");
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal).toBeVisible({ timeout: 10000 });
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });
      await eliminarEventoDesdeMenu(page, codigo);
    });

    test("debería cerrar el modal de confirmación al cancelar y conservar la fila", async ({ page }) => {
      test.setTimeout(240000);
      const { codigo } = await crearEventoParaTests(page);
      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "eliminar");
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal).toBeVisible({ timeout: 10000 });
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });
      await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(1);
      await eliminarEventoDesdeMenu(page, codigo);
    });

    test("debería eliminar al confirmar y quitar la fila de la lista", async ({ page }) => {
      test.setTimeout(240000);
      const { codigo } = await crearEventoParaTests(page);
      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "eliminar");
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal).toBeVisible({ timeout: 10000 });
      await modal.getByRole("button", { name: /^eliminar$/i }).click();
      await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
    });

    test("flujo completo: crear, ver información, editar, verificar y eliminar", async ({ page }) => {
      test.setTimeout(300000);
      const { codigo } = await crearEventoParaTests(page);

      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "ver");
      await expect(locatorModalInformacionEvento(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionEvento(page);

      const editValues: EditEventoValues = {
        lugarEvento: `Evento flujo ${Date.now()}`,
        fechaEvento: "2033-12-12",
      };
      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "editar");
      await fillEditEventoFormAndSubmit(page, editValues);

      await page.reload({ waitUntil: "domcontentloaded" });
      await goToEventosHome(page);

      await abrirMenuAccionDeFilaPorCodigo(page, codigo, "ver");
      await expect(page.getByTestId("informacion-evento-lugar")).toHaveText(editValues.lugarEvento, { timeout: 15000 });
      await cerrarModalInformacionEvento(page);

      await eliminarEventoDesdeMenu(page, codigo);
    });
  });
});

