const electron = require('electron')
const url = require('url')
const path = require('path')

process.env.NODE_ENV = 'development';

const {app,BrowserWindow, Menu, ipcMain } = electron

let mainWindow;
let addWindow;

var aWidth = 1066, aHeight = 600, aFrame = true;

app.on('ready',function(){
    mainWindow = new BrowserWindow({   
        width: aWidth, 
        height: aHeight, 
        frame: aFrame
    });
    mainWindow.on('closed', ()=>
    {
        mainWindow = null;
        app.quit();
    });
    //load html into window
    mainWindow.loadURL('https://github.com');

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu); 
});

//Handle creating add window
function createAddWindow(){
    addWindow = new BrowserWindow(
        {   width: 300, 
            height: 200, 
            frame: aFrame
    });
    //Garbage Collection
    addWindow.on('closed', ()=>{
        addWindow = null;
    });
    //load html into window
    addWindow.loadURL('https://github.com');

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
}

//catch item:add
ipcMain.on('item:add',(e,item)=>{
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command + A' : 'Shift+A',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear All Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                //check what os is, and use the hotkey(mac = command+Q and window is the default CTRL+Q)
                accelerator: process.platform == 'darwin' ? 'Command + Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];
//Mac likes to use the application to be the first option in the Menu part of the application
//this pushes an empty object to the top of the menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command + I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}