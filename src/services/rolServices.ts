import { dataBaseSupabase } from "@/lib/supabase";
import { perfilDatosAmpleosInterface, rolInterface } from "@/models";
import { rolInsertSchema, rolUpdateSchema } from "@/models/roles/rolSchema";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";
import PerfilesServices from "./perfilesServices";
import { filtrarRolesPermitidos } from "@/helpers/usuarios/rolesUsuarios";



type Interface = rolInterface;

const tabla = "roles";
const elId = "id_rol";

export default class RolesServices {
    perfil: perfilDatosAmpleosInterface | null = null;
    private perfilInitialized = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initPerfil()
        }
    }

    setPerfil(perfil: perfilDatosAmpleosInterface) {
        this.perfil = perfil;
        this.perfilInitialized = true;
    }

    async initPerfil() {
        if (typeof window === 'undefined') return;

        const perfilCookie = document.cookie.split(';').find(c => c.trim().startsWith('perfilActivo='));
        const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split('=')[1]) : null;
        if (perfilBruto) {
            this.perfil = JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
        }
    }




    // 🔹 Trae regiones con su federación (join automático)





    async get() {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla).select("*")
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);
        if (error) throw error;
        return fromDbMany<rolInterface>(data ?? []);
    }

    async getPermitidos(rolesExcluidos: readonly string[] = [], soloActivos = true) {
        const roles = await this.get();
        return filtrarRolesPermitidos(roles, rolesExcluidos, soloActivos);
    }








    async getOne(id: string) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return fromDb<rolInterface>(data);
    }
    async comprobarRolTienePermiso(nombreRol: string) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq("nombre_rol", nombreRol)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;

        if (!data) return false;


        return fromDb<rolInterface>(data).estadoRol;
    }


    async create(dataCreate: Interface) {

        if (!this.perfil || !this.perfil.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(rolInsertSchema, dataCreate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(parsed as Record<string, unknown>))
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single()

        if (error) throw error;
        return fromDb<rolInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(rolUpdateSchema, dataUpdate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(parsed as Record<string, unknown>))
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<rolInterface>(data);
    }

    async delete(id: string) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return true;
    }
}
