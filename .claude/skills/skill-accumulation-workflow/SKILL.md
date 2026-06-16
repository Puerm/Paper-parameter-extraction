---
name: skill-accumulation-workflow
description: Use when turning repeated lessons, retrospectives, incidents, or team conventions into rules, skills, templates, or documentation.
version: "0.1.0"
tags: ["skill", "knowledge", "workflow", "continuous-improvement"]
---

# Skill 积累流程

## 目标

让有复用价值的开发、审查和事故复盘经验反哺团队知识库，避免 Claude Code 在后续模块重复犯同样的错误。

## 何时沉淀

- 模块实现完成后发现可复用模式或反模式。
- Code Review 发现重复问题后。
- 线上故障复盘后。
- 引入新技术、新框架或新工具前。
- 跨模块出现不一致实现模式时。

## 何时不沉淀

- 只属于一次性项目背景、临时决策或个人偏好的内容。
- 尚未验证有效的猜测。
- 已经由现有 rule、skill、template 或 `CLAUDE.md` 清楚覆盖的内容。

## 第一步

先判断信息类型和复用范围：是强制规则、操作流程、审查方法、项目认知还是模板。不能确定复用范围时，先放入项目文档或复盘记录，不直接升级为团队 rule。

## 知识分类

| 类型 | 放置位置 | 示例 |
|------|----------|------|
| 强制规则 | `rules/` | 命名、错误处理、事务、完成声明 |
| 工作流程 | `skills/workflows/` | SPEC 驱动、交付评估、重构流程 |
| 审查方法 | `skills/code-review/` | 安全审计、多角色审查、后端集成审查 |
| 项目认知 | 项目 `CLAUDE.md` | 架构、技术栈、业务边界、常用命令 |
| 模板 | `templates/` | SPEC、任务计划、风险登记、ADR |

## 沉淀步骤

1. 提取可复用模式：做对了什么、为什么有效、适用边界是什么。
2. 提取反模式：哪里出错、触发条件、如何预防。
3. 判断资产类型：rule、skill、template 或 `CLAUDE.md`。
4. 写成可执行指令，不写成泛泛经验。
5. 增加来源和验证依据。
6. 提交时说明来源、影响范围和更新理由。

## Skill 内容要求

- 触发场景清楚。
- 输入和输出清楚。
- 步骤可执行。
- 质量门槛明确。
- 包含常见失败模式。
- 说明何时不要使用。
- 不依赖某个开发者的个人记忆。

## 输出格式

```markdown
## 沉淀对象

- 类型：rule / skill / template / CLAUDE.md
- 位置：
- 来源：

## 复用价值

## 适用边界

## 验证依据

## 不沉淀内容
```

## 闭环机制

```text
Review 发现问题
  -> 提炼反模式
  -> 更新 Rule 或 Skill
  -> 后续编码前自动参考
  -> Review 验证是否复发
```

## 禁止事项

- 禁止把一次性项目细节写成全团队强制规则。
- 禁止只记录"结果"，不记录"为什么"。
- 禁止沉淀无法执行、无法检查的口号。

## 质量门槛

- 每次沉淀都能说明来源、复用范围和验证依据。
- 沉淀内容能被后续 Claude Code 直接执行或检查。
- 已确认没有和现有 rule、skill、template 或 `CLAUDE.md` 重复。
