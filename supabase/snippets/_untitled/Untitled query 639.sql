DO $$

DECLARE

 idRegionPrincipal UUID := gen_random_uuid();
    idRegionOccidente UUID := gen_random_uuid();
    idRegionCentroSur UUID := gen_random_uuid();
    idRegionAguan UUID := gen_random_uuid();


    idCategoriaPremier UUID := gen_random_uuid();
    idCategoriaA UUID := gen_random_uuid();
    idCategoriaB UUID := gen_random_uuid();
    idCategoriaLibre UUID := gen_random_uuid();



    idRubricaMusicalidad1  UUID := gen_random_uuid();
    idRubricaMusicalidad2 UUID := gen_random_uuid();
    idRubricaCoreografia UUID := gen_random_uuid();
    idRubricaUniformidad UUID := gen_random_uuid();
    idRubricaDiciplina UUID := gen_random_uuid();

    idCriterio_1_Musicalidad1 UUID := gen_random_uuid();
    idCriterio_2_Musicalidad1 UUID := gen_random_uuid();
    idCriterio_3_Musicalidad1 UUID := gen_random_uuid();
    idCriterio_4_Musicalidad1 UUID := gen_random_uuid();
    idCriterio_5_Musicalidad1 := gen_random_uuid();


    idCriterio_1_Musicalidad2 UUID := gen_random_uuid();
    idCriterio_2_Musicalidad2 UUID := gen_random_uuid();
    idCriterio_3_Musicalidad2 UUID := gen_random_uuid();
    idCriterio_4_Musicalidad2 UUID := gen_random_uuid();
    idCriterio_5_Musicalidad2 := gen_random_uuid();


    idCriterio_1_Coreografia UUID := gen_random_uuid();
    idCriterio_2_Coreografia UUID := gen_random_uuid();
    idCriterio_3_Coreografia UUID := gen_random_uuid();
    idCriterio_4_Coreografia UUID := gen_random_uuid();
    idCriterio_5_Coreografia := gen_random_uuid();


    idCriterio_1_Uniformidad UUID := gen_random_uuid();
    idCriterio_2_Uniformidad UUID := gen_random_uuid();
    idCriterio_3_Uniformidad UUID := gen_random_uuid();
    idCriterio_4_Uniformidad UUID := gen_random_uuid();
    idCriterio_5_Uniformidad := gen_random_uuid();


    idCriterio_1_Diciplina UUID := gen_random_uuid();
    idCriterio_2_Diciplina UUID := gen_random_uuid();
    idCriterio_3_Diciplina UUID := gen_random_uuid();
    idCriterio_4_Diciplina UUID := gen_random_uuid();
    idCriterio_5_Diciplina UUID := gen_random_uuid();
    id_federacion UUID;


BEGIN

    -- 1. Asignamos el valor a la variable
    SELECT "idFederacion" INTO id_federacion 
    FROM federaciones 
    WHERE "nombreFederacion" = 'SASHA-DEV';

  


/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* regiones */






INSERT INTO public.region ("idRegion","created_at","nombreRegion","idForaneaFederacion") 
VALUES 
(idRegionPrincipal, now(),'Principal',id_federacion),
(idRegionOccidente, now(),'Occidente',id_federacion),
(idRegionCentroSur, now(),'Centro sur',id_federacion),
(idRegionAguan, now(),'Aguan',id_federacion)


/* Categorias */

/* 
 idCategoria: string;
    created_at: string;
    nombreCategoria: string;
    detallesCategoria: string;
    idForaneaFederacion: string;

 */

INSERT INTO if no  public.categoria ("idCategoria","created_at","nombreCategoria","detallesCategoria","idForaneaFederacion") 
VALUES 
(idCategoriaPremier, now(),'Categoria Premier','Lorem ipsum dolor sit amet',id_federacion),
(idCategoriaA, now(),'Categoria A','Lorem ipsum dolor sit amet',id_federacion),
(idCategoriaB, now(),'Categoria B','Lorem ipsum dolor sit amet',id_federacion),
(idCategoriaLibre, now(),'Categoria Libre','Lorem ipsum dolor sit amet',id_federacion),



/* Rubricas */

/* 

    idRubrica: string;
    created_at: string;
    nombreRubrica: string;
    datalleRubrica: string; // Mantenido el typo como en DB (debería ser detalleRubrica)
    puntosRubrica: number;
    idForaneaCategoria: string;
    idForaneaFederacion: string;
    versionRubrica: string;
 */

 INSERT INTO public.rubricas ("idRubrica","created_at","nombreRubrica","datalleRubrica","puntosRubrica","idForaneaCategoria","idForaneaFederacion","versionRubrica")
