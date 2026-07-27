## Instalar Supabase
npm install @supabase/ssr

.env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

 Esta son variables de entorno que para encontrar los datos de vas para
 1. supabase
 2. setting
 3. DataApi
 4. URL

 Para encontrar el siguiente es:
 1. supabase
 2. setting
 3. KeyApi
 4. Anon public

 SignIn Supabase

 1. Ya existe para auth  con corre
 2. Crear una tabla para guardar informacion extra aparte del correo
 y contraseña de preferencias llamarla **perfiles**
 3. impornate la tabla de perfiles deve tener una llave foranea
 recomiendo se llame idUser que conecte con auth de supabase
4. crear una politica que permita a cualquiera crear un usuario y un perfil en la tabla de perfiles

## Para iconos
npm install @heroicons/react


