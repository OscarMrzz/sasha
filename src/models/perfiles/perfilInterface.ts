export interface perfilInterface{
    idPerfil: string;
    created_at: string;
    nombre: string;
    alias: string;
    fechaNacimiento: string | null;
 
    
    sexo: string;
    idForaneaFederacion: string | null;
    identidad: string;
    numeroTelefono: string;
    direccion: string;
    idForaneaUser: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    idForaneaBanda: string | null;
    permisos: boolean;
    idForaneaRol: string | null;
    urlFotoPerfil: string;
    codigo: string;
    estado: string;
}
