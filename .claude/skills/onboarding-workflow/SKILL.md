---
name: onboarding-workflow
description: Use when onboarding a project to Team Vibe Config, creating CLAUDE.md, selecting rules/templates, or setting up project conventions.
version: "0.2.0"
tags: ["onboarding", "workflow", "claude-code", "team-vibe-config", "project-check"]
---

# Team Vibe Config 接入检查 Skill

## 目标

确认 Team Vibe Config 被放到项目目录或接入项目后，是否真正形成了可用的 AI 开发辅助环境。
本 Skill 的职责不是默认初始化新项目，也不是机械复制所有模板，而是检查当前项目是否具备清晰的项目认知、编码规则、验证命令、共享 Skills、交付门禁和部署边界。缺什么就指出什么，需要补齐时才生成最小修复方案。

## 触发条件

当用户提出以下意图时使用本 Skill：

- "检查这个项目有没有正确接入 Team Vibe Config"。
- "这个配置包放进项目后能不能直接用？"。
- "检查 AGENTS.md / CLAUDE.md / skills 是否完整"。
- "帮我看项目缺哪些开发辅助配置"。
- "修复 Team Vibe Config 接入缺口"。
- "项目模板更新后，检查当前项目是否落后"。
如果用户只是要实现业务功能，不要顺手做 onboarding；先完成业务任务，必要时只提示项目缺少上下文。

## 检查模式

- `check-only`：只检查接入状态，输出缺口和建议，不写文件。
- `repair-minimal`：只补齐直接影响 Claude Code 使用的缺失项，例如 `AGENTS.md`、`CLAUDE.md` 或 `.claude/skills/`。
- `sync-templates`：根据当前 Team Vibe Config 模板检查项目文件是否过时，并给出合并建议。
- `bootstrap`：项目尚未接入时，按最小可用原则生成入口文件和必要目录。

用户没有明确要求写文件时，优先使用 `check-only`。

## 输入

尽量从用户请求、当前项目和 Team Vibe Config 目录中获得以下信息：

- 项目根目录和当前 Git 状态。
- Team Vibe Config 所在位置：当前项目内、`.claude/` 内、子目录、软链接目标或外部共享目录。
- 项目类型：frontend、backend、fullstack、script、infrastructure、library 或 unknown。
- 技术栈证据：`package.json`、`vite.config.*`、`pom.xml`、`build.gradle`、`requirements.txt`、`pyproject.toml`、`Dockerfile`、`docker-compose.yml` 等。
- 已有 Claude Code 资产：`AGENTS.md`、`CLAUDE.md`、`GOAL_TEMPLATES.md`、`.claude/skills/`、`.harness/`、`deploy/`、`docs/`。
- 用户授权：只检查、允许创建缺失文件、允许更新过时引用、允许建立软链接或复制 Skills。
- 是否涉及部署、数据库、权限、安全、长期维护或多人协作。

缺少授权时，默认只检查并输出接入差距，不覆盖已有文件。

## 项目类型识别规则

- React/Vite 前端：存在 `package.json` 且包含 `vite`、`react` 或 `src/**/*.tsx`。
- Spring Boot 后端：存在 `pom.xml` 或 `build.gradle`，且依赖或目录显示 Spring Boot。
- 全栈项目：同时存在前端和后端目录，例如 `frontend/` + `backend/`。
- Python 服务或脚本：存在 `pyproject.toml`、`requirements.txt`、`manage.py` 或大量 `.py` 文件。
- 基础设施项目：存在 Terraform、Kubernetes、Helm、Ansible、Docker Compose 或部署脚本为主。
- 无法可靠判断时，使用通用模板，并在输出中列出待确认项。

识别项目类型必须基于文件证据，不要只凭项目名称猜测。

## 默认决策

- 默认使用 `templates/CLAUDE.md.template`，再按项目技术栈修改占位符。
- 最小可用接入需要 `CLAUDE.md` 和可访问的团队 Skills。
- 如果团队提供了 `AGENTS.md` 模板，可作为额外的入口协议文件。
- 复杂长任务或多人协作项目，如果团队有 `GOAL_TEMPLATES.md` 模板，建议接入。
- 涉及部署的项目建议接入 `deploy/`。
- 涉及长期交付、验收、风险登记或 AI 产出评估的项目，如果团队有 `.harness/` 模板，建议接入。
- 规划型或高风险项目建议接入 `docs/` 下的 SPEC、task plan、data schema、eval case 和 ADR 模板。

不要默认把所有模板塞进小型脚本项目。检查结论要区分"必须补齐""建议补齐"和"当前可跳过"。

## 执行步骤

