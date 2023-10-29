const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  fileSelected: (filePath) => ipcRenderer.send("file-selected", filePath),
});
