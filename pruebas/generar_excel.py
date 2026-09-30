"""Genera el plan de pruebas de RiTech SAS sobre la plantilla del curso.

    node pruebas/ejecutar.mjs              # 1. ejecuta los casos automatizados → resultados.json
    python3 pruebas/generar_excel.py       # 2. llena la plantilla → Plan-de-Pruebas-RiTech-SAS.xlsx

Fuentes: wiki del repositorio (Requisitos, Arquitectura, Backlog, Sprints) y el plan
del Sprint 2 (deliverables/sprint-2/Entregable-B-Plan-de-Pruebas-Sprint2.xlsx), cuyos
39 casos se conservan con su mismo ID.
"""

import json
import random
from datetime import datetime
from pathlib import Path

import openpyxl
from openpyxl.comments import Comment
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parent.parent
PLANTILLA = ROOT / "Plant de tests de software para Calidad.xlsx"
SPRINT2 = ROOT / "deliverables/sprint-2/Entregable-B-Plan-de-Pruebas-Sprint2.xlsx"
RESULTADOS = ROOT / "pruebas/resultados.json"
SALIDA = ROOT / "pruebas/Plan-de-Pruebas-RiTech-SAS.xlsx"

EQUIPO = ["Nicolas Diaz", "Jenifer Urbano", "Juan Camilo Lopez"]
FECHA_EJECUCION = datetime(2026, 9, 29)
SEMILLA = 20260929  # asignación aleatoria reproducible

PROTO = "Prototipo React (demo estática)"
PLAT = "Plataforma (Django + PostgreSQL/PostGIS + AWS)"

MODULOS = {
    "QA": ("Usuarios y seguridad", "1"),
    "FN": ("Fincas y trazabilidad EUDR", "2"),
    "MK": ("Marketplace", "3"),
    "TX": ("Transacciones y escrow", "4"),
    "CL": ("Calidad", "5"),
    "LG": ("Logística (tracker)", "5"),
    "AD": ("Administración", "6"),
    "BD": ("Base de datos", "6"),
    "DP": ("Despliegue y compilación", "6"),
    "RNF": ("Requisitos no funcionales", "6"),
    "AC": ("Aceptación (flujo completo)", "1-6"),
}

TIPOS = {"Unitario": "unitario", "Integración": "de integración", "Sistema": "del sistema"}

# Trazabilidad de los 39 casos del Sprint 2 (no la tenían explícita).
TRAZA_SPRINT2 = {
    "QA-001": "RF-01; LIT-64", "QA-002": "RF-01; LIT-64", "QA-003": "RF-01; RNF-05; LIT-64",
    "QA-004": "RF-04; RN-12; LIT-67", "QA-005": "RF-03; RN-13; RNF-09; LIT-66", "QA-006": "RF-02; RN-5; LIT-65",
    "FN-001": "RF-05; LIT-68", "FN-002": "RF-05; RNF-02; LIT-68", "FN-003": "RF-05; RN-2; RN-10; LIT-68",
    "FN-004": "RF-06; RN-3; LIT-69", "FN-005": "RF-06; RF-07; LIT-70", "FN-006": "RF-08; LIT-71",
    "MK-001": "RF-09; RN-1; LIT-72", "MK-002": "RF-09; RN-4; LIT-72", "MK-003": "RF-07; RF-09; LIT-72",
    "MK-004": "RF-10; RN-13; RNF-07; LIT-73", "MK-005": "RF-11; LIT-74", "MK-006": "RF-12; RN-6; RNF-03; LIT-75",
    "TX-001": "RF-14; RN-11; RNF-01; LIT-77", "TX-002": "RF-14; RN-11; RNF-01; LIT-77",
    "TX-003": "RF-13; RN-7; LIT-76", "TX-004": "RF-13; RN-7; LIT-76", "TX-005": "RF-15; LIT-78",
    "CL-001": "RF-16; RN-8; LIT-79", "CL-002": "RF-17; RN-9; LIT-80", "CL-003": "RF-18; RN-7; LIT-81",
    "CL-004": "RF-18; RF-15; LIT-81", "LG-001": "RF-19; RN-14; LIT-82", "LG-002": "RF-20; RN-13; LIT-83",
    "AD-001": "RF-21; LIT-84", "AD-002": "RF-22; RNF-11; LIT-85", "BD-001": "RNF-03; RNF-04",
    "BD-002": "RF-05; RNF-07", "DP-001": "RF-23; LIT-86", "DP-002": "RF-23; LIT-86",
    "RNF-001": "RNF-01; LIT-87", "RNF-002": "RNF-02; LIT-87", "RNF-003": "RNF-05; RNF-09; LIT-87",
    "RNF-004": "RNF-06; LIT-87",
}

