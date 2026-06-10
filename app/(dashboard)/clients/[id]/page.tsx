import ClientDetailContent from './ClientDetailContent';

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ClientDetailContent params={params} />;
}
