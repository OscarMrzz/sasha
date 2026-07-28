"use client";

import React, { useState, useEffect } from "react";


import {categoriaInterface,  perfilDatosAmpleosInterface,} from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import CategoriasServices from "@/services/categoriaServices";
import { categoriaUpdateSchema } from "@/models/categorias/categoriaSchema";

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

type Props = {
    CategoriaAEditar: categoriaInterface;
  refresacar: () => void;
  onClose: () => void;
  openErrorModal?: (mensaje: string) => void;
  openModalExito?: (mensaje: string) => void;
};


/* 
    idCategoria: string;
    created_at: string;
    nombreCategoria: string;
    detallesCategoria: string;
    idForaneaFederacion: string;


*/
export default  function FormularioEditarCategoriaComponent  ({
  refresacar,
  onClose,
  CategoriaAEditar,
  openErrorModal,
  openModalExito,
}: Props)  {
  const [formData, setFormData] = useState({
    nombreCategoria: "",
      detallesCategoria: "",

    idForaneaFederacion: "",
   
  });

 
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);

  useEffect(()=>{
    const perfilesServices = new PerfilesServices()
  perfilesServices.getUsuarioLogiado().then((perfil) => {
    if (perfil) {
      setPerfil(perfil);
    }
  });
}, []);
  useEffect(() => {

      cargaFormulario(CategoriaAEditar);
   
  }, []);

const cargaFormulario = (categoria: categoriaInterface) => {
    setFormData({
      nombreCategoria: categoria.nombreCategoria,
      detallesCategoria: categoria.detallesCategoria,
      idForaneaFederacion: categoria.idForaneaFederacion,
    });
  };






  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

  

    try {
      const categoriasServices = new CategoriasServices();
      await categoriasServices.initPerfil();
      const nuevaCategoria: Omit<categoriaInterface, "idCategoria" | "created_at"> = {
        nombreCategoria: formData.nombreCategoria,
        detallesCategoria: formData.detallesCategoria,
     
        idForaneaFederacion: perfil.idForaneaFederacion || ""
      };

      const parsed = categoriaUpdateSchema.safeParse(nuevaCategoria);
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => i.message).join("; ");
        openErrorModal ? openErrorModal(msg || "Datos inválidos") : alert(msg || "Datos inválidos");
        setLoading(false);
        return;
      }

      await categoriasServices.update(CategoriaAEditar.idCategoria, parsed.data as categoriaInterface);
      openModalExito?.("Categoría actualizada");


      // Limpiar formulario
      setFormData({
        nombreCategoria: "",
        detallesCategoria: "",
        idForaneaFederacion: "",
      });
    } catch (error) {
      console.error("❌ Error al crear la Categoria:", error);
      openErrorModal?.("Error al editar la categoría");
    } finally {
      setLoading(false);
        refresacar();
    onClose();
    }
  }
  const onClickCancelar=()=>{
      setFormData({
        nombreCategoria: "",
        detallesCategoria: "",
        idForaneaFederacion: "",
      });
    onClose();
  }

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Editar categoría</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Actualizar categoría</h2>
          <p className="mt-2 text-sm text-white/55">Modifica el nombre y los detalles y guarda cambios.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
      <form className="space-y-6" onSubmit={handleSubmit} aria-label="formulario para editar categoria">
        <div>
          <label className={labelClass} htmlFor="nombreCategoria">
            Nombre de categoría <span className="text-primario">*</span>
          </label>
          <input
            type="text"
            id="nombreCategoria"
            name="nombreCategoria"
            value={formData.nombreCategoria}
            onChange={handleInputChange}
            className={inputBaseClass}
            placeholder="Ej. Categoría Juvenil"
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="detallesCategoria">
            Detalles <span className="text-primario">*</span>
          </label>
          <input
            type="text"
            id="detallesCategoria"
            name="detallesCategoria"
            value={formData.detallesCategoria}
            onChange={handleInputChange}
            className={inputBaseClass}
            placeholder="Describe la categoría"
            required
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClickCancelar}
            className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50 disabled:shadow-none"
          >
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
        </div>
      </div>
      </div>
  );
};


