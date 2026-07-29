# Datos fijos para pruebas

Documento de **solo lectura**. Cualquier persona o herramienta que pruebe la plataforma debe usar **exactamente** estos datos (nombres, correos y estructura). No inventar variantes.

Contraseña de **todos** los usuarios de este set (admin, responsables, jurados, dirigentes, líderes, fiscal, mesa, disciplina, etc.): `12345678`  
Es **la misma** para todos; no hay contraseñas distintas por rol.

Dominio de correos: `@test.com`

Textos largos (descripciones de rúbricas/criterios y comentarios al evaluar): usar **Lorem ipsum**.

---

## 1. Regiones (3)

| # | Nombre de región |
|---|------------------|
| 1 | Honduras |
| 2 | Guatemala |
| 3 | El Salvador |

---

## 2. Categorías (3)

| # | Nombre |
|---|--------|
| 1 | Categoría X |
| 2 | Categoría Y |
| 3 | Categoría Z |

---

## 3. Rúbricas (4)

Cada rúbrica vale **25 puntos** en total.

- 5 criterios por rúbrica  
- Cada criterio: máximo **5 puntos**  
- Cumplimientos por criterio (iguales en todas):

| Cumplimiento   | Puntos |
|----------------|--------|
| No cumple      | 0      |
| Medio cumple   | 3      |
| Cumple         | 5      |

Total por rúbrica: 5 criterios × 5 pts = **25**  
Total de las 4 rúbricas: **100 puntos**

### Rúbrica 1 — Musicalidad (25 pts)

Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.

| Criterio | Nombre | Descripción |
|----------|--------|-------------|
| 1 | Criterio 1 Musicalidad | Lorem ipsum dolor sit amet. |
| 2 | Criterio 2 Musicalidad | Lorem ipsum dolor sit amet. |
| 3 | Criterio 3 Musicalidad | Lorem ipsum dolor sit amet. |
| 4 | Criterio 4 Musicalidad | Lorem ipsum dolor sit amet. |
| 5 | Criterio 5 Musicalidad | Lorem ipsum dolor sit amet. |

### Rúbrica 2 — Coreografía (25 pts)

Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.

| Criterio | Nombre | Descripción |
|----------|--------|-------------|
| 1 | Criterio 1 Coreografía | Lorem ipsum dolor sit amet. |
| 2 | Criterio 2 Coreografía | Lorem ipsum dolor sit amet. |
| 3 | Criterio 3 Coreografía | Lorem ipsum dolor sit amet. |
| 4 | Criterio 4 Coreografía | Lorem ipsum dolor sit amet. |
| 5 | Criterio 5 Coreografía | Lorem ipsum dolor sit amet. |

### Rúbrica 3 — Uniformidad (25 pts)

Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.

| Criterio | Nombre | Descripción |
|----------|--------|-------------|
| 1 | Criterio 1 Uniformidad | Lorem ipsum dolor sit amet. |
| 2 | Criterio 2 Uniformidad | Lorem ipsum dolor sit amet. |
| 3 | Criterio 3 Uniformidad | Lorem ipsum dolor sit amet. |
| 4 | Criterio 4 Uniformidad | Lorem ipsum dolor sit amet. |
| 5 | Criterio 5 Uniformidad | Lorem ipsum dolor sit amet. |

### Rúbrica 4 — Presentación (25 pts)

Descripción: Lorem ipsum dolor sit amet, consectetur adipiscing elit.

| Criterio | Nombre | Descripción |
|----------|--------|-------------|
| 1 | Criterio 1 Presentación | Lorem ipsum dolor sit amet. |
| 2 | Criterio 2 Presentación | Lorem ipsum dolor sit amet. |
| 3 | Criterio 3 Presentación | Lorem ipsum dolor sit amet. |
| 4 | Criterio 4 Presentación | Lorem ipsum dolor sit amet. |
| 5 | Criterio 5 Presentación | Lorem ipsum dolor sit amet. |

**Nota:** Crear las 4 rúbricas para cada categoría (X, Y, Z) si el sistema las exige por categoría. Mantener los mismos nombres, puntos y cumplimientos.

---

## 4. Bandas (27 = 3 regiones × 3 categorías × 3 colores)

Colores de banda (siempre los mismos tres): **Roja**, **Azul**, **Verde**.

Nombre visible de la banda: `Banda {Color}`  
En listados se distingue por **región** + **categoría**.

Convención de correo del dirigente:

`dirigente{nombrebanda}{region}{categoria}@test.com`

Ejemplo: dirigente de Banda Roja en Honduras, Categoría X → `dirigentebandarojahondurasx@test.com`

