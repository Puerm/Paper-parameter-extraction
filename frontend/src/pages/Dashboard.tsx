import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Layers, Database, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  totalPapers: number
  totalTemplates: number
  totalParameters: number
  successRate: number
}

interface Trends {
  uploadTrend: { date: string; count: number }[]
  extractionSuccess: { date: string; rate: number }[]
  templateRanking: { name: string; count: number }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [trends, setTrends] = useState<Trends | null>(null)

  useEffect(() => {
    api.get('/dashboard/stats').then(setStats).catch(() => {})
    api.get('/dashboard/trends').then(setTrends).catch(() => {})
  }, [])

  if (!stats) return <div className="p-8 text-slate-400 text-center"><p className="text-sm">正在拼命解析… 咖啡已经准备好了 ☕</p></div>

  const cards = [
    { label: '论文总数', value: stats.totalPapers, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '模板总数', value: stats.totalTemplates, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '参数总数', value: stats.totalParameters, icon: Database, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '成功率', value: `${stats.successRate}%`, icon: CheckCircle2, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{c.label}</CardTitle>
              <div className={`p-2 rounded-lg ${c.bg}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">上传趋势（近30天）</CardTitle>
          </CardHeader>
          <CardContent>
            {trends?.uploadTrend?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trends.uploadTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">暂无数据 📊</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">提取成功率趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {trends?.extractionSuccess?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trends.extractionSuccess}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">暂无数据 📊</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">模板使用排名</CardTitle>
          </CardHeader>
          <CardContent>
            {trends?.templateRanking?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trends.templateRanking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">暂无数据 📊</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
