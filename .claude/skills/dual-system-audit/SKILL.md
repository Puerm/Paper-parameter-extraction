---
name: dual-system-audit
description: Use before deployment or when local and remote environments may differ across commands, config, data, runtime, paths, services, or health checks.
version: "0.1.0"
tags: ["workflow", "deployment", "environment", "audit"]
---

# 双系统环境审查

## 适用场景

- 全栈项目上线前。
- 部署脚本、环境变量或运行文档变更后。
- 本地能跑但服务器失败。
- 怀疑 Windows/Linux 路径、命令或配置不一致。

## 审查范围

- 代码链：Git commit、依赖安装、构建产物。
- 配置链：`.env.example`、`env.schema`、服务器真实 env。
- 数据链：模型、migration、备份、回滚。
- 运行链：systemd、nginx、容器、日志、healthcheck。

## 必查项

- 是否有硬编码绝对路径或 OS 专属命令。
- 本地命令和远程命令是否分区。
- env 使用是否都有 example/schema。
- 远程脚本是否默认只读或明确标注 mutating。
- 数据迁移是否有计划、验证和回滚说明。
- README 是否说明真实启动、构建和联调方式。

## 输出格式

```markdown
## Findings

- [P1/P2/P3][文件:行号] 风险
  环境：LOCAL / REMOTE / CI
  建议：

## Drift Map

| 链路 | 本地 | 远程 | 风险 |
|---|---|---|---|

## Recommended Fixes

## Manual Checks
```
