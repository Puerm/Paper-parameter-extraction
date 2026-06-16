## 1. 项目初始化

- [ ] 1.1 初始化前端项目 (React + TypeScript + Tailwind + shadcn/ui)
- [ ] 1.2 初始化后端项目 (Node.js + Express + TypeScript)
- [ ] 1.3 配置 PostgreSQL 数据库 + Prisma ORM，定义初始 schema
- [ ] 1.4 配置 ESLint、Prettier、tsconfig

## 2. 用户与权限系统 (rbac)

- [ ] 2.1 实现 users 表 Prisma schema + 迁移
- [ ] 2.2 实现用户注册/登录 API（JWT 认证）
- [ ] 2.3 实现 RBAC 中间件（普通用户/审核员/管理员三级角色）
- [ ] 2.4 实现用户管理页面（管理员：创建/编辑/禁用用户）
- [ ] 2.5 为所有 API 端点添加权限校验

## 3. 论文上传模块 (paper-upload)

- [ ] 3.1 实现 papers 表 Prisma schema + 迁移
- [ ] 3.2 实现文件上传 API（PDF/DOCX/Markdown 格式校验）
- [ ] 3.3 集成 pdf-parse + mammoth + remark 实现文本解析
- [ ] 3.4 实现论文状态机（待解析→解析中→解析成功/失败）
- [ ] 3.5 实现元数据自动提取（作者、DOI）
- [ ] 3.6 实现同名文件自动重命名 (paper.pdf → paper(1).pdf)
- [ ] 3.7 实现上传页面 UI

## 4. 论文管理模块 (paper-management)

- [ ] 4.1 实现论文列表 API（搜索/筛选/排序）
- [ ] 4.2 实现论文列表页面（表格 + 搜索框 + 状态筛选 + 排序）
- [ ] 4.3 实现前端翻页功能

## 5. 参数模板管理 (template-management)

- [ ] 5.1 实现 templates 表 Prisma schema + 迁移
- [ ] 5.2 实现模板 CRUD API（创建/编辑/删除/克隆/列表）
- [ ] 5.3 实现 YAML 格式校验
- [ ] 5.4 实现模板删除引用保护（有论文引用时禁止删除）
- [ ] 5.5 实现模板管理页面 UI（含 YAML 编辑器）

## 6. AI 参数提取 (ai-parameter-extraction)

- [ ] 6.1 实现 parameters 表 Prisma schema + 迁移
- [ ] 6.2 实现 AI 提取 API（接收论文ID + 模板ID，调用 LLM）
- [ ] 6.3 实现 JSON 校验逻辑（格式校验 + schema 字段匹配）
- [ ] 6.4 实现非法 JSON 自动重试机制（最多3次，带错误反馈）
- [ ] 6.5 实现提取状态跟踪与前端轮询

## 7. 参数审核 (parameter-review)

- [ ] 7.1 实现参数状态流转（AI已提取→审核中→审核通过/拒绝）
- [ ] 7.2 实现左右对照审核页面（左侧原文 / 右侧提取结果）
- [ ] 7.3 实现参数修改/删除/新增操作 API
- [ ] 7.4 实现提交审核 API + 审核通过/拒绝 API
- [ ] 7.5 实现并发编辑冲突检测（乐观锁 version 字段）

## 8. 版本历史 (version-history)

- [ ] 8.1 实现 parameter_versions 表 Prisma schema + 迁移
- [ ] 8.2 实现自动版本创建（每次修改保存新版本）
- [ ] 8.3 实现版本列表 API + 版本详情 API
- [ ] 8.4 实现 JSON diff 对比算法（类 Git Diff）
- [ ] 8.5 实现版本历史页面 UI + diff 对比视图

## 9. 参数库 (parameter-library)

- [ ] 9.1 实现参数库搜索 API（按 key/value/论文/模板搜索）
- [ ] 9.2 实现标签管理 API（添加/删除/按标签筛选）
- [ ] 9.3 实现导出 Excel API（xlsx 格式）
- [ ] 9.4 实现导出 CSV API
- [ ] 9.5 实现参数归档逻辑（禁止直接删除已入库参数）
- [ ] 9.6 实现参数库页面 UI（搜索/标签/导出按钮/分页）

## 10. AI 问答 (ai-qa)

- [ ] 10.1 实现自然语言查询 API（LLM 解析查询→转换为数据库查询）
- [ ] 10.2 实现 AI 问答页面 UI（输入框 + 结果展示含论文来源）
- [ ] 10.3 实现查询历史记录

## 11. Dashboard 统计面板 (dashboard)

- [ ] 11.1 实现统计数据 API（论文总数/模板总数/参数总数/成功率）
- [ ] 11.2 实现上传趋势图表数据 API + 前端 ECharts/Recharts 绑定
- [ ] 11.3 实现提取成功率趋势图表 API + 前端绑定
- [ ] 11.4 实现模板使用排名图表 API + 前端绑定
- [ ] 11.5 实现 Dashboard 页面 UI

## 12. 通知中心 (notification-center)

- [ ] 12.1 实现 notifications 表 Prisma schema + 迁移
- [ ] 12.2 实现事件触发通知（解析完成/提取完成/审核通过/审核拒绝）
- [ ] 12.3 实现通知列表 API + 未读计数 API
- [ ] 12.4 实现通知中心页面 UI + 导航栏未读 badge

## 13. 审计日志 (audit-log)

- [ ] 13.1 实现 audit_logs 表 Prisma schema + 迁移
- [ ] 13.2 实现审计日志中间件（自动记录 CRUD 操作）
- [ ] 13.3 实现审计日志查询 API（按用户/时间/目标类型筛选）
- [ ] 13.4 实现审计日志页面 UI（管理员可见，分页表格）

## 14. 集成与部署

- [ ] 14.1 前端路由整合 + 导航菜单（根据角色显示不同菜单项）
- [ ] 14.2 全链路测试（上传→解析→提取→审核→入库→查询→导出）
- [ ] 14.3 性能优化与错误处理完善
