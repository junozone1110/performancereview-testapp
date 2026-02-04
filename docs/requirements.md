# 従業員目標設定・振り返り・評価システム 要件定義書

## 1. プロジェクト概要

### 1.1 目的
従業員の目標設定・振り返り・評価をスクラッチで構築し、現行SaaS（カオナビ）からの移行を目指す。

### 1.2 利用規模
| 項目 | 数量 |
|------|------|
| 従業員数 | 500名 |
| 管理職数 | 50名 |

### 1.3 技術スタック
| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| UIライブラリ | Tailwind CSS + shadcn/ui |
| バックエンド | Next.js API Routes |
| ORM | Prisma |
| データベース | PostgreSQL |
| 認証 | NextAuth.js (Google Workspace SSO) |
| ホスティング | Vercel + Supabase (PostgreSQL) |

---

## 2. 基本仕様

### 2.1 評価サイクル
- **半期ごと**（上期・下期）に目標設定・振り返り・評価を実施
- 半期ごとに従業員1名につき1枚の評価シートが作成される
- 組織情報（部署・上長・等級）は半期ごとにスナップショットとして保持

### 2.2 目標設定ルール
| 項目 | 仕様 |
|------|------|
| 目標数 | 可変（最大6個） |
| ウェイト | 1目標あたり最大40%、合計100%必須 |
| カテゴリ | なし |

### 2.3 評価段階

**成果評価**
| ランク | 数値換算 |
|--------|----------|
| SS | 5 |
| S | 4 |
| A | 3 |
| B | 2 |
| C | 1 |

**コンピテンシー評価**
| ランク |
|--------|
| 2.0 |
| 2.5 |
| 3.0マイナス |
| 3.0 |
| 3.5 |
| 4.0 |

### 2.4 処置
| 選択肢 |
|--------|
| 昇給 |
| 現状維持 |
| 降給 |

### 2.5 等級
| 等級 |
|------|
| G1 |
| G2 |
| G3 |
| G4 |
| G5 |
| G6 |
| G7 |

---

## 3. ワークフロー

```
① 目標入力        - 従業員が目標を入力
② 目標確定        - 上長が承認（承認のみ、修正は従業員側で実施）
③ 自己評価入力    - 従業員が振り返り・自己評価を入力
④ 自己評価確定    - 従業員が確定
⑤ 上長評価入力    - 上長が評価・Mgr判断を入力
⑥ 上長評価確定    - 上長が確定
⑦ HR判断入力     - HRが最終判断を入力
⑧ 最終確定        - 評価完了
```

---

## 4. 権限

### 4.1 権限種別
| 権限 | 対象範囲 | できること |
|------|----------|------------|
| 従業員 | 自分のみ | 目標設定、自己評価入力 |
| 管理職 | 管理対象従業員 | 閲覧、評価記入、Mgr判断入力 |
| HR | 全従業員 | 全項目の閲覧・更新、HR判断入力、追加閲覧者設定 |

### 4.2 閲覧権限マトリクス
| 項目 | 従業員 | 管理職 | HR |
|------|--------|--------|-----|
| 目標・ウェイト | ○ | ○ | ○ |
| 自己評価（振り返り・評価） | ○ | ○ | ○ |
| 上長評価（コメント・評価） | × | ○ | ○ |
| 平均点 | ○ | ○ | ○ |
| コンピテンシーレベル・根拠 | × | ○ | ○ |
| Mgr判断（処置・昇給額・等級） | × | ○ | ○ |
| HR判断（最終処置・昇給額・等級） | × | ○ | ○ |

### 4.3 追加閲覧者
- HRは従業員ごとに上長以外の閲覧者を任意設定可能

---

## 5. 評価シート項目

### 5.1 目標ごとの項目（最大6目標）

