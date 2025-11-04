const props = PropertiesService.getScriptProperties(); // Подключение к свойствам скрипта (Переменные среды)

// Конфигурация
const CONFIG = {
  TELEGRAM_BOT_TOKEN: props.getProperty('TELEGRAM_BOT_TOKEN'), // Токен телеграм бота
  TELEGRAM_CHANNEL_ID: props.getProperty('TELEGRAM_CHANNEL_ID'), // Краткая ссылка на телеграм канал
  SHEET_ID: props.getProperty('SHEET_ID'), // ID таблицы 
  SHEET_NAME: props.getProperty('SHEET_NAME'), // Название листа
};