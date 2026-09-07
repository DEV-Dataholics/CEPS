# Ticket: [TKT-CEPS-009] Refactorización de Navegación: Sidebar Lateral Colapsable y Gobernanza de Accesos (RBAC)

**Autor / Rama**: `main`
**Módulos Afectados**: [Arquitectura de Navegación | Sidebar Lateral | Header Institucional | Gobernanza RBAC | App Shell]
**Tipo de Cambio**: Core Architecture Feature / Navigation & Access Governance

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Estado y sesión gestionados en `localStorage` con la clave `ceps_auth_role_v1`).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**: Ninguno. Backend verificado en verde.
- **Compatibilidad con Contratos de API**: 100% compatible.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/store/authStore.ts`: Store Zustand para gobernanza de accesos con 5 perfiles operativos (`reclutador_campo`, `supervision_rh`, `direccion_operativa`, `candidato_externo`, `admin_ti`), metadata departamental y control de estado de colapso y drawer móvil.
  - `apps/web/src/components/AppSidebar.tsx`: Sidebar lateral colapsable (260px expandido / 72px colapsado) con selector de perfil RBAC, iconos con tooltips, badges de departamento y drawer táctil para dispositivos móviles. Filtra estrictamente las opciones según la matriz de permisos.
  - `apps/web/src/components/AppHeader.tsx`: Cabecera superior despejada y ejecutiva que muestra el título y descripción de la vista activa, indicador de backend (`🟢 CI4 Backend`), badge del rol activo y botón de acción rápida `⚡ Abordaje en Tablet`.
  - `apps/web/src/App.tsx`: Reemplazo del selector horizontal saturado por la estructura de layout `flex-row` con `AppSidebar` y `AppHeader`. Validación dinámica de la vista efectiva para evitar desajustes o renderizados de vistas no autorizadas.
  - `apps/web/src/index.css`: Inclusión de clases utilitarias de scrollbars personalizados y `.no-scrollbar`.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado con `./verificar.ps1`.
- [x] Sin romper tipado TypeScript (`tsc --noEmit` con 0 errores).
- [x] Cero advertencias de linter (`oxlint` con 0 warnings y 0 errores en 28 archivos).
- [x] Compilación de producción con Vite (`npm run build`) completada con éxito en 11.98s.
- [x] Rutas de backend CodeIgniter 4 validadas.
