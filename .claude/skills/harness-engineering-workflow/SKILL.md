---
name: harness-engineering-workflow
description: Use for Team Vibe's PLAN/CODE/REVIEW/VERIFY delivery pipeline, especially when coordinating implementation, review, and evidence collection.
version: "0.1.0"
tags: ["harness", "engineering", "workflow", "review", "verify"]
---

# Harness Engineering 工程流水线

## 核心理念

把 AI 编码视为工程流水线，而不是一次性代码生成。编码 Agent 负责构建，独立 Evaluator 负责审查，验证阶段负责确认行为。

```text
PLAN -> CODE -> REVIEW -> VERIFY
```

## 何时使用

- 复杂功能、跨模块改造、从 SPEC 到实现再到验收的完整交付。
- 高风险模块，例如权限、资金、安全、数据一致性、发布流程。
- 用户要求用 Harness Engineering、PLAN/CODE/REVIEW/VERIFY 或多阶段工程流水线。

## 何时不用

- 小修复、单文件修改、单次 code review 或单个生成任务。
- 已经只需要某个具体 skill，例如 `test-driven-development`、`security-audit` 或 `verification-before-completion`。
- 没有 SPEC 或验收标准时，不直接进入 CODE；先调用或参考 `workflows/spec-driven-development`。

## 第一步

先确认输入是否足够进入 PLAN：需求来源、验收标准、影响范围、风险等级和验证方式。若缺少 SPEC 或验收标准，先补计划，不写业务代码。

## PLAN

输入：

- `SPEC.md`
- 子模块 specs
- 数据契约
- 验收用例
- 架构决策

产出：

- 模块边界。
- 接口约定。
- 错误码体系。
- 依赖顺序。
- 验证计划。

门禁：

- 没有 SPEC，不进入 CODE。
- 没有验收标准，不进入 CODE。
- 高风险模块没有权限、安全、审计和回滚设计，不进入 CODE。

## CODE

要求：

- 按模块依赖顺序实现。
- 每次变更聚焦一个模块或一条主链路。
- 复用已沉淀 Skill 中的项目模式。
- 发现可复用模式或重复问题时，再更新项目 Skill、Rule 或项目 `CLAUDE.md`。

门禁：

- 不允许越界修改。
- 不允许引入未讨论的新架构。
- 不允许跳过关键异常和边界条件。

## REVIEW

要求：

- 编码和审查必须是不同视角。
- 高风险变更使用多角色审查。
- 审查者可以追踪 diff 之外的调用方、测试和配置。
- 每条 SPEC 需求要映射到实现状态。

推荐调用：

```text
@skill dispatching-parallel-agents
@skill requirements-traceability-review
@skill backend-integration-review
```

## VERIFY

要求：

- 运行测试、类型检查、lint、构建或端到端验证。
- 对关键用户路径做运行时验证。
- 生成验证证据和风险登记。
- 用交付就绪评估判断最终状态。

推荐调用：

```text
@skill verification-before-completion
```

## 反馈闭环

```text
Review 发现问题
  -> 修复
  -> Verify
  -> 必要时更新 Skill/Rule
  -> 后续 CODE 阶段提前预防
```

## 质量门槛

- 同一 Agent 的自我审查不能作为高风险变更的唯一 Review。
- 只有实现代码，没有验证证据，不可交付。
- 重复出现的问题应沉淀到 Skill/Rule；一次性项目细节不要强行沉淀为团队规则。
