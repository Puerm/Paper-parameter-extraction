import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Archive, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface Parameter {
  id: string
  jsonValue: Record<string, string | null>
  status: string
  updatedAt: string
  paper: { filename: string }
  template: { name: string }
}

export default function LibraryPage() {
  const [params, setParams] = useState<Parameter[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetch = () => {
    const query = new URLSearchParams({ search, page: String(page), pageSize: '20' })
    api.get(`/library?${query}`).then(d => {
      setParams(d.parameters)
      setTotalPages(d.totalPages || 1)
    }).catch(() => {})
  }

  useEffect(() => { setPage(1) }, [search])
  useEffect(() => { fetch() }, [search, page])

  const handleExport = async (format: 'csv' | 'excel') => {
    const token = localStorage.getItem('token')
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const r = await window.fetch(`/api/library/export/${format}${query}`, { headers })
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `parameters.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('导出失败')
    }
  }

  const handleArchive = async (id: string) => {
    if (!confirm('确定归档该参数？归档后不会在默认视图中显示。')) return
    try {
      await api.post(`/library/${id}/archive`)
      toast.success('参数已归档')
      fetch()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Collect unique keys across all params for table headers
  const allKeys = new Set<string>()
  params.forEach(p => {
    if (p.jsonValue) Object.keys(p.jsonValue).forEach(k => allKeys.add(k))
  })
  const keys = Array.from(allKeys)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">参数库</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-1" />
            导出 CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-1" />
            导出 Excel
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="搜索论文名或模板名..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {params.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>参数库为空，审核通过的参数将显示在这里</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>论文</TableHead>
                  <TableHead>模板</TableHead>
                  {keys.map(k => <TableHead key={k}>{k}</TableHead>)}
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {params.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-sm max-w-40 truncate">{p.paper.filename}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.template.name}</Badge>
                    </TableCell>
                    {keys.map(k => (
                      <TableCell key={k} className="text-sm">
                        {p.jsonValue?.[k] || '-'}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleArchive(p.id)}>
                        <Archive className="h-3 w-3 text-slate-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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
        </>
      )}
    </div>
  )
}
