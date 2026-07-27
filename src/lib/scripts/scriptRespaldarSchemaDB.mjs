// lib/mis-funciones.js

import { execSync } from "child_process";
import { writeFileSync } from "fs";


try {
    const path ="src/lib/database/schemaDB.sql"

    const comando = execSync(`npx supabase db dump --linked`, { encoding: "utf-8" });

    writeFileSync(path, comando, { encoding: "utf-8" });
    console.log("OK")
    console.log(`Esquema de la base de datos respaldado en: ${path}`);

   
} catch (error) {
    console.error("Error al respaldar el esquema de la base de datos:", error);
} 

