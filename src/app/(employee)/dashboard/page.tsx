import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';

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

        <div
          className="ab-grid ab-gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
        >
          <div
            className="ab-bg-base ab-rounded-md ab-p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <h2 className="ab-text-heading-m ab-text-default ab-mb-1">評価シート</h2>
            <p className="ab-text-body-s ab-text-secondary ab-mb-4">現在の評価期間のシート</p>
            <p className="ab-text-body-m ab-text-secondary">評価シートはまだありません</p>
          </div>

          <div
            className="ab-bg-base ab-rounded-md ab-p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <h2 className="ab-text-heading-m ab-text-default ab-mb-1">目標進捗</h2>
            <p className="ab-text-body-s ab-text-secondary ab-mb-4">目標の入力状況</p>
            <p className="ab-text-body-m ab-text-secondary">目標はまだ設定されていません</p>
          </div>

          <div
            className="ab-bg-base ab-rounded-md ab-p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <h2 className="ab-text-heading-m ab-text-default ab-mb-1">現在のフェーズ</h2>
            <p className="ab-text-body-s ab-text-secondary ab-mb-4">評価サイクルの状態</p>
            <p className="ab-text-body-m ab-text-secondary">評価期間が設定されていません</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