# Casos automatizados sobre el prototipo: (id, tipo, descripción, origen, entrada, esperado, traza, siguiente paso si pasa / si falla)
AUTO = [
    ("MK-007", "unitario", "Validar la cantidad mínima de un lote en el límite de 100 kg.",
     "src/domain/rules.ts, validateQuantity()", "99 kg, 100 kg y 150 kg",
     "99 kg se rechaza por mínimo (RN-1); 100 kg y 150 kg se aceptan", "RF-09; RN-1; LIT-72"),
    ("MK-008", "unitario", "Validar cantidad vacía, no numérica y mayor que la disponible del lote.",
     "src/domain/rules.ts, validateQuantity()", "vacío, NaN, 600 kg con 500 disponibles, 500 kg con 500 disponibles",
     "Vacío y NaN: campo requerido; 600 > 500: excede lo disponible; 500 = 500: válido", "RF-09; RNF-02; LIT-72"),
    ("TX-006", "unitario", "Calcular la comisión del 1% cuando supera el valor mínimo.",
     "src/domain/rules.ts, commission()", "monto = 10.000 €", "Comisión = 100 € (1%, RN-11)", "RF-14; RN-11; RNF-01; LIT-77"),
    ("TX-007", "unitario", "Aplicar el valor mínimo de comisión y verificar el punto de corte.",
     "src/domain/rules.ts, commission(), MIN_COMMISSION_EUR", "montos 1.000 €, 2.500 € y 3.000 €",
     "1.000 € → 25 €; 2.500 € → 25 € (1% = mínimo); 3.000 € → 30 €. El mínimo de 25 € es un VALOR DE EJEMPLO: el cliente no lo ha definido",
     "RF-14; RN-11; RNF-01; LIT-77"),
    ("TX-008", "unitario", "Calcular los totales de una transacción: subtotal, comisión a cada parte, monto bloqueado y monto que recibe el vendedor.",
     "src/domain/rules.ts, transactionTotals()", "600 kg × 6,80 €/kg",
     "Subtotal 4.080 €; comisión 40,80 € a comprador y a vendedor; comprador bloquea 4.120,80 €; vendedor recibe 4.039,20 €; plataforma 81,60 € (exacto al centavo, RNF-01)",
     "RF-14; RN-11; RNF-01; LIT-77"),
    ("LG-003", "unitario", "Recorrer las etapas del tracker de logística en orden.",
     "src/domain/rules.ts, nextShippingStage()", "etapa inicial: muestra registrada",
     "muestra → preparado → enviado → en tránsito → entregado → sin siguiente etapa", "RF-19; RN-14; LIT-82"),
    ("LG-004", "unitario", "Impedir avanzar el tracker desde etapas que no son de envío.",
     "src/domain/rules.ts, nextShippingStage()", "acordada, aceptada, en disputa, resuelta",
     "Ninguna tiene siguiente etapa de envío (no se envía sin muestra ni después del cierre)", "RF-19; RN-8; LIT-82"),
    ("RNF-005", "unitario", "Verificar que la interfaz tiene todas las cadenas traducidas en español e inglés.",
     "src/i18n/es.ts, src/i18n/en.ts", "diccionarios ES y EN",
     "Mismo conjunto de claves en ES y EN, sin textos vacíos (RNF-10)", "RNF-10"),
    ("MK-009", "de integración", "Publicar un lote y registrarlo en la auditoría.",
     "src/store/DemoStore.tsx, reducer: publishLot", "vendedor publica 300 kg de Castillo a 7 €/kg (negociable)",
     "Lote nuevo con código consecutivo NAR-n, estado publicado y entrada de auditoría del vendedor", "RF-09; RNF-11; LIT-72"),
    ("MK-010", "de integración", "Iniciar una negociación sobre un lote publicado.",
     "src/store/DemoStore.tsx, reducer: startNegotiation", "comprador abre negociación del lote publicado",
     "Negociación abierta con la oferta inicial igual al precio y cantidad del lote; el lote pasa a 'en negociación'", "RF-11; LIT-74"),
    ("MK-011", "de integración", "Enviar mensajes en el chat de negociación y conservar su orden.",
     "src/store/DemoStore.tsx, reducer: sendMessage", "3 mensajes alternados comprador / vendedor",
     "Los 3 mensajes quedan en la negociación en el orden en que se enviaron", "RF-11; LIT-74"),
    ("MK-012", "de integración", "Cerrar el acuerdo y crear la transacción de venta.",
     "src/store/DemoStore.tsx, reducer: updateOffer + agree", "contraoferta 6,50 €/kg × 300 kg y acuerdo",
     "Transacción con los valores acordados, etapa 'acordada' y dinero bloqueado; negociación 'acordada'; lote 'vendido'", "RF-12; RF-13; RN-4; LIT-75"),
    ("MK-013", "de integración", "Intentar modificar una transacción ya acordada.",
     "src/store/DemoStore.tsx, reducer: updateOffer + agree", "nueva oferta 1 €/kg × 100 kg y segundo acuerdo sobre la misma negociación",
     "No cambia ningún valor de la transacción ni se crea una segunda (RN-6, inmutable)", "RF-12; RN-6; RNF-03; LIT-75"),
    ("TX-009", "de integración", "Bloquear el dinero del comprador (escrow) al acordar la venta.",
     "src/store/DemoStore.tsx (agree) + src/domain/rules.ts (transactionTotals)", "transacción de 300 kg × 6,50 €/kg",
     "Escrow 'bloqueado'; el comprador deja 1.975 € (1.950 € + comisión mínima de ejemplo de 25 €) (RN-7)", "RF-13; RN-7; RN-11; LIT-76"),
    ("CL-005", "de integración", "Registrar la muestra del producto una sola vez tras el acuerdo.",
     "src/store/DemoStore.tsx, reducer: registerSample", "propietario registra muestra M-TEST-01 y luego intenta otra",
     "Muestra asociada a la transacción, etapa 'muestra'; el segundo registro no reemplaza la primera (RN-8)", "RF-16; RN-8; LIT-79"),
    ("LG-005", "de integración", "Actualizar el tracker como transportador, solo después de la muestra.",
     "src/store/DemoStore.tsx, reducer: advanceShipping", "avanzar sin muestra; luego 6 avances con muestra",
     "Sin muestra no avanza; con muestra el historial es acordada → muestra → preparado → enviado → en tránsito → entregado y se detiene", "RF-19; RF-20; RN-14; LIT-82; LIT-83"),
    ("CL-006", "de integración", "Aceptar el producto entregado y liberar el pago.",
     "src/store/DemoStore.tsx, reducer: verify (accept)", "veredicto 'acepta' sobre transacción entregada",
     "Etapa 'aceptada' y escrow 'liberado' al vendedor (RN-7, RN-8)", "RF-18; RN-7; RN-8; LIT-81"),
    ("CL-007", "de integración", "Impedir el veredicto antes de que el pedido llegue.",
     "src/store/DemoStore.tsx, reducer: verify", "veredicto 'acepta' con la transacción en etapa 'muestra'",
     "Se ignora: la etapa no cambia y el dinero sigue bloqueado", "RF-18; RN-7; LIT-81"),
    ("CL-008", "de integración", "Rechazar el producto y abrir una disputa.",
     "src/store/DemoStore.tsx, reducer: verify (reject)", "veredicto 'rechaza' con motivo 'Humedad fuera de rango'",
     "Disputa abierta con el motivo; transacción 'en disputa'; el pago no se libera", "RF-15; RF-18; LIT-78; LIT-81"),
    ("TX-010", "de integración", "Resolver una disputa liberando o reembolsando, una sola vez.",
     "src/store/DemoStore.tsx, reducer: resolveDispute", "resolución 'liberar'; resolución 'reembolsar'; segunda resolución",
     "Liberar → pago al vendedor; reembolsar → devolución al comprador; ambas dejan la transacción 'resuelta'; una disputa resuelta no se puede volver a resolver", "RF-15; LIT-78"),
    ("FN-007", "de integración", "Registrar una finca nueva con su polígono.",
     "src/store/DemoStore.tsx, reducer: registerFarm", "Finca Prueba, Sandoná, 1.800 m, 3,5 ha, polígono de 3 vértices",
     "Finca creada con su polígono y área, en estado EUDR 'pendiente' hasta validar certificados", "RF-05; RF-07; LIT-68"),
    ("FN-008", "de integración", "Habilitar la finca (EUDR) al validar origen y no deforestación.",
     "src/store/DemoStore.tsx, reducer: uploadCertificate + reviewCertificate (recomputeEudr)", "certificados de origen y no deforestación vigentes hasta 2027",
     "Cargados sin validar: 'pendiente'; validados ambos: 'habilitada' (RF-07)", "RF-06; RF-07; RN-2; RN-3; LIT-69; LIT-70"),
    ("FN-009", "de integración", "Mantener la finca sin habilitar si un certificado obligatorio se rechaza.",
     "src/store/DemoStore.tsx, reducer: reviewCertificate (recomputeEudr)", "origen validado y no deforestación rechazado",
     "La finca no queda habilitada para publicar", "RF-06; RF-07; LIT-70"),
    ("FN-010", "de integración", "No habilitar una finca con certificados vencidos.",
     "src/store/DemoStore.tsx, reducer: reviewCertificate (recomputeEudr)", "certificados validados con vigencia 31/01/2026 y 31/03/2026 (vencidos)",
     "La finca no queda habilitada: los certificados deben tener vigencia (RF-06; mismo criterio que FN-005)", "RF-06; RF-07; LIT-69; LIT-70"),
    ("QA-007", "de integración", "Bloquear y desbloquear un usuario por intento de fraude.",
     "src/store/DemoStore.tsx, reducer: setUserStatus", "administrador bloquea y luego desbloquea a u-buyer2",
     "Estado 'bloqueado' y luego 'activo', cada acción con su entrada de auditoría (RN-12)", "RF-04; RN-12; RNF-11; LIT-67"),
    ("QA-008", "de integración", "Verificar la identidad de un usuario.",
     "src/store/DemoStore.tsx, reducer: verifyUser", "administrador verifica a u-buyer4 (no verificado)",
     "El usuario queda verificado y la acción queda auditada (RF-02)", "RF-02; LIT-65"),
    ("QA-009", "de integración", "Comprobar que la tarjeta de lote del catálogo no revela la finca ni su ubicación.",
     "src/components/common/LotCard.tsx + I18nProvider (renderToString)", "los 9 lotes de ejemplo y un lote de control con la finca en el texto",
     "Ninguna tarjeta muestra nombre de finca, municipio, altitud ni coordenadas (RN-13); el control sí se detecta", "RF-03; RN-13; RNF-09; LIT-66"),
    ("AD-003", "de integración", "Ejecutar un respaldo manual desde el panel técnico.",
     "src/store/DemoStore.tsx, reducer: runBackup", "administrador técnico ejecuta el respaldo",
     "Se actualiza la fecha del último respaldo y se registra en auditoría con el usuario técnico (RF-22)", "RF-22; RNF-06; LIT-85"),
    ("AD-004", "de integración", "Registrar en auditoría quién hizo cada acción.",
     "src/store/DemoStore.tsx, log()", "vendedor publica, administrador bloquea, técnico respalda",
     "3 entradas nuevas con la acción y el usuario del rol que la hizo (RNF-11)", "RF-22; RNF-11; LIT-85"),
    ("AD-005", "de integración", "Restablecer la demo a los datos de ejemplo.",
     "src/store/DemoStore.tsx, reducer: reset", "estado modificado (usuario bloqueado + respaldo) y reset",
     "Usuarios, lotes y auditoría vuelven a los datos de ejemplo; se conserva el rol activo", "RNF-04"),
    ("RNF-006", "unitario", "Verificar que cada foto tiene autor y licencia registrados.",
     "src/data/imageCredits.ts, public/images", "archivos de public/images y lista de créditos",
     "Toda imagen tiene crédito con autor, licencia, fuente y texto alternativo ES/EN (CC BY-SA exige atribución)", "RNF-05"),
    ("DP-003", "del sistema", "Compilar la aplicación para producción.",
     "package.json: npm run build (tsc -b && vite build)", "código fuente del prototipo",
     "Compila sin errores de tipos y genera dist/ listo para S3 + CloudFront", "RF-23; RNF-04; LIT-86"),
    ("RNF-007", "del sistema", "Analizar el código con el linter.",
     "package.json: npm run lint (oxlint)", "código fuente del prototipo",
     "0 errores de lint (mantenibilidad, RNF-04)", "RNF-04"),
    ("RNF-008", "del sistema", "Verificar el contraste de la paleta y del texto sobre fotos.",
     "scripts/contrast.mjs (npm run contrast)", "tokens de color de src/styles/ritech-theme.css",
     "Todos los pares cumplen WCAG 2.1 AA: texto ≥ 4,5:1; bordes e íconos ≥ 3:1", "RNF-02"),
    ("RNF-009", "del sistema", "Comprobar que la interfaz no usa degradados (requisito del cliente).",
     "src/ (búsqueda de linear/radial/conic-gradient)", "todo el código fuente",
     "0 degradados en el código", "RNF-02"),
]

