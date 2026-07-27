GRANT SELECT ON public.vista_condensado TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
