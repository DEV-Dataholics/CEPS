# Ticket: [TKT-CEPS-019] Baja Operativa (Cascading Offboarding), Validador SAT en Vivo y Modo Quiosco Tablet

**Autor / Rama**: `feature/2026-09-15-sesion-desarrollo`
**Módulos Afectados**: [Contratación | Gestor de Vacantes | Mesa Validación / Escáner | Evaluación Psicométrica / Tablet | Gobernanza RBAC]
**Tipo de Cambio**: Feature Fullstack / UX Operativa / Integración de Identidad

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO (Operaciones transaccionales en Zustand y sincronización con dossiers; migraciones DDL preparadas para fase de persistencia backend).
- [ ] **Detalle de cambios DDL**: N/A.

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**:
  - `GET /api/v1/sat/consultar`: Controlador `SatValidator.php` para consulta y extracción de datos oficiales de la Cédula de Identificación Fiscal (CIF) en `siat.sat.gob.mx` con validación de seguridad contra SSRF.
- **Controladores / Políticas Shield**: `SatValidator` hereda de `ResourceController`.
- **Servicios de Dominio / Eventos / Auditoría**: Consulta cURL segura con validación de URL y extracción de respaldo por regex.
- **Compatibilidad con Contratos de API**: Plena compatibilidad con el cliente `api.ts`.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/components/VacancyCard.tsx`:
    - Incorporación de modal y flujo de Baja Operativa de Guardia (*Cascading Offboarding*).
    - Desasignación automática del guardia y reapertura inmediata de la vacante para reemplazo de personal.
    - Captura de motivo de baja y opción de marcar como NO CONTRATABLE (Veto Administrativo).
  - `apps/web/src/components/DocumentScannerGate.tsx` y `apps/web/src/lib/mexicanIdParser.ts`:
    - Integración de escaneo de códigos de barras RENAPO con delimitadores `]` o `|`.
    - Lectura de MRZ en reverso de credenciales INE (`PATERNO<<MATERNO<NOMBRES`).
    - Consulta en vivo del QR del SAT conectando con `/api/v1/sat/consultar`.
    - Feedback sonoro táctico (beeps sintetizados estilo Zebra/Honeywell) usando Web Audio API.
  - `apps/web/src/pages/CandidateExamTabletView.tsx` (NUEVO):
    - Modo Quiosco Tablet para el aspirante con autenticación por Folio.
    - Aplicación interactiva autónoma del Examen de Razonamiento VER5 (comprensión lectora, aritmética y lógica).
  - `apps/web/src/store/vacancyStore.ts`:
    - Acciones `darDeBajaEmpleado`, `setNoContratable` y `habilitarExamen`.
    - Estado de aspirantes con campos `noContratable`, `motivoNoContratable` y `examenesHabilitados`.
  - `apps/web/src/lib/duplicityChecker.ts`:
    - Detección y bloqueo estricto de aspirantes vetados por CURP o Folio.
  - `apps/web/src/store/authStore.ts`, `apps/web/src/components/AppSidebar.tsx` y `AppHeader.tsx`:
    - Gobernanza RBAC para las nuevas vistas `gestion_candidatos` y `examen_tablet`.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con compuerta integral (`.\verificar.ps1`).
- [x] Cero llamadas residuales o URLs duras externas en componentes.
- [x] Sin romper tipado TypeScript (`npx tsc --noEmit` pasado con 0 errores).
- [x] Sin errores bloqueantes de linter (`oxlint` en verde).
- [x] Rutas de CodeIgniter 4 validadas con `php spark routes`.
- [x] Resumen claro y trazabilidad garantizada.