SIGUIENTE_AUTO_FALLA = {
    "FN-010": "Defecto: recomputeEudr() no compara validUntil con la fecha actual. Corregir para que un certificado vencido deje la finca 'pendiente' o 'bloqueada' y volver a ejecutar FN-010 y FN-005.",
}
NOTA_AUTO = {
    "TX-008": "Pasa al centavo, pero el cálculo en coma flotante deja residuos (40,800000000000004). En el backend usar Decimal y redondear a 2 decimales (ver TX-011).",
    "DP-003": "Vite advierte que el bundle supera 500 kB: evaluar code-splitting por rol antes del despliegue (RNF-07).",
    "RNF-007": "Revisar las advertencias en código propio; las de src/components/ui son de la librería.",
    "TX-007": "Confirmar con el stakeholder el valor mínimo real de la comisión y actualizar el caso.",
    "TX-009": "Confirmar con el stakeholder el valor mínimo real de la comisión.",
}

# Casos pendientes: prueba manual sobre el prototipo o plataforma aún no implementada.
PENDIENTES = [
    # --- manuales sobre el prototipo ---
    ("QA-010", "del sistema", PROTO, "Ingresar con cada uno de los 6 roles y revisar su menú.",
     "src/pages/Login.tsx, src/components/layout/roleNav.ts, AppLayout", "comprador, vendedor, propietario, transportador, admin. sistema, admin. técnico",
     "Cada rol entra a su panel y ve solo su navegación (RF-01)", "RF-01; LIT-64"),
    ("QA-011", "del sistema", PROTO, "Operar la negociación como comprador bloqueado.",
     "src/pages/shared/Negotiations.tsx", "negociación abierta con u-buyer3 (bloqueado)",
     "Chat, contraoferta y acuerdo deshabilitados, con aviso visible en texto e ícono (RN-12)", "RF-04; RN-12; LIT-67"),
    ("QA-012", "del sistema", PROTO, "Revisar la privacidad en catálogo, detalle de lote y negociación.",
     "src/pages/buyer/Buyer.tsx, src/pages/shared/Negotiations.tsx", "lote NAR-2401 visto desde catálogo y desde una negociación activa",
     "Catálogo y detalle solo muestran 'Nariño'; finca, municipio y altitud aparecen únicamente dentro de la negociación (RN-13)", "RF-03; RN-13; RNF-09; LIT-66"),
    ("FN-011", "del sistema", PROTO, "Registrar una finca con datos inválidos en el formulario por pasos.",
     "src/pages/owner/Owner.tsx, registro de finca", "nombre vacío; área 0; altitud vacía; polígono con 2 vértices; latitud 95",
     "Cada campo muestra su error asociado y no deja avanzar ni guardar (RNF-02)", "RF-05; RNF-02; LIT-68"),
    ("FN-012", "del sistema", PROTO, "Cargar un certificado con el componente de arrastrar y soltar.",
     "src/pages/owner/Owner.tsx, Dropzone", "PDF de origen con vigencia futura; intento con fecha pasada",
     "El certificado queda 'pendiente de validación'; la fecha pasada no se acepta (RF-06)", "RF-06; RN-3; LIT-69"),
    ("MK-014", "del sistema", PROTO, "Publicar un lote desde el formulario del vendedor.",
     "src/pages/seller/Seller.tsx, publicar lote", "99 kg; precio vacío; luego 150 kg a 8 €/kg",
     "Con 99 kg o sin precio muestra el error y no publica; con datos válidos publica. Solo se ofrecen fincas habilitadas EUDR", "RF-07; RF-09; RN-1; RNF-02; LIT-72"),
    ("MK-015", "del sistema", PROTO, "Filtrar el catálogo de lotes, un filtro a la vez y luego combinados (pulsar 'Limpiar' entre pasos).",
     "src/pages/buyer/Buyer.tsx, catálogo", "1) producto = café  2) cantidad mínima = 1000  3) precio máx. = 9  4) café + mínimo 500 + máx. 10 (escribir números sin separador de miles)",
     "1) NAR-2401, NAR-2402, NAR-2404  2) NAR-2401, NAR-2403  3) NAR-2403, NAR-2404  4) NAR-2404. Nunca aparecen los vendidos (NAR-2405 a NAR-2409); 'Limpiar' vuelve a mostrar los 4 disponibles (RF-10)", "RF-10; LIT-73"),
    ("TX-011", "del sistema", PROTO, "Revisar montos y comisiones en el detalle de una transacción.",
     "src/pages/shared/Transactions.tsx", "transacción en curso vista como comprador y como vendedor",
     "Se ven subtotal, comisión de cada parte, monto bloqueado y equivalente en COP marcados como 'valor de ejemplo' (RF-14)", "RF-13; RF-14; LIT-76; LIT-77"),
    ("LG-006", "del sistema", PROTO, "Seguir el pedido desde los tres roles involucrados.",
     "src/pages/carrier/Carrier.tsx, src/pages/shared/Transactions.tsx", "transportador avanza una etapa; comprador y vendedor consultan",
     "El comprador y el vendedor ven la nueva etapa con fecha en el tracker (RF-20)", "RF-19; RF-20; LIT-82; LIT-83"),
    ("AD-006", "del sistema", PROTO, "Usar el panel del administrador del sistema.",
     "src/pages/admin/Admin.tsx", "validar certificado, resolver disputa, bloquear usuario, ver comisiones",
     "Cada acción se aplica, se refleja en los otros roles y queda en auditoría (RF-21)", "RF-21; LIT-84"),
    ("AD-007", "del sistema", PROTO, "Usar el panel del administrador técnico.",
     "src/pages/tech/Tech.tsx", "consultar auditoría y ejecutar respaldo",
     "La auditoría lista las acciones recientes y el respaldo actualiza su fecha (RF-22)", "RF-22; RNF-11; LIT-85"),
    ("RNF-010", "del sistema", PROTO, "Cambiar el idioma de la interfaz.",
     "src/i18n/I18nProvider.tsx, selector ES/EN", "cambiar a EN en cada vista y recargar",
     "Todos los textos, fechas y montos cambian de idioma y la preferencia se conserva (RNF-10)", "RNF-10"),
    ("RNF-011", "del sistema", PROTO, "Revisar el diseño responsive.",
     "src/components/layout/*, páginas por rol", "anchos de 360, 768 y 1280 px",
     "Sin scroll horizontal ni contenido cortado; botones de al menos 44 px", "RNF-02"),
    ("RNF-012", "del sistema", PROTO, "Navegar solo con teclado y con lector de pantalla.",
     "src/components/layout/Brand.tsx (SkipLink), Page.tsx", "Tab / Shift+Tab / Enter; NVDA u Orca",
     "Enlace para saltar al contenido, foco visible, un solo h1 por vista y estados anunciados con texto (WCAG 2.1 AA)", "RNF-02"),
    ("AC-001", "de aceptación", PROTO, "Recorrer el flujo completo entre roles con el Product Owner.",
     "Prototipo completo (DemoStore compartido)", "propietario registra finca → admin valida → vendedor publica → comprador negocia y acuerda → muestra → tracker → comprador acepta",
     "El pago se libera al vendedor y el PO aprueba el flujo con pantallazos (Definition of Done)", "RF-01; RF-05; RF-09; RF-12; RF-13; RF-18; RF-20; RN-15"),
    ("AC-002", "de aceptación", PROTO, "Recorrer el flujo con disputa con el Product Owner.",
     "Prototipo completo (DemoStore compartido)", "comprador rechaza el producto → administrador resuelve con reembolso",
     "El dinero vuelve al comprador y la disputa queda resuelta y auditada; el PO aprueba", "RF-15; RF-18; RF-21; RN-15"),
    # --- plataforma aún no implementada (complementan los casos del Sprint 2) ---
    ("QA-013", "unitario", PLAT, "Impedir modificar nombre, identificación y firma después del registro.",
     "usuarios/serializers.py, UsuarioSerializer", "PATCH de identificación y firma de un usuario verificado",
     "Se rechaza la edición: estos datos se ingresan una sola vez (RN-5)", "RF-02; RN-5; LIT-65"),
    ("MK-016", "de integración", PLAT, "Comprobar que la API del catálogo no expone datos de la finca.",
     "marketplace/serializers.py, LoteSerializer", "GET /api/lotes/ como comprador sin negociación",
     "El JSON no incluye finca, municipio, altitud ni polígono (RN-13)", "RF-03; RN-13; RNF-09; LIT-66"),
    ("TX-012", "unitario", PLAT, "Calcular montos con precisión decimal.",
     "transacciones/services.py, calcular_comision()", "600 kg × 6,80 €/kg (mismo caso que TX-008)",
     "Montos con Decimal redondeados a 2 decimales, sin residuos de coma flotante (RNF-01)", "RF-14; RNF-01; LIT-77"),
    ("TX-013", "de integración", PLAT, "Proteger la transacción acordada a nivel de base de datos.",
     "transacciones/models.py, migraciones (trigger o permisos)", "UPDATE directo sobre una transacción acordada",
     "La base de datos rechaza el cambio; solo se agregan eventos (RN-6, RNF-03)", "RF-12; RN-6; RNF-03; LIT-75"),
    ("CL-009", "de integración", PLAT, "Verificar la calidad con los parámetros del laboratorio.",
     "calidad/services.py, verificar()", "parámetros del laboratorio de la universidad (por definir) y muestra",
     "La verificación compara cada parámetro con su tolerancia y guarda el resultado (RN-9)", "RF-17; RN-9; LIT-80"),
    ("AD-008", "de integración", PLAT, "Generar la constancia PDF de una transacción.",
     "documentos/services.py, generar_pdf()", "transacción acordada",
     "PDF con partes, cantidades, precio, comisiones y fecha, guardado en S3", "RF-12; RF-23"),
    ("DP-004", "del sistema", PLAT, "Revisar logs y alarmas en CloudWatch.",
     "infra/ (CloudWatch)", "error 500 provocado en la API",
     "El error aparece en los logs y dispara la alarma configurada", "RF-23; RNF-08; LIT-86"),
    ("RNF-013", "del sistema", PLAT, "Medir el tiempo de respuesta de la búsqueda de lotes.",
     "marketplace/views.py + índices PostgreSQL", "10.000 lotes; 50 usuarios concurrentes",
     "Percentil 95 menor a 2 s (umbral propuesto por el equipo, a validar con el stakeholder) (RNF-07)", "RF-10; RNF-07; LIT-87"),
    ("RNF-014", "del sistema", PLAT, "Proteger los documentos privados en S3.",
     "infra/ (S3, URLs prefirmadas)", "acceso directo a un certificado y URL prefirmada vencida",
     "Acceso denegado sin URL válida; la URL prefirmada expira (RNF-05)", "RF-06; RNF-05; LIT-87"),
    ("RNF-015", "del sistema", PLAT, "Probar inyección SQL y XSS en el chat y los filtros.",
     "marketplace/views.py, chat", "' OR 1=1 --  y  <script>alert(1)</script>",
     "Entradas tratadas como texto: sin ejecución de script ni fuga de datos (OWASP Top 10)", "RF-10; RF-11; RNF-05; LIT-87"),
    ("RNF-016", "del sistema", PLAT, "Desplegar una versión sin interrumpir el servicio.",
     "infra/ (Elastic Beanstalk, despliegue continuo)", "despliegue de una release mensual con tráfico activo",
     "Sin errores para los usuarios durante el despliegue (RNF-08)", "RNF-08; RN-15; LIT-86"),
    ("AC-003", "de aceptación", PLAT, "Verificar la lista de requisitos no funcionales antes de cada release.",
     "Checklist RNF-01 a RNF-11 (hoja Trazabilidad)", "release mensual candidata",
     "Todos los RNF priorizados verificados y aprobados por el PO antes de publicar (RF-24)", "RF-24; RN-15; LIT-87"),
]


