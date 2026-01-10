const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Replace this with your actual production domain
const LIVE_DOMAIN = 'https://sarvottam-institiute.vercel.app';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Sarvottam Institute",
        icon: path.join(__dirname, 'assets/icon.jpg'),
        autoHideMenuBar: true, // Hides the top menu bar
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Security best practice
            nodeIntegration: false, // Security best practice
            spellcheck: true
        }
    });

    // Load the live domain
    mainWindow.loadURL(LIVE_DOMAIN);

    // Open external links in the default browser instead of the app
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (!url.startsWith(LIVE_DOMAIN)) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    // Handle connection errors
    mainWindow.webContents.on('did-fail-load', () => {
        mainWindow.loadFile(path.join(__dirname, 'error.html'));
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
