/** Saves a Blob as a file download (Excel exports, invoices, labels). */
export function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoke on the next tick so the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
