# Ticket: [TKT-CEPS-012] Corrección de Integridad en Catálogos de Aspirante y Estabilidad de Escáner de Documentos

**Autor / Rama**: `main`
**Módulos Afectados**: [Portal Candidato | Estación de Escaneo | Módulos y Puestos]
**Tipo de Cambio**: Fix

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Ajuste a nivel cliente / frontend en consumo de catálogos en memoria y renderizado reactivo).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno.
- **Controladores / Políticas Shield**: N/A.
- **Servicios de Dominio / Eventos / Auditoría**: N/A.
- **Compatibilidad con Contratos de API**: Plena compatibilidad con los modelos existentes de catálogo (`PuestoCatalog`, `ModuloAbordajeCatalog`, `TurnoCatalog`).

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/pages/CandidateRegistrationView.tsx`:
    - Corrección en el Paso 2 (Postulación) para el select de Puestos: se reemplazó el acceso erróneo a la propiedad inexistente `p.sueldoSugeridoSemanalNeto` (que arrojaba `Cannot read properties of undefined (reading 'toLocaleString')`) por lectura segura de `p.sueldoNumerico` con formateo `$#.## /sem` o `p.sueldoSemanalSugerido`.
    - Corrección en el select de Módulos: se sustituyó `m.zona` por `m.zonaJuarez` acorde al contrato tipado de `ModuloAbordajeCatalog`.
    - Corrección en el select de Turnos: se sustituyó `t.horarioEntradaSalida` por `${t.horarioEntrada} - ${t.horarioSalida}` o `t.descripcion`.
  - `apps/web/src/components/FieldInterviewWizard.tsx`:
    - Corrección análoga en el selector de módulos sustituyendo `m.zona` por `m.zonaJuarez`.
  - `apps/web/src/components/LocationPicker.tsx`:
    - Eliminación de referencias residuales a `verificadoPorIne` en campos de calle, colonia y código postal para prevenir excepciones en tiempo de ejecución (`ReferenceError: verificadoPorIne is not defined`).
  - `apps/web/src/components/DocumentScannerGate.tsx` y `apps/web/src/lib/mexicanIdParser.ts`:
    - Eliminación total de importaciones e invocaciones obsoletas de catálogos demo (`DIRECTORIO_INE_DEMO`, `CATALOGO_CURP_DEMO`) que provocaban `SyntaxError: does not provide an export named 'DIRECTORIO_INE_DEMO'` y `TypeError: Cannot read properties of undefined (reading 'curp')`.
    - El escaneo opera 100% en vivo (cámara/lector HID láser) o respaldo manual, sin botones de simulación.
    - La tarjeta de alerta de duplicidad se condiciona estrictamente: solo se muestra en pantalla roja/ámbar si existe duplicidad real en la base de aspirantes; no se muestra si el aspirante es nuevo y limpio.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con Vite y dev server activo.
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`npm run typecheck`).
- [x] Sin errores de linter (`npm run lint`).
- [x] Resumen claro y trazabilidad formal registrada.
