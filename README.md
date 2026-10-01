# Mega Combos

Tienda online de combos de ropa (remeras, boxers y medias) para hombre y
unisex. Los clientes eligen el combo y el talle, confirman el pedido (queda
guardado y descuenta stock) y lo envían por WhatsApp para coordinar pago y
entrega.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- Vercel Blob para las fotos (opcional)

## Tienda

- `/` — carrusel de imágenes, combos destacados y listado con filtro Hombre / Unisex
- `/combo/[slug]` — qué incluye, precio, ahorro y selector de talle (los talles sin stock no se pueden elegir)
- `/carrito` — carrito, datos del cliente y "Confirmar pedido"
- `/pedido/[id]` — pedido registrado con el botón para enviarlo por WhatsApp

## Admin (`/admin`)

- **Resumen**: ventas de hoy y del mes, pedidos pendientes, stock total,
  facturación / pedidos / ticket promedio por período (7, 30, 90 días o todo),
  ventas por día, combos y talles más vendidos, stock bajo
- **Pedidos**: listado con filtro por estado y búsqueda; detalle con los datos
  del cliente y cambio de estado (Pendiente, Confirmado, Entregado, Cancelado).
  Cancelar devuelve el stock
- **Combos**: crear, editar, ocultar o eliminar combos; foto, precio, precio
  normal, prendas incluidas, talles y stock por talle
- **Stock**: todos los combos y talles en una sola pantalla para corregir o
  cargar mercadería
- **Carrusel**: imágenes de la portada con título, texto y link; ordenar,
  ocultar o eliminar

## Configuración en Vercel

1. **Base de datos**: Storage → Create Database → **Neon** → conectarla al proyecto.
2. **Fotos** (opcional): Storage → Create → **Blob** → conectarlo al proyecto.
3. **Environment Variables**: `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER` y, si querés,
   `NEXT_PUBLIC_STORE_NAME` (ver `.env.example`).
4. Redeploy. El build crea las tablas y, si la base está vacía, carga 8
   combos de ejemplo con 10 unidades por talle.

En Vercel, la rama de producción del proyecto es `claude/vercel-page-creation-evf213`.

## Desarrollo

```bash
npm install
cp .env.example .env   # completar DATABASE_URL y el resto
npm run db:push
npm run db:seed
npm run dev
```
