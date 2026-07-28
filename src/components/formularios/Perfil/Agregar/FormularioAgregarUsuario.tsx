"use client";

import { activarRefrescarDataPerfiles } from "@/features/Perfil/refrescadorPerfiles";
import {
  bandaInterface,
  federacionInterface,
  perfilDatosAmpleosInterface,
  rolInterface,
} from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import FederacionesService from "@/services/federacionesServices";
import BandasServices from "@/services/bandasServices";
import RolesServices from "@/services/rolServices";
import { createUser, type DatosPerfilNuevoUsuario } from "@/services/userServices";
import { useUsuarioAgregadoStore } from "@/store/PerfilStore/usuarioAgregadoStore";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import { ComboBoxBandas } from "@/components/ComboBox/ComboBoxBandas";
import { ComboBoxRoles } from "@/components/ComboBox/ComboBoxRoles";
import { esRolRestringido, ROLES_PRIVILEGIADOS_USUARIOS, rolRequiereVinculoBanda } from "@/helpers/usuarios/rolesUsuarios";
import { mensajeErrorServicio } from "@/helpers/errores/mensajesServicio";
import {
  validarBandaSegunRol,
  validarDatosAuthCrearUsuario,
  validarEmail,
  validarFederacion,
  validarFormularioAgregarUsuario,
  validarNombre,
  validarPassword,
  validarRol,
} from "@/helpers/usuarios/validacionesCrearUsuario";

type Props = {
  onClose: () => void;
  openErrorModal?: (mensaje: string) => void;
  openModalExito?: (mensaje: string) => void;
  openModal?: boolean;
  onCloseModal?: () => void;
  rolesExcluidos?: readonly string[];
};

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
  permisos: true,
  urlFotoPerfil: "",
  codigo: "",
};

const TOTAL_STEPS = 3;

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";
const SIN_ROLES_EXCLUIDOS: readonly string[] = [];

