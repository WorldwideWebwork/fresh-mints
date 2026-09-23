/**
 * Robust cross-browser clipboard utility with full fallback support for HTTP and non-secure contexts.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // 1. Try modern async clipboard API if available
  if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, trying fallback...', err);
    }
  }

  // 2. Fallback using temporary textarea for non-secure HTTP origins (e.g. http://mycompass)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (cmdErr) {
      console.error('document.execCommand copy failed', cmdErr);
    }

    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}

export async function copyHtmlToClipboard(html: string, plainText: string): Promise<boolean> {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) {
    return false;
  }

  const hasClipboardItem = typeof window.ClipboardItem !== 'undefined';
  const hasClipboardWrite = Boolean(navigator?.clipboard && typeof navigator.clipboard.write === 'function');
  const canWriteRichMime = hasClipboardItem && hasClipboardWrite;

  if (canWriteRichMime) {
    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      return true;
    } catch {
      return copyTextToClipboard(plainText);
    }
  }

  return copyTextToClipboard(plainText);
}
