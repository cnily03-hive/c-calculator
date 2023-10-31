const { app, BrowserWindow, protocol, net } = require('electron')
const path = require('path')
const fs = require('fs')
const { pathToFileURL, fileURLToPath } = require('url')
const isDev = process.env.NODE_ENV?.trim() === 'development'

// Register protocol
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'calc',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
        }
    }
])

app.whenReady().then(() => {
    protocol.handle('calc', req => {
        const { host, pathname } = new URL(req.url)
        if (host === "static") { // Root directory of installed app
            return new Promise(resolve => {
                fs.readFile(path.join(path.dirname(app.getPath('exe')), pathname), (err, data) => {
                    if (err) resolve(new Response('', {
                        status: 404,
                        headers: isDev ? {
                            'X-Error': err.message
                        } : {},
                        statusText: 'Not Found'
                    }))
                    resolve(new Response(data))
                })
            })
        }
        if (host === "bundle") { // asar
            // DEV: vue hot server
            if (isDev && pathname.startsWith('/web')) {
                return net.fetch(`http://localhost:3000${pathname}`, {
                    method: req.method,
                    headers: req.headers,
                    body: req.body
                })
            }
            return new Promise(resolve => {
                fs.readFile(path.join(__dirname, pathname), (err, data) => {
                    if (err) resolve(new Response('', {
                        status: 404,
                        headers: {
                            'X-Error': err.message
                        },
                        statusText: 'Not Found'
                    }))
                    resolve(new Response(data))
                })
            })
        }
    })

    // Create a window
    const mainWindow = new BrowserWindow({
        width: 400,
        height: 800,
        icon: path.resolve(__dirname, './web/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            webSecurity: isDev ? false : true, // Dev 环境关闭跨域限制
        }
    })

    // DEV: 默认打开开发者工具
    if (isDev) mainWindow.webContents.openDevTools()

    // Load main page
    mainWindow.loadURL('calc://bundle/web/index.html')
})