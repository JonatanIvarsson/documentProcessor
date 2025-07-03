export default interface PdfMetaData {
  name: string
  type: string
  size: number
  lastModified: number
  author?: string
  creationDate?: string
  modDate?: string
  creator?: string
  producer?: string
  title?: string
  subject?: string
  keywords?: string[]
  pageCount?: number
  version?: string
}