Convención de correo del líder (si se crea):

`lider{nombrebanda}{region}{categoria}@test.com`  
Ejemplo: `liderbandarojahondurasx@test.com`

### Honduras

#### Categoría X

| Banda       | Correo dirigente                         | Correo líder                          |
|-------------|------------------------------------------|---------------------------------------|
| Banda Roja  | dirigentebandarojahondurasx@test.com    | liderbandarojahondurasx@test.com      |
| Banda Azul  | dirigentebandaazulhondurasx@test.com    | liderbandaazulhondurasx@test.com      |
| Banda Verde | dirigentebandaverdehondurasx@test.com   | liderbandaverdehondurasx@test.com     |

#### Categoría Y

| Banda       | Correo dirigente                         | Correo líder                          |
|-------------|------------------------------------------|---------------------------------------|
| Banda Roja  | dirigentebandarojahondurasy@test.com    | liderbandarojahondurasy@test.com      |
| Banda Azul  | dirigentebandaazulhondurasy@test.com    | liderbandaazulhondurasy@test.com      |
| Banda Verde | dirigentebandaverdehondurasy@test.com   | liderbandaverdehondurasy@test.com     |

#### Categoría Z

| Banda       | Correo dirigente                         | Correo líder                          |
|-------------|------------------------------------------|---------------------------------------|
| Banda Roja  | dirigentebandarojahondurasz@test.com    | liderbandarojahondurasz@test.com      |
| Banda Azul  | dirigentebandaazulhondurasz@test.com    | liderbandaazulhondurasz@test.com      |
| Banda Verde | dirigentebandaverdehondurasz@test.com   | liderbandaverdehondurasz@test.com     |

### Guatemala

#### Categoría X

| Banda       | Correo dirigente                           | Correo líder                            |
|-------------|--------------------------------------------|-----------------------------------------|
| Banda Roja  | dirigentebandarojaguatemalax@test.com      | liderbandarojaguatemalax@test.com       |
| Banda Azul  | dirigentebandaazulguatemalax@test.com      | liderbandaazulguatemalax@test.com       |
| Banda Verde | dirigentebandaverdeguatemalax@test.com     | liderbandaverdeguatemalax@test.com      |

#### Categoría Y

| Banda       | Correo dirigente                           | Correo líder                            |
|-------------|--------------------------------------------|-----------------------------------------|
| Banda Roja  | dirigentebandarojaguatemalay@test.com      | liderbandarojaguatemalay@test.com       |
| Banda Azul  | dirigentebandaazulguatemalay@test.com      | liderbandaazulguatemalay@test.com       |
| Banda Verde | dirigentebandaverdeguatemalay@test.com     | liderbandaverdeguatemalay@test.com      |

#### Categoría Z

| Banda       | Correo dirigente                           | Correo líder                            |
|-------------|--------------------------------------------|-----------------------------------------|
| Banda Roja  | dirigentebandarojaguatemalaz@test.com      | liderbandarojaguatemalaz@test.com       |
| Banda Azul  | dirigentebandaazulguatemalaz@test.com      | liderbandaazulguatemalaz@test.com       |
| Banda Verde | dirigentebandaverdeguatemalaz@test.com     | liderbandaverdeguatemalaz@test.com      |

### El Salvador

En correos, la región se escribe sin espacio: `elsalvador`.

#### Categoría X

| Banda       | Correo dirigente                             | Correo líder                              |
|-------------|----------------------------------------------|-------------------------------------------|
| Banda Roja  | dirigentebandarojaelsalvadorx@test.com       | liderbandarojaelsalvadorx@test.com        |
| Banda Azul  | dirigentebandaazulelsalvadorx@test.com       | liderbandaazulelsalvadorx@test.com        |
| Banda Verde | dirigentebandaverdeelsalvadorx@test.com      | liderbandaverdeelsalvadorx@test.com       |

#### Categoría Y

| Banda       | Correo dirigente                             | Correo líder                              |
|-------------|----------------------------------------------|-------------------------------------------|
| Banda Roja  | dirigentebandarojaelsalvadory@test.com       | liderbandarojaelsalvadory@test.com        |
| Banda Azul  | dirigentebandaazulelsalvadory@test.com       | liderbandaazulelsalvadory@test.com        |
| Banda Verde | dirigentebandaverdeelsalvadory@test.com      | liderbandaverdeelsalvadory@test.com       |

#### Categoría Z

