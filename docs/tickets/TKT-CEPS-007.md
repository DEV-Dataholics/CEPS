# Ticket: [TKT-CEPS-007] Administrador de Catálogos Maestros del Sistema (CEPS Paso del Norte)

**Autor / Rama**: `main`
**Módulos Afectados**: [Catálogos del Sistema | Gestor de Vacantes | Portal Candidato]
**Tipo de Cambio**: Core Feature / Master Data Management

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Persistencia local en `localStorage` con clave `ceps_catalogs_v1` pre-sembrada con datos auténticos del sector maquilador de Ciudad Juárez).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno. Rutas verificadas con `php spark routes`.
- **Controladores / Políticas Shield**: N/A
- **Compatibilidad con Contratos de API**: 100% compatible.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/types/catalogTypes.ts`: Tipado estricto para los 4 catálogos maestros (`ClientePlantaCatalog`, `TurnoCatalog`, `PuestoCatalog`, `ModuloAbordajeCatalog`).
  - `apps/web/src/store/catalogStore.ts`: Store Zustand persistente con operaciones CRUD, borrado lógico (`activo`/`inactivo`), buscador y 15 maquiladoras juarenses auténticas sembradas.
  - `apps/web/src/pages/CatalogManagerView.tsx`: Vista dedicada con 4 tarjetas de métricas operativas, navegación interna por pestañas, filtros por estado, tablas y modal responsivo de Alta/Edición.
  - `apps/web/src/components/NewVacancyModal.tsx`: Selectores rápidos "Cargar desde Catálogos Maestros CEPS" para Clientes, Puestos y Turnos.
  - `apps/web/src/pages/CandidateRegistrationView.tsx`: Dropdowns de Paso 2 alimentados dinámicamente desde `useCatalogStore`.
  - `apps/web/src/App.tsx`: Incorporación de botón y enrutamiento a `Catálogos del Sistema`.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado con `./verificar.ps1`.
- [x] Sin romper tipado TypeScript (`tsc --noEmit` con 0 errores).
- [x] Cero advertencias de linter (`oxlint` con 0 warnings y 0 errores).
- [x] Rutas de backend CodeIgniter 4 validadas.
