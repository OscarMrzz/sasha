-- FASE 3: Prueba reversible. NO toca public.
-- Reversión: DROP SCHEMA IF EXISTS diag CASCADE;
CREATE SCHEMA IF NOT EXISTS diag;

CREATE OR REPLACE VIEW diag.cv_a AS
SELECT NULL::int AS x WHERE false;

CREATE OR REPLACE VIEW diag.cv_b AS
 SELECT * FROM diag.cv_a;

CREATE OR REPLACE VIEW diag.cv_a AS
 SELECT * FROM diag.cv_b;
