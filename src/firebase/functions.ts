import mitt from 'mitt'
import {
  ref as storageRef,
  uploadBytesResumable,
  type UploadTaskSnapshot,
  getDownloadURL,
} from 'firebase/storage'
import { storage } from '@/firebase/init'
import { UploadStatus } from '@/enums/UploadStatus.ts'
import type PdfMetaData from '@/interfaces/PDFMetaData.ts'
import type FileUploadTask from '@/interfaces/FileUploadTask.ts'
import type OCRResult from '@/interfaces/OCRResult.ts'

export const emitter = mitt()

const OCR_SIMULATION_DURATION_MS = 5000

const activeUploadTasks = new Map<string, FileUploadTask>()

/**
 * Notifies all listeners that the active upload tasks have changed.
 * This should be called whenever the activeUploadTasks map is modified.
 */
const notifyTasksChanged = () => {
  const tasksToEmit = Array.from(activeUploadTasks.values()).map((task) => ({ ...task }))
  emitter.emit('active-tasks-changed', tasksToEmit)
}

/**
 * Generates simulated OCR results for a given file name.
 * @param fileName The name of the file being processed.
 * @returns A mock OCRResult object.
 */
const generateMockOcrResult = (fileName: string): OCRResult => {
  return {
    text: "This is simulated extracted text for " + fileName + ".\n" +
    "It contains mock information about the document's content, demonstrating OCR capabilities.\n" +
    "The document is primarily about technology and data analysis.",
    confidence: parseFloat((Math.random() * (0.99 - 0.8) + 0.8).toFixed(2)),
    language: 'en',
  }
}

/**
 * Generates simulated PDF metadata for a given file.
 * @param file The File object.
 * @param fileName The name of the file.
 * @returns A mock PdfMetaData object.
 */
const generateMockPdfMetadata = (file: File, fileName: string): PdfMetaData => {
  return {
    name: fileName,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
    author: `Simulated Author for ${fileName.split('.')[0]}`,
    creationDate: new Date(
      Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000),
    ).toISOString(),
    modDate: new Date().toISOString(),
    creator: 'Mock OCR Tool v1.0',
    producer: 'Mock Software Inc.',
    title: `Simulated Document Title: ${fileName}`,
    subject: 'Data Extraction, Document Analysis',
    keywords: ['mock', 'simulated', 'pdf', 'document', 'ocr', 'analysis'],
    pageCount: Math.floor(Math.random() * 20) + 1,
    version: '1.7',
  }
}

/**
 * Simulated OCR processing function.
 * It takes a predefined duration to "process" and updates the task's status and results within the map.
 * @param taskId The ID of the FileUploadTask object to update.
 */
export const simulateOcrProcessing = async (taskId: string): Promise<void> => {
  const task = activeUploadTasks.get(taskId)
  if (!task) {
    console.warn(`Task with ID ${taskId} not found in activeUploadTasks map for OCR processing.`)
    return
  }

  task.status = UploadStatus.PROCESSING
  notifyTasksChanged()

  try {
    await new Promise((resolve) => setTimeout(resolve, OCR_SIMULATION_DURATION_MS))

    task.ocrResult = generateMockOcrResult(task.name)
    task.pdfMetadata = generateMockPdfMetadata(task.file, task.name)
    task.status = UploadStatus.COMPLETE
  } catch (ocrError) {
    task.status = UploadStatus.ERROR
    task.error = `OCR failed: ${(ocrError as Error).message}`

    activeUploadTasks.delete(taskId)
  } finally {
    notifyTasksChanged()
  }
}

/**
 * Updates the state of a specific upload task and notifies listeners.
 * @param taskId The ID of the task to update.
 * @param updates A partial object of FileUploadTask properties to update.
 */
const updateTaskState = (taskId: string, updates: Partial<Omit<FileUploadTask, 'id'>>) => {
  const task = activeUploadTasks.get(taskId)
  if (task) {
    Object.assign(task, updates)
    activeUploadTasks.set(taskId, task)
    notifyTasksChanged()
  } else {
    console.warn(`Attempted to update a non-existent task: ${taskId}`)
  }
}

/**
 * Creates the initial task object and adds it to the active tasks list.
 * @param file The file to be uploaded.
 * @param uploadPath The destination path in Storage.
 * @returns The newly created FileUploadTask.
 */
const createInitialTask = (file: File, uploadPath: string): FileUploadTask => {
  const taskId = `${file.name}-${Date.now()}`
  const fullStoragePath = `${uploadPath}${file.name}`
  const fileStorageRef = storageRef(storage, fullStoragePath)
  const uploadTask = uploadBytesResumable(fileStorageRef, file)

  const newUploadTask: FileUploadTask = {
    id: taskId,
    file,
    name: file.name,
    path: fullStoragePath,
    progress: 0,
    status: UploadStatus.UPLOADING,
    taskInstance: uploadTask,
  }

  activeUploadTasks.set(taskId, newUploadTask)
  notifyTasksChanged()

  return newUploadTask
}

/**
 * Handles the progress and state changes of an upload task.
 * @param taskId The ID of the task.
 * @param snapshot The UploadTaskSnapshot from Firebase.
 */
const handleStateChange = (taskId: string, snapshot: UploadTaskSnapshot) => {
  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
  const status = snapshot.state as UploadStatus;
  updateTaskState(taskId, { progress, status })
}

/**
 * Handles a failed upload.
 * @param taskId The ID of the task.
 * @param error The error object from Firebase.
 */
const handleError = (taskId: string, error: Error) => {
  console.error(`Upload failed for task ${taskId}:`, error)
  updateTaskState(taskId, { status: UploadStatus.ERROR, error: error.message })
}

/**
 * Handles the successful completion of an upload.
 * @param taskId The ID of the task.
 */
const handleCompletion = async (taskId: string) => {
  const task = activeUploadTasks.get(taskId)
  if (!task || !task.taskInstance) {
    console.error(`Task ${taskId} not found after completion.`)
    return
  }

  try {
    const downloadURL = await getDownloadURL(task.taskInstance.snapshot.ref)
    updateTaskState(taskId, {
      status: UploadStatus.UPLOADED,
      progress: 100,
      downloadURL,
    })

    await simulateOcrProcessing(taskId)
  } catch (error: Error) {
    console.error(`Failed to get download URL for task ${taskId}:`, error)
    updateTaskState(taskId, {
      status: UploadStatus.ERROR,
      error: `Failed to get download URL: ${error.message}`,
    })
  }
}

/**
 * Initiates a file upload to Firebase Storage and manages its state.
 * This is now the main coordinating function.
 * @param file The File object to upload.
 * @param uploadPath The storage path where the file should be uploaded.
 * @returns The initial FileUploadTask object.
 */
export const uploadFile = (file: File, uploadPath: string): FileUploadTask => {
  const task: FileUploadTask = createInitialTask(file, uploadPath)

  task.taskInstance.on(
    'state_changed',
    (snapshot) => handleStateChange(task.id, snapshot),
    (error) => handleError(task.id, error),
    () => handleCompletion(task.id),
  )
  return task
}

/**
 * Returns a shallow copy of the currently active upload tasks.
 * @returns An array of FileUploadTask objects.
 */
export const getActiveUploadTasks = (): FileUploadTask[] => {
  return Array.from(activeUploadTasks.values()).map((task) => ({ ...task }))
}
