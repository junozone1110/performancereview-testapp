# 実行計画書

## 概要

従業員目標設定・振り返り・評価システムのモックアップ開発計画

---

## 技術スタック

| レイヤー | 技術 | 備考 |
|----------|------|------|
| フロントエンド | Next.js 14 (App Router) | TypeScript |
| UIライブラリ | Tailwind CSS + shadcn/ui | |
| バックエンド | Next.js API Routes | |
| ORM | Prisma | |
| データベース | PostgreSQL | Supabase |
| 認証 | NextAuth.js | Google Workspace SSO |
| ホスティング | Vercel | |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (employee)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── sheet/[sheetId]/
│   │       └── page.tsx
│   ├── (manager)/
│   │   ├── team/
│   │   │   └── page.tsx
│   │   └── sheet/[sheetId]/
│   │       └── page.tsx
│   ├── (hr)/
│   │   ├── employees/
│   │   │   └── page.tsx
│   │   ├── periods/
│   │   │   └── page.tsx
│   │   ├── import/
│   │   │   └── page.tsx
│   │   ├── viewers/
│   │   │   └── page.tsx
│   │   └── sheet/[sheetId]/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── sheets/
│   │   │   ├── route.ts
│   │   │   └── [sheetId]/
│   │   │       └── route.ts
│   │   ├── goals/
│   │   │   ├── route.ts
│   │   │   └── [goalId]/
│   │   │       └── route.ts
│   │   ├── evaluations/
│   │   │   └── route.ts
│   │   ├── periods/
│   │   │   └── route.ts
│   │   ├── import/
│   │   │   └── route.ts
│   │   └── users/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── sheet/                 # 評価シート関連
│   │   ├── EvaluationSheet.tsx
│   │   ├── GoalCard.tsx
│   │   ├── GoalForm.tsx
│   │   ├── SelfEvaluationForm.tsx
│   │   ├── ManagerEvaluationForm.tsx
│   │   ├── TotalEvaluation.tsx
│   │   └── WeightIndicator.tsx
│   ├── layout/                # レイアウト
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navigation.tsx
│   │   └── RoleGuard.tsx
│   └── common/                # 共通
│       ├── StatusBadge.tsx
│       ├── RatingSelect.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # NextAuth config
│   ├── permissions.ts         # 権限チェック
│   ├── workflow.ts            # ワークフロー制御
│   └── utils.ts               # ユーティリティ
├── types/
│   ├── index.ts
│   ├── evaluation.ts
│   ├── user.ts
│   └── api.ts
├── hooks/
│   ├── useSheet.ts
│   ├── useGoals.ts
│   ├── usePermissions.ts
│   └── useWorkflow.ts
└── prisma/
    ├── schema.prisma
    ├── migrations/
    └── seed.ts
