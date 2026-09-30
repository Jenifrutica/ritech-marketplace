# RiTech SAS — Marketplace + Trazabilidad café/cacao a la UE

Proyecto de la asignatura **Calidad de Software** — equipo **Las instancias Team**.

Plataforma web que actúa como **intermediario digital** entre productores colombianos de café y cacao (origen Nariño) y compradores de la Unión Europea. Comisión baja (1% con valor mínimo), sin inventario y con trazabilidad EUDR.

## Equipo

| Rol | Persona |
| --- | --- |
| Developers | Jenifer Daniela Urbano y Juan Camilo Lopez |
| Scrum Master | Nicolas Alejandro Diaz |
| Product Owner | Aida Liliana Rosero |

## Entregas

- **[Sprint 2 — Entrega](https://github.com/Jenifrutica/ritech-marketplace/wiki/Sprint-2-Entrega)** (wiki): requerimientos, UML, backlog de septiembre, épicas/historias y base de datos.
- Archivos: [`deliverables/sprint-2/`](deliverables/sprint-2/) — documento (A), plan de pruebas (B) y presentación (C).
- Diagramas 4+1 + ER en PlantUML/PNG: [`deliverables/sprint-2/diagramas/`](deliverables/sprint-2/diagramas/).

## Documentación

La documentación vive en la **[Wiki](https://github.com/Jenifrutica/ritech-marketplace/wiki)** del repositorio:

- [Proyecto RiTech SAS](https://github.com/Jenifrutica/ritech-marketplace/wiki/Home)
- [Reglas de negocio y roles](https://github.com/Jenifrutica/ritech-marketplace/wiki/Reglas-de-negocio-y-roles)
- [Product Backlog (Jira LIT)](https://github.com/Jenifrutica/ritech-marketplace/wiki/Product-Backlog-Jira-LIT)
- [Sprints y metodología ágil](https://github.com/Jenifrutica/ritech-marketplace/wiki/Sprints-y-metodologia-agil)
- [Arquitectura técnica y base de datos](https://github.com/Jenifrutica/ritech-marketplace/wiki/Arquitectura-tecnica-y-base-de-datos)
- [Preguntas al stakeholder](https://github.com/Jenifrutica/ritech-marketplace/wiki/Preguntas-al-stakeholder)

También hay una copia en [`docs/`](docs/) para búsqueda y control de versiones.

## Sprints

Plan de 6 sprints de 2 semanas (releases mensuales). El seguimiento se hace en el **[tablero de GitHub Projects](https://github.com/users/Jenifrutica/projects/2)**.

| Sprint | Objetivo / Módulo | Historias | Entregable |
| --- | --- | --- | --- |
| Sprint 1 | Usuarios y seguridad | LIT-64 a LIT-67 | Registro/login por roles, verificación de identidad, privacidad, bloqueo por fraude |
| Sprint 2 | Fincas y trazabilidad EUDR | LIT-68 a LIT-71 | Fincas geolocalizadas, certificados, estado EUDR, perfil del vendedor |
| Sprint 3 | Marketplace | LIT-72 a LIT-75 | Publicación de lotes (≥100 kg), búsqueda/filtros, chat, transacción inmutable |
| Sprint 4 | Transacciones y escrow | LIT-76 a LIT-78 | Dinero bloqueado, comisiones 1%, gestión de disputas |
| Sprint 5 | Calidad + Logística | LIT-79 a LIT-83 | Muestra vs. producto, veredicto, tracker del pedido |
| Sprint 6 | Administración + Despliegue + RNF | LIT-84 a LIT-87 | Paneles admin, despliegue AWS, requisitos no funcionales |

Cada historia del backlog está creada como **Issue** con su etiqueta `sprint-N` y su **Milestone** de sprint.

## Arquitectura

- **Base de datos:** PostgreSQL + PostGIS
- **Backend:** Python + Django
- **Frontend:** React
- **Despliegue:** AWS (S3 + CloudFront, Elastic Beanstalk, RDS, CloudWatch)

## Flujo de trabajo

1. Revisar el tablero de Projects y el Milestone del sprint activo.
2. Tomar un Issue, moverlo a *In progress*.
3. Abrir un Pull Request y cerrar el Issue al cumplir el *Definition of Done*.

---

*Migrado desde Confluence (space LA) a GitHub.*
