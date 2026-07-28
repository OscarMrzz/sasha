# Plan — 02-snake-case-zod

## Cómo se crea esta carpeta

Seguir [`implementaciones/README.md`](../README.md). Detalle operativo en [`recursos/`](./recursos/).

## Decisiones

- **DB:** snake_case (tablas, columnas, vistas).
- **Next interfaces/UI:** camelCase (sin renombrar).
- **Services:** mappers `toDb`/`fromDb`; queries en snake_case.
- **Zod:** schemas camelCase; validar en forms + services.

Ver el plan completo en el archivo de plan del agente / este mismo documento ampliado en recursos.

## Fases

0. Docs + mapa renombres  
1. Migración SQL + reset `backend-sasha`  
2. Zod camelCase  
3. Services + mappers  
4. Forms + safeParse  
5. Verificación  

## Recursos

- [`mapa-renombres.md`](./recursos/mapa-renombres.md)
- [`nomenclatura-capas.md`](./recursos/nomenclatura-capas.md)
- [`nomenclatura-zod.md`](./recursos/nomenclatura-zod.md)
