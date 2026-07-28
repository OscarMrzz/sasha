import { dataBaseSupabase } from "@/lib/supabase";
import { perfilDatosAmpleosInterface, rolInterface } from "@/models";
import PerfilesServices from "./perfilesServices";
import { filtrarRolesPermitidos } from "@/helpers/usuarios/rolesUsuarios";



type Interface = rolInterface;

const tabla = "roles";
const elId = "idRol";

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
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);
        if (error) throw error;
        return data;
    }

    async getPermitidos(rolesExcluidos: readonly string[] = [], soloActivos = true) {
        const roles = await this.get();
        return filtrarRolesPermitidos(roles as rolInterface[], rolesExcluidos, soloActivos);
    }








    async getOne(id: string) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return data;
    }
    async comprobarRolTienePermiso(nombreRol: string) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq("nombreRol", nombreRol)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;

        if (!data) return false;


        return data.estadoRol;
    }


    async create(dataCreate: Interface) {

        if (!this.perfil || !this.perfil.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(dataCreate)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single()

        if (error) throw error;
        return data;
    }

    async update(id: string, dataUpdate: Interface) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(dataUpdate)
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return true;
    }
}
