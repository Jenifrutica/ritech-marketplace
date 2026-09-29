# Sprints y metodología ágil

## Metodología ágil: Scrum

> ℹ️ **Nota**: 
> **Ceremonias:** definición/refinamiento del product backlog con el stakeholder (primera ceremonia), dailies 3 veces por semana, entrega por módulos funcionales con aprobación del stakeholder mediante pantallazos, releases mensuales.

### Dailies (3 veces por semana, todo el equipo)

Cada integrante responde las 3 preguntas:
  1. ¿Qué hice ayer para avanzar en el proyecto?
  2. ¿Qué voy a hacer hoy para avanzar?
  3. ¿En qué puntos estoy bloqueado?


### Plan de sprints (2 semanas c/u, releases mensuales)

| Sprint | Objetivo / Módulo | Historias | Entregable |
| --- | --- | --- | --- |
| Sprint 1 | Usuarios y seguridad | LIT-64 a LIT-67 | Registro/login por roles, verificación de identidad, privacidad entre usuarios, bloqueo por fraude |
| Sprint 2 | Fincas y trazabilidad EUDR | LIT-68 a LIT-71 | Registro de fincas geolocalizadas, carga de certificados, estado EUDR, perfil del vendedor |
| Sprint 3 | Marketplace | LIT-72 a LIT-75 | Publicación de lotes (≥100 kg), búsqueda/filtros, chat de negociación, transacción inmutable |
| Sprint 4 | Transacciones y escrow | LIT-76 a LIT-78 | Dinero bloqueado, comisiones 1% con mínimo, gestión de disputas |
| Sprint 5 | Calidad + Logística | LIT-79 a LIT-83 | Muestra vs. producto, parámetros del laboratorio, veredicto que libera pago, tracker del pedido |
| Sprint 6 | Administración + Despliegue + RNF | LIT-84 a LIT-87 | Panel admin de sistema, panel admin técnico, despliegue en AWS y verificación de requisitos no funcionales |


### Requisitos no funcionales (verificados antes de cada release)

- **Exactitud funcional:** cálculos correctos de comisiones y pesos
- **Usabilidad:** protección contra errores de captura
- **Fiabilidad e integridad:** transacción inmutable y durable
- **Mantenibilidad:** código evolucionable por módulos
- **Seguridad:** protección de documentos y datos privados
- **Respaldo automático** en la nube (AWS)


### Definition of Done (por historia)

- Funcionalidad implementada y probada (pruebas unitarias y de aceptación)
- Cumple las reglas de negocio RN-1 a RN-15 aplicables
- Revisada y aprobada por el stakeholder con pantallazos/prototipo
- Sin defectos críticos abiertos
