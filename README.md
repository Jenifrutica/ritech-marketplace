## RiTech SAS: Marketplace

Esta es una demostración de como sería la pagina de RiTech SAS

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
