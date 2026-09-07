# Ticket: [TKT-CEPS-001] Inicialización de Monorepo, Ecosistema de Agentes y Compuertas de Calidad

**Autor / Rama**: `main`  
**Módulos Afectados**: [Infraestructura | Frontend Base | Backend API Laragon | Agentes y Skills | Control de Versiones]  
**Tipo de Cambio**: [Feature Infraestructura / Scaffolding]  

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO (Inicialización)
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO (Pendiente definición de tablas para Sprint 1)
- [ ] **Detalle de cambios DDL**: N/A

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: `GET /api/v1/health` (Endpoint de verificación de estado y conexión a Laragon).
- **Controladores / Políticas Shield**: Scaffolding base de CodeIgniter 4.
- **Servicios de Dominio / Eventos / Auditoría**: Preparación de arquitectura base para autenticación y expedientes de personal.
- **Compatibilidad con Contratos de API**: Arquitectura REST unificada con responses JSON estandarizados.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**: Scaffolding de `apps/web` con Vite + React 19 + TypeScript + Tailwind.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: Creación del cliente HTTP canónico tipado para evitar peticiones `fetch` descontroladas.
- **Manejo de Estado / Caché (TanStack Query)**: Configuración inicial del QueryClient.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Reglas del orquestador y 5 skills (`vibe-coding-guard`, `ticket-tracking`, `expert-ux-ui`, `devops-security`, `ceps-brand-identity`) configuradas en `.agents/`.
- [x] Documentación y diagnósticos de Fase 1 resguardados en `docs/`.
- [x] Backend CodeIgniter 4 inicializado en `apps/api/` con `.env.example` y `.env`.
- [x] Frontend React/Vite inicializado en `apps/web/` con tipado estricto y cliente `api.ts`.
- [x] Script de compuerta `verificar.ps1` / `verificar.sh` validado en verde (0 errores, 0 warnings).
- [x] Repositorio Git inicializado y vinculado al repositorio privado `CEPS` en GitHub (`https://github.com/gruizmetasolutions-cpu/CEPS`).
