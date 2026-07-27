/**
 * E2E — módulo Rúbricas (Playwright)
 *
 * Este spec aplica **la misma batería de 15 tests** (patrón `tests/categorias.spec.ts`)
 * a **3 entidades** dentro del módulo:
 * - Rúbrica (15)
 * - Criterio (15) — anidado dentro del modal de información de la rúbrica
 * - Cumplimiento (15) — anidado dentro del modal de información del criterio
 *
 * Total por navegador: 45 tests.
 *
 * Contratos UI:
 * - Sidebar "Rúbrica" → `/PanelControlPage/rubricaHomePage`
 * - Filas: `data-testid="card-row"`, `data-codigo="<id>"`, menú con testids globales
 * - Formularios: aria-label agregar/editar rubrica, criterio, cumplimiento
 * - Modal confirmar eliminación: heading "Confirmar eliminación"
 */

import { test, expect, type Page } from "@playwright/test";

const URL_RUBRICAS_HOME = /.*rubricaHomePage/;
const ADD_RUBRICA_FORM_SELECTOR = 'form[aria-label="formulario para agregar rubrica"]';
const EDIT_RUBRICA_FORM_SELECTOR = 'form[aria-label="formulario para editar rubrica"]';
const ADD_CRITERIO_FORM_SELECTOR = 'form[aria-label="formulario para agregar criterio"]';
const EDIT_CRITERIO_FORM_SELECTOR = 'form[aria-label="formulario para editar criterio"]';
const ADD_CUMPLIMIENTO_FORM_SELECTOR = 'form[aria-label="formulario para agregar cumplimiento"]';
const EDIT_CUMPLIMIENTO_FORM_SELECTOR = 'form[aria-label="formulario para editar cumplimiento"]';

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

async function goToRubricasHome(page: Page) {
  await page.getByRole("button", { name: /r[úu]brica/i }).click();
  await expect(page).toHaveURL(URL_RUBRICAS_HOME, { timeout: 15000 });
}

function uniqueRubricaName(): string {
  return `Rubrica E2E ${Date.now()}`;
}

function locatorModalInformacionRubrica(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Informaci[oó]n de la r[úu]brica/i }) });
}

function locatorModalInformacionCriterio(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Informaci[oó]n del criterio/i }) });
}

function locatorModalInformacionCumplimiento(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Informaci[oó]n del cumplimiento/i }) });
}

function locatorModalConfirmarEliminacion(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Confirmar eliminación/i }) });
}

async function selectFirstNonEmptyOptionValue(select: ReturnType<Page["locator"]>) {
  const value = await select.locator('option:not([value=""])').first().getAttribute("value");
  expect(value, "El select debería tener al menos una opción no vacía").toBeTruthy();
  await select.selectOption(value as string);
}

function uniqueCriterioName(): string {
  return `Criterio E2E ${Date.now()}`;
}

function uniqueCumplimientoDetalle(): string {
  return `Cumplimiento E2E ${Date.now()}`;
}

