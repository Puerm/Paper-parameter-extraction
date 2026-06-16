---
name: architecture-tradeoff-review
description: Use when comparing architecture options, refactor routes, module boundaries, tradeoffs, and long-term maintainability choices under Team Vibe conventions.
version: "0.1.0"
tags: ["code-review", "architecture", "tradeoff", "decision"]
---

# 架构取舍审查

## 适用场景

- 多个候选 PR 或实现方案需要比较。
- API 设计、重构路线、前端交互、数据模型存在分歧。
- 白板讨论无法说明真实调用方影响。

## 审查维度

| 维度 | 问题 |
|---|---|
| 范围 | 改动文件和模块是否最小 |
| 兼容性 | 是否影响公开 API、数据、权限或部署 |
| 可测试性 | 是否能用现有测试和少量新增测试验证 |
| 可维护性 | 是否符合现有模式，是否引入不必要抽象 |
| 回滚 | 出问题后能否 revert 或降级 |
| 认知成本 | 团队是否容易理解和继续维护 |

## 输出格式

```markdown
## Candidates

| 方案 | 核心思路 | 改动范围 | 风险 | 验证成本 |
|---|---|---|---|---|

## Findings

- [P1/P2/P3] 方案或共同风险

## Recommendation

- 推荐方案：
- 不选其他方案的原因：
- 需要人工确认的点：
- 验证命令：

## Summary

-
```

## 禁止事项

- 不用"更优雅""更现代"作为主要理由。
- 不让最后一个提交的方案天然胜出。
- 不忽略迁移、回滚和调用方影响。
