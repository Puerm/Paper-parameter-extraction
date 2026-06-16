---
name: tooling-decision-workflow
description: Use when deciding whether to introduce, keep, replace, or reject a CLI, script, plugin, library, service, or external tool.
version: "0.1.0"
tags: ["workflow", "tooling", "cli", "decision"]
---

# 工具选型决策流程

## 适用场景

- 想新增团队共享工具。
- 想把重复步骤脚本化。
- 想引入外部 CLI、插件或服务。
- 现有流程靠口头说明，容易反复出错。

## 决策步骤

1. 描述要解决的问题和重复频率。
2. 检查现有 CLI、仓库脚本和框架命令。
3. 比较 CLI、脚本、插件和人工流程。
4. 评估权限、维护成本、失败模式和跨平台兼容性。
5. 记录安装、使用、验证和回滚方式。
6. 小范围试点后再写入 README 或模板。

## 输出格式

```markdown
## Problem

## Existing Options

## Decision

## Permission Boundary

## Failure Modes

## Maintenance Cost

## Rollout Plan
```
