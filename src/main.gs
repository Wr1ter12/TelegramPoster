// Основная функция для проверки и публикации постов, ставим триггер на неё
function autoPublishPosts() {
  const posts = getPostsToPublish();
  let published = 0, errors = 0;
  
  console.log(`📅 Найдено постов на сегодня: ${posts.length}`);
  
  // Обрабатываем каждый пост для публикации
  posts.forEach(post => {
    try {
      const mediaContent = post.row[post.colIndex.media] || '';
      // Разбиваем медиа по точке-запятой или переносу строки
      const mediaUrls = mediaContent.split(/[;\n]/)
        .map(url => url.trim())
        .filter(url => url.length > 0);
      
      const postData = {
        content: post.row[post.colIndex.content] || '',
        mediaUrls: mediaUrls,
        hashtags: post.row[post.colIndex.hashtags] || ''
      };
      
      console.log(`🔄 Публикую пост с ${mediaUrls.length} медиафайлами`);
      
      // Отправляем пост в Telegram
      sendToTelegram(postData);
      updatePostStatus(post.rowIndex, 'Опубликован');
      published++;
      
    } catch (error) {
      console.error(`❌ Ошибка в строке ${post.rowIndex + 1}: ${error.message}`);
      updatePostStatus(post.rowIndex, 'Ошибка', error.message);
      errors++;
    }
  });
  
  console.log(`✅ Опубликовано: ${published}, ❌ Ошибок: ${errors}, 📅 Всего постов на сегодня: ${posts.length}`);
}