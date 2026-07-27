export type CopasWizardCampo = "evento" | "categoria" | "banda" | "copa" | "resumen" | "";

export type CopasWizardCookieState = {
  idEvento?: string;
  idCategoria?: string;
  idBanda?: string;
  campoSeleccionadoActual: CopasWizardCampo;
  campoSelecionadoAnterior: CopasWizardCampo;
  updatedAt: number;
};

const STORAGE_KEY = "aurora_copas_wizard";
const COOKIE_NAME = "aurora_copas_wizard";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const CAMPOS_VALIDOS: CopasWizardCampo[] = [
  "evento",
  "categoria",
  "banda",
  "copa",
  "resumen",
  "",
];

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

const esCampoValido = (campo: unknown): campo is CopasWizardCampo =>
  typeof campo === "string" && CAMPOS_VALIDOS.includes(campo as CopasWizardCampo);

export const readCopasWizardCookie = (): CopasWizardCookieState | null => {
  const state =
    parseStorage<Partial<CopasWizardCookieState>>(STORAGE_KEY) ??
    parseCookie<Partial<CopasWizardCookieState>>(COOKIE_NAME);
  if (!state) return null;

  if (
    !esCampoValido(state.campoSeleccionadoActual) ||
    !esCampoValido(state.campoSelecionadoAnterior)
  ) {
    deleteCopasWizardCookie();
    return null;
  }

  return {
    idEvento: state.idEvento,
    idCategoria: state.idCategoria,
    idBanda: state.idBanda,
    campoSeleccionadoActual: state.campoSeleccionadoActual,
    campoSelecionadoAnterior: state.campoSelecionadoAnterior,
    updatedAt: typeof state.updatedAt === "number" ? state.updatedAt : Date.now(),
  };
};

export const setCopasWizardCookie = (state: CopasWizardCookieState) => {
  setStorage(STORAGE_KEY, state);
  setCookie(COOKIE_NAME, state);
};

export const deleteCopasWizardCookie = () => {
  deleteStorage(STORAGE_KEY);
  deleteCookie(COOKIE_NAME);
};
