import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Send, Pencil, Eye, Sparkles, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Parameter {
  id: string
  paperId: string
  templateId: string
  jsonValue: Record<string, string | null>
  status: string
  version: number
  createdAt: string
  paper: { id: string; filename: string; content: string | null }
  template: { id: string; name: string }
  createdBy: { id: string; username: string }
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  extracting: { label: '提取中', variant: 'outline' },
  extracted: { label: '已提取', variant: 'secondary' },
  extract_failed: { label: '提取失败', variant: 'destructive' },
  reviewing: { label: '审核中', variant: 'secondary' },
  approved: { label: '已入库', variant: 'default' },
  rejected: { label: '已拒绝', variant: 'destructive' },
}

const FILTER_TABS = [
  { value: 'extracted', label: '待审核', filter: (p: Parameter) => p.status === 'extracted' || p.status === 'extract_failed' },
  { value: 'reviewing', label: '审核中', filter: (p: Parameter) => p.status === 'reviewing' },
  { value: 'approved', label: '已入库', filter: (p: Parameter) => p.status === 'approved' },
  { value: 'rejected', label: '已拒绝', filter: (p: Parameter) => p.status === 'rejected' },
]

export default function ReviewPage() {
  const { isReviewer } = useAuth()
  const [params, setParams] = useState<Parameter[]>([])
  const [selected, setSelected] = useState<Parameter | null>(null)
  const [editing, setEditing] = useState(false)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [activeTab, setActiveTab] = useState('extracted')

  const fetchParams = () => {
    api.get('/parameters').then(d => setParams(d.parameters)).catch(() => {})
  }

  useEffect(() => { fetchParams() }, [])

  const filteredParams = params.filter(p => {
    const tab = FILTER_TABS.find(t => t.value === activeTab)
    return tab ? tab.filter(p) : true
  })

  const handleSelect = async (p: Parameter) => {
    const detail = await api.get(`/parameters/${p.id}`)
    setSelected(detail)
    setEditing(false)
    const vals: Record<string, string> = {}
    if (detail.jsonValue) {
      for (const [k, v] of Object.entries(detail.jsonValue)) {
        vals[k] = v as string || ''
      }
    }
    setEditValues(vals)
  }

  const handleSaveEdit = async () => {
    if (!selected) return
    try {
      await api.put(`/parameters/${selected.id}`, {
        jsonValue: editValues,
        expectedVersion: selected.version,
      })
      toast.success('参数已更新')
      setEditing(false)
      handleSelect(selected)
    } catch (err: any) {
      if (err.message.includes('已被其他人修改')) {
        toast.warning(err.message)
        handleSelect(selected)
      } else {
        toast.error(err.message)
      }
    }
  }

  const handleSubmit = async () => {
    if (!selected) return
    try {
      await api.post(`/parameters/${selected.id}/submit`)
      toast.success('已提交审核')
      fetchParams()
      setSelected(null)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleApprove = async () => {
    if (!selected) return
    try {
      await api.post(`/parameters/${selected.id}/approve`)
      toast.success('审核通过，参数已入库')
      fetchParams()
      setSelected(null)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleReject = async () => {
    if (!selected) return
    try {
      await api.post(`/parameters/${selected.id}/reject`, { reason: rejectReason })
      toast.success('已拒绝')
      setShowReject(false)
      setRejectReason('')
      fetchParams()
      setSelected(null)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">参数审核中心</h1>
          <p className="text-sm text-slate-500 mt-1">审核 AI 提取的参数，确认后入库</p>
        </div>
        <Link to="/papers">
          <Button variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-1" />
            前往提取
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar - parameter list */}
        <div className="lg:w-80 flex-shrink-0">
          {/* Filter tabs as simple buttons */}
          <div className="flex gap-1 mb-3 bg-slate-100 rounded-lg p-1">
            {FILTER_TABS.map(t => {
              const count = params.filter(t.filter).length
              const isActive = activeTab === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => { setActiveTab(t.value); setSelected(null) }}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {t.label}
                  <span className={`ml-1 ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>({count})</span>
                </button>
              )
            })}
          </div>

          {/* Parameter list */}
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredParams.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Search className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm text-slate-400">暂无数据</p>
                </CardContent>
              </Card>
            ) : (
              filteredParams.map(p => {
                const s = STATUS_MAP[p.status] || { label: p.status, variant: 'secondary' as const }
                return (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all hover:shadow-sm
                      ${selected?.id === p.id ? 'ring-2 ring-blue-500 border-blue-200' : 'border-slate-200'}`}
                    onClick={() => handleSelect(p)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">{p.paper?.filename}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{p.template?.name}</p>
                        </div>
                        <Badge variant={s.variant} className="text-xs flex-shrink-0">{s.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Right panel - detail view */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Eye className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                <p className="text-slate-400 mb-1">选择左侧的提取记录</p>
                <p className="text-sm text-slate-300">查看详情并进行审核操作</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{selected.paper?.filename}</CardTitle>
                    <CardDescription className="mt-0.5">
                      模板：{selected.template?.name}
                      {selected.version > 1 && <Badge variant="outline" className="text-xs ml-2">v{selected.version}</Badge>}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {selected.status === 'extracted' && (
                      <>
                        <Button size="sm" variant={editing ? 'default' : 'outline'} onClick={() => setEditing(!editing)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          {editing ? '取消' : '编辑'}
                        </Button>
                        <Button size="sm" onClick={handleSubmit}>
                          <Send className="h-3.5 w-3.5 mr-1" />
                          提交审核
                        </Button>
                      </>
                    )}
                    {selected.status === 'reviewing' && isReviewer && (
                      <>
                        <Button size="sm" variant="default" onClick={handleApprove}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          通过
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setShowReject(true)}>
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          拒绝
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Reject dialog - inline */}
                {showReject && (
                  <div className="mb-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <label className="block text-sm font-medium text-red-800 mb-2">拒绝原因（可选）</label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full rounded-md border border-red-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      rows={2}
                      placeholder="填写拒绝原因..."
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="destructive" onClick={handleReject}>确认拒绝</Button>
                      <Button size="sm" variant="outline" onClick={() => { setShowReject(false); setRejectReason('') }}>取消</Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Paper content */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">论文原文</h4>
                    <div className="bg-slate-50 rounded-lg p-3 max-h-96 overflow-y-auto border border-slate-100">
                      <pre className="text-xs whitespace-pre-wrap font-sans text-slate-600 leading-relaxed">
                        {selected.paper?.content?.slice(0, 3000) || '无内容'}
                      </pre>
                    </div>
                  </div>

                  {/* Parameters */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">提取参数</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {Object.entries(editValues).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <label className="text-xs text-slate-400">{key.replace(/_/g, ' ')}</label>
                          {editing ? (
                            <input
                              type="text"
                              value={value}
                              onChange={e => setEditValues({ ...editValues, [key]: e.target.value })}
                              className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            />
                          ) : (
                            <span className={`text-sm px-3 py-1.5 rounded-md ${value ? 'text-slate-800 bg-slate-50' : 'text-slate-300 italic'}`}>
                              {value || '—'}
                            </span>
                          )}
                        </div>
                      ))}
                      {editing && (
                        <div className="flex gap-2 pt-3">
                          <Button size="sm" onClick={handleSaveEdit}>保存修改</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>取消</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
