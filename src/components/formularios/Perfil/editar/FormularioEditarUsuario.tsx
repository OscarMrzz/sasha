"use client";

import { activarRefrescarDataPerfiles } from "@/features/Perfil/refrescadorPerfiles";
import {
  bandaInterface,
  federacionInterface,
  perfilDatosAmpleosInterface,
  perfilInterface,
  rolInterface,
} from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import { shouldUseUnoptimizedImageForSupabaseStorage } from "@/lib/supabaseStorageImage";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import FederacionesService from "@/services/federacionesServices";
import BandasServices from "@/services/bandasServices";
import RolesServices from "@/services/rolServices";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/16/solid";
import { ComboBoxBandas } from "@/components/ComboBox/ComboBoxBandas";
import { ComboBoxRoles } from "@/components/ComboBox/ComboBoxRoles";
import {
  esGestorUsuariosFederacion,
  esRolRestringido,
  rolRequiereVinculoBanda,
} from "@/helpers/usuarios/rolesUsuarios";

const datosInicialesFormulario = {
  nombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  alias: "",
  email: "",
  password: "",
  password2: "",
  rolUsuario: "",
  fechaNacimiento: "",
  sexo: "",

  identidad: "",
  numeroTelefono: "",
  direccion: "",
  idForaneaBanda: "",
  permisos: false,
  urlFotoPerfil: "",

};

type Props = {
  perfilAEditar: perfilDatosAmpleosInterface;
  urlFotoPerfil: string;
  onClose: () => void;
  openModalExito: (mensaje: string) => void;
  rolesExcluidos?: readonly string[];
};

const TOTAL_STEPS = 3;

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";
const SIN_ROLES_EXCLUIDOS: readonly string[] = [];

