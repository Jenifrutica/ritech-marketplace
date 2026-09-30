# Arquitectura técnica y base de datos

## Arquitectura técnica propuesta

| Capa | Elección | Justificación |
| --- | --- | --- |
| Base de datos | **PostgreSQL + PostGIS** | Geolocalización de fincas (polígonos EUDR), transaccional para el dinero bloqueado (escrow) |
| Backend | **Python + Django** | Rápido de desarrollar, ORM, autenticación y seguridad incluidas |
| Frontend web | **React** | Elegido sobre Angular: es el framework web usado en plataformas reales del sector (Koltiva), con mayor comunidad y disponibilidad de desarrolladores |
| Documentos | Generación de PDF | Certificados, constancias de transacción |
| Despliegue | **AWS** | S3 + CloudFront para el frontend React, Elastic Beanstalk para el backend Django, RDS PostgreSQL + PostGIS y CloudWatch para logs y monitoreo |


## Modelo de datos (entidades principales)

| Entidad | Datos clave |
| --- | --- |
| Usuario | rol (comprador, vendedor, propietario, admin sistema, admin tech, logístico), identificación, datos de registro (una sola vez), estado (activo/bloqueado) |
| Finca | propietario, geolocalización/polígonos, área, cultivos, estado EUDR (habilitada/bloqueada) |
| Certificado | finca, tipo (origen Nariño, no deforestación, orgánico), archivo, fecha de vigencia, estado de validación |
| PerfilVendedor | capacidad de producción, tipo de producto (café/cacao), variedad, calidad comprometida |
| Lote | vendedor, producto, origen, cantidad (≥ 100 kg), precio fijo o "a acordar", estado (publicado, negociando, vendido) |
| Negociación/Chat | comprador, lote, mensajes |
| Transacción | comprador, vendedor, lote, precio acordado, comisión (1% con mínimo), estado inmutable tras acuerdo (RN-6), dinero bloqueado (escrow) |
| Muestra / VerificaciónCalidad | transacción, muestra registrada por el propietario, resultado de verificación del comprador, parámetros del laboratorio de la universidad, veredicto (acepta/rechaza) |
| Disputa | transacción, motivo, estado, resolución del administrador |
| Envío/Tracker | transacción, transportador, estados (preparado → enviado → en tránsito → entregado), historial de fechas |
| Auditoría | usuario, acción, fecha (para el admin técnico) |


## Decisiones de diseño clave

- Frontend en React: referencia directa en plataformas del mismo sector (Koltiva desarrolla su web en React); amplia comunidad y fácil contratación de desarrolladores en Colombia.
- Despliegue en AWS: S3 + CloudFront (frontend React), Elastic Beanstalk (backend Django), RDS PostgreSQL + PostGIS y CloudWatch; permite respaldos automáticos y releases mensuales en línea.
- Transacción inmutable: una vez acordada no admite modificaciones (RN-6); cualquier cambio posterior pasa por disputa.
- Escrow simulado en la primera entrega: el flujo de dinero bloqueado se implementa como máquina de estados sin pasarela de pago real.
- Logística solo como tracker de estados; sin integración con transportadoras en la primera entrega (RN-14).
- Privacidad por defecto: la información de fincas y ubicación solo se revela dentro de una negociación activa (RN-13).
