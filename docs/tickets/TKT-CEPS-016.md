# Ticket: [TKT-CEPS-016] Incorporación de Modal de Revisión de Postulación en Bandeja de Solicitudes de Vacantes

**Autor / Rama**: `feature/2026-09-14-autollenado-domicilio-candidato`
**Módulos Afectados**: [Administrador de Vacantes | Bandeja de Solicitudes | Empate Operativo]
**Tipo de Cambio**: Feature UI / UX

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Ajuste a nivel cliente para visualización y auditoría operativa de expedientes en bandeja).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno.
- **Controladores / Políticas Shield**: N/A.
- **Servicios de Dominio / Eventos / Auditoría**: N/A.
- **Compatibilidad con Contratos de API**: Plena compatibilidad con los modelos existentes de `AspiranteSolicitud`.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/components/CandidateReviewModal.tsx`:
    - Creación de modal de auditoría y revisión integral de la postulación (identidad, validaciones RENAPO/SAT, teléfono con acción WhatsApp, módulo de abordaje, croquis georreferenciado con enlace a mapas, lista de documentos digitalizados y descarga directa de ticket PDF).
    - Acciones rápidas al pie del modal para aprobar/asignar a vacante o poner en espera sin perder el contexto.
  - `apps/web/src/components/ApplicantInbox.tsx`:
    - Inclusión del botón *"Revisar"* con icono `Eye` en las tarjetas de la bandeja de solicitudes (nuevas, en espera y asignadas).
    - Prop `onRevisarCandidato` para activar el modal de inspección.
  - `apps/web/src/pages/VacancyManagerView.tsx`:
    - Manejo del estado `candidatoParaRevisar` y renderizado de `CandidateReviewModal`.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: N/A.
- **Manejo de Estado / Caché (TanStack Query)**: `useVacancyStore`.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con Laragon (`ceps_db`).
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`npm run typecheck`).
- [x] Sin errores de linter (`npm run lint`).
- [x] Resumen claro redactado.
