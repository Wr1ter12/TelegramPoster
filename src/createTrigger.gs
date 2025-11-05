// Создание триггера для ежедневного запуска
function createTrigger() {
  // Удаляем существующие триггеры для этой функции
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'autoPublishPosts')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  ScriptApp.newTrigger('autoPublishPosts')
    .timeBased()
    .atHour(14) // Выбираем час срабатывания
    .everyDays(1) // Период в днях
    .create();
  
  console.log('✅ Триггер создан');
}