// src/interfaces/FileUploadTask.ts
import { uploadBytesResumable } from 'firebase/storage'
import type PdfMetaData from '@/interfaces/PDFMetaData.ts'
import type OCRResult from '@/interfaces/OCRResult.ts'
import type { UploadStatus } from '@/enums/UploadStatus.ts'

export default interface FileUploadTask {
  id: string
  file: File
  name: string
  path: string
  progress: number
  status: UploadStatus
  error?: string
  downloadURL?: string
  taskInstance?: ReturnType<typeof uploadBytesResumable>
  ocrResult?: OCRResult
  pdfMetadata?: PdfMetaData
}
