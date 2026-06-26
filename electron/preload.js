const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld("networkAPI", {
    scanWifi: () => ipcRenderer.invoke("wifi:scan"),
    connectWifi: (ssid, password) => 
        ipcRenderer.invoke('wifi:connect', { ssid, password }),
    disconnectWifi: () => ipcRenderer.invoke('wifi:disconnect'),
    getStatus: () => ipcRenderer.invoke('network:status'),
    fetchRss: (feedUrl) => ipcRenderer.invoke("fetch-rss", feedUrl),
    on: (channel, callback) => {
        ipcRenderer.on(channel, callback);
    },
    send: (channel, args) => {
        ipcRenderer.send(channel, args);
    },
    clipboardWrite: async (text) => {
        try {
            clipboard.writeText(String(text));
            return true;
        } catch (err) {
            console.error("clipboardWrite error", err);
            throw err;
        }
    },
});