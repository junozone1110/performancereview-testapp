---
name: abukuma-frontend
description: >
  ギフティのデザインシステム(Abukuma)を使った包括的なフロントエンド実装。
  ページ作成、画面実装、フォーム構築、UI全般の開発時に使用。
  「画面を作って」「UIを実装して」「ページを追加して」「フォームを作って」などの依頼で発動。
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - Bash
  - mcp__giftee_abukuma_mcp__list_react_components
  - mcp__giftee_abukuma_mcp__get_react_component
  - mcp__giftee_abukuma_mcp__list_css_components
  - mcp__giftee_abukuma_mcp__get_css_component
  - mcp__giftee_abukuma_mcp__list_css_utilities
  - mcp__giftee_abukuma_mcp__get_css_utility
  - mcp__giftee_abukuma_mcp__list_design_tokens
  - mcp__context7__resolve-library-id
  - mcp__context7__query-docs
---

# Abukuma Frontend Skill

ギフティのデザインシステム「Abukuma」と最新のライブラリドキュメントを活用した包括的なフロントエンド開発を支援するSkillです。

## ワークフロー概要

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 要件理解 & 既存コード確認                              │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Abukumaコンポーネント調査                             │
│   - list_react_components で一覧取得                         │
│   - get_react_component で詳細取得                           │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: 最新ドキュメント参照（必要に応じて）                    │
│   - context7 で Next.js/React 等の最新情報取得                │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: 実装                                                 │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: 要件理解 & 既存コード確認

### 既存パターンの確認

```bash
# 既存のページ構造を確認
ls

# わからなければさらに確認
```

## Step 2: Abukumaコンポーネント調査

### コンポーネント一覧取得

```
mcp__giftee_abukuma_mcp__list_react_components
```

### 使用するコンポーネントの詳細取得

```
mcp__giftee_abukuma_mcp__get_react_component({ name: "ComponentName" })
```

### CSSユーティリティ確認

```
mcp__giftee_abukuma_mcp__list_css_utilities
mcp__giftee_abukuma_mcp__get_css_utility({ name: "spacing" })
```

### デザイントークン確認

```
mcp__giftee_abukuma_mcp__list_design_tokens
```

## Step 3: ドキュメント参照（バージョン指定）

### Next.js の情報が必要な場合

**重要**: package.json のバージョンを確認し、そのバージョンに合ったドキュメントを取得する。

```
// Step 3-0: package.json確認
Read: package.json
// → "next": "14.2.5" を確認

// Step 3-1: ライブラリID解決
mcp__context7__resolve-library-id({
  libraryName: "next.js",
  query: "App Router server components"
})

// Step 3-2: バージョン指定でドキュメント取得
mcp__context7__query-docs({
  libraryId: "/vercel/next.js/v14.2.5",  // ← package.jsonのバージョンを付与
  query: "App Router server components data fetching"
})
```

**バージョン記法の変換:**
- `"14.2.5"` → `/v14.2.5`
- `"^18.2.0"` → `/v18.2.0`
- `"~5.10.0"` → `/v5.10.0`

### その他よく参照するライブラリ

| ライブラリ | 用途 |
|-----------|------|
| next.js | App Router, Server Components |
| react | Hooks, State管理 |
| prisma | データベース操作 |
| better-auth | 認証 |

## Step 4: 実装

### ファイル構成（ページの場合）

```
app/(dashboard)/new-feature/
├── page.tsx           # メインページ（Server Component推奨）
├── _components/       # ページ固有コンポーネント
│   └── FeatureForm.tsx
└── actions.ts         # Server Actions
```

### コーディングルール

#### インポート順序

プロジェクトの linter 設定に従うこと。
既存ファイルのインポート順序を参考にする。

#### Server Component vs Client Component

```tsx
// Server Component（デフォルト）- データ取得に使用
// page.tsx
import { prisma } from '@/lib/prisma';

export default async function Page() {
  const data = await prisma.candidate.findMany();
  return <ClientComponent data={data} />;
}

// Client Component - インタラクションに使用
// _components/ClientComponent.tsx
'use client';

import { useState } from 'react';
import { Button } from '@giftee/abukuma-react';

export function ClientComponent({ data }) {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

#### スタイリング

Abukuma CSSユーティリティは `ab-` プレフィックスを使用する。

```tsx
// 1. Abukuma CSSユーティリティを優先（ab- プレフィックス）
<div className="ab-flex ab-gap-4 ab-p-4">
  <span className="ab-text-default ab-text-body-m">テキスト</span>
</div>

// 2. 足りない場合はstyle属性で補完
<div className="ab-flex ab-gap-4" style={{ minHeight: '200px' }}>

// 3. カスタムCSSは最終手段（極力避ける）
```

#### 主要なユーティリティクラス

| カテゴリ | クラス例 |
|---------|---------|
| Display | `ab-flex`, `ab-grid`, `ab-block`, `ab-none` |
| Flex方向 | `ab-flex-row`, `ab-flex-column` |
| Gap | `ab-gap-4`, `ab-gap-8`, `ab-gap-x-4`, `ab-gap-y-4` |
| Padding | `ab-p-4`, `ab-px-8`, `ab-py-4`, `ab-pt-4` |
| Margin | `ab-m-4`, `ab-mx-auto`, `ab-mb-8` |
| 配置 | `ab-items-center`, `ab-justify-between` |
| テキスト | `ab-text-default`, `ab-text-secondary`, `ab-text-body-m` |
| 背景 | `ab-bg-base`, `ab-bg-rest-primary` |
| Border | `ab-border`, `ab-rounded-md` |
| サイズ | `ab-w-full`, `ab-h-full`, `ab-col-6` |

## フォーム実装パターン

### Server Actions を使用

```tsx
// actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCandidate(formData: FormData) {
  const name = formData.get('name') as string;

  await prisma.candidate.create({
    data: { name }
  });

  revalidatePath('/candidates');
}

// _components/CandidateForm.tsx
'use client';

import { Button, TextField } from '@giftee/abukuma-react';
import { createCandidate } from '../actions';

export function CandidateForm() {
  return (
    <form action={createCandidate} className="ab-flex ab-flex-column ab-gap-4">
      <TextField name="name" label="名前" required />
      <Button type="submit" variant="primary">
        登録
      </Button>
    </form>
  );
}
```

## テーブル実装パターン

```tsx
import { Table } from '@giftee/abukuma-react';

const columns = [
  { key: 'name', header: '名前' },
  { key: 'email', header: 'メール' },
  { key: 'status', header: 'ステータス' },
];

<Table
  columns={columns}
  data={candidates}
  onRowClick={(row) => router.push(`/candidates/${row.id}`)}
/>
```

## 注意事項

- **Abukumaコンポーネントを最優先**で使用すること
- 独自実装する前に必ず `list_react_components` で既存コンポーネントを確認
- Next.js 16 の最新機能を使う場合は context7 で最新ドキュメントを参照
- Server Components をデフォルトとし、必要な箇所のみ 'use client' を使用
- CSSユーティリティは必ず `ab-` プレフィックスを付けること
