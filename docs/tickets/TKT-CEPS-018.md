# Ticket: [TKT-CEPS-018] Creación del Módulo de Gestión de Candidatos y Filtro de Guardias Activos en Gestor de Vacantes

**Autor / Rama**: `feature/2026-09-14-autollenado-domicilio-candidato`
**Módulos Afectados**: [Gestión de Candidatos | Gestor de Vacantes | Expedientes / Dossiers | Store Vacancy & Auth]
**Tipo de Cambio**: Feature UI / UX / Arquitectura de Estados y Flujos de Selección

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A. Operaciones administradas en Zustand y sincronización con dossiers.

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno en esta fase SPA (sincronización preparada para endpoints de ingesta).
- **Controladores / Políticas Shield**: N/A.
- **Servicios de Dominio / Eventos / Auditoría**: N/A.
- **Compatibilidad con Contratos de API**: Plena compatibilidad tipada.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/store/vacancyStore.ts`:
    - Incorporación de estados de evaluación para aspirantes: `'nuevo' | 'en_evaluacion' | 'activo' | 'asignado' | 'en_espera'`.
    - Estructuras de datos para examen de razonamiento, cuestionario de integridad RH, checklist de papelería física y dispensa RH.
    - Acciones `guardarExamenRazonamiento`, `guardarCuestionarioIntegridad`, `actualizarChecklistPapeleria` y `darDeAltaCandidato`.
    - Generación y sincronización automática del Expediente Oficial (Dossier) en `dossierStore` al dar de alta.
  - `apps/web/src/store/dossierStore.ts`:
    - Exportación del motor de calificación `evaluarRazonamiento` (lectura, aritmética y lógica) con límite estricto de 8 errores.
  - `apps/web/src/store/authStore.ts`:
    - Incorporación del `VistaId: 'gestion_candidatos'` y asignación a roles de RH y Operaciones.
  - `apps/web/src/pages/CandidateManagementView.tsx` (NUEVO):
    - Vista dedicada con búsqueda por Folio/QR, métricas ejecutivas, selector de candidatos en proceso.
    - Modalidad dual: vista administrativa para reclutador y Modo Quiosco Tablet para el aspirante.
    - 4 secciones: Solicitud y contacto, Examen de Razonamiento VER5, Cuestionario de Integridad RH y Checklist de Papelería Original (8 documentos).
    - Doble flujo de alta: Alta Oficial (100% aprobatoria) y Alta con Dispensa RH justificada.
  - `apps/web/src/components/ApplicantInbox.tsx`:
    - Blindaje de la bandeja del Gestor de Vacantes para mostrar únicamente candidatos con `estatus === 'activo'` (Guardias Activos Disponibles), impidiendo la visualización de aspirantes no aprobados o en proceso.
  - `apps/web/src/components/AppSidebar.tsx` y `apps/web/src/components/AppHeader.tsx`:
    - Inclusión del enlace de navegación en orden secuencial lógico (Paso 2) y registro con fallback defensivo en cabecera.
  - `apps/web/src/App.tsx`:
    - Enrutamiento dinámico montando `CandidateManagementView`.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con Laragon (`ceps_db`).
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`npm run build` / `tsc --noEmit` completado con 0 errores).
- [x] Sin errores de linter.
- [x] Resumen claro redactado en ticket y walkthrough.