def cargar_sprint2():
    ws = openpyxl.load_workbook(SPRINT2)["Plan de Pruebas"]
    casos = []
    for row in ws.iter_rows(min_row=3, values_only=True):
        if not row[0] or not str(row[0])[:2].isalpha() or str(row[0]).startswith("Leyenda"):
            continue
        cid, tipo, _resp, desc, origen, entrada, esperado = row[:7]
        casos.append({
            "id": cid, "tipo": TIPOS[tipo], "ambito": PLAT, "desc": desc, "origen": origen, "entrada": entrada,
            "esperado": esperado, "obtenido": "Pendiente de ejecución", "pasa": "PENDIENTE", "fecha": None,
            "siguiente": f"Ejecutar en el Sprint {MODULOS[cid.split('-')[0]][1]} al implementar el módulo en Django (caso del plan del Sprint 2).",
            "traza": TRAZA_SPRINT2[cid],
        })
    assert len(casos) == 39, len(casos)
    return casos


def main():
    resultados = json.loads(RESULTADOS.read_text())
    casos = cargar_sprint2()

    for cid, tipo, desc, origen, entrada, esperado, traza in AUTO:
        r = resultados[cid]
        if r["pasa"]:
            sig = "Ejecutado automáticamente (pruebas/ejecutar.mjs). El responsable debe re-ejecutarlo y confirmar."
            if cid in NOTA_AUTO:
                sig += " " + NOTA_AUTO[cid]
        else:
            sig = SIGUIENTE_AUTO_FALLA[cid]
        casos.append({
            "id": cid, "tipo": tipo, "ambito": PROTO, "desc": desc, "origen": origen, "entrada": entrada,
            "esperado": esperado, "obtenido": r["obtenido"], "pasa": "SI" if r["pasa"] else "NO",
            "fecha": FECHA_EJECUCION, "siguiente": sig, "traza": traza,
        })

    for cid, tipo, ambito, desc, origen, entrada, esperado, traza in PENDIENTES:
        if ambito == PROTO:
            sig = "Ejecutar manualmente sobre el prototipo (npm run dev) y adjuntar pantallazos como evidencia."
        else:
            sig = f"Ejecutar en el Sprint {MODULOS[cid.split('-')[0]][1]} al implementar el módulo en la plataforma."
        casos.append({
            "id": cid, "tipo": tipo, "ambito": ambito, "desc": desc, "origen": origen, "entrada": entrada,
            "esperado": esperado, "obtenido": "Pendiente de ejecución", "pasa": "PENDIENTE", "fecha": None,
            "siguiente": sig, "traza": traza,
        })

    ids = [c["id"] for c in casos]
    assert len(ids) == len(set(ids)), "IDs repetidos"

    # Orden: módulo (orden del backlog) y número.
    orden = list(MODULOS)
    casos.sort(key=lambda c: (orden.index(c["id"].split("-")[0]), int(c["id"].split("-")[1])))

    # Asignación aleatoria y equilibrada: se barajan los casos y se reparten en turnos.
    rng = random.Random(SEMILLA)
    barajados = casos[:]
    rng.shuffle(barajados)
    equipo = EQUIPO[:]
    rng.shuffle(equipo)
    for i, c in enumerate(barajados):
        c["resp"] = equipo[i % 3]

    escribir(casos)
    print(f"{len(casos)} casos → {SALIDA.relative_to(ROOT)}")


