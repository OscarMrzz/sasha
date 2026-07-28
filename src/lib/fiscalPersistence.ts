export type FiscalWizardCampo = "evento" | "categoria" | "resultados" | "";

export type FiscalWizardCookieState = {
  idEvento?: string;
  idCategoria?: string;
  campoSeleccionadoActual: FiscalWizardCampo;
  campoSelecionadoAnterior: FiscalWizardCampo;
  enSalaEspera?: boolean;
  updatedAt: number;
};

const FISCAL_WIZARD_COOKIE = "sasha_fiscal_wizard";
const FISCAL_WIZARD_STORAGE_KEY = "sasha_fiscal_wizard";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const CAMPOS_VALIDOS: FiscalWizardCampo[] = ["evento", "categoria", "resultados", ""];

const isBrowser = () => typeof document !== "undefined";

const getCookie = (name: string) => {
  if (!isBrowser()) return null;

  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
};

const setCookie = (name: string, value: unknown) => {
  if (!isBrowser()) return;

  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (!isBrowser()) return;

  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
};

const parseCookie = <T>(name: string): T | null => {
  const value = getCookie(name);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    deleteCookie(name);
    return null;
  }
};

const parseStorage = <T>(name: string): T | null => {
  if (!isBrowser()) return null;

  try {
    const value = window.localStorage.getItem(name);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    window.localStorage.removeItem(name);
    return null;
  }
};

const setStorage = (name: string, value: unknown) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(name, JSON.stringify(value));
};

const deleteStorage = (name: string) => {
  if (!isBrowser()) return;

  window.localStorage.removeItem(name);
};

const esCampoValido = (campo: unknown): campo is FiscalWizardCampo =>
  typeof campo === "string" && CAMPOS_VALIDOS.includes(campo as FiscalWizardCampo);

export const readFiscalWizardCookie = () => {
  const state =
    parseStorage<Partial<FiscalWizardCookieState>>(FISCAL_WIZARD_STORAGE_KEY) ??
    parseCookie<Partial<FiscalWizardCookieState>>(FISCAL_WIZARD_COOKIE);
  if (!state) return null;

  if (!esCampoValido(state.campoSeleccionadoActual) || !esCampoValido(state.campoSelecionadoAnterior)) {
    deleteFiscalWizardCookie();
    return null;
  }

  return {
    idEvento: state.idEvento,
    idCategoria: state.idCategoria,
    campoSeleccionadoActual: state.campoSeleccionadoActual,
    campoSelecionadoAnterior: state.campoSelecionadoAnterior,
    enSalaEspera: state.enSalaEspera === true,
    updatedAt: typeof state.updatedAt === "number" ? state.updatedAt : Date.now(),
  } satisfies FiscalWizardCookieState;
};

export const setFiscalWizardCookie = (state: FiscalWizardCookieState) => {
  setStorage(FISCAL_WIZARD_STORAGE_KEY, state);
  setCookie(FISCAL_WIZARD_COOKIE, state);
};

export const deleteFiscalWizardCookie = () => {
  deleteStorage(FISCAL_WIZARD_STORAGE_KEY);
  deleteCookie(FISCAL_WIZARD_COOKIE);
};
