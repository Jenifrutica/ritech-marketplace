# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Prototipo **estático** del marketplace RiTech SAS (café y cacao de Nariño → compradores de la UE). Sin backend ni base de datos: todo son datos ficticios en memoria que se restablecen al recargar. El contexto de negocio (reglas RN-1..RN-15, roles, backlog LIT-57..87) vive en Confluence, espacio "Las instancias TEAM Documentation". La interfaz y los comentarios del código están en español.

## Comandos

```sh
npm run dev        # Vite en desarrollo (acepta hosts *.trycloudflare.com para túneles)
npm run build      # tsc -b && vite build → dist/
npm run preview    # sirve dist/
npm run lint       # oxlint (las advertencias only-export-components en src/components/ui son de la librería)
npm run contrast   # verifica contraste WCAG AA de la paleta y del texto sobre fotos
```

No hay suite de tests en el repo. `npx tsc -b` es la verificación rápida de tipos. Node ≥ 22.12.

## Arquitectura

- **Rutas** (`src/App.tsx`): `HashRouter` (pensado para hosting estático). Layout público (`/`, `/ingresar`, `/creditos`) y un `AppLayout` por rol en `/buyer`, `/seller`, `/owner`, `/carrier`, `/admin`, `/tech`. La navegación de cada rol está en `src/components/layout/roleNav.ts`.
- **Estado** (`src/store/DemoStore.tsx`): un único `useReducer` compartido por todos los roles, inicializado desde `src/data/seed.ts`. El flujo completo (finca → lote → negociación → transacción con escrow → muestra → tracker → verificación → disputa) se recorre cambiando de rol, así que las acciones deben mutar este store, no estado local. `AppLayout` sincroniza `state.role` con la ruta y no renderiza el `<Outlet>` hasta que coinciden.
- **Reglas de negocio** (`src/domain/rules.ts`): mínimo 100 kg, comisión 1% con mínimo, máquina de etapas de la transacción. `MIN_COMMISSION_EUR` y `EXAMPLE_COP_PER_EUR` son **valores de ejemplo** que el cliente no ha definido; la UI los marca con `ExampleBadge`.
- **i18n** (`src/i18n/`): `es.ts` es la fuente de claves; `en.ts` está tipado como `Record<MessageKey, string>`, así que toda clave nueva debe agregarse en ambos o TypeScript falla. Usar `useI18n()` (`t`, `eur`, `num`, `date`...) para textos y formatos; nunca texto literal en la UI.
- **Páginas compartidas**: `src/pages/shared/Negotiations.tsx` y `Transactions.tsx` sirven a varios roles; `TransactionDetail` elige la acción principal según rol y etapa (`RoleActions`).
- **Privacidad (RN-13)**: `LotCard` y el catálogo nunca muestran finca ni ubicación; solo se revelan dentro de una negociación.

## Librería de componentes 000h by Cojeev

- Instalada con el CLI de shadcn desde el registro `@cojeev` (ver `components.json`); el código vive en `src/components/ui`, `src/lib/cojeev*` y `src/styles/cojeev`. Agregar componentes: `npx shadcn@latest add @cojeev/<nombre>`.
- **Se modificó localmente** (no sobrescribir con `--overwrite` sin reaplicar):
  - Se eliminaron todos los degradados (CSS y stops SVG). Requisito del cliente: **nada de degradados**; verificar con `grep -rE "(linear|radial|conic)-gradient\(" src/`.
  - `Icon` tiene `feedback=false` por defecto (la micro-animación en hover se veía como parpadeo).
  - Props de localización añadidas: `Dropzone` (`helpText`, `messages`), `ChartFrame`/`BarChart` (`labels`, `locale`), `ActivityFeed` (`countLabel`), `SheetContent` (`closeLabel`). Los componentes traen textos en inglés por defecto: al usar uno nuevo, revisar sus strings y pasar traducciones.
  - El input de archivo de `Dropzone` está fuera del elemento `role="button"` (accesibilidad).
- `Alert` de la librería trae `role="alert"` fijo y exige estructura ícono + cuerpo: usar el wrapper `src/components/common/Notice.tsx`.

## Tema y diseño

- Paleta cafetera nariñense en `src/styles/ritech-theme.css`, importada **después** de los estilos de cojeev en `src/index.css`; sobrescribe los tokens `--v-*`. Colores planos únicamente. Modo fijo `data-mode="light"`.
- Texto sobre fotos usa la capa `.rt-photo` (`--rt-photo-scrim`); si se cambia, correr `npm run contrast`.
- Sin imágenes inventadas: las fotos son de Wikimedia Commons en `public/images/`, y cada una debe registrarse en `src/data/imageCredits.ts` (autor, licencia, alt ES/EN) porque CC BY-SA exige atribución (página `/creditos`).
- Con `HashRouter`, un `href="#id"` cambia la ruta: para anclas internas usar `onClick` + `scrollIntoView`/`focus` (ver `SkipLink` en `Brand.tsx`).
- Accesibilidad: un solo `h1` por vista (`PageHeader`), estados siempre con texto + ícono, campos con `Field`/`FieldLabel`/`FieldError`.
