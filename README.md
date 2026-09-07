# CEPS Paso del Norte — Sistema de Reclutamiento, Expedientes y Seguridad Privada

Monorepo del sistema (CEPS Paso del Norte · Dataholics).  
Desarrollo estructurado bajo la gobernanza y metodología de calidad de **Warhorse-MVP**.

```
apps/web        SPA React 19 + Vite + TypeScript + Tailwind (Front de alta velocidad con UX/UI experto)
apps/api        API REST CodeIgniter 4.7 + Shield (PHP 8.2+, MySQL en Laragon)
docs/           Diagnóstico de Fase 1 (onboarding/discovery) y sistema de tickets (docs/tickets/)
verificar.ps1   Compuerta de calidad: corre TODA la verificación (typecheck + linter + rutas CI4)
```

## Arranque Rápido

### 1. Frontend
```powershell
cd apps\web
npm install
npm run dev          # http://localhost:5173
```

### 2. Backend (Laragon)
```powershell
cd apps\api
composer install     # Ya instalado en scaffolding
php spark serve      # http://localhost:8080 (O acceder vía C:\laragon\www\ceps-api)
```

### 3. Compuerta de Calidad (Obligatoria antes de cada commit / sprint)
```powershell
.\verificar.ps1      # PowerShell
# o en entornos Bash:
./verificar.sh
```

## Gobernanza y Reglas del Proyecto

- **MySQL en Laragon (`ceps_db`) es la Fuente de la Verdad**.
- **Flujo Obligatorio por Tickets**: Ninguna línea de código se modifica sin asociarse a un ticket formal en `docs/tickets/TKT-CEPS-XXX.md`.
- **Gabinete de Skills en `.agents/`**:
  - `vibe-coding-guard`: Prohíbe alucinación de endpoints/tablas, prohíbe llamadas `fetch` fuera de `apps/web/src/lib/api.ts`, exige tipado estricto.
  - `ticket-tracking`: Audita impacto en base de datos, llaves primarias, backend y frontend.
  - `expert-ux-ui`: Jerarquía visual de 3 segundos, densidad escaneable para reclutamiento masivo y mesas de control.
  - `devops-security`: Transacciones ACID, RBAC, prepared statements y aislamiento local.
  - `ceps-brand-identity`: Tokens visuales oficiales e identidad de CEPS Paso del Norte.
