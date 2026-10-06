# Mega Combos

Tienda online de combos de ropa para mujer (remeras, bombachas, tops y
medias). Los clientes eligen el combo y el talle, confirman el pedido (queda
guardado y descuenta stock) y lo envían por WhatsApp para coordinar pago y
entrega.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- Las fotos se suben desde el admin (se achican en el navegador) y se guardan en la misma base

## Tienda

- `/` — carrusel de imágenes, combos destacados y listado con filtro por categoría
- `/combo/[slug]` — qué incluye, precio, ahorro y selector de talle (los talles sin stock no se pueden elegir)
- `/carrito` — carrito, datos del cliente y "Confirmar pedido"
- `/pedido/[id]` — pedido registrado con el botón para enviarlo por WhatsApp

## Admin (`/admin`)

- **Resumen**: ventas de hoy y del mes, pedidos pendientes, stock total,
  facturación / pedidos / ticket promedio por período (7, 30, 90 días o todo),
  ventas por día, combos y talles más vendidos, stock bajo
- **Pedidos**: listado con filtro por estado ("Para despachar", etc.) y
  búsqueda; detalle con los datos del cliente y cambio de estado (Pendiente,
  Confirmado, Despachado, Entregado, Cancelado). Cancelar devuelve el stock
- **Combos**: crear, editar, ocultar o eliminar combos; varias fotos (se suben
  desde la galería del celular o la compu), precio, precio
  normal, prendas incluidas, talles y stock por talle
- **Stock**: todos los combos y talles en una sola pantalla para corregir o
  cargar mercadería
- **Carrusel**: imágenes de la portada con título, texto y link; ordenar,
  ocultar o eliminar

## Sub-admin de despacho

Con `EMPLOYEE_USERNAME` y `EMPLOYEE_PASSWORD` se habilita un segundo usuario
que entra por el mismo `/admin` pero solo ve **Pedidos**: los datos del
comprador, qué combos y talles van, y un botón para marcarlos como
despachados (y deshacerlo si fue un error). No ve el resumen de ventas, ni
combos, stock o carrusel, y no puede cancelar pedidos.

## Configuración en Vercel

1. **Base de datos**: Storage → Create Database → **Neon** → conectarla al proyecto.
2. **Environment Variables**: `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER` y, si querés,
   `NEXT_PUBLIC_STORE_NAME`, `EMPLOYEE_USERNAME` y `EMPLOYEE_PASSWORD`
   (ver `.env.example`).
3. Redeploy. El build crea las tablas y carga 8 combos de ejemplo para
   mujer con 10 unidades por talle (si había combos de ejemplo de una
   versión anterior, los reemplaza; los creados desde el admin no se tocan).

En Vercel, la rama de producción del proyecto es `claude/vercel-page-creation-evf213`.

## Desarrollo

```bash
npm install
cp .env.example .env   # completar DATABASE_URL y el resto
npm run db:push
npm run db:seed
npm run dev
```
