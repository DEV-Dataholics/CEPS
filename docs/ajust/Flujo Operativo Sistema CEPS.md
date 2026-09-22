Para la demostración en vivo de **Sistema CEPS**, se llevará a cabo una simulación del flujo operativo completo donde cada participante asumirá una posición y rol específico dentro de la plataforma 1, 2\. El objetivo central de esta dinámica es validar la ruta integral del proceso (*end-to-end*) asegurando que las interfaces cuenten con **vistas bloqueadas** (*restringidas por rol*), garantizando que cada usuario interactúe únicamente con las pantallas y datos autorizados para su función 2, 3\.

Los **cuatro roles definidos para el demo** y sus responsabilidades dentro del flujo del sistema son:

### 1\. Candidato (*Vista Pública y Autoservicio*)

* **Acceso Público a Exámenes:** Ingresa a la sección de evaluaciones desde una vista pública utilizando su ID único o escaneando su código QR generado en el registro inicial 4, 5\.  
* **Evaluación en Tablet:** Responde las pruebas digitales diseñadas con interacción simplificada tipo cajero automático 4, 6\.  
* **Seguimiento de Estatus:** Consulta el avance de su solicitud a través del portal del candidato sin poder visualizar las calificaciones o respuestas correctas de sus evaluaciones 4, 5\.

### 2\. Reclutador (*Vista de Campo*)

* **Captura en Punto de Trabajo:** Selecciona la ubicación física en la que opera e inicia el registro del aspirante mediante el escaneo de documentos (como la CURP) y la geolocalización de su domicilio en un mapa 7, 8\.  
* **Validación de Elegibilidad:** Recibe notificaciones automáticas en pantalla si el sistema detecta que el candidato está registrado en la base de datos como "sin posibilidad de aplicación" 9\.

### 3\. Administrador de Vacantes (*Gestión Operativa y Asignaciones*)

* **Revisión de Perfiles:** Recibe las fichas iniciales levantadas en campo dentro de la bandeja de administración de candidatos y aprueba su paso a la fase de pruebas 10\.  
* **Habilitación de Exámenes:** Asigna y habilita individualmente las evaluaciones para cada postulante y monitorea el avance de sus respuestas en tiempo real 6, 10\.  
* **Despliegue a Clientes:** Tras verificar la documentación y confirmar que el candidato es "apto", lo transfiere al pool activo y lo asigna a los turnos y vacantes requeridas por los clientes 3, 5\.

### 4\. Administrador General (*Gobierno del Sistema y Backend*)

* **Filtros Administrativos y Bajas:** Administra las tablas de usuarios, aplica de forma manual el estatus de "no contratable" y procesa la baja de empleados por empresa, sede y turno 1, 3, 9\.  
* **Sincronización Relacional y Soft Delete:** Vela por la integridad del backend, asegurando que las altas y bajas actualicen automáticamente las vacantes disponibles y que las eliminaciones se ejecuten mediante borrado suave (*soft delete*) para preservar el historial del sistema 1, 9\.

### Propósito de Evaluación y Plan de Trabajo

Más allá de la prueba de roles, la sesión de demo tiene como finalidad evaluar cómo opera el sistema actualmente frente a cómo debería funcionar idealmente, permitiendo consolidar un **plan de trabajo** para los ajustes técnicos finales 2\.

💡 ¿Te gustaría estructurar una matriz de pruebas o lista de verificación (*checklist*) paso a paso para ejecutar durante la presentación del demo?

&nbsp;