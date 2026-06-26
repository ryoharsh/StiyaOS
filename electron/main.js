import * as os from 'os';
import fs from 'fs';
import wifi from 'node-wifi';
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize node-wifi
wifi.init({
  iface: null,
  tempDir: os.tmpdir()
});

function getEthernetStatus() {
  const interfaces = os.networkInterfaces();

  for (const [name, netInterface] of Object.entries(interfaces)) {
    if (!netInterface) continue;
    const isLoopback = netInterface.some(int => int.internal);
    if (isLoopback) continue;

    const lowerName = name.toLowerCase();
    // Catch common wired naming patterns (eth0, en0, ethernet, etc.)
    if (lowerName.includes('eth') || lowerName.includes('en') || lowerName.includes('ethernet')) {
      const hasIp = netInterface.some(int => int.address && !int.internal);
      if (hasIp) return true;
    }
  }
  return false;
}

function createWindow() {

  let preloadPath = join(__dirname, 'preload.js');
  
  if (!fs.existsSync(preloadPath)) {
    if (fs.existsSync(join(__dirname, 'preload.mjs'))) {
      preloadPath = join(__dirname, 'preload.mjs');
    } else {
      preloadPath = join(__dirname, '../src/preload.js'); 
    }
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      devTools: true,
      webviewTag: true,
      contextIsolation: true, // isolate preload from page
      sandbox: true,         // enable renderer sandboxing where possible
      nodeIntegration: false, // don't expose Node in renderer
      nodeIntegrationInWorker: false,
      backgroundThrottling: true,
      preload: preloadPath,
    },
  });

  win.maximize();

  if (app.isPackaged) {
    win.loadFile(join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
    win.removeMenu();

    win.webContents.openDevTools({ mode: 'detach' });

    win.webContents.on('did-fail-load', () => {
      win.webContents.reloadIgnoringCache();
    });
  }
}

// IPC Handlers
ipcMain.handle('wifi:scan', async () => {
  try {
    const networks = await wifi.scan();
    return networks.map((net) => ({
      ssid: net.ssid || 'Hidden Network',
      signal: net.signal_level,
      isKnown: !!net.security && net.security !== 'none',
      security: net.security
    }));
  } catch (error) {
    throw new Error(`Failed to scan Wi-Fi: ${error.message}`);
  }
});

ipcMain.handle('wifi:connect', async (_, { ssid, password }) => {
  try {
    await wifi.connect({ ssid, password });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('wifi:disconnect', async () => {
  try {
    await wifi.disconnect();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('network:status', async () => {
  const ethernetConnected = getEthernetStatus();
  let wifiConnected = false;
  let activeSsid = null;
  let signalStrength = 0;

  try {
    // 1. Direct Windows command line se raw data nikalte hain
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('netsh wlan show interfaces');
      
      // Output me se 'SSID' wali line dhundte hain (lekin 'BSSID' ko ignore karte hain)
      const ssidLine = stdout.split('\n').find(line => line.includes('SSID') && !line.includes('BSSID'));
      const signalLine = stdout.split('\n').find(line => line.includes('Signal'));

      if (ssidLine) {
        // Line me se ':' ke baad ka actual network name nikalte hain aur saaf karte hain
        const rawSsid = ssidLine.split(':')[1];
        if (rawSsid && rawSsid.trim() !== "") {
          activeSsid = rawSsid.trim();
          wifiConnected = true;
        }
      }

      if (signalLine) {
        const rawSignal = signalLine.split(':')[1];
        if (rawSignal) {
          // '%' sign hatakar pure number nikalte hain taaki NaN na aaye
          signalStrength = parseInt(rawSignal.replace('%', '').trim(), 10) || 0;
        }
      }
    } else {
      // macOS/Linux ke liye fallback standard library behavior
      const currentConnections = await wifi.getCurrentConnections();
      if (currentConnections && currentConnections.length > 0) {
        wifiConnected = true;
        activeSsid = currentConnections[0].ssid;
        signalStrength = currentConnections[0].signal_level;
      }
    }
  } catch (e) {
    console.error("Error patching native network status:", e);
  }

  return {
    ethernetConnected,
    wifiConnected,
    activeSsid,
    signalStrength: isNaN(signalStrength) ? 0 : signalStrength
  };
});

ipcMain.handle("fetch-rss", async (_event, feedUrl) => {
    return new Promise((resolve, reject) => {
        const request = net.request(feedUrl);
        let body = "";
 
        request.on("response", (response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                reject(new Error(`RSS fetch failed: HTTP ${response.statusCode} for ${feedUrl}`));
                return;
            }
 
            response.on("data", (chunk) => {
                body += chunk.toString();
            });
 
            response.on("end", () => {
                resolve(body);
            });
        });
 
        request.on("error", (err) => {
            reject(new Error(`RSS fetch network error for ${feedUrl}: ${err.message}`));
        });
 
        request.end();
    });
});

// App Lifecycle
app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("F11", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.setFullScreen(!win.isFullScreen());
    }
  });

  globalShortcut.register("F12", () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.toggleDevTools();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    globalShortcut.unregisterAll();
    app.quit();
  }
});

app.on("will-quit", () => globalShortcut.unregisterAll());