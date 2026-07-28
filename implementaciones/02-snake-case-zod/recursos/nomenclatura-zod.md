# Zod

- Schemas en camelCase alineados a interfaces (`bandaSchema`, `bandaInsertSchema`).
- Forms: `safeParse` al submit.
- Services: `parse`/`safeParse` antes de `toDb` + insert/update.
- Tipos: `z.infer<typeof schema>` o interfaces existentes.
