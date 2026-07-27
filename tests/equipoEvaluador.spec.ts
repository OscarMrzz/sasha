/**
 * E2E — módulo Equipo evaluador (Playwright)
 *
 * Flujo principal:
 * - Crear evento (precondición)
 * - Abrir "Información del evento"
 * - Agregar miembro al equipo evaluador
 * - Ver información del miembro (desde menú y/o doble click)
 * - Eliminar miembro (ConfirmDeleteModal)
 * - Limpiar: eliminar evento
 */

import { test, expect, type Page } from "@playwright/test";

const URL_EVENTOS_HOME = /.*eventosHomePage/;
const ADD_EVENTO_FORM_SELECTOR = 'form[aria-label="formulario para agregar evento"]';
const ADD_MIEMBRO_FORM_SELECTOR = 'form[aria-label="formulario para agregar miembro equipo evaluador"]';

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

function locatorModalInformacionEvento(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Información del evento/i }) });
}

function locatorModalInformacionMiembro(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Información del miembro/i }) });
}

function locatorModalConfirmarEliminacion(page: Page) {
  return page.locator("dialog").filter({ has: page.getByRole("heading", { name: /Confirmar eliminación/i }) });
}

async function esperarFilaEstable(page: Page, codigo: string) {
  const row = page.locator(`[data-codigo="${codigo}"][data-testid="card-row"]`);
  await expect.poll(async () => await row.isVisible(), { timeout: 45000 }).toBeTruthy();
}

