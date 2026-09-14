# Ticket: [TKT-CEPS-013] Énfasis y Optimización Visual de Llenado Automático de Domicilio por GPS

**Autor / Rama**: `feature/2026-09-14-autollenado-domicilio-candidato`
**Módulos Afectados**: [Reclutamiento Campo | Portal Candidato | Croquis Domiciliario]
**Tipo de Cambio**: Feature UI / UX

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Ajuste estrictamente en experiencia de usuario y jerarquía visual del Paso 3 de Registro).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno.
- **Controladores / Políticas Shield**: N/A.
- **Servicios de Dominio / Eventos / Auditoría**: N/A.
- **Compatibilidad con Contratos de API**: Plena compatibilidad con el modelo de domicilio y coordenadas `latitud`/`longitud` persistidas.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/components/LocationPicker.tsx`:
    - Rediseño enfático del botón de geolocalización convirtiéndolo en un bloque de acción de alta prioridad con identidad visual CEPS (Azul Medianoche `#0A162B`, Oro `#D4AF37`, gradientes sutiles y micro-interacción).
    - Copia orientada a beneficio directo: *"Llenado automático (estoy en casa)"* con texto de apoyo *"Si estás en tu domicilio, llena automáticamente tu ubicación GPS"*.
    - Indicador de éxito reactivo cuando se obtiene y fija la posición GPS en el mapa.
    - Preservación accesible de las zonas rápidas de Ciudad Juárez para candidatos fuera de casa.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: Sin llamadas externas directas fuera de la geolocalización nativa del navegador.
- **Manejo de Estado / Caché (TanStack Query)**: N/A.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con Laragon (`ceps_db`).
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`npm run typecheck`).
- [x] Sin errores de linter (`npm run lint`).
- [x] Resumen claro redactado.
