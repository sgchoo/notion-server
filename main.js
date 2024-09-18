const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config(); // 환경 변수 로드

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  console.log('Main window created');
}

app.whenReady().then(async () => {
  createWindow();
  console.log('App is ready');

  // 환경 변수에서 Notion API 키와 데이터베이스 ID를 가져옴
  const notionToken = process.env.NOTION_SECRET_TOKEN;
  const todoDatabaseId = process.env.NOTION_TODO_DATABASE;
  const scheduleDatabaseId = process.env.NOTION_SCHEDULE_DATABASE;

  // Notion 서비스 초기화
  const notionService = require('./services/notion');
  await notionService.initialize(notionToken, todoDatabaseId, scheduleDatabaseId);
  console.log('Notion service initialized');

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 이벤트 리스너 설정
ipcMain.handle('get-input-values', async (event, notionToken, todoDatabaseId, scheduleDatabaseId) => {
  console.log('IPC handler called with:', { notionToken, todoDatabaseId, scheduleDatabaseId });
  const notionService = require('./services/notion');
  await notionService.initialize(notionToken, todoDatabaseId, scheduleDatabaseId);
  console.log('Notion service initialized');
  return 'Initialized';
});