# ------------------------------------------------------------------ Excel

FUENTE = "Calibri"
CAFE = "4E3B2E"
CREMA = "F6F0E4"
BORDE = Side(style="thin", color="BFB2A3")
CAJA = Border(left=BORDE, right=BORDE, top=BORDE, bottom=BORDE)
ENC_FILL = PatternFill("solid", fgColor=CAFE)
ENC_FONT = Font(name=FUENTE, bold=True, color="FFFFFF", size=11)
SUB_FILL = PatternFill("solid", fgColor="EADFCC")
BASE = Font(name=FUENTE, size=10)
NEGRITA = Font(name=FUENTE, size=10, bold=True)
AJUSTE = Alignment(wrap_text=True, vertical="top")
CENTRO = Alignment(horizontal="center", vertical="top", wrap_text=True)
VERDE, ROJO, AMBAR = ("E2EFDA", "375623"), ("F8CBAD", "9C0006"), ("FFF2CC", "7F6000")


def encabezado(ws, fila, textos, col=1):
    for i, t in enumerate(textos):
        c = ws.cell(fila, col + i, t)
        c.font, c.fill, c.border = ENC_FONT, ENC_FILL, CAJA
        c.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")


def escribir(casos):
    wb = openpyxl.load_workbook(PLANTILLA)
    ws = wb["Hoja1"]
    ws.title = "Plan de pruebas"

    # Se limpian las filas de ejemplo de la plantilla (QA001, QC001 y el "NO" suelto de I9).
    for row in ws.iter_rows(min_row=7, max_row=ws.max_row):
        for c in row:
            c.value = None

    ws["G2"] = "Plan de pruebas de calidad Aplicación RiTech SAS Marketplace"
    ws["G2"].font = Font(name=FUENTE, bold=True, size=16, color=CAFE)
    ws["A2"] = "Calidad de Software · Las instancias Team"
    ws["A2"].font = Font(name=FUENTE, bold=True, size=11, color=CAFE)
    ws["A3"] = "Marketplace de café y cacao de Nariño para compradores de la Unión Europea"
    ws["A3"].font = Font(name=FUENTE, italic=True, size=10)
    ws["A4"] = f"Versión del plan: {FECHA_EJECUCION:%d/%m/%Y} · leyenda en la hoja «Leyenda»"
    ws["A4"].font = Font(name=FUENTE, size=10)
    ws["F4"].font = Font(name=FUENTE, bold=True, size=11)
    for i, nombre in enumerate(EQUIPO):
        c = ws.cell(4, 7 + i, nombre)
        c.font = Font(name=FUENTE, size=11)

    extra = ["Ámbito", "Trazabilidad (RF / RNF / RN / historia)", "Sprint"]
    for i, t in enumerate(extra):
        ws.cell(6, 12 + i, t)
    for col in range(1, 15):
        c = ws.cell(6, col)
        c.font, c.fill, c.border = ENC_FONT, ENC_FILL, CAJA
        c.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
    ws.row_dimensions[6].height = 48

    campos = ["id", "tipo", "resp", "desc", "origen", "entrada", "esperado", "obtenido", "pasa", "fecha", "siguiente", "ambito", "traza"]
    for r, caso in enumerate(casos, start=7):
        for col, campo in enumerate(campos, start=1):
            c = ws.cell(r, col, caso[campo])
            c.font, c.border, c.alignment = BASE, CAJA, AJUSTE
        ws.cell(r, 1).font = NEGRITA
        for col in (2, 9, 10, 14):
            ws.cell(r, col).alignment = CENTRO
        ws.cell(r, 10).number_format = "d-mmm-yy"
        ws.cell(r, 14, MODULOS[caso["id"].split("-")[0]][1]).font = BASE
        ws.cell(r, 14).border = CAJA
    ultima = 6 + len(casos)

    anchos = {"A": 10, "B": 14, "C": 18, "D": 38, "E": 34, "F": 30, "G": 40, "H": 42, "I": 12, "J": 11, "K": 42, "L": 22, "M": 26, "N": 8}
    for col, w in anchos.items():
        ws.column_dimensions[col].width = w
    ws.freeze_panes = "B7"
    ws.auto_filter.ref = f"A6:N{ultima}"

    rango_i = f"I7:I{ultima}"
    for valor, (fondo, texto) in (("SI", VERDE), ("NO", ROJO), ("PENDIENTE", AMBAR)):
        ws.conditional_formatting.add(rango_i, CellIsRule(operator="equal", formula=[f'"{valor}"'],
                                                          fill=PatternFill("solid", fgColor=fondo), font=Font(bold=True, color=texto)))
    ws.conditional_formatting.add(f"A7:A{ultima}", FormulaRule(formula=[f'$I7="NO"'], fill=PatternFill("solid", fgColor=ROJO[0])))

    for formula, rango in (
        ('"SI,NO,PENDIENTE"', rango_i),
        (f'"{",".join(EQUIPO)}"', f"C7:C{ultima}"),
        ('"unitario,de integración,del sistema,de aceptación"', f"B7:B{ultima}"),
    ):
        dv = DataValidation(type="list", formula1=formula, allow_blank=False)
        dv.add(rango)
        ws.add_data_validation(dv)
    ws["I6"].comment = Comment("SI / NO según el resultado. PENDIENTE: aún no se ejecuta (prueba manual o módulo de la plataforma sin implementar).", "Plan de pruebas")
    ws["C6"].comment = Comment(f"Asignación aleatoria y equilibrada entre los 3 integrantes (semilla {SEMILLA} en pruebas/generar_excel.py).", "Plan de pruebas")

    ws.page_setup.orientation = "landscape"
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_title_rows = "6:6"

    hoja_resumen(wb, ultima)
    hoja_trazabilidad(wb, ultima)
    hoja_leyenda(wb)
    wb.active = 0
    wb.save(SALIDA)


