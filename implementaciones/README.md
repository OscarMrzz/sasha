# Historial de implementaciones

Esta carpeta documenta cada implementación o cambio estructural grande del proyecto. Sirve como bitácora: qué se hizo, cuándo, con qué plan y con qué recursos de apoyo.

## Cómo crear una nueva implementación

1. Mira el último número usado en las subcarpetas (`01-...`, `02-...`, …).
2. Crea una carpeta con el formato:

```text
NN-slug-corto
```

- `NN`: número de dos dígitos (`01`, `02`, …).
- `slug-corto`: kebab-case, sin espacios (ej. `dashboard-nuevo`, `restructura-carpetas`).

Ejemplo: `02-dashboard-nuevo`.

3. Dentro de esa carpeta crea **siempre**:

```text
NN-slug-corto/
  datos-generales.md    # nombre, fecha, objetivo, estado
  plan.md               # plan de la implementación
  recursos/             # markdowns de apoyo (estructura, nomenclaturas, etc.)
```

4. En `datos-generales.md` incluye al menos:

- Nombre de la implementación
- Fecha
- Objetivo breve
- Estado (`planificada` | `en progreso` | `completada`)
- Autor / contexto (opcional)

5. En `plan.md` describe los pasos, alcance y fuera de alcance.

6. En `recursos/` agrega los `.md` que necesites, por ejemplo:

- `estructura-carpetas.md`
- `nomenclaturas.md`
- `mapa-movimientos.md`
- notas de decisiones, checklists, etc.

## Convención de nombres

| Elemento | Regla | Ejemplo |
|---|---|---|
| Carpeta | `NN-slug-kebab` | `01-restructura-carpetas` |
| Datos | `datos-generales.md` | fijo |
| Plan | `plan.md` | fijo |
| Recursos | kebab-case `.md` | `estructura-carpetas.md` |

## Índice

| # | Carpeta | Resumen |
|---|---|---|
| 01 | [01-restructura-carpetas](./01-restructura-carpetas/) | Reorganización de carpetas en capas + unificación de components + models |
| 02 | [02-snake-case-zod](./02-snake-case-zod/) | DB snake_case + Next camelCase + mappers + Zod en forms/services |
