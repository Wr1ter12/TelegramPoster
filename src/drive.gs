/**
 * Преобразует Google Drive ссылку в прямую ссылку для скачивания
 * Поддерживает форматы:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - FILE_ID (только ID файла)
 */
function extractFileIdFromUrl(url) {
  if (!url) return null;
  
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  
  const match3 = url.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (match3) return match3[1];
  
  if (url.length >= 10 && url.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(url)) {
    return url;
  }
  
  return null;
}

function isGoogleDriveUrl(url) {
  if (!url) return false;
  
  return url.includes('drive.google.com') || 
         (url.length >= 10 && url.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(url));
}

function getDriveFileMimeType(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    return file.getMimeType();
  } catch (error) {
    throw new Error(`Не удалось получить тип файла: ${error.message}`);
  }
}