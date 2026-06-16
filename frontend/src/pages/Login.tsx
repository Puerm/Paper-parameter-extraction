import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FlaskConical } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
      toast.success('登录成功')
    } catch (err: any) {
      toast.error(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/50">
      <Card className="w-full max-w-sm shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 h-10 w-10 rounded-xl bg-[#4F46E5] flex items-center justify-center">
            <FlaskConical className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">PaperParams</CardTitle>
          <CardDescription>AI 论文实验参数提取平台</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          <p className="text-sm text-slate-400 text-center mt-4">
            还没有账号？
            <Link to="/register" className="text-indigo-600 hover:underline font-medium ml-1">注册</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
