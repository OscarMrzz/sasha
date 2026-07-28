"use client";

import SkeletonFormulario from "@/components/Skeletons/skeletonFormularios/SkeletonFormulario";
import { activarRefrescarDataEventos } from "@/features/Eventos/refrescadorDataEventos";
import {
  regionesDatosAmpleosInterface,
  registroEventoDatosAmpleosInterface,
  RegistroEventoInterface,

} from "@/models"; // Update the path as needed

import RegionService from "@/services/regionesServices";
import RegistroEventossServices from "@/services/registroEventosServices";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

type Props = {
  EventoAEditar: registroEventoDatosAmpleosInterface;
  onClose: () => void;
};

export default function FormularioEditarEventoComponet({
 
    EventoAEditar,
  onClose,
}: Props) {
  const dispatch = useDispatch();

  const [listaRegiones, SetlistaRegiones] = useState<regionesDatosAmpleosInterface[]>([]);

  useEffect(() => {
    cargarListaRegiones();

  }, []);

  useEffect(() => {
    CargarFormulario();
  }, []);

  const [formData, setFormData] = useState({
    lugarEvento: "",
    fechaEvento: "",
    idForaneaFederacion: "",
    idForaneaRegion: "",
    estado_evento: "",
    tipo_evento: "regional" as RegistroEventoInterface["tipo_evento"],
  });

  const [loading, setLoading] = useState(false);

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
      const registoEvntoServices = new RegistroEventossServices();

      const nuevoEvento: Omit<
        RegistroEventoInterface,
        "idEvento" | "created_at"
      > = {
        LugarEvento: formData.lugarEvento,
        fechaEvento: formData.fechaEvento,
        idForaneaFederacion: EventoAEditar.idForaneaFederacion,
        idForaneaRegion: formData.idForaneaRegion,
        estado_evento: EventoAEditar.estado_evento,
        tipo_evento: formData.tipo_evento,
        dimensiones_cancha: EventoAEditar.dimensiones_cancha,
        tipo_lugar: EventoAEditar.tipo_lugar,
      };

      await registoEvntoServices.update(EventoAEditar.idEvento,
        nuevoEvento as RegistroEventoInterface
      );

      // Limpiar formulario
      setFormData({
        lugarEvento: "",
        fechaEvento: "",
        idForaneaFederacion: "",
        idForaneaRegion: "",
        estado_evento: "",
        tipo_evento: "regional",
      });
    } catch (error) {
      console.error("❌ Error al editarla Evento:", error);
      alert("Error al agregar la Eventos");
    } finally {
      setLoading(false);

      dispatch(activarRefrescarDataEventos());
      onClose();
    }
  };

  const cargarListaRegiones = async () => {

    try{
        const regionesServices = new RegionService();
        await regionesServices.initPerfil();
        const regiones = await regionesServices.getDatosAmpleos();
        if(regiones){
          SetlistaRegiones(regiones);

        }
       
    
    }
    catch(error){
      console.error("❌ Error cargando la lista de regiones:", error);
    }
  }



  const CargarFormulario = () => {
    setFormData({
        lugarEvento: EventoAEditar.LugarEvento,
        fechaEvento: EventoAEditar.fechaEvento,
        idForaneaFederacion: EventoAEditar.idForaneaFederacion || "",
        idForaneaRegion: EventoAEditar.idForaneaRegion,
        estado_evento: EventoAEditar.estado_evento,
        tipo_evento:
          EventoAEditar.tipo_evento ?? ("regional" as RegistroEventoInterface["tipo_evento"]),
    });
  }
  const onClickCancelar = () => {
    setFormData({
      lugarEvento: "",
      fechaEvento: "",
      idForaneaFederacion: "",
      idForaneaRegion: "",
      estado_evento: "",
      tipo_evento: "regional",
    });
    onClose();
  }
  if (listaRegiones.length === 0) {
    return (
     
          <SkeletonFormulario />
 
    );
  }
  

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Editar evento</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Actualizar evento</h2>
          <p className="mt-2 text-sm text-white/55">Modifica los datos del evento seleccionado.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit} aria-label="formulario para editar evento">
            <div>
              <label className={labelClass} htmlFor="lugarEvento">
                Lugar <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="lugarEvento"
                name="lugarEvento"
                value={formData.lugarEvento}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Ej. Auditorio Municipal"
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="fechaEvento">
                Fecha <span className="text-primario">*</span>
              </label>
              <input
                type="date"
                id="fechaEvento"
                name="fechaEvento"
                value={formData.fechaEvento}
                onChange={handleInputChange}
                className={inputBaseClass}
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="tipo_evento">
                Tipo de evento <span className="text-primario">*</span>
              </label>
              <select
                id="tipo_evento"
                name="tipo_evento"
                value={formData.tipo_evento}
                onChange={handleInputChange}
                className={inputBaseClass}
                required
              >
                <option className="bg-slate-800 text-slate-100" value="regional">
                  Regional
                </option>
                <option className="bg-slate-800 text-slate-100" value="nacional">
                  Nacional
                </option>
                <option className="bg-slate-800 text-slate-100" value="festival">
                  Festival
                </option>
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
                  Selecciona una región
                </option>
                {listaRegiones.map((region) => (
                  <option className="bg-slate-800 text-slate-100" key={region.idRegion} value={region.idRegion}>
                    {region.nombreRegion}
                  </option>
                ))}
              </select>
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
                {loading ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
