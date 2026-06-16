---
name: requirements-traceability-review
description: Use when tracing SPEC, OpenSpec changes, acceptance criteria, or task plans to implementation, tests, and verification evidence.
version: "0.1.0"
tags: ["requirements", "spec", "traceability", "code-review"]
---

# 需求追溯审查

## 适用场景

- 有 SPEC、PRD、task plan、OpenSpec change 或验收用例的变更。
- 需要判断"代码是否真的满足需求"。
- 大型 PR、POC 验收、发布前审查。

## 何时不用

- 没有可引用需求、验收标准或任务计划。
- 用户只要求一般代码质量审查。
- 变更是纯格式、注释或非行为性文档调整。

## 输入

- SPEC / task plan / POC eval cases。
- 代码 diff 或实现文件。
- 测试文件和验证报告。
- 项目 `CLAUDE.md` 中的边界和禁止事项。

## 第一步

先把需求拆成可引用条目。没有 ID 时，使用稳定标题或临时编号，避免用模糊描述做追溯。

规范来源：`rules/universal/spec-plan-traceability.mdc`

## 审查步骤

1. 提取需求条目：每条需求要有 ID 或可引用标题。
2. 找到实现位置：文件、函数、路由、组件、测试或配置。
3. 判断覆盖状态。
4. 标记缺失测试、损坏路径和超范围实现。
5. 输出需求覆盖表和阻塞项。

## 覆盖状态

| 状态 | 含义 |
|------|------|
| Satisfied | 完整实现并有验证证据 |
| Partially Satisfied | 部分实现或验证不足 |
| Broken | 实现存在但行为与需求冲突 |
| Missing | 未实现 |
| Out of Scope | 不属于当前阶段 |

## 输出格式

```markdown
## Requirements Coverage

| Requirement | Status | Implementation | Evidence | Notes |
|-------------|--------|----------------|----------|-------|
| REQ-001 | Satisfied | src/... | tests/... | |

## Blocking Gaps

- [REQ-...] 问题、影响、修复建议。

## Out-of-Scope Changes

- 说明哪些实现超出当前需求范围。

## Verification Gaps

- 说明哪些需求缺少测试或运行证据。
```

## 质量门槛

- 没有映射到 SPEC 的新增行为，要标为 out-of-scope 或待确认。
- 缺少验证证据的需求不能标为 Satisfied。
- 发现需求和实现冲突时，优先标为 Broken，而不是建议优化。
