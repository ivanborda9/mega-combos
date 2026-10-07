import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInfoPage, INFO_PAGES } from "@/lib/infoPages";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/config";

type Props = { params: { pagina: string } };

export const dynamicParams = false; // cualquier otra dirección da 404

export function generateStaticParams() {
  return INFO_PAGES.map((p) => ({ pagina: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getInfoPage(params.pagina);
  return page ? { title: page.title } : {};
}

export default function InfoPage({ params }: Props) {
  const page = getInfoPage(params.pagina);
  if (!page) notFound();

  return (
    <article className="max-w-3xl py-4">
      <h1 className="text-3xl font-semibold uppercase tracking-wide sm:text-4xl">{page.title}</h1>
      {page.subtitle && <h2 className="mt-6 text-xl font-semibold sm:text-2xl">{page.subtitle}</h2>}
      {page.intro && <p className="mt-4 leading-relaxed text-gray-800">{page.intro}</p>}
      <div className="mt-6 space-y-5">
        {page.sections.map((s) => (
          <section key={s.title}>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1 whitespace-pre-line leading-relaxed text-gray-800">{s.body}</p>
          </section>
        ))}
      </div>
      {page.contact && (
        <section className="mt-8 border-t pt-6">
          <h3 className="font-semibold">{page.contact}</h3>
          <p className="mt-2 text-gray-800">
            📧 Correo:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-1 text-gray-800">
            📱 WhatsApp:{" "}
            <a href={whatsappLink("¡Hola! Tengo una consulta.")} target="_blank" rel="noopener noreferrer" className="underline">
              {WHATSAPP_DISPLAY}
            </a>
          </p>
        </section>
      )}
    </article>
  );
}