export default function FormularioEditarUsuario({
  onClose,
  perfilAEditar,
  urlFotoPerfil,
  openModalExito,
  rolesExcluidos = SIN_ROLES_EXCLUIDOS,
}: Props) {
  const dispatch = useDispatch();
  const [perfilActivo, setPerfilActivo] = useState<perfilDatosAmpleosInterface>();
  const [bandasList, setBandaslist] = useState<bandaInterface[]>([]);
  const [listFederaciones, setListFederaciones] = useState<federacionInterface[]>([]);
  const [federacionSelecionada, setFederacionSeleccionada] = useState<federacionInterface | null>(null);
  const [rolesList, setRolesList] = useState<rolInterface[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(urlFotoPerfil?.trim() || "");
  const perfilesServices = useRef(new PerfilesServices());
  const [step, setStep] = useState(1);
  const isAdvancingRef = useRef(false);

  /** Vista previa: URL del padre, o firma desde `perfilAEditar.urlFotoPerfil` (path en BD). */
  useEffect(() => {
    let cancelled = false;
    if (selectedFile) return;

    void (async () => {
      const fromParent = urlFotoPerfil?.trim() ?? "";
      const pathInDb = perfilAEditar.urlFotoPerfil?.trim() ?? "";

      if (fromParent) {
        if (!cancelled) setPreviewUrl(fromParent);
        return;
      }
      if (!pathInDb) {
        if (!cancelled) setPreviewUrl("");
        return;
      }
      if (/^https?:\/\//i.test(pathInDb) || pathInDb.startsWith("blob:") || pathInDb.startsWith("data:")) {
        if (!cancelled) setPreviewUrl(pathInDb);
        return;
      }
      const signed = await perfilesServices.current.obtenerUrlFotoPerfil(pathInDb);
      if (!cancelled) setPreviewUrl(signed || "");
    })();

    return () => {
      cancelled = true;
    };
  }, [perfilAEditar.idPerfil, perfilAEditar.urlFotoPerfil, urlFotoPerfil, selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const imagenPreviewSinOptimizar = useMemo(
    () => shouldUseUnoptimizedImageForSupabaseStorage(previewUrl),
    [previewUrl],
  );

  const rolesServices = useRef(new RolesServices());
  useEffect(() => {
    const inicializar = async () => {
      await rolesServices.current.initPerfil();
      rolesServices.current
        .getPermitidos(rolesExcluidos)
        .then((roles) => {
          setRolesList(roles);
        })
        .catch((error) => {
          console.error("Error al obtener roles:", error);
        });
    };
    inicializar();
  }, [rolesExcluidos]);

  const bandasServices = useRef(new BandasServices());
  const federacionesServices = useRef(new FederacionesService());

  const [formData, setFormData] = useState(datosInicialesFormulario);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBandas = async () => {
      try {
        const bandas = await bandasServices.current.get();
        if (bandas) {
          setBandaslist(bandas);
        }
      } catch (error) {
        console.error("❌ Error cargando las bandas:", error);
      }
    };

    fetchBandas();
  }, []);

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
  }, [listFederaciones, perfilActivo, perfilAEditar?.idPerfil]);

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
      rolUsuario: perfilAEditar.idForaneaRol || "",
      fechaNacimiento: perfilAEditar.fechaNacimiento || "",
      sexo: perfilAEditar.sexo,
      identidad: perfilAEditar.identidad,
      numeroTelefono: perfilAEditar.numeroTelefono,
      direccion: perfilAEditar.direccion,
      idForaneaBanda: perfilAEditar.idForaneaBanda || "",
      permisos: perfilAEditar.permisos,
      urlFotoPerfil: perfilAEditar.urlFotoPerfil || "",

    });

    // Si es developer, buscar y seleccionar la federación actual
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

  const selectedRol = rolesList.find((r) => r.idRol === formData.rolUsuario);
  const needsBanda = rolRequiereVinculoBanda(selectedRol?.nombreRol);

  const rolPerfilActivo = perfilActivo?.roles?.nombreRol;
  const esGestorFederacion = esGestorUsuariosFederacion(rolPerfilActivo);
  const canEditRol =
    rolPerfilActivo === "admin" || rolPerfilActivo === "developer" || esGestorFederacion;

  const validateStep1 = () => {
    if (!formData.nombre.trim()) {
      alert("El nombre es obligatorio");
      return false;
    }
    return true;
  };

  const validateStep2 = () => true;

  const validateStep3 = () => {
    if (perfilActivo?.roles?.nombreRol === "developer" && !federacionSelecionada?.idFederacion) {
      alert("Selecciona una federación");
      return false;
    }
    if (canEditRol && !formData.rolUsuario) {
      alert("El rol es obligatorio");
      return false;
    }
    const rolSeleccionado = rolesList.find((rol) => rol.idRol === formData.rolUsuario);
    if (canEditRol && (!rolSeleccionado || esRolRestringido(rolSeleccionado.nombreRol, rolesExcluidos))) {
      alert("No puedes asignar ese rol.");
      return false;
    }
    if (canEditRol && needsBanda && !formData.idForaneaBanda) {
      alert("Selecciona una banda para este rol");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step < TOTAL_STEPS) {
      if (isAdvancingRef.current) return;
      isAdvancingRef.current = true;
      goNext();
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 0);
      return;
    }

    if (isAdvancingRef.current) return;
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    setLoading(true);
    const userCreadoId = perfilAEditar.idForaneaUser;
    let urlFotoPerfilParaDB = "";
    if (selectedFile && userCreadoId) {
      try {
        const resultadoFotoPerfil = await perfilesServices.current.subirFotoPerfil(
          selectedFile,
          `${userCreadoId.replace(/\s+/g, "_")}_foto_perfil`
        );
        if (resultadoFotoPerfil) {
          urlFotoPerfilParaDB = resultadoFotoPerfil;
        } else {
          console.error("Error al subir la foto de perfil.");
        }
      } catch (err) {
        console.error("❌ Error al subir la foto de perfil:", err);
        alert(err instanceof Error ? err.message : "Error al subir la foto de perfil");
        setLoading(false);
        return;
      }
    }
    try {
      if (!perfilActivo || !perfilActivo.idForaneaFederacion) {
        alert("El perfil activo o su federación no está disponible. Intenta de nuevo.");
        setLoading(false);
        return;
      }
      if (esGestorFederacion && esRolRestringido(perfilAEditar.roles?.nombreRol, rolesExcluidos)) {
        alert("No puedes editar usuarios con roles protegidos.");
        setLoading(false);
        return;
      }
      const perfilesServices = new PerfilesServices();

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
        idForaneaRol: canEditRol ? formData.rolUsuario : perfilAEditar.idForaneaRol,
        idForaneaUser: perfilAEditar.idForaneaUser,
        idForaneaBanda: formData.idForaneaBanda || null,
        permisos: formData.permisos,
        urlFotoPerfil: urlFotoPerfilParaDB || perfilAEditar.urlFotoPerfil || "",
        estado: perfilAEditar.estado,
      };
      if (esGestorFederacion) {
        await perfilesServices.updateRestringido(perfilAEditar.idPerfil, nuevoPerfil as perfilInterface, rolesExcluidos);
      } else {
        await perfilesServices.update(perfilAEditar.idPerfil, nuevoPerfil as perfilInterface);
      }
      openModalExito("Usuario actualizado correctamente");
    } catch (error) {
      console.error("❌ Error al actualizar el perfil:", error);
      alert("Error al actualizar el usuario");
    } finally {
      setLoading(false);
      setFormData(datosInicialesFormulario);
      setStep(1);
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
      // Crear URL temporal para vista previa
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Opcional: También puedes guardar el nombre del archivo en formData
      setFormData((prev) => ({
        ...prev,
        urlFotoPerfil: file.name,
      }));
    }
  };
  const onClickCancelar = () => {
    setFormData(datosInicialesFormulario);
    setStep(1);
    onClose();
  };

  if (!perfilActivo) {
    return (
      <div className="flex min-h-[220px] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <span
            className="h-9 w-9 animate-spin rounded-full border-2 border-primario border-t-transparent"
            aria-hidden
          />
          <span className="text-sm">Cargando…</span>
        </div>
      </div>
    );
  }

  const stepsMeta = [
    { n: 1, title: "Identidad", subtitle: "Nombre y alias" },
    { n: 2, title: "Detalles", subtitle: "Datos y foto" },
    { n: 3, title: "Rol", subtitle: "Permisos y alcance" },
  ];

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Editar usuario</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Actualizar usuario</h2>
          <p className="mt-2 text-sm text-white/55">Edita los datos permitidos. Correo y contraseña no se modifican aquí.</p>
        </header>

        <nav className="mb-8 flex justify-center gap-2" aria-label="Progreso del formulario">
          {stepsMeta.map(({ n, title }) => {
            const active = step === n;
            const done = step > n;
            return (
              <div key={n} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition",
                    done ? "bg-primario text-[#0a1628]" : active ? "bg-white text-[#0a1628]" : "bg-white/10 text-white/45",
                  ].join(" ")}
                >
                  {done ? "✓" : n}
                </div>
                <span className={active ? "text-xs font-medium text-white" : "text-xs text-white/40"}>{title}</span>
              </div>
            );
          })}
        </nav>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form noValidate className="space-y-6" onSubmit={handleSubmit} aria-label="formulario para editar usuario">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                <div>
                  <h3 className="text-lg font-medium text-white">{stepsMeta[0].subtitle}</h3>
                  <p className="mt-1 text-sm text-white/50">Actualiza el nombre y la información visible del perfil.</p>
                </div>

                <div>
                  <label className={labelClass} htmlFor="nombre">
                    Nombre <span className="text-primario">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={inputBaseClass}
                    placeholder="Ej. María"
                    autoComplete="given-name"
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
                    className={inputBaseClass}
                    placeholder="Ej. Fernanda"
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
                    className={inputBaseClass}
                    placeholder="Ej. García"
                    autoComplete="family-name"
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
                    className={inputBaseClass}
                    placeholder="Ej. López"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="alias">
                    Alias
                  </label>
                  <input
                    type="text"
                    id="alias"
                    name="alias"
                    value={formData.alias}
                    onChange={handleInputChange}
                    className={inputBaseClass}
                    placeholder="Ej. Marifer"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                <div>
                  <h3 className="text-lg font-medium text-white">{stepsMeta[1].subtitle}</h3>
                  <p className="mt-1 text-sm text-white/50">Datos generales del usuario y fotografía de perfil.</p>
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
                    className={inputBaseClass}
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="sexo">
                    Sexo
                  </label>
                  <select
                    id="sexo"
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    className={`${inputBaseClass} cursor-pointer`}
                  >
                    <option className="bg-[#1a1f2e] text-white/60" value="" disabled>
                      Selecciona
                    </option>
                    <option className="bg-[#1a1f2e] text-white" value="Masculino">
                      Masculino
                    </option>
                    <option className="bg-[#1a1f2e] text-white" value="Femenino">
                      Femenino
                    </option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="identidad">
                    Identidad
                  </label>
                  <input
                    type="text"
                    id="identidad"
                    name="identidad"
                    value={formData.identidad}
                    onChange={handleInputChange}
                    className={inputBaseClass}
                    placeholder="Ej. 0801-0000-00000"
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
                    className={inputBaseClass}
                    placeholder="Ej. +504 9999-9999"
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="direccion">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className={inputBaseClass}
                    placeholder="Ej. Barrio Centro, calle 1"
                    autoComplete="street-address"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="urlFotoPerfil">
                    Foto de perfil
                  </label>
                  <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <label className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      <input
                        type="file"
                        id="urlFotoPerfil"
                        name="urlFotoPerfil"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                      {previewUrl ? (
                        <Image
                          fill
                          src={previewUrl}
                          alt="Foto de perfil"
                          className="object-cover"
                          unoptimized={imagenPreviewSinOptimizar}
                          priority
                        />
                      ) : (
                        <span className="text-white/50 text-2xl font-black w-full h-full flex justify-center items-center overflow-hidden">
                          <UserIcon className="h-10 w-10" />
                        </span>
                      )}
                    </label>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Cambiar fotografía</p>
                      <p className="mt-1 text-xs text-white/45">Haz clic en la imagen para seleccionar un archivo.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                <div>
                  <h3 className="text-lg font-medium text-white">{stepsMeta[2].subtitle}</h3>
                  <p className="mt-1 text-sm text-white/50">Ajusta rol, permisos y alcance según tu nivel de acceso.</p>
                </div>

                {perfilActivo.roles?.nombreRol === "developer" && (
                  <div>
                    <label className={labelClass} htmlFor="federacion">
                      Federación <span className="text-primario">*</span>
                    </label>
                    <select
                      id="federacion"
                      name="federacion"
                      value={federacionSelecionada ? federacionSelecionada.idFederacion : ""}
                      onChange={(e) => {
                        const federacion = listFederaciones.find((f) => f.idFederacion === e.target.value) || null;
                        setFederacionSeleccionada(federacion);
                      }}
                      className={`${inputBaseClass} cursor-pointer`}
                    >
                      <option className="bg-[#1a1f2e] text-white/60" value="" disabled>
                        Selecciona federación
                      </option>
                      {listFederaciones.map((federacion) => (
                        <option
                          key={federacion.idFederacion}
                          className="bg-[#1a1f2e] text-white"
                          value={federacion.idFederacion}
                        >
                          {federacion.nombreFederacion}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {canEditRol ? (
                  <div>
                    <label className={labelClass} htmlFor="rolUsuario">
                      Rol <span className="text-primario">*</span>
                    </label>
                    <ComboBoxRoles
                      id="rolUsuario"
                      roles={rolesList}
                      value={formData.rolUsuario}
                      onChange={(rolId) => {
                        const rol = rolesList.find((r) => r.idRol === rolId);
                        setFormData((prev) => ({
                          ...prev,
                          rolUsuario: rolId,
                          idForaneaBanda: rolRequiereVinculoBanda(rol?.nombreRol) ? prev.idForaneaBanda : "",
                        }));
                      }}
                      placeholder="Selecciona un rol"
                    />
                  </div>
                ) : null}

                {canEditRol && needsBanda ? (
                  <div>
                    <label className={labelClass} htmlFor="idForaneaBanda">
                      Banda <span className="text-primario">*</span>
                    </label>
                    <ComboBoxBandas
                      id="idForaneaBanda"
                      bandas={bandasList}
                      value={formData.idForaneaBanda}
                      onChange={(idBanda) =>
                        setFormData((prev) => ({
                          ...prev,
                          idForaneaBanda: idBanda,
                        }))
                      }
                      placeholder="Selecciona una banda"
                    />
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div>
                    <label className="text-sm font-medium text-white" htmlFor="permisos">
                      Permisos activados
                    </label>
                    <p className="text-xs text-white/45">Permite acciones adicionales según la política del sistema.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.permisos}
                    id="permisos"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        permisos: !prev.permisos,
                      }))
                    }
                    className={[
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                      formData.permisos ? "bg-primario" : "bg-white/20",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                        formData.permisos ? "translate-x-5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onClickCancelar}
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
              >
                Cancelar
              </button>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/90 transition hover:bg-white/5"
                  >
                    Atrás
                  </button>
                ) : null}
                {step < TOTAL_STEPS ? (
                  <button
                    type="submit"
                    className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !perfilActivo.idForaneaFederacion}
                    className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50 disabled:shadow-none"
                  >
                    {loading ? "Guardando…" : "Actualizar usuario"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-[11px] text-white/35">
          Paso {step} de {TOTAL_STEPS}
        </p>
      </div>
    </div>
  );
}
