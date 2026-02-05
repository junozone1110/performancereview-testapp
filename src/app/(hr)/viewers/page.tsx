import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { hasRole } from '@/lib/permissions';
import { ViewersList } from '@/components/hr';

export default async function ViewersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasRole(session.user.roles, 'hr')) {
    redirect('/dashboard');
  }

  return (
    <MainLayout>
      <div className="ab-flex ab-flex-column ab-gap-6">
        <div>
          <h1 className="ab-text-heading-l ab-text-default ab-mb-2">追加閲覧者管理</h1>
          <p className="ab-text-body-m ab-text-secondary">
            特定の評価シートに追加の閲覧権限を付与します
          </p>
        </div>

        <ViewersList />
      </div>
    </MainLayout>
  );
}