```

---

## Phase 1: 基盤構築

### 1-1. プロジェクト初期化

**タスク**
- [ ] Next.js 14プロジェクト作成
- [ ] TypeScript設定
- [ ] Tailwind CSS設定
- [ ] shadcn/ui初期化
- [ ] ESLint/Prettier設定

**コマンド**
```bash
npx create-next-app@latest performance-review --typescript --tailwind --eslint --app
cd performance-review
npx shadcn-ui@latest init
```

### 1-2. Prismaセットアップ

**タスク**
- [ ] Prismaインストール
- [ ] schema.prisma作成
- [ ] Supabase接続設定
- [ ] マイグレーション実行
- [ ] Prisma Client生成

**スキーマ定義（prisma/schema.prisma）**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  employee
  manager
  hr
}

enum Half {
  first
  second
}

enum Phase {
  goal_setting
  goal_review
  self_evaluation
  self_confirmed
  manager_evaluation
  manager_confirmed
  hr_evaluation
  finalized
}

enum PerformanceRating {
  SS
  S
  A
  B
  C
}

enum CompetencyRating {
  LEVEL_2_0
  LEVEL_2_5
  LEVEL_3_0_MINUS
  LEVEL_3_0
  LEVEL_3_5
  LEVEL_4_0
}

enum Grade {
  G1
  G2
  G3
  G4
  G5
  G6
  G7
}

enum Treatment {
  raise
  maintain
  reduce
}

model User {
  id              String    @id @default(uuid())
  employeeNumber  String    @unique @map("employee_number")
  email           String    @unique
  name            String
  isActive        Boolean   @default(true) @map("is_active")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  roles               UserRole[]
  periodAssignments   PeriodAssignment[]
  managedAssignments  PeriodAssignment[] @relation("Manager")
  sheets              EvaluationSheet[]
  viewableSheets      AdditionalViewer[]
  createdViewers      AdditionalViewer[] @relation("CreatedBy")

  @@map("users")
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  role      Role
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("user_roles")
}

model Department {
  id        String   @id @default(uuid())
  name      String
  parentId  String?  @map("parent_id")
  smarthrId String?  @map("smarthr_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  parent            Department?        @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children          Department[]       @relation("DepartmentHierarchy")
  periodAssignments PeriodAssignment[]

  @@map("departments")
}

model EvaluationPeriod {
  id           String   @id @default(uuid())
  name         String
  year         Int
  half         Half
  startDate    DateTime @map("start_date")
  endDate      DateTime @map("end_date")
  currentPhase Phase    @default(goal_setting) @map("current_phase")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  periodAssignments PeriodAssignment[]
  sheets            EvaluationSheet[]

  @@map("evaluation_periods")
}

model PeriodAssignment {
  id           String   @id @default(uuid())
  periodId     String   @map("period_id")
  userId       String   @map("user_id")
  departmentId String   @map("department_id")
  managerId    String   @map("manager_id")
  currentGrade Grade    @map("current_grade")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  period     EvaluationPeriod @relation(fields: [periodId], references: [id])
  user       User             @relation(fields: [userId], references: [id])
  department Department       @relation(fields: [departmentId], references: [id])
  manager    User             @relation("Manager", fields: [managerId], references: [id])

  @@unique([periodId, userId])
  @@map("period_assignments")
}

model EvaluationSheet {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  periodId  String   @map("period_id")
  status    Phase    @default(goal_setting)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user             User              @relation(fields: [userId], references: [id])
  period           EvaluationPeriod  @relation(fields: [periodId], references: [id])
  goals            Goal[]
  totalEvaluation  TotalEvaluation?
  additionalViewers AdditionalViewer[]

  @@unique([userId, periodId])
  @@map("evaluation_sheets")
}

model Goal {
  id                  String   @id @default(uuid())
  sheetId             String   @map("sheet_id")
  sortOrder           Int      @map("sort_order")
  title               String
  description         String?
  achievementCriteria String?  @map("achievement_criteria")
  weight              Int
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  sheet             EvaluationSheet       @relation(fields: [sheetId], references: [id])
  selfEvaluation    GoalSelfEvaluation?
  managerEvaluation GoalManagerEvaluation?

  @@map("goals")
}

model GoalSelfEvaluation {
  id                     String            @id @default(uuid())
  goalId                 String            @unique @map("goal_id")
  performanceReflection  String?           @map("performance_reflection")
  performanceRating      PerformanceRating? @map("performance_rating")
  competencyReflection1  String?           @map("competency_reflection_1")
  competencyReflection2  String?           @map("competency_reflection_2")
  competencyReflection3  String?           @map("competency_reflection_3")
  competencyRating       CompetencyRating? @map("competency_rating")
  createdAt              DateTime          @default(now()) @map("created_at")
  updatedAt              DateTime          @updatedAt @map("updated_at")

  goal Goal @relation(fields: [goalId], references: [id])

  @@map("goal_self_evaluations")
}

model GoalManagerEvaluation {
  id                 String            @id @default(uuid())
  goalId             String            @unique @map("goal_id")
  performanceComment String?           @map("performance_comment")
  performanceRating  PerformanceRating? @map("performance_rating")
  competencyComment  String?           @map("competency_comment")
  competencyRating   CompetencyRating? @map("competency_rating")
  createdAt          DateTime          @default(now()) @map("created_at")
  updatedAt          DateTime          @updatedAt @map("updated_at")

  goal Goal @relation(fields: [goalId], references: [id])

  @@map("goal_manager_evaluations")
}

model TotalEvaluation {
  id                    String            @id @default(uuid())
  sheetId               String            @unique @map("sheet_id")
  averageScore          Decimal?          @map("average_score") @db.Decimal(3, 2)
  performanceComment    String?           @map("performance_comment")
  competencyLevel       CompetencyRating? @map("competency_level")
  competencyLevelReason String?           @map("competency_level_reason")
  mgrTreatment          Treatment?        @map("mgr_treatment")
  mgrSalaryChange       Int?              @map("mgr_salary_change")
  mgrTreatmentComment   String?           @map("mgr_treatment_comment")
  mgrGrade              Grade?            @map("mgr_grade")
  mgrGradeComment       String?           @map("mgr_grade_comment")
  hrTreatment           Treatment?        @map("hr_treatment")
  hrSalaryChange        Int?              @map("hr_salary_change")
  hrGrade               Grade?            @map("hr_grade")
  createdAt             DateTime          @default(now()) @map("created_at")
  updatedAt             DateTime          @updatedAt @map("updated_at")

  sheet EvaluationSheet @relation(fields: [sheetId], references: [id])

  @@map("total_evaluations")
}

model AdditionalViewer {
  id           String   @id @default(uuid())
  sheetId      String   @map("sheet_id")
  viewerUserId String   @map("viewer_user_id")
  createdBy    String   @map("created_by")
  createdAt    DateTime @default(now()) @map("created_at")

  sheet   EvaluationSheet @relation(fields: [sheetId], references: [id])
  viewer  User            @relation(fields: [viewerUserId], references: [id])
  creator User            @relation("CreatedBy", fields: [createdBy], references: [id])

  @@map("additional_viewers")
}
```

