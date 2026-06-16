---
name: backend-integration-review
description: Use when reviewing backend integration risks across transactions, concurrency, external services, data consistency, authorization, queues, or cross-module behavior.
version: "0.1.0"
tags: ["backend", "integration", "transaction", "code-review"]
---

# 后端集成审查

## 适用场景

- 后端 Service、Repository、Controller、任务队列、支付、结算、权限和风控变更。
- AI 按模块生成代码后，需要检查模块组合是否正确。
- 需要确认"定义了方法"是否真的接入入口、事务、测试和副作用链路。

## 何时不用

- 只审查 API 设计，不追踪后端内部链路；使用 `api-design`。
- 只做安全专项审计；使用 `security-audit`。
- 变更是纯文档、纯样式或无后端运行时行为。

## 第一步

从真实入口开始追踪：HTTP route、message handler、scheduled job、webhook 或 CLI。不要只看被修改的 service 文件。

## 审查重点

1. 事务与异常组合：写入后抛异常是否被 rollback 撤销。（规范：`rules/backend/transaction-consistency.mdc`）
2. 并发竞态：读后写流程是否有锁、幂等或唯一约束保护。（规范：`rules/backend/transaction-consistency.mdc`、`rules/backend/api-standards.mdc`）
3. 软删除语义：应用层判断是否与数据库唯一约束冲突。（规范：`rules/backend/transaction-consistency.mdc`、`rules/backend/database-standards.mdc`）
4. 资金与状态流转：余额、积分、库存、失败计数是否原子更新。（规范：`rules/backend/transaction-consistency.mdc`）
5. 业务管线接通：定义的 Service 方法是否真的被入口调用。
6. 跨模块一致性：相同业务模式是否在不同模块实现一致。
7. 测试覆盖：是否覆盖真实链路、重复请求、失败后重试。

## 典型反模式

- `flush()` 后抛业务异常，但上层统一 rollback，导致失败计数没有持久化。
- 软删除保留唯一索引记录，重新创建时触发 500。
- 充值、结算等资金流程未使用行锁或幂等键，导致重复入账。
- 某个模块定义了结算或通知 Service，但没有任何调用方。
- 安全过滤只做简单子串匹配，被大小写、全角和零宽字符绕过。

## 审查步骤

1. 从 HTTP 入口或消息入口开始追踪。
2. 找到所有数据库写入、事务边界和异常路径。
3. 对资金、权限、安全状态检查并发控制。
4. 搜索关键 Service 是否有真实调用方。
5. 对比同类模块是否已有正确实现模式。
6. 检查测试是否覆盖成功、失败、并发和重复操作。

## 输出格式

```markdown
## 集成阻塞项

- [文件:行号] 问题
  链路：入口 -> service -> repository -> side effect
  风险：线上会如何失败
  修复：建议方案

## 缺失测试

## 可复用正确模式
```

## 质量门槛

- 每个发现必须能说明完整链路。
- 对资金、权限和安全状态问题默认按高优先级处理。
- "模块内部正确"不能作为"系统正确"的证据。
