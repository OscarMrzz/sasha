"use client";

import { activarRefrescarDataPerfiles } from "@/features/Perfil/refrescadorPerfiles";
import { federacionInterface, perfilDatosAmpleosInterface, perfilInterface } from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import FederacionesService from "@/services/federacionesServices";
import FotoPerfilImage from "@/components/FotoPerfil/FotoPerfilImage";
import { CameraIcon } from "@heroicons/react/24/outline";

const datosInicialesFormulario = {
  nombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  alias: "",
  email: "",
  password: "",
  password2: "",
  fechaNacimiento: "",
  sexo: "",
  identidad: "",
  numeroTelefono: "",
  direccion: "",
  permisos: false,
  urlFotoPerfil: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-500 bg-slate-700/50 px-3 text-sm text-gray-100 placeholder:text-gray-500 transition focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400";

type Props = {
  perfilAEditar: perfilDatosAmpleosInterface;
  urlFotoPerfil: string;
  onClose: () => void;
};

function FieldSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-500/60 bg-slate-800/35 p-4 sm:p-5">
      <h3 className="border-b border-slate-600 pb-2 text-sm font-semibold tracking-tight text-gray-50">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function FormularioEditarMiPerfil({ onClose, perfilAEditar, urlFotoPerfil }: Props) {
  const dispatch = useDispatch();
  const [perfilActivo, setPerfilActivo] = useState<perfilDatosAmpleosInterface>();
  const [listFederaciones, setListFederaciones] = useState<federacionInterface[]>([]);
  const [federacionSelecionada, setFederacionSeleccionada] = useState<federacionInterface | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(urlFotoPerfil);
  const perfilesServices = useRef(new PerfilesServices());

  useEffect(() => {
    if (urlFotoPerfil && !selectedFile) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(urlFotoPerfil);
    }
  }, [urlFotoPerfil, selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const federacionesServices = useRef(new FederacionesService());

  const [formData, setFormData] = useState(datosInicialesFormulario);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFederaciones = async () => {
      try {
        const federaciones = await federacionesServices.current.get();
        if (federaciones) {
          setListFederaciones(federaciones);
        }
      } catch (error) {
        console.error("❌ Error cargando las federaciones:", error);
      }
    };

    fetchFederaciones();
  }, []);

  useEffect(() => {
    cargarPerfilActivo();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (listFederaciones.length > 0 && perfilActivo) {
      cargarFormulario();
    }
    // eslint-disable-next-line
  }, [listFederaciones, perfilActivo]);

  const cargarPerfilActivo = async () => {
    try {
      const perfil = await perfilesServices.current.getUsuarioLogiado();
      if (perfil) {
        setPerfilActivo(perfil);
      }
    } catch (error) {
      console.error("❌ Error cargando el perfil activo:", error);
    }
  };

  const cargarFormulario = () => {
    setFormData({
      nombre: perfilAEditar.nombre,
      segundoNombre: perfilAEditar.segundoNombre || "",
      primerApellido: perfilAEditar.primerApellido || "",
      segundoApellido: perfilAEditar.segundoApellido || "",
      alias: perfilAEditar.alias,
      email: "",
      password: "",
      password2: "",
      fechaNacimiento: perfilAEditar.fechaNacimiento || "",
      sexo: perfilAEditar.sexo,
      identidad: perfilAEditar.identidad,
      numeroTelefono: perfilAEditar.numeroTelefono,
      direccion: perfilAEditar.direccion,
      permisos: perfilAEditar.permisos,
      urlFotoPerfil: perfilAEditar.urlFotoPerfil || "",
    });

    if (perfilActivo?.roles?.nombreRol === "developer" && perfilAEditar.idForaneaFederacion) {
      const federacion = listFederaciones.find((f) => f.idFederacion === perfilAEditar.idForaneaFederacion);
      if (federacion) {
        setFederacionSeleccionada(federacion);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name } = target;
    const value =
      (target as HTMLInputElement).type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const userCreadoId = perfilAEditar.idForaneaUser;
    let urlFotoPerfilParaDB = "";
    if (selectedFile && userCreadoId) {
      const resultadoFotoPerfil = await perfilesServices.current.subirFotoPerfil(
        selectedFile,
        `${userCreadoId.replace(/\s+/g, "_")}_foto_perfil`,
      );
      if (resultadoFotoPerfil) {
        urlFotoPerfilParaDB = resultadoFotoPerfil;
      } else {
        console.error("Error al subir la foto de perfil.");
      }
    }
    try {
      if (!perfilActivo || !perfilActivo.idForaneaFederacion) {
        alert("El perfil activo o su federación no está disponible. Intenta de nuevo.");
        setLoading(false);
        return;
      }
      const perfilesServicesUpdate = new PerfilesServices();

      let federacionAAplicar: string;
      if (perfilActivo.roles?.nombreRol === "developer") {
        federacionAAplicar = federacionSelecionada?.idFederacion ?? perfilActivo.idForaneaFederacion;
      } else {
        federacionAAplicar = perfilActivo.idForaneaFederacion;
      }

      const nuevoPerfil: Omit<perfilInterface, "idPerfil" | "created_at" | "codigo"> = {
        nombre: formData.nombre,
        segundoNombre: formData.segundoNombre || "",
        primerApellido: formData.primerApellido || "",
        segundoApellido: formData.segundoApellido || "",
        alias: formData.alias,
        fechaNacimiento: formData.fechaNacimiento || null,
        sexo: formData.sexo,
        idForaneaFederacion: federacionAAplicar,
        identidad: formData.identidad,
        numeroTelefono: formData.numeroTelefono,
        direccion: formData.direccion,
        idForaneaRol: perfilAEditar.idForaneaRol,
        idForaneaUser: perfilAEditar.idForaneaUser,
        idForaneaBanda: perfilAEditar.idForaneaBanda || null,
        permisos: perfilAEditar.permisos,
        urlFotoPerfil: urlFotoPerfilParaDB || perfilAEditar.urlFotoPerfil || "",
        estado: perfilAEditar.estado,
      };
      await perfilesServicesUpdate.update(perfilAEditar.idPerfil, nuevoPerfil as perfilInterface);
    } catch (error) {
      console.error("❌ Error al crear la Evento:", error);
      alert("Error al editar la Eventos");
    } finally {
      setLoading(false);
      setFormData(datosInicialesFormulario);
      dispatch(activarRefrescarDataPerfiles());
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData((prev) => ({
        ...prev,
        urlFotoPerfil: file.name,
      }));
    }
  };

  const onClickCancelar = () => {
    setFormData(datosInicialesFormulario);
    onClose();
  };

  const esDeveloper = perfilActivo?.roles?.nombreRol === "developer";

  if (!perfilActivo) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-4 py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primario border-t-transparent" />
        <span className="text-sm text-gray-400">Cargando datos del perfil…</span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl pb-4">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Editar perfil</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-50">Tus datos</h2>
        <p className="mt-1 text-sm text-gray-400">Actualiza la información visible en tu cuenta.</p>
      </header>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {esDeveloper && (
          <FieldSection title="Federación">
            <div>
              <label className={labelClass} htmlFor="idFederacionEditar">
                Federación
              </label>
              <select
                id="idFederacionEditar"
                value={federacionSelecionada?.idFederacion ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const f = listFederaciones.find((x) => x.idFederacion === id) ?? null;
                  setFederacionSeleccionada(f);
                }}
                className={inputClass}
              >
                <option value="" disabled className="bg-slate-800 text-gray-400">
                  Selecciona federación
                </option>
                {listFederaciones.map((f) => (
                  <option key={f.idFederacion} value={f.idFederacion} className="bg-slate-800 text-gray-100">
                    {f.nombreFederacion}
                  </option>
                ))}
              </select>
            </div>
          </FieldSection>
        )}

        <FieldSection title="Nombre y datos básicos">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className={labelClass} htmlFor="nombre">
                Nombre <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="segundoNombre">
                Segundo nombre
              </label>
              <input
                type="text"
                id="segundoNombre"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Opcional"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="primerApellido">
                Primer apellido
              </label>
              <input
                type="text"
                id="primerApellido"
                name="primerApellido"
                value={formData.primerApellido}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Primer apellido"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="segundoApellido">
                Segundo apellido
              </label>
              <input
                type="text"
                id="segundoApellido"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Opcional"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="alias">
                Alias
              </label>
              <input
                type="text"
                id="alias"
                name="alias"
                value={formData.alias}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Alias o apodo"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="fechaNacimiento">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="sexo">
                Sexo
              </label>
              <select id="sexo" name="sexo" value={formData.sexo} onChange={handleInputChange} className={inputClass}>
                <option value="" disabled className="bg-slate-800 text-gray-400">
                  Selecciona
                </option>
                <option value="Masculino" className="bg-slate-800 text-gray-100">
                  Masculino
                </option>
                <option value="Femenino" className="bg-slate-800 text-gray-100">
                  Femenino
                </option>
              </select>
            </div>
          </div>
        </FieldSection>

        <FieldSection title="Identidad y contacto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="identidad">
                Identidad
              </label>
              <input
                type="text"
                id="identidad"
                name="identidad"
                value={formData.identidad}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Documento de identidad"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="numeroTelefono">
                Teléfono
              </label>
              <input
                type="tel"
                id="numeroTelefono"
                name="numeroTelefono"
                value={formData.numeroTelefono}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Número de contacto"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="direccion">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Dirección completa"
              />
            </div>
          </div>
        </FieldSection>

        <FieldSection title="Foto de perfil">
          <p className="-mt-1 text-xs text-gray-500">Puedes cambiar la imagen; se aplicará al guardar.</p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <label
              htmlFor="urlFotoPerfil"
              className="group relative flex h-36 w-36 cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-500 bg-slate-700/50 ring-2 ring-transparent transition hover:border-primario hover:ring-primario/30"
            >
              <input
                type="file"
                id="urlFotoPerfil"
                name="urlFotoPerfil"
                onChange={handleFileChange}
                className="sr-only"
                accept="image/*"
              />
              <FotoPerfilImage
                src={previewUrl}
                alt="Vista previa de perfil"
                fill
                className="object-cover"
                sizes="144px"
                fallbackIconClassName="h-16 w-16 text-slate-400"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-900/85 py-1.5 text-[11px] font-medium text-primario opacity-0 transition group-hover:opacity-100">
                <CameraIcon className="h-3.5 w-3.5" aria-hidden />
                Elegir foto
              </span>
            </label>
            <p className="max-w-xs text-xs leading-relaxed text-gray-500">
              Formatos de imagen habituales. Tamaño razonable para una carga rápida.
            </p>
          </div>
        </FieldSection>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClickCancelar}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-500 bg-slate-700/50 px-5 text-sm font-semibold text-gray-100 transition hover:border-slate-400 hover:bg-slate-600/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !perfilActivo.idForaneaFederacion}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primario px-6 text-sm font-semibold text-slate-900 shadow-lg shadow-primario/20 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-45"
          >
            {loading ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
