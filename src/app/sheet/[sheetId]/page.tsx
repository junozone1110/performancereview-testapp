import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { EvaluationSheetContainer } from '@/components/sheet';

interface PageProps {
  params: Promise<{ sheetId: string }>;
}

export default async function SheetPage({ params }: PageProps) {
  const session = await auth();
  const { sheetId } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <EvaluationSheetContainer sheetId={sheetId} />
    </MainLayout>
  );
}