def hoja_resumen(wb, ultima):
    ws = wb.create_sheet("Resumen")
    P = "'Plan de pruebas'"
    ws["A1"] = "Resumen del plan de pruebas"
    ws["A1"].font = Font(name=FUENTE, bold=True, size=14, color=CAFE)
    ws["A2"] = "Todas las cifras son fórmulas sobre la hoja «Plan de pruebas»."
    ws["A2"].font = Font(name=FUENTE, italic=True, size=10)

    def tabla(fila, titulo, etiqueta, filas, criterio):
        ws.cell(fila, 1, titulo).font = Font(name=FUENTE, bold=True, size=12, color=CAFE)
        encabezado(ws, fila + 1, [etiqueta, "Casos", "Ejecutados", "Pasan (SI)", "Fallan (NO)", "Pendientes", "% que pasa de los ejecutados"])
        inicio = fila + 2
        for i, (nombre, crit) in enumerate(filas):
            r = inicio + i
            ws.cell(r, 1, nombre)
            ws.cell(r, 2, f"=COUNTIFS({criterio}{crit})")
            ws.cell(r, 4, f'=COUNTIFS({criterio}{crit},{P}!$I$7:$I${ultima},"SI")')
            ws.cell(r, 5, f'=COUNTIFS({criterio}{crit},{P}!$I$7:$I${ultima},"NO")')
            ws.cell(r, 6, f'=COUNTIFS({criterio}{crit},{P}!$I$7:$I${ultima},"PENDIENTE")')
            ws.cell(r, 3, f"=D{r}+E{r}")
            ws.cell(r, 7, f'=IF(C{r}=0,"-",D{r}/C{r})')
        fin = inicio + len(filas)
        ws.cell(fin, 1, "Total")
        for col in range(2, 7):
            L = get_column_letter(col)
            ws.cell(fin, col, f"=SUM({L}{inicio}:{L}{fin - 1})")
        ws.cell(fin, 7, f'=IF(C{fin}=0,"-",D{fin}/C{fin})')
        for r in range(inicio, fin + 1):
            for col in range(1, 8):
                c = ws.cell(r, col)
                c.border, c.font = CAJA, NEGRITA if r == fin else BASE
                if col >= 2:
                    c.alignment = Alignment(horizontal="center")
            ws.cell(r, 7).number_format = "0.0%"
            if r == fin:
                for col in range(1, 8):
                    ws.cell(r, col).fill = SUB_FILL
        return fin + 2

    fila = tabla(4, "Por módulo", "Módulo", [(f"{k} · {v[0]}", f'"{k}-*"') for k, v in MODULOS.items()], f"{P}!$A$7:$A${ultima},")
    fila = tabla(fila, "Por tipo de prueba", "Tipo", [(t, f'"{t}"') for t in ["unitario", "de integración", "del sistema", "de aceptación"]], f"{P}!$B$7:$B${ultima},")
    fila = tabla(fila, "Por responsable", "Responsable", [(n, f'"{n}"') for n in EQUIPO], f"{P}!$C$7:$C${ultima},")
    tabla(fila, "Por ámbito", "Ámbito", [(a, f'"{a}"') for a in [PROTO, PLAT]], f"{P}!$L$7:$L${ultima},")

    for col, w in {"A": 46, "B": 10, "C": 12, "D": 12, "E": 12, "F": 12, "G": 16}.items():
        ws.column_dimensions[col].width = w


