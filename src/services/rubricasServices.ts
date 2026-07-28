import { dataBaseSupabase } from "@/lib/supabase";
import { rubricaDatosAmpleosInterface, rubricaInterface, perfilDatosAmpleosInterface } from "@/models";
import { rubricaInsertSchema, rubricaUpdateSchema } from "@/models/rubricas/rubricaSchema";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";
import PerfilesServices from "./perfilesServices";

type Interface = rubricaInterface;

const tabla = "rubricas";
const elId = "id_rubrica";

export function mensajeRubricaDuplicada(
    nombreRubrica: string,
    nombreCategoria: string,
    versionRubrica: string,
    contexto: "importar" | "guardar" = "guardar"
): string {
    const accion =
        contexto === "importar"
            ? "No se puede importar el paquete."
            : "No se puede guardar la rúbrica.";

    return `Ya existe una rúbrica con el nombre "${nombreRubrica}", categoría "${nombreCategoria}" y versión "${versionRubrica}". ${accion}`;
}

export default class RubricasServices {

      perfil: perfilDatosAmpleosInterface | null = null;
      private perfilInitialized = false;
      
    constructor() {
        if (typeof window !== 'undefined') {
            this.initPerfil()
        }
    }
    
    async initPerfil() {
        if (typeof window === 'undefined') return;
        
        const perfilCookie = document.cookie.split(';').find(c => c.trim().startsWith('perfilActivo='));
        const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split('=')[1]) : null;
        if (perfilBruto) {
            this.perfil = JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
        }
        this.perfilInitialized = true;
    }

    async getDatosAmpleos(): Promise<rubricaDatosAmpleosInterface[]> {
        try {
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(`
                    *,
                    federaciones(*),
                    categorias(*)
                `).eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)

            if (error) {
                console.error("❌ Error obteniendo regiones con federaciones:", error);
                throw error;
            }

            return fromDbMany<rubricaDatosAmpleosInterface>(data ?? []);
        } catch (error) {
            console.error("❌ Error general en getDatosAmpleos:", error);
            throw error;
        }
    }
    async getPorCategoria(idCategoria: string): Promise<rubricaDatosAmpleosInterface[]> {
        try {
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(`
                    *,
                    federaciones(*),
                    categorias(*)
                `) .eq("id_foranea_categoria", idCategoria).eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)

            if (error) {
                console.error("❌ Error obteniendo regiones con federaciones:", error);
                throw error;
            }

            return fromDbMany<rubricaDatosAmpleosInterface>(data ?? []);
        } catch (error) {
            console.error("❌ Error general en getDatosAmpleos:", error);
            throw error;
        }
    }

    async get() {
        const { data, error } = await dataBaseSupabase.from(tabla).select("*").eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)
        if (error) throw error;
        return fromDbMany<rubricaInterface>(data ?? []);
    }

    async getOne(id: string) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id).eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)
            .single();

        if (error) throw error;
        return fromDb<rubricaInterface>(data);
    }

    async existeRubricaDuplicada(
        nombreRubrica: string,
        idForaneaCategoria: string,
        versionRubrica: string,
        excluirIdRubrica?: string
    ): Promise<boolean> {
        await this.initPerfil();

        const rubricas = await this.getPorCategoria(idForaneaCategoria);

        return rubricas.some(
            (rubrica) =>
                rubrica.nombreRubrica === nombreRubrica &&
                rubrica.versionRubrica === versionRubrica &&
                (!excluirIdRubrica || rubrica.idRubrica !== excluirIdRubrica)
        );
    }

    async validarRubricaNoDuplicada(
        nombreRubrica: string,
        idForaneaCategoria: string,
        versionRubrica: string,
        opciones: {
            excluirIdRubrica?: string;
            nombreCategoria?: string;
            contexto?: "importar" | "guardar";
        } = {}
    ): Promise<void> {
        await this.initPerfil();

        const rubricas = await this.getPorCategoria(idForaneaCategoria);
        const duplicada = rubricas.find(
            (rubrica) =>
                rubrica.nombreRubrica === nombreRubrica &&
                rubrica.versionRubrica === versionRubrica &&
                (!opciones.excluirIdRubrica ||
                    rubrica.idRubrica !== opciones.excluirIdRubrica)
        );

        if (!duplicada) return;

        const nombreCategoria =
            opciones.nombreCategoria ??
            duplicada.categorias?.nombreCategoria ??
            "seleccionada";

        throw new Error(
            mensajeRubricaDuplicada(
                nombreRubrica,
                nombreCategoria,
                versionRubrica,
                opciones.contexto ?? "guardar"
            )
        );
    }

    async create(dataCreate: Interface) {
        await this.initPerfil();
        await this.validarRubricaNoDuplicada(
            dataCreate.nombreRubrica,
            dataCreate.idForaneaCategoria,
            dataCreate.versionRubrica
        );

        const parsed = parseCamel(rubricaInsertSchema, dataCreate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(parsed as Record<string, unknown>))
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<rubricaInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
        await this.initPerfil();
        await this.validarRubricaNoDuplicada(
            dataUpdate.nombreRubrica,
            dataUpdate.idForaneaCategoria,
            dataUpdate.versionRubrica,
            { excluirIdRubrica: id }
        );

        const parsed = parseCamel(rubricaUpdateSchema, dataUpdate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(parsed as Record<string, unknown>))
            .eq(elId, id)
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<rubricaInterface>(data);
    }

    async delete(id: string) {
        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq(elId, id);

        if (error) throw error;
        return true;
    }
}
