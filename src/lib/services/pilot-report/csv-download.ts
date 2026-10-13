/**
 * Hands the browser a text file to save. The CSV text comes from the server already guarded against
 * spreadsheet formulas; this only wraps it in a download.
 */
export const saveTextFile = (filename: string, text: string, mimeType: string = 'text/csv;charset=utf-8;'): void => {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
