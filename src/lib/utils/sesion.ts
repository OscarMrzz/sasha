import { deleteCopasWizardCookie } from "@/lib/copasWizardPersistence";
import { deleteEvaluarDraftCookie, deleteEvaluarSession } from "@/lib/evaluarPersistence";
import { deleteFiscalWizardCookie } from "@/lib/fiscalPersistence";
import { dataBaseSupabase } from "@/lib/supabase";

const SESSION_COOKIES = [
    "rolPerfil",
    "perfilActivo",
    "aurora_evaluar_session",
    "aurora_evaluar_draft",
    "aurora_evaluar_wizard",
    "aurora_fiscal_wizard",
    "aurora_copas_wizard",
] as const;

const SESSION_STORAGE_KEYS = [
    "EventoSelecionado",
    "CategoriaSelecionada",
    "perfilActivo",
    "aurora_evaluar_session",
    "aurora_evaluar_draft",
    "aurora_evaluar_wizard",
    "aurora_fiscal_wizard",
    "aurora_copas_wizard",
] as const;

const deleteCookie = (name: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const limpiarCookiesSesion = () => {
    for (const name of SESSION_COOKIES) {
        deleteCookie(name);
    }
};

const limpiarLocalStorageSesion = () => {
    if (typeof window === "undefined") return;

    try {
        for (const key of SESSION_STORAGE_KEYS) {
            window.localStorage.removeItem(key);
        }

        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            if (key?.startsWith("aurora_") || key?.startsWith("sb-")) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch {
        // ignorar errores de storage (modo privado, etc.)
    }
};

const limpiarPersistenciaUsuario = () => {
    deleteEvaluarSession();
    deleteEvaluarDraftCookie();
    deleteFiscalWizardCookie();
    deleteCopasWizardCookie();
    limpiarCookiesSesion();
    limpiarLocalStorageSesion();
};

/**
 * Limpia cookies de sesión, storage local y cierra la sesión de Supabase.
 * No redirige; el caller decide a dónde mandar al usuario.
 */
export async function limpiarSesionLocal(): Promise<void> {
    limpiarPersistenciaUsuario();

    try {
        await dataBaseSupabase.auth.signOut();
    } catch {
        // Si ya no hay sesión, signOut puede fallar; no bloqueamos la limpieza.
    }

    limpiarPersistenciaUsuario();
}

/**
 * Limpia la sesión y redirige a la página de inicio de sesión.
 * Solo debe llamarse desde el cliente (browser).
 */
export async function cerrarSesionYLimpiar(): Promise<void> {
    await limpiarSesionLocal();
    if (typeof window !== "undefined") {
        window.location.href = "/authPage/SignInPage";
    }
}
