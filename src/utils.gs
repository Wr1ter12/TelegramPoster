// Определение типа медиа по URL
function getMediaType(url) {
  if (!url) return null;
  
  // Для Google Drive файлов определяем тип по MIME-типу
  if (isGoogleDriveUrl(url)) {
    try {
      const fileId = extractFileIdFromUrl(url);
      const mimeType = getDriveFileMimeType(fileId);
      console.log(`📄 MIME-тип файла: ${mimeType}`);
      return getMediaTypeFromMime(mimeType);
    } catch (error) {
      console.warn(`⚠️ Не удалось определить тип файла, использую document: ${error.message}`);
      return 'document';
    }
  }
  
  // Для обычных ссылок определяем тип по расширению файла
  if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(url)) return 'photo';
  if (/\.(mp4|mov|avi|webm|mkv|flv)$/i.test(url)) return 'video';
  if (/\.(mp3|wav|ogg|flac|m4a)$/i.test(url)) return 'audio';
  return 'document';
}

// Определение типа медиа по MIME-типу
function getMediaTypeFromMime(mimeType) {
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}

// Экранирование специальных символов для Markdown
function escapeMarkdown(text) {
  return text ? text.replace(/[\[\]\*&_`]/g, '\\$&') : '';
}