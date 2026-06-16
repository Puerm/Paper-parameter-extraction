import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, GitCompare } from 'lucide-react'

interface VersionItem {
  id: string
  version: number
  jsonValue: Record<string, unknown>
  createdAt: string
  modifiedBy: { username: string }
}

interface ParamWithVersions {
  id: string
  jsonValue: Record<string, unknown>
  status: string
  version: number
  paper: { id: string; filename: string }
  template: { id: string; name: string }
  versions: VersionItem[]
}

interface DiffResult {
  versions: { version: number; createdAt: string }[]
  diff: { added: boolean; removed: boolean; value: string }[]
}

export default function HistoryPage() {
  const [params, setParams] = useState<ParamWithVersions[]>([])
  const [selected, setSelected] = useState<ParamWithVersions | null>(null)
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)
  const [diffLoading, setDiffLoading] = useState(false)

  const fetchParams = async () => {
    try {
      const data = await api.get('/parameters')
      setParams(data.parameters || [])
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchParams() }, [])

  const handleSelect = async (p: ParamWithVersions) => {
    // Fetch full detail with versions
    try {
      const detail = await api.get(`/parameters/${p.id}`)
      setSelected(detail)
      setDiffResult(null)

      // Auto-load diff if has multiple versions
      if (detail.versions?.length >= 2) {
        setDiffLoading(true)
        try {
          const diff = await api.get(`/library/${p.id}/diff`)
          setDiffResult(diff)
        } catch { /* ignore */ }
        setDiffLoading(false)
      }
    } catch { /* ignore */ }
  }

  const handleCompare = async (pId: string) => {
    setDiffLoading(true)
    try {
      const diff = await api.get(`/library/${pId}/diff`)
      setDiffResult(diff)
    } catch { /* ignore */ }
    setDiffLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">版本历史</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          {params.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">暂无参数记录</p>
          )}
          {params.map(p => (
            <Card
              key={p.id}
              className={`cursor-pointer transition-colors ${selected?.id === p.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleSelect(p)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.paper?.filename}</p>
                    <p className="text-xs text-gray-400">{p.template?.name} · v{p.version}</p>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2">
                    {p.versions?.length || 0} 个版本
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="col-span-2">
          {!selected ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>选择左侧的参数记录查看版本历史</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {selected.paper?.filename}
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-gray-500">{selected.template?.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    版本列表 ({selected.versions?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selected.versions?.map((v, idx) => (
                      <div key={v.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                            v{v.version}
                          </Badge>
                          <span className="text-gray-500">
                            {new Date(v.createdAt).toLocaleString('zh-CN')}
                          </span>
                          <span className="text-gray-400">{v.modifiedBy?.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selected.versions?.length >= 2 && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleCompare(selected.id)} disabled={diffLoading}>
                        <GitCompare className="h-4 w-4 mr-1" />
                        {diffLoading ? '加载中...' : '查看差异对比'}
                      </Button>
                    </div>
                  )}

                  {diffResult && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        差异对比：v{diffResult.versions[0]?.version} → v{diffResult.versions[1]?.version}
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs overflow-auto max-h-64">
                        {typeof diffResult.diff === 'string' ? (
                          <p className="text-gray-400">{diffResult.diff}</p>
                        ) : (
                          diffResult.diff.map((chunk, i) => (
                            <span
                              key={i}
                              className={
                                chunk.added ? 'bg-green-100 text-green-800' :
                                chunk.removed ? 'bg-red-100 text-red-800' : ''
                              }
                            >
                              {chunk.added && '+'}
                              {chunk.removed && '-'}
                              {(!chunk.added && !chunk.removed) && ' '}
                              {chunk.value}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
