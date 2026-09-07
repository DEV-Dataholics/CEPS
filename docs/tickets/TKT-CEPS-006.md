# Ticket: [TKT-CEPS-006] Filtros y Paginación en Gestor de Vacantes & Salida de Consulta de Estatus

**Autor / Rama**: `main`
**Módulos Afectados**: [Gestor de Vacantes | Consulta Estatus por Folio | Catálogo Vacantes]
**Tipo de Cambio**: Feature UI / UX Enhancement

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Estado gestionado en frontend y localStorage versión 2).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno. Backend verificado en verde.
- **Controladores / Políticas Shield**: N/A
- **Servicios de Dominio / Eventos / Auditoría**: N/A
- **Compatibilidad con Contratos de API**: 100% compatible.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/components/VacancyCard.tsx`: Se agregaron clases `whitespace-nowrap`, `flex-shrink-0` y `min-w-0 flex-1` en la cabecera para garantizar que la etiqueta de "plazas libres" nunca se corte ni se rompa en dos líneas.
  - `apps/web/src/store/vacancyStore.ts`: Se ampliaron las vacantes de prueba a 15 maquiladoras auténticas de Ciudad Juárez (Lear, Foxconn, Flex, BRP, Campos Elíseos, Aptiv, Bosch, Yazaki, CommScope, Wistron, Honeywell, Pegatron, Electrolux, Johnson Controls, The Toro Company) y se actualizó la clave de persistencia a `ceps_vacancies_v2`.
  - `apps/web/src/pages/VacancyManagerView.tsx`: Se incorporó barra de filtros con buscador en tiempo real (empresa, planta, puesto, parque industrial), chips de estado (`Todas`, `Con Plazas Libres`, `Cubiertas al 100%`), selector de turno, selector de elementos por página (4, 6, 8, 15), contador de resultados y paginación interactiva con botones numéricos y Anterior/Siguiente.
  - `apps/web/src/pages/CandidateStatusTrackingView.tsx`: Se eliminaron los botones de "folios de prueba rápida". Se añadió la funcionalidad de "Salir de Consulta" / "Nueva Consulta" tanto en el buscador, cabecera de tarjeta y barra de acciones, permitiendo regresar a la pantalla inicial limpia de búsqueda.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: Sin alteraciones.
- **Manejo de Estado / Caché (Zustand)**: Paginación y filtros reactivos con `useMemo`.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con `./verificar.ps1`.
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`tsc --noEmit` pasado con 0 errores).
- [x] Sin errores de linter (`oxlint` pasado con 0 errores y 0 warnings en 18 archivos).
- [x] Rutas CodeIgniter 4 validadas con `php spark routes`.
