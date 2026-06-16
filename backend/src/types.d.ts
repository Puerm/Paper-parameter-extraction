declare module 'pdf-parse' {
  function pdfParse(buf: Buffer): Promise<{ text: string; numpages: number; info: Record<string, unknown> }>
  export default pdfParse
}
