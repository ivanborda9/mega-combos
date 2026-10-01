# Mega Combos

Tienda online de combos de ropa (remeras, boxers y medias) para hombre y
unisex. Los clientes eligen el combo y el talle, lo suman al carrito y envían
el pedido armado por WhatsApp.

No usa base de datos: los combos están en `src/data/combos.ts`, así que se
despliega en Vercel sin configurar nada más.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Carrito guardado en el navegador (localStorage)

## Páginas

- `/` — portada, combos destacados y listado con filtro por categoría
- `/combo/[slug]` — detalle del combo: qué incluye, precio, ahorro y selector de talle
- `/carrito` — carrito con cantidades y botón "Enviar pedido por WhatsApp"

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar el número de WhatsApp
npm run dev
```

## Editar los combos

Abrí `src/data/combos.ts` y cambiá la lista: nombre, emoji, precio, precio
normal (para mostrar el ahorro), categoría (Hombre o Unisex), prendas
incluidas y talles (dejá `sizes: []` para combos de talle único). Marcá
`featured: true` para que aparezca en "Los más pedidos".

## Desplegar en Vercel

1. Importá el repo en Vercel (framework: Next.js, sin cambios en build).
2. En *Settings → Environment Variables* agregá:
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: número con código de país, sin `+` (ej. `5491112345678`)
   - `NEXT_PUBLIC_STORE_NAME` (opcional): nombre de la tienda
3. Deploy.

En Vercel, la rama de producción del proyecto es `claude/vercel-page-creation-evf213`.
