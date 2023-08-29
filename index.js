const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 980,
    height: 600
  })

  win.loadFile('map.html')
}

app.whenReady().then(() => {
  createWindow()
})