| # | 項目名 | 入力者 | タイミング | 必須 |
|---|--------|--------|------------|------|
| 1 | 目標の概要 | 本人 | 目標設定時 | * |
| 2 | 目標の詳細 | 本人 | 目標設定時 | |
| 3 | 達成基準 | 本人 | 目標設定時 | |
| 4 | ウェイト（%） | 本人 | 目標設定時 | * |
| 5 | 成果に対する振り返り | 本人 | 自己評価時 | |
| 6 | 成果評価（自己） | 本人 | 自己評価時 | |
| 7 | コンピテンシー振り返り① | 本人 | 自己評価時 | |
|   | （注力した取り組みと結果） | | | |
| 8 | コンピテンシー振り返り② | 本人 | 自己評価時 | |
|   | （なぜその取り組みを選んだか） | | | |
| 9 | コンピテンシー振り返り③ | 本人 | 自己評価時 | |
|   | （困難だった点・工夫した点） | | | |
| 10 | コンピテンシー評価（自己） | 本人 | 自己評価時 | |
| 11 | 上長コメント（成果） | 上長 | 上長評価時 | |
| 12 | 成果評価（上長） | 上長 | 上長評価時 | |
| 13 | 上長コメント（コンピテンシー） | 上長 | 上長評価時 | |
| 14 | コンピテンシー評価（上長） | 上長 | 上長評価時 | |

### 5.2 総評セクション

**評価サマリ**
| # | 項目名 | 入力者 | 必須 | 備考 |
|---|--------|--------|------|------|
| 1 | 平均点 | 自動計算 | - | Σ(成果評価数値×ウェイト) |
| 2 | 業績評点に対する申し送り | 上長 | | 成果に出ていないが評価すべき点など |
| 3 | コンピテンシーレベル | 上長 | * | 2.0〜4.0 |
| 4 | コンピテンシーレベルの根拠 | 上長 | | |

**Mgr判断（上長）**
| # | 項目名 | 入力者 | 必須 | 備考 |
|---|--------|--------|------|------|
| 5 | 処置 | 上長 | * | 昇給/現状維持/降給 |
| 6 | 昇給額 | 上長 | | 円 |
| 7 | 処置に対する申し送り | 上長 | | |
| 8 | 等級 | 上長 | | 変更がある場合のみ |
| 9 | 等級に対する申し送り | 上長 | | 変更がある場合のみ |

**HR判断（最終確定）**
| # | 項目名 | 入力者 | 必須 | 備考 |
|---|--------|--------|------|------|
| 10 | 最終処置 | HR | | 昇給/現状維持/降給 |
| 11 | 最終昇給額 | HR | | 円 |
| 12 | 最終等級 | HR | | 変更がある場合のみ |

---

## 6. 画面構成

### 6.1 画面一覧
| # | 画面名 | 対象権限 | 説明 |
|---|--------|----------|------|
| C-1 | ログイン画面 | 全員 | Google Workspace SSO |
| S-1 | 評価シート画面 | 全員 | メイン画面（権限・フェーズで制御） |
| L-1 | マイページ | 従業員 | 自分のシート一覧 |
| L-2 | 部下一覧画面 | 管理職 | 管理対象従業員一覧 |
| L-3 | 全従業員一覧画面 | HR | 全従業員検索・フィルタ |
| H-1 | 評価期間管理画面 | HR | 期間作成、フェーズ切替 |
| H-2 | 組織インポート画面 | HR | CSVインポート（将来的にSmartHR API連携） |
| H-3 | 追加閲覧者設定画面 | HR | 従業員ごとの閲覧者設定 |
| H-4 | マスタ管理画面 | HR | 評価ランク等のマスタ管理 |

### 6.2 評価シート画面（S-1）の制御

**フェーズ×権限による表示・入力制御**
| フェーズ | 従業員 | 管理職 | HR |
|----------|--------|--------|-----|
| ①目標入力 | 目標項目: 入力可 | 閲覧不可 | 全項目: 閲覧・編集可 |
| ②目標確定待ち | 目標項目: 閲覧のみ | 承認ボタン表示 | 全項目: 閲覧・編集可 |
| ③自己評価入力 | 自己評価: 入力可 | 閲覧可、上長評価: 入力不可 | 全項目: 閲覧・編集可 |
| ④自己評価確定 | 閲覧のみ | 閲覧可、上長評価: 入力不可 | 全項目: 閲覧・編集可 |
| ⑤上長評価入力 | 上長評価: 非表示 | 上長評価: 入力可 | 全項目: 閲覧・編集可 |
| ⑥上長評価確定 | 上長評価: 非表示 | 閲覧のみ | 全項目: 閲覧・編集可 |
| ⑦HR判断入力 | 上長評価: 非表示 | 閲覧のみ | HR判断: 入力可 |
| ⑧最終確定 | 上長評価: 非表示 | 閲覧のみ | 閲覧のみ |

---

## 7. データベース設計

