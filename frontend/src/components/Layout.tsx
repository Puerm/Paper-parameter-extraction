import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  FileText,
  FileUp,
  Layers,
  CheckCircle,
  Database,
  MessageCircle,
  Bell,
  Shield,
  LogOut,
  User,
  History,
  FlaskConical,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/papers', icon: FileText, label: '论文管理' },
  { to: '/upload', icon: FileUp, label: '上传论文' },
  { to: '/templates', icon: Layers, label: '参数模板' },
  { to: '/review', icon: CheckCircle, label: '审核中心' },
  { to: '/library', icon: Database, label: '参数库' },
  { to: '/qa', icon: MessageCircle, label: 'AI 问答' },
  { to: '/notifications', icon: Bell, label: '通知中心' },
  { to: '/history', icon: History, label: '版本历史' },
]

const ADMIN_ITEMS = [
  { to: '/admin/users', icon: User, label: '用户管理' },
  { to: '/admin/audit', icon: Shield, label: '审计日志' },
]

function NavItem({ to, icon: Icon, label, badge }: { to: string; icon: React.ElementType; label: string; badge?: number }) {
  const location = useLocation()
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'))
  return (
    <Link to={to}>
      <div
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150
          ${active
            ? 'text-white bg-[#4F46E5] font-medium shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{label}</span>
        {badge !== undefined && badge > 0 && (
          <Badge variant="destructive" className="text-xs py-0 h-5 min-w-5 flex items-center justify-center">
            {badge}
          </Badge>
        )}
      </div>
    </Link>
  )
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    api.get('/notifications/unread-count').then(d => setUnread(d.count)).catch(() => {})
    const interval = setInterval(() => {
      api.get('/notifications/unread-count').then(d => setUnread(d.count)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel = user?.role === 'admin' ? '管理员' : user?.role === 'reviewer' ? '审核员' : '普通用户'

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col">
        {/* Brand */}
        <div className="px-5 py-4 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">PaperParams</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-auto">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              badge={item.to === '/notifications' ? unread : undefined}
            />
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">管理</span>
              </div>
              {ADMIN_ITEMS.map(item => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors w-full cursor-pointer">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[#4F46E5] text-white text-xs font-medium">
                    {user?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{user?.username}</p>
                  <p className="text-xs text-slate-400">{roleLabel}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start" side="top">
              <DropdownMenuItem disabled>
                <User className="h-4 w-4 mr-2" />
                {roleLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="pl-60">
        <div className="p-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
