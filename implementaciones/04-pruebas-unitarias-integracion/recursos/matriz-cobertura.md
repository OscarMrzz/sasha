# Matriz de cobertura

Comando: `pnpm test` (179 tests al cierre de esta implementación).

## Mappers

| Módulo | Spec |
|---|---|
| `services/mappers/caseMapper` | `src/__tests__/mappers/caseMapper.test.ts` |
| `services/mappers/parseCamel` | `src/__tests__/mappers/parseCamel.test.ts` |

## Helpers

| Módulo | Spec |
|---|---|
| `busqueda/normalizarTextoBusqueda` | `helpers/busqueda/normalizarTextoBusqueda.test.ts` |
| `condensado/pivotCondensado` | `helpers/condensado/pivotCondensado.test.ts` |
| `copas/eventoPermiteEdicionCopas` | `helpers/copas/eventoPermiteEdicionCopas.test.ts` |
| `errores/mensajesServicio` | `helpers/errores/mensajesServicio.test.ts` |
| `errores/bandas/manejoErrorBanda` | `helpers/errores/manejoErrorBanda.test.ts` |
| `eventos/cargarEventosAsignadosAlPerfil` | `helpers/eventos/cargarEventosAsignadosAlPerfil.test.ts` |
| `eventos/cargarEventosDisciplinaAsignados` | `helpers/eventos/cargarEventosDisciplinaAsignados.test.ts` |
| `fechas/*` | `helpers/fechas/fechas.test.ts`, `eventosDelDia.test.ts` |
| `generadorPDF` | `helpers/generadorPDF.test.ts` |
| `mi-banda/servidorMiBandaHealth` | `helpers/mi-banda/servidorMiBandaHealth.test.ts` |
| `solicitudCopa/*` | `lugarSolicitudCopa`, `filtrarSolicitudesCopaActivas` |
| `solicitudesRevicion/filtrarSolicitudesActivas` | `helpers/solicitudesRevicion/...` |
| `usuarios/*` | roles, validaciones, validarAccesoPerfil |
| `utils/estadisticasHelpers` + reportes + rubricas | `helpers/utils/estadisticasYReportes.test.ts` |
| `utils/clientUtils` | `helpers/utils/clientUtils.test.ts` |
| `utils/sesion` | `helpers/utils/sesion.test.ts` |
| `components/.../estadoSolicitudPill` | `helpers/components/estadoSolicitudPill.test.ts` |

## Servicios cliente

| Servicio | Spec |
|---|---|
| alertasEvaluacion | `services/alertasEvaluacionServices.test.ts` |
| aplicacionSanciones | `services/aplicacionSancionesServices.test.ts` |
| auditoria | `services/auditoriaServices.test.ts` |
| bandas | `services/bandasServices.test.ts` |
| categoria | `services/categoriaServices.test.ts` |
| chekout | `services/chekoutServices.test.ts` |
| confirmacionAsistencia | `services/confirmacionAsistenciaServices.test.ts` |
| controladores | `services/controladoresServices.test.ts` |
| copas | `services/copasServices.test.ts` |
| criterios | `services/criteriosServices.test.ts` |
| cumplimientos | `services/cumplimientosServices.test.ts` |
| federaciones | `services/federacionesServices.test.ts` |
| password | `services/passwordServices.test.ts` |
| perfiles | `services/perfilesServices.test.ts` |
| regiones | `services/regionesServices.test.ts` |
| RegistroComentarios | `services/RegistroComentariosServices.test.ts` |
| RegistroCumplimientos | `services/RegistroCumplimientosServices.test.ts` |
| registroEquipoEvaluador | `services/registroEquipoEvaluadorServices.test.ts` |
| registroEventos | `services/registroEventosServices.test.ts` |
| respuestaSolicitudReviciones | `services/respuestaSolicitudRevicionesServices.test.ts` |
| resultados | `services/resultadosServices.test.ts` |
| rol | `services/rolServices.test.ts` |
| rubricasPaquetes | `services/rubricasPaquetesServices.test.ts` |
| rubricas | `services/rubricasServices.test.ts` |
| sanciones | `services/sancionesServices.test.ts` |
| solicitudCopas | `services/solicitudCopasServices.test.ts` |
| solicitudRevicion | `services/solicitudRevicionServices.test.ts` |
| solicituSancion | `services/solicituSancion.test.ts` |
| userServices | `services/userServices.test.ts` |

## Servicios servidor

| Servicio | Spec |
|---|---|
| asistenciaEventos | `services/servidor/asistenciaEventosServices.test.ts` |
| copas | `services/servidor/copasServices.test.ts` |
| resultados | `services/servidor/resultadosServices.test.ts` |
| rubricasConsulta | `services/servidor/rubricasConsultaServices.test.ts` |
| sancionesServidor | `services/servidor/sancionesServidorServices.test.ts` |