### 7.1 テーブル一覧
| # | テーブル名 | 説明 |
|---|------------|------|
| 1 | users | ユーザー（従業員番号で識別） |
| 2 | user_roles | ユーザー権限 |
| 3 | departments | 部署 |
| 4 | evaluation_periods | 評価期間 |
| 5 | period_assignments | 期間別所属（部署・上長・等級） |
| 6 | evaluation_sheets | 評価シート |
| 7 | goals | 目標 |
| 8 | goal_self_evaluations | 目標ごとの自己評価 |
| 9 | goal_manager_evaluations | 目標ごとの上長評価 |
| 10 | total_evaluations | トータル評価（Mgr/HR判断含む） |
| 11 | additional_viewers | 追加閲覧者 |
| 12 | performance_ratings | 成果評価マスタ |
| 13 | competency_ratings | コンピテンシー評価マスタ |
| 14 | grades | 等級マスタ |
| 15 | treatments | 処置マスタ |

### 7.2 テーブル定義

#### users
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| employee_number | VARCHAR(50) | 社員番号（UNIQUE、SmartHR連携キー） |
| email | VARCHAR(255) | メールアドレス（Google認証用） |
| name | VARCHAR(255) | 氏名 |
| is_active | BOOLEAN | 有効フラグ |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### user_roles
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| role | ENUM | 'employee', 'manager', 'hr' |
| created_at | TIMESTAMP | |

#### departments
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| name | VARCHAR(255) | 部署名 |
| parent_id | UUID | 親部署ID |
| smarthr_id | VARCHAR(255) | SmartHR連携用ID |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### evaluation_periods
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| name | VARCHAR(100) | 期間名（例: 2025年度上期） |
| year | INT | 年度 |
| half | ENUM | 'first', 'second' |
| start_date | DATE | 開始日 |
| end_date | DATE | 終了日 |
| current_phase | ENUM | 現在のフェーズ |
| is_active | BOOLEAN | 有効フラグ |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**フェーズENUM**
```
'goal_setting', 'goal_review', 'self_evaluation', 'self_confirmed',
'manager_evaluation', 'manager_confirmed', 'hr_evaluation', 'finalized'
```

#### period_assignments
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| period_id | UUID | FK → evaluation_periods |
| user_id | UUID | FK → users |
| department_id | UUID | FK → departments |
| manager_id | UUID | FK → users（当期の上長） |
| current_grade | ENUM | 現在等級（G1〜G7） |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

UNIQUE: (period_id, user_id)

#### evaluation_sheets
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| period_id | UUID | FK → evaluation_periods |
| status | ENUM | シート個別のステータス |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### goals
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| sheet_id | UUID | FK → evaluation_sheets |
| sort_order | INT | 表示順（1〜6） |
| title | VARCHAR(255) | 目標概要（必須） |
| description | TEXT | 目標詳細 |
| achievement_criteria | TEXT | 達成基準 |
| weight | INT | ウェイト%（必須） |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### goal_self_evaluations
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| goal_id | UUID | FK → goals |
| performance_reflection | TEXT | 成果に対する振り返り |
| performance_rating | ENUM | 成果評価（SS/S/A/B/C） |
| competency_reflection_1 | TEXT | 注力した取り組みと結果 |
| competency_reflection_2 | TEXT | なぜその取り組みを選んだか |
| competency_reflection_3 | TEXT | 困難だった点・工夫した点 |
| competency_rating | ENUM | コンピテンシー評価（2.0〜4.0） |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### goal_manager_evaluations
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| goal_id | UUID | FK → goals |
| performance_comment | TEXT | 成果に対するコメント |
| performance_rating | ENUM | 成果評価（SS/S/A/B/C） |
| competency_comment | TEXT | コンピテンシーに対するコメント |
| competency_rating | ENUM | コンピテンシー評価（2.0〜4.0） |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### total_evaluations
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| sheet_id | UUID | FK → evaluation_sheets |
| average_score | DECIMAL(3,2) | 平均点（自動計算） |
| performance_comment | TEXT | 業績評点に対する申し送り |
| competency_level | ENUM | コンピテンシーレベル（2.0〜4.0） |
| competency_level_reason | TEXT | コンピテンシーレベルの根拠 |
| mgr_treatment | ENUM | 処置（昇給/現状維持/降給） |
| mgr_salary_change | INT | 昇給額（円） |
| mgr_treatment_comment | TEXT | 処置に対する申し送り |
| mgr_grade | ENUM | 等級（G1〜G7） |
| mgr_grade_comment | TEXT | 等級に対する申し送り |
| hr_treatment | ENUM | 最終処置 |
| hr_salary_change | INT | 最終昇給額（円） |
| hr_grade | ENUM | 最終等級 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### additional_viewers
| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | PK |
| sheet_id | UUID | FK → evaluation_sheets |
| viewer_user_id | UUID | FK → users |
| created_by | UUID | FK → users（設定したHR） |
| created_at | TIMESTAMP | |

