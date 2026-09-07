# Ticket: [TKT-CEPS-003] Vista del Candidato Mobile-First (Módulo 1: Ingesta Digital, Pin-Drop y Comprobante PDF)

**Autor / Rama**: `main`  
**Módulos Afectados**: [Portal Candidato | Módulo 1 Ingesta | Geolocalización Domiciliaria | Carga Documental | Generación PDF]  
**Tipo de Cambio**: [Feature UI / Módulo Operativo]  

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO (Fase Frontend Primero, simulación y validación previa de payload)
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO en este paso (preparando estructura de payload para siguiente paso)
- [ ] **Detalle de cambios DDL**: N/A

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Preparado para consumir `POST /api/v1/candidatos`.
- **Controladores / Políticas Shield**: N/A
- **Servicios de Dominio / Eventos / Auditoría**: Generación estandarizada de Folios tipo `CEPS-2026-XXXX`.
- **Compatibilidad con Contratos de API**: Payload JSON desacoplado.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**: 
  - `apps/web/src/components/LocationPicker.tsx` (Componente de mapa interactivo con OpenStreetMap / Leaflet y Pin-Drop para sustituir el croquis a mano del Estudio Socioeconómico).
  - `apps/web/src/pages/CandidateRegistrationView.tsx` (Wizard móvil en 4 pasos basado en `CEPS-RH04-023 SOLICITUD DE EMPLEO` y el Blueprint).
  - Generador de comprobante de cita en PDF con Folio oficial usando `jsPDF`.
  - Integración en `apps/web/src/App.tsx` con acceso directo y switcher.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: Tipado estricto del payload del candidato.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Dependencias `leaflet`, `@types/leaflet`, `jspdf`, `zustand` y `zod` instaladas.
- [x] Arquitectura de Wizard conforme a la Guía Maestra (Zustand + Zod + Checkpoint de Revisión Final).
- [x] Responsive nativo mobile-first sin carcasas ni emulaciones artificiales de smartphone.
- [x] Mapa Leaflet interactivo con pin arrastrable centrado en Ciudad Juárez y accesos directos por zona.
- [x] Wizard de 5 pasos con validación Zod en tiempo real y persistencia offline en LocalStorage.
- [x] Modal UI de confirmación accesible para "Nuevo Registro" (sin dialogs nativos bloqueantes) y botón de "Cargar Demo".
- [x] Carga fotográfica de documentos con previsualización.
- [x] Generación y descarga de comprobante en PDF con Folio CEPS y compartir por WhatsApp.
- [x] Cero errores de TypeScript (`npm run typecheck`).
- [x] Cero advertencias de linter (`npm run lint`).
- [x] Compuerta `./verificar.ps1` en verde.
