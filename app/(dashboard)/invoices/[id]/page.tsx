import InvoiceDetailContent from './InvoiceDetailContent';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <InvoiceDetailContent params={params} />;
}
