/** Convierte un monto (string de la API o number) a número seguro. */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Formatea un monto como pesos: "$1.234.567". */
export function money(value: string | number | null | undefined): string {
  return `$${Math.round(toNumber(value)).toLocaleString('es-CL')}`;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Pendiente',
  paid: 'Pagado',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

export function invoiceStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