async function esperarFilaRubricaEstableEnLista(page: Page, codigo: string) {
  const row = page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`);
  await expect.poll(async () => await row.isVisible(), { timeout: 45000 }).toBeTruthy();
}

async function abrirMenuVerInformacionDeFilaPorCodigo(page: Page, codigo: string) {
  await esperarFilaRubricaEstableEnLista(page, codigo);
  const row = page.locator(`[data-codigo="${codigo}"]`);
  const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
  await menuEnFila.getByRole("button", { name: /abrir menú/i }).click();
  const itemVer = page.getByTestId("menu-mas-opciones-ver");
  await expect(itemVer).toBeVisible({ timeout: 10000 });
  await itemVer.click({ force: true });
}

async function abrirMenuEditarDeFilaPorCodigo(page: Page, codigo: string) {
  await esperarFilaRubricaEstableEnLista(page, codigo);
  const row = page.locator(`[data-codigo="${codigo}"]`);
  const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
  await menuEnFila.getByRole("button", { name: /abrir menú/i }).click();
  const itemEditar = page.getByTestId("menu-mas-opciones-editar");
  await expect(itemEditar).toBeVisible({ timeout: 10000 });
  await itemEditar.click({ force: true });
}

async function abrirMenuEliminarDeFilaPorCodigo(page: Page, codigo: string) {
  await esperarFilaRubricaEstableEnLista(page, codigo);
  const row = page.locator(`[data-codigo="${codigo}"]`);
  const menuEnFila = row.locator('[data-testid="menu-mas-opciones"]');
  await menuEnFila.getByRole("button", { name: /abrir menú/i }).click();
  const itemEliminar = page.getByTestId("menu-mas-opciones-eliminar");
  await expect(itemEliminar).toBeVisible({ timeout: 10000 });
  await itemEliminar.click({ force: true });
}

async function eliminarRubricaDesdeMenu(page: Page, codigo: string) {
  await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
  const modal = locatorModalConfirmarEliminacion(page);
  await expect(modal).toBeVisible({ timeout: 10000 });
  await modal.getByRole("button", { name: /^eliminar$/i }).click();
  await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
}

async function confirmarEliminacion(page: Page) {
  const modal = locatorModalConfirmarEliminacion(page);
  await expect(modal).toBeVisible({ timeout: 10000 });
  await modal.getByRole("button", { name: /^eliminar$/i }).click();
  await expect(modal).toBeHidden({ timeout: 10000 });
}

async function openAddRubricaForm(page: Page) {
  await page.getByRole("button", { name: /^agregar$/i }).click();
  await page.waitForSelector(ADD_RUBRICA_FORM_SELECTOR, { timeout: 15000 });
  await expect(page.getByRole("form", { name: "formulario para agregar rubrica" })).toBeVisible({ timeout: 10000 });
}

async function crearRubricaParaTests(page: Page): Promise<{ nombre: string; codigo: string }> {
  await openAddRubricaForm(page);
  const form = page.locator(ADD_RUBRICA_FORM_SELECTOR);
  const nombre = uniqueRubricaName();

  await form.locator("#nombreRubrica").fill(nombre);
  await form.locator("#versionRubrica").fill(`v${Date.now()}`);
  await form.locator("#datalleRubrica").fill(`Detalle E2E ${Date.now()}`);
  await form.locator("#puntosRubrica").fill("10");
  await selectFirstNonEmptyOptionValue(form.locator("select#idForaneaCategoria"));

  const submit = form.locator('button[type="submit"]');
  await expect(submit).toBeEnabled({ timeout: 15000 });
  await submit.click();

  const row = page.locator(`[data-testid="card-row"]`).filter({ has: page.getByRole("heading", { name: nombre }) });
  await expect(row).toBeVisible({ timeout: 45000 });
  const codigo = (await row.getAttribute("data-codigo")) as string;
  expect(codigo).toBeTruthy();
  return { nombre, codigo };
}

async function abrirInfoRubricaPorCodigo(page: Page, codigo: string) {
  await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
  await expect(locatorModalInformacionRubrica(page)).toBeVisible({ timeout: 15000 });
}

async function cerrarModalInformacionRubrica(page: Page) {
  const dialog = locatorModalInformacionRubrica(page);
  await expect(dialog).toBeVisible({ timeout: 15000 });
  await dialog.getByRole("button", { name: /^cerrar$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 15000 });
}

async function cerrarModalInformacionCriterio(page: Page) {
  const dialog = locatorModalInformacionCriterio(page);
  await expect(dialog).toBeVisible({ timeout: 15000 });
  await dialog.getByRole("button", { name: /^cerrar$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 15000 });
}

async function cerrarModalInformacionCumplimiento(page: Page) {
  const dialog = locatorModalInformacionCumplimiento(page);
  await expect(dialog).toBeVisible({ timeout: 15000 });
  await dialog.getByRole("button", { name: /^cerrar$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 15000 });
}

type EditRubricaValues = { nombreRubrica: string; datalleRubrica: string; versionRubrica: string; puntosRubrica: string };

async function fillEditRubricaFormAndSubmit(page: Page, v: EditRubricaValues) {
  await page.waitForSelector(EDIT_RUBRICA_FORM_SELECTOR, { timeout: 15000 });
  const form = page.locator(EDIT_RUBRICA_FORM_SELECTOR);
  await form.locator("#nombreRubrica").fill(v.nombreRubrica);
  await form.locator("#versionRubrica").fill(v.versionRubrica);
  await form.locator("#datalleRubrica").fill(v.datalleRubrica);
  await form.locator("#puntosRubrica").fill(v.puntosRubrica);
  const submitBtn = page.locator(`${EDIT_RUBRICA_FORM_SELECTOR} button[type="submit"]`);
  await expect(submitBtn).toBeEnabled({ timeout: 15000 });
  await submitBtn.click();
}

async function esperarFilaEnScope(scope: ReturnType<Page["locator"]>, codigo: string) {
  const row = scope.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`);
  await expect.poll(async () => await row.isVisible(), { timeout: 45000 }).toBeTruthy();
}

async function abrirMenuAccionEnScope(scope: ReturnType<Page["locator"]>, codigo: string, accion: "ver" | "editar" | "eliminar") {
  await esperarFilaEnScope(scope, codigo);
  const row = scope.locator(`[data-codigo="${codigo}"]`);
  await row.locator('[data-testid="menu-mas-opciones"]').getByRole("button", { name: /abrir menú/i }).click();
  await scope.page().getByTestId(`menu-mas-opciones-${accion}`).click({ force: true });
}

async function crearCriterioEnModalRubrica(page: Page, nombre?: string): Promise<{ codigo: string; nombre: string }> {
  const modalR = locatorModalInformacionRubrica(page);
  await expect(modalR).toBeVisible({ timeout: 15000 });
  const nombreC = nombre ?? uniqueCriterioName();

  await modalR.getByRole("button", { name: /^agregar$/i }).click();
  await page.waitForSelector(ADD_CRITERIO_FORM_SELECTOR, { timeout: 15000 });

  const form = page.locator(ADD_CRITERIO_FORM_SELECTOR);
  await form.locator("#nombreCriterio").fill(nombreC);
  await form.locator("#detallesCriterio").fill(`Detalle criterio ${Date.now()}`);
  await form.locator("#puntosCriterio").fill("5");
  await form.locator('button[type="submit"]').click();
  await expect(form).not.toBeVisible({ timeout: 15000 });

  const row = modalR.locator(`[data-testid="card-row"]`).filter({ has: page.getByRole("heading", { name: nombreC }) });
  await expect(row).toBeVisible({ timeout: 45000 });
  const codigo = (await row.getAttribute("data-codigo")) as string;
  expect(codigo).toBeTruthy();
  return { codigo, nombre: nombreC };
}

