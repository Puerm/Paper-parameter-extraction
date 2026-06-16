import { useState, useEffect, useRef } from 'react'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, Clock, Database } from 'lucide-react'
import { toast } from 'sonner'

interface QueryEntry {
  question: string
  answer: string
  resultCount?: number
  createdAt?: string
}

export default function QAPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<QueryEntry[]>([])
  const [current, setCurrent] = useState<QueryEntry | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/qa/history').then(d => setHistory(d.queries || [])).catch(() => {})
  }, [])

  const handleAsk = async () => {
    if (!question.trim() || loading) return
    setLoading(true)
    try {
      const data = await api.post('/qa/ask', { question: question.trim() })
      const entry = { question: question.trim(), answer: data.answer, resultCount: data.resultCount }
      setCurrent(entry)
      setHistory(prev => [entry, ...prev.slice(0, 19)])
      setQuestion('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">AI 问答</h1>
      <p className="text-sm text-slate-500 mb-6">
        用自然语言查询参数库。例如："近三年所有催化剂实验中，温度超过100℃且收率大于90%的有哪些？"
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* Input area */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="输入你的问题..."
                  onKeyDown={e => e.key === 'Enter' && handleAsk()}
                  className="flex-1"
                />
                <Button onClick={handleAsk} disabled={loading || !question.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  {loading ? '查询中...' : '提问'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current answer */}
          {current && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">{current.question}</span>
                  {current.resultCount !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      <Database className="h-3 w-3 mr-1" />
                      {current.resultCount} 条数据
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="text-sm whitespace-pre-wrap font-sans bg-slate-50 rounded-lg p-4 text-slate-700">
                    {current.answer}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {!current && !loading && (
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>在输入框中输入问题开始查询</p>
                <p className="text-xs mt-1">基于已入库的参数库进行自然语言查询</p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-pulse text-slate-400">AI 正在分析查询...</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Query history */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                查询历史
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">暂无查询记录</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="p-2 rounded hover:bg-slate-50 cursor-pointer text-sm"
                      onClick={() => setQuestion(h.question)}
                    >
                      <p className="truncate text-slate-700">{h.question}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">{h.answer.slice(0, 60)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