---

## 8. 外部連携

### 8.1 SmartHR連携（将来実装）

**連携項目**
| # | SmartHR項目 | 評価システム項目 | テーブル |
|---|-------------|------------------|----------|
| 1 | 社員番号 | employee_number | users |
| 2 | 氏名 | name | users |
| 3 | メールアドレス | email | users |
| 4 | 在籍状況 | is_active | users |
| 5 | 部署コード | smarthr_id | departments |
| 6 | 部署名 | name | departments |
| 7 | 親部署コード | parent_id | departments |
| 8 | 所属部署コード | department_id | period_assignments |
| 9 | 上長の社員番号 | manager_id | period_assignments |
| 10 | 等級 | current_grade | period_assignments |
| 11 | 管理職フラグ（カスタム） | role='manager' | user_roles |

**手動設定項目**
- HR権限：評価システム側で手動設定

### 8.2 モックアップ段階
- CSVインポートで代替
- SmartHR API連携は将来実装

---

## 9. 実行計画

### Phase 1: 基盤構築
| # | タスク | 成果物 |
|---|--------|--------|
| 1-1 | プロジェクト初期化 | Next.js + TypeScript + Tailwind |
| 1-2 | Prismaセットアップ | スキーマ定義、マイグレーション |
| 1-3 | 認証実装 | Google OAuth、セッション管理 |
| 1-4 | 権限管理 | ロールベースアクセス制御 |
| 1-5 | 共通レイアウト | ヘッダー、サイドバー、権限別表示切替 |
| 1-6 | マスタデータ投入 | 評価ランク、等級、処置 |

### Phase 2: 評価シート機能
| # | タスク | 成果物 |
|---|--------|--------|
| 2-1 | 評価シート画面（UI） | 目標入力フォーム、評価入力フォーム |
| 2-2 | 目標CRUD | 追加・編集・削除・並び替え |
| 2-3 | ウェイトバリデーション | 合計100%チェック、上限40%チェック |
| 2-4 | 自己評価入力 | 振り返り、評価ランク選択 |
| 2-5 | 上長評価入力 | コメント、評価ランク、Mgr判断 |
| 2-6 | トータル評価 | 平均点自動計算、HR判断 |
| 2-7 | ワークフロー制御 | フェーズ別の入力可否、表示制御 |
| 2-8 | 閲覧権限制御 | 権限別の項目表示/非表示 |

### Phase 3: 管理機能
| # | タスク | 成果物 |
|---|--------|--------|
| 3-1 | マイページ（従業員） | 自分のシート一覧 |
| 3-2 | 部下一覧（管理職） | 管理対象従業員一覧、ステータス表示 |
| 3-3 | 全従業員一覧（HR） | 検索・フィルタ |
| 3-4 | 評価期間管理（HR） | 期間作成、フェーズ切替 |
| 3-5 | 組織インポート（HR） | CSVインポート |
| 3-6 | 追加閲覧者設定（HR） | 従業員ごとの閲覧者追加 |

### Phase 4: テスト・調整
| # | タスク | 成果物 |
|---|--------|--------|
| 4-1 | E2Eテスト | 主要フローの動作確認 |
| 4-2 | レスポンシブ対応 | モバイル表示調整 |
| 4-3 | エラーハンドリング | バリデーション、エラー表示 |
| 4-4 | デモデータ作成 | モックアップ用サンプルデータ |

---

## 10. モックアップで省略する機能

| 機能 | 備考 |
|------|------|
| 通知機能 | メール/Slack通知 |
| レポート・集計機能 | 部署別評価分布など |
| 過去データ参照 | 過去半期の閲覧 |
| CSVエクスポート | 評価データ出力 |
| SmartHR API連携 | CSVインポートで代替 |

---

## 改訂履歴

| 日付 | バージョン | 内容 |
|------|------------|------|
| 2026-02-04 | 1.0 | 初版作成 |
