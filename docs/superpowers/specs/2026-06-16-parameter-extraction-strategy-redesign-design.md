# 参数提取策略重设计

## 目标

将当前“仅将论文前 15000 字符直接发送给大模型”的参数提取方式，重构为一条面向长论文、多模板类型、且可稳定运行的高准确率抽取管线。新方案必须解决以下问题：

- 长论文后半部分信息容易丢失
- 单轮抽取对模型格式稳定性依赖过高
- 字段冲突时缺少证据链，人工审核成本高
- 不同论文类型、不同模板场景下扩展性不足

## 非目标

- 不重做论文解析器本身
- 不引入全文检索引擎
- 不做实时协同审核
- 不改变现有 RBAC 权限模型

## 设计原则

1. **覆盖全文优先**：抽取不能只依赖论文开头。
2. **证据优先**：每个字段都应尽可能绑定原文证据片段。
3. **分层处理**：局部抽取、全局聚合、冲突裁决、人工审核分开。
4. **失败可回退**：某个 chunk 或字段失败时，不应拖垮整篇论文。
5. **渐进落地**：可分阶段替换现有抽取实现。

## 总体架构

把现有的单次 LLM 抽取改为四层流水线：

1. **结构化切分**
   - 先对论文正文做结构感知切分。
   - 优先按章节标题、段落边界、表格、图注、附录切块。
   - 对超长块再按 token 或字符二次拆分。

2. **局部候选抽取**
   - 每个 chunk 单独调用模型。
   - 模型输出候选字段值、证据片段、置信度、chunk 引用。
   - 不直接产出最终参数。

3. **全局聚合与裁决**
   - 将所有 chunk 的候选结果聚合为字段级草案。
   - 对同字段多候选值做归一化与冲突消解。
   - 必要时触发二次 verifier 只裁决冲突字段。

4. **人工审核闭环**
   - 审核页展示最终值、候选值、证据片段、章节位置、置信度。
   - 审核员可接受、修改、标记缺失或补充备注。

## 任务状态机

参数提取任务建议引入独立状态，而不是只依赖参数表状态：

- `queued`
- `parsing`
- `chunking`
- `extracting`
- `aggregating`
- `verifying`
- `needs_review`
- `completed`
- `failed`

### 状态流转

- 上传成功后进入 `queued`
- 解析文本成功后进入 `chunking`
- chunk 级抽取完成后进入 `aggregating`
- 冲突或低置信度字段进入 `verifying`
- 需要人工介入时进入 `needs_review`
- 审核通过后进入 `completed`
- 不可恢复的解析或任务错误进入 `failed`

## Chunk 切分规则

### 优先级

1. 章节标题边界
2. 段落边界
3. 表格、图注、附录独立保留
4. 单个块过长时再按长度二次拆分

### chunk 元数据

每个 chunk 需要记录：

- `chunkId`
- `paperId`
- `sectionPath`
- `startOffset`
- `endOffset`
- `chunkType`
- `templateHints`

### chunk 类型

- `text`
- `table`
- `figure_caption`
- `appendix`

## 局部抽取输出

每个 chunk 的抽取结果应返回候选包，而不是最终参数：

```ts
{
  chunkId: string,
  candidates: [
    {
      field: string,
      value: string | number | boolean | null,
      normalizedValue?: string | number | boolean | null,
      evidence: string,
      evidenceRange: [number, number],
      confidence: number,
      status: 'confirmed' | 'uncertain' | 'not_found'
    }
  ]
}
```

### 规则

- 必须提供证据片段
- 必须提供证据位置
- 置信度必须是 0 到 1 之间的数值
- 找不到时明确标记为 `not_found`
- 不允许只返回“猜测值”而没有证据

## 全局聚合策略

### 合并规则

- 相同值直接合并
- 等价值先归一化后合并
- 多个冲突值进入冲突队列

### 决策优先级

1. 明确证据优先于推断
2. 更贴近相关章节的证据优先
3. 表格和实验设置中的值优先于泛述正文
4. 多个 chunk 支持同一值时，置信度累积
5. 仍无法决策时保留多个候选并进入 `needs_review`

### 冲突处理

冲突分为三类：

- **格式冲突**：如 `3e-5` 与 `0.00003`
- **语义冲突**：如两个不同的学习率
- **上下文冲突**：多个字段相关但来源分散

处理方式：

- 格式冲突自动归一化
- 语义冲突进入 verifier
- verifier 无法确认则交给人工审核

## 二次 verifier

