import { dataBaseSupabase } from "@/lib/supabase";
import { federacionInterface, perfilDatosAmpleosInterface} from "@/models";
import { federacionInsertSchema, federacionUpdateSchema } from "@/models/federaciones/federacionSchema";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";
import PerfilesServices from "./perfilesServices";

type Interface = federacionInterface;

const tabla = "federaciones";
const Elid = "id_federacion";

export default class FederacionesService {
     perfil: perfilDatosAmpleosInterface | null = null;
     
      
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
    }
 

    async get() {
        const { data, error } = await dataBaseSupabase.from(tabla).select("*")
        if (error) throw error;
        return fromDbMany<federacionInterface>(data ?? []);
    }

    async getOne(id: string) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(Elid, id)
            
            .single();

        if (error) throw error;
        return fromDb<federacionInterface>(data);
    }

    async create(dataCreate: Interface) {
        const parsed = parseCamel(federacionInsertSchema, dataCreate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(parsed as Record<string, unknown>))
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<federacionInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
        const parsed = parseCamel(federacionUpdateSchema, dataUpdate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(parsed as Record<string, unknown>))
            .eq(Elid, id)
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<federacionInterface>(data);
    }

    async delete(id: string) {
        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq(Elid, id);

        if (error) throw error;
        return true;
    }
}
