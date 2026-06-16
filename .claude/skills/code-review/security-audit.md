---
title: "安全审计"
description: "审查 Web、API、数据库和配置代码中的常见安全风险"
version: "0.1.0"
tags: ["security", "audit", "backend", "frontend", "code-review"]
---

# 安全审计

## 何时使用

- 用户要求安全审计、安全 review、漏洞排查或敏感数据检查。
- 变更涉及认证、授权、用户输入、文件上传、富文本、支付、密钥、部署配置或外部回调。
- 发布前需要确认高风险攻击面。

## 何时不用

- 普通代码风格或可维护性 review；使用对应 code-review skill。
- 只有理论架构讨论且没有代码、配置或接口输入。
- 依赖漏洞扫描需要实时数据库或外部工具时，先说明需要的工具和权限。

## 输入

- 待审查代码、配置、环境变量使用方式、接口定义或部署脚本。
- 项目 `CLAUDE.md` 中关于鉴权、权限、数据分级和部署环境的约定。

## 第一步

先定位入口和信任边界：用户可控输入、认证来源、权限判断点、敏感数据流和外部系统回调。

## 审计重点

1. 身份认证：登录态、token、session、刷新机制和失效策略。（规范：`rules/backend/money-time-and-identity.mdc`）
2. 授权边界：用户是否只能访问自己有权限的资源。
3. 输入校验：请求参数、文件上传、富文本、URL 和外部回调。（规范：`rules/backend/input-normalization-security.mdc`）
4. 注入风险：SQL、NoSQL、命令执行、模板注入和路径穿越。（规范：`rules/backend/input-normalization-security.mdc`）
5. 前端安全：XSS、防 CSRF、敏感信息暴露和不安全跳转。（规范：`rules/backend/input-normalization-security.mdc`）
6. 密钥管理：禁止硬编码密钥、token、密码和生产地址。（规范：`rules/universal/secrets-and-production.mdc`）
7. 日志与错误：日志不记录敏感数据，错误响应不暴露内部实现。（规范：`rules/universal/error-handling.mdc`）
8. 依赖与配置：CORS、Cookie、TLS、权限策略和第三方包风险。（规范：`rules/universal/secrets-and-production.mdc`）
9. 存储型内容：评论、弹幕、昵称、简介、富文本等用户内容是否会被原样存储并渲染。（规范：`rules/backend/input-normalization-security.mdc`）
10. Unicode 绕过：敏感词、用户名、标签和风控字段是否做 NFKC、大小写和零宽字符处理。（规范：`rules/backend/input-normalization-security.mdc`）
11. 密码与 token：密码哈希、token 类型隔离、有效期和刷新策略是否正确。（规范：`rules/backend/money-time-and-identity.mdc`）

## 审计流程

1. 先定位入口：路由、Controller、任务队列、Webhook、文件处理和管理员功能。
2. 跟踪敏感数据：身份标识、权限字段、支付信息、个人信息和密钥。
3. 标记可被用户控制的输入，检查是否经过验证、编码或参数化。
4. 将问题按严重性排序，优先报告可利用、影响大的风险。
5. 对内容安全场景，追踪“输入 -> 存储 -> 读取 -> 广播/渲染”完整路径。

## 输出格式

```markdown
## 高风险

- [文件:行号] 问题描述
  攻击路径：说明攻击者如何触发。
  影响：说明数据、权限或服务风险。
  修复：给出具体修复建议。

## 中低风险

- [文件:行号] 问题描述和建议。

## 安全假设

- 列出审计中依赖但未能从代码确认的假设。
```

## 质量门槛

- 不把理论可能性包装成确定漏洞。
- 对高风险问题必须写清楚攻击路径。
- 对无法确认的问题写成假设或待验证项。
- 对 XSS、注入、权限绕过和资金风险，必须给出最小复现载荷或触发路径。
- 没有发现高风险问题时，明确说明审计范围和未覆盖范围。
