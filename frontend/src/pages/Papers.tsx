import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SelectNative } from '@/components/ui/select'
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Paper {
  id: string
  filename: string
  author: string | null
  doi: string | null
  status: string
  extractedCount: number
  createdAt: string
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: '待解析', variant: 'secondary' },
  parsing: { label: '解析中', variant: 'outline' },
  parsed: { label: '解析成功', variant: 'default' },
  failed: { label: '解析失败', variant: 'destructive' },
  extracting: { label: '提取中', variant: 'outline' },
  reviewed: { label: '已入库', variant: 'default' },
}

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('createdAt_desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPapers = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    params.set('sort', sort)
    params.set('page', String(page))
    params.set('pageSize', '20')
    api.get(`/papers?${params}`).then(data => {
      setPapers(data.papers)
      setTotalPages(data.totalPages || 1)
    }).catch(() => {})
  }

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  useEffect(() => {
    fetchPapers()
    const interval = setInterval(fetchPapers, 10000)
    return () => clearInterval(interval)
  }, [search, statusFilter, sort, page])

  const handleRetry = async (id: string) => {
    try {
      await api.post(`/papers/${id}/retry`)
      toast.success('已开始重新解析')
      fetchPapers()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">论文管理</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索文件名、作者、DOI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <SelectNative value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="sm" className="w-32">
          <option value="all">全部状态</option>
          <option value="pending">待解析</option>
          <option value="parsed">解析成功</option>
          <option value="failed">解析失败</option>
          <option value="reviewed">已入库</option>
        </SelectNative>
        <SelectNative value={sort} onChange={e => setSort(e.target.value)} size="sm" className="w-44">
          <option value="createdAt_desc">上传时间 (新)</option>
          <option value="createdAt_asc">上传时间 (旧)</option>
          <option value="extractedCount_desc">参数数 (多)</option>
          <option value="extractedCount_asc">参数数 (少)</option>
        </SelectNative>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>文件名</TableHead>
            <TableHead>上传时间</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>DOI</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>提取参数数</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {papers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                暂无论文
              </TableCell>
            </TableRow>
          )}
          {papers.map(p => {
            const s = STATUS_MAP[p.status] || { label: p.status, variant: 'secondary' as const }
            return (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <Link to={`/papers/${p.id}`} className="hover:text-blue-600 hover:underline">
                    {p.filename}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString('zh-CN')}
                </TableCell>
                <TableCell>{p.author || '-'}</TableCell>
                <TableCell className="text-sm font-mono max-w-32 truncate">{p.doi || '-'}</TableCell>
                <TableCell><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                <TableCell>{p.extractedCount}</TableCell>
                <TableCell>
                  {p.status === 'failed' && (
                    <Button variant="outline" size="sm" onClick={() => handleRetry(p.id)}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      重试
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            第 {page} / {totalPages} 页
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
