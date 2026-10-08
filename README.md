# REINAS XL

Tienda online de ropa para mujer (remeras, bombachas, tops y
medias). Los clientes eligen el artículo y el talle, confirman el pedido (queda
guardado y descuenta stock) y lo envían por WhatsApp para coordinar pago y
entrega.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- Las fotos se suben desde el admin (se achican en el navegador) y se guardan en la misma base

## Tienda

- `/` — carrusel de imágenes, artículos destacados y listado con filtro por categoría
- `/articulo/[slug]` — qué incluye, precio, ahorro y selector de talle (los talles sin stock no se pueden elegir)
- `/terminos-y-condiciones`, `/politicas-de-envio`, `/preguntas-frecuentes`,
  `/politicas-de-devolucion` — páginas de información (textos en
  `src/lib/infoPages.ts`; aparecen solas en el menú y en el pie)
- `/carrito` — carrito, datos del cliente y "Confirmar pedido"
- `/pedido/[id]` — pedido registrado con el botón para enviarlo por WhatsApp

## Admin (`/admin`)

- **Resumen**: ventas de hoy y del mes, pedidos pendientes, stock total,
  facturación / pedidos / ticket promedio por período (7, 30, 90 días o todo),
  ventas por día, artículos y talles más vendidos, stock bajo
- **Pedidos**: listado con filtro por estado ("Para despachar", etc.) y
  búsqueda; detalle con los datos del cliente y cambio de estado (Pendiente,
  Confirmado, Despachado, Entregado, Cancelado). Cancelar devuelve el stock
- **Ganancias**: ventas, costo de lo vendido, ganancia, margen, ticket
  promedio, el 20% y la ganancia después del 20%, por artículo, por mes y por
  categoría, para 7, 30, 90 días o todo
- **Artículos**: crear, editar, ocultar o eliminar artículos; varias fotos (se suben
  desde la galería del celular o la compu), precio de costo (privado) con la
  ganancia calculada al escribir, precio, precio
  normal, prendas incluidas, talles y stock por talle
- **Stock**: todos los artículos y talles en una sola pantalla para corregir o
  cargar mercadería
- **Carrusel**: imágenes de la portada con título, texto y link; ordenar,
  ocultar o eliminar

## Mercado Pago

Con `MERCADOPAGO_ACCESS_TOKEN` el carrito ofrece **Mercado Pago** (Checkout
Pro, hasta `MERCADOPAGO_INSTALLMENTS` cuotas, 3 por defecto) y los artículos
muestran "3 x $X sin interés". El pedido se guarda, la clienta paga en
Mercado Pago y vuelve a la tienda; el pago se confirma al volver y también
por la notificación de Mercado Pago (`/api/mercadopago/webhook`), siempre
consultando el pago a la API con nuestro token y verificando que sea por el
total del pedido. Un pago aprobado pasa el pedido a Confirmado. Los pedidos de
Mercado Pago sin pagar no se pueden marcar como despachados.

Las cuotas **sin interés** se activan en la cuenta de Mercado Pago (las paga
el vendedor); si no están activadas, poné `MERCADOPAGO_SIN_INTERES=false`.

## Segundo admin

Con `ADMIN2_USERNAME` y `ADMIN2_PASSWORD` otra persona entra al admin con sus
propios datos y el mismo acceso completo que el admin principal.

## Sub-admin de despacho

Con `EMPLOYEE_USERNAME` y `EMPLOYEE_PASSWORD` se habilita un segundo usuario
que entra por el mismo `/admin` pero solo ve **Pedidos**: los datos del
comprador, qué artículos y talles van, y un botón para marcarlos como
despachados (y deshacerlo si fue un error). No ve el resumen de ventas, ni
artículos, stock o carrusel, y no puede cancelar pedidos.

## Configuración en Vercel

1. **Base de datos**: Storage → Create Database → **Neon** → conectarla al proyecto.
2. **Environment Variables**: `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER` y, si querés,
   `NEXT_PUBLIC_STORE_NAME`, `ADMIN2_USERNAME` y `ADMIN2_PASSWORD`,
   `EMPLOYEE_USERNAME` y `EMPLOYEE_PASSWORD`
   (ver `.env.example`).
3. Redeploy. El build crea las tablas y carga los artículos de la tienda de
   Tiendanube (CAMISA ALMA, CAPSULA URBAN y CAPSULA AMOR, talles 1 a 7, 10
   unidades por talle de ejemplo). Si había artículos de ejemplo de una
   versión anterior, los reemplaza; los creados desde el admin no se tocan.
   La franja de avisos se puede cambiar con `NEXT_PUBLIC_ANNOUNCEMENT`.

En Vercel, la rama de producción del proyecto es `claude/vercel-page-creation-evf213`.

## Desarrollo

```bash
npm install
cp .env.example .env   # completar DATABASE_URL y el resto
npm run db:push
npm run db:seed
npm run dev
```

## Envío

Cada artículo tiene "Envío gratis" (casilla en Admin → Artículos) o un costo
de envío. El pedido cobra un solo envío: el más alto entre los artículos sin
envío gratis (va todo en un paquete). El descuento por transferencia se aplica
solo a los artículos, no al envío, y el envío no cuenta en Ganancias ni en el 20%.