REQUISITOS = [
    ("RF-01", "Registro y autenticación de usuarios por rol"), ("RF-02", "Verificación de identidad (identificación y firma una sola vez)"),
    ("RF-03", "Ocultar información privada entre usuarios"), ("RF-04", "Bloqueo y baneo de usuarios por fraude"),
    ("RF-05", "Registro de fincas con geolocalización y área"), ("RF-06", "Carga de certificados de la finca con vigencia"),
    ("RF-07", "Estado de cumplimiento EUDR por finca"), ("RF-08", "Perfil del vendedor"),
    ("RF-09", "Publicación de lotes (mínimo 100 kg, precio fijo o a acordar)"), ("RF-10", "Búsqueda y filtros de lotes"),
    ("RF-11", "Chat de negociación"), ("RF-12", "Transacción de venta inmutable"),
    ("RF-13", "Dinero bloqueado (escrow) hasta la aceptación"), ("RF-14", "Comisión del 1% con valor mínimo"),
    ("RF-15", "Gestión de disputas"), ("RF-16", "Registro de la muestra"),
    ("RF-17", "Verificación de calidad muestra vs. producto"), ("RF-18", "Veredicto del comprador libera o retiene el pago"),
    ("RF-19", "Actualización de estados del pedido por el transportador"), ("RF-20", "Tracker visible para comprador y vendedor"),
    ("RF-21", "Panel del administrador del sistema"), ("RF-22", "Panel del administrador técnico (auditoría y respaldos)"),
    ("RF-23", "Despliegue en AWS"), ("RF-24", "Verificación de RNF antes de cada release"),
    ("RNF-01", "Exactitud funcional (comisiones y pesos)"), ("RNF-02", "Usabilidad: protección contra errores de captura"),
    ("RNF-03", "Fiabilidad: transacción inmutable y durable"), ("RNF-04", "Mantenibilidad por módulos y capas"),
    ("RNF-05", "Seguridad de documentos y datos privados"), ("RNF-06", "Respaldo automático en AWS"),
    ("RNF-07", "Rendimiento de búsquedas y listados"), ("RNF-08", "Disponibilidad en releases mensuales"),
    ("RNF-09", "Privacidad de ubicación y fincas"), ("RNF-10", "Internacionalización (multi-idioma)"),
    ("RNF-11", "Auditoría de acciones"),
    ("RN-1", "Cantidad mínima por exportación: 100 kg"), ("RN-2", "Café y cacao de origen Nariño certificado"),
    ("RN-3", "El propietario sube la certificación de origen"), ("RN-4", "Precio o acuerdo, origen y cantidad por exportación"),
    ("RN-5", "Nombre, identificación y firma una sola vez"), ("RN-6", "Transacción acordada no se modifica"),
    ("RN-7", "Escrow: se libera solo cuando el comprador acepta"), ("RN-8", "Control de calidad con muestra"),
    ("RN-9", "Parámetros de calidad del laboratorio"), ("RN-10", "Solo productores de Colombia"),
    ("RN-11", "Comisión a comprador y vendedor (1% con mínimo)"), ("RN-12", "Bloqueo por intento de fraude"),
    ("RN-13", "No se ve información privada de otros"), ("RN-14", "Logística modelada con tracker"),
    ("RN-15", "Entregas por módulos y releases mensuales"),
]


