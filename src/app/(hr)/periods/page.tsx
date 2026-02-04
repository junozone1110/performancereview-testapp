import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { hasRole } from '@/lib/permissions';

export default async function PeriodsPage() {
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
          <h1 className="ab-text-heading-l ab-text-default ab-mb-2">評価期間管理</h1>
          <p className="ab-text-body-m ab-text-secondary">評価期間の作成とフェーズ管理</p>
        </div>

        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-1">評価期間一覧</h2>
          <p className="ab-text-body-s ab-text-secondary ab-mb-4">作成済みの評価期間</p>
          <p className="ab-text-body-m ab-text-secondary">評価期間がまだ作成されていません</p>
        </div>
      </div>
    </MainLayout>
  );
}
