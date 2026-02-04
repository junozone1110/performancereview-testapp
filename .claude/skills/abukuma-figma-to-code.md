---
name: abukuma-figma-to-code
description: >
  FigmaデザインをAbukumaコンポーネントを使って実装する。
  FigmaのURLやデザイン指定がある場合に発動。
  「このデザインを実装して」「Figmaの通りに作って」「デザインをコードに」などで使用。
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - mcp__figma__*
  - mcp__giftee_abukuma_mcp__list_react_components
  - mcp__giftee_abukuma_mcp__get_react_component
  - mcp__giftee_abukuma_mcp__list_css_utilities
  - mcp__giftee_abukuma_mcp__list_design_tokens
---

# Abukuma Figma to Code Skill

ギフティのデザインシステム「Abukuma」で作成されたFigmaデザインをAbukumaコンポーネントで実装するSkillです。

## ワークフロー

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Figmaデザインの取得・分析                             │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Abukumaコンポーネントのマッピング                      │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: デザイントークンの確認                                │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: 実装                                                 │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Figmaデザインの取得・分析

Figma MCPを使用してデザイン情報を取得します。

```
// Figmaファイルの情報を取得
mcp__figma__get_file({ file_key: "xxxxx" })

// 特定のノードを取得
mcp__figma__get_node({ file_key: "xxxxx", node_id: "xxxxx" })
```

### デザインから読み取る情報

- レイアウト構造（Flex/Grid）
- 使用されている色
- スペーシング（padding, margin, gap）
- タイポグラフィ（サイズ、太さ）
- コンポーネントの種類

## Step 2: Abukumaコンポーネントのマッピング

Figmaのデザイン要素をAbukumaコンポーネントにマッピングします。

```
mcp__giftee_abukuma_mcp__list_react_components
```

### マッピング例

| Figmaデザイン | Abukumaコンポーネント |
|--------------|---------------------|
| ボタン | `Button` |
| 入力フィールド | `TextField` |
| ドロップダウン | `Select` |
| モーダル | `Modal` |
| テーブル | `Table` |
| カード | `Card` |
| アラート | `Alert` |

## Step 3: デザイントークンの確認

Figmaで使用されている色・スペーシングをAbukumaトークンにマッピングします。

```
mcp__giftee_abukuma_mcp__list_design_tokens
```

### 色のマッピング

| Figmaの色 | Abukumaクラス |
|----------|--------------|
| プライマリテキスト | `ab-text-default` |
| セカンダリテキスト | `ab-text-secondary` |
| ブランドカラー | `ab-text-brand` |
| 背景（ベース） | `ab-bg-base` |
| 背景（プライマリ） | `ab-bg-rest-primary` |

### スペーシングのマッピング

| Figma値 | Abukumaクラス |
|--------|--------------|
| 4px | `ab-gap-1`, `ab-p-1`, `ab-m-1` |
| 8px | `ab-gap-2`, `ab-p-2`, `ab-m-2` |
| 12px | `ab-gap-4`, `ab-p-4`, `ab-m-4` |
| 16px | `ab-gap-6`, `ab-p-6`, `ab-m-6` |
| 20px | `ab-gap-8`, `ab-p-8`, `ab-m-8` |
| 24px | `ab-gap-10`, `ab-p-10`, `ab-m-10` |

## Step 4: 実装

### レイアウトの実装

```tsx
// Figma: Auto Layout (horizontal, gap: 16px, padding: 24px)
<div className="ab-flex ab-gap-6 ab-p-10">
  {/* children */}
</div>

// Figma: Auto Layout (vertical, gap: 8px)
<div className="ab-flex ab-flex-column ab-gap-2">
  {/* children */}
</div>

// Figma: Grid (3 columns)
<div className="ab-grid ab-grid-cols-3 ab-gap-4">
  {/* children */}
</div>
```

### コンポーネントの実装

```tsx
import { Button, TextField, Card } from '@giftee/abukuma-react';

// Figmaのボタンデザイン → Abukuma Button
<Button variant="primary" size="medium">
  保存
</Button>

// Figmaの入力フィールド → Abukuma TextField
<TextField
  label="名前"
  placeholder="山田太郎"
  required
/>

// Figmaのカード → Abukuma Card
<Card>
  <div className="ab-p-6">
    {/* card content */}
  </div>
</Card>
```

## 実装のポイント

### 1. 完全一致を目指さない

Figmaデザインを100%再現するよりも、Abukumaコンポーネントの標準的な見た目を優先します。
これにより：
- 一貫性のあるUI
- メンテナンス性の向上
- アクセシビリティの担保

### 2. カスタムスタイルは最小限に

```tsx
// 避けるべき: 細かいピクセル調整
<div style={{ padding: '13px', marginTop: '7px' }}>

// 推奨: Abukumaのトークンに丸める
<div className="ab-p-4 ab-mt-2">
```

### 3. レスポンシブ対応

```tsx
// Abukumaのグリッドシステムを活用
<div className="ab-col-12 ab-col-md-6 ab-col-lg-4">
  {/* responsive content */}
</div>
```

## 注意事項

- Figma MCP が利用できない場合は、スクリーンショットやデザイン説明から実装
- デザインとAbukumaコンポーネントに差異がある場合は、Abukumaを優先しユーザーに報告
- 新しいコンポーネントが必要な場合は、まずAbukumaに存在しないか確認
