import { rolRequiereVinculoBanda } from "@/helpers/usuarios/rolesUsuarios";

export type ResultadoValidacionCampo =
  | { valido: true }
  | { valido: false; mensaje: string; campo: string };

export type DatosAuthCrearUsuario = {
  email: string;
  password: string;
  password2?: string;
};

export type DatosPerfilCrearUsuario = {
  nombre: string;
  idForaneaRol: string;
  idForaneaFederacion: string;
  idForaneaUser: string;
  idForaneaBanda?: string | null;
  nombreRol?: string | null;
};

export type DatosFormularioAgregarUsuario = DatosAuthCrearUsuario &
  Pick<DatosPerfilCrearUsuario, "nombre" | "idForaneaRol" | "idForaneaBanda"> & {
    idForaneaFederacion?: string;
    requiereFederacion?: boolean;
    nombreRol?: string | null;
  };

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

const errorCampo = (campo: string, mensaje: string): ResultadoValidacionCampo => ({
  valido: false,
  campo,
  mensaje,
});

export function validarEmail(email: string): ResultadoValidacionCampo {
  const valor = email.trim();
  if (!valor) return errorCampo("email", "El correo electrónico es obligatorio.");
  if (!EMAIL_VALIDO.test(valor)) {
    return errorCampo("email", "El correo electrónico no tiene un formato válido (ejemplo: usuario@dominio.com).");
  }
  return { valido: true };
}

export function validarPassword(password: string, password2?: string): ResultadoValidacionCampo {
  const valor = password.trim();
  if (!valor) return errorCampo("password", "La contraseña es obligatoria.");
  if (valor.length < PASSWORD_MIN_LENGTH) {
    return errorCampo(
      "password",
      `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
    );
  }
  if (password2 !== undefined && valor !== password2.trim()) {
    return errorCampo("password2", "Las contraseñas no coinciden. Verifica ambos campos.");
  }
  return { valido: true };
}

export function validarNombre(nombre: string): ResultadoValidacionCampo {
  if (!nombre.trim()) return errorCampo("nombre", "El nombre es obligatorio.");
  return { valido: true };
}

export function validarRol(idForaneaRol: string): ResultadoValidacionCampo {
  if (!idForaneaRol.trim()) return errorCampo("rolUsuario", "Debes seleccionar un rol para el usuario.");
  return { valido: true };
}

export function validarFederacion(idForaneaFederacion?: string): ResultadoValidacionCampo {
  if (!idForaneaFederacion?.trim()) {
    return errorCampo("federacion", "Debes seleccionar la federación del usuario.");
  }
  return { valido: true };
}

export function validarBandaSegunRol(
  nombreRol: string | null | undefined,
  idForaneaBanda?: string | null
): ResultadoValidacionCampo {
  if (!rolRequiereVinculoBanda(nombreRol)) return { valido: true };
  if (!idForaneaBanda?.trim()) {
    return errorCampo("idForaneaBanda", "Debes seleccionar una banda para el rol elegido.");
  }
  return { valido: true };
}

export function validarDatosAuthCrearUsuario(datos: DatosAuthCrearUsuario): ResultadoValidacionCampo {
  const email = validarEmail(datos.email);
  if (!email.valido) return email;

  return validarPassword(datos.password, datos.password2);
}

export function validarDatosPerfilCrearUsuario(datos: DatosPerfilCrearUsuario): ResultadoValidacionCampo {
  const nombre = validarNombre(datos.nombre);
  if (!nombre.valido) return nombre;

  const rol = validarRol(datos.idForaneaRol);
  if (!rol.valido) return rol;

  const federacion = validarFederacion(datos.idForaneaFederacion);
  if (!federacion.valido) return federacion;

  if (!datos.idForaneaUser.trim()) {
    return errorCampo("idForaneaUser", "No se recibió el identificador del usuario creado.");
  }

  return validarBandaSegunRol(datos.nombreRol, datos.idForaneaBanda);
}

export function validarFormularioAgregarUsuario(
  datos: DatosFormularioAgregarUsuario
): ResultadoValidacionCampo {
  const nombre = validarNombre(datos.nombre);
  if (!nombre.valido) return nombre;

  const auth = validarDatosAuthCrearUsuario(datos);
  if (!auth.valido) return auth;

  if (datos.requiereFederacion) {
    const federacion = validarFederacion(datos.idForaneaFederacion);
    if (!federacion.valido) return federacion;
  }

  const rol = validarRol(datos.idForaneaRol);
  if (!rol.valido) return rol;

  return validarBandaSegunRol(datos.nombreRol, datos.idForaneaBanda);
}

export function mensajeValidacionPorCampo(campo: string): string {
  const etiquetas: Record<string, string> = {
    nombre: "Nombre",
    email: "Correo electrónico",
    password: "Contraseña",
    password2: "Confirmar contraseña",
    rolUsuario: "Rol",
    federacion: "Federación",
    idForaneaBanda: "Banda",
  };
  return etiquetas[campo] ?? campo;
}
