const USER_PROPERTIES = PropertiesService.getScriptProperties();
const SLIDE = USER_PROPERTIES.getProperty('SLIDE');
const BOT_TOKEN = USER_PROPERTIES.getProperty('BOT_TOKEN');
const TELEGRAM_URL = 'https://api.telegram.org/bot' + BOT_TOKEN + '/';
const WEBHOOK = USER_PROPERTIES.getProperty('WEBHOOK');
const ALLOWED_USER_IDS = USER_PROPERTIES.getProperty('ALLOWED_USER_IDS');
const GSHEETS = SpreadsheetApp.getActiveSpreadsheet();