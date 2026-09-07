# Ticket: [TKT-CEPS-008] Wizard de Entrevista en Tablet & Archivo de Expedientes / Dossiers de Seguridad

**Autor / Rama**: `main`
**Módulos Afectados**: [Expedientes de Guardias | Wizard de Abordaje en Campo | Examen de Razonamiento VER5 | Cuestionario RH | Solicitud Digital | Checklist de Papelería]
**Tipo de Cambio**: Core Architecture Feature / Tablet Field UX & Security Dossiers

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Persistencia Zustand con clave `ceps_dossiers_v1`, unificando datos de abordaje, examen VER5, cuestionario de 10 preguntas, auditoría confidencial, solicitud digital y checklist).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno. Rutas verificadas con `php spark routes`.
- **Compatibilidad con Contratos de API**: 100% compatible.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/types/dossierTypes.ts`: Tipos oficiales para el flujo presencial en 5 etapas (Flujo 3 de Eunice Lira y Juan Antonio Ramos): `DatosAbordaje`, `ExamenRazonamientoRespuestas`, `ExamenRazonamientoEvaluacion`, `CuestionarioEntrevistaRespuestas`, `AuditoriaIntegridad`, `SolicitudEmpleoDigital`, `ChecklistPapeleriaOriginal`, `ExpedienteGuardia`.
  - `apps/web/src/store/dossierStore.ts`: Store con motor de auditoría de integridad interna (evaluación de riesgo de robo, apego a cadena de mando, nivel de tolerancia y banderas rojas). Pre-sembrado con 5 casos auténticos de Ciudad Juárez (Foxconn, Lear, Soriana San Lorenzo, etc.).
  - `apps/web/src/components/FieldInterviewWizard.tsx`: Wizard táctil optimizado para tablet con touch targets amplios (48px+), selector numérico táctil de tolerancia (1 a 10), resolución del Examen VER5 con conteo automático de errores (límite 8), neutralidad visual ante el aspirante, captura de solicitud de empleo digital sin descarte de hojas por tachaduras y confirmación de checklist de papelería.
  - `apps/web/src/pages/GuardDossiersView.tsx`: Vista de archivos y dossiers en pantalla dividida (Split Screen) con estética sobria de carpetas de investigación y seguridad nacional (`#0A162B` Navy, acentos `#D4AF37`, cejillas de manila folder, sellos de estatus troquelados, fotos tipo gafete y visor de expediente con 6 pestañas).
  - `apps/web/src/App.tsx`: Botón de acceso "Expedientes de Guardias" y renderizado condicional.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado con `./verificar.ps1`.
- [x] Sin romper tipado TypeScript (`tsc --noEmit` con 0 errores).
- [x] Cero advertencias de linter (`oxlint` con 0 warnings y 0 errores en 25 archivos).
- [x] Compilación de producción con Vite (`npm run build`) completada con éxito.
- [x] Rutas de backend CodeIgniter 4 validadas.
