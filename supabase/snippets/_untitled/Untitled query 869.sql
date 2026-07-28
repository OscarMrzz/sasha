DO $$
DECLARE
    id UUID; -- Declaración de la variable
BEGIN
    -- 1. Asignamos el valor a la variable
    SELECT "idFederacion" INTO id 
    FROM federaciones 
    WHERE "nombreFederacion" = 'SASHA-DEV';

    -- 2. Imprimimos usando el marcador %
   select * from federaciones where "idFederacion"=id;

END $$;