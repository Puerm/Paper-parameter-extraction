import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SelectNative } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, FileText, User, Hash, Clock, File, Sparkles, Eye, FlaskConical } from 'lucide-react'
import { toast } from 'sonner'

interface Paper {
  id: string
  filename: string
  originalName: string
  fileType: string
  content: string | null
  author: string | null
  doi: string | null
  status: string
  extractedCount: number
  createdAt: string
}

interface Template {
  id: string
  name: string
  yamlContent: string
}

interface Parameter {
  id: string
  jsonValue: Record<string, any>
  status: string
  template: { name: string }
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: '待解析', variant: 'secondary' },
  parsing: { label: '解析中', variant: 'outline' },
  parsed: { label: '可提取', variant: 'default' },
  failed: { label: '解析失败', variant: 'destructive' },
}

const PARAM_STATUS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  extracted: { label: '已提取', variant: 'secondary' },
  reviewing: { label: '审核中', variant: 'outline' },
  approved: { label: '已入库', variant: 'default' },
  rejected: { label: '已拒绝', variant: 'destructive' },
  extract_failed: { label: '提取失败', variant: 'destructive' },
}

function humanizeKey(key: string) {
  return key.replace(/_/g, ' ')
}

export default function PaperDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [templateId, setTemplateId] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [parameters, setParameters] = useState<Parameter[]>([])

  useEffect(() => {
    if (id) {
      api.get(`/papers/${id}`).then(setPaper).catch(() => {})
      api.get(`/parameters?paperId=${id}`).then(d => setParameters(d.parameters)).catch(() => {})
    }
    api.get('/templates').then(d => setTemplates(d.templates)).catch(() => {})
  }, [id])

  const handleExtract = async () => {
    if (!templateId) { toast.error('请先选择模板'); return }
    setExtracting(true)
    try {
      const result = await api.post('/parameters/extract', { paperId: id, templateId })
      const count = Object.values(result.jsonValue).filter((v: any) => v !== null).length
      toast.success(`提取完成 — ${count} 个字段有值`)
      setPaper((prev: Paper | null) => prev ? { ...prev, extractedCount: prev.extractedCount + 1 } : prev)
      api.get(`/parameters?paperId=${id}`).then(d => setParameters(d.parameters)).catch(() => {})
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setExtracting(false)
    }
  }

  if (!paper) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <FlaskConical className="h-5 w-5 animate-pulse mr-2" />
      加载中...
    </div>
  )

  const statusInfo = STATUS_MAP[paper.status] || { label: paper.status, variant: 'secondary' as const }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/papers">
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 truncate">{paper.filename}</h1>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: paper info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">论文信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-400 truncate">{paper.originalName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500">{paper.fileType}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className={paper.author ? 'text-slate-700' : 'text-slate-300'}>{paper.author || '未识别作者'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className={`font-mono text-xs ${paper.doi ? 'text-slate-700' : 'text-slate-300'}`}>
                  {paper.doi || '未识别 DOI'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500">{new Date(paper.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500">已提取 {paper.extractedCount} 组参数</span>
              </div>
            </CardContent>
          </Card>

          {/* Extraction card */}
          {paper.status === 'parsed' && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
                  <Sparkles className="h-4 w-4" />
                  AI 参数提取
                </CardTitle>
                <CardDescription>选择模板后由 AI 自动提取实验参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <SelectNative value={templateId} onChange={e => setTemplateId(e.target.value)} className="w-full bg-white">
                  <option value="">选择参数模板...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </SelectNative>
                {templates.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">暂无模板 —
                    <Link to="/templates" className="text-blue-600 hover:underline">创建</Link>
                  </p>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleExtract} disabled={extracting || !templateId} className="flex-1" size="sm">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    {extracting ? '提取中...' : '开始提取'}
                  </Button>
                  <Link to="/templates">
                    <Button variant="outline" size="sm">管理模板</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick link to review */}
          {parameters.length > 0 && (
            <Link to="/review">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1.5" />
                前往审核中心
              </Button>
            </Link>
          )}
        </div>

        {/* Right column: extraction results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Parameters */}
          {parameters.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                提取结果 ({parameters.length})
              </h2>
              {parameters.map((p, idx) => {
                const ps = PARAM_STATUS[p.status] || { label: p.status, variant: 'outline' as const }
                const entries = p.jsonValue ? Object.entries(p.jsonValue) : []
                const filledCount = entries.filter(([, v]) => v !== null).length
                return (
                  <Card key={p.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">#{idx + 1} — {p.template.name}</CardTitle>
                          <CardDescription>{filledCount} / {entries.length} 个字段有值</CardDescription>
                        </div>
                        <Badge variant={ps.variant} className="ml-2">{ps.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {entries.map(([key, value]) => (
                          <div
                            key={key}
                            className={`rounded-lg px-3 py-2 text-sm border transition-colors
                              ${value !== null
                                ? 'bg-white border-slate-200'
                                : 'bg-slate-50 border-slate-100 text-slate-300'
                              }`}
                          >
                            <span className="text-xs text-slate-400 block mb-0.5">{humanizeKey(key)}</span>
                            <span className={`font-medium ${value !== null ? 'text-slate-800' : ''}`}>
                              {value !== null ? String(value) : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Paper content */}
          {paper.content && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">论文原文</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans text-slate-600 leading-relaxed">{paper.content}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
