# 项目上下文

## 项目概览

- 项目名称：`ai-paper-experiment-param-extraction`
- 项目类型：`fullstack`
- 主要业务：AI 辅助的论文实验参数提取平台，支持 PDF/DOCX/Markdown 论文上传 → 自动解析 → AI 参数提取 → 人工审核 → 结构化入库，附带版本管理、参数库查询、AI 自然语言问答、Dashboard、通知中心、审计日志和 RBAC 权限系统
- 代码负责人：`<team-or-owner>`

## 技术栈

- 语言：TypeScript (前端 + 后端)
- 框架：React 18+ (前端) / Node.js + Express (后端)
- 包管理：npm
- 数据库：PostgreSQL + Prisma ORM
- 文件解析：pdf-parse + mammoth + remark
- AI 集成：Anthropic API (Claude)
- 文件存储：本地文件系统（预留 S3 接口）
- 前端 UI：Tailwind CSS + shadcn/ui
- 图表：ECharts / Recharts
- 认证：JWT
- 测试：`<test-framework>`（待定）
- 部署：`<deployment-target>`（待定）

## 常用命令

```bash
# 安装依赖
npm install

# 本地开发 — 前端
cd frontend && npm run dev

# 本地开发 — 后端
cd backend && npm run dev

# 测试
npm test

# 类型检查 / 编译
npm run build

# Lint / 格式化
npm run lint
```

## 命令分区

- `[LOCAL]`：运行在开发机，用于编辑、测试、构建、本地调试和查看 diff。
- `[REMOTE-READONLY]`：运行在服务器，仅允许查看状态、日志、磁盘、端口、进程和配置完整性。
- `[REMOTE-MUTATING]`：会改变服务器状态，例如 restart、reload、migrate、写配置、删文件，必须由用户明确授权。
- `[CI]`：运行在流水线，以 CI 配置和日志为准。

## 目录结构

```text
<project-root>/
├── frontend/                # React + TypeScript + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── components/      # 可复用 UI 组件
│   │   ├── pages/           # 页面组件（Dashboard、论文管理、模板管理、审核、参数库等）
│   │   ├── hooks/           # 自定义 hooks
│   │   ├── api/             # API 调用封装
│   │   ├── types/           # TypeScript 类型定义
│   │   └── utils/           # 工具函数
│   └── public/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑（AI 提取、解析等）
│   │   ├── middleware/       # 中间件（RBAC、审计日志、错误处理）
│   │   ├── models/          # Prisma 生成的类型（不手动编辑）
│   │   ├── utils/           # 工具函数（JSON 校验、diff 算法等）
│   │   └── config/          # 环境配置
│   └── prisma/
│       └── schema.prisma    # 数据库 schema
├── docs/                    # 项目文档
│   ├── diagnosis-report.md
│   ├── exec-plan.md
│   ├── change-proposal.md
│   └── 测试.md
├── openspec/                # OpenSpec 规范与变更管理
│   └── changes/
│       └── paper-experiment-param-extraction/
│           ├── proposal.md
│           ├── design.md
│           ├── tasks.md
│           └── specs/       # 各模块 spec
├── templates/               # 规划文档模板（待创建）
└── uploads/                 # 上传论文文件存储（本地）
```

## 业务架构

### 核心模块

| 模块 | 说明 | Spec |
| ------ | ------ | ------ |
| 论文上传 (paper-upload) | PDF/DOCX/Markdown 上传、解析、元数据提取、状态机 | `specs/paper-upload/spec.md` |
| 论文管理 (paper-management) | 列表、搜索、筛选、排序 | `specs/paper-management/spec.md` |
| 参数模板 (template-management) | CRUD、克隆、YAML 定义、引用保护 | `specs/template-management/spec.md` |
| AI 参数提取 (ai-parameter-extraction) | LLM 调用、JSON 校验、自动重试 (最多3次) | `specs/ai-parameter-extraction/spec.md` |
| 参数审核 (parameter-review) | 原文对照、修改/删除/新增、乐观锁并发控制 | `specs/parameter-review/spec.md` |
| 版本历史 (version-history) | 每次修改保存版本、JSON diff 对比 | `specs/version-history/spec.md` |
| 参数库 (parameter-library) | 搜索、标签、导出 Excel/CSV、归档 | `specs/parameter-library/spec.md` |
| AI 问答 (ai-qa) | 自然语言→数据库查询 | `specs/ai-qa/spec.md` |
| Dashboard | 统计面板 + 趋势图表 | `specs/dashboard/spec.md` |
| 通知中心 (notification-center) | 事件驱动通知、未读计数 | `specs/notification-center/spec.md` |
| 审计日志 (audit-log) | 操作记录（谁/何时/改了什么） | `specs/audit-log/spec.md` |
| RBAC | 三级角色权限（普通用户/审核员/管理员） | `specs/rbac/spec.md` |

