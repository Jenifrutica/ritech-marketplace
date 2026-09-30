# Preguntas al stakeholder

## Preguntas y respuestas ya resueltas con el stakeholder

| Pregunta | Respuesta |
| --- | --- |
| ¿Entrega por módulos o software completo? | Por módulos funcionales (metodología ágil), mostrando avances semanales |
| ¿Qué funciones están restringidas para usuarios? | Usuarios no pueden ver info de otros (ubicación, fincas, etc.) |
| ¿Libertad en el manejo del software? | El prototipo se presenta con pantallazos; el stakeholder va aceptando |
| ¿Información indispensable que almacene el sistema? | Datos de fincas, usuarios, certificados, no deforestación |
| ¿Cuántas personas manejan el sistema? | Máximo de fincas que haya en Nariño; comisión por compra; dinero bloqueado |
| ¿Documentos necesarios? | Todo del café: mezclado, certificados, seco, tostado, etc. |
| ¿Exportar desde Ecuador? | No, solo Colombia |
| ¿Recibir café de otros lados? | Sí (otros departamentos de Colombia) |
| ¿Cada cuánto actualizaciones? | Cada mejora significativa; una release por mes; salir rápido al mercado |
| ¿Enfoque del negocio? | Marketplace tipo inDrive: contactar compradores y productores, intermediario más barato |
| ¿Laboratorio de café? | Se trabajará con el laboratorio de café de la universidad |
| ¿Bloqueo de usuarios? | Sí, algunos intentarán fraudes; identificar y bloquear |
| ¿Cantidad mínima por exportación? | 100 kg |
| ¿Tipos de exportación? | Cacao y café de origen Nariño, con certificación de origen subida por el propietario |
| ¿Información por exportación? | Precio de venta o acuerdo de precio, origen y cantidad |
| ¿Transporte? | Aún no se sabe; se modela el rol de transportador/logística |
| ¿Roles? | Comprador, vendedor, propietario de fincas, admin del sistema, admin tech, logístico/transportador |
| ¿Vendedor desde su empresa? | Sí; comisión baja, 1% con valor mínimo |
| ¿Requisitos del vendedor? | Certificación de finca, no deforestación, tipo de producto, capacidad de producción, variedad, calidad a entregar |
| ¿Inventario? | No hay: somos intermediarios, no compramos ni vendemos |
| ¿Control de calidad? | Muestra del propietario; al llegar, el comprador verifica que sea el mismo; al aceptar se paga. Parámetros con el laboratorio de café |
| (1.1) ¿Formulario maestro una sola vez? | No todo: nombre e identificación sí una vez; deforestación, pesos y datos de envío cambian por cada venta |
| (1.2) ¿Alcance del MVP? | En la primera entrega no va implementación; es un intermediario |
| (2.1) ¿Edición tras generar documentos? | Una vez acordada la transacción de venta, no se puede modificar nada (bloqueo estricto) |


## Preguntas pendientes para la próxima reunión

> 📌 **Importante**: 
> Estas preguntas quedaron sin respuesta y deben llevarse a la próxima reunión con el stakeholder.
  1. (2.2) Si faltan datos obligatorios al generar documentos: ¿bloquear o permitir vista previa con marca de agua?
  2. (3.1) Validaciones: ¿alertas en tiempo real mientras escribe o resumen de errores al procesar?
  3. (3.2) Datos incoherentes (peso neto > bruto, fecha de salida antes del trámite): ¿bloqueo duro o advertencia con confirmación?
  4. (4.1) Firmas/cédulas: ¿módulo de perfil que las guarde y reutilice en cada trámite? (sugerencia: sí, alineado con RN-5)
  5. (4.2) Entrega de documentos: ¿ZIP con todos los PDFs, descarga individual o visualizador con impresión?
  6. (5.1) ¿Guardado automático de borradores para continuar después?
  7. (5.2) ¿Panel histórico de exportaciones pasadas con filtros y re-descarga?
  8. (6.2) ¿Qué evidencias de pruebas esperan: matriz de casos de prueba, pruebas unitarias automatizadas, pruebas de límites, registro de defectos?
  9. ¿En qué idiomas debe estar la plataforma para los compradores UE (inglés, francés, alemán)?
  10. ¿Métodos de pago y monedas (EUR/COP)? ¿Quién custodia el dinero bloqueado (fiducia/pasarela)?
  11. ¿Quién valida los certificados: el laboratorio de la universidad, certificadoras externas o el administrador?
  12. ¿Ya hay compradores europeos o el software debe ayudar a captarlos?
  13. ¿Cómo se califica la calidad: puntaje SCA para café y prueba de corte para cacao?
  14. ¿Solo venta directa o también subastas?
  15. ¿Cómo se resuelven las disputas (producto no llega, calidad no coincide)? ¿Quién arbitra?
  16. ¿Se permiten muestras antes de la compra completa? ¿Lote mínimo/máximo aparte de los 100 kg?
  17. ¿Quién coordina el envío internacional y aduana (FOB/CIF, agencia de aduanas)?
  18. ¿Qué señales concretas deben disparar el bloqueo de un usuario por fraude?
  19. ¿Se necesita integración con DIAN/autoridades aduaneras o solo documentos descargables?
  20. ¿El laboratorio de la universidad entrega resultados en algún formato digital o siempre manual?
  21. ¿Qué KPIs usarán para decir que el proyecto es exitoso?
  22. ¿Presupuesto para infraestructura en la nube?