1. 定位项目根目录和 Team Vibe Config 目录，确认当前工作区是否干净。
2. 扫描技术栈证据，判断项目类型和推荐 `CLAUDE.md` 模板。
3. 检查入口文件：`AGENTS.md` 是否存在，是否指向 `CLAUDE.md`、rules、skills 和交付门禁。
4. 检查项目上下文：`CLAUDE.md` 是否填写技术栈、目录结构、常用命令、核心约定、禁止事项和完成定义。
5. 检查共享 Skills：`.claude/skills/` 是否存在，是否能访问 Team Vibe Config 的 `skills/`。
6. 按项目风险检查可选资产：`deploy/`、`docs/` planning templates。如果团队提供了 `GOAL_TEMPLATES.md`、`.harness/` 或 `AGENTS.md` 模板，按需检查。
7. 根据检查模式决定只输出差距，还是执行最小补齐。
8. 输出接入健康报告，列出已就绪、必须补齐、建议补齐、跳过原因和验证方式。

## 模板选择规则

- Claude Code 入口协议：从 `templates/INDEX.md` 选择项目上下文模板。
- 通用项目上下文：`templates/CLAUDE.md.template` -> `CLAUDE.md`。
- 规划文档：`templates/planning-docs/` -> `docs/` 或项目约定的规划目录。

使用模板后必须提示用户填充占位符。不能把包含 `<project-name>`、`<command>`、`<owner>` 的文件当成最终完成配置。

## 文件写入策略

- 已存在的 `AGENTS.md`、`CLAUDE.md`、`GOAL_TEMPLATES.md` 不直接覆盖；先读取并输出合并建议。
- 已存在的 `.claude/skills/` 不删除；只补缺失链接或说明冲突。
- 使用软链接前先确认目标路径存在。
- Windows 环境如果软链接不可用，可以复制团队 Skills。
- 不把个人路径、真实密钥、生产 `.env`、服务器地址或私有 token 写入模板。
- 所有写入动作都应保持最小变更，并在最终报告中列出创建或修改的路径。

## 输出格式

```markdown
## Team Vibe Config Check

- Mode: <check-only | repair-minimal | sync-templates | bootstrap>
- Project type: <frontend | backend | fullstack | script | infrastructure | library | unknown>
- Config location:
- Template selected:

## Current State

| Asset | Status | Evidence |
|-------|--------|----------|
| AGENTS.md | <exists/missing/needs-update> | <path or reason> |
| CLAUDE.md | <exists/missing/needs-update> | <path or reason> |
| .claude/skills | <exists/missing/needs-update> | <path or reason> |
| GOAL_TEMPLATES.md | <exists/missing/skipped — 仅当团队提供模板时> | <path or reason> |
| deploy/ | <exists/missing/skipped> | <path or reason> |
| .harness/ | <exists/missing/skipped — 仅当团队提供模板时> | <path or reason> |
| docs/ planning templates | <exists/missing/skipped> | <path or reason> |

## Required Fixes

## Recommended Improvements

## Skipped

## Validation

- How to trigger a shared Skill:
- Required placeholders still to fill:
- Suggested first real task:

## Risks
```

如果不能写入，输出应以阻塞原因开头：

```markdown
## Blocked

- Reason:
- Missing input or permission:
- Safe next step:
```

## 失败处理

- 模板文件不存在时，停止对应写入，说明缺失模板路径，并继续审计其他资产。
- 当前目录不是项目根目录时，先定位可能的项目根；无法确认时要求用户确认。
- 目标文件已存在且内容不同，默认不覆盖，输出合并建议。
- 软链接创建失败时，提供复制方案。
- 项目类型无法识别时，使用通用模板并列出待确认技术栈。
- 找不到 Team Vibe Config 目录时，只检查项目内已有 Claude Code 资产，并提示需要提供配置包位置。
- 项目不是 Git 仓库时，可以检查配置，但必须提示后续纳入版本管理。

## 验收标准

- 项目根目录存在 `AGENTS.md`，并指向 `CLAUDE.md`、rules、skills 和交付门禁。
- 项目根目录存在 `CLAUDE.md`，且包含项目类型、技术栈、目录结构、常用命令、核心约定、禁止事项和完成定义。
- `.claude/skills/` 能访问团队共享 Skills，或明确说明使用全局团队配置。
- 复杂长任务项目如果团队有 `GOAL_TEMPLATES.md` 模板，应接入；否则明确说明暂不需要。
- 涉及部署的项目存在 `deploy/` 契约、检查清单和 env schema，或明确说明暂不需要。
- 长期交付项目如果团队有 `.harness/` 模板，应接入；否则明确说明暂不需要。
- 规划型项目存在 SPEC、task plan、data schema、eval case 或 ADR 模板，或明确说明暂不需要。
- Claude Code 执行一次小任务时能主动遵守项目约定、引用验证命令并说明剩余风险。

## 日常定位

本 Skill 不是高频开发 Skill。日常开发优先使用代码审查、SPEC 驱动、双系统部署和交付评估类 Skill。

本 Skill 主要用于：

- 配置包第一次放入项目后做自检。
- 团队模板更新后检查项目是否落后。
- 新人接手项目时确认 AI 开发辅助环境是否可用。
- 项目出现"Claude Code 不懂项目上下文、不遵守约定、找不到 Skills"时定位配置缺口。
