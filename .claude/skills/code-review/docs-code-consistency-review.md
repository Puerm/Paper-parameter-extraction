---
title: "文档与代码一致性审查"
description: "检查 SPEC、README、ADR、任务计划和代码实现是否一致"
version: "0.1.0"
tags: ["code-review", "docs", "spec", "traceability"]
---

# 文档与代码一致性审查

## 适用场景

- 需求、接口、部署或配置文档更新后。
- 代码实现完成但需要确认是否覆盖 SPEC。
- README、ADR、数据契约或任务计划长期未更新。

## 审查步骤

规范来源：`rules/universal/docs-as-code.mdc`、`rules/universal/spec-plan-traceability.mdc`

1. 读取相关 SPEC、README、ADR、任务计划和数据契约。
2. 找到对应代码、测试、脚本和配置。
3. 对比行为、命令、路径、环境变量、接口字段和错误码。
4. 标记文档过期、实现缺失、命令不可运行或未验证的地方。
5. 给出修文档、修代码、补测试或归档的建议。

## 必查项

- 文档中的命令是否仍然存在且路径正确。
- 文档中的端口、环境变量和启动方式是否与代码一致。
- SPEC 验收标准是否有测试或人工验证证据。
- ADR 的决策是否仍被实现遵守。
- README 是否描述了当前真实启动、构建和部署方式。

## 输出格式

```markdown
## Findings

- [P1/P2/P3][文档或代码位置] 不一致描述
  证据：
  影响：
  建议：

## Traceability

| 文档条目 | 代码/测试位置 | 状态 |
|---|---|---|

## Summary
```
