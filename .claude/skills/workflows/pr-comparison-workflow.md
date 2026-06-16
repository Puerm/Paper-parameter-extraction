---
title: "PR 方案对比流程"
description: "对多个候选实现进行 diff、风险、测试成本和回滚路径比较"
version: "0.1.0"
tags: ["workflow", "pr", "architecture", "comparison"]
---

# PR 方案对比流程

## 适用场景

- 技术分歧超过口头讨论收益。
- 需要比较不同架构、API、UI 或重构路线。
- 方案影响调用方、数据或部署。

## 流程

1. 固定共同目标和非目标。
2. 让候选方案分别说明改动范围和验证方式。
3. 对比真实 diff、调用方影响、测试成本和回滚路径。
4. 用 `architecture-tradeoff-review` 审查取舍。
5. 输出推荐方案、拒绝其他方案的原因和需人工确认的问题。

## 输出格式

```markdown
## Goal

## Candidates

| 方案 | 改动范围 | 优点 | 风险 | 验证成本 | 回滚 |
|---|---|---|---|---|---|

## Findings

## Recommendation

## Decision Log
```

## 禁止事项

- 不让“谁最后提交”决定方案。
- 不用抽象口号替代真实 diff 和验证证据。