| Banda       | Correo dirigente                             | Correo líder                              |
|-------------|----------------------------------------------|-------------------------------------------|
| Banda Roja  | dirigentebandarojaelsalvadorz@test.com       | liderbandarojaelsalvadorz@test.com        |
| Banda Azul  | dirigentebandaazulelsalvadorz@test.com       | liderbandaazulelsalvadorz@test.com        |
| Banda Verde | dirigentebandaverdeelsalvadorz@test.com      | liderbandaverdeelsalvadorz@test.com       |

**Totales:** 27 bandas · 27 dirigentes · 27 líderes (si se crean líderes).

---

## 5. Eventos (1 por región)

Usar la misma fecha de prueba en los tres (para escenarios multi-región el mismo día).

| Región       | Nombre del evento        |
|--------------|--------------------------|
| Honduras     | Evento Honduras          |
| Guatemala    | Evento Guatemala         |
| El Salvador  | Evento El Salvador       |

---

## 6. Jurados (4 por región = 12)

Convención: `jurado{numero}region{region}@test.com`

Cada jurado de la región se asigna a **una** rúbrica (rúbrica única por evento):

| Nº | Rúbrica asignada   |
|----|--------------------|
| 1  | Musicalidad        |
| 2  | Coreografía        |
| 3  | Uniformidad        |
| 4  | Presentación       |

### Honduras

| Correo | Rúbrica |
|--------|---------|
| jurado1regionhonduras@test.com | Musicalidad |
| jurado2regionhonduras@test.com | Coreografía |
| jurado3regionhonduras@test.com | Uniformidad |
| jurado4regionhonduras@test.com | Presentación |

### Guatemala

| Correo | Rúbrica |
|--------|---------|
| jurado1regionguatemala@test.com | Musicalidad |
| jurado2regionguatemala@test.com | Coreografía |
| jurado3regionguatemala@test.com | Uniformidad |
| jurado4regionguatemala@test.com | Presentación |

### El Salvador

| Correo | Rúbrica |
|--------|---------|
| jurado1regionelsalvador@test.com | Musicalidad |
| jurado2regionelsalvador@test.com | Coreografía |
| jurado3regionelsalvador@test.com | Uniformidad |
| jurado4regionelsalvador@test.com | Presentación |

---

## 7. Equipo de mesa por región (fiscal, mesa, disciplina)

| Rol | Honduras | Guatemala | El Salvador |
|-----|----------|-----------|-------------|
| Responsable de mesa | responsablemesahonduras@test.com | responsablemesaguatemala@test.com | responsablemesaelsalvador@test.com |
| Fiscal | fiscalhonduras@test.com | fiscalguatemala@test.com | fiscalelsalvador@test.com |
| Comité de disciplina | disciplinahonduras@test.com | disciplinaguatemala@test.com | disciplinaelsalvador@test.com |

Asignar cada uno **solo** al evento de su región.

---

## 8. Roles de gestión (federación)

Un usuario por rol. No van ligados a una sola región.

| Rol | Correo | Nombre sugerido |
|-----|--------|-----------------|
| Admin | admin@test.com | Admin Test |
| Admin temporal | admintemporal@test.com | Admin Temporal Test |
| Secretaria | secretaria@test.com | Secretaria Test |
| Responsable de usuarios | responsableusuarios@test.com | Resp. Usuarios Test |
| Responsable de bandas | responsablebandas@test.com | Resp. Bandas Test |
| Responsable de rúbricas | responsablerubricas@test.com | Resp. Rúbricas Test |
| Responsable de eventos | responsableeventos@test.com | Resp. Eventos Test |

---

## 9. Comentario de evaluación (plantilla)

Al guardar una evaluación como jurado, usar este comentario (o el mismo texto):

```text
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
```

---

## 10. Resumen de cantidades

| Elemento | Cantidad |
|----------|----------|
| Regiones | 3 |
| Categorías | 3 |
| Rúbricas (estructura) | 4 (25 pts c/u) |
| Criterios por rúbrica | 5 |
| Cumplimientos por criterio | 3 (0 / 3 / 5) |
| Bandas | 27 (3×3×3) |
| Dirigentes | 27 |
| Líderes | 27 |
| Jurados | 12 (4×3) |
| Eventos | 3 |
| Responsables de mesa | 3 |
| Fiscales | 3 |
| Disciplina | 3 |
| Roles de gestión | 7 |

---

## 11. Orden de creación (recordatorio)

1. Regiones  
2. Categorías  
3. Rúbricas + criterios + cumplimientos (Lorem ipsum en textos)  
4. Bandas (región + categoría + color)  
5. Eventos (uno por región)  
6. Usuarios (gestión → equipo regional → dirigentes/líderes → jurados)  
7. Asignar equipo evaluador a cada evento  

Detalle de qué probar después: ver `doc/test_por_flujo.md`.
