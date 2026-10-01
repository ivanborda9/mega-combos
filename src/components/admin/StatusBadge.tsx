import { isOrderStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/orders";

export function StatusBadge({ status }: { status: string }) {
  if (!isOrderStatus(status)) return <span>{status}</span>;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>;
}
