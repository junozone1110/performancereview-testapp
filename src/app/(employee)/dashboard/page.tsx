import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { SheetsList } from '@/components/dashboard';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <MainLayout>
      <div className="ab-flex ab-flex-column ab-gap-6">
        <div>
          <h1 className="ab-text-heading-l ab-text-default ab-mb-2">マイページ</h1>
          <p className="ab-text-body-m ab-text-secondary">{session.user.name}さん、こんにちは</p>
        </div>

        <SheetsList />
      </div>
    </MainLayout>
  );
}
