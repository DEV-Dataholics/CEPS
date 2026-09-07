# Ticket: [TKT-CEPS-004] Administrador de Vacantes por Empresa & Bandeja de Solicitudes (Módulo 2: Empate Operativo y Cartera en Espera)

**Autor / Rama**: `main`  
**Módulos Afectados**: [Gestor de Vacantes | Bandeja de Solicitudes | Empate de Candidatos | Cartera en Espera | Asignación Maquilas Juárez]  
**Tipo de Cambio**: [Feature UI / Módulo Administrativo Operativo]  

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO (Fase Frontend Primero con tipado estricto y persistencia offline)
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO en esta iteración de interfaz
- [ ] **Detalle de cambios DDL**: N/A

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Futuros a Consumir**: `GET /api/v1/vacantes`, `POST /api/v1/vacantes`, `POST /api/v1/vacantes/:id/asignar`, `POST /api/v1/candidatos/:id/espera`.
- **Controladores / Políticas Shield**: RBAC preparado para roles Administrador y Reclutador/Coordinador.
- **Servicios de Dominio / Eventos / Auditoría**: Registro de motivo de pase a espera y cálculo reactivo de cupos cubiertos.
- **Compatibilidad con Contratos de API**: Payload JSON desacoplado tipado mediante Zod.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**: 
  - `apps/web/src/schemas/vacancySchema.ts` (Esquema de validación Zod para vacantes).
  - `apps/web/src/store/vacancyStore.ts` (Store Zustand con persistencia offline en `localStorage` de vacantes, cupos y aspirantes).
  - `apps/web/src/components/VacancyCard.tsx` (Tarjeta de vacante completa con barra de cupo visual, turno, sueldo y aspirantes asignados).
  - `apps/web/src/components/ApplicantInbox.tsx` (Bandeja de solicitudes filtrada por módulo de abordaje, fecha y estado).
  - `apps/web/src/components/NewVacancyModal.tsx` (Modal de creación de vacantes con validación Zod).
  - `apps/web/src/components/AssignCandidateModal.tsx` (Modal de acción rápida para aprobar/asignar o enviar a cartera en espera).
  - `apps/web/src/pages/VacancyManagerView.tsx` (Vista en doble panel interactivo con métricas operativas).
  - `apps/web/src/App.tsx` (Navegación superior actualizada con acceso al Gestor de Vacantes).

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Esquemas Zod implementados en `vacancySchema.ts`.
- [x] Store Zustand implementado con persistencia offline en `localStorage`.
- [x] Bandeja de solicitudes con filtro por módulo de abordaje y fecha.
- [x] Pestañas de "Nuevas Solicitudes" y "Cartera en Espera" con motivo.
- [x] Tarjetas de vacantes con indicador de cupo (ej. 3/5 cubiertos) y candidatos asignados.
- [x] Modal de "+ Nueva Vacante" con validación.
- [x] Modal de decisión rápida (Aprobar vs Poner en Espera con motivo).
- [x] Sincronización automática de aspirantes registrados en el Portal Móvil.
- [x] Cero errores de TypeScript (`npm run typecheck`).
- [x] Cero advertencias de linter (`npm run lint`).
- [x] Compuerta `./verificar.ps1` en verde.
