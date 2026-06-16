import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
    const filePath = path.join(UPLOAD_DIR, file.originalname)

    if (fs.existsSync(filePath)) {
      let counter = 1
      while (fs.existsSync(path.join(UPLOAD_DIR, `${base}(${counter})${ext}`))) {
        counter++
      }
      cb(null, `${base}(${counter})${ext}`)
    } else {
      cb(null, file.originalname)
    }
  },
})

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/x-markdown',
]

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const mimeOk = ALLOWED_TYPES.includes(file.mimetype)
  const extOk = ['.pdf', '.docx', '.md'].includes(path.extname(file.originalname).toLowerCase())
  if (mimeOk || extOk) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件格式，仅支持 PDF、DOCX、Markdown'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
})
