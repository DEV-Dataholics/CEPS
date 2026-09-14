# Ticket: [TKT-CEPS-017] Justificación Central Total y Generación de Código QR Oficial en Ticket PDF

**Autor / Rama**: `feature/2026-09-14-autollenado-domicilio-candidato`
**Módulos Afectados**: [Portal Candidato | Generador de Comprobantes PDF | Módulo de Validación]
**Tipo de Cambio**: Feature UI / UX / PDF Engine

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A.

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno.
- **Controladores / Políticas Shield**: N/A.
- **Servicios de Dominio / Eventos / Auditoría**: N/A.
- **Compatibilidad con Contratos de API**: Plena compatibilidad.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/package.json`:
    - Incorporación de la librería `qrcode` y sus tipos `@types/qrcode`.
  - `apps/web/src/lib/generateCepsReceiptPdf.ts`:
    - Justificación y alineación central total (`align: 'center'`) en todos los bloques, etiquetas, datos, títulos y avisos del comprobante ticket.
    - Generación e inserción de código QR oficial y escaneable codificando el folio único del aspirante (`data.folio`) con margen y contraste optimizados para lectores ópticos y cámaras de smartphones.
    - Ajuste dimensional a una sola página continua de smartphone (95mm x 275mm) con muescas de ticket y estética institucional CEPS.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: N/A.
- **Manejo de Estado / Caché (TanStack Query)**: N/A.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con Laragon (`ceps_db`).
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`npm run typecheck`).
- [x] Sin errores de linter (`npm run lint`).
- [x] Resumen claro redactado.