VALUES 
(idRubricaMusicalidad1,now(),'Rubrica Musicalidad 1','Lorem ipsum dolor sit amet',25,idCategoriaPremier,id_federacion,'2026-01'),
(idRubricaMusicalidad2,now(),'Rubrica Musicalidad 2','Lorem ipsum dolor sit amet',25,idCategoriaPremier,id_federacion,'2026-01'),
(idRubricaCoreografia,now(),'Rubrica Coreografia','Lorem ipsum dolor sit amet',25,idCategoriaPremier,id_federacion,'2026-01'),
(idRubricaUniformidad,now(),'Rubrica Uniformidad','Lorem ipsum dolor sit amet',25,idCategoriaPremier,id_federacion,'2026-01'),
(idRubricaDiciplina,now(),'Rubrica Diciplina','Lorem ipsum dolor sit amet',-25,idCategoriaPremier,id_federacion,'2026-01');



/* Criterio */

/* 
    idCriterio: string;
    created_at: string;
    nombreCriterio: string;
    detallesCriterio: string;
    puntosCriterio: number;
    idForaneaRubrica: string;

 */

 INSERT INTO public.criterioEvaluacion ("idCriterio","created_at","nombreCriterio","detallesCriterio","puntosCriterio","idForaneaRubrica")
VALUES 
(idCriterio_1_Musicalidad1, now(), 'Criterio 1 Musicalidad 1', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad1),
(idCriterio_2_Musicalidad1, now(), 'Criterio 2 Musicalidad 1', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad1),
(idCriterio_3_Musicalidad1, now(), 'Criterio 3 Musicalidad 1', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad1),
(idCriterio_4_Musicalidad1, now(), 'Criterio 4 Musicalidad 1', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad1),
(idCriterio_5_Musicalidad1, now(), 'Criterio 5 Musicalidad 1', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad1)

(idCriterio_1_Musicalidad2, now(), 'Criterio 1 Musicalidad 2', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad2),
(idCriterio_2_Musicalidad2, now(), 'Criterio 2 Musicalidad 2', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad2),
(idCriterio_3_Musicalidad2, now(), 'Criterio 3 Musicalidad 2', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad2),
(idCriterio_4_Musicalidad2, now(), 'Criterio 4 Musicalidad 2', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad2),
(idCriterio_5_Musicalidad2, now(), 'Criterio 5 Musicalidad 2', 'Lorem ipsum dolor sit amet', 5, idRubricaMusicalidad2)

(idCriterio_1_Coreografia, now(), 'Criterio 1 Coreografia', 'Lorem ipsum dolor sit amet', 5, idRubricaCoreografia),
(idCriterio_2_Coreografia, now(), 'Criterio 2 Coreografia', 'Lorem ipsum dolor sit amet', 5, idRubricaCoreografia),
(idCriterio_3_Coreografia, now(), 'Criterio 3 Coreografia', 'Lorem ipsum dolor sit amet', 5, idRubricaCoreografia),
(idCriterio_4_Coreografia, now(), 'Criterio 4 Coreografia', 'Lorem ipsum dolor sit amet', 5, idRubricaCoreografia),
(idCriterio_5_Coreografia, now(), 'Criterio 5 Coreografia', 'Lorem ipsum dolor sit amet', 5, idRubricaCoreografia),

(idCriterio_1_Diciplina, now(), 'Criterio 1 Diciplina', 'Lorem ipsum dolor sit amet', -5, idRubricaDiciplina),
(idCriterio_2_Diciplina, now(), 'Criterio 2 Diciplina', 'Lorem ipsum dolor sit amet', -5, idRubricaDiciplina),
(idCriterio_3_Diciplina, now(), 'Criterio 3 Diciplina', 'Lorem ipsum dolor sit amet', -5, idRubricaDiciplina),
(idCriterio_4_Diciplina, now(), 'Criterio 4 Diciplina', 'Lorem ipsum dolor sit amet', -5, idRubricaDiciplina),
(idCriterio_5_Diciplina, now(), 'Criterio 5 Diciplina', 'Lorem ipsum dolor sit amet', -5, idRubricaDiciplina);


/* cumplimiento */


/* 
   idCumplimiento: string;
    created_at: string;
    detalleCumplimiento: string; // Corregido: era dateCumplimiento
    puntosCumplimiento: number;
    idForaneaCriterio: string;

 */

 insert into public.cumplimientos("idCumplimiento","created_at","detalleCumplimiento","puntosCumplimiento","idForaneaCriterio")
values





END $$