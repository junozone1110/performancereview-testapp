import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { hasRole } from '@/lib/permissions';

export default async function ImportPage() {
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
          <h1 className="ab-text-heading-l ab-text-default ab-mb-2">組織インポート</h1>
          <p className="ab-text-body-m ab-text-secondary">
            CSVファイルから従業員・組織データをインポート
          </p>
        </div>

        <div
          className="ab-bg-base ab-rounded-md ab-p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <h2 className="ab-text-heading-m ab-text-default ab-mb-1">CSVインポート</h2>
          <p className="ab-text-body-s ab-text-secondary ab-mb-4">
            従業員データをCSVファイルからインポートします
          </p>
          <p className="ab-text-body-m ab-text-secondary">
            CSVアップロード機能は後続フェーズで実装予定です
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
