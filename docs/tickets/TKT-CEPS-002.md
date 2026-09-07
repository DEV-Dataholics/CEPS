# Ticket: [TKT-CEPS-002] Catálogo de Componentes y Guía Visual de UX/UI (Demo UI Kit de CEPS)

**Autor / Rama**: `main`  
**Módulos Afectados**: [UI Kit | Sistema de Diseño | Reclutamiento | Mesa de Validación | Contratación]  
**Tipo de Cambio**: [Feature UI / Guía Visual]  

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno (Vista pura de Frontend y UI Kit)
- **Controladores / Políticas Shield**: N/A
- **Servicios de Dominio / Eventos / Auditoría**: N/A
- **Compatibilidad con Contrato Existente**: Totalmente desacoplado

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**: 
  - Incorporación del logo oficial sobre azul marino institucional (`#0F1E36`).
  - Creación de vista Demo UX/UI interactiva con:
    1. Tipografía y Tokens de Color Oficiales (`--ceps-navy`, `--ceps-gold`, semánticos).
    2. Botones y Variantes (Primarios, Dorados, Secundarios, Peligro, Icon Buttons, Estados Loading).
    3. Badges e Indicadores de Estado (Aprobado, En Validación, Citado, Reprobado, Excepción).
    4. Inputs y Filtros Operativos (Buscadores con ícono, Selects, Toggles, Checks).
    5. Tablas de Alta Densidad (Listado de candidatos con acciones, folios, módulos y estatus).
    6. Estados del Ciclo de Vida (Skeletons con shimmer, Empty States ergonómicos, Alertas y Toasts).
    7. Stepper de Proceso Operativo de Reclutamiento a Contratación.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: Mantiene compatibilidad y tipado estricto.
- **Manejo de Estado**: React local state interactivo para filtrar y probar componentes.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Logo oficial incorporado en barra y fondo azul corporativo (`docs/ceps-logo (1).png`).
- [x] Sin romper tipado TypeScript (`npm run typecheck`).
- [x] Sin errores de linter (`npm run lint`).
- [x] Cumple contraste WCAG AA y estándares de `expert-ux-ui` y `ceps-brand-identity`.
- [x] Compuerta `./verificar.ps1` en verde.
