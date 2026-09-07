# TICKET TKT-CEPS-010: Estación de Escáner de CURP y RFC en Portal del Candidato

## 1. Contexto y Justificación Operativa
- **Módulo Afectado:** Portal del Candidato (`CandidateRegistrationView`), Decodificador Oficial (`mexicanIdParser`), Tienda de Candidato (`candidateStore`).
- **Problema Previo:** Al ingresar al Portal del Candidato, la interfaz abría directamente un formulario en blanco, requiriendo que el candidato o reclutador capturara a mano 18 caracteres de la CURP, calculando manualmente la edad y seleccionando género y entidad federativa, lo que generaba errores de captura y ralentizaba el abordaje en módulos físicos de Ciudad Juárez.
- **Solución Implementada:** Implementación de la **Estación de Escaneo y Validación de Identidad** (`DocumentScannerGate`) como compuerta inicial de abordaje. Soporta cámara en vivo (con selector de lente frontal/trasera para tablet), lector físico de código de barras láser (pistola USB/Bluetooth HID), extracción determinista de datos oficiales (Nombre completo, Apellido Paterno, Apellido Materno, Fecha de nacimiento, Edad exacta, Sexo, Estado de origen, RFC base/completo), soporte para decodificación de líneas MRZ de INE (reverso), códigos QR de RENAPO, Cédula SAT CIF y JSON, flujo secuencial guiado para Cédula SAT opcional, ficha táctica de confirmación editable y badges de verificación en el formulario digital (`✓ Verificado por Documento`).

---

## 2. Archivos Modificados / Creados
1. `[NEW]` [`apps/web/src/lib/mexicanIdParser.ts`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/lib/mexicanIdParser.ts): Parser oficial de CURP (18 posiciones), líneas MRZ de credencial INE (reverso TD1), QR de RENAPO y QR del SAT, con catálogo de las 32 entidades federativas mexicanas y extracción algorítmica de Nombre(s), Apellido Paterno y Apellido Materno.
2. `[NEW]` [`apps/web/src/components/DocumentScannerGate.tsx`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/components/DocumentScannerGate.tsx): Componente táctico con visor de cámara en vivo, mira de encuadre, listener de escáner físico HID, botones de simulación rápida (INE MRZ, QR RENAPO, Cédula SAT), entrada manual de respaldo y ficha táctica de confirmación y ajuste de nombre.
3. `[MODIFY]` [`apps/web/src/store/candidateStore.ts`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/store/candidateStore.ts): Propiedades de estado `mostrarGateEscaneo`, `curpVerificada`, `datosExtraidosCurp` y acciones de confirmación y re-escaneo con propagación de nombres a `formData` y persistencia local.
4. `[MODIFY]` [`apps/web/src/pages/CandidateRegistrationView.tsx`](file:///c:/Users/gruiz/OneDrive/Documentos/CEPS/apps/web/src/pages/CandidateRegistrationView.tsx): Integración del gate inicial, banner superior de verificación oficial con nombre completo, badges `✓ Verificado por Documento` / `✓ Verificado` en Nombre y Apellidos con estilos esmeralda, y botón de re-escaneo en la cabecera.

---

## 3. Impacto en Base de Datos y Backend
- **Migraciones requeridas:** Ninguna en esta fase (los campos `nombre`, `apellido_paterno`, `apellido_materno`, `curp`, `rfc`, `edad`, `sexo` ya existen en el modelo de base de datos de CI4).
- **Consumo de API:** Los datos verificados se envían al backend con máxima precisión, eliminando discrepancias entre la papelería física y el registro digital.
- **Riesgo:** Bajo. Mantiene fallback de entrada manual para candidatos con credenciales desgastadas.

---

## 4. Criterios de Aceptación Cumplidos
- [x] La vista del Portal del Candidato inicia con la Estación de Escáner.
- [x] Cámara en vivo operativa con mira táctica animada e indicador de lector láser HID.
- [x] Decodificación y extracción de Nombre(s), Apellido Paterno y Apellido Materno desde MRZ de INE, QR RENAPO y SAT CIF.
- [x] Validación y extracción exacta de Fecha, Edad, Sexo, Entidad de origen y RFC.
- [x] Ficha de confirmación táctica previa a desbloquear el formulario digital, con edición/confirmación de nombres.
- [x] Formulario digital en Paso 1 con campos prellenados y badges `✓ Verificado por Documento` en Nombre y Apellidos.
- [x] Botón `Re-escanear Documento` para regresar a la estación preservando el borrador.
- [x] 0 errores de TypeScript (`tsc --noEmit`) y 0 advertencias de lint (`oxlint`).

