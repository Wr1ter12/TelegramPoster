// Извлечение ID файла из различных форматов Google Drive ссылок
function extractFileIdFromUrl(url) {
  if (!url) return null;
  
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  
  const match3 = url.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (match3) return match3[1];
  
  // Если передан чистый ID файла
  if (url.length >= 10 && url.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(url)) {
    return url;
  }
  
  return null;
}

// Проверка, является ли ссылка Google Drive ссылкой
function isGoogleDriveUrl(url) {
  if (!url) return false;
  
  return url.includes('drive.google.com') || 
         (url.length >= 10 && url.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(url));
}

// Получение MIME-типа файла из Google Drive
function getDriveFileMimeType(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    return file.getMimeType();
  } catch (error) {
    throw new Error(`Не удалось получить тип файла: ${error.message}`);
  }
}