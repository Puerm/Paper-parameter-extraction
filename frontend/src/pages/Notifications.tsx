import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, CheckCheck, FileText, Beaker, CheckCircle, XCircle } from 'lucide-react'

interface Notification {
  id: string
  type: string
  message: string
  isRead: boolean
  createdAt: string
}

const TYPE_ICON: Record<string, React.ElementType> = {
  parse_complete: FileText,
  parse_failed: FileText,
  extract_complete: Beaker,
  review_approved: CheckCircle,
  review_rejected: XCircle,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const fetch = () => {
    api.get('/notifications').then(d => {
      setNotifications(d.notifications)
      setUnread(d.notifications.filter((n: Notification) => !n.isRead).length)
    }).catch(() => {})
  }

  useEffect(() => { fetch() }, [])

  const handleMarkRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`)
    fetch()
  }

  const handleMarkAll = async () => {
    await api.patch('/notifications/read-all')
    fetch()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">通知中心</h1>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="h-4 w-4 mr-1" />
            全部已读
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>暂无通知</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = TYPE_ICON[n.type] || Bell
            return (
              <Card key={n.id} className={`transition-colors ${!n.isRead ? 'bg-indigo-50/50 border-indigo-200' : ''}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${!n.isRead ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                    <Icon className={`h-4 w-4 ${!n.isRead ? 'text-indigo-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.isRead ? 'font-medium text-slate-800' : 'text-slate-500'}`}>{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.isRead && <Badge variant="destructive" className="text-xs">未读</Badge>}
                    {!n.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                        标记已读
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
