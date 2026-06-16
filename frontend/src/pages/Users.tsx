import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SelectNative } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Shield, UserCheck, User } from 'lucide-react'
import { toast } from 'sonner'

interface UserData {
  id: string
  username: string
  role: string
  createdAt: string
}

const ROLE_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; icon: React.ElementType }> = {
  admin: { label: '管理员', variant: 'default', icon: Shield },
  reviewer: { label: '审核员', variant: 'secondary', icon: UserCheck },
  user: { label: '普通用户', variant: 'outline', icon: User },
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [open, setOpen] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' })
  const [creating, setCreating] = useState(false)

  const fetchUsers = () => {
    api.get('/auth/users').then(d => setUsers(d.users)).catch(() => {})
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/auth/users', newUser)
      toast.success('用户创建成功')
      setOpen(false)
      setNewUser({ username: '', password: '', role: 'user' })
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || '创建失败')
    } finally {
      setCreating(false)
    }
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.patch(`/auth/users/${userId}`, { role })
      toast.success('角色更新成功')
      fetchUsers()
    } catch (err: any) {
      toast.error(err.message || '更新失败')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-lg bg-[#4F46E5] text-white h-10 px-4 py-2 text-sm font-medium hover:bg-[#4338CA] active:scale-[0.98] transition-all">
            <Plus className="h-4 w-4 mr-2" />
            创建用户
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新用户</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">用户名</Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">密码</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>角色</Label>
                <SelectNative value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="user">普通用户</option>
                  <option value="reviewer">审核员</option>
                  <option value="admin">管理员</option>
                </SelectNative>
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? '创建中...' : '创建'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">所有用户</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => {
                const roleInfo = ROLE_MAP[u.role] || ROLE_MAP.user
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>
                      <Badge variant={roleInfo.variant}>
                        <roleInfo.icon className="h-3 w-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <SelectNative value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} size="sm" className="w-28 text-xs">
                        <option value="user">普通用户</option>
                        <option value="reviewer">审核员</option>
                        <option value="admin">管理员</option>
                      </SelectNative>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