def hoja_trazabilidad(wb, ultima):
    ws = wb.create_sheet("Trazabilidad")
    ws["A1"] = "Matriz de trazabilidad: requisitos y reglas de negocio → casos de prueba"
    ws["A1"].font = Font(name=FUENTE, bold=True, size=14, color=CAFE)
    ws["A2"] = "Fuente: wiki del proyecto (Requisitos). Cuenta los casos cuya columna M contiene el ID exacto."
    ws["A2"].font = Font(name=FUENTE, italic=True, size=10)
    encabezado(ws, 4, ["ID", "Descripción", "Casos", "Pasan (SI)", "Fallan (NO)", "Pendientes", "Cobertura"])
    M = f"'Plan de pruebas'!$M$7:$M${ultima}"
    I = f"'Plan de pruebas'!$I$7:$I${ultima}"
    for i, (rid, desc) in enumerate(REQUISITOS):
        r = 5 + i
        ws.cell(r, 1, rid)
        ws.cell(r, 2, desc)
        # "; " como delimitador para que RN-1 no cuente RN-10..RN-15.
        hay = f'ISNUMBER(SEARCH("; "&$A{r}&";","; "&{M}&";"))'
        ws.cell(r, 3, f"=SUMPRODUCT(--{hay})")
        for col, estado in ((4, "SI"), (5, "NO"), (6, "PENDIENTE")):
            ws.cell(r, col, f'=SUMPRODUCT(--{hay},--({I}="{estado}"))')
        ws.cell(r, 7, f'=IF(C{r}=0,"SIN CUBRIR",IF(E{r}>0,"CON FALLAS",IF(D{r}>0,"VERIFICADO (parcial)","PLANIFICADO")))')
        for col in range(1, 8):
            c = ws.cell(r, col)
            c.border, c.font = CAJA, NEGRITA if col == 1 else BASE
            c.alignment = Alignment(horizontal="center") if col >= 3 else AJUSTE
    fin = 4 + len(REQUISITOS)
    rango = f"G5:G{fin}"
    for valor, (fondo, texto) in (("SIN CUBRIR", ROJO), ("CON FALLAS", ROJO), ("VERIFICADO (parcial)", VERDE), ("PLANIFICADO", AMBAR)):
        ws.conditional_formatting.add(rango, CellIsRule(operator="equal", formula=[f'"{valor}"'],
                                                        fill=PatternFill("solid", fgColor=fondo), font=Font(bold=True, color=texto)))
    ws.cell(fin + 2, 1, "Requisitos sin ningún caso:").font = NEGRITA
    ws.cell(fin + 2, 3, f'=COUNTIF(G5:G{fin},"SIN CUBRIR")').font = NEGRITA
    ws.cell(fin + 3, 1, "VERIFICADO (parcial): al menos un caso pasó en el prototipo; los casos de la plataforma siguen pendientes.").font = Font(name=FUENTE, italic=True, size=9)
    for col, w in {"A": 10, "B": 58, "C": 9, "D": 11, "E": 11, "F": 11, "G": 22}.items():
        ws.column_dimensions[col].width = w
    ws.freeze_panes = "A5"


def hoja_leyenda(wb):
    ws = wb.create_sheet("Leyenda")
    ws["A1"] = "Leyenda y criterios del plan"
    ws["A1"].font = Font(name=FUENTE, bold=True, size=14, color=CAFE)
    filas = [
        ("Columnas", None),
        ("identificador de test", "Prefijo del módulo + número. Los casos del plan del Sprint 2 conservan su ID (QA, FN y MK 001-006; TX 001-005; CL 001-004; LG, AD, BD y DP 001-002; RNF 001-004); los nuevos continúan la numeración. Ojo: un ID como RNF-011 es un caso de prueba, no el requisito RNF-11; el requisito que cubre cada caso está en la columna Trazabilidad."),
        ("tipo", "unitario (una función aislada) · de integración (varias piezas juntas: store + reglas, o componente + i18n) · del sistema (la aplicación completa o su compilación) · de aceptación (flujo validado con el Product Owner)."),
        ("responsable", "Asignado al azar y de forma equilibrada entre los tres integrantes (semilla fija para poder reproducir la asignación)."),
        ("resultado obtenido", "Solo se llena con lo que realmente devolvió la ejecución. 'Pendiente de ejecución' si aún no se corre."),
        ("Pasa SI/No", "SI · NO · PENDIENTE (no ejecutado todavía)."),
        ("fecha del test", "Fecha de la ejecución. Vacía mientras el caso está pendiente."),
        ("Ámbito", f"{PROTO}: código que existe hoy en el repositorio. {PLAT}: arquitectura objetivo de la wiki, aún no implementada."),
        ("Trazabilidad", "IDs de la wiki separados por '; ' (RF, RNF, RN) e historias de Jira (LIT). La hoja Trazabilidad los cuenta."),
        ("Prefijos de módulo", None),
        *[(k, f"{v[0]} (Sprint {v[1]})") for k, v in MODULOS.items()],
        ("Cómo se ejecutó", None),
        ("Casos automatizados", "35 casos del prototipo se ejecutaron el 29/09/2026 con `node pruebas/ejecutar.mjs`, que escribe pruebas/resultados.json; `python3 pruebas/generar_excel.py` vuelve a llenar este Excel. El responsable asignado debe re-ejecutarlos y confirmar."),
        ("Casos manuales", "Los casos del sistema y de aceptación del prototipo se ejecutan con `npm run dev`, recorriendo la interfaz, y se documentan con pantallazos."),
        ("Casos de la plataforma", "Se ejecutan en el sprint del módulo cuando exista el backend Django + PostgreSQL/PostGIS y la infraestructura AWS."),
        ("Supuestos", None),
        ("Comisión mínima", "25 € es un VALOR DE EJEMPLO: el cliente no ha definido la cifra (lo mismo en la interfaz del prototipo)."),
        ("Rendimiento", "El umbral de 2 s (p95) de RNF-013 es una propuesta del equipo; la wiki solo dice 'tiempos aceptables'."),
        ("Parámetros de calidad", "Los parámetros del laboratorio de la universidad (RN-9) aún no están definidos; CL-002 y CL-009 dependen de ellos."),
        ("Fuentes", "Wiki: github.com/Jenifrutica/ritech-marketplace/wiki (Requisitos, Arquitectura, Product Backlog, Sprints). Plan del Sprint 2: deliverables/sprint-2/Entregable-B-Plan-de-Pruebas-Sprint2.xlsx."),
    ]
    r = 3
    for a, b in filas:
        if b is None:
            ws.cell(r, 1, a).font = Font(name=FUENTE, bold=True, size=12, color=CAFE)
            r += 1
            continue
        ws.cell(r, 1, a).font = NEGRITA
        c = ws.cell(r, 2, b)
        c.font, c.alignment = BASE, AJUSTE
        ws.cell(r, 1).alignment = AJUSTE
        r += 1
    ws.column_dimensions["A"].width = 26
    ws.column_dimensions["B"].width = 110


if __name__ == "__main__":
    main()
