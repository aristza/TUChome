const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  fileSelected: (filePath) => ipcRenderer.send("file-selected", filePath),
  roomSelected: (roomId) => ipcRenderer.send("room-selected", roomId),
});
