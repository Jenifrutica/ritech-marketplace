# Proyecto RiTech SAS: Marketplace + Trazabilidad

> ℹ️ **Nota**: 
> **Cliente:** RiTech SAS, exportación de café y cacao de Nariño (Colombia) a la Unión Europea. Proyecto de la asignatura Calidad de Software, equipo Las instancias Team.

## Equipo

- **Developers:** Jenifer Urbano y Juan Camilo Lopez
- **Scrum Master:** Nicolas Diaz
- **Product Owner:** Aida Liliana Rosero


## Visión

Plataforma web que actúa como **intermediario digital** entre productores colombianos de café y cacao (origen Nariño) y compradores de la Unión Europea.

## Lo que SOMOS

- Intermediarios baratos: ponemos en contacto comprador y vendedor, más económico que los intermediarios tradicionales.
- Comisión baja: **1% con valor mínimo** por transacción.
- El vendedor puede vender desde su propia empresa/página; la comisión aplica a lo que se transa a través de nuestra plataforma.


## Lo que NO somos

- No hay inventario: no compramos ni vendemos producto.
- En la primera entrega NO hay implementación logística ni pasarelas de pago reales.


## Flujo principal de negocio
  1. El propietario registra su finca y sube certificados (origen Nariño, no deforestación), una sola vez.
  2. El vendedor publica un lote (origen, cantidad ≥ 100 kg, precio fijo o negociable).
  3. El comprador UE busca y negocia por chat (la información privada permanece oculta hasta la negociación).
  4. Acuerdo de venta → **transacción inmutable** (no se puede modificar nada).
  5. Dinero bloqueado (escrow) + comisión del 1%.
  6. El vendedor envía muestra + producto; el comprador verifica calidad contra la muestra (parámetros del laboratorio de café de la universidad).
  7. Si acepta → se libera el pago. Si no → disputa gestionada por el administrador.
  8. El transportador actualiza el tracker del pedido durante el proceso.


## Páginas hijas

- [Reglas de negocio y roles](Reglas-de-negocio-y-roles)
- [Product Backlog (Jira LIT)](Product-Backlog-Jira-LIT)
- [Sprints y metodología ágil](Sprints-y-metodologia-agil)
- [Arquitectura técnica y base de datos](Arquitectura-tecnica-y-base-de-datos)
- [Preguntas al stakeholder](Preguntas-al-stakeholder)
