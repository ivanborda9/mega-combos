/** Foto del combo, o el emoji sobre un fondo de color si todavía no tiene foto. */
export function ComboVisual({
  imageUrl,
  emoji,
  name,
  className = "",
  emojiClassName = "text-6xl",
}: {
  imageUrl: string | null;
  emoji: string;
  name: string;
  className?: string;
  emojiClassName?: string;
}) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-brand-100 to-amber-50 ${emojiClassName} ${className}`}>
      <span aria-hidden>{emoji}</span>
    </div>
  );
}
