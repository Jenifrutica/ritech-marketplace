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

- **A. Documentación:** [Wiki](https://github.com/Jenifrutica/ritech-marketplace/wiki/Home) · portada en [`deliverables/sprint-2/`](deliverables/sprint-2/).
- **B. Plan de pruebas:** [`deliverables/sprint-2/Entregable-B-Plan-de-Pruebas-Sprint2.xlsx`](deliverables/sprint-2/Entregable-B-Plan-de-Pruebas-Sprint2.xlsx).
- **C. Código y demostración:** este mismo repositorio.
- Diagramas 4+1 + ER en PlantUML/PNG: [`deliverables/sprint-2/diagramas/`](deliverables/sprint-2/diagramas/).

## Documentación

La documentación vive en la **[Wiki](https://github.com/Jenifrutica/ritech-marketplace/wiki)** del repositorio:

- [Inicio](https://github.com/Jenifrutica/ritech-marketplace/wiki/Home)
- [Requisitos](https://github.com/Jenifrutica/ritech-marketplace/wiki/Requisitos) (incluye ISO/IEC 25010)
- [Arquitectura](https://github.com/Jenifrutica/ritech-marketplace/wiki/Arquitectura)
- [Product Backlog (Jira LIT)](https://github.com/Jenifrutica/ritech-marketplace/wiki/Product-Backlog-Jira-LIT)
- [Sprints y metodología ágil](https://github.com/Jenifrutica/ritech-marketplace/wiki/Sprints-y-metodologia-agil)
- [Diagramas](https://github.com/Jenifrutica/ritech-marketplace/wiki/Diagramas)

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

## Prototipo (demo estática)

Prototipo estático (sin backend ni base de datos) del marketplace de café y cacao de Nariño hacia compradores de la Unión Europea. Todos los datos son ficticios y viven en memoria: al recargar la página se restablecen.

### Ejecutar

```sh
npm install
npm run dev        # servidor de desarrollo
npm run build      # compilación de producción en dist/
npm run contrast   # verifica el contraste WCAG AA de la paleta
```

Requiere Node 22.12 o superior.

### Qué incluye

- **Landing pública** y **ingreso por rol** (sin contraseña) para los seis actores: comprador UE, vendedor, propietario de finca, transportador, administrador del sistema y administrador técnico.
- **Flujo completo entre roles** sobre un estado compartido: registro de finca y certificados (EUDR), publicación de lotes (mínimo 100 kg), negociación por chat, acuerdo inmutable con pago bloqueado (escrow) y comisión del 1%, registro de muestra, tracker logístico, verificación de calidad, disputas y su resolución.
- **Español e inglés** (botón ES/EN en el encabezado).
- **Accesible y responsive**: enlaces para saltar al contenido, un `h1` por vista, estados con texto e ícono (nunca solo color), foco visible, formularios con errores asociados y diseño probado a 360, 768 y 1280 px.

Reglas de negocio de ejemplo que aún no define el cliente (se marcan como "valor de ejemplo" en la interfaz): comisión mínima de 25 € por parte, tasa EUR/COP y parámetros de calidad del laboratorio.

### Tecnología

React 19 + TypeScript + Vite, Tailwind CSS v4 y componentes de [000h by Cojeev](https://000h.cojeev.com) instalados con el CLI de shadcn (`src/components/ui`). Paleta cafetera nariñense plana, sin degradados, en `src/styles/ritech-theme.css`. Se usa `HashRouter` para poder publicarlo como sitio estático.

Ajustes locales a la librería: se eliminaron todos los degradados de sus estilos y se agregaron textos localizables a `Dropzone` y a los gráficos.

### Imágenes

Fotografías libres de Wikimedia Commons en `public/images`, con autor y licencia en `src/data/imageCredits.ts` y en la página **Créditos de imágenes** del sitio.

## Flujo de trabajo

Revisar Para las diapositivas el archivo DIAPOSITIVAS_SPRINT2.txt

---

*Migrado desde Confluence (space LA) a GitHub. :)*
