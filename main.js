const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')

let mainWindow
const dataPath = () => path.join(app.getPath('userData'), 'pomodoro-data.json')
function readData() {
  try { return JSON.parse(fs.readFileSync(dataPath(), 'utf8')) } catch { return { soundPath: '', records: {}, workMinutes: 25, breakMinutes: 5 } }
}
function writeData(data) { fs.writeFileSync(dataPath(), JSON.stringify(data, null, 2), 'utf8') }

ipcMain.handle('load-data', () => {
  const data = readData()
  let soundDataUrl = ''
  if (data.soundPath) {
    try {
      const ext = path.extname(data.soundPath).toLowerCase()
      const mime = ({ '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.flac': 'audio/flac' })[ext]
      if (mime) soundDataUrl = `data:${mime};base64,${fs.readFileSync(data.soundPath).toString('base64')}`
    } catch { data.soundPath = '' }
  }
  return { ...data, soundDataUrl }
})
ipcMain.handle('choose-sound', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { title: '选择提示音', properties: ['openFile'], filters: [{ name: '音频文件', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'] }] })
  if (result.canceled || !result.filePaths[0]) return null
  const data = readData(); data.soundPath = result.filePaths[0]; writeData(data)
  const ext = path.extname(data.soundPath).toLowerCase()
  const mime = ({ '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.flac': 'audio/flac' })[ext]
  return { name: path.basename(data.soundPath), soundDataUrl: `data:${mime};base64,${fs.readFileSync(data.soundPath).toString('base64')}` }
})
ipcMain.handle('record-session', () => {
  const data = readData(); const now = new Date()
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  data.records[day] = (data.records[day] || 0) + 1; writeData(data)
  return data.records
})
ipcMain.handle('save-durations', (_event, { workMinutes, breakMinutes }) => {
  const data = readData(); data.workMinutes = workMinutes; data.breakMinutes = breakMinutes; writeData(data)
  return { workMinutes, breakMinutes }
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 520,
    resizable: false,
    title: '番茄钟',
    backgroundColor: '#f5f0eb',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
  mainWindow.setMenuBarVisibility(false)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
