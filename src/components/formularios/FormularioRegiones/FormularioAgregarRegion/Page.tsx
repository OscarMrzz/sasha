"use client";

import React, { useEffect, useState } from "react";
import RegionesServices from "@/services/regionesServices";
import { perfilDatosAmpleosInterface, regionesInterface } from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import { useRegionAgregadaStore } from "@/store/RegionesStore/regionAgregadaStore";
import { regionesInsertSchema } from "@/models/regiones/regionesSchema";

type Props = {
  refresacar: () => void | Promise<void>;
  onClose: () => void;
  onCreated?: (region: regionesInterface) => void;
  openErrorModal?: (mensaje: string) => void;
  openModalExito?: (mensaje: string) => void;
};

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

export default function FormularioAgregarRegionComponent({
  refresacar,
  onClose,
  onCreated,
  openErrorModal,
  openModalExito,
}: Props) {
  const [formData, setFormData] = useState({
    nombreRegion: "",

    idForaneaFederacion: "",
  });

  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);
  const setUltimaRegion = useRegionAgregadaStore((s) => s.setUltimaRegion);

  useEffect(() => {
    const perfilesServices = new PerfilesServices();
    perfilesServices.getUsuarioLogiado().then((perfil) => {
      if (perfil) setPerfil(perfil);
    });
  }, []);

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
      const regionesServices = new RegionesServices();
      const nuevaRegion: Omit<regionesInterface, "idRegion" | "created_at"> = {
        nombreRegion: formData.nombreRegion,
     
        idForaneaFederacion: perfil.idForaneaFederacion || ""
      };

      const parsed = regionesInsertSchema.safeParse(nuevaRegion);
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => i.message).join("; ");
        openErrorModal ? openErrorModal(msg || "Datos inválidos") : alert(msg || "Datos inválidos");
        setLoading(false);
        return;
      }

      const creada = await regionesServices.create(parsed.data as regionesInterface);
      if (creada?.idRegion != null && creada.idRegion !== "") {
        setUltimaRegion({ codigo: String(creada.idRegion) });
      }

      // Limpiar formulario
      setFormData({
        nombreRegion: "",
        idForaneaFederacion: "",
      });
      if (creada) onCreated?.(creada as regionesInterface);
      openModalExito?.("Región creada exitosamente");
    } catch (error) {
      console.error("❌ Error al crear la region :", error);
      openErrorModal?.("Error al agregar la región");
    } finally {
      setLoading(false);
      await refresacar();
      onClose();
    }
  };
  const onClickCancelar = () => {
    setFormData({
      nombreRegion: "",
      idForaneaFederacion: "",
    });
    onClose();
  };

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Nueva región</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Agregar región</h2>
          <p className="mt-2 text-sm text-white/55">Crea una región dentro de tu federación.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit} aria-label="formulario para agregar region">
            <div>
              <label className={labelClass} htmlFor="nombreRegion">
                Nombre de región <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="nombreRegion"
                name="nombreRegion"
                value={formData.nombreRegion}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Ej. Región Norte"
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
                {loading ? "Guardando…" : "Agregar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