### 状态机

**论文状态：**

```text
待解析 → 解析中 → 解析成功 → 参数提取中 → 待审核 → 已入库
               ↘ 解析失败（可重试）
```

**参数状态：**

```text
AI已提取 → 审核中 → 审核通过（入库）→ 已归档
                ↘ 审核拒绝 → 重新提取
```

### 数据库核心表

```text
papers              — 论文（文件名、路径、作者、DOI、状态、上传者）
templates           — 参数模板（名称、YAML 定义、创建者）
parameters          — 提取的参数（论文ID、模板ID、JSON 值、状态、version）
parameter_versions  — 参数版本历史（参数ID、版本号、JSON 值、修改者）
users               — 用户（用户名、密码哈希、角色）
notifications       — 通知（用户ID、类型、消息、已读状态）
audit_logs          — 审计日志（用户ID、操作、目标类型、目标ID、变更内容）
```

### RBAC 权限模型

| 权限 | 普通用户 | 审核员 | 管理员 |
| ------ | :---: | :---: | :---: |
| 上传论文 | ✓ | ✓ | ✓ |
| 查看自己的论文 | ✓ | ✓ | ✓ |
| 查看所有论文 | | ✓ | ✓ |
| 管理模板 | | | ✓ |
| 审核参数 | | ✓ | ✓ |
| 导出数据 | ✓ | ✓ | ✓ |
| 管理用户 | | | ✓ |

## 核心约定

- 参数审核采用乐观锁（version 字段），更新时检查版本号，版本不匹配时拒绝并提示用户刷新
- AI 提取的 JSON 必须经过校验：合法 JSON + 字段匹配模板，非法时自动重试最多3次
- 被引用的模板不允许删除（引用保护）
- 已入库的参数禁止直接删除，只能归档
- 上传同名文件自动重命名：paper.pdf → paper(1).pdf → paper(2).pdf
- 大文件 PDF 解析采用异步队列，前端轮询状态
- 初期仅支持中文，不做 i18n
- 初期使用用户名密码登录，不支持第三方 SSO
- 不实现论文全文搜索引擎（仅元数据+参数搜索）
- 不实现实时协同编辑（仅冲突提示）

## Claude Code 协作约定

- 从 `.claude/skills/INDEX.md` 开始按任务加载 skill；不要默认加载全部 skills。
- 从 `.claude/rules/index.md` 开始按任务加载 Team Vibe rules；不要默认加载全部 rules。
- Team Vibe 渐进式披露入口写在本文件、`.claude/skills/INDEX.md` 和 `.claude/rules/index.md` 中。
- 非平凡修改前说明目标、关键假设、影响范围和验证方式。
- 轻微歧义可说明假设后继续；影响行为、数据、安全、兼容性或用户体验的歧义先确认。
- 默认使用满足需求的最小实现，只修改当前任务所需范围。
- 故障、部署异常、权限问题先诊断，不急着改文件。
- 复杂或跨模块任务先使用计划优先流程，确认边界后再实现。

## Skill Loading

- 普通开发任务优先从 `@skill using-superpowers` 开始。
- 调试任务使用 `@skill systematic-debugging`。
- 计划和执行分别使用 `@skill writing-plans` 与 `@skill executing-plans`。
- 交付前使用 `@skill verification-before-completion`。
- UI、网页测试、PPT、代码图谱分别按需使用 `@skill ui-ux-pro-max`、`@skill webapp-testing`、`@skill pptx`、`@skill graphify`。
- Team Vibe 专用审查和工作流按 `.claude/skills/INDEX.md` 选择。

## Rule Loading

