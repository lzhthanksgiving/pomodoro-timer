const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pomodoro', {
  loadData: () => ipcRenderer.invoke('load-data'),
  chooseSound: () => ipcRenderer.invoke('choose-sound'),
  recordSession: () => ipcRenderer.invoke('record-session'),
  saveDurations: (durations) => ipcRenderer.invoke('save-durations', durations)
})
