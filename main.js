const { app, BrowserWindow, Tray, Menu } = require('electron');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let win = null;
  let tray = null;

  function createWindow (shouldShow = true) {
    win = new BrowserWindow({
      width: 1200,
      height: 800,
      autoHideMenuBar: true,
      icon: __dirname + '/icon.ico',
      show: false,
      backgroundColor: '#131314',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    const customUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
    
    app.userAgentFallback = customUserAgent;
    win.loadURL('https://gemini.google.com');
    win.once('ready-to-show', () => {
      if (shouldShow) {
        win.show();
      }
    });

    win.on('close', function (event) {
      if (!app.isQuiting) {
        event.preventDefault();
        win.hide();
      }
      return false;
    });
  }

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (win) {
      win.show();
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    const isAutostart = process.argv.includes('--hidden');

    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe'),
      args: ['--hidden']
    });

    createWindow(!isAutostart);

    tray = new Tray(__dirname + '/icon.ico');
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Gemini', click: () => win.show() },
      { type: 'separator' },
      { label: 'Close Gemini', click: () => { 
          app.isQuiting = true; 
          app.quit(); 
        } 
      }
    ]);

    tray.setToolTip('Gemini');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      win.show();
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(true);
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}