async function abrirMenuAccionDeFilaPorCodigo(page: Page, codigo: string, accion: "ver" | "editar" | "eliminar") {
  await esperarFilaEstable(page, codigo);
  const row = page.locator(`[data-codigo="${codigo}"]`);
  await row.locator('[data-testid="menu-mas-opciones"]').getByRole("button", { name: /abrir menú/i }).click();
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

function uniqueLugarEvento(): string {
  return `Evento EQ E2E ${Date.now()}`;
}

async function crearEventoParaEquipoEvaluador(page: Page): Promise<{ codigo: string; lugar: string }> {
  await openAddEventoForm(page);
  const form = page.locator(ADD_EVENTO_FORM_SELECTOR);
  const lugar = uniqueLugarEvento();
  await form.locator("#lugarEvento").fill(lugar);
  await form.locator("#fechaEvento").fill("2031-09-09");
  await selectFirstNonEmptyOptionValue(form.locator("select#idForaneaRegion"));
  await form.locator('button[type="submit"]').click();

  const row = page.locator(`[data-testid="card-row"]`).filter({ has: page.getByRole("heading", { name: lugar }) });
  await expect(row).toBeVisible({ timeout: 45000 });
  const codigo = (await row.getAttribute("data-codigo")) as string;
  expect(codigo).toBeTruthy();
  return { codigo, lugar };
}

async function eliminarEventoDesdeMenu(page: Page, codigo: string) {
  await abrirMenuAccionDeFilaPorCodigo(page, codigo, "eliminar");
  const modal = locatorModalConfirmarEliminacion(page);
  await expect(modal).toBeVisible({ timeout: 10000 });
  await modal.getByRole("button", { name: /^eliminar$/i }).click();
  await expect(page.locator(`[data-codigo="${codigo}"]`)).toHaveCount(0, { timeout: 30000 });
}

test.describe("equipo evaluador (dentro de eventos)", () => {
  test.describe.configure({ timeout: 240000, mode: "serial" });

  test.beforeAll(() => {
    getE2ECredentials();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsE2EUser(page, getE2ECredentials());
  });

  async function setupEventoYModal(page: Page): Promise<{ codigoEvento: string; modalEvento: ReturnType<Page["locator"]> }> {
    page.on("dialog", async (d) => {
      await d.accept();
    });
    await goToEventosHome(page);
    const { codigo: codigoEvento } = await crearEventoParaEquipoEvaluador(page);
    await abrirMenuAccionDeFilaPorCodigo(page, codigoEvento, "ver");
    const modalEvento = locatorModalInformacionEvento(page);
    await expect(modalEvento).toBeVisible({ timeout: 15000 });
    return { codigoEvento, modalEvento };
  }

  async function cleanupEvento(page: Page, codigoEvento: string) {
    const modalMiembro = locatorModalInformacionMiembro(page);
    if (await modalMiembro.isVisible().catch(() => false)) {
      try {
        await modalMiembro.getByRole("button", { name: /^cerrar$/i }).click({ timeout: 5000 });
      } catch {
        // fallback: cerrar el top dialog
        await page.keyboard.press("Escape");
      }
      await expect(modalMiembro).toBeHidden({ timeout: 15000 });
    }

    const modalEvento = locatorModalInformacionEvento(page);
    if (await modalEvento.isVisible().catch(() => false)) {
      try {
        await modalEvento.getByRole("button", { name: /^cerrar$/i }).click({ timeout: 5000 });
      } catch {
        await page.keyboard.press("Escape");
      }
      await expect(modalEvento).toBeHidden({ timeout: 15000 });
    }
    await eliminarEventoDesdeMenu(page, codigoEvento);
  }

  async function agregarMiembroDesdeModalEvento(page: Page, modalEvento: ReturnType<Page["locator"]>) {
    await modalEvento.getByRole("button", { name: /^agregar$/i }).click();
    await page.waitForSelector(ADD_MIEMBRO_FORM_SELECTOR, { timeout: 15000 });
    const form = page.locator(ADD_MIEMBRO_FORM_SELECTOR);

    const select = form.locator("select#idForaneaPerfil");
    const firstOption = select.locator('option:not([value=""])').first();
    const idPerfil = await firstOption.getAttribute("value");
    const nombrePerfil = (await firstOption.textContent())?.trim() || "";
    expect(idPerfil).toBeTruthy();
    expect(nombrePerfil).toBeTruthy();

    await select.selectOption(idPerfil as string);
    await form.locator('button[type="submit"]').click();
    await expect(form).not.toBeVisible({ timeout: 15000 });

    const filaMiembro = modalEvento.locator(`[data-testid="card-row"]`).filter({ has: page.getByRole("heading", { name: nombrePerfil }) });
    await expect(filaMiembro).toBeVisible({ timeout: 45000 });
    const codigoMiembro = (await filaMiembro.getAttribute("data-codigo")) as string;
    expect(codigoMiembro).toBeTruthy();

    return { codigoMiembro, nombrePerfil };
  }

  test("muestra equipo evaluador en Información del evento", async ({ page }) => {
    test.setTimeout(240000);
    const { codigoEvento, modalEvento } = await setupEventoYModal(page);
    await expect(modalEvento.getByRole("heading", { name: /Equipo evaluador/i })).toBeVisible({ timeout: 15000 });
    await cleanupEvento(page, codigoEvento);
  });

  test("abre el formulario para agregar miembro", async ({ page }) => {
    test.setTimeout(240000);
    const { codigoEvento, modalEvento } = await setupEventoYModal(page);
    await modalEvento.getByRole("button", { name: /^agregar$/i }).click();
    await page.waitForSelector(ADD_MIEMBRO_FORM_SELECTOR, { timeout: 15000 });
    await expect(page.locator(ADD_MIEMBRO_FORM_SELECTOR)).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /cancelar/i }).click();
    await expect(page.locator(ADD_MIEMBRO_FORM_SELECTOR)).not.toBeVisible({ timeout: 10000 });
    await cleanupEvento(page, codigoEvento);
  });

  test("agrega un miembro y aparece en la lista", async ({ page }) => {
    test.setTimeout(300000);
    const { codigoEvento, modalEvento } = await setupEventoYModal(page);
    const { codigoMiembro } = await agregarMiembroDesdeModalEvento(page, modalEvento);
    await expect(modalEvento.locator(`[data-codigo="${codigoMiembro}"][data-testid="card-row"]`)).toHaveCount(1);
    await cleanupEvento(page, codigoEvento);
  });

  test("permite ver la información del miembro desde el menú", async ({ page }) => {
    test.setTimeout(300000);
    const { codigoEvento, modalEvento } = await setupEventoYModal(page);
    const { codigoMiembro } = await agregarMiembroDesdeModalEvento(page, modalEvento);

    await abrirMenuAccionDeFilaPorCodigo(modalEvento.page(), codigoMiembro, "ver");
    const modalMiembro = locatorModalInformacionMiembro(page);
    await expect(modalMiembro).toBeVisible({ timeout: 15000 });
    await page.keyboard.press("Escape");
    await expect(modalMiembro).toBeHidden({ timeout: 15000 });

    await cleanupEvento(page, codigoEvento);
  });

  test("elimina un miembro desde el menú (confirmación)", async ({ page }) => {
    test.setTimeout(300000);
    const { codigoEvento, modalEvento } = await setupEventoYModal(page);
    const { codigoMiembro } = await agregarMiembroDesdeModalEvento(page, modalEvento);

    await abrirMenuAccionDeFilaPorCodigo(modalEvento.page(), codigoMiembro, "eliminar");
    const modalConfirm = locatorModalConfirmarEliminacion(page);
    await expect(modalConfirm).toBeVisible({ timeout: 10000 });
    await modalConfirm.getByRole("button", { name: /^eliminar$/i }).click();
    await expect(modalConfirm).toBeHidden({ timeout: 15000 });
    await expect(modalEvento.locator(`[data-codigo="${codigoMiembro}"]`)).toHaveCount(0, { timeout: 30000 });

    await cleanupEvento(page, codigoEvento);
  });
});

