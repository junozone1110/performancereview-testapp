import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { hasAnyRole } from '@/lib/permissions';

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

        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-1">部下の評価シート</h2>
          <p className="ab-text-body-s ab-text-secondary ab-mb-4">管理対象従業員の評価状況</p>
          <p className="ab-text-body-m ab-text-secondary">
            管理対象の従業員はまだ登録されていません
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
