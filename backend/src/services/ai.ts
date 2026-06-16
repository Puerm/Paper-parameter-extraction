import Anthropic from '@anthropic-ai/sdk'
import YAML from 'yaml'

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

interface ExtractionResult {
  success: boolean
  data?: Record<string, string>
  error?: string
  attempts: number
}

export async function extractParameters(
  paperText: string,
  templateYaml: string,
  retryCount = 0,
): Promise<ExtractionResult> {
  const maxRetries = 3

  if (!client) {
    return { success: false, error: 'AI 服务未配置 (缺少 ANTHROPIC_API_KEY)', attempts: 0 }
  }

  const templateObj = YAML.parse(templateYaml)
  const fields = flattenKeys(templateObj)

  const systemPrompt = `你是一个科研参数提取助手。从论文文本中提取实验参数，严格按照要求的字段返回 JSON。

要求提取的字段：${fields.join(', ')}

规则：
1. 返回合法的 JSON 对象，键名必须与上述字段完全一致
2. 保留原始单位（如 80°C、92%、5h）
3. 无法提取的字段值设为 null
4. 不要添加额外说明，只返回 JSON

示例输出：{"Temperature":"80°C","Catalyst":"Pd/C","Yield":"92%"}`

  const previousErrors = retryCount > 0
    ? `\n\n之前的返回结果格式有误。请确保返回合法的 JSON 对象，使用双引号包围键名和字符串值。`
    : ''

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `论文内容：\n${paperText.slice(0, 15000)}\n\n${previousErrors}\n请提取参数并返回 JSON：`,
      }],
    })

    const textBlock = response.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
    if (!textBlock) {
      if (retryCount < maxRetries) {
        return extractParameters(paperText, templateYaml, retryCount + 1)
      }
      return { success: false, error: 'AI 返回格式异常', attempts: retryCount + 1 }
    }

    // Extract JSON from response
    let jsonStr = textBlock.text.trim()
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    try {
      const data = JSON.parse(jsonStr)
      // Validate that all template fields exist as keys
      for (const field of fields) {
        if (!(field in data)) {
          data[field] = null
        }
      }
      return { success: true, data, attempts: retryCount + 1 }
    } catch {
      if (retryCount < maxRetries) {
        return extractParameters(paperText, templateYaml, retryCount + 1)
      }
      return { success: false, error: `JSON 解析失败 (已重试 ${maxRetries} 次): ${jsonStr.slice(0, 100)}`, attempts: maxRetries + 1 }
    }
  } catch (err: any) {
    if (retryCount < maxRetries) {
      return extractParameters(paperText, templateYaml, retryCount + 1)
    }
    return { success: false, error: `AI 调用失败: ${err.message}`, attempts: retryCount + 1 }
  }
}

export async function naturalLanguageQuery(
  question: string,
  parameters: Array<{ id: string; jsonValue: any; paperTitle: string; templateName: string }>,
): Promise<string> {
  if (!client) {
    return 'AI 服务未配置'
  }

  const context = parameters.map(p =>
    `论文: ${p.paperTitle} | 模板: ${p.templateName} | 参数: ${JSON.stringify(p.jsonValue)}`
  ).join('\n')

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: '你是一个科研数据查询助手。根据参数库中的数据回答用户的问题。用中文回答，列出匹配的结果。如果没有匹配结果，明确说明。',
      messages: [{
        role: 'user',
        content: `参数库数据：\n${context.slice(0, 25000)}\n\n用户问题：${question}`,
      }],
    })

    const textBlock = response.content.find((c): c is Anthropic.TextBlock => c.type === 'text')
    return textBlock ? textBlock.text : '无法处理查询'
  } catch (err: any) {
    return `查询失败: ${err.message}`
  }
}

function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}
