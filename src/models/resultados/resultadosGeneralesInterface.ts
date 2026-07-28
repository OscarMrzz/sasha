import type { RegistroEventoInterface } from "../eventos/RegistroEventoInterface";
import type { bandaInterface } from "../bandas/bandaInterface";
import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { regionesInterface } from "../regiones/regionesInterface";

export interface resultadosGeneralesInterface{
    banda: bandaInterface;
    evento: RegistroEventoInterface;
    categoria: categoriaInterface;
    region: regionesInterface;
    totalPuntos: number;
}
