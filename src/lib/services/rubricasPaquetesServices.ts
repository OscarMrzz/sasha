import {
  categoriaInterface,
  criterioEvaluacionInterface,
  cumplimientosInterface,
  jenniePaqueteInterface,
  perfilDatosAmpleosInterface,
  rubricaInterface,
} from "@/interfaces/interfaces";
import CriteriosServices from "./criteriosServices";
import cumplimientossServices from "./cumplimientosServices";
import RubricasServices from "./rubricasServices";

export interface ResolverCategoriaPaqueteResult {
  idCategoria: string | null;
  advertencia?: string;
}

export default class RubricasPaquetesServices {
  perfil: perfilDatosAmpleosInterface | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initPerfil();
    }
  }

  async initPerfil() {
    if (typeof window === "undefined") return;

    const perfilCookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("perfilActivo="));
    const perfilBruto = perfilCookie
      ? decodeURIComponent(perfilCookie.split("=")[1])
      : null;
    if (perfilBruto) {
      this.perfil = JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
    }
  }

  esArchivoJennieValido(nombreArchivo: string): boolean {
    const nombre = nombreArchivo.toLowerCase();
    return nombre.endsWith(".jennie") || nombre.endsWith(".jennie.json");
  }

  async leerArchivoJennie(file: File): Promise<jenniePaqueteInterface> {
    if (!this.esArchivoJennieValido(file.name)) {
      throw new Error("Solo se aceptan archivos .jennie o .jennie.json");
    }

    const texto = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(texto);
    } catch {
      throw new Error("El archivo no contiene JSON válido");
    }

    return this.validarPaquete(parsed);
  }

  validarPaquete(data: unknown): jenniePaqueteInterface {
    if (!data || typeof data !== "object") {
      throw new Error("Formato de paquete inválido");
    }

    const paquete = data as Record<string, unknown>;

    if (paquete.schemaVersion !== 1) {
      throw new Error(
        `Versión de esquema no soportada: ${String(paquete.schemaVersion)}`
      );
    }

    if (!paquete.rubrica || typeof paquete.rubrica !== "object") {
      throw new Error("El paquete no incluye una rúbrica válida");
    }

    if (!Array.isArray(paquete.criterios)) {
      throw new Error("El paquete no incluye criterios válidos");
    }

    const rubrica = paquete.rubrica as Record<string, unknown>;
    if (
      typeof rubrica.nombreRubrica !== "string" ||
      typeof rubrica.versionRubrica !== "string" ||
      typeof rubrica.idForaneaCategoria !== "string"
    ) {
      throw new Error("La rúbrica del paquete tiene campos incompletos");
    }

    return paquete as unknown as jenniePaqueteInterface;
  }

  resolverCategoriaPaquete(
    nombreEnPaquete: string,
    categorias: categoriaInterface[]
  ): ResolverCategoriaPaqueteResult {
    const categoria = categorias.find(
      (c) => c.nombreCategoria === nombreEnPaquete
    );

    if (categoria) {
      return { idCategoria: categoria.idCategoria };
    }

    return {
      idCategoria: null,
      advertencia: `La categoría de este paquete es ${nombreEnPaquete} pero ninguna categoría del sistema corresponde, seleccione otra.`,
    };
  }

  async existeRubricaDuplicada(
    nombreRubrica: string,
    idCategoriaDestino: string,
    versionRubrica: string,
    excluirIdRubrica?: string
  ): Promise<boolean> {
    const rubricasServices = new RubricasServices();
    await rubricasServices.initPerfil();

    return rubricasServices.existeRubricaDuplicada(
      nombreRubrica,
      idCategoriaDestino,
      versionRubrica,
      excluirIdRubrica
    );
  }

  async validarPaqueteNoDuplicado(
    paquete: jenniePaqueteInterface,
    idCategoriaDestino: string,
    categorias: categoriaInterface[] = []
  ): Promise<void> {
    const rubricasServices = new RubricasServices();
    await rubricasServices.initPerfil();

    const nombreCategoria =
      categorias.find((c) => c.idCategoria === idCategoriaDestino)
        ?.nombreCategoria ?? "seleccionada";

    await rubricasServices.validarRubricaNoDuplicada(
      paquete.rubrica.nombreRubrica,
      idCategoriaDestino,
      paquete.rubrica.versionRubrica,
      { nombreCategoria, contexto: "importar" }
    );
  }

  async agregarPaquete(
    paquete: jenniePaqueteInterface,
    idCategoriaDestino: string,
    categorias: categoriaInterface[] = []
  ): Promise<void> {
    await this.initPerfil();

    if (!this.perfil?.idForaneaFederacion) {
      throw new Error("No hay federación en el perfil del usuario.");
    }

    if (!idCategoriaDestino?.trim()) {
      throw new Error("Debe seleccionar una categoría.");
    }

    await this.validarPaqueteNoDuplicado(
      paquete,
      idCategoriaDestino,
      categorias
    );

    const rubricasServices = new RubricasServices();
    await rubricasServices.initPerfil();

    const criteriosServices = new CriteriosServices();
    await criteriosServices.initPerfil();

    const cumplimientosServices = new cumplimientossServices();
    await cumplimientosServices.initPerfil();

    const idRubrica = crypto.randomUUID();

    const nuevaRubrica: rubricaInterface = {
      idRubrica,
      created_at: new Date().toISOString(),
      nombreRubrica: paquete.rubrica.nombreRubrica,
      datalleRubrica: paquete.rubrica.datalleRubrica ?? "",
      puntosRubrica: paquete.rubrica.puntosRubrica,
      idForaneaCategoria: idCategoriaDestino,
      idForaneaFederacion: this.perfil.idForaneaFederacion,
      versionRubrica: paquete.rubrica.versionRubrica,
    };

    await rubricasServices.create(nuevaRubrica);

    for (const criterioPaquete of paquete.criterios) {
      const idCriterio = crypto.randomUUID();

      const nuevoCriterio: criterioEvaluacionInterface = {
        idCriterio,
        created_at: new Date().toISOString(),
        nombreCriterio: criterioPaquete.nombreCriterio,
        detallesCriterio: criterioPaquete.detallesCriterio ?? "",
        puntosCriterio: criterioPaquete.puntosCriterio,
        idForaneaRubrica: idRubrica,
      };

      await criteriosServices.create(nuevoCriterio);

      for (const cumplimientoPaquete of criterioPaquete.cumplimientos ?? []) {
        const nuevoCumplimiento: cumplimientosInterface = {
          idCumplimiento: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          detalleCumplimiento: cumplimientoPaquete.detalleCumplimiento,
          puntosCumplimiento: cumplimientoPaquete.puntosCumplimiento,
          idForaneaCriterio: idCriterio,
        };

        await cumplimientosServices.create(nuevoCumplimiento);
      }
    }
  }
}
