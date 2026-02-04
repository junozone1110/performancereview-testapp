import { PrismaClient, Role, Grade, Half } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 部署の作成
  const companyDept = await prisma.department.create({
    data: {
      name: '株式会社サンプル',
    },
  });

  const salesDept = await prisma.department.create({
    data: {
      name: '営業部',
      parentId: companyDept.id,
    },
  });

  const sales1Dept = await prisma.department.create({
    data: {
      name: '営業1課',
      parentId: salesDept.id,
    },
  });

  const sales2Dept = await prisma.department.create({
    data: {
      name: '営業2課',
      parentId: salesDept.id,
    },
  });

  const hrDept = await prisma.department.create({
    data: {
      name: '人事部',
      parentId: companyDept.id,
    },
  });

  console.log('Departments created');

  // ユーザーの作成
  // HR担当者
  const hrUser = await prisma.user.create({
    data: {
      employeeNumber: 'EMP001',
      email: 'hr@example.com',
      name: '人事 太郎',
      roles: {
        create: [{ role: Role.hr }, { role: Role.employee }],
      },
    },
  });

  // 営業部長（マネージャー）
  const salesManager = await prisma.user.create({
    data: {
      employeeNumber: 'EMP002',
      email: 'sales-manager@example.com',
      name: '営業 部長',
      roles: {
        create: [{ role: Role.manager }, { role: Role.employee }],
      },
    },
  });

  // 営業1課長（マネージャー）
  const sales1Manager = await prisma.user.create({
    data: {
      employeeNumber: 'EMP003',
      email: 'sales1-manager@example.com',
      name: '一課 課長',
      roles: {
        create: [{ role: Role.manager }, { role: Role.employee }],
      },
    },
  });

  // 営業2課長（マネージャー）
  const sales2Manager = await prisma.user.create({
    data: {
      employeeNumber: 'EMP004',
      email: 'sales2-manager@example.com',
      name: '二課 課長',
      roles: {
        create: [{ role: Role.manager }, { role: Role.employee }],
      },
    },
  });

  // 一般従業員
  const employee1 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP005',
      email: 'employee1@example.com',
      name: '山田 太郎',
      roles: {
        create: [{ role: Role.employee }],
      },
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP006',
      email: 'employee2@example.com',
      name: '田中 花子',
      roles: {
        create: [{ role: Role.employee }],
      },
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP007',
      email: 'employee3@example.com',
      name: '鈴木 次郎',
      roles: {
        create: [{ role: Role.employee }],
      },
    },
  });

  const employee4 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP008',
      email: 'employee4@example.com',
      name: '佐藤 三郎',
      roles: {
        create: [{ role: Role.employee }],
      },
    },
  });

  console.log('Users created');

  // 評価期間の作成
  const period = await prisma.evaluationPeriod.create({
    data: {
      name: '2026年度上期',
      year: 2026,
      half: Half.first,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
      currentPhase: 'goal_setting',
      isActive: true,
    },
  });

  console.log('Evaluation period created');

  // 期間アサインメントの作成
  const assignments = [
    {
      periodId: period.id,
      userId: hrUser.id,
      departmentId: hrDept.id,
      managerId: hrUser.id, // 自分自身がマネージャー
      currentGrade: Grade.G5,
    },
    {
      periodId: period.id,
      userId: salesManager.id,
      departmentId: salesDept.id,
      managerId: hrUser.id,
      currentGrade: Grade.G6,
    },
    {
      periodId: period.id,
      userId: sales1Manager.id,
      departmentId: sales1Dept.id,
      managerId: salesManager.id,
      currentGrade: Grade.G5,
    },
    {
      periodId: period.id,
      userId: sales2Manager.id,
      departmentId: sales2Dept.id,
      managerId: salesManager.id,
      currentGrade: Grade.G5,
    },
    {
      periodId: period.id,
      userId: employee1.id,
      departmentId: sales1Dept.id,
      managerId: sales1Manager.id,
      currentGrade: Grade.G3,
    },
    {
      periodId: period.id,
      userId: employee2.id,
      departmentId: sales1Dept.id,
      managerId: sales1Manager.id,
      currentGrade: Grade.G2,
    },
    {
      periodId: period.id,
      userId: employee3.id,
      departmentId: sales2Dept.id,
      managerId: sales2Manager.id,
      currentGrade: Grade.G3,
    },
    {
      periodId: period.id,
      userId: employee4.id,
      departmentId: sales2Dept.id,
      managerId: sales2Manager.id,
      currentGrade: Grade.G2,
    },
  ];

  for (const assignment of assignments) {
    await prisma.periodAssignment.create({ data: assignment });
  }

  console.log('Period assignments created');

  // 評価シートの作成
  const users = [
    hrUser,
    salesManager,
    sales1Manager,
    sales2Manager,
    employee1,
    employee2,
    employee3,
    employee4,
  ];

  for (const user of users) {
    await prisma.evaluationSheet.create({
      data: {
        userId: user.id,
        periodId: period.id,
        status: 'goal_setting',
      },
    });
  }

  console.log('Evaluation sheets created');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
