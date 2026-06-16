import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SelectNative } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditLog {
  id: string
  userId: string
  action: string
  targetType: string
  targetId: string
  changes: any
  createdAt: string
  user: { username: string }
}

const ACTION_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  POST: { label: '创建', variant: 'default' },
  PUT: { label: '更新', variant: 'secondary' },
  PATCH: { label: '修改', variant: 'secondary' },
  DELETE: { label: '删除', variant: 'destructive' },
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetch = () => {
    const params = new URLSearchParams({ page: String(page), pageSize: '20' })
    if (filterType !== 'all') params.set('targetType', filterType)
    api.get(`/audit?${params}`).then(d => {
      setLogs(d.logs)
      setTotalPages(d.totalPages || 1)
    }).catch(() => {})
  }

  useEffect(() => { setPage(1) }, [filterType])
  useEffect(() => { fetch() }, [filterType, page])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">审计日志</h1>
        <SelectNative value={filterType} onChange={e => setFilterType(e.target.value)} size="sm" className="w-36">
          <option value="all">全部类型</option>
          <option value="papers">论文</option>
          <option value="templates">模板</option>
          <option value="parameters">参数</option>
          <option value="users">用户</option>
        </SelectNative>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4" />
            操作记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作者</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>目标类型</TableHead>
                <TableHead>详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                    暂无记录
                  </TableCell>
                </TableRow>
              )}
              {logs.map(log => {
                const a = ACTION_MAP[log.action] || { label: log.action, variant: 'outline' as const }
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user?.username}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.variant}>{a.label}</Badge>
                    </TableCell>
                    <TableCell>{log.targetType}</TableCell>
                    <TableCell className="text-xs text-slate-400 max-w-40 truncate">
                      {log.changes ? JSON.stringify(log.changes).slice(0, 80) : '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-500">第 {page} / {totalPages} 页</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" /> 上一页
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  下一页 <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
