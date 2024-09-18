const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  getInputValues: (notionToken, todoDatabaseId, scheduleDatabaseId) => {
    console.log('getInputValues called with:', { notionToken, todoDatabaseId, scheduleDatabaseId });
    return ipcRenderer.invoke('get-input-values', notionToken, todoDatabaseId, scheduleDatabaseId);
  }
});
