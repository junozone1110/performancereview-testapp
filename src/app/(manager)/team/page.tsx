import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { hasAnyRole } from '@/lib/permissions';
import { TeamList } from '@/components/team';

export default async function TeamPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!hasAnyRole(session.user.roles, ['manager', 'hr'])) {
    redirect('/dashboard');
  }

  return (
    <MainLayout>
      <div className="ab-flex ab-flex-column ab-gap-6">
        <div>
          <h1 className="ab-text-heading-l ab-text-default ab-mb-2">部下一覧</h1>
          <p className="ab-text-body-m ab-text-secondary">管理対象の従業員一覧</p>
        </div>

        <TeamList />
      </div>
    </MainLayout>
  );
}
