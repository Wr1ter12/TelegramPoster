// Основная функция отправки поста в Telegram
function sendToTelegram(postData) {
  let mediaUrls = postData.mediaUrls;
  let mediaFiles = [];
  
  console.log(`📝 Данные поста:`, {
    content_length: postData.content?.length,
    media_count: mediaUrls ? mediaUrls.length : 0,
    hashtags: postData.hashtags
  });
  
  // Обрабатываем медиафайлы
  if (mediaUrls && mediaUrls.length > 0) {
    mediaUrls.forEach((url, index) => {
      if (url && url.trim()) {
        try {
          if (isGoogleDriveUrl(url)) {
            // Загружаем файл из Google Drive
            const fileId = extractFileIdFromUrl(url);
            const file = DriveApp.getFileById(fileId);
            const blob = file.getBlob();
            const mediaType = getMediaType(url);
            mediaFiles.push({
              blob: blob,
              mediaType: mediaType,
              url: null
            });
            console.log(`📁 Файл ${index + 1} загружен: ${file.getName()} (${mediaType})`);
          } else {
            // Используем прямую ссылку на файл
            const mediaType = getMediaType(url);
            mediaFiles.push({
              blob: null,
              mediaType: mediaType,
              url: url
            });
          }
        } catch (error) {
          console.error(`❌ Ошибка загрузки файла ${url}: ${error.message}`);
        }
      }
    });
  }
  
  // Форматируем текст поста
  let text = escapeMarkdown(postData.content);
  
  // Добавляем хештеги
  if (postData.hashtags) {
    const tags = postData.hashtags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .join(' ');
    
    if (tags) text += `\n\n${tags}`;
  }
  
  // Выбираем метод отправки в зависимости от количества файлов
  if (mediaFiles.length > 1) {
    return sendMediaGroup(mediaFiles, text); // Отправляем медиагруппу
  }
  else if (mediaFiles.length === 1) {
    const media = mediaFiles[0];
    if (media.blob) {
      return sendMediaFile(media.blob, media.mediaType, text); // Отправляем файл из Google Drive
    } else {
      // Отправляем по ссылке
      const method = { 
        photo: 'sendPhoto', 
        video: 'sendVideo', 
        audio: 'sendAudio',
        document: 'sendDocument'
      }[media.mediaType];
      
      const payload = {
        chat_id: CONFIG.TELEGRAM_CHANNEL_ID,
        caption: text
      };
      payload[media.mediaType] = media.url;
      
      return makeTelegramRequest(method, payload);
    }
  }
  
  // Отправляем только текст
  const payload = {
    chat_id: CONFIG.TELEGRAM_CHANNEL_ID,
    text: text,
    parse_mode: 'Markdown'
  };
  return makeTelegramRequest('sendMessage', payload);
}

// Отправление одного медиафайла
function sendMediaFile(fileBlob, mediaType, caption) {
  const method = { 
    photo: 'sendPhoto', 
    video: 'sendVideo', 
    audio: 'sendAudio',
    document: 'sendDocument'
  }[mediaType];

  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/${method}`;

  const formData = {
    chat_id: CONFIG.TELEGRAM_CHANNEL_ID,
    caption: caption
  };
  formData[mediaType] = fileBlob;

  const options = {
    method: 'POST',
    payload: formData,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    console.log(`📥 Ответ от Telegram (file upload): код ${responseCode}`);

    const data = JSON.parse(responseText);

    if (!data.ok) {
      console.error(`❌ Telegram API file upload error: ${data.description}`);
      throw new Error(data.description || `Unknown error: ${method}`);
    }

    console.log(`✅ Файл успешно отправлен в Telegram`);
    return data;

  } catch (error) {
    console.error(`❌ Ошибка отправки файла в Telegram: ${error.message}`);
    throw error;
  }
}

// Отправление нескольких медиафайлов в одном сообщении
function sendMediaGroup(mediaFiles, caption) {
  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMediaGroup`;
  
  const mediaPayload = [];
  const formData = {
    chat_id: CONFIG.TELEGRAM_CHANNEL_ID
  };
  
  // Формируем массив медиа для отправки
  mediaFiles.forEach((media, index) => {
    const mediaItem = {
      type: media.mediaType,
      media: `attach://file${index}`,
      caption: index === 0 ? caption : '' // Подпись только к первому файлу
    };
    mediaPayload.push(mediaItem);
    
    if (media.blob) {
      formData[`file${index}`] = media.blob;
    }
  });
  
  formData.media = JSON.stringify(mediaPayload);
  
  console.log(`📤 Отправка медиагруппы: ${mediaFiles.length} файлов`);
  
  const options = {
    method: 'POST',
    payload: formData,
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`📥 Ответ от Telegram (media group): код ${responseCode}`);
    
    const data = JSON.parse(responseText);
    
    if (!data.ok) {
      console.error(`❌ Telegram API media group error: ${data.description}`);
      throw new Error(data.description || 'Unknown error: sendMediaGroup');
    }
    
    console.log(`✅ Медиагруппа успешно отправлена`);
    return data;
    
  } catch (error) {
    console.error(`❌ Ошибка отправки медиагруппы: ${error.message}`);
    throw error;
  }
}

// Базовый запрос к Telegram API
function makeTelegramRequest(method, payload) {
  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/${method}`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log(`📥 Ответ от Telegram: код ${responseCode}`);
    
    const data = JSON.parse(responseText);
    
    if (!data.ok) {
      console.error(`❌ Telegram API error: ${data.description}`);
      throw new Error(data.description || `Unknown error: ${method}`);
    }
    
    console.log(`✅ Telegram: успешно`);
    return data;
    
  } catch (error) {
    console.error(`❌ Ошибка запроса к Telegram: ${error.message}`);
    throw error;
  }
}