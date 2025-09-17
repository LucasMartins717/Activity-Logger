import { app, BrowserWindow, ipcMain, Menu, Notification, Tray } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { centerWindow } from '../src/utils/windowUtils'
import { CreatePersistentWindow } from '../src/utils/createPersistentWindowUtils'
import { UserInputSettingsInterface } from '../src/interfaces/userInputSettingsInterface'
import os from 'os';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Windows
let dataWindow: BrowserWindow | null;
let settingsWindow: BrowserWindow | null;
let inputWindow: BrowserWindow | null;
let authWindow: BrowserWindow | null;
let loadingWindow: BrowserWindow | null;
let tray: Tray;

// Windows size
const userDataWinSize = { width: 1000, height: 800, minWidth: 491, minHeight: 300 };
const userSettingsWinSize = { horizontalWidth: 1000, horizontalHeight: 439, verticalWidth: 700, verticalHeight: 697 };
const userInputWinSize = { width: 286, height: 214, minWidth: 208, minHeight: 214, maxWidth: 286, maxHeight: 214 };
const userAuthWinSize = { width: 310, height: 193, minWidth: 193, minHeight: 193, maxWidth: 310, maxHeight: 193 };
const userLoadingWinSize = { width: 250, height: 200 };

// User settings
let userInputSettings: {
  questionInterval: number;
  startTime: string;
  endTime: string;
  alwaysOn: boolean;
  weekDays: string[];
  questionScreenTime: number;
  notificationMode: 'popup' | 'toast' | 'off';
}

let timerInterval: NodeJS.Timeout | null = null;
let lastShown: number = 0;
let closeTimeout: NodeJS.Timeout | null = null;

const getAssetPath = (filename: string) => {
  if (app.isPackaged) {
    // dentro do app empacotado -> resourcesPath
    return path.join(process.resourcesPath, filename);
  }
  return path.join(__dirname, '../public', filename);
};


function createDataWindow() {

  if (dataWindow) return dataWindow.focus();

  dataWindow = CreatePersistentWindow("userData", {
    width: userDataWinSize.width,
    height: userDataWinSize.height,
    minWidth: userDataWinSize.minWidth,
    minHeight: userDataWinSize.minHeight,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    icon: getAssetPath("logo.png"),
    webPreferences: { preload: path.join(__dirname, 'preload.mjs') },
  }, (bw) => loadRoute(bw, "/"));

  loadRoute(dataWindow, '/');

  dataWindow.webContents.on('did-finish-load', () => {
    dataWindow?.webContents.send('main-process-message', (new Date).toLocaleString())
  })



  dataWindow.on('closed', () => dataWindow = null);
}

function createSettingsWindow() {

  if (settingsWindow) return settingsWindow.focus();

  settingsWindow = new BrowserWindow({
    width: userSettingsWinSize.verticalWidth,
    height: userSettingsWinSize.verticalHeight,
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    icon: getAssetPath("logo.png"),

    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })



  loadRoute(settingsWindow, '/settings');
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

function createInputWindow() {

  if (inputWindow) return inputWindow.focus();

  inputWindow = CreatePersistentWindow("userInput", {
    width: userInputWinSize.width,
    height: userInputWinSize.height,
    minWidth: userInputWinSize.minWidth,
    minHeight: userInputWinSize.minHeight,
    maxWidth: userInputWinSize.maxWidth,
    maxHeight: userInputWinSize.maxHeight,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    maximizable: false,
    icon: getAssetPath("logo.png"),
    webPreferences: { preload: path.join(__dirname, 'preload.mjs'), },
  }, (bw) => loadRoute(bw, "/input"));



  loadRoute(inputWindow, '/input');

  // Auto-close after screen time
  if (closeTimeout) clearTimeout(closeTimeout);
  closeTimeout = setTimeout(() => {
    if (inputWindow) {
      showNotification('Input closed due to timeout');
      inputWindow.close();
    }
  }, userInputSettings.questionScreenTime * 1000);

  inputWindow.on('closed', () => {
    inputWindow = null;
    if (closeTimeout) clearTimeout(closeTimeout);
  });
}

function createAuthWindow() {

  if (authWindow) return authWindow.focus();

  authWindow = CreatePersistentWindow("userAuth", {
    width: userAuthWinSize.width,
    height: userAuthWinSize.height,
    minWidth: userAuthWinSize.minWidth,
    minHeight: userAuthWinSize.minHeight,
    maxWidth: userAuthWinSize.maxWidth,
    maxHeight: userAuthWinSize.maxHeight,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    icon: getAssetPath("logo.png"),
    webPreferences: { preload: path.join(__dirname, 'preload.mjs'), },
  }, (bw) => loadRoute(bw, "/auth"));



  loadRoute(authWindow, '/auth');
  authWindow.on('closed', () => { authWindow = null; });
}

function createLoadingWindow() {

  if (loadingWindow) {
    loadingWindow.focus();
    return;
  }

  loadingWindow = new BrowserWindow({
    width: userLoadingWinSize.width,
    height: userLoadingWinSize.height,
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    icon: getAssetPath("logo.png"),
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })



  loadRoute(loadingWindow, '/loading');
  loadingWindow.on('closed', () => { loadingWindow = null; });
}

function createTrayIcon() {
  tray = new Tray(getAssetPath("logo.png"));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Interface', type: 'normal', click: () => createDataWindow() },
    { label: 'Settings', type: 'normal', click: () => createSettingsWindow() },
    { label: 'Logout', type: 'normal', click: () => ipcMain.emit('logout') },
    { label: 'Exit', type: 'normal', click: () => app.quit() },
  ]);

  tray.setToolTip('Activity Logger');
  tray.setContextMenu(contextMenu);
}

