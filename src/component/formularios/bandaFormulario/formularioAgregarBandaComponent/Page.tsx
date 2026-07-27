//Aqui creare un formulario para agregar bandas

"use client";

import React, { useState, useEffect, useRef } from "react";
import BandasServices from "@/lib/services/bandasServices";
import FederacionesServices from "@/lib/services/federacionesServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import RegionesServices from "@/lib/services/regionesServices";
import {
  bandaInterface,
  federacionInterface,
  categoriaInterface,
  regionesInterface,
  perfilDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import Image from "next/image";
import { useBandaAgregadaStore } from "@/Store/BandasStore/bandaAgregadaStore";

type Props = {
  refresacar: () => void;
  onClose: () => void;
};

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

/* 
ESTO SON LOS CAMPOS QUE FALTAN

ciudadBanda: string;
    urlLogoBanda: string;
    fechaFundacionBanda: string;
    fechaInscripcionAFederacion: string;
    ubicacionSedeBanda: string;


*/

const FormularioAgregarBandaComponent = ({ refresacar, onClose }: Props) => {
  const setUltimaBanda = useBandaAgregadaStore((s) => s.setUltimaBanda);
  const [formData, setFormData] = useState({
    nombreBanda: "",
    AliasBanda: "",
    idForaneaCategoria: "",
    idForaneaRegion: "",
    idForaneaFederacion: "",
    urlLogoBanda: "",
    ciudadBanda: "",
    fechaFundacionBanda: "",
    fechaInscripcionAFederacion: "",
    ubicacionSedeBanda: "",
  });

  const [federaciones, setFederaciones] = useState<federacionInterface[]>([]);
  const [categorias, setCategorias] = useState<categoriaInterface[]>([]);
  const [regiones, setRegiones] = useState<regionesInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const perfilCookie = document.cookie.split(";").find((c) => c.trim().startsWith("perfilActivo="));
    const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;
    if (perfilBruto) {
      const perfil: perfilDatosAmpleosInterface = JSON.parse(perfilBruto);
      if (perfil) {
        setPerfil(perfil);
      }
    }
  }, []);

  // Limpiar URL temporal al desmontar el componente
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const cargarDatosIniciales = async () => {
    try {
      const federacionesServices = new FederacionesServices();
      const categoriasServices = new CategoriasServices();
      const regionesServices = new RegionesServices();

      const [federacionesData, categoriasData, regionesData] = await Promise.all([
        federacionesServices.get(),
        categoriasServices.get(),
        regionesServices.get(),
      ]);

      setFederaciones(federacionesData);
      setCategorias(categoriasData);
      setRegiones(regionesData);
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Crear URL temporal para vista previa
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Opcional: También puedes guardar el nombre del archivo en formData
      setFormData((prev) => ({
        ...prev,
        urlLogoBanda: file.name,
      }));
    }
  };

  const bandaServices = useRef(new BandasServices());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let urlLogoParaDB = "";
      // Si hay un archivo seleccionado, subirlo
      if (selectedFile) {
        const resultadoLogo = await bandaServices.current.subirLogoBanda(
          selectedFile,
          `${formData.nombreBanda.replace(/\s+/g, "_")}_logo`
        );
        // Si la subida falla, solo loguea el error pero no detengas el proceso
        if (resultadoLogo) {
          urlLogoParaDB = resultadoLogo;
        } else {
          console.error("Error al subir el logo de la banda.");
        }
      }

      const nuevaBanda: Omit<bandaInterface, "idBanda" | "created_at"> = {
        nombreBanda: formData.nombreBanda,
        AliasBanda: formData.AliasBanda,
        idForaneaCategoria: formData.idForaneaCategoria,
        idForaneaRegion: formData.idForaneaRegion,
        idForaneaFederacion: 
          perfil.roles?.nombreRol === "developer" ? formData.idForaneaFederacion : perfil.idForaneaFederacion || "",
        urlLogoBanda: urlLogoParaDB,
        ciudadBanda: formData.ciudadBanda,
        fechaFundacionBanda: formData.fechaFundacionBanda === "" ? null : formData.fechaFundacionBanda,
        fechaInscripcionAFederacion:
          formData.fechaInscripcionAFederacion === "" ? null : formData.fechaInscripcionAFederacion,
        ubicacionSedeBanda: formData.ubicacionSedeBanda,
      };

      const creada = await bandaServices.current.create(nuevaBanda as bandaInterface);
      if (creada?.idBanda) {
        setUltimaBanda({ codigo: creada.idBanda });
      }
      refresacar();
      onClose();

      // Limpiar formulario
      setFormData({
        nombreBanda: "",
        AliasBanda: "",
        idForaneaCategoria: "",
        idForaneaRegion: "",
        idForaneaFederacion: "",
        urlLogoBanda: "",
        ciudadBanda: "",
        fechaFundacionBanda: "",
        fechaInscripcionAFederacion: "",
        ubicacionSedeBanda: "",
      });

      // Limpiar imagen
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setSelectedFile(null);
    } catch (error) {
      console.error("❌ Error al crear la banda:", error);
      alert("Error al agregar la banda");
    } finally {
      setLoading(false);
    }
  };

  const onClickCancelar = () => {
    setFormData({
      nombreBanda: "",
      AliasBanda: "",
      idForaneaCategoria: "",
      idForaneaRegion: "",
      idForaneaFederacion: "",
      urlLogoBanda: "",
      ciudadBanda: "",
      fechaFundacionBanda: "",
      fechaInscripcionAFederacion: "",
      ubicacionSedeBanda: "",
    });
    onClose();
  };

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Nueva banda</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Agregar banda</h2>
          <p className="mt-2 text-sm text-white/55">Registra una banda dentro de tu federación.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form aria-label="formulario para agregar banda" className="space-y-6" onSubmit={handleSubmit}>
            {perfil.roles?.nombreRol === "developer" && (
              <div>
                <label className={labelClass} htmlFor="idForaneaFederacion">
                  Federación <span className="text-primario">*</span>
                </label>
                <select
                  id="idForaneaFederacion"
                  name="idForaneaFederacion"
                  value={formData.idForaneaFederacion}
                  onChange={handleInputChange}
                  className={inputBaseClass}
                  required
                >
                  <option className="bg-slate-800 text-slate-100" value="">
                    Seleccione una federación
                  </option>
                  {federaciones.map((federacion) => (
                    <option
                      className="bg-slate-800 text-slate-100"
                      key={federacion.idFederacion}
                      value={federacion.idFederacion}
                    >
                      {federacion.nombreFederacion}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelClass} htmlFor="nombreBanda">
                Nombre de la banda <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="nombreBanda"
                name="nombreBanda"
                value={formData.nombreBanda}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Ej. Banda Aurora"
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="AliasBanda">
                Alias
              </label>
              <input
                type="text"
                id="AliasBanda"
                name="AliasBanda"
                value={formData.AliasBanda}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Ej. Aurora"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="idForaneaCategoria">
                Categoría <span className="text-primario">*</span>
              </label>
              <select
                id="idForaneaCategoria"
                name="idForaneaCategoria"
                value={formData.idForaneaCategoria}
                onChange={handleInputChange}
                className={inputBaseClass}
                required
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Seleccione una categoría
                </option>
                {categorias.map((categoria) => (
                  <option className="bg-slate-800 text-slate-100" key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="idForaneaRegion">
                Región <span className="text-primario">*</span>
              </label>
              <select
                id="idForaneaRegion"
                name="idForaneaRegion"
                value={formData.idForaneaRegion}
                onChange={handleInputChange}
                className={inputBaseClass}
                required
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Seleccione una región
                </option>
                {regiones.map((region) => (
                  <option className="bg-slate-800 text-slate-100" key={region.idRegion} value={region.idRegion}>
                    {region.nombreRegion}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="fechaFundacionBanda">
                  Fecha de fundación
                </label>
                <input
                  type="date"
                  id="fechaFundacionBanda"
                  name="fechaFundacionBanda"
                  value={formData.fechaFundacionBanda}
                  onChange={handleInputChange}
                  className={inputBaseClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="fechaInscripcionAFederacion">
                  Fecha de inscripción
                </label>
                <input
                  type="date"
                  id="fechaInscripcionAFederacion"
                  name="fechaInscripcionAFederacion"
                  value={formData.fechaInscripcionAFederacion}
                  onChange={handleInputChange}
                  className={inputBaseClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="ubicacionSedeBanda">
                URL Google Maps de la sede
              </label>
              <input
                type="text"
                id="ubicacionSedeBanda"
                name="ubicacionSedeBanda"
                value={formData.ubicacionSedeBanda}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Ej. https://maps.app.goo.gl/..."
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="urlLogoBanda">
                Logo
              </label>
              <label className="relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/5 transition hover:bg-white/[0.07]">
                <input
                  type="file"
                  id="urlLogoBanda"
                  name="urlLogoBanda"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                {previewUrl ? (
                  <Image fill src={previewUrl} alt="Logo de la banda" className="object-contain p-3" />
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Subir</span>
                )}
              </label>
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
};

export default FormularioAgregarBandaComponent;
