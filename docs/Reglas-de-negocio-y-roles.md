# Reglas de negocio y roles

## Reglas de negocio confirmadas con el stakeholder

| # | Regla | Fuente |
| --- | --- | --- |
| RN-1 | Cantidad mínima por exportación: **100 kg** | Stakeholder |
| RN-2 | Productos: café y cacao **de origen Nariño** ; debe certificarse el origen | Stakeholder |
| RN-3 | El propietario de la finca sube la certificación de origen en un espacio dedicado de la app | Stakeholder |
| RN-4 | Datos por exportación: precio de venta o acuerdo de precio, origen y cantidad | Stakeholder |
| RN-5 | Datos de registro (nombre, identificación, firma) se ingresan **una sola vez** ; pesos y datos de envío cambian en cada venta | Pregunta 1.1 |
| RN-6 | **Una vez acordada la transacción de venta, no se puede modificar nada** (bloqueo estricto) | Pregunta 2.1 |
| RN-7 | Dinero **bloqueado (escrow)** : se libera al vendedor solo cuando el comprador acepta el producto | Stakeholder |
| RN-8 | Control de calidad: el propietario entrega muestra del producto; al llegar, el comprador verifica que sea el mismo; si acepta → se paga | Stakeholder |
| RN-9 | Parámetros de calidad definidos con el **laboratorio de café de la universidad** | Stakeholder |
| RN-10 | Solo productores de **Colombia** (Ecuador no); sí se acepta café de otros departamentos de Colombia | Stakeholder |
| RN-11 | Comisión a comprador y vendedor en cada compra (1% con valor mínimo) | Stakeholder |
| RN-12 | Bloqueo/baneo de usuarios por intento de fraude | Stakeholder |
| RN-13 | Usuarios no ven información privada de otros (ubicación, fincas) | Stakeholder |
| RN-14 | Logística de transporte: aún no definida, se modela el rol y el tracker, sin implementación real | Stakeholder |
| RN-15 | Entregas por módulos funcionales, releases mensuales (ágil) | Stakeholder |

> 📌 **Importante**: 
> **Requisitos de registro del vendedor:** certificación de la finca, certificado de no deforestación (EUDR), tipo de producto (café/cacao), capacidad de producción, variedad/tipo, calidad que se compromete a entregar.

## Roles del sistema

| Rol | Función |
| --- | --- |
| **Comprador** (UE) | Busca lotes, negocia, compra, verifica muestra recibida, aprueba pago |
| **Vendedor** | Puede ser el propietario de finca o empresa; publica lotes, negocia |
| **Propietario de finca** | Registra finca, sube certificados (origen, no deforestación), entrega muestras |
| **Administrador del sistema** | Gestiona usuarios, disputas, bloqueos, comisiones |
| **Administrador técnico (tech)** | Configuración técnica, auditoría, respaldos |
| **Transportador / Logística** | Actualiza el tracker del pedido |


## Requisitos no funcionales

- **Exactitud funcional:** cálculos correctos de comisiones y pesos
- **Usabilidad:** protección contra errores de captura
- **Fiabilidad e integridad:** transacción inmutable y durable
- **Mantenibilidad:** código evolucionable por módulos
- **Seguridad:** protección de documentos y datos privados
- **Respaldo automático** en la nube (AWS)
