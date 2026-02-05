import {
  PrismaClient,
  Role,
  Grade,
  Half,
  Phase,
  PerformanceRating,
  CompetencyRating,
  Treatment,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 既存データをクリア
  await prisma.goalManagerEvaluation.deleteMany();
  await prisma.goalSelfEvaluation.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.totalEvaluation.deleteMany();
  await prisma.additionalViewer.deleteMany();
  await prisma.evaluationSheet.deleteMany();
  await prisma.periodAssignment.deleteMany();
  await prisma.evaluationPeriod.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('Existing data cleared');

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

  // 評価期間の作成（現在の期間 - 目標設定フェーズ）
  const currentPeriod = await prisma.evaluationPeriod.create({
    data: {
      name: '2026年度上期',
      year: 2026,
      half: Half.first,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
      currentPhase: Phase.goal_setting,
      isActive: true,
    },
  });

  // 過去の評価期間（確定済み）
  const pastPeriod = await prisma.evaluationPeriod.create({
    data: {
      name: '2025年度下期',
      year: 2025,
      half: Half.second,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-03-31'),
      currentPhase: Phase.finalized,
      isActive: false,
    },
  });

  console.log('Evaluation periods created');

  // 期間アサインメントの作成（現在の期間）
  const currentAssignments = [
    { userId: hrUser.id, departmentId: hrDept.id, managerId: hrUser.id, currentGrade: Grade.G5 },
    { userId: salesManager.id, departmentId: salesDept.id, managerId: hrUser.id, currentGrade: Grade.G6 },
    { userId: sales1Manager.id, departmentId: sales1Dept.id, managerId: salesManager.id, currentGrade: Grade.G5 },
    { userId: sales2Manager.id, departmentId: sales2Dept.id, managerId: salesManager.id, currentGrade: Grade.G5 },
    { userId: employee1.id, departmentId: sales1Dept.id, managerId: sales1Manager.id, currentGrade: Grade.G3 },
    { userId: employee2.id, departmentId: sales1Dept.id, managerId: sales1Manager.id, currentGrade: Grade.G2 },
    { userId: employee3.id, departmentId: sales2Dept.id, managerId: sales2Manager.id, currentGrade: Grade.G3 },
    { userId: employee4.id, departmentId: sales2Dept.id, managerId: sales2Manager.id, currentGrade: Grade.G2 },
  ];

  for (const assignment of currentAssignments) {
    await prisma.periodAssignment.create({
      data: { periodId: currentPeriod.id, ...assignment },
    });
  }

  // 過去の期間のアサインメント
  for (const assignment of currentAssignments) {
    await prisma.periodAssignment.create({
      data: { periodId: pastPeriod.id, ...assignment },
    });
  }

  console.log('Period assignments created');

  // 現在の評価シートの作成（全ユーザー）
  const allUsers = [hrUser, salesManager, sales1Manager, sales2Manager, employee1, employee2, employee3, employee4];

  for (const user of allUsers) {
    await prisma.evaluationSheet.create({
      data: {
        userId: user.id,
        periodId: currentPeriod.id,
        status: Phase.goal_setting,
      },
    });
  }

  console.log('Current evaluation sheets created');

  // 過去の評価シート（目標・評価データ付き）
  // employee1（山田太郎）の過去シート - 全データ完備
  const employee1PastSheet = await prisma.evaluationSheet.create({
    data: {
      userId: employee1.id,
      periodId: pastPeriod.id,
      status: Phase.finalized,
    },
  });

  // 山田太郎の目標（3つ）
  const employee1Goals = [
    {
      sheetId: employee1PastSheet.id,
      sortOrder: 1,
      title: '新規顧客開拓',
      description: '新規顧客を月5件獲得し、売上拡大に貢献する',
      achievementCriteria: '月間5件以上の新規契約獲得',
      weight: 40,
    },
    {
      sheetId: employee1PastSheet.id,
      sortOrder: 2,
      title: '既存顧客フォロー強化',
      description: '既存顧客への定期訪問を実施し、継続率を向上させる',
      achievementCriteria: '顧客継続率95%以上を維持',
      weight: 35,
    },
    {
      sheetId: employee1PastSheet.id,
      sortOrder: 3,
      title: '営業スキル向上',
      description: '提案力・プレゼン力を向上させ、成約率を改善する',
      achievementCriteria: '成約率を前期比10%向上',
      weight: 25,
    },
  ];

  for (const goalData of employee1Goals) {
    const goal = await prisma.goal.create({ data: goalData });

    // 自己評価
    await prisma.goalSelfEvaluation.create({
      data: {
        goalId: goal.id,
        performanceReflection:
          goal.sortOrder === 1
            ? '月平均6件の新規契約を獲得し、目標を達成。特に製造業向けの提案が好調だった。'
            : goal.sortOrder === 2
              ? '定期訪問を計画通り実施し、継続率96%を達成。顧客からの信頼も向上した。'
              : '社内研修に積極的に参加し、提案書の質が向上。成約率は8%向上した。',
        performanceRating:
          goal.sortOrder === 1 ? PerformanceRating.S : goal.sortOrder === 2 ? PerformanceRating.A : PerformanceRating.B,
        competencyReflection1: '顧客ニーズの把握に努め、的確な提案ができるようになった。',
        competencyReflection2: 'チームメンバーとの情報共有を積極的に行った。',
        competencyReflection3: '困難な案件でも粘り強く取り組み、成果を出せた。',
        competencyRating: CompetencyRating.LEVEL_3_0,
      },
    });

    // 上長評価
    await prisma.goalManagerEvaluation.create({
      data: {
        goalId: goal.id,
        performanceComment:
          goal.sortOrder === 1
            ? '目標を上回る成果を出した。特に製造業向けの新規開拓は素晴らしい。'
            : goal.sortOrder === 2
              ? '継続的な顧客フォローにより高い継続率を維持。今後も期待。'
              : '研修への積極的な参加は評価できる。成約率の改善も見られた。',
        performanceRating:
          goal.sortOrder === 1 ? PerformanceRating.S : goal.sortOrder === 2 ? PerformanceRating.A : PerformanceRating.B,
        competencyComment: '着実に成長している。次期はリーダーシップの発揮も期待。',
        competencyRating: CompetencyRating.LEVEL_3_0,
      },
    });
  }

  // 山田太郎の総評
  await prisma.totalEvaluation.create({
    data: {
      sheetId: employee1PastSheet.id,
      averageScore: 3.75,
      performanceComment: '全体的に目標を達成し、特に新規開拓で顕著な成果を上げた。',
      competencyLevel: CompetencyRating.LEVEL_3_0,
      competencyLevelReason: '業務遂行能力は基準を満たしており、チームへの貢献も見られる。',
      mgrTreatment: Treatment.raise,
      mgrSalaryChange: 15000,
      mgrTreatmentComment: '成果に見合う昇給を推奨。',
      mgrGrade: Grade.G3,
      mgrGradeComment: '現等級維持が適切。',
      hrTreatment: Treatment.raise,
      hrSalaryChange: 12000,
      hrGrade: Grade.G3,
    },
  });

  console.log('Employee1 past sheet with goals and evaluations created');

  // employee2（田中花子）の過去シート
  const employee2PastSheet = await prisma.evaluationSheet.create({
    data: {
      userId: employee2.id,
      periodId: pastPeriod.id,
      status: Phase.finalized,
    },
  });

  const employee2Goals = [
    {
      sheetId: employee2PastSheet.id,
      sortOrder: 1,
      title: '営業資料の整備',
      description: '営業資料を更新し、チーム全体の提案力向上に貢献する',
      achievementCriteria: '主要資料10種類以上を更新',
      weight: 30,
    },
    {
      sheetId: employee2PastSheet.id,
      sortOrder: 2,
      title: '顧客対応品質向上',
      description: '顧客からの問い合わせに迅速・丁寧に対応する',
      achievementCriteria: '顧客満足度アンケート4.0以上',
      weight: 40,
    },
    {
      sheetId: employee2PastSheet.id,
      sortOrder: 3,
      title: '業務効率化提案',
      description: '日常業務の効率化案を提案・実行する',
      achievementCriteria: '3件以上の改善提案を実施',
      weight: 30,
    },
  ];

  for (const goalData of employee2Goals) {
    const goal = await prisma.goal.create({ data: goalData });

    await prisma.goalSelfEvaluation.create({
      data: {
        goalId: goal.id,
        performanceReflection:
          goal.sortOrder === 1
            ? '12種類の資料を更新し、チームから好評を得た。'
            : goal.sortOrder === 2
              ? '顧客満足度4.2を達成。迅速な対応を心がけた。'
              : '5件の改善提案を実施し、うち3件が採用された。',
        performanceRating: goal.sortOrder === 2 ? PerformanceRating.S : PerformanceRating.A,
        competencyReflection1: '細部まで丁寧に取り組むことができた。',
        competencyReflection2: '他部署との連携も積極的に行った。',
        competencyReflection3: '新しいツールの習得にも前向きに取り組んだ。',
        competencyRating: CompetencyRating.LEVEL_3_0_MINUS,
      },
    });

    await prisma.goalManagerEvaluation.create({
      data: {
        goalId: goal.id,
        performanceComment:
          goal.sortOrder === 1
            ? '資料の質が高く、チーム全体に貢献。'
            : goal.sortOrder === 2
              ? '顧客対応は非常に丁寧で評価が高い。'
              : '業務改善への意識が高く、良い提案が多い。',
        performanceRating: goal.sortOrder === 2 ? PerformanceRating.S : PerformanceRating.A,
        competencyComment: '丁寧な仕事ぶりは評価できる。積極性をさらに伸ばしてほしい。',
        competencyRating: CompetencyRating.LEVEL_3_0_MINUS,
      },
    });
  }

  await prisma.totalEvaluation.create({
    data: {
      sheetId: employee2PastSheet.id,
      averageScore: 3.7,
      performanceComment: '全ての目標を達成。特に顧客対応で高い評価を得た。',
      competencyLevel: CompetencyRating.LEVEL_3_0_MINUS,
      competencyLevelReason: '基準レベルに近づいている。次期は積極性の向上を期待。',
      mgrTreatment: Treatment.raise,
      mgrSalaryChange: 10000,
      mgrTreatmentComment: '着実な成長を評価。',
      mgrGrade: Grade.G2,
      mgrGradeComment: '現等級維持。',
      hrTreatment: Treatment.raise,
      hrSalaryChange: 10000,
      hrGrade: Grade.G2,
    },
  });

  console.log('Employee2 past sheet with goals and evaluations created');

  // 一課課長の過去シート（目標のみ、評価なし - 自己評価入力中の状態をシミュレート）
  const sales1ManagerPastSheet = await prisma.evaluationSheet.create({
    data: {
      userId: sales1Manager.id,
      periodId: pastPeriod.id,
      status: Phase.finalized,
    },
  });

  const managerGoals = [
    {
      sheetId: sales1ManagerPastSheet.id,
      sortOrder: 1,
      title: 'チーム売上目標達成',
      description: 'チーム全体で四半期売上目標を達成する',
      achievementCriteria: '売上目標達成率100%以上',
      weight: 50,
    },
    {
      sheetId: sales1ManagerPastSheet.id,
      sortOrder: 2,
      title: 'メンバー育成',
      description: 'チームメンバーの成長をサポートし、スキルアップを促進する',
      achievementCriteria: 'メンバー全員の目標達成率80%以上',
      weight: 30,
    },
    {
      sheetId: sales1ManagerPastSheet.id,
      sortOrder: 3,
      title: '業務プロセス改善',
      description: 'チームの業務プロセスを見直し、効率化を図る',
      achievementCriteria: '月間残業時間を10%削減',
      weight: 20,
    },
  ];

  for (const goalData of managerGoals) {
    const goal = await prisma.goal.create({ data: goalData });

    await prisma.goalSelfEvaluation.create({
      data: {
        goalId: goal.id,
        performanceReflection:
          goal.sortOrder === 1
            ? 'チーム売上目標を105%達成。メンバーの頑張りによる成果。'
            : goal.sortOrder === 2
              ? 'メンバー全員が目標達成率85%以上を記録。'
              : '業務フロー見直しにより残業時間を15%削減できた。',
        performanceRating: goal.sortOrder === 1 ? PerformanceRating.S : PerformanceRating.A,
        competencyReflection1: 'メンバーとの1on1を定期的に実施し、課題を早期発見できた。',
        competencyReflection2: '他部署との連携を強化し、案件の共有を促進した。',
        competencyReflection3: '困難な状況でもチームをまとめ、目標達成に導いた。',
        competencyRating: CompetencyRating.LEVEL_3_5,
      },
    });

    await prisma.goalManagerEvaluation.create({
      data: {
        goalId: goal.id,
        performanceComment:
          goal.sortOrder === 1
            ? 'チームを率いて目標達成。リーダーシップを発揮した。'
            : goal.sortOrder === 2
              ? 'メンバー育成に注力し、成果を出した。'
              : '業務改善の取り組みは評価できる。',
        performanceRating: goal.sortOrder === 1 ? PerformanceRating.S : PerformanceRating.A,
        competencyComment: 'マネジメント能力が着実に向上している。',
        competencyRating: CompetencyRating.LEVEL_3_5,
      },
    });
  }

  await prisma.totalEvaluation.create({
    data: {
      sheetId: sales1ManagerPastSheet.id,
      averageScore: 4.0,
      performanceComment: 'チーム全体を率いて優秀な成績を収めた。',
      competencyLevel: CompetencyRating.LEVEL_3_5,
      competencyLevelReason: 'マネジメント能力が高く、次のステップへの準備ができている。',
      mgrTreatment: Treatment.raise,
      mgrSalaryChange: 25000,
      mgrTreatmentComment: '昇格候補として推薦。',
      mgrGrade: Grade.G6,
      mgrGradeComment: '昇格を推奨。',
      hrTreatment: Treatment.raise,
      hrSalaryChange: 20000,
      hrGrade: Grade.G5,
    },
  });

  console.log('Sales1 manager past sheet created');

  // その他のユーザーの過去シート（シンプルに作成）
  const otherUsers = [hrUser, salesManager, sales2Manager, employee3, employee4];
  for (const user of otherUsers) {
    await prisma.evaluationSheet.create({
      data: {
        userId: user.id,
        periodId: pastPeriod.id,
        status: Phase.finalized,
      },
    });
  }

  console.log('Other past sheets created');
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
