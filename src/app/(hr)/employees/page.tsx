import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { hasRole } from '@/lib/permissions';
import { EmployeesList } from '@/components/hr';

export default async function EmployeesPage() {
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
          <h1 className="ab-text-heading-l ab-text-default ab-mb-2">全従業員一覧</h1>
          <p className="ab-text-body-m ab-text-secondary">全従業員の評価シート一覧</p>
        </div>

        <EmployeesList />
      </div>
    </MainLayout>
  );
}
