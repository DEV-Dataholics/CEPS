# TKT-CEPS-011: Estación de Abordaje Táctico con Extracción Oficial de CURP RENAPO (|) y RFC Directo

- **Fecha:** 2026-09-07
- **Módulo:** Portal del Candidato / Abordaje en Campo (Célula 0 - Flujo 3 / Flujo 4)
- **Tipo de Cambio:** Refactorización & Optimización Funcional
- **Impacto en BD / Migraciones:** 0 (Sin cambios estructurales en base de datos; opera en frontend y precarga de store reactivo)
- **Autor / Agente:** Antigravity AI Pair Programmer

---

## 1. Contexto & Necesidad Operativa

Durante las pruebas de escaneo en campo se determinó que los códigos QR impresos en las credenciales para votar (INE) no proveen datos demográficos estructurados directamente legibles para el abordaje rápido. En su lugar, el estándar oficial emitido por la Secretaría de Gobernación (RENAPO) para la constancia de CURP incluye una estructura unificada y determinista delimitada por tuberías (`|`), la cual permite extraer de forma inmediata:
- Clave CURP de 18 caracteres
- Apellido Paterno
- Apellido Materno
- Nombre(s)
- Sexo / Género (`HOMBRE` / `MUJER`)
- Fecha de Nacimiento (`DD/MM/AAAA`)
- Entidad Federativa y Clave de Estado (`08 - CHIHUAHUA`)

Ejemplo estándar RENAPO soportado:
`RULG861230HCHZZS06||RUIZ|LOZANO|GUSTAVO ALONSO|HOMBRE|30/12/1986|CHIHUAHUA|08|`

Asimismo, para el Registro Federal de Contribuyentes (RFC) se integró soporte nativo para cadenas directas de 13 caracteres con homoclave (ej: `RULG8612307C5`) y URLs de validación del SAT.

La credencial física (INE) se mantiene obligatoria en el flujo pero dentro del **Paso 4 (Documentos)**, donde el candidato o reclutador toma la fotografía para adjuntarla al expediente digital.

---

## 2. Componentes y Módulos Modificados

1. **[`apps/web/src/lib/mexicanIdParser.ts`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/lib/mexicanIdParser.ts):**
   - Implementación del parser de tuberías oficiales de RENAPO con tolerancia a tokens vacíos (`||`).
   - Soporte para RFC directo de 13 caracteres en `parseSatQr`.
   - Limpieza de catálogos y perfiles de simulación para un entorno de producción real.
2. **[`apps/web/src/components/DocumentScannerGate.tsx`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/components/DocumentScannerGate.tsx):**
   - Eliminación total de botones y bloques de simulación / perfiles demo.
   - La alerta de duplicidad se renderiza de forma estrictamente condicional: si no hay duplicidad, no se muestra ninguna tarjeta ni mensaje de candado; únicamente si la CURP ya existe en la base operativa salta la Alerta Roja de Reingreso con el folio histórico y el checkbox de autorización.
   - Flujo lineal enfocado en escaneo en vivo por cámara, lector láser físico (HID) o captura manual de respaldo.
3. **[`apps/web/src/lib/duplicityChecker.ts`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/lib/duplicityChecker.ts):**
   - Robustecimiento contra elementos nulos o arreglos no inicializados (`null-safe`).
   - Normalización de CURP y nombres para comparaciones exactas.
4. **[`apps/web/src/pages/CandidateRegistrationView.tsx`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/pages/CandidateRegistrationView.tsx):**
   - Banner de verificación en Paso 1 actualizado a estándar RENAPO.
   - Limpieza de llamadas en Paso 3 y preservación íntegra de la carga de fotos en Paso 4.
5. **[`apps/web/src/components/LocationPicker.tsx`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/components/LocationPicker.tsx):**
   - Limpieza de props no utilizados.

---

## 3. Pruebas y Validación de Calidad

- **TypeScript Typecheck (`tsc --noEmit`):** 0 errores.
- **Linter Frontend (`oxlint`):** 0 advertencias, 0 errores.
- **Rutas Backend (CodeIgniter 4):** 100% operativas.
- **Test Automatizado de Parser:** Ejecutado y validado en Node con el texto de muestra oficial `RULG861230HCHZZS06||RUIZ|LOZANO|GUSTAVO ALONSO|HOMBRE|30/12/1986|CHIHUAHUA|08|` y RFC `RULG8612307C5`.
