// Halaman ini akan diimplementasikan pada sprint berikutnya.
// Sementara ini sebagai placeholder agar file tidak kosong.

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Detail Pesanan
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-2">
          Order ID: {id}
        </p>
      </div>
    </main>
  );
}
