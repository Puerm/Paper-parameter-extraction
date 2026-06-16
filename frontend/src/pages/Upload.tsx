import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadCloud, File } from 'lucide-react'
import { toast } from 'sonner'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      ['.pdf', '.docx', '.md'].some(ext => f.name.toLowerCase().endsWith(ext))
    )
    setFiles(prev => [...prev, ...dropped])
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        await api.upload('/papers/upload', fd)
        toast.success(`${file.name} 上传成功`)
      } catch (err: any) {
        toast.error(`${file.name}: ${err.message || '上传失败'}`)
      }
    }
    setUploading(false)
    setFiles([])
    navigate('/papers')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">上传论文</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">选择文件</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">点击或拖拽文件到此处上传</p>
            <p className="text-sm text-slate-400 mt-1">支持 PDF、DOCX、Markdown 格式</p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.md"
              multiple
              onChange={e => {
                if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)])
              }}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                  <File className="h-4 w-4 text-slate-400" />
                  <span className="flex-1 text-sm text-slate-700">{f.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                    移除
                  </Button>
                </div>
              ))}
              <Button className="w-full mt-2" onClick={handleUpload} disabled={uploading}>
                {uploading ? '上传中...' : `上传 ${files.length} 个文件`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