verifier 不负责重新抽取全文，只负责裁决冲突字段。

### 输入

- 冲突字段候选值
- 每个候选的证据片段
- 章节位置
- 模板字段定义

### 输出

- 选定值，或
- 标记 `needs_review`，或
- 标记 `missing`

### 作用边界

- 只能裁决已发现的冲突
- 不能替代局部抽取
- 不能把“没找到”伪装成“找到了”

## 多模板支持

模板分两层：

1. **公共层**
   - 作者
   - 数据集
   - 模型
   - 学习率
   - batch size
   - epoch

2. **模板特定层**
   - 各学科/任务独有字段

抽取顺序：

- 先抽公共层
- 再按模板特定规则补充
- 聚合时共享同一套候选/证据/冲突机制

## 任务编排

抽取流程应改为异步任务，而不是阻塞 HTTP 请求。

### 建议接口模式

- 创建抽取任务：返回 `jobId`
- 查询任务状态：轮询 `jobId`
- 查询 chunk 结果：按需展开
- 审核通过：写回最终参数

### 好处

- 避免长论文导致请求超时
- 便于重试单个 chunk
- 便于记录中间状态与失败原因

## 数据模型建议

### ExtractionJob

表示一次论文抽取任务。

建议字段：

- `id`
- `paperId`
- `templateId`
- `status`
- `currentStage`
- `totalChunks`
- `completedChunks`
- `errorMessage`
- `createdAt`
- `updatedAt`

### ExtractionChunk

表示一个 chunk 的执行结果。

建议字段：

- `id`
- `jobId`
- `chunkIndex`
- `sectionPath`
- `startOffset`
- `endOffset`
- `status`
- `inputText`
- `rawOutput`
- `errorMessage`
- `createdAt`
- `updatedAt`

### ExtractionCandidate

表示一个字段的候选值。

建议字段：

- `id`
- `chunkId`
- `fieldName`
- `candidateValue`
- `normalizedValue`
- `evidenceText`
- `evidenceRange`
- `confidence`
- `status`
- `decisionSource`

### 与现有表的关系

- `parameters` 保留为最终结果表
- `parameter_versions` 继续保留版本历史
- 抽取中间态由 `ExtractionJob` / `ExtractionChunk` / `ExtractionCandidate` 承担

## 失败回退策略

### 解析失败

- 直接失败
- 允许重试解析

### chunk 失败

- 先重试该 chunk
- 若失败 chunk 比例过高，降级为更粗粒度切分再跑一次

### 字段冲突失败

- 不直接失败
- 进入 `needs_review`

### 低置信度过高

- 对缺失或冲突字段触发定向再抽取
- 若仍不稳定，交给人工审核

## 人工审核体验

审核页面应默认展示：

- 最终值
- 候选值列表
- 各候选证据片段
- 所在章节
- 置信度
- verifier 结论

审核员可执行：

- 接受
- 修改
- 标记缺失
- 添加备注

## 质量门禁

抽取任务完成前至少检查：

- 字段覆盖率
- 证据覆盖率
- 冲突率
- 低置信度率
- 人工介入率

### 完成条件

- 关键字段达到最低覆盖率
- 无未处理的高优先级冲突
- 所有最终值都有可追溯证据

### 进入人工审核条件

- 关键字段覆盖不足
- 冲突率超过阈值
- 多个字段置信度过低
- verifier 无法裁决

## 测试策略

### 单元测试

- chunk 切分规则
- 证据提取格式
- 候选值归一化
- 冲突排序
- verifier 裁决

### 集成测试

- 长论文
- 多模板
- 混合正文、表格、附录
- 失败 chunk
- 缺页或低质量 PDF

### 验收指标

建议至少观察：

- 关键字段召回率
- 精确率
- 人工改动率
- 冲突裁决成功率
- 任务失败率

## 渐进落地顺序

1. 新增任务与 chunk 数据模型
2. 替换单轮前 15000 字符抽取
3. 加入 chunk 聚合与 verifier
4. 接入人工审核证据链
5. 补充测试与指标监控

## 风险

- 调用次数增加，成本上升
- 实现复杂度高于当前方案
- 需要更完整的任务状态管理
- 审核页面需要更多信息展示空间

## 结论

对于长论文和多类型模板场景，单轮前 15000 字符抽取不适合做主策略。推荐采用“结构化切分 + 局部抽取 + 全局聚合 + 冲突裁决 + 人工审核”的分层方案，优先保证覆盖率、证据链完整性和可回退性。