export default function FormularioAgregarUsuario({
  onClose,
  openErrorModal,
  openModalExito,
  openModal = true,
  rolesExcluidos = SIN_ROLES_EXCLUIDOS,
}: Props) {
  const dispatch = useDispatch();
  const [perfilActivo, setPerfilActivo] = useState<perfilDatosAmpleosInterface>();
  const [bandasList, setBandaslist] = useState<bandaInterface[]>([]);
  const bandasServices = useRef(new BandasServices());
  const [rolesList, setRolesList] = useState<rolInterface[]>([]);
  const rolesServices = useRef(new RolesServices());
  const [step, setStep] = useState(1);
  const isAdvancingRef = useRef(false);

  const rolesExcluidosEfectivos = useMemo(() => {
    if (perfilActivo?.roles?.nombreRol === "admin temporal") {
      return [...new Set([...rolesExcluidos, ...ROLES_PRIVILEGIADOS_USUARIOS])];
    }
    return [...rolesExcluidos];
  }, [perfilActivo?.roles?.nombreRol, rolesExcluidos]);

  useEffect(() => {
    if (!perfilActivo) return;

    const inicializar = async () => {
      await rolesServices.current.initPerfil();
      rolesServices.current
        .getPermitidos(rolesExcluidosEfectivos)
        .then((roles) => setRolesList(roles))
        .catch((error) => console.error("Error al obtener roles:", error));
    };
    inicializar();
  }, [perfilActivo, rolesExcluidosEfectivos]);

  useEffect(() => {
    const fetchBandas = async () => {
      try {
        const bandas = await bandasServices.current.get();
        if (bandas) setBandaslist(bandas);
      } catch (error) {
        console.error("❌ Error cargando las bandas:", error);
      }
    };
    fetchBandas();
  }, []);

  useEffect(() => {
    const cargarPerfilActivo = async () => {
      try {
        const perfilServices = new PerfilesServices();
        const perfil = await perfilServices.getUsuarioLogiado();
        if (perfil) setPerfilActivo(perfil);
      } catch (error) {
        console.error("❌ Error cargando el perfil activo:", error);
      }
    };
    cargarPerfilActivo();
  }, []);

  const [formData, setFormData] = useState(datosInicialesFormulario);
  const [loading, setLoading] = useState(false);
  const [listFederaciones, setListFederaciones] = useState<federacionInterface[]>([]);
  const [federacionSelecionada, setFederacionSeleccionada] = useState<federacionInterface | null>(null);
  const { setUltimoUsuario } = useUsuarioAgregadoStore();
  const federacionesServices = useRef(new FederacionesService());

  useEffect(() => {
    const fetchFederaciones = async () => {
      try {
        const federaciones = await federacionesServices.current.get();
        if (federaciones) setListFederaciones(federaciones);
      } catch (error) {
        console.error("❌ Error cargando las federaciones:", error);
      }
    };
    fetchFederaciones();
  }, []);

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

  const mostrarErrorValidacion = (mensaje: string) => {
    openErrorModal?.(mensaje);
  };

  const validateStep1 = () => {
    const resultado = validarNombre(formData.nombre);
    if (!resultado.valido) {
      mostrarErrorValidacion(resultado.mensaje);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const email = validarEmail(formData.email);
    if (!email.valido) {
      mostrarErrorValidacion(email.mensaje);
      return false;
    }

    const password = validarPassword(formData.password, formData.password2);
    if (!password.valido) {
      mostrarErrorValidacion(password.mensaje);
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (perfilActivo?.roles?.nombreRol === "developer") {
      const federacion = validarFederacion(federacionSelecionada?.idFederacion);
      if (!federacion.valido) {
        mostrarErrorValidacion(federacion.mensaje);
        return false;
      }
    }

    const rol = validarRol(formData.rolUsuario);
    if (!rol.valido) {
      mostrarErrorValidacion(rol.mensaje);
      return false;
    }

    const rolSeleccionado = rolesList.find((rolItem) => rolItem.idRol === formData.rolUsuario);
    if (!rolSeleccionado || esRolRestringido(rolSeleccionado.nombreRol, rolesExcluidosEfectivos)) {
      mostrarErrorValidacion("No puedes asignar ese rol con tu usuario actual.");
      return false;
    }

    const banda = validarBandaSegunRol(selectedRol?.nombreRol, formData.idForaneaBanda);
    if (!banda.valido) {
      mostrarErrorValidacion(banda.mensaje);
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

    // En pasos 1–2 el <form> existe para tests/accesibilidad, pero "submit" solo avanza.
    // Además, algunos navegadores pueden disparar un segundo submit al cambiar de step:
    // este candado evita que se ejecute la validación del paso 3 sin rol.
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

    try {
      if (!perfilActivo || !perfilActivo.idForaneaFederacion) {
        openErrorModal?.("No se pudo cargar tu perfil o federación. Recarga la página e inténtalo de nuevo.");
        setLoading(false);
        return;
      }

      let federacionAAplicar: string;
      if (perfilActivo.roles?.nombreRol === "developer") {
        federacionAAplicar = federacionSelecionada?.idFederacion ?? "";
      } else {
        federacionAAplicar = perfilActivo.idForaneaFederacion ?? "";
      }

      const validacionCompleta = validarFormularioAgregarUsuario({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        idForaneaRol: formData.rolUsuario,
        idForaneaFederacion: federacionAAplicar,
        idForaneaBanda: formData.idForaneaBanda,
        nombreRol: selectedRol?.nombreRol,
        requiereFederacion: perfilActivo.roles?.nombreRol === "developer",
      });

      if (!validacionCompleta.valido) {
        openErrorModal?.(validacionCompleta.mensaje);
        setLoading(false);
        return;
      }

      const validacionAuth = validarDatosAuthCrearUsuario({
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
      });
      if (!validacionAuth.valido) {
        openErrorModal?.(validacionAuth.mensaje);
        setLoading(false);
        return;
      }

      const datosPerfil: DatosPerfilNuevoUsuario = {
        nombre: formData.nombre.trim(),
        primerApellido: formData.primerApellido.trim() || "",
        idForaneaRol: formData.rolUsuario,
        idForaneaFederacion: federacionAAplicar,
        idForaneaBanda: formData.idForaneaBanda || null,
        permisos: formData.permisos,
        nombreRol: selectedRol?.nombreRol,
      };

      const { data, error } = await createUser(
        formData.email,
        formData.password,
        {
          idForaneaRol: formData.rolUsuario,
          idForaneaFederacion: federacionAAplicar,
          rolesExcluidos: [...rolesExcluidosEfectivos],
        },
        datosPerfil
      );

      if (error) {
        setLoading(false);
        openErrorModal?.(error.message || "No se pudo crear el usuario.");
        console.error("Error al crear el usuario:", error);
        return;
      }

      if (!data.perfil) {
        setLoading(false);
        openErrorModal?.("No se pudo completar la creación del usuario. Intenta de nuevo.");
        return;
      }

      setLoading(false);
      setFormData(datosInicialesFormulario);
      setStep(1);
      dispatch(activarRefrescarDataPerfiles());
      openModalExito?.("Usuario creado exitosamente");
      setUltimoUsuario(data.perfil);
      onClose();
    } catch (error) {
      console.error("❌ Error al crear perfil:", error);
      setLoading(false);
      openErrorModal?.(
        error instanceof Error
          ? error.message
          : mensajeErrorServicio(error, "Error al crear el perfil del usuario")
      );
    }
  };

  const onClickCancelar = () => {
    setFormData(datosInicialesFormulario);
    setStep(1);
    onClose();
  };


  if (!perfilActivo) {

    return (
      <OverleyModalFormulario open={openModal} onClose={onClose}>
      <div className="flex min-h-[220px] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <span
            className="h-9 w-9 animate-spin rounded-full border-2 border-primario border-t-transparent"
            aria-hidden
          />
          <span className="text-sm">Cargando…</span>
        </div>
      </div>
      </OverleyModalFormulario>
    );
  }

  const stepsMeta = [
    { n: 1, title: "Nombre", subtitle: "Identidad del usuario" },
    { n: 2, title: "Acceso", subtitle: "Correo y contraseña" },
    { n: 3, title: "Rol", subtitle: "Permisos y alcance" },
  ];

  return (
    <OverleyModalFormulario open={openModal} onClose={onClose}>
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Nuevo usuario</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Agregar usuario</h2>
          <p className="mt-2 text-sm text-white/55">Completa los pasos. Puedes volver atrás en cualquier momento.</p>
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
          <form
            noValidate
            aria-label="formulario para agregar usuario"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                <div>
                  <h3 className="text-lg font-medium text-white">{stepsMeta[0].subtitle}</h3>
                  <p className="mt-1 text-sm text-white/50">Nombre y apellido como aparecerán en el perfil.</p>
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
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                <div>
                  <h3 className="text-lg font-medium text-white">{stepsMeta[1].subtitle}</h3>
                  <p className="mt-1 text-sm text-white/50">Credenciales para iniciar sesión en la plataforma.</p>
                </div>
                <div>
                  <label className={labelClass} htmlFor="email">
                    Correo electrónico <span className="text-primario">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputBaseClass}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="password">
                    Contraseña <span className="text-primario">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={inputBaseClass}
                    placeholder="Mínimo recomendado: 8 caracteres"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="password2">
                    Confirmar contraseña <span className="text-primario">*</span>
                  </label>
                  <input
                    type="password"
                    id="password2"
                    name="password2"
                    value={formData.password2}
                    onChange={handleInputChange}
                    className={inputBaseClass}
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
                <div>
                  <h3 className="text-lg font-medium text-white">{stepsMeta[2].subtitle}</h3>
                  <p className="mt-1 text-sm text-white/50">Define el rol y si el usuario tiene permisos extendidos.</p>
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

                {needsBanda ? (
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
                    {loading ? "Guardando…" : "Crear usuario"}
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
    </OverleyModalFormulario>
  );
}
