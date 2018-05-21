const electron_ = require('electron')
const nativeImage_ = require('electron').nativeImage
const Tray_ = require('electron').Tray
const app_ = electron_.app
const BrowserWindow_ = electron_.BrowserWindow
const ipcMain_ = electron_.ipcMain
const path_ = require('path')
const url_ = require('url')

let tray
let proc = require('./Proc')

ipcMain_.on('update-tray', (e, d) => {
    let img = nativeImage_.createFromDataURL(d)
    if (tray) {
        tray.setImage(img)
    } else {
        tray = new Tray_(img)
    }
    let g = proc.cpu()
})


let mainWindow // global reference to window object to prevent garbage collection.

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow_({
        width: 800,
        height: 600
    // show: false
    })
    // and load the index.html of the app.
    mainWindow.loadURL(url_.format({
        pathname: path_.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.webContents.openDevTools()
    require('devtron').install()

    mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
        mainWindow = null
    })


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app_.on('ready', createWindow)

// Quit when all windows are closed.
app_.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app_.quit()
    }
})

app_.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
