export type EvaluarSessionEtapa = "esperaSiguienteBanda";

export type EvaluarSessionState = {
  idEvento: string;
  updatedAt: number;
  etapa?: EvaluarSessionEtapa;
  ultimaBandaEnCanchaId?: string;
  idRubricaAsignada?: string;
};

export type EvaluarDraftItem = {
  idCriterio: string;
  idCumplimiento: string;
  valor: number;
};

export type EvaluarDraftCookieState = {
  idEvento: string;
  idCategoria: string;
  idRubrica: string;
  idBanda: string;
  comentarios: string;
  evaluaciones: Record<string, EvaluarDraftItem>;
  updatedAt: number;
};

const EVALUAR_SESSION_STORAGE_KEY = "aurora_evaluar_session";
const EVALUAR_SESSION_COOKIE = "aurora_evaluar_session";
const EVALUAR_DRAFT_COOKIE = "aurora_evaluar_draft";
const EVALUAR_DRAFT_STORAGE_KEY = "aurora_evaluar_draft";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

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

export const readEvaluarSession = (): EvaluarSessionState | null => {
  const state =
    parseStorage<Partial<EvaluarSessionState>>(EVALUAR_SESSION_STORAGE_KEY) ??
    parseCookie<Partial<EvaluarSessionState>>(EVALUAR_SESSION_COOKIE);

  if (!state?.idEvento?.trim()) return null;

  return {
    idEvento: state.idEvento,
    updatedAt: typeof state.updatedAt === "number" ? state.updatedAt : Date.now(),
    etapa: state.etapa === "esperaSiguienteBanda" ? state.etapa : undefined,
    ultimaBandaEnCanchaId: state.ultimaBandaEnCanchaId?.trim() || undefined,
    idRubricaAsignada: state.idRubricaAsignada?.trim() || undefined,
  } satisfies EvaluarSessionState;
};

export const setEvaluarSession = (state: EvaluarSessionState) => {
  setStorage(EVALUAR_SESSION_STORAGE_KEY, state);
  setCookie(EVALUAR_SESSION_COOKIE, state);
};

export const deleteEvaluarSession = () => {
  deleteStorage(EVALUAR_SESSION_STORAGE_KEY);
  deleteCookie(EVALUAR_SESSION_COOKIE);
  deleteStorage("aurora_evaluar_wizard");
  deleteCookie("aurora_evaluar_wizard");
};

export const readEvaluarDraftCookie = () => {
  const state =
    parseStorage<Partial<EvaluarDraftCookieState>>(EVALUAR_DRAFT_STORAGE_KEY) ??
    parseCookie<Partial<EvaluarDraftCookieState>>(EVALUAR_DRAFT_COOKIE);
  if (!state?.idEvento || !state.idCategoria || !state.idRubrica || !state.idBanda) return null;

  return {
    idEvento: state.idEvento,
    idCategoria: state.idCategoria,
    idRubrica: state.idRubrica,
    idBanda: state.idBanda,
    comentarios: state.comentarios ?? "",
    evaluaciones: state.evaluaciones ?? {},
    updatedAt: typeof state.updatedAt === "number" ? state.updatedAt : Date.now(),
  } satisfies EvaluarDraftCookieState;
};

export const setEvaluarDraftCookie = (state: EvaluarDraftCookieState) => {
  setStorage(EVALUAR_DRAFT_STORAGE_KEY, state);
  deleteCookie(EVALUAR_DRAFT_COOKIE);
};

export const deleteEvaluarDraftCookie = () => {
  deleteStorage(EVALUAR_DRAFT_STORAGE_KEY);
  deleteCookie(EVALUAR_DRAFT_COOKIE);
};
