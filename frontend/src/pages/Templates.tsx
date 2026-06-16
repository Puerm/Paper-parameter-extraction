import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Plus, Copy, Pencil, Trash2, Layers, Sparkles, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  yamlContent: string
  createdAt: string
  updatedAt: string
  _count?: { parameters: number }
}

const EXAMPLE_YAML = `model_name: 模型名称
dataset: 数据集
learning_rate: 学习率
batch_size: 批次大小
epochs: 训练轮数`

export default function TemplatesPage() {
  const { isAdmin } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null)
  const [form, setForm] = useState({ name: '', yamlContent: EXAMPLE_YAML })
  const [saving, setSaving] = useState(false)

  const fetch = () => {
    api.get('/templates').then(d => setTemplates(d.templates)).catch(() => {})
  }

  useEffect(() => { fetch() }, [])

  const templateStats = useMemo(() => {
    const totalParameters = templates.reduce((sum, template) => sum + (template._count?.parameters || 0), 0)
    const latestUpdate = templates.length
      ? [...templates].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))[0]
      : null

    return {
      totalTemplates: templates.length,
      totalParameters,
      latestUpdate,
    }
  }, [templates])

  const formatDate = (value: string) => new Date(value).toLocaleDateString('zh-CN')

  const getPreviewLines = (yamlContent: string) => yamlContent.split('\n').slice(0, 4).join('\n')

  const openDetails = (template: Template) => setActiveTemplate(template)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await api.put(`/templates/${editing.id}`, form)
        toast.success('模板已更新 ✅')
      } else {
        await api.post('/templates', form)
        toast.success('模板已创建 ✅ 比写论文快多了')
      }
      setOpen(false)
      setEditing(null)
      setForm({ name: '', yamlContent: EXAMPLE_YAML })
      fetch()
    } catch (err: unknown) {
      toast.error('翻车了 🫠 要不你再试一次？')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (t: Template) => {
    setEditing(t)
    setForm({ name: t.name, yamlContent: t.yamlContent })
    setOpen(true)
  }

  const handleClone = async (id: string) => {
    try {
      await api.post(`/templates/${id}/clone`)
      toast.success('克隆成功 🧬 比 reviewer 写 review 快多了')
      fetch()
    } catch (err: unknown) {
      toast.error('翻车了 🫠 要不你再试一次？')
    }
  }

  const handleDelete = async (t: Template) => {
    if (!confirm(`确定删除模板「${t.name}」？删了 reviewer 也救不回来 😬`)) return
    try {
      await api.delete(`/templates/${t.id}`)
      toast.success('已删除 🗑️ 干干净净')
      if (activeTemplate?.id === t.id) setActiveTemplate(null)
      fetch()
    } catch (err: unknown) {
      toast.error('翻车了 🫠 要不你再试一次？')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', yamlContent: EXAMPLE_YAML })
    setOpen(true)
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">参数模板</h1>
            <p className="mt-1 text-sm text-slate-500">定义 AI 提取参数的字段模板（YAML 格式）</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Badge variant="secondary" className="rounded-full">共 {templateStats.totalTemplates} 个模板</Badge>
            <Badge variant="secondary" className="rounded-full">{templateStats.totalParameters} 条参数</Badge>
            {templateStats.latestUpdate && (
              <Badge variant="secondary" className="rounded-full">最近更新 {formatDate(templateStats.latestUpdate.updatedAt)}</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" />
                新建模板
              </DialogTrigger>
              <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 shadow-xl">
                <div className="border-b border-slate-200 bg-white px-6 py-4">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-slate-900">{editing ? '编辑模板' : '新建模板'}</DialogTitle>
                    <p className="mt-1 text-sm text-slate-500">定义 AI 从论文中提取参数时使用的模板结构。</p>
                  </DialogHeader>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-6 bg-white px-6 py-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">模板名称</Label>
                    <Input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="如：深度学习训练参数"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-slate-700">YAML 定义</Label>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-800"
                        onClick={() => setForm({ ...form, yamlContent: form.yamlContent + '\nnew_field: 新字段描述' })}
                      >
                        + 插入示例字段
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/60">
                      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-blue-700">YAML</span>
                        <span className="text-xs text-slate-400">每行一个字段，格式：字段名: 描述</span>
                      </div>
                      <Textarea
                        value={form.yamlContent}
                        onChange={e => setForm({ ...form, yamlContent: e.target.value })}
                        className="min-h-56 w-full border-0 bg-white p-4 font-mono text-sm leading-6 text-slate-800 placeholder:text-slate-300 focus:ring-0 focus-visible:ring-0"
                        placeholder={EXAMPLE_YAML}
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400">AI 将按模板字段逐项从论文中提取对应参数值。</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="tabular-nums">{form.yamlContent.split('\n').length} 行</span>
                        <span className="tabular-nums">{form.yamlContent.length} 字符</span>
                      </div>
                    </div>
                  </div>

                  <div className="-mx-6 -mb-5 mt-2 flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-800">
                      取消
                    </Button>
                    <Button type="submit" disabled={saving} className="min-w-28 gap-2">
                      {saving && (
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {saving ? '保存中...' : '保存模板'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
        <p className="text-sm text-slate-600">模板列表支持快速浏览，点击标题或预览可查看完整内容。</p>
        <span className="text-xs text-slate-400">共 {templates.length} 项</span>
      </div>

      {templates.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white/70">
          <CardContent className="py-16 text-center">
            <Layers className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="mb-1 text-slate-500 font-medium">还没有模板呢 🧑‍🔬</p>
            <p className="mb-4 text-sm text-slate-400">去建一个吧，比写论文简单多了</p>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus className="mr-1 h-4 w-4" />
                创建第一个模板
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map(t => (
            <Card key={t.id} className="group overflow-hidden border-slate-200 bg-white/90 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <button type="button" onClick={() => openDetails(t)} className="block w-full text-left">
                      <CardTitle className="line-clamp-2 text-base leading-6 group-hover:text-slate-900">
                        {t.name}
                      </CardTitle>
                    </button>
                    <CardDescription className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{t._count?.parameters || 0} 条参数</Badge>
                      <span className="text-xs text-slate-400">更新于 {formatDate(t.updatedAt)}</span>
                    </CardDescription>
                  </div>
                  <button type="button" onClick={() => openDetails(t)} className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-700">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <button type="button" onClick={() => openDetails(t)} className="mb-3 block w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-left transition-colors hover:border-slate-200 hover:bg-slate-100/70">
                  <pre className="max-h-28 overflow-hidden whitespace-pre-wrap break-words font-mono text-xs leading-5 text-slate-600">
                    {getPreviewLines(t.yamlContent)}
                  </pre>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                    查看完整内容
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => handleEdit(t)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => handleClone(t.id)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => handleDelete(t)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </>
                  )}
                  <div className="flex-1" />
                  <Link to="/papers">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      去提取
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!activeTemplate} onOpenChange={open => !open && setActiveTemplate(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          {activeTemplate && (
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-slate-200 px-0 pb-4">
                <SheetTitle className="text-xl">{activeTemplate.name}</SheetTitle>
                <SheetDescription className="flex flex-wrap gap-2 text-sm text-slate-500">
                  <span>{activeTemplate._count?.parameters || 0} 条参数</span>
                  <span>创建于 {formatDate(activeTemplate.createdAt)}</span>
                  <span>更新于 {formatDate(activeTemplate.updatedAt)}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-wrap gap-2 py-4">
                {isAdmin && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(activeTemplate)}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      编辑
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleClone(activeTemplate.id)}>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      克隆
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(activeTemplate)}>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      删除
                    </Button>
                  </>
                )}
                <Link to="/papers">
                  <Button size="sm">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    去提取
                  </Button>
                </Link>
              </div>

              <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">YAML 内容</div>
                <pre className="h-full overflow-auto px-4 py-4 font-mono text-xs leading-6 text-slate-700">
                  {activeTemplate.yamlContent}
                </pre>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                如果这个模板已被论文引用，删除前请先确认引用关系。
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
