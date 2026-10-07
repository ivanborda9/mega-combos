// Páginas de información de la tienda (aparecen en el menú de arriba y en el pie).
// Textos de la tienda de Tiendanube, adaptados donde hablaban del checkout de
// Tiendanube: acá los pedidos se coordinan por WhatsApp.

export type InfoPage = {
  slug: string;
  /** Texto corto para el menú */
  menuLabel: string;
  title: string;
  subtitle?: string;
  intro?: string;
  sections: { title: string; body: string }[];
  /** Mostrar al final el bloque de contacto (mail y WhatsApp) */
  contact?: string;
};

export const INFO_PAGES: InfoPage[] = [
  {
    slug: "terminos-y-condiciones",
    menuLabel: "Términos y condiciones",
    title: "Términos y condiciones",
    subtitle: "Términos y Condiciones de Uso – REINAS XL",
    intro:
      "Bienvenida a REINAS XL, nuestra tienda online de ropa para mujeres reales. Al navegar y comprar en nuestra Tienda, aceptás estos Términos y Condiciones junto con nuestra Política de Privacidad.",
    sections: [
      {
        title: "Productos",
        body: "Todos los productos están sujetos a disponibilidad de stock. Las imágenes son ilustrativas y pueden presentar ligeras variaciones de color o detalles.",
      },
      {
        title: "Precios",
        body: "Los precios están expresados en pesos argentinos e incluyen IVA. Pueden modificarse sin previo aviso. El precio válido es el publicado al momento de realizar la compra.",
      },
      {
        title: "Proceso de Compra",
        body: "El cliente debe completar los datos solicitados de forma verdadera y completa. La compra se confirma una vez acreditado el pago y validada la disponibilidad de stock.",
      },
      {
        title: "Formas de Pago",
        body: "El pago se coordina por WhatsApp una vez registrado el pedido (Mercado Pago, tarjetas de crédito y débito, transferencias, etc.).",
      },
      {
        title: "Envíos",
        body: "Realizamos envíos a todo el país a través de Andreani. El costo se informa al coordinar el pedido y puede variar según la ubicación. Los tiempos de entrega son estimativos y pueden verse afectados por la empresa de correo.",
      },
      {
        title: "Cambios",
        body: "Aceptamos cambios dentro de los 3 días corridos desde la recepción del pedido. Las prendas deben estar sin uso, con etiquetas y en perfectas condiciones. Los costos de envío por cambios corren por cuenta del cliente, salvo error o falla de fábrica.",
      },
      {
        title: "Propiedad Intelectual",
        body: "Todo el contenido de esta Tienda (textos, imágenes, logotipos, diseños) es propiedad de REINAS XL y no puede ser reproducido sin autorización previa.",
      },
      {
        title: "Responsabilidad",
        body: "REINAS XL no se responsabiliza por el uso indebido de los productos adquiridos ni por demoras imputables a la empresa de envíos.",
      },
      {
        title: "Modificación de Términos",
        body: "Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier momento. Las modificaciones se publicarán en esta sección.",
      },
      {
        title: "Datos Personales",
        body: "Tus datos se manejan de forma confidencial y segura. Podés consultar más información en nuestra Política de Privacidad.",
      },
    ],
    contact: "Contacto",
  },
  {
    slug: "politicas-de-envio",
    menuLabel: "Políticas de envío",
    title: "Políticas de envío",
    subtitle: "Política de Envío – REINAS XL",
    intro: "En REINAS XL trabajamos para que recibas tu compra de forma segura y en el menor tiempo posible.",
    sections: [
      { title: "📦 Cobertura de envíos", body: "Realizamos envíos a todo el territorio de la República Argentina a través de Andreani." },
      {
        title: "🚚 Tiempo de entrega",
        body: "Los tiempos de entrega varían según la localidad de destino. Una vez despachado el pedido, te enviamos el número de seguimiento para que puedas rastrear tu paquete en todo momento.",
      },
      {
        title: "⏳ Procesamiento de pedidos",
        body: "Los pedidos se procesan dentro de las 24 a 72 horas hábiles posteriores a la confirmación del pago, salvo promociones especiales o alta demanda, lo cual puede demorar el despacho.",
      },
      {
        title: "💸 Costo de envío",
        body: "El costo de envío se informa al coordinar tu pedido por WhatsApp y se paga junto con el pedido. En algunos casos, podrás retirar en la sucursal Andreani más cercana si lo preferís.",
      },
      {
        title: "📍 Datos de envío",
        body: "Te pedimos que revises cuidadosamente tus datos personales y la dirección de entrega antes de finalizar la compra. REINAS XL no se responsabiliza por direcciones incorrectas o incompletas.",
      },
      {
        title: "📦 Recepción del pedido",
        body: "Es importante que haya alguien disponible para recibir el pedido en el domicilio indicado. En caso de no encontrarte, Andreani realizará hasta 2 visitas y, si no logra entregarlo, el paquete volverá a nuestro depósito.",
      },
      { title: "🔄 Cambios de pedidos en tránsito", body: "Una vez que el pedido fue despachado, no es posible modificar la dirección de entrega." },
      {
        title: "❗ Demoras o inconvenientes",
        body: "No nos responsabilizamos por demoras imputables a Andreani o por causas de fuerza mayor. Ante cualquier inconveniente con tu envío, podés contactarnos y haremos todo lo posible para ayudarte.",
      },
    ],
    contact: "📞 Consultas",
  },
  {
    slug: "preguntas-frecuentes",
    menuLabel: "Preguntas frecuentes",
    title: "Preguntas frecuentes",
    subtitle: "Preguntas Frecuentes – REINAS XL",
    sections: [
      {
        title: "📌 ¿Dónde puedo comprar la ropa de REINAS XL?",
        body: "Podés comprar directamente en nuestra tienda online las 24 horas del día. Elegí tus prendas, agregalas al carrito, confirmá el pedido y envialo por WhatsApp para coordinar el pago y la entrega.",
      },
      {
        title: "📦 ¿Hacen envíos a todo el país?",
        body: "Sí, realizamos envíos a toda Argentina a través de Andreani. También podés elegir retiro en sucursal si lo preferís (según disponibilidad).",
      },
      {
        title: "⏳ ¿Cuánto tarda en llegar mi pedido?",
        body: "Los tiempos de entrega dependen de tu localidad. El procesamiento de pedidos demora entre 24 y 72 horas hábiles desde la acreditación del pago. Una vez despachado, recibirás un número de seguimiento para controlar tu envío.",
      },
      {
        title: "💸 ¿Cuánto cuesta el envío?",
        body: "El costo de envío depende de tu ubicación y te lo informamos al coordinar el pedido por WhatsApp.",
      },
      {
        title: "🪪 ¿Cómo sé si mi pedido fue confirmado?",
        body: "Al confirmar el pedido vas a ver en pantalla tu número de pedido. Después lo enviás por WhatsApp y te respondemos para confirmarlo y coordinar el pago.",
      },
      {
        title: "🔄 ¿Puedo cambiar un producto si no me queda bien?",
        body: "Sí, aceptamos cambios dentro de los 3 días corridos desde la recepción del pedido. La prenda debe estar sin uso, con sus etiquetas y en perfecto estado.\nLos costos de envío por cambios corren por cuenta del cliente, salvo que el producto tenga falla o error nuestro.",
      },
      {
        title: "💳 ¿Qué medios de pago aceptan?",
        body: "Podés pagar con Mercado Pago, tarjetas de crédito, débito o transferencia bancaria. El pago se coordina por WhatsApp.",
      },
      {
        title: "📍 ¿Cómo puedo seguir mi pedido?",
        body: "Te enviamos por WhatsApp tu número de seguimiento cuando el pedido es despachado. Podés rastrearlo desde la web de Andreani.",
      },
    ],
    contact: "📞 ¿Cómo me contacto con ustedes?",
  },
  {
    slug: "politicas-de-devolucion",
    menuLabel: "Políticas de devolución",
    title: "Políticas de devolución",
    subtitle: "Política de Cambios y Devoluciones – REINAS XL",
    intro:
      "En REINAS XL queremos que te sientas feliz con tu compra. Por eso te contamos cómo funciona nuestra política de cambios y devoluciones:",
    sections: [
      { title: "📅 Plazo para cambios", body: "Podés solicitar el cambio de una prenda dentro de los 3 días corridos desde que recibís tu pedido." },
      {
        title: "✅ Condiciones para cambios",
        body: "• La prenda debe estar sin uso, sin lavar, con sus etiquetas originales y en perfecto estado.\n• No aceptamos cambios de prendas usadas, dañadas o sin etiqueta.\n• El cambio está sujeto a disponibilidad de stock.",
      },
      {
        title: "🔄 Costos de envío por cambio",
        body: "• Los costos de envío por cambios corren por cuenta del cliente.\n• Si el cambio se debe a un error nuestro o falla de fábrica, el costo de envío corre por nuestra cuenta.",
      },
      {
        title: "💸 Devoluciones de dinero",
        body: "No realizamos devoluciones de dinero, salvo en casos excepcionales de faltantes de stock. En ese caso, te contactaremos para ofrecerte la reposición del producto o la devolución del importe correspondiente.",
      },
      {
        title: "📝 ¿Cómo gestiono un cambio?",
        body: "1. Escribinos dentro de los 3 días corridos a nuestro WhatsApp 2281 583030 o por mail a reinasXL.oficial@gmail.com con tu número de pedido y motivo del cambio.\n2. Te vamos a indicar los pasos para coordinar el envío de la prenda.\n3. Una vez que recibimos el producto y verificamos su estado, gestionamos el cambio.",
      },
      {
        title: "📦 Dirección de envío para cambios",
        body: "Los cambios se envían a través de Andreani a la dirección que te vamos a indicar al coordinar el cambio.",
      },
      {
        title: "❗ Importante",
        body: "No aceptamos cambios fuera del plazo estipulado ni envíos sin previa coordinación. Nos reservamos el derecho de rechazar productos que no cumplan con las condiciones detalladas.",
      },
    ],
    contact: "🙌 Estamos para ayudarte",
  },
];

export function getInfoPage(slug: string) {
  return INFO_PAGES.find((p) => p.slug === slug);
}
