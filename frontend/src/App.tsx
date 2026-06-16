import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import DashboardPage from '@/pages/Dashboard'
import PapersPage from '@/pages/Papers'
import UploadPage from '@/pages/Upload'
import TemplatesPage from '@/pages/Templates'
import ReviewPage from '@/pages/Review'
import LibraryPage from '@/pages/Library'
import QAPage from '@/pages/QA'
import NotificationsPage from '@/pages/Notifications'
import HistoryPage from '@/pages/History'
import PaperDetailPage from '@/pages/PaperDetail'
import UsersPage from '@/pages/Users'
import AuditPage from '@/pages/Audit'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/papers" element={<PapersPage />} />
        <Route path="/papers/:id" element={<PaperDetailPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/qa" element={<QAPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="/admin/audit" element={<AdminRoute><AuditPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