### 1-3. 認証実装

**タスク**
- [ ] NextAuth.jsインストール
- [ ] Google OAuth設定
- [ ] セッション管理
- [ ] 認証ミドルウェア

**必要な環境変数**
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### 1-4. 権限管理

**タスク**
- [ ] 権限チェック関数作成
- [ ] ロールベースガード実装
- [ ] APIミドルウェア

**lib/permissions.ts**
```typescript
export type Permission =
  | 'view_own_sheet'
  | 'edit_own_goals'
  | 'edit_own_self_evaluation'
  | 'view_team_sheets'
  | 'edit_team_evaluation'
  | 'view_all_sheets'
  | 'edit_all_sheets'
  | 'manage_periods'
  | 'manage_imports'
  | 'manage_viewers';

export const rolePermissions: Record<Role, Permission[]> = {
  employee: ['view_own_sheet', 'edit_own_goals', 'edit_own_self_evaluation'],
  manager: ['view_own_sheet', 'edit_own_goals', 'edit_own_self_evaluation',
            'view_team_sheets', 'edit_team_evaluation'],
  hr: ['view_own_sheet', 'edit_own_goals', 'edit_own_self_evaluation',
       'view_all_sheets', 'edit_all_sheets', 'manage_periods',
       'manage_imports', 'manage_viewers'],
};
```

### 1-5. 共通レイアウト

**タスク**
- [ ] ヘッダーコンポーネント
- [ ] サイドバーコンポーネント
- [ ] 権限別ナビゲーション
- [ ] レスポンシブ対応

### 1-6. マスタデータ投入

**タスク**
- [ ] シードスクリプト作成
- [ ] 初期データ投入

---

## Phase 2: 評価シート機能

### 2-1. 評価シート画面（UI）

**タスク**
- [ ] シートレイアウト
- [ ] 目標カードコンポーネント
- [ ] 総評セクション
- [ ] アクションボタン

### 2-2. 目標CRUD

