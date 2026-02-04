---
name: abukuma-frontend-component
description: >
  Abukumaコンポーネントの使い方を調べて実装する。
  「Buttonの使い方」「Modalを追加」「Tableコンポーネントを使って」など
  特定のUIコンポーネントに関する依頼で発動。
allowed-tools:
  - Read
  - Edit
  - Write
  - mcp__giftee_abukuma_mcp__list_react_components
  - mcp__giftee_abukuma_mcp__get_react_component
  - mcp__giftee_abukuma_mcp__list_css_components
  - mcp__giftee_abukuma_mcp__get_css_component
  - mcp__giftee_abukuma_mcp__list_css_utilities
  - mcp__giftee_abukuma_mcp__get_css_utility
  - mcp__giftee_abukuma_mcp__list_design_tokens
---

# Abukuma Component Skill

ギフティのデザインシステム「Abukuma」のコンポーネントを使った実装を支援するSkillです。

## ワークフロー

### Step 1: コンポーネント一覧の確認

まず `list_react_components` でAbukumaのReactコンポーネント一覧を取得します。

```
mcp__giftee_abukuma_mcp__list_react_components
```

### Step 2: コンポーネント詳細の取得

使用するコンポーネントが決まったら `get_react_component` で詳細情報を取得します。

```
mcp__giftee_abukuma_mcp__get_react_component({ name: "Button" })
```

取得できる情報:
- Props定義
- 使用例
- バリアント
- 注意事項

### Step 3: CSSユーティリティの確認（必要に応じて）

レイアウト調整が必要な場合は `list_css_utilities` でユーティリティクラスを確認します。

```
mcp__giftee_abukuma_mcp__list_css_utilities
```

### Step 4: 実装

取得した情報をもとにコンポーネントを実装します。

## 実装ルール

### インポート

```tsx
// Reactコンポーネント
import { Button, Modal, Table } from '@giftee/abukuma-react';

// CSSユーティリティ（グローバルCSSとして読み込み済み）
// classNameで直接使用
```

### スタイリングの優先順位

1. **Abukuma CSSユーティリティ** を最優先で使用
2. 足りない場合は **style属性** で補完
3. カスタムCSSは最終手段

### 例: Buttonコンポーネント

```tsx
import { Button } from '@giftee/abukuma-react';

// Primary Button
<Button variant="primary" size="medium">
  保存する
</Button>

// Secondary Button with icon
<Button variant="secondary" size="small" leftIcon={<IconPlus />}>
  追加
</Button>
```

## よく使うコンポーネント

| コンポーネント | 用途 |
|---------------|------|
| Button | ボタン操作 |
| Modal | モーダルダイアログ |
| Table | データ表示 |
| Form系 | 入力フォーム |
| Card | カード型レイアウト |
| Alert | 通知・警告 |

## 注意事項

- コンポーネントのPropsは必ず `get_react_component` で最新情報を確認すること
- デザイントークン（色、spacing等）は `list_design_tokens` で確認可能
- 独自スタイルを追加する前に、既存のユーティリティで実現できないか確認すること