- 开始任务时先读取 `.claude/rules/index.md`。
- Always Load 规则应作为默认团队约束加载。
- 其他 frontend、backend、security、git、docs 规则只在任务匹配时加载。
- 不要一次性读取 `.claude/rules/` 下的所有规则文件。

## 调试服务规则

- 启动 dev server 前先检查端口和已有进程。
- 如果服务已运行，优先复用，不重复启动。
- 如需重启，先说明原因并停止旧进程。
- 禁止为同一个问题启动多个前端、后端或 worker 实例。

## 禁止事项

- 禁止跳过 AI 提取结果的人工审核环节直接入库
- 禁止删除被论文引用的参数模板
- 禁止直接删除已入库的参数（只能归档）
- 禁止提交真实 `.env`、API Key、Token、私钥、数据库密码或生产账号
- 禁止未经确认执行删除文件、重置历史、数据库迁移或生产服务重启

## 完成定义

- 产物存在不等于完成。
- 完成声明必须绑定实际验证证据。
- 无法验证时说明原因、替代检查和剩余风险。
- 只有在执行 `verification-before-completion` 并通过门禁后，才声明 `Delivery Ready`。

## 规划文档

以下文档可从 `templates/` 复制模板创建。列出的是已有模板，模板路径映射到推荐的项目路径：

| 模板 | 推荐存放位置 |
|------|-------------|
| `templates/planning-docs/diagnosis-report.md.template` | `docs/diagnosis-report.md` |
| `templates/planning-docs/exec-plan.md.template` | `docs/exec-plan.md` |
| `templates/planning-docs/change-proposal.md.template` | `docs/change-proposal.md` |
| `templates/planning-docs/alternative-evaluation.md.template` | `docs/alternative-evaluation.md` |
| `templates/planning-docs/tooling-decision.md.template` | `docs/tooling-decision.md` |
| `templates/deployment/deploy-plan.md.template` | `docs/deploy-plan.md` |
| `templates/design/DESIGN.md.template` | `DESIGN.md` |

> 更多模板（如 SPEC、task-plan、ADR、data-schema 等）随团队实践持续沉淀。
> 注意：`templates/` 目录尚未创建，模板文件待从 Team Vibe 仓库同步。

## AI 协作方式

- 修改代码前先阅读相关模块和相邻测试。
- 优先遵守项目已有模式，不主动引入新框架或大抽象。
- 涉及公共 API、数据库结构、权限或部署流程时，先说明影响范围。
- 完成修改后运行上述验证命令；无法运行时说明原因和替代验证方式。

## 最终报告格式

- 变更摘要：
- 修改文件：
- 验证命令与结果：
- 未运行检查及原因：
- 风险与回滚：
- 所用 Skills / Rules：

## 团队共享 Skills

按任务选择对应 skill，不要默认全部触发。

### Code Review

- 通用风险审查：`@skill requesting-code-review`
- 文档与代码一致性审查：`@skill docs-code-consistency-review`
- 架构取舍审查：`@skill architecture-tradeoff-review`
- 视觉与交互审查：`@skill ui-ux-pro-max`

### Workflows

- 诊断优先：`@skill systematic-debugging`
- 计划优先：`@skill writing-plans`
- 长任务执行：`@skill executing-plans`
- 双系统环境审查：`@skill dual-system-audit`
- PR 方案对比：`@skill pr-comparison-workflow`
- 前端设计实现：`@skill ui-ux-pro-max`
- 工具选型决策：`@skill tooling-decision-workflow`

> 更多 skill（如 dispatching-parallel-agents、security-audit、api-design、refactor-workflow 等）随团队实践持续沉淀。新增 skill 后同步更新本列表。

## 项目当前状态

- **阶段**：设计完成，待初始化实现
- **OpenSpec 变更**：`openspec/changes/paper-experiment-param-extraction/` — 14 个任务组，共计 ~60 个子任务
- **设计文档**：`openspec/changes/paper-experiment-param-extraction/design.md` — 技术栈、状态机、RBAC、AI 工作流、并发策略已确定
- **任务拆解**：`openspec/changes/paper-experiment-param-extraction/tasks.md` — 从项目初始化到集成部署的完整拆解
- **下一步**：按 tasks.md 顺序执行 1. 项目初始化 → 2. 用户与权限系统
