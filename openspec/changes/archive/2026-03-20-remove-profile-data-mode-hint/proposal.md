## Why

用户反馈互补画像卡片中的"（真实数据）"/"（演示数据）"提示文字是多余的 UI噪音，不符合产品设计原则——真实数据就应该是默认状态，无需特别标注。

## What Changes

- 删除 `src/app/demo/page.tsx` 第 851-853 行的 `<p className="text-sm text-gray-500">` 元素
- 该提示根据 `demoMode` 显示"（演示数据）"或"（真实数据）"，与用户操作无关，属于冗余信息

## Capabilities

### New Capabilities
<!-- 无新增能力，纯 UI 清理 -->

### Modified Capabilities
<!-- 无规格变更，纯移除 UI 元素 -->

## Impact

- 仅影响 `src/app/demo/page.tsx` 中的一个提示文本块
- 不涉及 API、数据库或业务逻辑变更
- 用户界面：个人互补画像卡片的头像区域更简洁