function loadRoute(win: BrowserWindow, route: string) {
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(`${VITE_DEV_SERVER_URL}#${route}`);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: route });
  }
}

function setupTimer() {
  if (timerInterval) clearInterval(timerInterval);

  lastShown = Date.now();

  timerInterval = setInterval(checkShowInput, userInputSettings.questionInterval * 60);
}

function checkShowInput() {
  const now = new Date();
  const currentTime = now.getTime();
  const currentDay = now.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();

  if (userInputSettings.weekDays.length === 0 || !userInputSettings.weekDays.includes(currentDay)) {
    return;
  }

  const [startHour, startMin] = userInputSettings.startTime.split(':').map(Number);
  const [endHour, endMin] = userInputSettings.endTime.split(':').map(Number);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMin).getTime();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMin).getTime();

  const inTimeRange = userInputSettings.alwaysOn || (currentTime >= start && currentTime <= end);

  if (!inTimeRange) return;

  if (currentTime - lastShown >= userInputSettings.questionInterval * 60000) {
    showNotification('Input opening');
    createInputWindow();
    lastShown = currentTime;
  }
}

function showNotification(message: string) {
  if (userInputSettings.notificationMode === 'off') return;
  new Notification({ title: 'Activity Logger', body: message }).show();
}

function setupLinuxAutostart() {
  const autostartDir = path.join(os.homedir(), '.config', 'autostart');
  if (!fs.existsSync(autostartDir)) fs.mkdirSync(autostartDir, { recursive: true });

  const desktopFile = `
    [Desktop Entry]
    Type=Application
    Name=Activity-Logger
    Exec=${process.execPath}
    X-GNOME-Autostart-enabled=true
  `;
  fs.writeFileSync(path.join(autostartDir, 'activity-logger.desktop'), desktopFile);
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createAuthWindow();
  }
})

// Close focused window
ipcMain.on('close-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.close();
})

// Minimize focused window
ipcMain.on('minimize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize()
});

// Maximize focused window
ipcMain.on('maximize-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window?.isMaximized()) {
    window.unmaximize();
  } else {
    window?.maximize();
  }
})

// Login redirect
ipcMain.on('login-success', () => {
  if (loadingWindow) {
    loadingWindow.close();
    loadingWindow = null;
  }

  if (authWindow) {
    authWindow.close();
    loadingWindow = null;
  }

  createDataWindow();
  createTrayIcon();
  setupTimer();
})

// Logout redirect
ipcMain.on('logout', () => {

  if (loadingWindow) {
    loadingWindow.close();
    loadingWindow = null;
  }

  if (dataWindow) {
    dataWindow.close();
    dataWindow = null;
  }

  if (settingsWindow) {
    settingsWindow.close();
    settingsWindow = null;
  }

  if (inputWindow) {
    inputWindow.close();
    inputWindow = null;
  }

  if (authWindow) {
    authWindow.close();
    authWindow = null;
  }

  if (tray) {
    tray.destroy();
    tray = null!;
  }

  if (!authWindow) {
    createAuthWindow();
  }
})

// Open the settings window
ipcMain.on('open-settings', () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }
  createSettingsWindow();
})

// Settings Renderer
ipcMain.on("change-settings-layout", (_, mode: "horizontal" | "vertical") => {
  if (!settingsWindow) return;

  if (mode == "horizontal") {
    settingsWindow.setBounds(centerWindow(userSettingsWinSize.horizontalWidth, userSettingsWinSize.horizontalHeight));
  } else {
    settingsWindow.setBounds(centerWindow(userSettingsWinSize.verticalWidth, userSettingsWinSize.verticalHeight));
  }
})

// Update UserInputSettings
ipcMain.on('update-user-input-settings', (_, settings: UserInputSettingsInterface) => {
  userInputSettings = settings;
  lastShown = Date.now();
  setupTimer();
})

app.on('window-all-closed', (event: Event) => {
  event.preventDefault();
})

app.whenReady().then(() => {

  app.setLoginItemSettings({
    openAtLogin: true,
    path: process.execPath,
  });
  createLoadingWindow();

  if (process.platform === 'linux') {
    setupLinuxAutostart();
  }
});
