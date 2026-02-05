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
    data: { name: '株式会社サンプル' },
  });

  const salesDept = await prisma.department.create({
    data: { name: '営業部', parentId: companyDept.id },
  });

  const sales1Dept = await prisma.department.create({
    data: { name: '営業1課', parentId: salesDept.id },
  });

  const sales2Dept = await prisma.department.create({
    data: { name: '営業2課', parentId: salesDept.id },
  });

  const devDept = await prisma.department.create({
    data: { name: '開発部', parentId: companyDept.id },
  });

  const hrDept = await prisma.department.create({
    data: { name: '人事部', parentId: companyDept.id },
  });

  console.log('Departments created');

  // ユーザーの作成
  const hrUser = await prisma.user.create({
    data: {
      employeeNumber: 'EMP001',
      email: 'hr@example.com',
      name: '人事 太郎',
      roles: { create: [{ role: Role.hr }, { role: Role.employee }] },
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      employeeNumber: 'EMP002',
      email: 'sales-manager@example.com',
      name: '営業 部長',
      roles: { create: [{ role: Role.manager }, { role: Role.employee }] },
    },
  });

  const sales1Manager = await prisma.user.create({
    data: {
      employeeNumber: 'EMP003',
      email: 'sales1-manager@example.com',
      name: '一課 課長',
      roles: { create: [{ role: Role.manager }, { role: Role.employee }] },
    },
  });

  const sales2Manager = await prisma.user.create({
    data: {
      employeeNumber: 'EMP004',
      email: 'sales2-manager@example.com',
      name: '二課 課長',
      roles: { create: [{ role: Role.manager }, { role: Role.employee }] },
    },
  });

  const devManager = await prisma.user.create({
    data: {
      employeeNumber: 'EMP005',
      email: 'dev-manager@example.com',
      name: '開発 部長',
      roles: { create: [{ role: Role.manager }, { role: Role.employee }] },
    },
  });

  // 各フェーズ用の従業員を作成
  const employee1 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP010',
      email: 'employee1@example.com',
      name: '山田 太郎',
      roles: { create: [{ role: Role.employee }] },
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP011',
      email: 'employee2@example.com',
      name: '田中 花子',
      roles: { create: [{ role: Role.employee }] },
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP012',
      email: 'employee3@example.com',
      name: '鈴木 次郎',
      roles: { create: [{ role: Role.employee }] },
    },
  });

  const employee4 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP013',
      email: 'employee4@example.com',
      name: '佐藤 三郎',
      roles: { create: [{ role: Role.employee }] },
    },
  });

  const employee5 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP014',
      email: 'employee5@example.com',
      name: '高橋 四郎',
      roles: { create: [{ role: Role.employee }] },
    },
  });

  const employee6 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP015',
      email: 'employee6@example.com',
      name: '伊藤 五郎',
      roles: { create: [{ role: Role.employee }] },
    },
  });

  const employee7 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP016',
      email: 'employee7@example.com',
      name: '渡辺 六子',
      roles: { create: [{ role: Role.employee }] },
    },
  });

  const employee8 = await prisma.user.create({
    data: {
      employeeNumber: 'EMP017',
      email: 'employee8@example.com',
      name: '中村 七子',
      roles: { create: [{ role: Role.employee }] },
    },
  });

  console.log('Users created');

  // 評価期間の作成
  // 現在アクティブな期間（自己評価フェーズ）
  const currentPeriod = await prisma.evaluationPeriod.create({
    data: {
      name: '2026年度上期',
      year: 2026,
      half: Half.first,
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-09-30'),
      currentPhase: Phase.self_evaluation,
      isActive: true,
    },
  });

  // 過去の期間（確定済み）
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

  // 全ユーザーリスト
  const allUsers = [
    { user: hrUser, dept: hrDept, manager: hrUser, grade: Grade.G5 },
    { user: salesManager, dept: salesDept, manager: hrUser, grade: Grade.G6 },
    { user: sales1Manager, dept: sales1Dept, manager: salesManager, grade: Grade.G5 },
    { user: sales2Manager, dept: sales2Dept, manager: salesManager, grade: Grade.G5 },
    { user: devManager, dept: devDept, manager: hrUser, grade: Grade.G5 },
    { user: employee1, dept: sales1Dept, manager: sales1Manager, grade: Grade.G3 },
    { user: employee2, dept: sales1Dept, manager: sales1Manager, grade: Grade.G2 },
    { user: employee3, dept: sales2Dept, manager: sales2Manager, grade: Grade.G3 },
    { user: employee4, dept: sales2Dept, manager: sales2Manager, grade: Grade.G2 },
    { user: employee5, dept: devDept, manager: devManager, grade: Grade.G3 },
    { user: employee6, dept: devDept, manager: devManager, grade: Grade.G2 },
    { user: employee7, dept: devDept, manager: devManager, grade: Grade.G3 },
    { user: employee8, dept: devDept, manager: devManager, grade: Grade.G4 },
  ];

  // 期間アサインメントの作成
  for (const { user, dept, manager, grade } of allUsers) {
    await prisma.periodAssignment.create({
      data: {
        periodId: currentPeriod.id,
        userId: user.id,
        departmentId: dept.id,
        managerId: manager.id,
        currentGrade: grade,
      },
    });
    await prisma.periodAssignment.create({
      data: {
        periodId: pastPeriod.id,
        userId: user.id,
        departmentId: dept.id,
        managerId: manager.id,
        currentGrade: grade,
      },
    });
  }

  console.log('Period assignments created');

  // ワークフローの各フェーズに対応するシートを作成
  // Phase 1: goal_setting - 目標入力中
  const sheet1 = await prisma.evaluationSheet.create({
    data: {
      userId: employee1.id,
      periodId: currentPeriod.id,
      status: Phase.goal_setting,
    },
  });

  // Phase 2: goal_review - 目標確定済み（目標のみ）
  const sheet2 = await prisma.evaluationSheet.create({
    data: {
      userId: employee2.id,
      periodId: currentPeriod.id,
      status: Phase.goal_review,
    },
  });

  // Phase 3: self_evaluation - 自己評価入力中
  const sheet3 = await prisma.evaluationSheet.create({
    data: {
      userId: employee3.id,
      periodId: currentPeriod.id,
      status: Phase.self_evaluation,
    },
  });

  // Phase 4: self_confirmed - 自己評価確定済み
  const sheet4 = await prisma.evaluationSheet.create({
    data: {
      userId: employee4.id,
      periodId: currentPeriod.id,
      status: Phase.self_confirmed,
    },
  });

  // Phase 5: manager_evaluation - 上長評価入力中
  const sheet5 = await prisma.evaluationSheet.create({
    data: {
      userId: employee5.id,
      periodId: currentPeriod.id,
      status: Phase.manager_evaluation,
    },
  });

  // Phase 6: manager_confirmed - 上長評価確定済み
  const sheet6 = await prisma.evaluationSheet.create({
    data: {
      userId: employee6.id,
      periodId: currentPeriod.id,
      status: Phase.manager_confirmed,
    },
  });

  // Phase 7: hr_evaluation - HR判断入力中
  const sheet7 = await prisma.evaluationSheet.create({
    data: {
      userId: employee7.id,
      periodId: currentPeriod.id,
      status: Phase.hr_evaluation,
    },
  });

  // Phase 8: finalized - 最終確定
  const sheet8 = await prisma.evaluationSheet.create({
    data: {
      userId: employee8.id,
      periodId: currentPeriod.id,
      status: Phase.finalized,
    },
  });

  // マネージャーとHRのシート
  for (const { user } of allUsers.filter(
    (u) => u.user.id === hrUser.id || u.user.id === salesManager.id || u.user.id === sales1Manager.id || u.user.id === sales2Manager.id || u.user.id === devManager.id
  )) {
    await prisma.evaluationSheet.create({
      data: {
        userId: user.id,
        periodId: currentPeriod.id,
        status: Phase.self_evaluation,
      },
    });
  }

  console.log('Current period sheets created');

  // ===== 各シートに目標・評価データを追加 =====

  // Sheet 1: goal_setting - 目標1つだけ入力中
  await createGoal(sheet1.id, 1, '新規顧客開拓', '新規顧客を月5件獲得', '月間5件以上の新規契約', 40);

  // Sheet 2: goal_review - 目標3つ完成（合計100%）
  await createGoal(sheet2.id, 1, '売上目標達成', '四半期売上目標1000万円を達成する', '売上1000万円以上', 40);
  await createGoal(sheet2.id, 2, '顧客満足度向上', '既存顧客の満足度を向上させる', '顧客満足度4.5以上', 35);
  await createGoal(sheet2.id, 3, 'スキル習得', '営業資格を取得する', '資格取得', 25);

  // Sheet 3: self_evaluation - 目標あり、自己評価入力中
  const goal3_1 = await createGoal(sheet3.id, 1, 'プロジェクト完遂', '担当プロジェクトを期限内に完了', '期限内納品', 40);
  const goal3_2 = await createGoal(sheet3.id, 2, 'チーム貢献', 'チームの生産性向上に貢献', '生産性10%向上', 35);
  const goal3_3 = await createGoal(sheet3.id, 3, '技術習得', '新技術を習得し業務に活用', '新技術を1つ以上習得', 25);

  // 自己評価は一部のみ入力
  await createSelfEvaluation(goal3_1.id, '担当プロジェクトを計画通り完了。顧客からも高評価を得た。', PerformanceRating.A, '計画的に進められた', 'チームとの連携も良好だった', '困難を乗り越えられた', CompetencyRating.LEVEL_3_0);
  await createSelfEvaluation(goal3_2.id, 'ツール導入により生産性15%向上を達成。', PerformanceRating.S, null, null, null, null);

  // Sheet 4: self_confirmed - 目標・自己評価完了
  const goal4_1 = await createGoal(sheet4.id, 1, '営業成績達成', '年間売上目標を達成', '年間売上5000万円', 40);
  const goal4_2 = await createGoal(sheet4.id, 2, '新規開拓', '新規顧客30社を開拓', '新規30社契約', 35);
  const goal4_3 = await createGoal(sheet4.id, 3, '後輩指導', '新人の教育・指導を担当', '新人が独り立ち', 25);

  await createSelfEvaluation(goal4_1.id, '年間売上5200万円を達成。目標を4%上回った。', PerformanceRating.A, '計画的なアプローチができた', 'お客様との信頼関係を構築できた', '粘り強く交渉できた', CompetencyRating.LEVEL_3_0);
  await createSelfEvaluation(goal4_2.id, '新規35社と契約。展示会での積極的なアプローチが功を奏した。', PerformanceRating.S, '積極的にアプローチできた', '他部署との連携も取れた', '新しい手法にも挑戦できた', CompetencyRating.LEVEL_3_5);
  await createSelfEvaluation(goal4_3.id, '新人2名を担当し、3ヶ月で独り立ちさせた。', PerformanceRating.A, '丁寧に指導できた', '新人の成長をサポートできた', '自分自身も成長できた', CompetencyRating.LEVEL_3_0);

  // Sheet 5: manager_evaluation - 上長評価入力中
  const goal5_1 = await createGoal(sheet5.id, 1, 'システム開発', '基幹システムの改修を完了', '改修完了・稼働', 40);
  const goal5_2 = await createGoal(sheet5.id, 2, '品質向上', 'バグ発生率を50%削減', 'バグ50%減', 35);
  const goal5_3 = await createGoal(sheet5.id, 3, 'ドキュメント整備', '設計書・仕様書を整備', 'ドキュメント完備', 25);

  await createSelfEvaluation(goal5_1.id, '基幹システム改修を予定通り完了。安定稼働中。', PerformanceRating.A, 'スケジュール管理ができた', 'チームと協力できた', '問題解決能力が向上した', CompetencyRating.LEVEL_3_0);
  await createSelfEvaluation(goal5_2.id, 'テスト自動化により、バグ発生率60%減を達成。', PerformanceRating.S, '品質への意識が高まった', 'テスト設計力が向上した', '継続的な改善ができた', CompetencyRating.LEVEL_3_5);
  await createSelfEvaluation(goal5_3.id, '全ての設計書・仕様書を最新化。', PerformanceRating.A, '丁寧に作業できた', '他メンバーにも共有できた', '継続的に更新する習慣がついた', CompetencyRating.LEVEL_3_0);

  // 上長評価は一部のみ入力
  await createManagerEvaluation(goal5_1.id, '計画通りに完了し、安定稼働を実現した点は評価できる。', PerformanceRating.A, 'スケジュール管理能力が高い。', CompetencyRating.LEVEL_3_0);

  // Sheet 6: manager_confirmed - 上長評価完了
  const goal6_1 = await createGoal(sheet6.id, 1, 'インフラ構築', 'クラウド環境の構築', '本番環境稼働', 40);
  const goal6_2 = await createGoal(sheet6.id, 2, '運用効率化', '運用作業の自動化', '作業時間50%削減', 35);
  const goal6_3 = await createGoal(sheet6.id, 3, 'セキュリティ強化', 'セキュリティ対策の実施', '脆弱性ゼロ', 25);

  await createSelfEvaluation(goal6_1.id, 'AWS環境を構築し、本番稼働を開始。コスト20%削減も達成。', PerformanceRating.S, '技術力を活かせた', 'コスト意識を持てた', '最新技術を習得できた', CompetencyRating.LEVEL_3_5);
  await createSelfEvaluation(goal6_2.id, '運用作業を60%自動化。Ansibleを活用。', PerformanceRating.S, '効率化を追求できた', 'ツール選定が適切だった', '継続的に改善できた', CompetencyRating.LEVEL_3_5);
  await createSelfEvaluation(goal6_3.id, '脆弱性診断を実施し、全て対処完了。', PerformanceRating.A, 'セキュリティ意識が向上した', '計画的に対応できた', '最新の脅威にも対応できた', CompetencyRating.LEVEL_3_0);

  await createManagerEvaluation(goal6_1.id, 'クラウド移行を成功させた。コスト削減も素晴らしい。', PerformanceRating.S, '技術力・コスト意識ともに高い。昇格候補。', CompetencyRating.LEVEL_3_5);
  await createManagerEvaluation(goal6_2.id, '自動化の取り組みは部全体に良い影響を与えた。', PerformanceRating.S, '効率化への意識が高く、他メンバーの模範となっている。', CompetencyRating.LEVEL_3_5);
  await createManagerEvaluation(goal6_3.id, 'セキュリティ対策を確実に実施した。', PerformanceRating.A, '責任感を持って取り組んだ。', CompetencyRating.LEVEL_3_0);

  // TotalEvaluation（Mgr判断まで）
  await prisma.totalEvaluation.create({
    data: {
      sheetId: sheet6.id,
      averageScore: 4.25,
      performanceComment: '全ての目標を達成し、特にインフラ構築とコスト削減で顕著な成果を上げた。',
      competencyLevel: CompetencyRating.LEVEL_3_5,
      competencyLevelReason: '技術力が高く、チームへの貢献度も大きい。次のステップへの準備ができている。',
      mgrTreatment: Treatment.raise,
      mgrSalaryChange: 20000,
      mgrTreatmentComment: '成果に見合う昇給を強く推奨。昇格も視野に入れるべき。',
      mgrGrade: Grade.G3,
      mgrGradeComment: '次期昇格候補として推薦する。',
    },
  });

  // Sheet 7: hr_evaluation - HR判断入力中
  const goal7_1 = await createGoal(sheet7.id, 1, 'UI/UX改善', 'ユーザビリティを向上', 'UX評価4.5以上', 40);
  const goal7_2 = await createGoal(sheet7.id, 2, 'フロントエンド刷新', 'React移行を完了', '移行完了', 35);
  const goal7_3 = await createGoal(sheet7.id, 3, 'パフォーマンス改善', 'ページ読み込み速度を改善', '読み込み時間2秒以内', 25);

  await createSelfEvaluation(goal7_1.id, 'ユーザーテストを実施し、UX評価4.7を達成。', PerformanceRating.S, 'ユーザー視点で考えられた', 'デザイナーと協力できた', 'データに基づいて改善できた', CompetencyRating.LEVEL_3_5);
  await createSelfEvaluation(goal7_2.id, 'React移行を完了。コード品質も向上した。', PerformanceRating.A, '計画的に進められた', 'チームで協力できた', '新技術を習得できた', CompetencyRating.LEVEL_3_0);
  await createSelfEvaluation(goal7_3.id, 'ページ読み込み時間を1.5秒に短縮。', PerformanceRating.S, 'ボトルネックを特定できた', '最適化技術を習得した', '継続的に監視できた', CompetencyRating.LEVEL_3_5);

  await createManagerEvaluation(goal7_1.id, 'ユーザビリティ向上への取り組みは素晴らしい。', PerformanceRating.S, 'ユーザー視点を持てる貴重な人材。', CompetencyRating.LEVEL_3_5);
  await createManagerEvaluation(goal7_2.id, 'React移行をスムーズに完了させた。', PerformanceRating.A, '技術力が高く、チームをリードできる。', CompetencyRating.LEVEL_3_0);
  await createManagerEvaluation(goal7_3.id, 'パフォーマンス改善の成果は顕著。', PerformanceRating.S, '問題解決能力が高い。', CompetencyRating.LEVEL_3_5);

  await prisma.totalEvaluation.create({
    data: {
      sheetId: sheet7.id,
      averageScore: 4.15,
      performanceComment: 'フロントエンド領域で顕著な成果を上げた。UX改善とパフォーマンス改善は特に評価できる。',
      competencyLevel: CompetencyRating.LEVEL_3_5,
      competencyLevelReason: '技術力・問題解決能力ともに高い。リーダーシップも発揮している。',
      mgrTreatment: Treatment.raise,
      mgrSalaryChange: 18000,
      mgrTreatmentComment: '成果に見合う昇給を推奨。',
      mgrGrade: Grade.G4,
      mgrGradeComment: '現等級で十分な成果を出しており、次期昇格を検討。',
      // HR判断は入力中なのでnull
    },
  });

  // Sheet 8: finalized - 全て完了
  const goal8_1 = await createGoal(sheet8.id, 1, 'アーキテクチャ設計', 'マイクロサービス設計を完了', '設計書完成・レビュー完了', 40);
  const goal8_2 = await createGoal(sheet8.id, 2, '技術選定', '新規プロジェクトの技術選定', '技術選定完了', 30);
  const goal8_3 = await createGoal(sheet8.id, 3, 'メンバー育成', 'チームメンバーの技術力向上', 'メンバー全員がスキルアップ', 30);

  await createSelfEvaluation(goal8_1.id, 'マイクロサービスアーキテクチャを設計。レビューでも高評価を得た。', PerformanceRating.S, '全体を俯瞰して設計できた', '関係者と合意形成できた', '最新のベストプラクティスを適用できた', CompetencyRating.LEVEL_4_0);
  await createSelfEvaluation(goal8_2.id, '新規プロジェクトの技術スタックを選定。コスト・パフォーマンスを考慮。', PerformanceRating.A, '多角的に検討できた', 'チームの意見も取り入れた', '将来性も考慮できた', CompetencyRating.LEVEL_3_5);
  await createSelfEvaluation(goal8_3.id, '勉強会を月2回開催し、メンバー全員のスキルが向上した。', PerformanceRating.S, '計画的に育成できた', 'メンバーのモチベーションを高められた', '自分自身も成長できた', CompetencyRating.LEVEL_4_0);

  await createManagerEvaluation(goal8_1.id, 'アーキテクチャ設計能力は部内トップクラス。', PerformanceRating.S, '設計力・リーダーシップともに優れている。', CompetencyRating.LEVEL_4_0);
  await createManagerEvaluation(goal8_2.id, '技術選定の判断は適切だった。', PerformanceRating.A, '幅広い知識を持っている。', CompetencyRating.LEVEL_3_5);
  await createManagerEvaluation(goal8_3.id, 'メンバー育成への貢献は非常に大きい。', PerformanceRating.S, 'チーム全体のレベルを引き上げた。', CompetencyRating.LEVEL_4_0);

  await prisma.totalEvaluation.create({
    data: {
      sheetId: sheet8.id,
      averageScore: 4.5,
      performanceComment: '全ての目標で優秀な成果を上げた。特にアーキテクチャ設計とメンバー育成での貢献は顕著。',
      competencyLevel: CompetencyRating.LEVEL_4_0,
      competencyLevelReason: '技術力・リーダーシップ・育成能力全てにおいて高いレベル。次のキャリアステップへの準備ができている。',
      mgrTreatment: Treatment.raise,
      mgrSalaryChange: 30000,
      mgrTreatmentComment: '昇格・昇給を強く推奨。部内で最も成長した人材。',
      mgrGrade: Grade.G5,
      mgrGradeComment: '昇格を強く推薦する。',
      hrTreatment: Treatment.raise,
      hrSalaryChange: 25000,
      hrGrade: Grade.G5,
    },
  });

  console.log('Current period sheets with all phases created');

  // ===== 過去期間のシート（全員 finalized） =====
  for (const { user, grade } of allUsers) {
    const sheet = await prisma.evaluationSheet.create({
      data: {
        userId: user.id,
        periodId: pastPeriod.id,
        status: Phase.finalized,
      },
    });

    // 目標と評価を作成
    const goal1 = await createGoal(sheet.id, 1, '業務目標1', '主要な業務目標を達成する', '目標達成', 40);
    const goal2 = await createGoal(sheet.id, 2, '業務目標2', '副次的な業務目標を達成する', '目標達成', 35);
    const goal3 = await createGoal(sheet.id, 3, '自己成長', '自己成長に取り組む', 'スキルアップ', 25);

    const rating = [PerformanceRating.S, PerformanceRating.A, PerformanceRating.A, PerformanceRating.B][Math.floor(Math.random() * 4)];
    const compRating = [CompetencyRating.LEVEL_3_0, CompetencyRating.LEVEL_3_0_MINUS, CompetencyRating.LEVEL_3_5][Math.floor(Math.random() * 3)];

    await createSelfEvaluation(goal1.id, '目標を達成した。', rating, '計画的に進められた', '協力して取り組めた', '成長を実感できた', compRating);
    await createSelfEvaluation(goal2.id, '目標を達成した。', rating, '効率的に進められた', 'チームに貢献できた', '新しいことを学べた', compRating);
    await createSelfEvaluation(goal3.id, 'スキルアップできた。', PerformanceRating.A, '学習に取り組めた', '知識を活かせた', '継続できた', compRating);

    await createManagerEvaluation(goal1.id, '目標を達成した。', rating, '着実に成長している。', compRating);
    await createManagerEvaluation(goal2.id, '良い成果を出した。', rating, 'チームへの貢献も評価できる。', compRating);
    await createManagerEvaluation(goal3.id, '自己成長への意欲が高い。', PerformanceRating.A, '今後の成長に期待。', compRating);

    const score = rating === PerformanceRating.S ? 4.0 : rating === PerformanceRating.A ? 3.5 : 3.0;
    const treatment = score >= 3.5 ? Treatment.raise : Treatment.maintain;
    const salaryChange = score >= 4.0 ? 20000 : score >= 3.5 ? 10000 : 0;

    await prisma.totalEvaluation.create({
      data: {
        sheetId: sheet.id,
        averageScore: score,
        performanceComment: '目標を達成し、成長が見られた。',
        competencyLevel: compRating,
        competencyLevelReason: '業務遂行能力は基準を満たしている。',
        mgrTreatment: treatment,
        mgrSalaryChange: salaryChange,
        mgrTreatmentComment: treatment === Treatment.raise ? '昇給を推奨。' : '現状維持。',
        mgrGrade: grade,
        mgrGradeComment: '現等級が適切。',
        hrTreatment: treatment,
        hrSalaryChange: salaryChange,
        hrGrade: grade,
      },
    });
  }

  console.log('Past period sheets created');
  console.log('Seeding completed!');
}

// ヘルパー関数
async function createGoal(sheetId: string, sortOrder: number, title: string, description: string, criteria: string, weight: number) {
  return prisma.goal.create({
    data: {
      sheetId,
      sortOrder,
      title,
      description,
      achievementCriteria: criteria,
      weight,
    },
  });
}

async function createSelfEvaluation(
  goalId: string,
  reflection: string,
  rating: PerformanceRating,
  comp1: string | null,
  comp2: string | null,
  comp3: string | null,
  compRating: CompetencyRating | null
) {
  return prisma.goalSelfEvaluation.create({
    data: {
      goalId,
      performanceReflection: reflection,
      performanceRating: rating,
      competencyReflection1: comp1,
      competencyReflection2: comp2,
      competencyReflection3: comp3,
      competencyRating: compRating,
    },
  });
}

async function createManagerEvaluation(
  goalId: string,
  comment: string,
  rating: PerformanceRating,
  compComment: string,
  compRating: CompetencyRating
) {
  return prisma.goalManagerEvaluation.create({
    data: {
      goalId,
      performanceComment: comment,
      performanceRating: rating,
      competencyComment: compComment,
      competencyRating: compRating,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