async function crearCumplimientoEnModalCriterio(page: Page, detalle?: string): Promise<{ codigo: string; detalle: string }> {
  const modalC = locatorModalInformacionCriterio(page);
  await expect(modalC).toBeVisible({ timeout: 15000 });
  const det = detalle ?? uniqueCumplimientoDetalle();

  await modalC.getByRole("button", { name: /^agregar$/i }).click();
  await page.waitForSelector(ADD_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });

  const form = page.locator(ADD_CUMPLIMIENTO_FORM_SELECTOR);
  await form.locator("#detalleCumplimiento").fill(det);
  await form.locator("#puntosCumplimiento").fill("3");
  await form.locator('button[type="submit"]').click();
  await expect(form).not.toBeVisible({ timeout: 15000 });

  const row = modalC.locator(`[data-testid="card-row"]`).filter({ hasText: det });
  await expect(row).toBeVisible({ timeout: 45000 });
  const codigo = (await row.getAttribute("data-codigo")) as string;
  expect(codigo).toBeTruthy();
  return { codigo, detalle: det };
}

/** Evita carreras entre workers y el mismo usuario E2E mutando datos a la vez. */
test.describe("rubricas e2e", () => {
  test.describe.configure({ mode: "serial" });

test.describe("rubricas", () => {
  test.describe.configure({ timeout: 120000 });

  test.beforeAll(() => {
    getE2ECredentials();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, getE2ECredentials());
  });

  test("navegación correcta hacia rúbricas", async ({ page }) => {
    await expect(page).toHaveURL(/.*PanelControlPage/);
    await goToRubricasHome(page);
    await expect(page.getByRole("heading", { name: /^R[úu]bricas$/i })).toBeVisible({ timeout: 15000 });
  });

  test.describe("Rúbricas / formulario agregar", () => {
    test.beforeEach(async ({ page }) => {
      await goToRubricasHome(page);
    });

    test("muestra el formulario para agregar rubrica al hacer clic en agregar", async ({ page }) => {
      await openAddRubricaForm(page);
      await expect(page.locator(ADD_RUBRICA_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
    });

    test("debería ocultar el formulario al hacer clic en cancelar", async ({ page }) => {
      await openAddRubricaForm(page);
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(ADD_RUBRICA_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });
    });

    test("debería crear una rubrica y aparecer en la lista", async ({ page }) => {
      test.setTimeout(120000);
      page.on("dialog", async (d) => {
        await d.accept();
      });
      const { codigo } = await crearRubricaParaTests(page);
      await expect(page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`)).toHaveCount(1);
      await eliminarRubricaDesdeMenu(page, codigo);
    });

    test("no debería enviar el formulario de agregar si faltan campos obligatorios (validación HTML5)", async ({ page }) => {
      await openAddRubricaForm(page);
      await page.locator(`${ADD_RUBRICA_FORM_SELECTOR} #nombreRubrica`).fill("");
      await page.locator(`${ADD_RUBRICA_FORM_SELECTOR} #datalleRubrica`).fill("");
      await page.locator(`${ADD_RUBRICA_FORM_SELECTOR} #versionRubrica`).fill("");
      const guardarBtn = page.locator(`${ADD_RUBRICA_FORM_SELECTOR} button[type="submit"]`);
      await guardarBtn.click();
      await expect(page.locator(ADD_RUBRICA_FORM_SELECTOR)).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole("heading", { name: /[EÉ]xito/i })).not.toBeVisible({ timeout: 3000 });
    });

    test("debería mostrar éxito al crear y permitir abrir Ver información desde el menú", async ({ page }) => {
      test.setTimeout(120000);
      page.on("dialog", async (d) => {
        await d.accept();
      });
      const { codigo } = await crearRubricaParaTests(page);
      await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
      await expect(locatorModalInformacionRubrica(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionRubrica(page);
      await eliminarRubricaDesdeMenu(page, codigo);
    });
  });

  test.describe("Rúbricas / formulario editar", () => {
    test.beforeEach(async ({ page }) => {
      page.on("dialog", async (d) => {
        await d.accept();
      });
      await goToRubricasHome(page);
    });

    test("debería cerrar el formulario de editar al hacer clic en Cancelar", async ({ page }) => {
      test.setTimeout(120000);
      const { codigo } = await crearRubricaParaTests(page);
      await abrirMenuEditarDeFilaPorCodigo(page, codigo);
      await expect(page.getByRole("form", { name: "formulario para editar rubrica" })).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.getByRole("form", { name: "formulario para editar rubrica" })).not.toBeVisible({ timeout: 10000 });
      await eliminarRubricaDesdeMenu(page, codigo);
    });
  });

  test.describe("Rúbricas / ver, editar y eliminar", () => {
    test.beforeEach(async ({ page }) => {
      page.on("dialog", async (d) => {
        await d.accept();
      });
      await goToRubricasHome(page);
    });

    test("debería abrir el modal de ver información desde el menú de la fila", async ({ page }) => {
      test.setTimeout(120000);
      const { codigo } = await crearRubricaParaTests(page);
      await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
      await expect(locatorModalInformacionRubrica(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionRubrica(page);
      await eliminarRubricaDesdeMenu(page, codigo);
    });

    test("debería abrir el modal de ver información al hacer doble clic en la fila", async ({ page }) => {
      test.setTimeout(120000);
      const { codigo } = await crearRubricaParaTests(page);
      await page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`).dblclick();
      await expect(locatorModalInformacionRubrica(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionRubrica(page);
      await eliminarRubricaDesdeMenu(page, codigo);
    });

    test("debería abrir el formulario de editar desde el menú de la fila", async ({ page }) => {
      test.setTimeout(120000);
      const { codigo } = await crearRubricaParaTests(page);
      await abrirMenuEditarDeFilaPorCodigo(page, codigo);
      await expect(page.getByRole("form", { name: "formulario para editar rubrica" })).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.getByRole("form", { name: "formulario para editar rubrica" })).not.toBeVisible({ timeout: 10000 });
      await eliminarRubricaDesdeMenu(page, codigo);
    });

    test("debería guardar edición, mostrar éxito y reflejar los datos en Ver información", async ({ page }) => {
      test.setTimeout(120000);
      const { codigo } = await crearRubricaParaTests(page);
      const editValues: EditRubricaValues = {
        nombreRubrica: `Rubrica editada ${Date.now()}`,
        versionRubrica: `v-edit-${Date.now()}`,
        datalleRubrica: `Detalle editado ${Date.now()}`,
        puntosRubrica: "15",
      };
      await abrirMenuEditarDeFilaPorCodigo(page, codigo);
      await fillEditRubricaFormAndSubmit(page, editValues);

      await abrirMenuVerInformacionDeFilaPorCodigo(page, codigo);
      await expect(locatorModalInformacionRubrica(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("informacion-rubrica-nombre")).toHaveText(editValues.nombreRubrica);
      await cerrarModalInformacionRubrica(page);
      await eliminarRubricaDesdeMenu(page, codigo);
    });

    test("debería abrir el modal de confirmación al elegir Eliminar en el menú", async ({ page }) => {
      test.setTimeout(120000);
      const { codigo } = await crearRubricaParaTests(page);
      await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal).toBeVisible({ timeout: 10000 });
      await expect(modal.getByRole("heading", { name: /Confirmar eliminación/i })).toBeVisible({ timeout: 10000 });
      await expect(modal.getByText(/¿Seguro que deseas eliminar/i)).toBeVisible();
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });
      await eliminarRubricaDesdeMenu(page, codigo);
    });

    test("debería cerrar el modal de confirmación al cancelar y conservar la fila", async ({ page }) => {
      test.setTimeout(120000);
      const { codigo } = await crearRubricaParaTests(page);
      await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal).toBeVisible({ timeout: 10000 });
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });
      await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(1);
      await eliminarRubricaDesdeMenu(page, codigo);
    });

    test("debería eliminar al confirmar y quitar la fila de la lista", async ({ page }) => {
      test.setTimeout(120000);
      const { codigo } = await crearRubricaParaTests(page);
      await abrirMenuEliminarDeFilaPorCodigo(page, codigo);
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal).toBeVisible({ timeout: 10000 });
      await modal.getByRole("button", { name: /^eliminar$/i }).click();
      await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
    });

    test("flujo completo: crear rubrica, criterio y cumplimiento; ver, editar, eliminar y limpiar", async ({ page }) => {
      test.setTimeout(300000);
      page.on("dialog", async (d) => {
        await d.accept();
      });

      const nombreCriterio = `Criterio E2E ${Date.now()}`;
      const detalleCumpl = `Cumplimiento E2E ${Date.now()}`;
      const detalleCumplEditado = `Cumplimiento editado ${Date.now()}`;

      const { codigo: codigoR } = await crearRubricaParaTests(page);

      await abrirMenuVerInformacionDeFilaPorCodigo(page, codigoR);
      const modalR = locatorModalInformacionRubrica(page);
      await expect(modalR).toBeVisible({ timeout: 15000 });

      await modalR.getByRole("button", { name: /^agregar$/i }).click();
      await page.waitForSelector(ADD_CRITERIO_FORM_SELECTOR, { timeout: 15000 });
      const formC = page.locator(ADD_CRITERIO_FORM_SELECTOR);
      await formC.locator("#nombreCriterio").fill(nombreCriterio);
      await formC.locator("#detallesCriterio").fill("Detalle criterio E2E");
      await formC.locator("#puntosCriterio").fill("5");
      await formC.locator('button[type="submit"]').click();
      await expect(formC).not.toBeVisible({ timeout: 15000 });

      const rowC = modalR.locator(`[data-testid="card-row"]`).filter({ has: page.getByRole("heading", { name: nombreCriterio }) });
      await expect(rowC).toBeVisible({ timeout: 45000 });
      const codigoC = (await rowC.getAttribute("data-codigo")) as string;

      await abrirMenuAccionEnScope(modalR, codigoC, "ver");
      const modalC = locatorModalInformacionCriterio(page);
      await expect(modalC).toBeVisible({ timeout: 15000 });

      await modalC.getByRole("button", { name: /^agregar$/i }).click();
      await page.waitForSelector(ADD_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });
      const formCu = page.locator(ADD_CUMPLIMIENTO_FORM_SELECTOR);
      await formCu.locator("#detalleCumplimiento").fill(detalleCumpl);
      await formCu.locator("#puntosCumplimiento").fill("3");
      await formCu.locator('button[type="submit"]').click();
      await expect(formCu).not.toBeVisible({ timeout: 15000 });

      const rowCu = modalC.locator(`[data-testid="card-row"]`).filter({ hasText: detalleCumpl });
      await expect(rowCu).toBeVisible({ timeout: 45000 });
      const codigoCu = (await rowCu.getAttribute("data-codigo")) as string;

      await abrirMenuAccionEnScope(modalC, codigoCu, "ver");
      await expect(locatorModalInformacionCumplimiento(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("informacion-cumplimiento-detalle")).toHaveText(detalleCumpl);
      await cerrarModalInformacionCumplimiento(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "editar");
      await page.waitForSelector(EDIT_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });
      const formEditCu = page.locator(EDIT_CUMPLIMIENTO_FORM_SELECTOR);
      await formEditCu.locator("#detalleCumplimiento").fill(detalleCumplEditado);
      await formEditCu.locator('button[type="submit"]').click();
      await expect(formEditCu).not.toBeVisible({ timeout: 15000 });

      await abrirMenuAccionEnScope(modalC, codigoCu, "ver");
      await expect(page.getByTestId("informacion-cumplimiento-detalle")).toHaveText(detalleCumplEditado);
      await cerrarModalInformacionCumplimiento(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await expect(modalC.locator(`[data-codigo="${codigoCu}"]`)).toHaveCount(0, { timeout: 30000 });

      await cerrarModalInformacionCriterio(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "editar");
      await page.waitForSelector(EDIT_CRITERIO_FORM_SELECTOR, { timeout: 15000 });
      const formEditCr = page.locator(EDIT_CRITERIO_FORM_SELECTOR);
      const nombreCriterioEditado = `${nombreCriterio} editado`;
      await formEditCr.locator("#nombreCriterio").fill(nombreCriterioEditado);
      await formEditCr.locator('button[type="submit"]').click();
      await expect(formEditCr).not.toBeVisible({ timeout: 15000 });

      await abrirMenuAccionEnScope(modalR, codigoC, "ver");
      await expect(page.getByTestId("informacion-criterio-nombre")).toHaveText(nombreCriterioEditado);
      await cerrarModalInformacionCriterio(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await expect(modalR.locator(`[data-codigo="${codigoC}"]`)).toHaveCount(0, { timeout: 30000 });

      await cerrarModalInformacionRubrica(page);

      await eliminarRubricaDesdeMenu(page, codigoR);
    });
  });
});

test.describe("criterios (dentro de rúbricas)", () => {
  test.describe.configure({ timeout: 120000 });

  test.beforeAll(() => {
    getE2ECredentials();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, getE2ECredentials());
    await goToRubricasHome(page);
  });

  async function setupRubricaYModal(page: Page): Promise<{ codigoRubrica: string }> {
    page.on("dialog", async (d) => {
      await d.accept();
    });
    const { codigo } = await crearRubricaParaTests(page);
    await abrirInfoRubricaPorCodigo(page, codigo);
    return { codigoRubrica: codigo };
  }

  async function cleanupRubrica(page: Page, codigoRubrica: string) {
    // cerrar modal si quedó abierto
    const modalR = locatorModalInformacionRubrica(page);
    if (await modalR.isVisible().catch(() => false)) {
      await cerrarModalInformacionRubrica(page);
    }
    await eliminarRubricaDesdeMenu(page, codigoRubrica);
  }

  test("navegación correcta hacia criterios (desde info de rúbrica)", async ({ page }) => {
    test.setTimeout(120000);
    const { codigoRubrica } = await setupRubricaYModal(page);
    const modalR = locatorModalInformacionRubrica(page);
    await expect(modalR.getByRole("heading", { name: /Criterios/i })).toBeVisible({ timeout: 15000 });
    await cleanupRubrica(page, codigoRubrica);
  });

  test.describe("Criterios / formulario agregar", () => {
    test("muestra el formulario para agregar criterio al hacer clic en agregar", async ({ page }) => {
      test.setTimeout(120000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);

      await modalR.getByRole("button", { name: /^agregar$/i }).click();
      await page.waitForSelector(ADD_CRITERIO_FORM_SELECTOR, { timeout: 15000 });
      await expect(page.locator(ADD_CRITERIO_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });

      // cerrar y limpiar
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(ADD_CRITERIO_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });
      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería ocultar el formulario al hacer clic en cancelar", async ({ page }) => {
      test.setTimeout(120000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);

      await modalR.getByRole("button", { name: /^agregar$/i }).click();
      await page.waitForSelector(ADD_CRITERIO_FORM_SELECTOR, { timeout: 15000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(ADD_CRITERIO_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });

      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería crear un criterio y aparecer en la lista", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);

      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);
      await expect(modalR.locator(`[data-codigo="${codigoC}"][data-testid="card-row"]`)).toHaveCount(1);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await expect(modalR.locator(`[data-codigo="${codigoC}"]`)).toHaveCount(0, { timeout: 30000 });

      await cleanupRubrica(page, codigoRubrica);
    });

    test("no debería enviar el formulario de agregar si faltan campos obligatorios (validación HTML5)", async ({ page }) => {
      test.setTimeout(120000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      await modalR.getByRole("button", { name: /^agregar$/i }).click();
      await page.waitForSelector(ADD_CRITERIO_FORM_SELECTOR, { timeout: 15000 });

      await page.locator(`${ADD_CRITERIO_FORM_SELECTOR} #nombreCriterio`).fill("");
      await page.locator(`${ADD_CRITERIO_FORM_SELECTOR} #detallesCriterio`).fill("");
      const guardarBtn = page.locator(`${ADD_CRITERIO_FORM_SELECTOR} button[type="submit"]`);
      await guardarBtn.click();
      await expect(page.locator(ADD_CRITERIO_FORM_SELECTOR)).toBeVisible({ timeout: 5000 });

      await page.getByRole("button", { name: /cancelar/i }).click();
      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería permitir abrir Ver información desde el menú", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);

      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);
      await abrirMenuAccionEnScope(modalR, codigoC, "ver");
      await expect(locatorModalInformacionCriterio(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionCriterio(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await cleanupRubrica(page, codigoRubrica);
    });
  });

  test.describe("Criterios / formulario editar", () => {
    test("debería cerrar el formulario de editar al hacer clic en Cancelar", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "editar");
      await page.waitForSelector(EDIT_CRITERIO_FORM_SELECTOR, { timeout: 15000 });
      await expect(page.locator(EDIT_CRITERIO_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(EDIT_CRITERIO_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await cleanupRubrica(page, codigoRubrica);
    });
  });

  test.describe("Criterios / ver, editar y eliminar", () => {
    test("debería abrir el modal de ver información desde el menú de la fila", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "ver");
      await expect(locatorModalInformacionCriterio(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionCriterio(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería abrir el modal de ver información al hacer doble clic en la fila", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      await modalR.locator(`[data-codigo="${codigoC}"][data-testid="card-row"]`).dblclick();
      await expect(locatorModalInformacionCriterio(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionCriterio(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería abrir el formulario de editar desde el menú de la fila", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "editar");
      await expect(page.getByRole("form", { name: "formulario para editar criterio" })).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.getByRole("form", { name: "formulario para editar criterio" })).not.toBeVisible({ timeout: 10000 });

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería guardar edición y reflejar los datos en Ver información", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      const nuevoNombre = `Criterio editado ${Date.now()}`;
      await abrirMenuAccionEnScope(modalR, codigoC, "editar");
      await page.waitForSelector(EDIT_CRITERIO_FORM_SELECTOR, { timeout: 15000 });
      const form = page.locator(EDIT_CRITERIO_FORM_SELECTOR);
      await form.locator("#nombreCriterio").fill(nuevoNombre);
      await form.locator('button[type="submit"]').click();
      await expect(form).not.toBeVisible({ timeout: 15000 });

      await abrirMenuAccionEnScope(modalR, codigoC, "ver");
      await expect(locatorModalInformacionCriterio(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("informacion-criterio-nombre")).toHaveText(nuevoNombre);
      await cerrarModalInformacionCriterio(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería abrir el modal de confirmación al elegir Eliminar en el menú", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal.getByRole("heading", { name: /Confirmar eliminación/i })).toBeVisible({ timeout: 10000 });
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería cerrar el modal de confirmación al cancelar y conservar la fila", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      const modal = locatorModalConfirmarEliminacion(page);
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });
      await expect(modalR.locator(`[data-codigo="${codigoC}"]`)).toHaveCount(1);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await cleanupRubrica(page, codigoRubrica);
    });

    test("debería eliminar al confirmar y quitar la fila de la lista", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await expect(modalR.locator(`[data-codigo="${codigoC}"]`)).toHaveCount(0, { timeout: 30000 });
      await cleanupRubrica(page, codigoRubrica);
    });

    test("flujo completo: crear, ver información, editar, verificar y eliminar", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica } = await setupRubricaYModal(page);
      const modalR = locatorModalInformacionRubrica(page);
      const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "ver");
      await expect(locatorModalInformacionCriterio(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionCriterio(page);

      const nuevoNombre = `Criterio flujo ${Date.now()}`;
      await abrirMenuAccionEnScope(modalR, codigoC, "editar");
      await page.waitForSelector(EDIT_CRITERIO_FORM_SELECTOR, { timeout: 15000 });
      await page.locator(EDIT_CRITERIO_FORM_SELECTOR).locator("#nombreCriterio").fill(nuevoNombre);
      await page.locator(EDIT_CRITERIO_FORM_SELECTOR).locator('button[type="submit"]').click();
      await expect(page.locator(EDIT_CRITERIO_FORM_SELECTOR)).not.toBeVisible({ timeout: 15000 });

      await abrirMenuAccionEnScope(modalR, codigoC, "ver");
      await expect(page.getByTestId("informacion-criterio-nombre")).toHaveText(nuevoNombre);
      await cerrarModalInformacionCriterio(page);

      await abrirMenuAccionEnScope(modalR, codigoC, "eliminar");
      await confirmarEliminacion(page);
      await expect(modalR.locator(`[data-codigo="${codigoC}"]`)).toHaveCount(0, { timeout: 30000 });

      await cleanupRubrica(page, codigoRubrica);
    });
  });
});

test.describe("cumplimientos (dentro de criterios)", () => {
  test.describe.configure({ timeout: 120000 });

  test.beforeAll(() => {
    getE2ECredentials();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, getE2ECredentials());
    await goToRubricasHome(page);
  });

  async function setupRubricaCriterioYModalCriterio(page: Page): Promise<{ codigoRubrica: string; codigoCriterio: string }> {
    page.on("dialog", async (d) => {
      await d.accept();
    });

    const { codigo: codigoR } = await crearRubricaParaTests(page);
    await abrirInfoRubricaPorCodigo(page, codigoR);
    const modalR = locatorModalInformacionRubrica(page);

    const { codigo: codigoC } = await crearCriterioEnModalRubrica(page);
    await abrirMenuAccionEnScope(modalR, codigoC, "ver");
    await expect(locatorModalInformacionCriterio(page)).toBeVisible({ timeout: 15000 });

    return { codigoRubrica: codigoR, codigoCriterio: codigoC };
  }

  async function cleanupTodo(page: Page, codigoRubrica: string, codigoCriterio: string) {
    // intentar cerrar modal de cumplimiento si quedó abierto
    const modalCu = locatorModalInformacionCumplimiento(page);
    if (await modalCu.isVisible().catch(() => false)) {
      await cerrarModalInformacionCumplimiento(page);
    }

    const modalC = locatorModalInformacionCriterio(page);
    if (await modalC.isVisible().catch(() => false)) {
      await cerrarModalInformacionCriterio(page);
    }

    const modalR = locatorModalInformacionRubrica(page);
    if (await modalR.isVisible().catch(() => false)) {
      await abrirMenuAccionEnScope(modalR, codigoCriterio, "eliminar");
      await confirmarEliminacion(page);
      await cerrarModalInformacionRubrica(page);
    }

    await eliminarRubricaDesdeMenu(page, codigoRubrica);
  }

  test("navegación correcta hacia cumplimientos (desde info de criterio)", async ({ page }) => {
    test.setTimeout(180000);
    const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
    const modalC = locatorModalInformacionCriterio(page);
    await expect(modalC.getByRole("heading", { name: /Cumplimientos/i })).toBeVisible({ timeout: 15000 });
    await cleanupTodo(page, codigoRubrica, codigoCriterio);
  });

  test.describe("Cumplimientos / formulario agregar", () => {
    test("muestra el formulario para agregar cumplimiento al hacer clic en agregar", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);

      await modalC.getByRole("button", { name: /^agregar$/i }).click();
      await page.waitForSelector(ADD_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });
      await expect(page.locator(ADD_CUMPLIMIENTO_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(ADD_CUMPLIMIENTO_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });

      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería ocultar el formulario al hacer clic en cancelar", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      await modalC.getByRole("button", { name: /^agregar$/i }).click();
      await page.waitForSelector(ADD_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(ADD_CUMPLIMIENTO_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería crear un cumplimiento y aparecer en la lista", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);
      await expect(modalC.locator(`[data-codigo="${codigoCu}"][data-testid="card-row"]`)).toHaveCount(1);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await expect(modalC.locator(`[data-codigo="${codigoCu}"]`)).toHaveCount(0, { timeout: 30000 });
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("no debería enviar el formulario de agregar si faltan campos obligatorios (validación HTML5)", async ({ page }) => {
      test.setTimeout(180000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      await modalC.getByRole("button", { name: /^agregar$/i }).click();
      await page.waitForSelector(ADD_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });

      await page.locator(`${ADD_CUMPLIMIENTO_FORM_SELECTOR} #detalleCumplimiento`).fill("");
      const guardarBtn = page.locator(`${ADD_CUMPLIMIENTO_FORM_SELECTOR} button[type="submit"]`);
      await guardarBtn.click();
      await expect(page.locator(ADD_CUMPLIMIENTO_FORM_SELECTOR)).toBeVisible({ timeout: 5000 });
      await page.getByRole("button", { name: /cancelar/i }).click();

      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería permitir abrir Ver información desde el menú", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu, detalle } = await crearCumplimientoEnModalCriterio(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "ver");
      await expect(locatorModalInformacionCumplimiento(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("informacion-cumplimiento-detalle")).toHaveText(detalle);
      await cerrarModalInformacionCumplimiento(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });
  });

  test.describe("Cumplimientos / formulario editar", () => {
    test("debería cerrar el formulario de editar al hacer clic en Cancelar", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "editar");
      await page.waitForSelector(EDIT_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });
      await expect(page.locator(EDIT_CUMPLIMIENTO_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.locator(EDIT_CUMPLIMIENTO_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });
  });

  test.describe("Cumplimientos / ver, editar y eliminar", () => {
    test("debería abrir el modal de ver información desde el menú de la fila", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "ver");
      await expect(locatorModalInformacionCumplimiento(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionCumplimiento(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería abrir el modal de ver información al hacer doble clic en la fila", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      await modalC.locator(`[data-codigo="${codigoCu}"][data-testid="card-row"]`).dblclick();
      await expect(locatorModalInformacionCumplimiento(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionCumplimiento(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería abrir el formulario de editar desde el menú de la fila", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "editar");
      await expect(page.getByRole("form", { name: "formulario para editar cumplimiento" })).toBeVisible({ timeout: 10000 });
      await page.getByRole("button", { name: /cancelar/i }).click();
      await expect(page.getByRole("form", { name: "formulario para editar cumplimiento" })).not.toBeVisible({ timeout: 10000 });

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería guardar edición y reflejar los datos en Ver información", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      const nuevoDetalle = `Cumplimiento editado ${Date.now()}`;
      await abrirMenuAccionEnScope(modalC, codigoCu, "editar");
      await page.waitForSelector(EDIT_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });
      const form = page.locator(EDIT_CUMPLIMIENTO_FORM_SELECTOR);
      await form.locator("#detalleCumplimiento").fill(nuevoDetalle);
      await form.locator('button[type="submit"]').click();
      await expect(form).not.toBeVisible({ timeout: 15000 });

      await abrirMenuAccionEnScope(modalC, codigoCu, "ver");
      await expect(locatorModalInformacionCumplimiento(page)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId("informacion-cumplimiento-detalle")).toHaveText(nuevoDetalle);
      await cerrarModalInformacionCumplimiento(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería abrir el modal de confirmación al elegir Eliminar en el menú", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      const modal = locatorModalConfirmarEliminacion(page);
      await expect(modal.getByRole("heading", { name: /Confirmar eliminación/i })).toBeVisible({ timeout: 10000 });
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería cerrar el modal de confirmación al cancelar y conservar la fila", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      const modal = locatorModalConfirmarEliminacion(page);
      await modal.getByRole("button", { name: /^cancelar$/i }).click();
      await expect(modal).toBeHidden({ timeout: 10000 });
      await expect(modalC.locator(`[data-codigo="${codigoCu}"]`)).toHaveCount(1);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("debería eliminar al confirmar y quitar la fila de la lista", async ({ page }) => {
      test.setTimeout(240000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await expect(modalC.locator(`[data-codigo="${codigoCu}"]`)).toHaveCount(0, { timeout: 30000 });
      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });

    test("flujo completo: crear, ver información, editar, verificar y eliminar", async ({ page }) => {
      test.setTimeout(300000);
      const { codigoRubrica, codigoCriterio } = await setupRubricaCriterioYModalCriterio(page);
      const modalC = locatorModalInformacionCriterio(page);
      const { codigo: codigoCu } = await crearCumplimientoEnModalCriterio(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "ver");
      await expect(locatorModalInformacionCumplimiento(page)).toBeVisible({ timeout: 15000 });
      await cerrarModalInformacionCumplimiento(page);

      const nuevoDetalle = `Cumplimiento flujo ${Date.now()}`;
      await abrirMenuAccionEnScope(modalC, codigoCu, "editar");
      await page.waitForSelector(EDIT_CUMPLIMIENTO_FORM_SELECTOR, { timeout: 15000 });
      await page.locator(EDIT_CUMPLIMIENTO_FORM_SELECTOR).locator("#detalleCumplimiento").fill(nuevoDetalle);
      await page.locator(EDIT_CUMPLIMIENTO_FORM_SELECTOR).locator('button[type="submit"]').click();
      await expect(page.locator(EDIT_CUMPLIMIENTO_FORM_SELECTOR)).not.toBeVisible({ timeout: 15000 });

      await abrirMenuAccionEnScope(modalC, codigoCu, "ver");
      await expect(page.getByTestId("informacion-cumplimiento-detalle")).toHaveText(nuevoDetalle);
      await cerrarModalInformacionCumplimiento(page);

      await abrirMenuAccionEnScope(modalC, codigoCu, "eliminar");
      await confirmarEliminacion(page);
      await expect(modalC.locator(`[data-codigo="${codigoCu}"]`)).toHaveCount(0, { timeout: 30000 });

      await cleanupTodo(page, codigoRubrica, codigoCriterio);
    });
  });
});

});
