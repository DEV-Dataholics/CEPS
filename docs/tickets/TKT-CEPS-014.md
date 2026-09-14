# Ticket: [TKT-CEPS-014] Autollenado Inteligente de Formulario Domiciliario mediante Geocodificación Inversa GPS

**Autor / Rama**: `feature/2026-09-14-autollenado-domicilio-candidato`
**Módulos Afectados**: [Portal Candidato | Registro Aspirante | Módulo Domicilio / Geocodificación]
**Tipo de Cambio**: Feature Fullstack (Backend CI4 + Frontend React SPA)

---

### 1. ALERTA DE IMPACTO EN BASE DE DATOS (CRÍTICO)
- [ ] **¿Modifica esquemas existentes?**: NO
- [ ] **¿Altera Llaves Primarias (PKs) o Auto-incrementables?**: NO
- [ ] **¿Modifica Llaves Foráneas (FKs) o restricciones de integridad?**: NO
- [ ] **¿Requiere nueva migración CodeIgniter 4?**: NO
- [ ] **Detalle de cambios DDL**: N/A (Los campos ya existen en el modelo de aspirante; se automatiza su población).

### 2. IMPACTO EN BACKEND (API CI4)
- **Endpoints Nuevos / Modificados**:
  - `GET /api/v1/geocoding/reverse?lat={lat}&lng={lng}`: Resuelve coordenadas geográficas contra OpenStreetMap Nominatim de forma segura, normalizando calle, número exterior, colonia/fraccionamiento y código postal para Ciudad Juárez y Chihuahua.
- **Controladores / Políticas Shield**:
  - Nuevo controlador `App\Controllers\Geocoding` extendiendo `ResourceController`.
  - Configuración estricta de `User-Agent` oficial y timeout de 4s para prevenir cuellos de botella.
- **Servicios de Dominio / Eventos / Auditoría**: Servicio de utilidad de geocodificación inversa.
- **Compatibilidad con Contratos de API**: Contrato tipado `ReverseGeocodeResponse`.

### 3. IMPACTO EN FRONTEND (REACT SPA)
- **Componentes y Vistas Afectadas**:
  - `apps/web/src/lib/api.ts`:
    - Incorporación de interfaz `ReverseGeocodeResponse` y método canónico `api.reverseGeocode(lat, lng)`.
  - `apps/web/src/components/LocationPicker.tsx`:
    - Orquestación automática en `usarGpsActual`: al capturar la coordenada GPS del aspirante, consulta inmediatamente el servicio de geocodificación inversa y autollena los campos `calleNumero`, `colonia`, `codigoPostal` y zona.
    - Indicador de estado y badges visuales para dar certeza al aspirante sobre los campos autocompletados.
    - Preservación de la capacidad de edición manual para ajustes finos de número interior o referencias.
- **Consumo de API (`apps/web/src/lib/api.ts`)**: 100% de las peticiones canalizadas por el cliente HTTP canónico.
- **Manejo de Estado / Caché (TanStack Query)**: N/A.

### 4. CHECKLIST PREVIO A COMMIT / MERGE
- [x] Código verificado en local con Laragon (`ceps_db`).
- [x] Cero llamadas residuales o URLs duras a servidores externos o IPs locales.
- [x] Sin romper tipado TypeScript (`npm run typecheck`).
- [x] Sin errores de linter (`npm run lint`).
- [x] Resumen claro redactado.