**タスク**
- [ ] 目標追加フォーム
- [ ] 目標編集
- [ ] 目標削除（確認ダイアログ）
- [ ] ドラッグ&ドロップ並び替え

### 2-3. ウェイトバリデーション

**タスク**
- [ ] 合計100%チェック
- [ ] 1目標最大40%チェック
- [ ] リアルタイムバリデーション
- [ ] エラー表示

### 2-4. 自己評価入力

**タスク**
- [ ] 成果振り返りフォーム
- [ ] コンピテンシー振り返りフォーム（3項目）
- [ ] 評価ランク選択
- [ ] 自動保存

### 2-5. 上長評価入力

**タスク**
- [ ] 上長コメント入力
- [ ] 上長評価ランク選択
- [ ] Mgr判断入力（処置・昇給額・等級）

### 2-6. トータル評価

**タスク**
- [ ] 平均点自動計算
- [ ] コンピテンシーレベル入力
- [ ] HR判断入力

### 2-7. ワークフロー制御

**タスク**
- [ ] フェーズ判定ロジック
- [ ] フェーズ別入力可否制御
- [ ] ステータス遷移
- [ ] 確定ボタン制御

### 2-8. 閲覧権限制御

**タスク**
- [ ] 項目別表示/非表示
- [ ] 編集可否制御
- [ ] 上長評価の従業員非表示

---

## Phase 3: 管理機能

### 3-1. マイページ（従業員）

**タスク**
- [ ] 自分のシート一覧
- [ ] 期間別表示
- [ ] ステータス表示

### 3-2. 部下一覧（管理職）

**タスク**
- [ ] 管理対象従業員取得
- [ ] 一覧表示
- [ ] ステータスフィルタ
- [ ] シートへのリンク

### 3-3. 全従業員一覧（HR）

**タスク**
- [ ] 全従業員検索
- [ ] 部署フィルタ
- [ ] ステータスフィルタ
- [ ] ページネーション

### 3-4. 評価期間管理（HR）

**タスク**
- [ ] 期間作成フォーム
- [ ] フェーズ切替
- [ ] 期間一覧

### 3-5. 組織インポート（HR）

**タスク**
- [ ] CSVアップロード
- [ ] プレビュー表示
- [ ] バリデーション
- [ ] インポート実行
- [ ] エラーハンドリング

**CSVフォーマット**
```csv
employee_number,name,email,department_code,department_name,manager_employee_number,grade,is_manager
1001,山田太郎,yamada@example.com,D001,営業1課,2001,G3,false
1002,田中花子,tanaka@example.com,D001,営業1課,2001,G2,false
2001,鈴木一郎,suzuki@example.com,D000,営業部,3001,G5,true
```

### 3-6. 追加閲覧者設定（HR）

**タスク**
- [ ] 従業員選択
- [ ] 閲覧者追加
- [ ] 閲覧者削除

---

## Phase 4: テスト・調整

### 4-1. E2Eテスト

**タスク**
- [ ] ログインフロー
- [ ] 目標設定フロー
- [ ] 自己評価フロー
- [ ] 上長評価フロー

### 4-2. レスポンシブ対応

**タスク**
- [ ] モバイル表示調整
- [ ] タブレット表示調整

### 4-3. エラーハンドリング

**タスク**
- [ ] API エラー処理
- [ ] フォームバリデーション
- [ ] エラー表示UI

### 4-4. デモデータ作成

**タスク**
- [ ] サンプル従業員データ
- [ ] サンプル目標データ
- [ ] サンプル評価データ

---

## 開発環境セットアップ手順

```bash
# 1. プロジェクトクローン後
cd performance-review

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.localを編集

# 4. データベースマイグレーション
npx prisma migrate dev

# 5. シードデータ投入
npx prisma db seed

# 6. 開発サーバー起動
npm run dev
```

---

## 改訂履歴

| 日付 | バージョン | 内容 |
|------|------------|------|
| 2026-02-04 | 1.0 | 初版作成 |
