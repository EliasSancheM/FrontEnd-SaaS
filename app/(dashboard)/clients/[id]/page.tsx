import ClientDetailContent from './ClientDetailContent';

export function generateStaticParams() {
  return [
    { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' },
  ];
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ClientDetailContent params={params} />;
}
