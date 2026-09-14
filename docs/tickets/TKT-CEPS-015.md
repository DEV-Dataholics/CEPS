# Ticket: [TKT-CEPS-015] Rediseño de Comprobante PDF a Formato Ticket Móvil para Pantallas de Celular

**Autor / Rama**: `feature/2026-09-14-autollenado-domicilio-candidato`
**Módulos Afectados**: [Portal Candidato | Generador de Comprobantes PDF | Seguimiento de Estatus]
**Tipo de Cambio**: Feature UI / UX / PDF Engine

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Ajuste estrictamente visual y dimensional en generación de comprobante PDF).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno.
- **Controladores / Políticas Shield**: N/A.
- **Servicios de Dominio / Eventos / Auditoría**: N/A.
- **Compatibilidad con Contratos de API**: Plena compatibilidad con los contratos y modelos existentes.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/lib/generateCepsReceiptPdf.ts`:
    - Sustitución del formato de hoja de escritorio A4 por un formato ticket móvil vertical (95mm x 250mm aprox., adaptado al viewport vertical de smartphones).
    - Reemplazo de coordenadas horizontales rígidas por flujo dinámico vertical de clave-valor (`splitTextToSize`), eliminando al 100% las colisiones y traslapes de texto identificadas en nombres largos, CURP, RFC y puestos.
    - Incorporación de muescas laterales de ticket (estilo pase digital/ticket físico), folio prominente con código de barras digital, badges de documentos y caja de indicaciones optimizada para legibilidad en pantallas táctiles sin necesidad de zoom.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: N/A.
- **Manejo de Estado / Caché (TanStack Query)**: N/A.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con Laragon (`ceps_db`).
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`npm run typecheck`).
- [x] Sin errores de linter (`npm run lint`).
- [x] Resumen claro redactado.
