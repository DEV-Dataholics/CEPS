# Ticket: [TKT-CEPS-005] Mensaje General Institucional para Pasos 3 y 4 (Evaluación Médica y Antidoping)

**Autor / Rama**: `main`
**Módulos Afectados**: [Portal Candidato | Consulta Estatus | Expedición de Comprobantes PDF | Médica/Antidoping]
**Tipo de Cambio**: Feature UI / Content Refinement

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Ajuste a nivel de mensajería operativa del cliente).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno. Backend verificado en verde.
- **Controladores / Políticas Shield**: N/A
- **Servicios de Dominio / Eventos / Auditoría**: N/A
- **Compatibilidad con Contratos de API**: 100% compatible.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/pages/CandidateStatusTrackingView.tsx`: Consolidación de etapas 3 y 4 en un solo paso unificado con badge "Atención Personalizada por Reclutamiento" y aviso de contacto directo vía llamada o WhatsApp.
  - `apps/web/src/pages/CandidateRegistrationView.tsx`: Inclusión de aviso institucional en el Paso 6 (pantalla de confirmación y emisión de folio).
  - `apps/web/src/lib/generateCepsReceiptPdf.ts`: Reemplazo del horario fijo ("8:00 AM") por indicaciones de contacto directo del equipo de reclutamiento.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: Sin cambios.
- **Manejo de Estado / Caché (TanStack Query / Zustand)**: Sin alteraciones en el estado de aspirantes.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con `./verificar.ps1`.
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`tsc --noEmit` pasado con 0 errores).
- [x] Sin errores de linter (`oxlint` pasado con 0 errores y 0 warnings en 18 archivos).
- [x] Rutas CodeIgniter 4 validadas con `php spark routes`.
- [x] Verificación visual en navegador confirmada mediante screenshot y subagente.
