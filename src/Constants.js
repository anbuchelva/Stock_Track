const USER_PROPERTIES = PropertiesService.getScriptProperties();
const SLIDE = USER_PROPERTIES.getProperty('SLIDE');
const BOT_TOKEN = USER_PROPERTIES.getProperty('BOT_TOKEN');
const TELEGRAM_URL = 'https://api.telegram.org/bot' + BOT_TOKEN + '/';
const WEBHOOK = USER_PROPERTIES.getProperty('WEBHOOK');
const ADMIN = USER_PROPERTIES.getProperty('ADMIN');
const ALLOWED_USER_IDS = USER_PROPERTIES.getProperty('ALLOWED_USER_IDS');
const GSHEETS = SpreadsheetApp.getActiveSpreadsheet();

const stocksSheet = GSHEETS.getSheetByName('Stocks');
const priceHistorySheet = GSHEETS.getSheetByName('Price History');
const transactionSheet = GSHEETS.getSheetByName('Transactions');

var githubToken = USER_PROPERTIES.getProperty('githubToken');
var repoOwner = USER_PROPERTIES.getProperty('repoOwner');
var repoName = USER_PROPERTIES.getProperty('repoName');
var ENCRYPTION_KEY = USER_PROPERTIES.getProperty('encryptionKey');
var IV_STRING = USER_PROPERTIES.getProperty('iv');
var filePath = 'docs/data/';
var branch = 'main';
