# Product Backlog (Jira LIT)

## Product Backlog: Proyecto Jira LIT (Las instancias Team)

> 📌 **Importante**: 
> **Limpieza pendiente:** los issues antiguos (LIT-20 a LIT-56) están etiquetados con `a-eliminar`. Para borrarlos: Filtros → Búsqueda avanzada con JQL `project = LIT AND labels = a-eliminar` → seleccionar todos → ⋯ → Bulk change → Delete. Los issues nuevos (LIT-57 a LIT-87) NO tienen esa etiqueta y quedan vigentes.

### Épicas (módulos)

| Épica | Módulo | Sprint |
| --- | --- | --- |
| LIT-57 | M1: Usuarios y seguridad | Sprint 1 |
| LIT-58 | M2: Fincas y trazabilidad EUDR | Sprint 2 |
| LIT-59 | M3: Marketplace | Sprint 3 |
| LIT-60 | M4: Transacciones y escrow | Sprint 4 |
| LIT-61 | M5: Calidad | Sprint 5 |
| LIT-62 | M6: Logística (tracker) | Sprint 5 |
| LIT-63 | M7: Administración | Sprint 6 |


### Historias de usuario

| Key | Historia | Épica | Sprint |
| --- | --- | --- | --- |
| LIT-64 | Registro y login de usuarios por rol | LIT-57 | 1 |
| LIT-65 | Verificación de identidad de usuarios | LIT-57 | 1 |
| LIT-66 | Privacidad de información entre usuarios | LIT-57 | 1 |
| LIT-67 | Bloqueo y baneo de usuarios por fraude | LIT-57 | 1 |
| LIT-68 | Registro de fincas con geolocalización | LIT-58 | 2 |
| LIT-69 | Carga de certificados de la finca | LIT-58 | 2 |
| LIT-70 | Estado de cumplimiento EUDR por finca | LIT-58 | 2 |
| LIT-71 | Perfil del vendedor | LIT-58 | 2 |
| LIT-72 | Publicación de lotes de café/cacao | LIT-59 | 3 |
| LIT-73 | Búsqueda y filtros de lotes para compradores | LIT-59 | 3 |
| LIT-74 | Chat de negociación comprador-vendedor | LIT-59 | 3 |
| LIT-75 | Transacción de venta inmutable | LIT-59 | 3 |
| LIT-76 | Dinero bloqueado (escrow) hasta aceptación | LIT-60 | 4 |
| LIT-77 | Cálculo de comisiones (1% con valor mínimo) | LIT-60 | 4 |
| LIT-78 | Gestión de disputas | LIT-60 | 4 |
| LIT-79 | Registro de muestra del producto | LIT-61 | 5 |
| LIT-80 | Verificación de calidad muestra vs. producto recibido | LIT-61 | 5 |
| LIT-81 | Veredicto del comprador libera el pago | LIT-61 | 5 |
| LIT-82 | Actualización de estados del pedido por el transportador | LIT-62 | 5 |
| LIT-83 | Tracker del pedido visible para comprador y vendedor | LIT-62 | 5 |
| LIT-84 | Panel del administrador del sistema | LIT-63 | 6 |
| LIT-85 | Panel del administrador técnico (auditoría y respaldos) | LIT-63 | 6 |
| LIT-86 | Despliegue de la plataforma en AWS | LIT-63 | 6 |
| LIT-87 | Requisitos no funcionales de la plataforma | LIT-63 | 6 |

Cada historia está etiquetada en Jira con su sprint (`sprint-1` … `sprint-6`) para filtrar el backlog por iteración.
